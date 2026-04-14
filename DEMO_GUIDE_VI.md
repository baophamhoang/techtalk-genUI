# Hướng Dẫn Demo — Generative UI

> **Generative UI là gì?** Thay vì lập trình viên hardcode từng màn hình, hệ thống *sinh ra* UI động dựa trên dữ liệu, ngữ cảnh, hoặc ngôn ngữ tự nhiên. Bốn demo dưới đây minh hoạ một dải đánh đổi: từ rule engine không có độ trễ đến AI agent hội thoại xây dựng và tinh chỉnh giao diện qua nhiều lượt.

---

## Demo 1 — Rule Engine Chọn JSON Schema Có Sẵn

### Cách Hoạt Động

```
Người dùng chọn ngữ cảnh (ngành nghề + quy trình)
        ↓
Rule Engine (logic if-else)
        ↓
Chọn 1 trong N schema có sẵn
        ↓
JSON Schema Renderer → UI
```

Toàn bộ logic chạy trên client. Không AI, không API call. Rule engine là hàm `selectSchema(industry, workflow)` trả về schema phù hợp từ một registry cố định.

**Ví dụ rule:**
```ts
if (industry === "healthcare" && workflow === "booking") {
  return SCHEMAS.healthcareBooking;
}
```

**Ví dụ schema:**
```json
{
  "type": "object",
  "props": {
    "properties": {
      "patientName": { "type": "string", "title": "Tên bệnh nhân" },
      "doctor":      { "type": "string", "title": "Bác sĩ", "enum": ["BS. Minh", "BS. Lan"] }
    },
    "actionButtons": [{ "label": "Đặt lịch khám", "variant": "primary" }]
  }
}
```

### Ưu Điểm
- **Tức thời** — không có độ trễ, không cần mạng
- **Hoàn toàn dự đoán được** — cùng input luôn cho cùng output
- **Zero chi phí API**
- **Bảo mật tối đa** — không có thực thi code động
- **Có thể kiểm tra và audit** — unit test có thể bao phủ mọi trường hợp

### Nhược Điểm
- **Thiếu linh hoạt** — N form = N schema viết tay từ đầu
- **Không scale với yêu cầu đặc thù** — mỗi khách hàng muốn form riêng là thêm code
- **Chi phí bảo trì cao** — thêm ngành mới đòi hỏi thay đổi code

### Phù Hợp Nhất Khi
- Ngân hàng, bảo hiểm, y tế — output phải được kiểm soát nghiêm ngặt
- Ứng dụng cần hoạt động offline
- Team cần 100% kiểm soát những gì người dùng thấy
- MVP với tập form đã biết và giới hạn

---

## Demo 2 — AI Sinh Ra JSON Schema

### Cách Hoạt Động

```
Người dùng chọn ngữ cảnh (ngành nghề + quy trình)
        ↓
API call: POST /api/generate-form
        ↓
AI (streamText / streamObject) — sinh ra JSON schema
        ↓
JSON được stream về FE theo thời gian thực
        ↓
Parse JSON → đưa vào Renderer giống Demo 1 → UI
```

AI nhận một template JSON schema và được hướng dẫn điền vào cho ngữ cảnh đã cho. Output của AI vẫn phải tuân theo cấu trúc mà Renderer hiểu được.

**Prompt gửi cho AI:**
```
Tạo form schema cho doanh nghiệp y tế, quy trình: "đặt lịch".
Chỉ trả về đúng cấu trúc JSON này: { "fields": [...], "actionButtons": [...] }
```

### Ưu Điểm
- **Linh hoạt hơn Demo 1** — AI xử lý mọi tổ hợp ngành × quy trình
- **Vẫn an toàn** — JSON không thực thi; Renderer kiểm soát hoàn toàn DOM
- **Output có cấu trúc** — tệ nhất khi AI thất bại là form trống, không phải crash
- **Tiết kiệm thời gian phát triển** — không cần viết tay từng schema

### Nhược Điểm
- **Không tất định** — cùng input có thể cho output khác nhau mỗi lần
- **Vẫn bị giới hạn bởi Renderer** — AI không thể tạo loại component mà Renderer không biết
- **Độ trễ API** — thường 3–8 giây
- **Chi phí token** — mỗi lần sinh ra tiêu thụ API credit

### Phù Hợp Nhất Khi
- Nền tảng SaaS phục vụ nhiều ngành (fintech, logistics, y tế...)
- Công cụ xây dựng nội bộ — nhân viên tạo form cho quy trình của mình
- Khi không gian tổ hợp (ngành × quy trình) quá lớn để viết tay

---

## Demo 3 — AI Gọi Tool để Ghép Các Component Có Sẵn

### Cách Hoạt Động

```
Người dùng mô tả UI bằng ngôn ngữ tự nhiên
        ↓
POST /api/compose-ui
        ↓
AI nhận registry tool cố định (showProductCard, showForm, showStatsGrid, showDataTable, showAlertBanner)
        ↓
AI gọi các tool phù hợp, điền tham số (tên, giá, trường, số liệu...)
        ↓
Server gửi tool call đã hoàn thành dưới dạng marker __TOOL__{json}__ENDTOOL__
        ↓
FE parse marker → map tên tool → render component React tương ứng trực tiếp
        ↓
Component xuất hiện ngay — không iframe, không sandbox, không compile code
```

AI không bao giờ viết code. Nó chỉ quyết định *component nào* cần dùng và *dữ liệu gì* để điền vào. Bản thân các component luôn là cùng một code React, do developer bảo trì.

**Tool call từ AI (ví dụ):**
```json
{
  "tool": "showStatsGrid",
  "args": {
    "stats": [
      { "label": "Tổng đơn hàng", "value": 125, "trend": "up", "trendValue": "+12% so với tuần trước" },
      { "label": "Doanh thu",      "value": 42500000, "unit": "đ", "trend": "up" }
    ]
  }
}
```

**Mapping component ở FE:**
```tsx
function RenderedTool({ tool, args }) {
  switch (tool) {
    case "showStatsGrid":    return <StatsGrid {...args} />;
    case "showProductCard":  return <ProductCard {...args} />;
    case "showForm":         return <FormPanel {...args} />;
    case "showDataTable":    return <DataTable {...args} />;
    case "showAlertBanner":  return <AlertBanner {...args} />;
  }
}
```

### Ưu Điểm
- **Nhanh** — AI chỉ sinh ~50 token tham số tool, không phải 300 dòng code. Phản hồi trong ~3–5s
- **Nhất quán design system** — mọi component đến từ cùng thư viện, luôn trông giống nhau
- **Không sandbox** — component render trực tiếp trong React, không iframe, không null-origin
- **Không Babel** — không bước compile code runtime
- **Đáng tin cậy** — tham số JSON có cấu trúc, không phải code tự do có thể có lỗi cú pháp
- **An toàn** — AI không thể inject HTML tuỳ ý hay chạy code tuỳ ý

### Nhược Điểm
- **Bị giới hạn bởi registry** — AI chỉ dùng được component mà developer đã xây dựng sẵn
- **Tham số phải khớp schema** — AI không thể tạo prop mới; nó điền vào prop có sẵn
- **Thêm loại UI mới đòi hỏi developer** — mỗi component mới cần định nghĩa tool + component React

### Phù Hợp Nhất Khi
- Dashboard nội bộ xây từ design system nhất quán
- "AI assistant" hướng đến khách hàng hiển thị UI phù hợp (product card, form, tóm tắt)
- Ứng dụng mà tính nhất quán design là không thể thỏa hiệp
- Team muốn tính linh hoạt của AI mà không từ bỏ kiểm soát component

---

## Demo 4 — Agentic UI (Hội Thoại, Đa Lượt)

### Cách Hoạt Động

```
Người dùng gửi tin nhắn (văn bản)
        ↓
Toàn bộ lịch sử hội thoại gửi đến POST /api/chat
        ↓
AI dùng cùng registry tool như Demo 3
        ↓
AI trả về: văn bản tuỳ chọn + tool call
        ↓
Server trả { text, toolCalls[] } dạng JSON
        ↓
FE thêm tin nhắn assistant mới vào luồng chat
  → văn bản render dưới dạng chat bubble
  → toolCalls[] render dưới dạng component inline bên dưới bubble
        ↓
Người dùng trả lời → lịch sử tăng lên → AI có thể sửa, thêm, hoặc xoá component
```

Điểm khác biệt chính so với Demo 3: AI có **bộ nhớ**. Nó biết mình đã xây dựng gì. Khi bạn nói "bỏ cái cảnh báo đi" hoặc "thêm hàng vào bảng", AI hiểu tham chiếu và cập nhật tương ứng.

**Ví dụ đa lượt:**
```
Người dùng: "Xây cho tôi dashboard quản lý đơn hàng"
AI:         [StatsGrid — 4 chỉ số] [DataTable — 5 đơn hàng]

Người dùng: "Thêm cảnh báo tồn kho thấp"
AI:         [AlertBanner — warning] [các component trước giữ nguyên]

Người dùng: "Đổi chỉ số doanh thu sang theo tuần thay vì tháng"
AI:         [StatsGrid cập nhật — doanh thu theo tuần]
```

### Ưu Điểm
- **Vòng lặp tinh chỉnh** — người dùng có thể lặp lại UI bằng ngôn ngữ bình thường
- **Nhận biết ngữ cảnh** — AI hiểu "cái bảng đó", "thẻ đầu tiên", "số liệu từ trước"
- **UX tự nhiên nhất** — hội thoại là mô hình quen thuộc
- **Vẫn dùng design system** — cùng registry component, cùng tính nhất quán như Demo 3
- **Không sandbox** — cùng cách render như Demo 3

### Nhược Điểm
- **State server phức tạp hơn** — lịch sử phải duy trì ở client và gửi mỗi lượt
- **Chi phí token tăng theo hội thoại** — mỗi lượt gửi toàn bộ lịch sử
- **AI có thể "quên" trong hội thoại dài** — giới hạn context window vẫn áp dụng
- **Khó test hơn** — luồng đa lượt không tất định khó viết unit test

### Phù Hợp Nhất Khi
- AI assistant giúp xây báo cáo, form, hoặc dashboard một cách tương tác
- Sản phẩm "nói chuyện với dữ liệu" nơi người dùng lặp lại trên visualization
- Agent hỗ trợ hiển thị UI phù hợp theo ngữ cảnh (ví dụ: form hoàn tiền sau khiếu nại)
- Bất kỳ sản phẩm nào mà ý định người dùng tiến hoá trong phiên

---

## Bảng So Sánh

| Tiêu chí | Demo 1 — Rule Engine | Demo 2 — AI Schema | Demo 3 — Tool Calling | Demo 4 — Agentic |
|---|---|---|---|---|
| **Tốc độ** | Tức thời | 3–8s | 3–5s | 3–5s mỗi lượt |
| **Tính linh hoạt** | Chỉ schema định sẵn | Mọi tổ hợp trường | Mọi component trong registry | Như Demo 3 + tinh chỉnh lặp |
| **Khả năng dự đoán** | 100% | Thấp | Trung bình (tên tool cố định) | Thấp (đa lượt) |
| **Chi phí API** | $0 | Thấp (JSON nhỏ) | Thấp (~50 token) | Trung bình (tăng theo lịch sử) |
| **Nhất quán design** | ✅ Cao | ✅ Cao | ✅ Cao | ✅ Cao |
| **Bảo mật** | Cao nhất | Cao | Cao (không sandbox) | Cao (không sandbox) |
| **sandbox / iframe** | ❌ Không | ❌ Không | ❌ Không | ❌ Không |
| **Đa lượt** | ❌ | ❌ | ❌ | ✅ |
| **Khi AI thất bại** | N/A | Form trống | Không render component | Thông báo lỗi trong chat |
| **Production-ready** | Có | Có (cần validation) | Có | Có (cần quản lý lịch sử) |
| **Công nghệ chính** | Rule engine + Registry | `streamText` + JSON.parse | OpenAI tool calling + Registry | Tool calling + chat history |

---

## ⚠️ Các Cách Tiếp Cận Đã Loại Bỏ

Các cách tiếp cận sau đã được thử nghiệm và loại bỏ. Phần này giữ lại để tham khảo, không phải để khuyến nghị.

---

### ❌ Đã Loại Bỏ — AI Viết Code React JSX (iframe)

```
Người dùng mô tả UI
        ↓
AI sinh ra toàn bộ code component React (~200–400 token JSX)
        ↓
Server bọc code trong trang HTML với React CDN + Babel CDN
        ↓
Lưu trang vào memory → /api/preview/{id}
        ↓
FE render <iframe src="/api/preview/{id}" sandbox="allow-scripts" />
        ↓
Babel compile JSX ở runtime bên trong iframe → React render
```

**Vì sao chúng ta không dùng nữa:**

| Vấn đề | Tác động |
|---|---|
| Chậm (10–30s) | AI phải sinh 200–400 token JSX hợp lệ về cú pháp — nhiều hơn nhiều so với tham số tool (~50 token) |
| UI không nhất quán | Mỗi lần sinh cho styling, spacing, và lựa chọn component khác nhau — không có design system |
| Compile runtime | Babel chạy bên trong iframe tốn thêm 1–3s và có thể thất bại với JSX edge-case |
| Giới hạn sandbox | `sandbox="allow-scripts"` tạo null origin — iframe không thể giao tiếp với app cha |
| Code có thể thất bại lặng lẽ | Lỗi cú pháp, import thiếu, hoặc prop sai tạo ra iframe trống hoặc hỏng |
| Không viable cho production | Code AI-generated chạy động đòi hỏi domain riêng, pipeline kiểm duyệt nội dung, và validation output |

**So với Demo 3 (Tool Calling):** Cùng mục tiêu linh hoạt, nhưng Demo 3 đạt được trong ~3–5s với zero thực thi code và nhất quán design system hoàn toàn. Ràng buộc registry (AI chỉ chọn được component có sẵn) là đánh đổi xứng đáng cho độ tin cậy và tốc độ đạt được.

---

### ❌ Đã Loại Bỏ — Progressive HTML + Vanilla JS (Two-phase iframe)

```
Người dùng mô tả UI
        ↓
AI sinh ra HTML template trước (chỉ cấu trúc, không JS)
        ↓
Server phát hiện delimiter thẻ <script> giữa stream
        ↓
Lưu trang chỉ-HTML → gửi marker __TEMPLATE_ID__
        ↓
FE render Layer 1 iframe (template tĩnh) ngay lập tức
        ↓
AI tiếp tục sinh ra block <script> (vanilla JS tương tác)
        ↓
Server lưu trang HTML+JS hoàn chỉnh → gửi marker __PREVIEW_ID__
        ↓
FE fade in Layer 2 iframe (tương tác) đè lên Layer 1
```

Cách tiếp cận này là nỗ lực sửa vấn đề màn hình trống của cách tiếp cận JSX bằng cách hiển thị preview tĩnh sớm hơn.

**Vì sao chúng ta không dùng nữa:**

| Vấn đề | Tác động |
|---|---|
| Vẫn chậm (8–15s tổng) | Sinh hai pha chỉ trải đều thời gian chờ — không giảm tổng token sinh ra |
| Hai iframe = phức tạp gấp đôi | Logic crossfade, quản lý z-index, race condition giữa các lần chuyển layer |
| Vẫn là iframe | Cùng giới hạn null-origin, sandbox và bị ngắt kết nối với app |
| Vanilla JS không nhất quán | Không có design system, mỗi lần sinh trông khác nhau |
| Delimiter dễ hỏng | Phát hiện `<script>` giữa stream là heuristic — AI output không đúng format làm hỏng việc split |
| Cải thiện UX chỉ là bề ngoài | Người dùng thấy *gì đó* sớm hơn, nhưng đó là skeleton tĩnh — không phải UI thực |

**So với Demo 3 (Tool Calling):** Cách tiếp cận hai pha đổi một bộ vấn đề (màn hình trống) lấy bộ khác (phức tạp, dễ hỏng). Demo 3 loại bỏ vấn đề hoàn toàn — component render trực tiếp trong React không iframe, không logic hai pha, và tương tác đầy đủ ngay từ lần render đầu tiên.

---

## FAQ

### Tổng Quan

**Q: Generative UI khác gì AI chatbot thông thường?**

Chatbot trả về văn bản. Generative UI trả về *thứ gì đó có thể render* — JSON schema, cây component, hoặc tập tool call có cấu trúc. Người dùng không *đọc* output; họ *tương tác* với nó. Đó là sự khác biệt cốt lõi.

---

**Q: Tại sao dùng registry component (Demo 3 & 4) thay vì để AI viết tự do?**

Output AI không bị ràng buộc (HTML, JSX) không tất định, sinh chậm, và đòi hỏi thực thi runtime — tạo ra vấn đề bảo mật, độ tin cậy, và nhất quán. Registry đảo ngược mô hình: developer định nghĩa những gì có thể, AI quyết định dùng gì. Đây là cùng triết lý như cho designer một component library thay vì canvas trắng.

---

**Q: `streamText` vs `streamObject` — khi nào dùng cái nào?**

- **`streamText`**: Khi output là văn bản tự do hoặc code. FE nhận string thô.
- **`streamObject`**: Khi output phải khớp Zod schema cụ thể. SDK validate và emit chỉ các object partial hợp lệ về cấu trúc. Ưu tiên `streamObject` trong production cho Demo 2.

---

### Về Demo 3

**Q: Điều gì xảy ra nếu AI gọi tool không tồn tại trong registry?**

Switch `RenderedTool` rơi vào `return null` — không có gì render. Không crash, không màn hình trống. Panel log tool call bên trái hiển thị tên tool không rõ để developer phát hiện khoảng trống trong registry.

---

**Q: Tại sao bypass AI SDK và gọi trực tiếp OpenRouter qua `fetch`?**

Vercel AI SDK (tính đến v6 / `@ai-sdk/openai-compatible` v2) có bug serialization schema nơi tham số tool Zod được gửi đến OpenAI với `type: "None"` — gây lỗi 400. Gọi trực tiếp OpenAI-compatible API với JSON schema thuần túy tránh được bug hoàn toàn và đơn giản hơn để debug.

---

**Q: AI có thể inject nội dung độc hại qua tham số tool không?**

AI chỉ có thể điền giá trị tham số (string, number, array). Những giá trị đó được truyền làm prop cho component React kiểm soát chính xác cách render. String độc hại trong `name` trở thành `{name}` trong JSX — React escape tự động. Không `dangerouslySetInnerHTML`, không `eval`, không thực thi script.

---

### Về Demo 4

**Q: Demo 4 khác Demo 3 như thế nào — chẳng phải cả hai đều dùng tool calling?**

Cùng cơ chế bên dưới, mô hình tương tác khác. Demo 3 là một lần: một prompt → một tập component. Demo 4 là hội thoại: AI nhận toàn bộ lịch sử tin nhắn mỗi lượt và có thể tham chiếu, sửa đổi, hoặc mở rộng những gì đã xây. UX chuyển từ "sinh ra" sang "cộng tác."

---

**Q: Làm sao ngăn lịch sử hội thoại trở nên quá dài?**

Các tuỳ chọn trong production: (1) sliding window — chỉ giữ N lượt cuối; (2) summarization — định kỳ yêu cầu AI tóm tắt trạng thái hội thoại; (3) explicit state — serialize cây component hiện tại dưới dạng dữ liệu có cấu trúc và re-inject ở đầu mỗi lượt thay vì phát lại toàn bộ lịch sử.

---

**Q: Demo 4 có thể dùng để xây công cụ no-code đầy đủ không?**

Có, với các bổ sung: persist hội thoại vào database, cho phép người dùng "lưu" layout (snapshot cây component), thêm undo/redo stack, và cho phép người dùng chia sẻ layout qua URL. AI vẫn là "compiler" — dịch ngôn ngữ tự nhiên thành cấu hình component.

---

## Áp Dụng Vào Dự Án Thực Tế

Mỗi pattern dưới đây có thể tích hợp độc lập vào stack Next.js / React hiện có. Không cần rewrite toàn bộ app.

---

### Pattern 1 — Rule Engine + JSON Schema Renderer

**Khi nào dùng:** Số lượng form/màn hình biết trước, cần audit, hoặc offline.

**Các bước tối thiểu:**

```
1. Tạo schema registry
   └── lib/schemas.ts  — export SCHEMAS object, mỗi key là 1 schema JSON

2. Viết rule function
   └── lib/selectSchema.ts
       export function selectSchema(context: Context): Schema {
         if (context.industry === "healthcare") return SCHEMAS.healthcareBooking;
         // ...
       }

3. Copy renderer
   └── components/SchemaRenderer.tsx  — nhận schema, render form/card/table
       (có thể dùng thẳng từ Demo 1)

4. Dùng trong page
   const schema = selectSchema(userContext);
   return <SchemaRenderer schema={schema} />;
```

**Mở rộng:** Thêm schema mới = thêm 1 entry vào `SCHEMAS` + 1 dòng if trong `selectSchema`. Không đụng renderer.

---

### Pattern 2 — AI Sinh JSON Schema

**Khi nào dùng:** Không gian input quá lớn để viết tay (nhiều ngành × nhiều quy trình).

**Các bước tối thiểu:**

```
1. Định nghĩa output schema với Zod
   └── lib/formSchema.ts
       export const FormSchema = z.object({
         fields: z.array(z.object({ label, type, options? })),
         actionButtons: z.array(z.object({ label, variant })),
       });

2. Tạo route API
   └── app/api/generate-form/route.ts
       const result = await streamObject({
         model: openai("gpt-4o-mini"),
         schema: FormSchema,
         prompt: `Tạo form cho ${industry}, quy trình: ${workflow}`,
       });
       return result.toTextStreamResponse();

3. FE nhận stream, render bằng renderer có sẵn
   └── const { object } = useObject({ api: "/api/generate-form", schema: FormSchema });
       return object ? <SchemaRenderer schema={object} /> : <Skeleton />;
```

**Lưu ý production:** Thêm fallback về Demo 1 khi AI timeout, và validate output trước khi render.

---

### Pattern 3 — Tool Calling + Component Registry

**Khi nào dùng:** Muốn AI xây UI phong phú, nhất quán design system, không cần sandbox.

**Các bước tối thiểu:**

```
1. Xây component library (hoặc dùng design system có sẵn)
   └── components/
       ├── ProductCard.tsx
       ├── StatsGrid.tsx
       ├── DataTable.tsx
       └── ... (mỗi component = 1 "slot" AI có thể chọn)

2. Định nghĩa tool registry (plain JSON, KHÔNG dùng Zod với AI SDK*)
   └── lib/tools.ts
       export const TOOLS = [
         { type: "function", function: {
           name: "showStatsGrid",
           description: "Render stats cards",
           parameters: { type: "object", properties: { stats: { type: "array", ... } } }
         }},
         // 1 entry = 1 component
       ];

3. Tạo route API
   └── app/api/compose-ui/route.ts
       // Gọi thẳng fetch() đến OpenAI/OpenRouter — KHÔNG qua AI SDK*
       const res = await fetch("https://api.openai.com/v1/chat/completions", {
         body: JSON.stringify({ model: "gpt-4o-mini", tools: TOOLS, tool_choice: "required", ... })
       });
       // Parse tool_calls, stream markers về FE

4. FE parse markers + render
   └── const TOOL_RE = /__TOOL__([\s\S]*?)__ENDTOOL__/g;
       // mỗi match → { tool, args } → <RenderedTool tool={tool} args={args} />
```

> **\* Lưu ý quan trọng:** Vercel AI SDK v6 có bug serialization — Zod tool schemas bị gửi với `type: "None"` gây lỗi 400. Giải pháp: bypass SDK, dùng `fetch` trực tiếp với plain JSON tool schemas.

**Mở rộng registry:** Thêm component mới = thêm 1 entry vào `TOOLS` + 1 case trong switch `RenderedTool`. AI tự học dùng tool mới qua description.

---

### Pattern 4 — Agentic (Multi-turn Refinement)

**Khi nào dùng:** Người dùng cần lặp lại UI qua hội thoại, không chỉ sinh một lần.

**Các bước tối thiểu** (build on top of Pattern 3):

```
1. Chuyển state FE sang messages[]
   const [messages, setMessages] = useState<Message[]>([]);
   // Message = { role, content, toolCalls? }

2. Gửi full history mỗi request
   const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
   fetch("/api/chat", { body: JSON.stringify({ messages: apiMessages }) });

3. Đổi tool_choice: "required" → "auto"
   // AI có thể trả lời bằng text, tools, hoặc cả hai
   // Khi user hỏi "bỏ cái cảnh báo đi" → AI trả text + tool mới

4. Route trả về { text, toolCalls[] } thay vì stream
   return Response.json({ text: message.content, toolCalls });

5. FE append tin nhắn mới vào thread
   // text → chat bubble
   // toolCalls → components render inline bên dưới bubble
```

**Quản lý history dài:** Sliding window (giữ 10 lượt cuối) hoặc inject component state hiện tại dưới dạng JSON vào system prompt thay vì replay toàn bộ lịch sử.

---

### Checklist Chung Khi Tích Hợp

| Bước | Demo 1 | Demo 2 | Demo 3 | Demo 4 |
|---|:---:|:---:|:---:|:---:|
| Định nghĩa schema/tool registry | ✅ (tay) | ✅ (Zod) | ✅ (JSON) | ✅ (JSON) |
| Route API server-side | ❌ | ✅ | ✅ | ✅ |
| Xử lý streaming | ❌ | ✅ | ✅ | ❌ (JSON) |
| Component renderer | ✅ | ✅ | ✅ | ✅ |
| Quản lý conversation state | ❌ | ❌ | ❌ | ✅ |
| Fallback khi AI fail | N/A | Form trống | `return null` | Lỗi trong chat |
| Cần OPENROUTER_API_KEY | ❌ | ✅ | ✅ | ✅ |

---

## Con Đường Tiến Hoá Tự Nhiên

```
Demo 1 (Rule Engine)
    ↓  "Quá nhiều schema để viết tay"
Demo 2 (AI Schema)
    ↓  "Renderer còn giới hạn, muốn component phong phú hơn"
Demo 3 (Tool Calling)
    ↓  "Người dùng muốn lặp lại, không chỉ sinh một lần"
Demo 4 (Agentic)
    ↓  "Cần đưa lên production"
Kiến Trúc Production:
  - Pattern Demo 1 cho các luồng tần suất cao, cần audit
  - Pattern Demo 2 cho form linh hoạt nhưng có cấu trúc
  - Pattern Demo 3/4 cho bề mặt UI tương tác và dashboard
  - Lịch sử hội thoại bền vững (database)
  - Versioning registry component (registry v2, v3...)
  - Metering sử dụng, rate limiting, giám sát lạm dụng
```

Demo 1–4 không phải "cái sau tốt hơn cái trước" — chúng đại diện cho **các đánh đổi khác nhau**. Hệ thống production thực tế thường kết hợp nhiều cách tiếp cận: rule engine cho luồng cốt lõi, AI schema cho tính linh hoạt, tool calling cho bề mặt UI phong phú, vòng lặp agentic cho trải nghiệm lặp lại.
