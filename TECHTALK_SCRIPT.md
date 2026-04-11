# Kịch bản báo cáo: GenUI & Server-Driven UI Tech Talk

Tài liệu này chứa kịch bản và cấu trúc logic để thuyết minh về sức mạnh của Generative UI (GenUI) và Server-Driven UI (SDUI).

---

## Phần Mở Đầu: Lý thuyết cốt lõi
- **Truyền thống:** Frontend Dev phải code cứng từng nút bấm, dropdown. Mỗi khi Product Requirement thay đổi, quy trình đòi hỏi phải Code -> Test -> Đợi App Store Review -> Deploy.
- **Tiến hoá thành SDUI:** Tách bạch hoàn toàn UI (View) ra khỏi Business Logic. Frontend trở thành một "Tấm bạt trống" (Blank Canvas) chỉ biết vẽ những gì Backend gửi thông qua JSON schema.

---

## Demo 1: The Foundation - Server-Driven UI & Event Triggers
**(Note: Không sử dụng Chat ở màn này)**

**Mục tiêu:** Chứng minh kiến trúc "Registry" - nơi UI được định hình tự động nhờ dữ kiện (Data Payload) mà không cần code React.

**Cách dẫn dắt:**
Khán giả thường nghĩ GenUI chỉ dành cho Chatbot. Hãy phá vỡ định kiến đó!
- Hãy nhấn vào **Event 1 (Product Configurator)** để cho thấy hệ thống Website Routing có thể tự tính toán người dùng muốn mua gì và bắn ra giao diện Custom PC.
- Hãy nhấn vào **Event 2 (Interactive Triage)** để thể hiện luồng IoT: Cảm biến ô tô báo lỗi, truyền lên Backend, và Backend tự động nhả về điện thoại người dùng một Form chẩn đoán y hệt lỗi đó. 
- Hãy nhấn vào **Event 3 (Data Extraction)** để chứng minh Workflow Human-in-the-Loop: Hệ thống tự trích xuất hoá đơn, nhả form ra cho tài xế/người dùng xác nhận chia tiền trước khi bấm "Gửi yêu cầu thanh toán".

**Câu Chốt Demo 1:** 
> *"Những gì các bạn vừa xem là Server-Driven UI thuần tuý (bỏ qua chat). Chúng ta có thể cho một Admin ngồi kéo thả portal để tạo ra các Schema này. NHƯNG, chuyện gì sẽ xảy ra nếu chúng ta thay thế anh Admin đó bằng một con AI tự động tính toán, suy nghĩ và nói chuyện trực tiếp với User? Đó chính là lúc GenUI thực thụ xuất hiện!"*

---

## Demo 2: Agentic Orchestration & AI SDK
*(Chỗ trống dành cho kịch bản Demo 2: Vercel AI SDK)*
- **Vấn đề giải quyết:** "Wall of Text". AI thông thường chỉ biết xuất Markdown. Người dùng không thể tương tác, click hay nhấn nút.
- **Giải pháp:** Vercel AI SDK biến Chatbot thành giao diện ứng dụng. Khi người dùng chat "Tôi muốn đặt vé máy bay", hệ thống không liệt kê văn bản mà nhả ra Component `FlightCard` bấm được vào thẳng trong kênh Chat.
- **Kịch bản Demo:** (Bạn sẽ trình diễn tính năng này tại đây)

---

## Demo 3: Multi-Model Capabilities & The Ecosystem
*(Chỗ trống dành cho kịch bản Demo 3: Multi-Model)*
- **Vấn đề giải quyết:** Bị trói buộc vào một hệ sinh thái (Vendor Lock-in). Hôm nay OpenAI thông minh nhất, ngày mai Claude của Anthropic rẻ hơn. Nếu bạn hard-code UI vào riêng OpenAI, bạn sẽ không đổi sang Claude được.
- **Giải pháp:** Vì kiến trúc GenUI (từ Demo 1) chuẩn hóa hoàn toàn giao diện qua JSON, Backend có thể tuỳ ý Swap các model GPT-4, Claude, Gemini. Frontend hoàn toàn không quan tâm ai tạo ra Schema. Giao diện vẫn render hoàn hảo.
- **Kịch bản Demo:** (Bạn sẽ trình diễn tính năng này tại đây)

---

## Q&A: Những câu hỏi hóc búa cần chuẩn bị
**1. Tại sao không code sẵn 3 form tĩnh bằng React cho nhanh?**
*Trả lời:* Vì trí tưởng tượng và Context của End-User là vô tận. Form tĩnh giải quyết được luồng đăng nhập (chắc chắn luôn tĩnh). Nhưng khi khách hàng yêu cầu AI "Tạo cho tôi một form đăng ký giải đấu Poker gia đình", bạn không thể chuẩn bị sẵn file `PokerForm.tsx` trên máy chủ được. GenUI giải quyết bài toán "Long-tail requirements".

**2. Làm sao đảm bảo Form an toàn khi AI bị ảo giác (Hallucination)?**
*Trả lời:* Dùng Structured Outputs (Tool Calling) kết hợp với Zod schemas. AI không tự ý bịa data bừa bãi, nó buộc phải map thông tin vào Schema JSON do Backend lập trình từ trước. UI (giao diện) có thể tuỳ biến, nhưng Payload (Dữ liệu Submit) buộc phải theo chuẩn Type-Safety của API.
