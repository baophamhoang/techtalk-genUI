# Kịch Bản Demo — Generative UI

> Tài liệu này dành cho presenter. Mỗi demo có: intro nói với audience, prompt mẫu cần gõ, điểm cần chỉ ra, và punchline chốt.

---

## Trước Khi Bắt Đầu

- Mở sẵn 4 tab browser: `localhost:3101`, `localhost:3000`, `localhost:3005`, `localhost:3006`
- Tăng font size browser lên 125% để audience nhìn rõ
- Xoá hết cookie/localStorage nếu chạy lại demo
- Kiểm tra network (AI demos cần internet)

---

## Demo 1 — Rule Engine (localhost:3101)

### Intro (nói với audience)
> "Demo đầu tiên — không có AI, không có API call. Toàn bộ logic chạy trên client. Tôi chọn ngành và quy trình, rule engine chọn đúng schema, renderer vẽ UI. Xem tốc độ."

### Flow demo

1. Chọn **"Y tế"** → **"Đặt lịch khám"** → click Generate
   - *Chỉ vào:* "Tức thời — không có loading spinner, không có network request"

2. Chọn **"Tài chính"** → **"Mở tài khoản"** → click Generate
   - *Chỉ vào:* "Form khác hoàn toàn — cùng renderer, khác schema"

3. Mở DevTools → Network tab → chọn lại một combo bất kỳ
   - *Chỉ vào:* "Không có request nào — 100% client-side"

### Punchline
> "Đây là nền tảng. Predictable, zero-cost, offline-ready. Vấn đề duy nhất: mỗi form phải viết tay. Khi có 50 ngành × 10 quy trình = 500 schema — không ai làm nổi."

---

## Demo 2 — AI Sinh JSON Schema (localhost:3000)

### Intro
> "Demo 2 giải quyết vấn đề scale của Demo 1 — thay vì viết tay 500 schema, để AI sinh ra. Nhưng output vẫn là JSON, vẫn qua cùng renderer an toàn."

### Flow demo

1. Chọn **"Logistics"** → **"Theo dõi đơn hàng"** → click Generate
   - *Chỉ vào thanh stream đang chạy:* "JSON đang stream về realtime — thấy form xuất hiện dần"
   - *Sau khi xong:* "AI tự điền tên trường, loại input, label phù hợp với logistics"

2. Click Generate lần nữa với **cùng input**
   - *Chỉ vào:* "Lần này AI sinh ra hơi khác — non-deterministic. Đây là đánh đổi."

3. Thử combo **"Bất động sản"** → **"Thuê mặt bằng"**
   - *Chỉ vào:* "Combo này không có trong Demo 1. AI xử lý được mọi tổ hợp."

### Punchline
> "Linh hoạt hơn, scale tốt hơn. Nhưng vẫn bị giới hạn bởi renderer — AI chỉ sinh được những field mà renderer biết vẽ. Muốn rich UI hơn — product card, chart, data table — thì cần approach khác."

---

## Demo 3 — Tool Calling (localhost:3005)

### Intro
> "Đây là approach production-viable nhất hôm nay. Thay vì AI viết code, AI *chọn component*. Tôi mô tả UI bằng tiếng Việt bình thường — AI quyết định dùng component nào và điền dữ liệu gì."

### Flow demo

**Prompt 1:**
```
Dashboard quản lý đơn hàng tuần này
```
- *Trong lúc chờ:* "AI đang gọi tools — nó không viết JSX, không viết HTML. Nó chỉ chọn `showStatsGrid` và `showDataTable` và điền tham số."
- *Khi component xuất hiện:* "3 giây. Component render trực tiếp trong React — không iframe, không Babel, không sandbox."
- *Chỉ vào panel trái:* "Đây là tool call AI trả về — JSON thuần, không phải code"

**Prompt 2:**
```
Thêm cảnh báo hàng sắp hết
```
- *Chỉ vào:* "AI gọi `showAlertBanner` với type warning — nó biết ngữ cảnh kho hàng từ prompt trước"

**Prompt 3 (optional, nếu còn thời gian):**
```
Card sản phẩm tai nghe Sony WH-1000XM5
```
- *Sau khi render:* "Image, price, rating, add-to-cart — một tool call, một component, 3 giây"

### Điểm kỹ thuật cần nhấn mạnh
- **Không sandbox:** "Component này là React component thật — có thể gắn `onClick`, gọi API, dùng state bình thường"
- **Design system:** "Mọi component đến từ cùng thư viện — spacing, color, font luôn nhất quán dù AI sinh ra"
- **AI SDK bug:** Nếu ai hỏi về tech stack — "Chúng tôi bypass Vercel AI SDK vì có bug serialization, gọi thẳng OpenRouter bằng fetch"

### Punchline
> "Demo 3 giải quyết câu hỏi production quan trọng nhất: làm sao để AI sinh UI đủ nhanh, đủ nhất quán, và đủ an toàn để ship cho user thật. Câu trả lời: đừng để AI viết code — để nó chọn component."

---

## Demo 4 — Agentic UI (localhost:3006)

### Intro
> "Demo 3 là một lần — một prompt, một output. Demo 4 là hội thoại. AI có bộ nhớ. Tôi xây dashboard, rồi yêu cầu chỉnh sửa bằng ngôn ngữ tự nhiên — AI biết mình đã xây gì và update đúng chỗ."

### Flow demo

**Turn 1:**
```
Dashboard quản lý đơn hàng tuần này
```
- *Khi render xong:* "Stats và table — giống Demo 3. Nhưng giờ xem điều tiếp theo."

**Turn 2** (click chip hoặc gõ):
```
Thêm cảnh báo tồn kho thấp
```
- *Chỉ vào:* "AI biết mình đã có StatsGrid và DataTable. Nó thêm AlertBanner *mà không xoá những gì trước*. Đây là context awareness."

**Turn 3:**
```
Đổi chỉ số doanh thu sang hiển thị theo tuần thay vì tháng
```
- *Chỉ vào StatsGrid update:* "AI cập nhật đúng cái metric đó — nó hiểu 'chỉ số doanh thu' tham chiếu đến gì trong lịch sử hội thoại"

**Turn 4 (optional):**
```
Làm form đặt hàng nhanh
```
- *Chỉ vào:* "AI thêm FormPanel vào conversation — mix được nhiều loại component trong cùng một thread"

### Điểm kỹ thuật cần nhấn mạnh
- **Full history mỗi request:** "Mỗi lượt gửi toàn bộ messages[] lên server — AI 'nhớ' vì nó đọc lại lịch sử, không phải server-side session"
- **tool_choice: auto:** "AI có thể trả lời bằng text (hỏi clarification), tools (xây component), hoặc cả hai"
- **Trade-off:** "Token cost tăng theo hội thoại — production cần sliding window hoặc compress history"

### Punchline
> "Demo 3 và 4 dùng cùng component registry, cùng tool schema. Sự khác biệt chỉ là: Demo 3 generate, Demo 4 collaborate. Tùy use case bạn chọn model nào phù hợp hơn."

---

## So Sánh Trực Tiếp (Closing Slide / Q&A)

Nếu audience hỏi "Dùng cái nào?", dùng bảng này:

| Tình huống | Dùng pattern |
|---|---|
| Form onboarding cho nhiều ngành khác nhau | Demo 2 (AI Schema) |
| Dashboard nội bộ với design system cố định | Demo 3 (Tool Calling) |
| Chatbot hỗ trợ khách hàng hiện thị UI phù hợp | Demo 3 hoặc 4 |
| No-code builder cho end user | Demo 4 (Agentic) |
| Luồng tần suất cao, cần audit (banking, y tế) | Demo 1 (Rule Engine) |
| MVP nhanh với form đã biết trước | Demo 1 |
| "Talk to your data" / BI tool | Demo 4 |

### Câu hỏi thường gặp từ audience

**"AI có thể inject XSS không?"**
> "Không. AI chỉ điền giá trị string/number vào props. React escape tự động. Không có `dangerouslySetInnerHTML`, không `eval`."

**"Sao không dùng Vercel AI SDK?"**
> "AI SDK v6 có bug — Zod tool schemas bị serialize thành `type: None`, OpenAI trả 400. Bypass bằng fetch trực tiếp là sạch hơn."

**"Minimax / model khác có dùng được không?"**
> "Tool calling cần model support function calling. MiniMax M2.7 support tốt, Claude, Gemini đều được. Đã dùng direct fetch thay vì AI SDK để tránh serialization issues."

**"Chi phí thế nào?"**
> "Demo 2/3 dùng ~50-200 token mỗi request (chỉ tham số tool, không phải code). MiniMax M2.7 giá khoảng $0.10/1M input token — rẻ hơn GPT-4o-mini."
