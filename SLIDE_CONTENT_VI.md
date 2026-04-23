# Slide Content — GenUI TechTalk (Tiếng Việt)
# "Generative UI: Do we need it?"

> Format mỗi slide: **Template** | **Nội dung** | **Ghi chú trình bày**

---

## Slide 01 — Cover
**Template:** A (Cover)

**Hero title:**
```
GENERATIVE UI
```

**Subtitle:**
```
Do we need Generative UI?
GenUI có thực sự cần thiết không?
```

**Footer:**
```
Bao · TechTalk · Đà Nẵng · 04/2026
```

**Visual right:** Illustration robot hand hoặc abstract neural network — purple/cyan tones

---

## Slide 02 — Mục Lục
**Template:** B (ToC 3 cards)

**Heading:** `MỤC LỤC`

**3 cards:**
```
01  GENERATIVE UI LÀ GÌ?
    UI được AI tạo ra theo ngữ cảnh
    Định nghĩa · So sánh · Khi nào cần?

02  USE CASES & DEMOS
    Demo 1 — JSON Form Renderer
    Demo 2 — Chat + Inline UI
    Demo 3 — Adaptive Context-Aware UI

03  Q&A
    Câu hỏi & thảo luận
```

---

## Slide 03 — GenUI là gì?
**Template:** G (Big statement)

**Big quote:**
```
"UI được AI compose ra
theo ngữ cảnh — không phải hardcode."
```

**Bảng so sánh dưới:**

| Đặc điểm | UI Truyền thống | Generative UI |
|---|---|---|
| Thiết kế | Designer định nghĩa trước | AI tạo ra runtime |
| Cấu trúc | Cố định, giống nhau | Linh hoạt, cá nhân hóa |
| Thay đổi | Cần deploy lại | Thay đổi ngay theo ngữ cảnh |
| Trải nghiệm | Chung chung | Tối ưu theo từng người |

**Ghi chú trình bày:** Đây là baseline chung cho cả buổi. 3 demos phía sau sẽ minh họa từng dòng trong bảng này.

---

## Slide 04 — Demo 1 Intro
**Template:** C (Section intro với số lớn)

**Section heading:** `DEMO 1`

**Title:** `JSON Form Renderer`

**Body:**
```
Form — thứ nhàm chán nhất trong UI.
Nếu GenUI thắng ở form, nó thắng mọi chỗ.
Nếu thua — chúng ta biết giới hạn của nó.
```

**Big number:** `01`

**Tag badges:**
```
[ Model: Minimax M2.7 ]   [ Renderer: JSON Renderer ]   [ Paradigm: Structured Output ]
```

---

## Slide 05 — Demo 1 — Cách Hoạt Động
**Template:** F (Flow)

**Heading:** `CÁCH HOẠT ĐỘNG — STRUCTURED OUTPUT`

**Flow diagram:**
```
User nhập: "đặt thợ sửa ống nước"
        │
        ▼
POST /api/genui/form
        │
minimax/minimax-m2.7  (qua OpenRouter)
        │
  Text stream — JSON thô nằm trong markdown
        │
        ▼
extractJson()   bóc markdown, parse {...}
        │
        ▼
Zod FormSchema.safeParse()
        │
        ▼
FormRenderer   map fields[] → HTML inputs
```

**Key callout:**
```
Không dùng tool calling — AI trả về JSON dạng plain text.
Prompt định nghĩa shape của schema.
Portable hơn nhưng kém reliable hơn tool calling.
```

---

## Slide 06 — Demo 1 — Khi Nào GenUI Cho Form Có Giá Trị?
**Template:** D (2 cards lớn)

**Heading:** `KHI NÀO GENUI CHO FORM CÓ GIÁ TRỊ?`

**2 cards:**
```
[icon: terminal/bug]
BUCKET 1 — DEV/OPS TRIAGE
Paste stack trace / log / config snippet
→ AI infer loại artifact
→ Compose form follow-up phù hợp

Tại sao không SDUI?
Team không enumerate được schema trước
cho mọi loại artifact.

[icon: tools/service]
BUCKET 2 — SERVICE INTAKE
Mô tả vấn đề: "bồn rửa rò nước"
→ AI infer trade (plumbing)
→ Compose intake form theo trade

Tại sao không SDUI?
Trade space quá rộng — plumbing, HVAC,
auto, vet, IT helpdesk — không thể
maintain hàng nghìn schema.
```

---

## Slide 07 — Demo 1 — So Sánh 3 Mode
**Template:** H (full-width table)

**Heading:** `3 MODE · 3 CHI PHÍ KHÁC NHAU`

| | MODE 1 — FE STATIC | MODE 2 — BE SDUI | MODE 3 — GENUI |
|---|---|---|---|
| **Latency** | ~5ms | ~50ms | ~3,000ms |
| **Cost** | $0 | $0 | ~$0.001/req |
| **Determinism** | 100% | 100% | ~80% |
| **Ai kiểm soát** | Developer | Admin/Business | AI |
| **Fail case** | Không có | Không có | Zod validate |
| **Khi nào dùng** | Schema biết trước | Admin cần tự edit | Không thể pre-author |

**Highlight row MODE 3** bằng border purple.

**Callout dưới:**
```
Nhầm lẫn 3 mode này là lý do nhiều team
chi tiền vào GenUI cho cái đáng lẽ chỉ cần SDUI.
```

---

## Slide 08 — Demo 2 Intro
**Template:** C (Section intro)

**Section heading:** `DEMO 2`

**Title:** `Chat + Inline UI`

**Body:**
```
AI không chỉ trả lời bằng text.
AI stream component vào giữa câu trả lời.
Chart · Card · Table · Form — chọn tại runtime.
```

**Big number:** `02`

**Tag badges:**
```
[ Model: GPT-4o-mini ]   [ SDK: Vercel AI SDK v6 ]   [ Paradigm: Tool Calling ]
```

---

## Slide 09 — Demo 2 — Cách Hoạt Động
**Template:** F (Flow)

**Heading:** `CÁCH HOẠT ĐỘNG — VERCEL AI SDK v6`

**Flow diagram:**
```
useChat() + DefaultChatTransport
        │
        ▼
POST /api/chat
        │
streamText({ model, tools: 5 Zod schemas })
        │
toUIMessageStreamResponse()
        │
        ▼
m.parts[]
  ├── type: "text"        → prose stream (từng từ)
  └── type: "tool-input"  → args buffer
                                │
                         args complete
                                │
                         renderTool(type, input) switch
                                │
                         Component render inline
                         (không có execute() — client-side only)
```

**Key callout:**
```
Vercel AI SDK xử lý toàn bộ streaming protocol.
Tools là Zod schemas — không cần server-side execution.
Thêm loại component mới = thêm 1 tool definition.
```

---

## Slide 10 — Demo 2 — Tool Palette
**Template:** D (5 items — 2 row)

**Heading:** `TOOL PALETTE — AI CHỌN TẠI RUNTIME`

**5 tool cards:**
```
[icon: bar-chart]      [icon: table]         [icon: card-stack]
SHOW_CHART             SHOW_TABLE            SHOW_CARD_LIST
Biểu đồ line/bar       Bảng dữ liệu          Danh sách card
                                             (hotel, product...)

[icon: form]           [icon: trending-up]
SHOW_FORM              SHOW_KPI
Form thu thập           Chỉ số quan trọng
thông tin              (KPI + trend)
```

**Callout dưới:**
```
Thêm 1 tool = thêm 1 class UI mà AI có thể compose.
Không cần deploy FE — chỉ thêm tool definition.
```

---

## Slide 11 — Demo 2 — Streaming Pattern
**Template:** F (Flow)

**Heading:** `COMPONENT POP IN — KHÔNG ĐỢI END-OF-MESSAGE`

**Flow:**
```
User message → streamText() + tools
    │
    ├── text tokens  ──► prose stream (từng từ)
    └── tool_call    ──► args buffer → Component render inline
```

**2 stat boxes:**
```
[FIRST TOKEN ~500ms]             [FULL COMPONENT ~2–3s]
User thấy AI "đang gõ" ngay         Chart / Card pop in
```

**Ghi chú trình bày:** Đây là UX khác biệt so với Demo 1 — không phải "wait → show". Nhấn mạnh khi demo live.

---

## Slide 12 — Demo 2 vs Demo 1
**Template:** E (2 column comparison)

**Heading:** `DEMO 2 GIẢI QUYẾT GÌ MÀ DEMO 1 KHÔNG LÀM ĐƯỢC?`

| | Demo 1 | Demo 2 |
|---|---|---|
| **Tương tác** | One-shot generation | Multi-turn chat |
| **AI output** | JSON form schema | Tool call → component |
| **Loại component** | 1 (form) | 6 (chart/table/card/kpi/form) |
| **Granularity** | Field-level | Component-level |
| **Ai trigger** | User prompt | User chat |
| **Best for** | Long-tail form schemas | Dynamic response format |

**Callout dưới:**
```
Demo 1: AI viết schema cho form.
Demo 2: AI chọn cả loại component + stream nó inline trong conversation.
```

---

## Slide 13 — Demo 3 Intro
**Template:** C (Section intro)

**Section heading:** `DEMO 3`

**Title:** `Adaptive Context-Aware UI`

**Body:**
```
AI không fill data vào layout sẵn.
AI đọc context — rồi quyết định layout.
Từ "AI fills form" → "AI composes page".
```

**Big number:** `03`

**Tag badges:**
```
[ Model: claude-3-5-haiku ]   [ Input: Signal Bundle Telemetry ]   [ Paradigm: Agentic Compose ]
```

**4 persona tags (nhỏ, dưới badges):**
```
Minh 28t HCM (văn phòng)  ·  Lan 35t HN (mẹ đơn thân)
Tuấn 22t ĐN (sinh viên)   ·  An 40t HCM (gia đình)
```

---

## Slide 14 — Demo 3 — Cách Hoạt Động
**Template:** F (Flow)

**Heading:** `CÁCH HOẠT ĐỘNG — RAW SSE STREAMING`

**Flow diagram:**
```
buildSignalBundle(persona, scenario)
  → persona · time · weather · location · behavior
        │
        ▼
POST /api/compose
        │
anthropic/claude-3-5-haiku   tool_choice: "auto"
        │
  SSE events (raw fetch, không có SDK):
  ├── { type: "text" }   → reasoning panel (green)
  ├── { type: "tool" }   → Zod safeParse → layout update
  └── { type: "done" }   → metrics display
        │
4 tools: restructureHome · showMoodPicker
         showContextBanner · showCuratedRow
        │
        ▼
safeParse success → typed layout args áp dụng vào UI
safeParse fail    → raw JSON fallback (không bao giờ drop)
```

**Key callout:**
```
Không dùng SDK — raw fetch + tự parse SSE.
Claude 3.5 Haiku: model duy nhất stream text + tools trong cùng 1 response.
safeParse fallback = UI không bao giờ blank dù validation fail.
```

---

## Slide 15 — Demo 3 — Signal Bundle & Tại Sao Không Phải Rule Engine
**Template:** E (2 column)

**Heading:** `BÀI TOÁN: LAYOUT THAY ĐỔI THEO CONTEXT`

**Header (full width — trên 2 cột):**
```
INPUT — Signal Bundle
persona · time · weather · location · recentOrders · searchHistory
→ Data mọi consumer app đã có. Không cần hạ tầng mới.
```

**Left column — Rule Engine (approach đầu tiên tự nhiên nghĩ đến):**
```
RULE ENGINE
Viết if/else cho mỗi tổ hợp signal:

if weather < 18°C AND persona == "budget"
  → show comfort_cheap_row

if weather < 18°C AND persona == "family"
  AND time > 18:00
  → show family_warm_combo

...

4 personas × 3 scenarios
× weather × behavior × time
= hàng trăm rules
= không ai maintain nổi
```

**Right column — GenUI:**
```
GENUI
Thay toàn bộ rule bằng 1 prompt:

"Persona Minh, 28t, HCM,
thời tiết 16°C lạnh, 19:30,
searchHistory: [cháo, súp bò]..."

→ AI tự quyết định tool calls

Thêm signal mới?
→ Thêm 1 dòng vào prompt.
   Không viết thêm rule.
```

**Callout dưới:**
```
Trade-off: mất determinism.
Giải pháp: cache layout per session, re-trigger chỉ khi signal thay đổi đủ lớn.
```

---

## Slide 16 — Demo 3 vs Demo 2 vs Demo 1
**Template:** H (full-width table)

**Heading:** `MỖI DEMO GIẢI QUYẾT MỘT CLASS BÀI TOÁN MỚI`

| | Demo 1 | Demo 2 | Demo 3 |
|---|---|---|---|
| **AI granularity** | Field-level | Component-level | Page-section-level |
| **Ai trigger** | User (prompt) | User (chat) | AI (đọc context) |
| **Input** | Free text | Chat message | Signal bundle |
| **Output** | Form schema | 1 component inline | Full layout restructure |
| **Multi-signal?** | Không | Không | Có |
| **Scales N×M?** | Không | Một phần | Có |

**Callout dưới:**
```
Demo 1 → Demo 2 → Demo 3:
Mỗi bước giải quyết bài toán mà bước trước không thể xử lý.
```

---

## Slide 17 — Khi Nào Dùng Gì?
**Template:** H (full-width table)

**Heading:** `ESCALATION PATH — KHÔNG PHẢI MỌI THỨ CẦN GENUI`

| Tình huống | Dùng |
|---|---|
| Form cố định, schema biết trước | **FE Static** |
| Admin cần tự edit schema không cần deploy | **BE SDUI** |
| Domain regulated (KYC, insurance, medical) | **BE SDUI** |
| Free-text → form, long-tail trades | **GenUI — Demo 1 pattern** |
| Chat với nhiều loại response (chart/card/form) | **GenUI — Demo 2 pattern** |
| Consumer app, nhiều signals, layout cần restructure | **GenUI — Demo 3 pattern** |
| N × M tổ hợp personas × signals | **GenUI — Demo 3 pattern** |

**Callout dưới:**
```
Thứ tự triển khai:  Static → SDUI → GenUI
                    Chỉ leo lên khi thực sự hit wall.
```

---

## Slide 18 — Q&A / Wrap-up
**Template:** A (Cover style, đơn giản hơn)

**Big text:**
```
CÂU HỎI?
```

**Sub-text:**
```
Repo: github.com/[your-org]/genui-techtalk
3 demos đang chạy: :3101 · :3102 · :3103
```

**3 reminder badges:**
```
[BE proxy — không expose API key]
[Zod validate mọi AI output]
[Fallback khi AI fail — không bao giờ blank UI]
```

---

## Tóm tắt Slide Map

| # | Slide | Template | Thời điểm |
|---|---|---|---|
| 01 | Cover | A | 0:00 |
| 02 | Mục lục | B | 0:30 |
| 03 | GenUI là gì? + bảng so sánh | G | 1:30 |
| 04 | Demo 1 — Intro | C | 3:00 |
| 05 | Demo 1 — Cách hoạt động (Architecture) | F | 4:30 |
| 06 | Demo 1 — Use Cases | D | 7:00 |
| 07 | Demo 1 — So sánh 3 mode | H | 13:00 |
| 08 | Demo 2 — Intro | C | 18:00 |
| 09 | Demo 2 — Cách hoạt động (Architecture) | F | 19:30 |
| 10 | Demo 2 — Tool Palette | D | 22:00 |
| 11 | Demo 2 — Streaming Pattern | F | 25:00 |
| 12 | Demo 2 vs Demo 1 | E | 30:00 |
| 13 | Demo 3 — Intro | C | 33:00 |
| 14 | Demo 3 — Cách hoạt động (Architecture) | F | 34:30 |
| 15 | Demo 3 — Signal Bundle + Rule Engine | E | 37:00 |
| 16 | Demo 3 vs Demo 2 vs Demo 1 | H | 44:00 |
| 17 | Khi nào dùng gì? | H | 47:00 |
| 18 | Q&A / Wrap-up | A | 50:00 |
