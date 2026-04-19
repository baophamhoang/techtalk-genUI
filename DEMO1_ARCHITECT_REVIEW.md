# Demo 1 — Architect Review

**Reviewer role:** Software Architect
**Scope:** `apps/json-render-demo` — code + narrative trong `TECHTALK_SCRIPT.md`, `DEMO_SCENARIOS_VI.md`, `DEMO_GUIDE_VI.md`
**Verdict sơ bộ:** Demo 1 hiện tại **chưa đủ** để defend thesis "GenUI khác gì với SDUI / form schema server lưu sẵn". Phần lớn lập luận của techtalk sẽ rơi vào kịch bản "bánh vẽ" nếu không sửa lại framing + bổ sung một mode baseline.

---

## 1. Critical finding — Code KHÔNG match với intent ban đầu

Ba nguồn tài liệu mô tả Demo 1 theo **ba cách khác nhau**:

| Nguồn | Demo 1 được mô tả là gì |
|---|---|
| `DEMO_GUIDE_VI.md` (cũ hơn) | "Rule Engine chọn JSON Schema có sẵn" — SDUI thuần, không AI, không API call |
| `TECHTALK_SCRIPT.md` | "Server-Driven UI thuần túy (bỏ qua chat)" với 3 event triggers (Product Configurator, Interactive Triage, Data Extraction) |
| `DEMO_SCENARIOS_VI.md` (mới nhất) | "Declarative GenUI" — AI sinh schema cho cả System Events lẫn User Context |
| **Code thật (`App.tsx`)** | Gọi MiniMax M2.7 qua OpenRouter cho **mọi** trigger — kể cả system events |

→ **Hệ quả:** Nếu presenter đọc đúng theo `TECHTALK_SCRIPT.md` ("đây là SDUI thuần, chưa dùng AI"), audience mở DevTools sẽ thấy API call đến `openrouter.ai` — **lập luận sập ngay tại chỗ**. Đồng thời thesis chính của techtalk — so sánh SDUI với GenUI — mất đi baseline để so sánh.

**→ Đây là rủi ro #1 cần fix trước khi lên sân khấu.**

---

## 2. Đánh giá thesis "GenUI ≠ form schema mà server lưu sẵn"

Thesis của bạn về mặt học thuật là **đúng và quan trọng**:

- **SDUI:** schema được viết tay bởi admin / BE dev, lưu trong DB/CMS, client chỉ render. Deterministic, auditable, cache-friendly.
- **GenUI:** schema được **sinh ra runtime** (bởi AI hoặc rule engine) dựa trên ngữ cảnh mới chưa từng được author. Non-deterministic, linh hoạt, đánh đổi bằng latency + cost + validation risk.

Vấn đề là Demo 1 hiện **chỉ show được vế GenUI**. Không có UI nào cho audience thấy:

- Cùng một form "Healthcare + Booking" nếu có sẵn schema trên server thì render trông thế nào, tốc độ bao nhiêu, chi phí $0.
- Khi nào GenUI thật sự thắng SDUI — điểm break-even về số lượng schema × tần suất sử dụng × chi phí maintain.

Không có A/B visual này, audience không có cách nào tự rút kết luận — họ chỉ thấy "AI stream ra cái form" và mặc định đó là magic trick, chưa hiểu trade-off.

---

## 3. Đánh giá từng use case — thực tế hay "bánh vẽ"?

### Tab "System Events"

**Event 1 — Product Configurator (PC builder):** ❌ Anti-pattern

- PC builder là domain **có catalog hữu hạn** (GPU × RAM × warranty × color). Tổ hợp hữu hạn → cache được → LLM không thêm value.
- Trong production, form này phải **sync với inventory** (hết hàng thì ẩn option). AI không có data đó → hallucination rủi ro (gợi ý linh kiện không bán, giá sai).
- Latency 3–8s vs `<50ms` của form tĩnh → UX tệ hơn rõ rệt.
- **Kết luận:** SDUI + rule engine đánh bại GenUI ở đây trên mọi trục (speed / cost / correctness). Use case này củng cố phe "bánh vẽ".

**Event 2 — Interactive Triage (IoT error code P0300):** ⚠️ Cần cẩn thận

- OBD-II error codes **map 1:1** với quy trình chẩn đoán đã chuẩn hoá (SAE J2012). Đây là safety-adjacent domain.
- Giao cho LLM sinh form chẩn đoán = rủi ro hallucination câu hỏi sai → kỹ thuật viên làm sai quy trình → trách nhiệm pháp lý.
- Industry thực tế (Bosch, Snap-on, Launch) đều dùng rule-based + static form kéo từ catalog chính thức.
- **Kết luận:** Là ví dụ tốt để *gợi* ý tưởng "IoT triggers form" nhưng nếu bị audience đào sâu, lập luận "GenUI tốt hơn rule engine cho case này" sẽ khó biện minh. Nên framing lại: "đây là trigger thú vị, **production vẫn nên rule-based**, GenUI chỉ dành cho long-tail".

**Event 3 — OCR Bill Splitting:** ✅ Use case hợp lý **nhất** trong 3 cái

- Dữ liệu extract từ OCR **không đoán trước được** (mỗi hoá đơn khác nhau) → field list thực sự dynamic (item × N).
- Người dùng cần UI chỉnh sửa từng line item → cấu trúc form phụ thuộc input.
- Tuy nhiên: chú ý rằng **structure của form vẫn fixed** (item list + tổng + action); chỉ có **số lượng row** là dynamic — điều này giải được bằng form tĩnh + `.map()` over items. Không thật sự cần GenUI.
- **Kết luận:** Narrative tốt nhưng vẫn chưa phải killer use case cho GenUI.

### Tab "User Context" — Industry × Workflow

- 6 industries × 6 workflows = **36 tổ hợp**. Con số này **hoàn toàn pre-generate + cache được** (chạy 1 batch job, lưu 36 schema vào DB, chi phí $0 mỗi request).
- Argument "long-tail requirements" chỉ valid khi user **tự gõ prompt tự do** (ví dụ "form đăng ký giải đấu poker gia đình"). Matrix 6×6 không phải long-tail.
- Label "Industry" và "Workflow" generic, field output cũng generic ("tên khách hàng", "ghi chú") → demo không show được AI hiểu domain sâu đến mức nào.

**→ Đề xuất:** Thêm một textbox "Mô tả form của bạn" cho user tự gõ → mới thật sự thể hiện GenUI solve được cái SDUI **không thể** author trước.

---

## 4. Technical review — kiến trúc & code

### 4.1. Security / production-readiness gap

| Vấn đề | Mức độ | Ghi chú |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` được inject vào client bundle | 🔴 High | Bất kỳ ai mở DevTools → Sources đều xoay được API key. OK cho demo với key throwaway, nhưng **phải cảnh báo audience** đừng copy pattern này. Production: key phải ở BE proxy. |
| Không validate schema AI trả về | 🔴 High | `JSON.parse(accumulated.slice(...))` rồi push thẳng vào `Renderer`. Nếu AI hallucinate `type` lạ hoặc payload prototype pollution (`__proto__`), behavior không kiểm soát. Thesis Q&A nói "dùng Zod" — code **không có Zod**. Đây là credibility gap lớn. |
| Không có submit handler thật | 🟡 Medium | `actionButtons` chỉ `alert(...)`. Claim "payload type-safe" không được demo chứng minh. |
| Không có fallback khi AI fail | 🟡 Medium | User thấy "Error: ..." text đỏ, không có retry / graceful degrade về schema mặc định. `DEMO_GUIDE_VI.md` tự nói "production cần fallback về Demo 1" — nhưng Demo 1 này chính là AI. |
| Parse JSON bằng indexOf `{...}` | 🟢 Low | Fragile, sẽ crash nếu AI trả về trailing text có brace. OK cho demo. |

### 4.2. Renderer (`catalog.tsx`) quá hạn chế

Registry chỉ support: `string` (text / select), `number`, `boolean`, `array` (multiselect), `object`. Thiếu:

- Date / datetime picker (critical cho "đặt lịch khám", "tracking")
- File upload (critical cho "bill OCR")
- Validation messages / required indicator
- Conditional fields (show B khi A = X)
- Multi-step wizard
- Input masks (phone, currency)
- Nested object UI
- i18n / error display

→ Ngay cả **khi AI sinh đúng schema**, renderer không vẽ nổi form production-grade. "Renderer is the bottleneck" đúng là điều bạn định nói ở Demo 1 → chuyển tiếp Demo 2. Nhưng renderer hiện nghèo hơn mức tối thiểu cần để các use case (booking, bill split) có vẻ realistic. **Audience kỹ tính sẽ thấy demo 1 yếu.**

### 4.3. Architecture observations

- **Streaming reasoning panel:** Tốt về mặt kịch bản (cho audience "thấy AI suy nghĩ"). Nhưng trong production thường ẩn; nên nói rõ "đây là demo theatrics, not production pattern".
- **Client gọi thẳng LLM:** Phù hợp demo đơn giản, nhưng mâu thuẫn với SDUI principle ("server drives UI"). Ironically, demo "Server-Driven UI" này **không có server**. Presenter cần lường trước câu hỏi.
- **Không có caching layer:** Mỗi click event cùng một trigger → gọi AI lại từ đầu. Tổ hợp Industry×Workflow cố định — nên cache theo key `(industry, workflow)`. Việc **không có** cache củng cố lập luận "bánh vẽ" vì audience thấy tiền token bị đốt cho cùng một form.

---

## 5. Đánh giá framing của techtalk

Thesis "Do we need Generative UI?" của techtalk rất hay. Nhưng Demo 1 như hiện tại **vô tình trả lời "không"**:

- PC configurator: SDUI thắng.
- Vehicle triage: rule engine thắng (và an toàn hơn).
- Bill OCR: form tĩnh + `.map()` thắng.
- 36 Industry×Workflow combos: pre-generate + cache thắng.

→ **Bạn đang đưa cho audience đạn để bắn chính thesis của bạn.**

### Re-framing đề xuất

Demo 1 nên chia làm 2 chế độ **trong cùng 1 màn hình**:

1. **Mode A — SDUI baseline (Rule Engine):** chọn industry + workflow → trả ra schema **đã pre-authored**, render tức thì, hiện rõ "0 token, 0ms network".
2. **Mode B — GenUI:** textbox tự do cho user gõ **prompt chưa có trong registry** (ví dụ "form đăng ký giải đấu poker 8 người, có buy-in và re-buy"). AI sinh schema runtime.

Lúc đó thesis rõ:
- Mode A = 90% production case, dùng cái này.
- Mode B = long-tail 10%, chỉ khi SDUI không thể author trước.
- GenUI không thay thế SDUI — nó **extend** SDUI cho unbounded input space.

Đây chính là câu chuyện `DEMO_GUIDE_VI.md` gốc muốn kể (Demo 1 = Rule Engine, Demo 2 = AI schema). **Code hiện tại đang gộp cả 2 vào một, làm mờ message.**

---

## 6. Tóm tắt — Demo 1 có cần thiết / thực tế không?

| Câu hỏi | Trả lời |
|---|---|
| Demo 1 hiện tại có defend được thesis "GenUI cần thiết"? | **Chưa.** Thiếu baseline SDUI để so sánh. |
| Use cases có thực tế? | **1/4 ổn** (OCR bill). PC builder và IoT triage là anti-pattern cho GenUI. Industry×Workflow quá hữu hạn để cần GenUI. |
| Có inconsistency giữa docs và code không? | **Có, rất lớn.** Code dùng AI, nhưng script thuyết minh nói đây là "SDUI thuần". Rủi ro cao khi audience mở DevTools. |
| Renderer có đủ mạnh để show realistic form? | **Không.** Thiếu date/file/validation/conditional — lộ rõ khi trình diễn. |
| Security/production-readiness? | **Demo-grade.** API key client-side, không Zod validation, không fallback. OK cho sân khấu nhưng phải chủ động nói ra. |

---

## 7. Hành động khuyến nghị (ưu tiên)

### 🔴 Must-fix trước techtalk

1. **Thống nhất narrative:** Chọn 1 trong 2 framing:
   - (a) Giữ code AI hiện tại, **sửa script** — gọi Demo 1 là "Declarative GenUI", không còn nhắc "SDUI thuần".
   - (b) Thêm mode "Rule Engine" song song với mode AI để thật sự có baseline — khớp với `DEMO_GUIDE_VI.md`.
   - **Khuyến nghị (b)** vì nó cứu thesis chính.

2. **Bill OCR use case cần remove hoặc rewrite:** dữ liệu OCR không có trong demo — chỉ có AI tưởng tượng ra một form. Audience tinh ý sẽ thấy. Hoặc thay event 3 bằng "User gõ prompt tự do" để show long-tail.

3. **Thêm disclaimer slide về API key:** "demo key client-side cho simplicity, production phải qua BE proxy".

### 🟡 Should-fix

4. **Thêm Zod hoặc Ajv validation** cho JSON AI trả về trước khi đẩy vào Renderer — match với Q&A đã chuẩn bị ("chúng ta dùng Zod").
5. **Cache schema** cho tổ hợp (industry, workflow) đã gen trước để tránh audience thấy đốt token vô nghĩa.
6. **Bổ sung ít nhất 1 field type production-grade** (date picker hoặc file upload) để use case "booking" / "bill" không nhìn trần trụi.

### 🟢 Nice-to-have

7. Thay Event 1 (PC builder) bằng một case GenUI thực sự thắng SDUI — ví dụ **dynamic insurance claim form** phụ thuộc loại tai nạn (car crash vs fire vs theft) — mỗi loại yêu cầu trường khác nhau, không lường trước được combo.
8. Show latency + token count trong UI để audience thấy trade-off bằng số liệu.

---

## 8. Bottom line cho Software Architect

> *Demo 1 hiện tại là "AI-generated form schema on client" — nó là một demo hợp lý về **kỹ thuật streaming LLM → JSON → renderer**, nhưng nó không phải là **Server-Driven UI baseline** như tài liệu nói. Nếu để nguyên, techtalk sẽ mất đi vế so sánh quan trọng nhất, và một số use case (PC builder, IoT triage) sẽ củng cố phe "GenUI là bánh vẽ" thay vì phản bác họ. Fix narrative + thêm SDUI baseline + chọn lại 1–2 use case là đủ để Demo 1 trở thành nền tảng vững chắc cho Demo 2/3/4.*
