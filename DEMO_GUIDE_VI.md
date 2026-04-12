# Hướng Dẫn So Sánh 3 Demo — Generative UI

> **Generative UI** là gì? Thay vì developer viết cứng từng màn hình, hệ thống *tự sinh ra* UI dựa trên dữ liệu, context hoặc ngôn ngữ tự nhiên. Ba demo dưới đây minh họa 3 mức độ "thông minh" của cách tiếp cận này.

---

## Demo 1 — Rule Engine chọn JSON Schema có sẵn

### Cách hoạt động

```
User chọn context (industry + workflow)
        ↓
Rule Engine (if-else logic)
        ↓
Chọn 1 trong N schema đã định nghĩa trước
        ↓
JSON Schema Renderer → UI
```

Toàn bộ logic nằm ở client. Không có AI, không có API call. Rule engine là một hàm `selectSchema(industry, workflow)` trả về object schema phù hợp từ một registry cố định.

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
      "patientName": { "type": "string", "title": "Họ và tên bệnh nhân" },
      "doctor":      { "type": "string", "title": "Bác sĩ", "enum": ["BS. Minh", "BS. Lan"] }
    },
    "actionButtons": [{ "label": "Đặt lịch", "variant": "primary" }]
  }
}
```

### Ưu điểm
- **Tức thì** — không có độ trễ, không cần mạng
- **Hoàn toàn dự đoán được** — cùng input luôn cho cùng output
- **Không tốn chi phí API**
- **An toàn tuyệt đối** — không có code nào được thực thi động
- **Dễ audit và test** — có thể viết unit test cho từng case

### Nhược điểm
- **Không linh hoạt** — cần N form = phải viết N schema trước
- **Không scale được với yêu cầu đặc thù** — mỗi khách hàng muốn form riêng thì phải viết tay
- **Chi phí bảo trì cao** — thêm ngành nghề mới = thêm code

### Use Cases phù hợp
- Hệ thống ngân hàng, bảo hiểm — output phải được kiểm tra kỹ
- Ứng dụng cần hoạt động offline
- Khi team muốn kiểm soát 100% những gì user thấy
- MVP nhanh với số lượng form hữu hạn và đã biết trước

---

## Demo 2 — AI tạo ra JSON Schema

### Cách hoạt động

```
User chọn context (industry + workflow)
        ↓
Gọi API: POST /api/generate-form
        ↓
AI (streamObject / streamText) — sinh ra JSON schema
        ↓
JSON stream về FE theo thời gian thực
        ↓
Parse JSON → đưa vào cùng Renderer của Demo 1 → UI
```

AI được giao một JSON schema template và được yêu cầu điền vào cho phù hợp với context. Output của AI vẫn phải tuân theo cấu trúc mà Renderer hiểu.

**Prompt gửi cho AI:**
```
Generate a form schema for a healthcare business, workflow: "booking".
Return ONLY this exact JSON structure: { "fields": [...], "actionButtons": [...] }
```

### Ưu điểm
- **Linh hoạt hơn Demo 1** — AI xử lý mọi tổ hợp industry × workflow
- **Vẫn an toàn** — JSON không thực thi, Renderer kiểm soát những gì được render
- **Output có cấu trúc** — lỗi AI thì worst case là form rỗng, không phải crash app
- **Tiết kiệm thời gian phát triển** — không cần viết tay từng schema

### Nhược điểm
- **Không dự đoán được** — cùng input có thể cho output khác nhau mỗi lần
- **Vẫn bị giới hạn bởi Renderer** — AI không thể tạo ra component type nào Renderer chưa biết
- **Độ trễ API** — thường 3–8 giây
- **Chi phí token** — mỗi generation tiêu tốn API credits

### Use Cases phù hợp
- SaaS platform phục vụ nhiều ngành nghề khác nhau (fintech, logistics, healthcare...)
- Internal tools builder — nhân viên tự tạo form theo workflow riêng
- Khi số lượng tổ hợp (industry × workflow) quá lớn để viết tay

---

## Demo 3 — AI viết trực tiếp React Code

### Cách hoạt động

```
User nhập mô tả bằng tiếng Việt
        ↓
Gọi API: POST /api/generate-ui
        ↓
AI (streamText) — viết React JSX code, stream về FE từng ký tự
        ↓
BE song song: tích lũy code → buildPreviewHtml() → lưu vào memory store
        ↓
Cuối stream: BE gắn __PREVIEW_ID__{id}__END__ vào cuối
        ↓
FE parse previewId → set <iframe src="/api/preview/{id}" sandbox="allow-scripts">
        ↓
Iframe load HTML từ BE → Babel transpile JSX → React render → Live UI
```

**Sơ đồ bảo mật của iframe:**
```
sandbox="allow-scripts" (không có allow-same-origin)
        ↓
Iframe nhận null origin
        ↓
Không thể đọc cookie/localStorage của app
Không thể gọi API của app với session của user
Không thể truy cập window.parent
```

### Ưu điểm
- **Không giới hạn** — mọi UI đều có thể được mô tả và tạo ra
- **Không cần Registry** — AI tự quyết định cần component gì
- **Hiệu ứng demo mạnh** — user thấy code được viết ra từng ký tự
- **Ngôn ngữ tự nhiên** — mô tả bằng tiếng Việt là đủ

### Nhược điểm
- **Chậm nhất** — React code dài hơn JSON nhiều (100–300 dòng vs 20–50 dòng)
- **Tốn token nhất** — chi phí API cao hơn đáng kể
- **Không ổn định** — AI có thể sinh code lỗi cú pháp
- **Rủi ro bảo mật** — code được thực thi động (xem phần bảo mật bên dưới)
- **Không audit được** — không thể biết trước output sẽ là gì

### Use Cases phù hợp
- Công cụ prototyping nội bộ
- No-code / low-code builder cho developer
- Demo, R&D, proof-of-concept
- Trường hợp cần UI hoàn toàn độc đáo không thể template hóa

---

## Bảng so sánh tổng hợp

| Tiêu chí | Demo 1 — Rule Engine | Demo 2 — AI Schema | Demo 3 — AI Code |
|---|---|---|---|
| **Tốc độ** | Tức thì | 3–8 giây | 10–30 giây |
| **Linh hoạt** | Chỉ schema có sẵn | Mọi tổ hợp field | Mọi UI tưởng tượng được |
| **Dự đoán được** | 100% | Thấp | Rất thấp |
| **Chi phí API** | $0 | Thấp (JSON nhỏ) | Cao (code dài) |
| **Bảo mật** | Cao nhất | Cao | Trung bình (cần sandbox) |
| **Khi AI lỗi** | Không áp dụng | Form rỗng | Hiện lỗi đỏ trong iframe |
| **Phù hợp production** | Có | Có (với validation) | Cần thêm hạ tầng |
| **Công nghệ chính** | Rule engine + Registry | `streamText` + JSON.parse | `streamText` + Babel + iframe |

---

## Câu hỏi thường gặp (FAQ)

### Về kiến trúc chung

**Q: Generative UI khác gì AI Chatbot thông thường?**

Chatbot trả về văn bản. Generative UI trả về *cấu trúc có thể render được* — JSON schema, React component, hay HTML. User không đọc output, họ *tương tác* với nó. Đây là sự khác biệt cốt lõi.

---

**Q: Tại sao Demo 1 và 2 dùng JSON Schema thay vì để AI viết luôn HTML?**

JSON Schema là một lớp abstraction an toàn. Renderer kiểm soát 100% những gì được đưa lên DOM, nên không có nguy cơ XSS. Ngoài ra, schema dễ validate, dễ lưu trữ, và dễ migrate sau này.

---

**Q: `streamText` vs `streamObject` — khi nào dùng cái nào?**

- **`streamText`**: Khi output là văn bản tự do hoặc code. FE nhận raw string, tự xử lý.
- **`streamObject`**: Khi output cần khớp một schema Zod cụ thể. SDK tự validate và chỉ emit partial objects hợp lệ. Demo 2 trong thực tế nên dùng `streamObject` — demo này dùng `streamText` để minh họa việc parse thủ công.

---

### Về Demo 1

**Q: Rule engine có thể scale được không khi số lượng schema tăng lên?**

Được, nhưng đây là vấn đề của mọi rule engine — độ phức tạp tăng tuyến tính theo số case. Giải pháp thực tế: lưu schema trong database thay vì hardcode, dùng tag/category để filter. Rule engine vẫn là code, chỉ là data source được externalize.

---

**Q: Có thể kết hợp Demo 1 và 2 không?**

Được. Pattern phổ biến: Demo 1 cho các workflow phổ biến (80% cases), Demo 2 cho edge case hoặc custom request. Đây là "AI as fallback" — dùng rule engine trước, nếu không tìm được schema phù hợp mới gọi AI.

---

### Về Demo 2

**Q: Nếu AI trả về JSON sai format thì sao?**

Hiện tại: try/catch khi parse, nếu lỗi thì form không render. Trong production: nên dùng `streamObject` với Zod schema để SDK tự validate. Nếu dùng `streamText`, cần thêm bước sanitize và validate trước khi đưa vào Renderer.

---

**Q: Tại sao vẫn còn bị giới hạn bởi Renderer nếu AI đã "thông minh" hơn?**

Vì Renderer chỉ biết render những component type nó đã được lập trình: `string`, `number`, `boolean`, `object`. AI có thể muốn tạo một date picker hay file upload, nhưng nếu Renderer chưa có component tương ứng thì field đó bị bỏ qua. Demo 3 giải quyết vấn đề này bằng cách bỏ Renderer hoàn toàn.

---

**Q: Streaming JSON có thực sự hữu ích ở đây không?**

Với Demo 2, streaming cho phép FE bắt đầu parse và render ngay khi nhận được đủ JSON (progressive render). Tuy nhiên, vì phải parse JSON hoàn chỉnh, thực tế thì phải đợi stream kết thúc. Lợi ích thực sự là UX — user thấy JSON "chạy ra" trong panel bên phải, thay vì đợi chờ rồi mới thấy cả form xuất hiện.

---

### Về Demo 3

**Q: Tại sao phải đợi code xong mới thấy preview?**

Babel compile toàn bộ script một lần. JSX chưa hoàn chỉnh sẽ throw syntax error. Không có cách render "partial React component". Giải pháp duy nhất là đợi stream kết thúc. Animation code stream bên trái là cách giữ UX không bị "chết" trong lúc chờ.

---

**Q: Iframe có thể ăn cắp dữ liệu của app không?**

Với `sandbox="allow-scripts"` và **không có** `allow-same-origin`, iframe nhận **null origin** — không thể đọc cookie, localStorage của app, không thể gọi API với session của user. Đây là cơ chế bảo vệ tương tự Claude Artifacts.

Điều sandbox **không** ngăn được: code trong iframe vẫn có thể `fetch()` đến server bên ngoài. Nếu user nhập vào form do AI tạo ra, dữ liệu đó có thể bị gửi đi ngoài ý muốn. Giải pháp production: thêm `Content-Security-Policy: connect-src 'none'` vào response header của preview endpoint.

---

**Q: Claude cũng dùng cách này — họ xử lý bảo mật thế nào?**

Claude phục vụ Artifacts từ một domain riêng biệt (`artifacts.claude.ai`) thay vì cùng domain với app. Cross-origin thật sự, không chỉ là null origin. Ngoài ra, Anthropic chạy output qua content moderation trước khi render, và không có user data nào tồn tại trong execution context của artifact. Vercel v0 và bolt.new dùng WebContainers (Node.js chạy trong WebAssembly) — isolation ở mức OS process, mạnh hơn iframe nhiều.

---

**Q: Demo 3 có thể dùng production không?**

Được, nhưng cần thêm:
1. **Separate domain** cho preview (không cùng origin với app)
2. **Content moderation** trên AI output trước khi store
3. **Rate limiting** trên `/api/generate-ui`
4. **Timeout** cho generation (tránh request treo)
5. **Không đưa sensitive data** vào execution context của iframe

---

**Q: Tại sao lưu HTML trên BE thay vì để FE tự build và dùng srcDoc?**

Hai lý do:
1. **Kiến trúc sạch hơn**: FE không cần biết cách build HTML preview, không cần import Babel config hay sanitize logic
2. **Preview có URL thật**: `/api/preview/{id}` có thể được share, mở tab mới, hoặc embed ở nơi khác

Bảo mật thực tế là như nhau — cả hai approach đều đạt null origin với `sandbox="allow-scripts"`.

---

## Lộ trình phát triển tự nhiên

```
Demo 1 (Rule Engine)
    ↓  "Quá nhiều schema phải viết tay"
Demo 2 (AI Schema)
    ↓  "Renderer vẫn giới hạn, muốn tạo UI phức tạp hơn"
Demo 3 (AI Code)
    ↓  "Cần production-ready với security & reliability"
Production Architecture:
  - Separate preview domain
  - Output moderation pipeline
  - Schema validation layer (Demo 2 style) cho common cases
  - Code generation (Demo 3 style) cho edge cases
  - Rate limiting, abuse monitoring
```

Ba demo không phải là "cái sau tốt hơn cái trước" — chúng là ba **trade-off khác nhau**. Hệ thống production thực tế thường kết hợp cả ba: rule engine cho core flows, AI schema cho flexibility, AI code cho edge cases.
