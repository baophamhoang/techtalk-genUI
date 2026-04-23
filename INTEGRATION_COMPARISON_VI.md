# So Sánh Integration — 3 Demo GenUI

> **Góc nhìn:** Tech team muốn tích hợp 1 trong 3 pattern vào hệ thống hiện có của mình.
> Audience là team đang build sản phẩm cho business client (B2B2C).

---

## 0. Cách GenUI hoạt động — So sánh cơ chế cốt lõi

> **Insight quan trọng nhất:** GenUI xảy ra tại **tool-call level**, không phải rendering level.
> Rendering luôn deterministic — cùng tool call → cùng component.
> Cái non-deterministic là AI chọn tool nào, với args gì.
> **Tool definition là nơi developer kiểm soát AI có bao nhiêu "quyền tự do."**

---

### Cấu trúc so sánh: "Tool" trong mỗi demo là gì?

```
DEMO 1                    DEMO 2                    DEMO 3
──────────────────────    ──────────────────────    ──────────────────────
"Tool" = Schema           "Tool" = Component        "Tool" = Layout Action
────────────────────────────────────────────────────────────────────────────
AI fills a               AI picks a widget          AI orchestrates
predefined schema        from a palette             page sections

Granularity:             Granularity:               Granularity:
Field level              Component level            Page-section level
(smallest)               (medium)                   (largest)

AI decision:             AI decision:               AI decision:
Which fields?            Which component?           Which layout actions?
What labels?             What data to pass?         In what order?
                                                    + Reasoning text
```

---

### Cơ chế từng demo — chi tiết kỹ thuật

#### Demo 1 — Schema-as-Contract

```
Developer defines:                AI fills:
┌─────────────────────────┐      ┌──────────────────────────┐
│ FormSchema (Zod)        │      │ {                        │
│  fields: [{             │  →   │   fields: [              │
│    type: text|email     │      │     { type: "text",      │
│          |select|...    │      │       label: "Tên khách" │
│    label: string        │      │       required: true },  │
│    required?: bool      │      │     { type: "select",    │
│    options?: [...]      │      │       label: "Loại xe",  │
│  }]                     │      │       options: [...] }   │
│  submitLabel: string    │      │   ],                     │
└─────────────────────────┘      │   submitLabel: "Đặt lịch"│
                                 └──────────────────────────┘

Validation: extractJson(rawText) → JSON.parse → FormSchema.safeParse
If fail: show raw + Zod issues (failure-visible)
Not tool calling — là structured output generation
```

**Developer controls:** Loại field nào tồn tại (text/select/date...)
**AI controls:** Field nào xuất hiện, label là gì, options gì
**AI guidance:** System prompt mô tả schema structure + domain context

---

#### Demo 2 — Palette Selection

```typescript
// Developer viết — đây là "menu" AI được chọn
show_chart: tool({
  description: "Hiển thị biểu đồ (line hoặc bar)",  // ← AI đọc cái này để biết khi nào dùng
  inputSchema: z.object({                             // ← AI phải trả args khớp schema này
    title: z.string(),
    kind: z.enum(["line", "bar"]),
    series: z.array(z.object({ name: z.string(), data: z.array(z.number()) })),
    categories: z.array(z.string()).optional()
  }),
  // Không có execute() → client-side tool, FE render
})
```

```
User: "Doanh thu tháng 3 theo kênh"
         ↓
AI reads all 6 tool descriptions → chọn show_chart
         ↓
AI generates args: { title: "...", kind: "bar", series: [...] }
         ↓
SDK validates args against Zod schema during streaming
         ↓
FE receives: part.type === "tool-show_chart" → <BarChart {...args} />
```

**Developer controls:** Tool catalog (6 tools), inputSchema (valid args shape)
**AI controls:** Tool selection (which component), arg values (what data)
**AI guidance:** Tool `description` field — đây là "instruction manual" cho AI
**Validation:** SDK validates inline, stream stops on invalid args

---

#### Demo 3 — Layout Orchestration

```typescript
// Developer viết — layout-level actions, not component-level
{
  type: 'function',
  function: {
    name: 'restructureHome',
    description: 'Restructure home page layout',  // ← intentionally vague, AI decides
    parameters: {                                  // ← plain JSON schema, not Zod
      type: 'object',
      properties: {
        hero: { type: 'object', properties: { title, subtitle, tag } },
        rows: { type: 'array', items: { title, items: [{name, price, badge}] } },
        hideDefaultRows: { type: 'boolean' }
      }
    }
  }
}
```

```
Signal bundle: { persona: Minh, weather: 16°C lạnh, searchHistory: [...] }
         ↓
AI reads signals + tool catalog + scenario instructions in prompt
         ↓
AI streams: text ("Trời lạnh, Minh cần comfort food...")
         ↓
AI streams: tool_call restructureHome → args buffer accumulates
         ↓
Tool switch index: emit current tool, start next
         ↓
Zod safeParse(raw) → parsed.success ? data : raw  // fallback, không drop
         ↓
FE: type="text" → green reasoning box
     type="tool" → HomeSurface renders layout
```

**Developer controls:** Tool catalog (4 layout actions), parameter shapes
**AI controls:** Which tools, what order, full content of each section + reasoning text
**AI guidance:** Prompt explicitly maps scenario → tool: *"Use restructureHome for weather, showMoodPicker when user needs help deciding"*
**Validation:** Zod safeParse post-parse, fallback to raw (never silent drop)

---

### Bảng so sánh cơ chế

| | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **Tên cơ chế** | Structured output | Tool calling (SDK) | Tool calling (raw fetch) |
| **"Tool" là gì** | Zod schema (implicit) | Vercel AI SDK `tool()` | OpenAI JSON schema |
| **Granularity** | Field level | Component level | Page-section level |
| **AI decision space** | Field list + labels | Component selection | Layout composition |
| **Description field** | Không có | ✅ Per tool | ✅ Per tool + prompt guidance |
| **Validation** | Post-parse, all-or-nothing | SDK inline, stream stops | Post-parse, safeParse + fallback |
| **Validation library** | Zod `.parse()` | Zod qua SDK | Zod `.safeParse()` |
| **Fail behavior** | Show raw + issues | Tool not emitted | Emit raw args (never drop) |
| **Tool count** | 1 schema | 6 tools | 4 tools |
| **Tools per response** | 1 schema | Multiple | Multiple |
| **Text + tools cùng response** | ❌ | 🟡 Tách biệt (text trước) | ✅ Interleaved (Claude) |
| **execute() function** | ❌ | ❌ (client-side) | ❌ (client-side) |
| **tool_choice** | N/A | Implicit (auto) | `"auto"` |
| **Model dependency** | Flexible | Flexible | **Claude bắt buộc** |

---

### Tool Definition là "API" giữa Developer và AI

```
                    DEVELOPER SIDE          AI SIDE
                    ─────────────────       ──────────────────────
Demo 1              FormSchema structure    Which fields + values
                    (what's possible)       (what to include)

Demo 2              Tool catalog            Which tool + args
                    Tool descriptions       (component selection)
                    inputSchema (Zod)

Demo 3              Tool catalog            Which tools + order + args
                    Parameter shapes        + Reasoning text
                    Prompt guidance         (layout orchestration)
```

**Cái developer viết = constraints.**
**Cái AI quyết định = GenUI.**
**Cái FE render = deterministic.**

Tool definition quality quyết định GenUI quality:
- Description quá vague → AI chọn sai tool
- Schema quá strict → AI không truyền được data cần thiết
- Schema quá loose → AI trả garbage, validation fail
- Prompt guidance không rõ → AI chọn layout không đúng context

---

### Cái thực sự cần làm khi port sang domain mới

**Demo 1:** Thay system prompt + bucket names. FormSchema giữ nguyên (field types không đổi). **½ ngày.**

**Demo 2:** Thay tool descriptions + inputSchemas phù hợp domain. Mỗi tool mới = 1 Zod schema + 1 React component + 1 case trong renderTool(). Signal: description field quan trọng nhất — nếu AI không hiểu khi nào dùng tool, tool vô nghĩa. **3–5 ngày.**

**Demo 3:** Thay tool catalog + parameter shapes + prompt guidance mapping. Signal bundle (persona, time, weather, behavior, location) là generic — map từ data đã có. Cái hard là **thiết kế tool semantics**: layout action có nghĩa gì trong domain của bạn? (Retail: `restructureProductGrid`? Banking: `prioritizeAlerts`?). **3–5 ngày tool design + 2–3 ngày implement.**

> Signal collection không phải bottleneck. Tool design là bottleneck — vì phải quyết định AI được phép "làm gì" với layout của bạn.

---

## 1. Bảng tổng quan nhanh

| | Demo 1 — JSON Form Renderer | Demo 2 — Chat + Inline UI | Demo 3 — Adaptive UI |
|---|---|---|---|
| **Effort để copy vào app có sẵn** | 🟢 Thấp | 🟡 Trung bình | 🔴 Cao |
| **Files cần copy/adapt** | ~2 files, ~80 LOC backend | ~2 files, ~150 LOC backend | ~2 files, ~350 LOC backend |
| **Frontend thay đổi** | 1 component (FormRenderer) | useChat hook + renderTool switch | SSE event handler + layout components |
| **NPM packages mới** | Không (chỉ Zod nếu chưa có) | `@ai-sdk/openai` `ai` `zod` | Không (chỉ Next.js built-in) |
| **API key mới** | OpenRouter | OpenRouter | OpenRouter (cần Claude) |
| **Model constraint** | Flexible | Flexible (Minimax flaky) | **Bắt buộc Claude** |
| **MVP estimate** | 1–2 ngày | 2–3 ngày | 3–5 ngày (domain rõ) |
| **Production-ready estimate** | 1 tuần | 2–3 tuần | 4–8 tuần+ |
| **Cost/request** | ~$0.001 | ~$0.002 | ~$0.009 |

---

## 2. Prerequisites — Cần có gì trước khi bắt đầu?

| | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **Framework** | Next.js App Router | Next.js App Router | Next.js App Router (hoặc bất kỳ SSE-capable server) |
| **React version** | 18+ | 18+ | 18+ |
| **Backend** | Route handler (built-in Next.js) | Route handler | Route handler |
| **Database** | ❌ Không cần | ❌ Không cần | ❌ Không cần (demo) |
| **Auth** | ❌ Không cần | ❌ Không cần | ❌ Không cần |
| **Queue / background job** | ❌ | ❌ | ❌ (production thì cần) |
| **AI/ML infra** | ❌ | ❌ | ❌ |
| **Streaming infra** | ❌ (Next.js handle) | ❌ | ❌ |
| **OpenRouter account** | ✅ | ✅ | ✅ |
| **Anthropic/Claude access** | ❌ | ❌ | ✅ Bắt buộc |

**Kết luận prerequisites:**
- Demo 1 và 2: Chỉ cần Next.js + OpenRouter API key. Team nào đang dùng Next.js là đủ.
- Demo 3: Thêm constraint phải dùng Claude (qua OpenRouter hoặc Anthropic trực tiếp). Nếu team đang dùng Azure OpenAI hay self-hosted Llama → **không thay thế được**.

---

## 3. Những gì hardcoded phải thay đổi cho production

### Demo 1

| Hardcoded | Giá trị demo | Cần đổi thành |
|---|---|---|
| Domain/buckets | `artifact_triage`, `service_intake` | Bucket của domain bạn |
| System prompt | "You are a form generator for dev/ops..." | Prompt cho use case thật |
| Field types | text, email, number, date, select... | Thêm field types nếu cần |
| Model | `minimax/minimax-m2.7` | Có thể giữ hoặc đổi sang Gemini Flash |
| FormRenderer | Component render generic | Có thể wrap vào design system của bạn |
| **Effort đổi** | **½ ngày** — chỉ thay prompt + bucket names | |

### Demo 2

| Hardcoded | Giá trị demo | Cần đổi thành |
|---|---|---|
| Scenarios | analytics, travel, food | Scenarios của domain bạn |
| System prompt | "Reply in Vietnamese, use business analytics tools" | Prompt cho use case thật |
| Tool palette | 5 tools: chart, table, card, form, KPI | Tools phù hợp với app của bạn |
| Tool descriptions | Vietnamese descriptions | Ngôn ngữ + domain context thật |
| Mock data | AI invents numbers | `execute` function query DB thật |
| Model | `minimax/minimax-m2.7` | **Nên đổi sang GPT-4o-mini** (reliable hơn cho tool calling) |
| Suggest chips | GPT-4o-mini, Vietnamese | Model/language của bạn |
| **Effort đổi** | **3–5 ngày** — tools + data layer + model swap | |

**Gap quan trọng nhất của Demo 2:** Tool `execute` function. Demo hiện tại không có `execute` — AI invent data. Production phải thêm:
```typescript
show_chart: tool({
  description: "...",
  inputSchema: chartSchema,
  execute: async (args) => {
    const data = await db.query("SELECT ...");  // ← đây là phần demo thiếu
    return { ...args, series: data };
  }
})
```
Mỗi tool cần 1 `execute` → mỗi tool = 1 data source integration.

### Demo 3

| Hardcoded | Giá trị demo | Cần đổi thành |
|---|---|---|
| Personas | Minh/Lan/Tuấn/An (food delivery VN) | Personas của app bạn (hoặc dynamic từ user profile) |
| Scenarios | baseline/weather/searchAbandon | Scenarios phù hợp domain |
| Signal data | Hardcoded per persona×scenario | **Real signals từ telemetry pipeline** |
| Layout tools | restructureHome, showMoodPicker, showCuratedRow, showContextBanner | Layout tools phù hợp với app của bạn |
| Tool parameters | Food items, prices, emojis | Domain content thật |
| Domain | Food delivery | E-commerce, banking, fitness, travel... |
| Model | claude-3-5-haiku | **Không thể thay thế** nếu cần text+tools cùng response |
| **Effort đổi** | **2–4 tuần** — signals + personas + tools mới | |

**Gap quan trọng nhất của Demo 3:** Signal collection pipeline. Demo dùng hardcoded data. Production cần:
```
Weather API (Open-Meteo, OpenWeather)
    + User behavior từ analytics (Mixpanel, Amplitude, hoặc internal)
    + Order history từ DB
    + Session data từ client
    → Assembled real-time into SignalBundle
    → Sent to AI
```
Đây là infrastructure work, không phải AI work. **4–8 tuần** chỉ cho signal pipeline tùy system có sẵn gì.

---

## 4. Rủi ro production — Cái gì vỡ đầu tiên?

| Rủi ro | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **AI trả output sai format** | 🟡 Zod validate → show issues | 🟢 Vercel AI SDK validate | 🟡 Zod safeParse → fallback raw args |
| **Model flaky (trả text thay vì tool)** | 🟢 Không có tool | 🔴 Minimax đôi khi fail | 🟢 Claude reliable |
| **Latency cao** | 🟡 3–5s, stream che | 🟡 2–3s, stream che | 🟡 3–5s, stream che |
| **Non-determinism** | 🟡 Cùng input ≈ giống output | 🟢 Tool calls khá stable | 🔴 Layout khác nhau mỗi run |
| **Token cost không kiểm soát** | 🟢 Bounded prompt | 🟡 Tăng theo conversation | 🟢 Single request |
| **Rate limit OpenRouter** | 🟡 Có thể | 🟡 Có thể | 🟡 Có thể |
| **User thấy blank UI** | 🟢 Fallback schema | 🟡 Tool không render = null | 🟢 Zod fallback raw args |
| **Data accuracy** | N/A (structural only) | 🔴 AI invent numbers | N/A (structural only) |

**Highlight:**
- Demo 2 có **2 independent risks**: model flaky + data accuracy — cả hai cần giải quyết trước production
- Demo 3 có **non-determinism risk** lớn nhất — cần cache strategy để layout không thay đổi mỗi page load

---

## 5. Compatibility với tech stack phổ biến

| Stack | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **Next.js App Router** | ✅ Native | ✅ Native | ✅ Native |
| **Next.js Pages Router** | 🟡 Cần adapt streaming | 🔴 useChat cần App Router | 🟡 Cần adapt streaming |
| **Express / Fastify (Node)** | 🟡 Cần rewrite stream | 🔴 Vercel AI SDK ties Next.js | ✅ Raw fetch, portable |
| **Remix** | 🟡 Cần adapt | 🟡 Cần adapt | 🟡 Cần adapt |
| **React + Vite (SPA)** | 🟡 Cần BE riêng | 🔴 Cần BE riêng + adapter | 🟡 Cần BE riêng |
| **Non-React FE (Vue, Svelte)** | 🟡 Chỉ cần rewrite FE renderer | 🔴 useChat = React only | 🟡 SSE event parsing portable |
| **Mobile (React Native)** | ❌ SSE/streaming phức tạp | ❌ Web-only SDK | 🟡 Có thể port SSE |

**Kết luận compatibility:**
- Demo 1: Portable nhất — phần backend là pure HTTP streaming, FE renderer có thể rewrite bất kỳ framework
- Demo 2: **Tied vào Vercel AI SDK + React** — nếu team không dùng Next.js/React thì đây là vấn đề
- Demo 3: Backend portable (raw fetch + SSE), frontend cần rewrite SSE handler nhưng không tied vào SDK

---

## 6. Mức độ thay đổi khi domain thay đổi

**Scenario: Team đang build cho B2B client là một retail chain — muốn implement GenUI cho app của họ.**

### Demo 1 — Adapt sang Retail
```
Thay:
- Buckets: "product_inquiry", "return_request", "store_finder"
- System prompt: "Generate intake form for retail customer service..."
- Field types: thêm "rating", "barcode_scan" nếu cần

Giữ nguyên:
- Toàn bộ FormRenderer component
- Streaming architecture
- Zod validation

Effort: ½ ngày
```

### Demo 2 — Adapt sang Retail
```
Thay:
- Scenarios: "inventory", "orders", "customer_service"
- Tool palette: show_product_grid, show_order_status, show_return_form, show_store_map
- execute() functions: query inventory DB, order system, CRM
- System prompt: retail context

Giữ nguyên:
- streamText + useChat pattern
- Streaming architecture
- Zod tool validation

Effort: 1–2 tuần (tool definitions + execute functions + FE components)
```

### Demo 3 — Adapt sang Retail
```
Thay:
- Personas: shopper profiles (budget hunter, loyal member, impulse buyer, gift shopper)
- Scenarios: "weekend browsing", "flash sale", "cart abandon", "loyalty tier up"
- Signal bundle: purchase history, browsing time, cart state, member tier
- Layout tools: showProductGrid, showFlashSaleBanner, showPersonalizedPicks, showLoyaltyCard
- Signal pipeline: connect to POS data, loyalty system, browse behavior

Giữ nguyên:
- SSE streaming pattern
- Zod safeParse fallback
- Claude model (constraint stays)

Effort: 4–8 tuần (signal pipeline là bottleneck)
```

---

## 7. Recommendation matrix — Team nào nên chọn gì?

| Team profile | Nên bắt đầu từ |
|---|---|
| Team mới với AI, chưa có infrastructure | **Demo 1** — lowest risk, fastest value |
| Team đang build internal tool / dashboard | **Demo 2** — chat palette fits perfectly |
| Team build consumer app, đã có analytics pipeline | **Demo 3** — highest payoff |
| Team dùng non-React FE | **Demo 1 hoặc Demo 3** — tránh Demo 2 (SDK lock-in) |
| Team dùng Azure OpenAI / self-hosted | **Demo 1 hoặc Demo 2** — tránh Demo 3 (cần Claude) |
| Team cần 100% audit trail (banking, insurance) | **Không cần GenUI** — SDUI là đúng trục |
| Team muốn ship trong 1 sprint | **Demo 1** — copy 2 files, done |
| Team muốn "wow" demo cho client | **Demo 3** — highest visual impact |

---

## 8. Honest summary — "3 cái này có production-ready không?"

| | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **Backend pattern** | ✅ Production-ready | ✅ Production-ready | ✅ Production-ready |
| **Frontend pattern** | ✅ Production-ready | ✅ Production-ready | ✅ Production-ready |
| **Data layer** | ✅ (structural only) | ❌ Cần thêm execute() | ❌ Cần signal pipeline |
| **Scale** | ✅ Stateless, cacheable | 🟡 Token cost tăng | ✅ Stateless, cacheable |
| **Domain portability** | ✅ Dễ swap | 🟡 Tool definitions cần rewrite | 🔴 Signals + personas cần rewrite từ đầu |
| **Verdict** | Ship in 1 sprint | Ship in 1 sprint nếu mock data OK | Ship architecture in 1 sprint, signal pipeline = separate project |

**Bottom line:**
- **Demo 1**: Kiến trúc + data đều production-ready. Copy, thay prompt, ship.
- **Demo 2**: Kiến trúc production-ready. Data layer là gap duy nhất — cần thêm `execute()` functions. 1–2 sprint.
- **Demo 3**: Kiến trúc production-ready. **Signal pipeline là một project riêng** — không ship trong 1 sprint. AI layer chỉ là phần cuối của cả hệ thống lớn hơn.
