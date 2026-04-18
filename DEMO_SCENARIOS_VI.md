# Kịch Bản Demo — Generative UI

> Tài liệu này dành cho presenter. Mỗi demo có: intro nói với audience, prompt mẫu cần gõ, điểm cần chỉ ra, và punchline chốt.

---

## Trước Khi Bắt Đầu

- Mở sẵn 3 tab browser: `localhost:3101`, `localhost:3102`, `localhost:3103`
- Tăng font size browser lên 125% để audience nhìn rõ
- Xoá hết cookie/localStorage nếu chạy lại demo
- Kiểm tra network (AI demos cần internet)

---

## Demo 1 — Declarative GenUI (localhost:3101)

### Intro (nói với audience)
> "Demo đầu tiên — AI nhận trigger, sinh JSON Schema, renderer vẽ form. Có hai chế độ: System Events (AI phản ứng với sự kiện hệ thống như IoT) và User Context (chọn ngành + quy trình, AI tạo form phù hợp)."

### Tab 1 — System Events

1. Click một event bất kỳ (VD: **"Cảm biến nhiệt độ"**)
   - *Chỉ vào panel Reasoning:* "AI đang suy nghĩ — thấy luồng reasoning trước khi có output"
   - *Khi form xuất hiện:* "JSON schema stream về realtime, renderer vẽ ngay"

2. Mở DevTools → Network tab → click event khác
   - *Chỉ vào:* "Có API call — không phải rule engine. AI thật, schema thật."

### Tab 2 — User Context

1. Chọn **"Y tế"** → **"Đặt lịch khám"** → click Generate
   - *Chỉ vào:* "AI sinh form phù hợp — label tiếng Việt, đúng loại field"

2. Thử **"Logistics"** → **"Theo dõi đơn hàng"**
   - *Chỉ vào:* "Combo này chưa từng được code sẵn — AI xử lý mọi tổ hợp"

### Punchline
> "Declarative GenUI: AI nhận trigger, sinh schema, renderer an toàn. Nhưng renderer bị giới hạn — chỉ sinh được form field đơn giản. Muốn rich UI hơn — product card, chart, data table — cần approach khác."

---

## Demo 2 — Tool Calling (localhost:3102)

### Intro
> "Đây là approach production-viable nhất hôm nay. Thay vì AI viết code, AI *chọn component*. Tôi mô tả UI bằng tiếng Việt bình thường — AI quyết định dùng component nào và điền dữ liệu gì."

### Flow demo

**Prompt 1:**
```
Dashboard quản lý đơn hàng tuần này
```
- *Trong lúc chờ:* "AI đang gọi tools — nó không viết JSX, không viết HTML. Nó chỉ chọn `showStatsGrid` và `showDataTable` và điền tham số."
- *Khi component xuất hiện:* "3 giây. Component render trực tiếp trong React."
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
> "Demo 2 giải quyết câu hỏi production quan trọng nhất: làm sao để AI sinh UI đủ nhanh, đủ nhất quán, và đủ an toàn để ship cho user thật. Câu trả lời: đừng để AI viết code — để nó chọn component."

---

## Demo 3 — Agentic UI (localhost:3103)

### Intro
> "Demo 2 là một lần — một prompt, một output. Demo 3 là hội thoại. AI có bộ nhớ. Tôi xây dashboard, rồi yêu cầu chỉnh sửa bằng ngôn ngữ tự nhiên — AI biết mình đã xây gì và update đúng chỗ."

### Flow demo

**Turn 1:**
```
Dashboard quản lý đơn hàng tuần này
```
- *Khi render xong:* "Stats và table — giống Demo 2. Nhưng giờ xem điều tiếp theo."

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
> "Demo 2 và 3 dùng cùng component registry, cùng tool schema. Sự khác biệt chỉ là: Demo 2 generate, Demo 3 collaborate. Tùy use case bạn chọn model nào phù hợp hơn."

---

## So Sánh Trực Tiếp (Closing Slide / Q&A)

Nếu audience hỏi "Dùng cái nào?", dùng bảng này:

| Tình huống | Dùng pattern |
|---|---|
| Form onboarding cho nhiều ngành khác nhau | Demo 1 (Declarative GenUI) |
| Dashboard nội bộ với design system cố định | Demo 2 (Tool Calling) |
| Chatbot hỗ trợ khách hàng hiện thị UI phù hợp | Demo 2 hoặc 3 |
| No-code builder cho end user | Demo 3 (Agentic) |
| Luồng tần suất cao, cần audit (banking, y tế) | Demo 1 (Declarative GenUI) |
| MVP nhanh với form đã biết trước | Demo 1 |
| "Talk to your data" / BI tool | Demo 3 |

### Câu hỏi thường gặp từ audience

**"AI có thể inject XSS không?"**
> "Không. AI chỉ điền giá trị string/number vào props. React escape tự động. Không có `dangerouslySetInnerHTML`, không `eval`."

**"Sao không dùng Vercel AI SDK?"**
> "AI SDK v6 có bug — Zod tool schemas bị serialize thành `type: None`, OpenAI trả 400. Bypass bằng fetch trực tiếp là sạch hơn."

**"Minimax / model khác có dùng được không?"**
> "Tool calling cần model support function calling. MiniMax M2.7 support tốt, Claude, Gemini đều được. Đã dùng direct fetch thay vì AI SDK để tránh serialization issues."

**"Chi phí thế nào?"**
> "Demo 1/2/3 đều dùng ~50-200 token mỗi request (chỉ tham số tool hoặc JSON schema, không phải code). MiniMax M2.7 giá khoảng $0.10/1M input token — rất rẻ cho production."
