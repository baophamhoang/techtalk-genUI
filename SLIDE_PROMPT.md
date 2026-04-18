# Slide Generation Prompt — Generative UI Techtalk

> Copy toàn bộ nội dung trong block bên dưới vào Gamma / Tome / Beautiful.ai hoặc bất kỳ AI slide generator nào.

---

```
Create a professional tech presentation with the following visual identity and content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: Deep space purple (#0D0618) to dark navy (#0A0A1A) — dark throughout all slides
Primary gradient: violet #8B5CF6 → pink #EC4899 → sky blue #60A5FA (used on headlines, accents, icons)
Text: white (#FFFFFF) primary, light purple (#C4B5FD) secondary, gray (#94A3B8) for captions
Cards: glassmorphism — semi-transparent (#FFFFFF0D) with 1px gradient border (#8B5CF620), backdrop blur
Glow effects: soft purple/pink glow behind key visual elements and stat numbers
Background texture: subtle grid or dot pattern at 5% opacity, floating gradient orbs (blurred circles)

Typography:
- Headlines: ultra-bold (900 weight), uppercase, 40–56px — apply gradient fill (violet→pink)
- Subheadlines: semibold (600), 20–24px, white
- Body: regular (400), 14–16px, #C4B5FD
- Code/mono: JetBrains Mono or Fira Code, 13px, green #4ADE80 on dark card (#0F172A)
- Numbers/stats: 64–80px, gradient fill, ultra-bold

Decorative elements (apply to EVERY slide):
- Top-left corner: small gradient tag or pill (e.g. "GEN UI" or slide topic keyword)
- Background: 2–3 blurred gradient orbs (opacity 15–25%), different sizes
- Subtle animated-style lines or wave at slide bottom (static representation)
- Icons: filled, rounded, with soft glow matching gradient palette

3D visuals: Use abstract AI/tech 3D renders — neural network nodes, holographic spheres, 
glowing circuit patterns, or translucent geometric forms. Apply purple-pink gradient overlay.

Layout alternates between:
  A) Split: large 3D visual left 40% / text+cards right 60%
  B) Hero: centered, full-width headline with visual behind
  C) Grid: 2×2 or 3-column card layout on dark background
  D) Data: table/comparison with glowing row highlights

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESENTATION CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: "Generative UI — Khi AI Xây Giao Diện"
Language: Vietnamese
Audience: Software engineers at a tech talk
Tone: Technical, confident, show-don't-tell
Total slides: 21 (slide 21 is appendix, can be skipped)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 1 — TITLE (Hero layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "GENERATIVE UI"
Sub: "Khi AI Xây Giao Diện Thay Lập Trình Viên"
Bottom tag: "Tech Talk · 4 Demos · 2026"
Visual: large 3D holographic brain or neural network sphere, 
        centered behind text with purple-pink glow
Decorative: event name pill top-left, gradient line bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 2 — THE PROBLEM (Split layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "HARDCODE MỖI MÀN HÌNH — KHÔNG CÒN SCALE"
Left visual: chaotic code stack or infinite file tree with red warning glow
Right — 3 pain point cards (glassmorphism):
  Card 1: "500+" — "ngành × quy trình = schema viết tay"
  Card 2: "Mỗi khách hàng muốn form riêng = thêm code"
  Card 3: "UI cứng không đáp ứng ngữ cảnh realtime"
Bottom: gradient underline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 3 — WHAT IS GENUI (Hero centered)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "GENERATIVE UI LÀ GÌ?"
Large quote block (centered, gradient border):
  "Thay vì developer hardcode từng màn hình —
   hệ thống SINH RA UI động dựa trên
   dữ liệu, ngữ cảnh, hoặc ngôn ngữ tự nhiên."
Bottom row — 3 icons with glow:
  [JSON Schema]  →  [AI Model]  →  [Tool Call]
Visual: subtle holographic layers floating behind text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 4 — AGENDA (Grid 4 cards)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "4 CÁCH TIẾP CẬN · 4 ĐÁP ÁN KHÁC NHAU"
4 glassmorphism cards in a row, numbered:
  01 · RULE ENGINE      — "Tức thời, zero-cost, predictable"
  02 · AI SCHEMA        — "Linh hoạt, mọi combo, vẫn an toàn"
  03 · TOOL CALLING ⭐  — "Rich UI, design system, production-ready"
  04 · AGENTIC ⭐       — "Hội thoại, bộ nhớ, lặp lại"
Cards 03 and 04 have brighter gradient border glow (they are the stars)
Caption: "Không phải cái sau tốt hơn cái trước — đây là các đánh đổi khác nhau"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 5 — DEMO 1: RULE ENGINE (Split layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 01"
Headline: "RULE ENGINE + JSON SCHEMA RENDERER"
Left — flow diagram (vertical, connected by glow lines):
  [Chọn ngành + quy trình]
         ↓
  [Rule Engine (if-else)]
         ↓
  [Schema từ registry]
         ↓
  [Renderer → UI]
Right — code snippet card (dark, green mono):
  if (industry === "healthcare") {
    return SCHEMAS.healthcareBooking;
  }
Bottom 3-badge row: "⚡ Tức thời" · "🔒 Zero API" · "✅ 100% Predictable"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 6 — DEMO 1: STRENGTH & LIMIT (Split)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 01 · TRADE-OFF"
Headline: "KHI NÀO DÙNG RULE ENGINE?"
Left card (green glow border): "✅ Phù hợp khi..."
  · Banking, y tế — cần audit nghiêm ngặt
  · App offline
  · Số form đã biết trước và giới hạn
  · Team cần 100% kiểm soát output
Right card (amber glow border): "⚠️  Giới hạn khi..."
  · 50 ngành × 10 quy trình = 500 schema viết tay
  · Khách hàng muốn form riêng = thêm code
  · Yêu cầu thay đổi liên tục
Bottom punchline (gradient text, italic):
  "Nền tảng vững. Nhưng không scale với long-tail requirements."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 7 — DEMO 2: AI GENERATES SCHEMA (Split)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 02"
Headline: "AI SINH JSON SCHEMA"
Left — flow diagram:
  [Input: ngành + quy trình]
         ↓
  [POST /api/generate-form]
         ↓
  [AI · streamObject]
         ↓
  [JSON stream → Renderer → UI]
Right — system prompt card (dark):
  "Tạo form cho doanh nghiệp {{industry}},
   quy trình: {{workflow}}.
   Chỉ trả về JSON: { fields, actionButtons }"
Bottom badge row: "🧠 Mọi combo" · "🔄 Stream realtime" · "🛡️ JSON an toàn"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 8 — DEMO 2 vs DEMO 1 (Comparison)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 02 · vs DEMO 01"
Headline: "DEMO 2 CẢI THIỆN DEMO 1 Ở ĐÂU?"
Side-by-side comparison (2 glowing panels):
  DEMO 1 (dim glow):            DEMO 2 (bright violet glow):
  ✅ Tức thời, zero-cost        ✅ Mọi combo ngành × quy trình
  ✅ 100% predictable           ✅ Không viết tay schema
  ❌ 500 schema viết tay        ⚠️  3–8 giây API latency
  ❌ Combo mới = code mới       ⚠️  Non-deterministic output
Insight box bottom (gradient border):
  "Vẫn cùng renderer như Demo 1 — AI tự động hoá việc
   *tạo ra* schema, không thay đổi cách render."
  "Giới hạn mới: renderer là bottleneck — AI không thể tạo
   component mà renderer không biết vẽ."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 9 — TRANSITION (Hero full-bleed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full dark background, centered text only
Large gradient quote:
  "Muốn rich UI —
   product card, data table,
   stats dashboard —
   thì cần approach khác."
Decorative: large glowing orb behind text, subtle particle effect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 10 — DEMO 3: TOOL CALLING (Split)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 03 · ⭐ PRODUCTION READY"
Headline: "AI GỌI TOOLS · COMPONENT REGISTRY"
Left — flow diagram (glow lines):
  [Mô tả bằng tiếng Việt]
         ↓
  [POST /api/compose-ui]
         ↓
  [AI nhận tool registry]
         ↓
  [Tool call: { tool, args }]
         ↓
  [React component render]
Key insight box (bright pink-violet border):
  "AI không viết code.
   Nó CHỌN component và ĐIỀN tham số."
Right — tool call JSON card:
  {
    "tool": "showStatsGrid",
    "args": {
      "stats": [
        { "label": "Tổng đơn", "value": 125,
          "trend": "up" }
      ]
    }
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 11 — DEMO 3: COMPONENT REGISTRY (Grid)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 03 · REGISTRY"
Headline: "5 COMPONENTS · VÔ HẠN KẾT HỢP"
5 component cards in a row (glassmorphism, icon + name + description):
  🛍️ ProductCard   — "Hình, giá, rating, add-to-cart"
  📊 StatsGrid     — "Metrics, trends, dashboard KPIs"
  📋 DataTable     — "Bảng dữ liệu, headers, rows"
  📝 FormPanel     — "Dynamic form, nhiều loại field"
  🔔 AlertBanner   — "Thông báo success/warning/error"
Below cards — FE mapping code snippet (dark card):
  switch (tool) {
    case "showStatsGrid":   return <StatsGrid {...args} />;
    case "showProductCard": return <ProductCard {...args} />;
    // ...
  }
Caption: "Thêm component mới = thêm 1 card vào registry. AI tự học dùng qua description."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 12 — DEMO 3 vs DEMO 2 (Comparison table)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 03 · vs DEMO 02"
Headline: "DEMO 3 VƯỢT QUA GIỚI HẠN CỦA DEMO 2"
Comparison table (3 columns: Tiêu chí | Demo 2 | Demo 3):
  Loại UI        | Form fields only          | Card, table, stats, alert — bất kỳ
  AI sinh ra gì? | JSON schema (verbose)     | Tool parameters (~50 token) ✅
  Tốc độ         | 3–8s                      | 3–5s ✅
  Design nhất quán| Phụ thuộc renderer cũ   | ✅ Design system mọi lần
  Khi thêm UI mới| Mở rộng renderer          | Thêm component + tool def ✅
  Bottleneck     | Renderer (cố định)        | Registry (developer-controlled) ✅
  Sandbox/iframe | ❌ Không                  | ❌ Không
Demo 3 column highlighted with violet glow
Bottom note card (gradient border):
  "Registry constraint là FEATURE, không phải bug —
   developer quyết định UI nào AI được phép dùng."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 13 — DEMO 3: LIVE RESULT (Showcase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 03 · RESULT"
Headline: "KẾT QUẢ THỰC TẾ"
Full-width mockup: screenshot of Demo 3 output (StatsGrid + DataTable rendered)
3 floating stat badges over the screenshot:
  "~3s" · "0 lines generated code" · "Full design system"
Bottom quote (gradient italic):
  "Cùng prompt. Cùng style. Mọi lần."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 14 — DEMO 4: AGENTIC (Split)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 04 · ⭐ AGENTIC"
Headline: "AI CÓ BỘ NHỚ — HỘI THOẠI ĐA LƯỢT"
Left — chat thread mock (dark cards, alternating alignment):
  👤 "Xây dashboard quản lý đơn hàng"
  🤖 [StatsGrid] [DataTable]
  👤 "Thêm cảnh báo tồn kho thấp"
  🤖 [AlertBanner] [components trước giữ nguyên]
  👤 "Đổi doanh thu sang theo tuần"
  🤖 [StatsGrid updated]
Right — key difference card (bright glow):
  "Demo 3: Stateless
   Mỗi prompt = build lại từ đầu

   Demo 4: Stateful
   AI đọc lại toàn bộ lịch sử →
   hiểu 'cái bảng đó' là cái nào"
Bottom badge: "Cùng component registry như Demo 3"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 15 — DEMO 4 vs DEMO 3 (Code diff)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 04 · vs DEMO 03"
Headline: "MỘT THAY ĐỔI DUY NHẤT — TOÀN BỘ SỰ KHÁC BIỆT"
2 code cards side-by-side (dark bg):
  LEFT — Demo 3 (dim):
    // Chỉ gửi prompt hiện tại
    { messages: [
        { role: "user",
          content: currentPrompt }
    ]}
    // AI không biết gì về trước đó
  RIGHT — Demo 4 (bright violet glow):
    // Gửi toàn bộ lịch sử
    { messages: [
        ...conversationHistory,
        { role: "user",
          content: currentPrompt }
    ]}
    // AI đọc lại → hiểu ngữ cảnh
Below — 2 key points:
  "tool_choice: 'auto' — AI trả text, tools, hoặc cả hai"
  "Trade-off: token cost tăng theo hội thoại → cần sliding window ở production"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 16 — DEMO 4: MULTI-TURN SHOWCASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DEMO 04 · RESULT"
Headline: "GENERATE → COLLABORATE"
Full-width mockup: screenshot of agentic-ui chat interface showing 2–3 turns
  with component renders visible inline
Floating callout boxes pointing to key areas:
  Arrow → text bubble: "AI trả lời bằng text + components"
  Arrow → component pills: "Tool badges: 📊 StatsGrid · 🔔 AlertBanner"
  Arrow → suggestion chips: "Chips gợi ý refinement tiếp theo"
Bottom quote (gradient italic):
  "Demo 3 generate. Demo 4 collaborate."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 17 — ALL 4 APPROACHES COMPARISON (Data layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "TỔNG KẾT · 4 APPROACHES"
Headline: "4 APPROACHES · 4 ĐÁNH ĐỔI"
Full comparison table (5 rows × 5 columns):

  Tiêu chí         | Demo 1 Rule Engine | Demo 2 AI Schema   | Demo 3 Tool Calling | Demo 4 Agentic
  ─────────────────┼────────────────────┼────────────────────┼─────────────────────┼───────────────
  Tốc độ           | ⚡ Tức thời        | 3–8s               | 3–5s                | 3–5s/lượt
  Loại UI          | Form theo schema   | Form động          | Mọi component       | Mọi component
  Predictable      | ✅ 100%            | ⚠️  Thấp           | 🔶 Trung bình       | ⚠️  Thấp
  API cost         | $0                 | Thấp               | Thấp (~50 token)    | Tăng theo lịch sử
  Multi-turn       | ❌                 | ❌                 | ❌                  | ✅
  Design system    | ✅                 | ✅                 | ✅                  | ✅
  sandbox/iframe   | ❌ Không           | ❌ Không           | ❌ Không            | ❌ Không
  Production-ready | ✅                 | ✅ (+ validation)  | ✅                  | ✅ (+ history mgmt)

Columns 03 and 04 highlighted with gradient glow border
Bottom note: "Hệ thống production thực tế thường kết hợp nhiều pattern — không phải chọn 1"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 18 — APPLY TO YOUR PROJECT (Grid)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "ÁP DỤNG"
Headline: "BẮT ĐẦU VỚI DEMO 3 PATTERN"
4-step vertical flow (numbered, connected by glow line):
  Step 1 → "Xây 5–10 React components (ProductCard, StatsGrid...)"
  Step 2 → "Định nghĩa tool registry — plain JSON, KHÔNG dùng Zod+AI SDK*"
  Step 3 → "Route API: fetch trực tiếp OpenAI/OpenRouter với tools[]"
  Step 4 → "FE parse __TOOL__{json}__ENDTOOL__ markers → render component"
Warning card (amber glow):
  "⚠️  *Vercel AI SDK v6 bug: Zod tool schemas bị serialize
   thành type: None → 400 error.
   Fix: bypass SDK, dùng fetch trực tiếp."
Bottom checklist:
  ☐ Component registry  ☐ Tool JSON schema  ☐ 1 API route  ☐ FE parser

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 19 — DECISION GUIDE (Table)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag top-left: "DÙNG CÁI NÀO?"
Headline: "CHỌN PATTERN THEO USE CASE"
Decision table (2 columns: Tình huống | Dùng pattern):
  Form onboarding nhiều ngành          → Demo 2 (AI Schema)
  Dashboard nội bộ, design system      → Demo 3 (Tool Calling) ⭐
  Chatbot hiển thị UI phù hợp          → Demo 3 hoặc 4
  User cần lặp lại, chỉnh sửa qua chat → Demo 4 (Agentic) ⭐
  Banking, y tế — cần audit            → Demo 1 (Rule Engine)
  MVP nhanh, form đã biết trước        → Demo 1
  Talk to your data / BI tool          → Demo 4
Rows 3–4 have violet glow highlight
Bottom: "Không có silver bullet. Match the trade-off to your product constraint."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 20 — THANK YOU (Hero)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full dark background with large gradient orb glow
Large centered text: "THANK YOU"
Sub: "Source code + guides: [github link]"
Below — 4 small screenshot thumbnails of each demo in a row
Bottom: "Q&A" in gradient large text
Decorative: "• • •" motif, gradient line, floating particles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 21 — [APPENDIX] DEPRECATED (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Label: "📎 APPENDIX — bỏ qua nếu hết thời gian"
Headline: "HAI HƯỚNG ĐÃ THỬ VÀ BỎ"
2 cards side-by-side (dim, desaturated glow):
  Card 1: "❌ AI Viết JSX → iframe + Babel"
    · 10–30s (200–400 token code)
    · UI không nhất quán — không design system
    · Sandbox bị cô lập (null origin)
    · Code có thể fail silently
  Card 2: "❌ Progressive HTML 2-phase iframe"
    · Vẫn 8–15s tổng
    · 2 iframe = logic phức tạp gấp đôi
    · Delimiter <script> fragile
    · UX improve chỉ là bề ngoài
Bottom conclusion (gradient text):
  "Tool Calling (Demo 3) không cải tiến hai hướng này —
   nó loại bỏ hoàn toàn việc AI viết code."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Ghi Chú Khi Dùng Prompt

### Tool khuyên dùng theo thứ tự
1. **Gamma.app** — paste outline vào "Create from text", chọn dark theme, sau đó override màu sang deep purple + violet gradient
2. **Tome.app** — hỗ trợ dark theme tốt, gradient tự nhiên hơn
3. **Beautiful.ai** — generate xong customize theme màu

### Sau khi generate
- Override font headline → Montserrat Black hoặc Inter 900
- Replace placeholder visuals bằng screenshot thực của 4 demo app
- Slide 13 và 16 (Live Result): chụp màn hình `localhost:3005` và `localhost:3006` rồi paste vào

### Slides có thể bỏ nếu thiếu thời gian
- Slide 6 (Demo 1 trade-off detail) — gộp vào slide 5
- Slide 9 (Transition) — nói miệng thay vì hiện slide
- Slide 21 (Appendix deprecated) — chỉ show nếu ai hỏi
