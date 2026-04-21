# GenUI TechTalk — Kiến trúc & So sánh 3 Demo

> Tài liệu này tóm tắt kỹ thuật, kiến trúc và trade-off của 3 phương pháp Generative UI được demo, cùng với gợi ý cải tiến.

---

## Tổng quan 3 cách tiếp cận

| | Demo 1 — Declarative GenUI | Demo 2 — Tool Calling | Demo 3 — Agentic GenUI |
|---|---|---|---|
| **Port** | 3101 | 3102 | 3103 |
| **Trigger** | System event / User context selector | User chat (multi-turn) | Signal bundle (persona + scenario) hoặc chat |
| **AI output** | Raw JSON Schema | Tool calls (props) | Tool calls (layout decisions) |
| **Streaming** | Có (raw text stream) | Có (SSE via Vercel AI SDK) | Không (single request) |
| **Multi-turn** | Không | Có | Có (chat mode) |
| **Determinism** | Cao | Trung bình | Thấp |
| **Kiểm soát output** | Zod validation sau generate | Zod schema trong tool definition | Zod safeParse per tool |
| **AI model** | Minimax M2.7 | Minimax M2.7 (chat) + GPT-4o-mini (suggest) | Minimax M2.7 |

---

## Demo 1 — Declarative GenUI (JSON Schema → Form Renderer)

### Ý tưởng cốt lõi

AI không tạo ra UI code — AI chỉ tạo ra **cấu trúc dữ liệu (JSON Schema)** mô tả form. Frontend đọc schema và render form bằng logic cố định.

```
Trigger (event / context)
    → Prompt kèm instruction
    → AI stream ra JSON
    → Client accumulate buffer
    → JSON.parse() + Zod validate
    → <FormRenderer schema={schema} />
```

### Kiến trúc

```
Frontend (page.tsx)
  ├── Tab 1: System Events  →  chọn bucket (artifact_triage / service_intake)
  └── Tab 2: User Context   →  chọn Industry + Workflow

         ↓ POST /api/genui/form
         
API Route (genui/form/route.ts)
  ├── Chọn systemPrompt theo bucket
  ├── Gọi OpenRouter stream (Minimax M2.7)
  └── Pipe raw text stream về client + append __METADATA__

         ↓ ReadableStream

Client accumulates buffer, extracts JSON, validates with Zod
  └── FormRenderer renders fields declaratively
```

### Code mẫu — Server stream JSON về client

```typescript
// app/api/genui/form/route.ts
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  body: JSON.stringify({
    model: "minimax/minimax-m2.7",
    messages: [
      { role: "system", content: systemPrompt },   // "Return ONLY valid JSON..."
      { role: "user",   content: description },
    ],
    stream: true,
  }),
});

// Pipe raw SSE tokens về client
const { readable, writable } = new TransformStream();
(async () => {
  for await (const chunk of res.body) {
    const delta = parseSSEChunk(chunk);    // extract content delta
    rawResponse += delta;
    await writer.write(encode(delta));     // forward to client as plain text
  }
  await writer.write(encode(`\n__METADATA__${JSON.stringify({ tokens })}`));
  await writer.close();
})();

return new Response(readable, { headers: { "Content-Type": "text/plain" } });
```

```typescript
// Frontend: accumulate buffer, parse JSON khi xong
const reader = response.body.getReader();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decode(value);
  if (chunk.includes("__METADATA__")) {
    // Extract tokens, finalize
    const jsonPart = buffer.split("__METADATA__")[0];
    const result = FormSchema.safeParse(JSON.parse(extractJson(jsonPart)));
    if (result.success) setSchema(result.data);
  } else {
    buffer += chunk;
    setStreamingText(prev => prev + chunk);  // show live JSON typing
  }
}
```

### Điểm mạnh
- **Deterministic render**: cùng một schema → cùng một UI, không bao giờ sai layout
- **Validation rõ ràng**: Zod reject ngay nếu AI trả sai cấu trúc
- **Dễ audit**: JSON là plain data, dễ log, debug, cache

### Điểm yếu
- **Chỉ render form**: không thể tạo chart, table, hay layout phức tạp từ schema này
- **Không có memory**: mỗi request là một lần generate độc lập
- **Latency cao**: phải stream xong rồi mới parse được (không render được từng field partial)

---

## Demo 2 — Tool Calling / Server-Driven UI

### Ý tưởng cốt lõi

AI nhận chat message và quyết định **gọi tool nào** với **props gì**. Mỗi tool tương ứng một UI component. Frontend map tool call → component và render inline trong chat.

```
User message
    → streamText() với tools catalog
    → AI stream text + tool_call events
    → useChat accumulates parts[]
    → renderTool(part.type, part.input)
    → <KPICard /> | <BarChart /> | <DataTable /> | ...
```

### Kiến trúc

```
Frontend (page.tsx)
  ├── useChat({ transport: DefaultChatTransport })
  ├── messages[].parts[] → text parts + tool parts
  └── renderTool(type, input) → switch → component

         ↓ POST /api/chat (streaming SSE)
         
API Route (chat/route.ts)
  ├── toCoreMessages()  → strip tool history, keep text only
  ├── streamText({
  │     model: openrouter.chat("minimax/minimax-m2.7"),
  │     tools: { show_kpi, show_chart, show_table, show_card_list, show_form },
  │     stopWhen: stepCountIs(4),
  │   })
  └── result.toUIMessageStreamResponse()  → Vercel AI SDK UI Message Stream

         ↓ /api/suggest (parallel, sau khi stream xong)
         
Suggest Route
  ├── generateText({ model: openrouter.chat("openai/gpt-4o-mini") })
  └── Trả 3 Vietnamese follow-up chips
```

### Code mẫu — Tool definition + Client render

```typescript
// app/api/chat/route.ts — định nghĩa tool với Zod schema
const result = streamText({
  model: openrouter.chat("minimax/minimax-m2.7"),
  system: SYSTEM_PROMPT,
  messages: toCoreMessages(messages),   // convert UIMessage[] → CoreMessage[]
  tools: {
    show_kpi: tool({
      description: "Hiển thị một chỉ số quan trọng (KPI)",
      inputSchema: z.object({
        title: z.string(),
        value: z.union([z.string(), z.number()]),
        delta: z.string().optional(),
      }),
      // Không có execute → client-side tool, AI gọi rồi frontend render
    }),
    show_chart: tool({
      description: "Hiển thị biểu đồ (line hoặc bar)",
      inputSchema: chartSchema,
    }),
    // ... show_table, show_card_list, show_form
  },
});

return result.toUIMessageStreamResponse();
```

```tsx
// app/page.tsx — map tool call → React component
function renderTool(type: string, input: any) {
  switch (type) {
    case "tool-show_kpi":
      return <KPICard title={input.title} value={input.value} delta={input.delta} />;
    case "tool-show_chart":
      return input.kind === "line"
        ? <LineChart title={input.title} series={input.series} />
        : <BarChart title={input.title} categories={input.categories} values={input.series[0].data} />;
    case "tool-show_table":
      return <DataTable title={input.title} columns={input.columns} rows={input.rows} />;
  }
}

// Render parts stream trong message bubble
{m.parts.map((part) => {
  if (part.type === "text") return <ReactMarkdown>{part.text}</ReactMarkdown>;
  if (part.type.startsWith("tool-")) {
    const isStreaming = part.state === "input-streaming";
    return (
      <div className={isStreaming ? "border-dashed opacity-90" : "border-slate-200"}>
        {renderTool(part.type, part.input)}
      </div>
    );
  }
})}
```

```typescript
// toCoreMessages — strip tool history cho multi-turn (models không cần biết tool đã render gì)
function toCoreMessages(uiMessages: any[]): CoreMessage[] {
  return uiMessages.reduce((acc, msg) => {
    if (msg.role === "user" || msg.role === "system") {
      const text = msg.parts?.filter(p => p.type === "text").map(p => p.text).join("") ?? msg.content;
      if (text) acc.push({ role: msg.role, content: text });
    }
    if (msg.role === "assistant") {
      const text = msg.parts?.filter(p => p.type === "text" && p.text).map(p => p.text).join("") ?? "";
      if (text) acc.push({ role: "assistant", content: text });
    }
    return acc;
  }, []);
}
```

### Điểm mạnh
- **Rich UI trong chat**: chart, table, card, form — tất cả render inline
- **Multi-turn**: conversation history duy trì, user có thể hỏi follow-up
- **Streaming smooth**: text stream trước, widget pop in khi tool call complete
- **Type-safe**: Zod schema validate tool input ngay tại SDK layer

### Điểm yếu
- **Client-side tools**: không có `execute` → chỉ 1 generation step, AI không thể chain tools
- **Tool history bị drop**: multi-turn chỉ giữ text, AI không biết chart nào đã render
- **Phụ thuộc model**: model phải biết gọi tool — Minimax M2.7 đôi khi chỉ trả text

---

## Demo 3 — Agentic GenUI (Signal-aware Layout Composer)

### Ý tưởng cốt lõi

AI không chỉ render data — AI **hiểu ngữ cảnh** (persona, thời tiết, hành vi) rồi **quyết định layout** toàn trang. Đây là bước tiến từ "AI fills form" lên "AI composes page".

```
Signal Bundle (persona + scenario + weather + behavior)
    → Prompt mô tả context đầy đủ
    → AI chọn tool calls phù hợp (restructureHome / showMoodPicker / showCuratedRow)
    → Zod safeParse từng tool call
    → Frontend render layout theo tool sequence
```

### Kiến trúc

```
Frontend (page.tsx)
  ├── Mode 1: Signal Composer
  │     ├── Chọn Persona (Minh / Lan / Tuấn / An)
  │     ├── Chọn Scenario (Baseline / Weather / Search Abandon)
  │     └── → POST /api/compose
  │           ├── buildSignalBundle(personaId, scenario)
  │           └── composeUI(bundle) → AI → tool calls
  │
  └── Mode 2: Conversational Builder
        ├── Multi-turn chat
        └── → POST /api/chat
              └── AI dùng tools: showProductCard, showForm,
                  showStatsGrid, showDataTable, showAlertBanner

lib/signals/collector.ts  → buildSignalBundle()   (deterministic context)
lib/compose/composer.ts   → composeUI()           (AI layer)
```

### Code mẫu — Signal bundle + AI compose

```typescript
// lib/signals/collector.ts — tạo context bundle từ persona + scenario
export function buildSignalBundle(personaId: string, scenario: string): SignalBundle {
  const personas = {
    minh: { name: "Minh", age: 28, city: "HCM", pattern: "Healthy-leaning, AOV 60k" },
    lan:  { name: "Lan",  age: 35, city: "Hanoi", pattern: "Group orders, budget-conscious" },
    tuan: { name: "Tuấn", age: 22, city: "Da Nang", pattern: "Late-night, fast/cheap" },
  };

  const scenarioData = {
    weather:       { time: "14:00", weather: { temp: 22, condition: "cold" }, ... },
    searchAbandon: { time: "22:30", weather: { temp: 28, condition: "rainy" }, ... },
  };

  return { persona: personas[personaId], scenario, ...scenarioData[scenario] };
}
```

```typescript
// lib/compose/composer.ts — AI nhận bundle, quyết định layout tools
export async function composeUI(bundle: SignalBundle): Promise<ComposeResult> {
  const prompt = `
Persona: ${bundle.persona.name}, ${bundle.persona.age} tuổi, ${bundle.persona.city}
Pattern: ${bundle.persona.pattern}
Scenario: ${bundle.scenario} — ${scenarioInstructions[bundle.scenario]}
Thời gian: ${bundle.time} | Thời tiết: ${bundle.weather.temp}°C, ${bundle.weather.condition}
Đơn gần đây: ${bundle.behavior.recentOrders} | Session: ${bundle.behavior.sessionMinutes} phút

Dùng tools để compose layout trang chủ phù hợp với context.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    body: JSON.stringify({
      model: "minimax/minimax-m2.7",
      messages: [
        { role: "system", content: "You are a food delivery UI composer." },
        { role: "user",   content: prompt },
      ],
      tools: [
        { type: "function", function: { name: "restructureHome", ... } },
        { type: "function", function: { name: "showMoodPicker", ... } },
        { type: "function", function: { name: "showCuratedRow", ... } },
        { type: "function", function: { name: "showContextBanner", ... } },
      ],
      tool_choice: "required",   // Bắt buộc phải gọi tool, không được trả text thuần
      stream: false,
    }),
  });

  // Zod safeParse từng tool call
  for (const tc of data.choices[0].message.tool_calls) {
    const schema = primitives[tc.function.name];
    const parsed = schema.safeParse(JSON.parse(tc.function.arguments));
    if (parsed.success) parsedTools.push({ name: tc.function.name, args: parsed.data });
  }

  return { ok: parsedTools.length > 0, tools: parsedTools, latencyMs, tokens };
}
```

### Điểm mạnh
- **Context-aware**: AI biết persona là ai, đang làm gì, thời tiết thế nào → layout khác nhau
- **Layout-level decision**: AI không chỉ fill data mà quyết định cả cấu trúc trang
- **Validation vẫn chặt**: Zod safeParse reject tool call sai cấu trúc

### Điểm yếu
- **Không stream**: single request/response → user thấy blank trong lúc chờ
- **Signals là mock**: demo dùng hardcoded data, production cần real telemetry pipeline
- **Khó debug**: AI có thể chọn layout "lạ" — khó audit tại sao AI lại chọn tool X

---

## So sánh kiến trúc chi tiết

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI DECISION SURFACE                                 │
│                                                                             │
│  Demo 1          Demo 2               Demo 3                               │
│  ┌──────┐        ┌──────────────┐     ┌─────────────────────────────────┐  │
│  │ JSON │        │ Tool: KPI    │     │ Tool: restructureHome           │  │
│  │ {    │        │ Tool: Chart  │     │ Tool: showMoodPicker            │  │
│  │  id  │        │ Tool: Table  │     │ Tool: showCuratedRow            │  │
│  │  ... │        │ Tool: Form   │     │ → AI decides WHICH tools        │  │
│  │ }    │        │ → AI decides │     │   AND full layout context       │  │
│  └──────┘        │   which data │     └─────────────────────────────────┘  │
│  AI fills        └──────────────┘     AI composes                          │
│  structure       AI picks widgets     AI choreographs                      │
└─────────────────────────────────────────────────────────────────────────────┘

  ← Ít tự chủ hơn                                    Nhiều tự chủ hơn →
  ← Deterministic hơn                                  Creative hơn →
  ← Dễ validate hơn                                    Khó kiểm soát hơn →
```

### Khi nào dùng cách nào?

| Tình huống | Nên dùng |
|---|---|
| Form builder, intake flow, survey generator | **Demo 1** — JSON Schema |
| Dashboard chat, data exploration, support bot | **Demo 2** — Tool Calling |
| Personalized homepage, contextual recommendations | **Demo 3** — Agentic |
| Output phải 100% predictable, không sai format | **Demo 1** |
| User cần hội thoại qua lại để refine kết quả | **Demo 2** hoặc **Demo 3 (chat mode)** |
| AI cần biết user là ai + đang làm gì + context bên ngoài | **Demo 3** |

---

## Đề xuất cải tiến

### Demo 1 — Declarative GenUI
- **Partial form render**: Hiện tại phải stream xong mới parse được JSON. Có thể thêm streaming partial fields bằng cách detect `"fields": [` rồi parse từng field khi đóng `}`.
- **Schema cache**: Cùng industry + workflow thì luôn ra schema tương tự — có thể cache kết quả 24h, tiết kiệm latency và token cost.
- **Multi-schema**: Hiện chỉ generate 1 form. Có thể extend để AI generate nhiều bước (wizard flow).

### Demo 2 — Tool Calling
- **Tool call history**: Hiện tại multi-turn chỉ giữ text, AI không biết chart nào đã render. Có thể thêm context summary: _"Lượt trước bạn đã xem: KPI doanh thu 28.5 tỷ, biểu đồ 5 kênh"_ vào system prompt.
- **Streaming placeholder**: Khi `state === "input-streaming"`, hiện đang dim widget. Có thể thêm skeleton loader đẹp hơn (shimmer effect).
- **Form submission**: `InlineForm` render được nhưng khi submit chỉ gửi lại summary text. Có thể POST data thật lên `/api/submit` và trả AI response _"Đã ghi nhận thông tin..."_.
- **Voice input**: Thêm Web Speech API để user nói thay vì gõ — hợp với demo scenario bán lẻ.

### Demo 3 — Agentic GenUI
- **Streaming compose**: Chuyển `stream: false` → `stream: true`, accumulate tool calls từng phần → render progressive layout.
- **Real signals**: Thay mock data bằng anonymous browser signals thật (scroll depth, click pattern, time-on-page) để AI decision có ý nghĩa hơn.
- **Memory giữa turns** (chat mode): Lưu lại tool calls của AI turn trước vào conversation history dạng assistant summary, tránh AI re-render lại từ đầu.
- **Explain mode**: Thêm toggle "Vì sao AI chọn layout này?" — AI trả plaintext giải thích reasoning trước khi render.

---

## Tech stack tổng hợp

```
OpenRouter (gateway)
  └── Minimax M2.7     — main LLM (tool calling + streaming)
  └── GPT-4o-mini      — suggest endpoint (fast, cheap)

Vercel AI SDK v6 (ai, @ai-sdk/react, @ai-sdk/openai)
  ├── streamText()              — Demo 2 server-side streaming + tool calling
  ├── generateText()            — Demo 2 suggest endpoint
  ├── tool()                    — typed tool definition với Zod inputSchema
  ├── useChat() + DefaultChatTransport  — Demo 2 client-side chat state
  └── toUIMessageStreamResponse()       — SSE stream format cho useChat

Zod
  ├── Tool inputSchema validation   (Demo 2, Demo 3)
  ├── FormSchema validation         (Demo 1)
  └── safeParse per tool call       (Demo 3 composer)

Next.js 16 App Router
  ├── Route handlers (app/api/*)
  └── Client components ("use client")
```
