# Techtalk Kịch Bản — Post-Chat UI

> **Talk:** "Post-Chat UI: Khi giao diện tự 'tiến hóa' theo hành vi người dùng"
> **Ngày:** 23/04/2026
> **Địa điểm:** Đà Nẵng office
> **Speaker:** Bao
> **Wingman:** *(tên wingman — người sẽ đặt pivot question)*
> **Thời lượng:** ~55 phút (45 nói + 10 Q&A)

---

## 0. Mục tiêu và thesis

### Thesis chính
**GenUI có cần thật không, hay là bánh vẽ?**
→ Câu trả lời: **Có cần, nhưng CHỖ KHÁC với nhiều người nghĩ.**
- GenUI **≠** SDUI (Server-Driven UI).
- GenUI **≠** FE Static schema.
- GenUI là tầng **thứ 3**, chỉ bật khi **không thể pre-author** schema/layout.

### 3 takeaways muốn audience mang về
1. **Biết phân biệt** 3 pattern: FE Static / BE SDUI / GenUI — và khi nào dùng cái nào.
2. **Hiểu GenUI killer case** không phải form, mà là **adaptive/contextual UI** cho consumer app.
3. **Dám áp dụng** — có code pattern production-ready (BE proxy, Zod validate, repair loop, fallback) để chạy thật, không chỉ demo.

### Audience framing
- Khán giả = tech team.
- Khách hàng của họ = business (B2B2C).
- Mọi use case phải chọn theo: **tech team có thể pitch cho business client được không?**

---

## 1. Timeline chi tiết (55 phút)

| Thời gian | Section | Mục tiêu |
|---|---|---|
| 0-5 | Intro + định nghĩa | Set thesis, định nghĩa 3 pattern |
| 5-20 | Demo 1 — Form 3 modes | Show cost/benefit rõ ràng |
| 20-23 | **Wingman pivot** | "GenUI overkill for forms?" |
| 23-25 | Transition | Form yếu nhất — vậy GenUI thắng ở đâu? |
| 25-35 | Demo 2 — Command Bar | User-initiated GenUI |
| 35-50 | Demo 3 — Adaptive UI | Event/context-initiated GenUI |
| 50-55 | Q&A + wrap-up | Takeaways |

---

## 2. Section-by-section script

### 🎬 Intro (0-5 phút)

**Mở đầu:**
> "Mấy tháng qua ai cũng nói Generative UI. Hôm nay tôi muốn hỏi một câu đơn giản: **Nó có cần thật không?** Hay là thêm một cái bánh vẽ nữa?"

**Đừng:**
- Đừng sell GenUI từ đầu. Hãy **skeptical trước** — audience sẽ tin hơn khi thấy bạn tự đặt câu hỏi khó.
- Đừng nói "Generative UI là tương lai" — sáo rỗng.

**Nói:**
- Định nghĩa 3 pattern, vẽ diagram đơn giản:
  ```
  FE Static schema      →  Schema trong client bundle, build-time quyết định
  BE SDUI (rule engine) →  Schema từ BE, admin edit, runtime quyết định theo rules
  GenUI                 →  Schema do AI compose từ context/prompt, không pre-author
  ```
- Nhấn: **"Ba pattern này giải quyết 3 bài toán khác nhau. Nhầm lẫn chúng là lý do nhiều team chi tiền vào GenUI cho cái đáng lẽ chỉ cần SDUI."**

---

### 🎬 Demo 1 — Form 3 Modes (5-20 phút)

**Setup:**
> "Form — thứ nhàm chán nhất trong UI. Tôi chọn form làm ví dụ đầu vì nó là **hard test** cho GenUI. Nếu GenUI thắng ở form, chắc thắng mọi chỗ khác. Nếu thua — chúng ta biết nó không phải viên đạn bạc."

**Demo flow:**
1. **Mode 1 — FE Static:** show schema hardcode. Latency ~0ms. 100% deterministic. Cost = 0. → *"95% form thực tế chỉ cần vậy."*
2. **Mode 2 — BE SDUI:** show admin mock panel. Edit schema JSON live → form đổi. Latency low. Admin quyết định, không phải dev deploy. → *"Cái này gọi là Server-Driven UI. Đã có 10 năm rồi. Không phải GenUI."*
3. **Mode 3 — GenUI:** gõ free-text *"Tôi muốn đăng ký xe máy đi grab"* → AI compose form. Latency ~3s. Có validate, có repair loop, có fallback.

**Key moments cần highlight:**
- Metrics panel: latency Mode 1 (5ms) vs Mode 3 (3000ms) — audience phải **thấy** con số.
- Mode 3 **fail case** — cố tình trigger prompt rác để show fallback về Mode 2 schema. → *"GenUI không phải cứ gọi là có — phải có safety net."*
- Use case thực tế: Insurance claim, KYC adaptive, Free-text → form.

**Đừng:**
- Đừng demo Mode 3 quá nhiều prompts đẹp. Audience thông minh, biết cherry-pick. → **Phải** show fail case + fallback.
- Đừng quên nói về **API key security** — BE proxy, không expose client.

**Chốt section:**
> "Ba modes, ba chi phí khác nhau, ba use case khác nhau. Mode 3 có giá trị nhưng **không free** — latency + cost + khả năng fail. Nếu bài toán của bạn pre-author được, đừng dùng Mode 3."

---

### 🎬 Wingman Pivot (20-23 phút)

**Wingman hỏi** (đã brief trước):
> *"Bao ơi, nghe xong Demo 1 thì tôi thấy GenUI cho form hơi overkill nhỉ? 3 giây latency để compose 1 cái form mà Mode 1 làm trong 5ms?"*

**Bao trả lời:**
> *"Correct. Form là **use case YẾU NHẤT** của GenUI."*

**Pause 2-3 giây để audience hấp thụ.**

**Giải thích:**
> "Form là structured input. Mà structured input thì hầu hết team đều pre-author được. GenUI cho form chỉ shine ở edge case: free-text → form, hoặc very long tail forms mà team không thể maintain hàng nghìn schema.
>
> Vậy GenUI thắng ở đâu? **Không phải input structured. Mà là output unpredictable + multi-signal context + layout restructure.** Tôi show cho các bạn 2 demo tiếp theo."

**Tại sao pivot này quan trọng:**
- Audience sẽ nghĩ mình là người thật thà, không sell-in.
- Set lên cho Demo 2-3 mạnh hơn vì audience đã biết bạn không hype bừa.
- Wingman đóng vai "người thường" → audience relate.

---

### 🎬 Transition (23-25 phút)

**Nói:**
> "2 trục để đánh giá GenUI thắng hay thua:
> 1. **Content swap** (traditional tooling làm được) vs **Layout restructure** (GenUI shine).
> 2. **Who initiates** — User-initiated (Demo 2) vs AI/context-initiated (Demo 3).
>
> Demo tiếp theo cover cả 2 trục."

Vẽ nhanh 2×2 matrix:
```
                User-initiated    AI-initiated
Content swap    (traditional ok)  (rule engine ok)
Layout restruct DEMO 2            DEMO 3
```

---

### 🎬 Demo 2 — Command Bar (25-35 phút)

**Setup:**
> "Internal Dashboard Builder. Mỗi manager trong công ty muốn dashboard khác nhau. Cách cũ: nộp ticket, đợi dev 2 tuần. Cách mới: gõ yêu cầu, AI compose."

**Demo flow:**
1. Gõ *"Show doanh thu tuần này theo region"* → real streaming, components render từng cái → KPI card + line chart + data table.
2. Click **"Remix this"** → gõ *"đổi sang daily thay vì weekly"* → AI edit 1 component, giữ phần còn lại.
3. Gõ prompt phức tạp hơn: *"Top 10 products hôm nay + alert nếu stock nào dưới 20"* → show compose multi-component + alert banner.

**Key points cần highlight:**
- **Mock data layer** — show BE route `/api/mock-data/sales`. → *"AI không hallucinate số — data thật từ warehouse/BI. AI chỉ quyết định HIỂN THỊ NHƯ NÀO."*
- Disclaimer banner visible — *"Dữ liệu mock — production sẽ query từ data warehouse."*
- Real streaming — components render từng cái, không đợi cuối.
- Metrics panel — ~2-3s latency cho 4 components.

**Đừng:**
- Đừng làm Demo 2 quá lâu — 10 phút là đủ. Đây là bridge lên Demo 3.
- Đừng demo mỗi "chat xong ra UI" — phải show **Remix** vì đó là feature khác biệt với gen-one-shot.

**Chốt section:**
> "Demo 2 = **user asks, AI builds**. User biết mình muốn gì, AI build ra cho. Next: ngược lại — **user không biết mình muốn gì, AI đọc context và gợi ý**."

---

### 🎬 Demo 3 — Adaptive UI (35-50 phút)

**Setup:**
> "Đây là use case tôi tin GenUI thực sự unique — chỗ mà traditional không thể scale tới.
>
> Bối cảnh: Food delivery app — consumer facing. Audience các bạn là tech team, nhưng khách hàng của các bạn là business, và business của họ có app consumer. Pattern này áp dụng được cho mọi app consumer: banking, e-commerce, fitness, travel."

**Giới thiệu personas:**
> "Tôi có 4 personas mock — Minh, Lan, Tuấn, An. Mỗi persona có 30 ngày history. Đây là **mock context** — production sẽ đọc từ weather API, analytics events, order DB, device telemetry, session behavior."

**👉 Nhấn disclaimer này 2 lần trong demo 3.** Audience rất dễ hiểu nhầm "có data thật".

**Demo flow (3 scenarios × 4 personas):**

**Scenario 1 — Baseline (10:00)**
- Chọn persona Minh → home grid trending bình thường.
- Chuyển persona Tuấn → home grid khác (món rẻ, freeship chase).
- → *"Cùng 1 timeslot, 2 user, 2 UI khác. Đây không phải GenUI đâu — rule engine cũng filter được. Baseline."*

**Scenario 2 — Sudden Weather Shift (14:00)**
- Jog slider weather: temp drop 8°C.
- Persona Minh → home restructure: hero "Trời lạnh rồi" + 3 rows comfort (lẩu mini / cháo-súp / bánh mì nóng), hide default rows.
- Persona Tuấn → home restructure tương tự nhưng **món rẻ + nhanh** (mì gói nóng quán cạnh, cháo 25k).
- → *"Layout đổi, không chỉ content. Và cùng signal nhưng 2 persona ra 2 restructure khác nhau."*
- **Show pipeline log:** signals → intent confidence 0.87 → tool calls.

**Scenario 3 — Search Abandon (22:30)**
- Jog behavior: search "phở"→xoá→"bún"→xoá→"mì"→xoá.
- Persona Minh → Mood Picker 3 cards (nhẹ / đậm / cay healthy).
- Persona Lan → Mood Picker 3 cards khác (combo cho cả nhà 3 người).
- → *"Search blank state restructure thành decision helper. Rule engine không detect được search abandon pattern này."*

**Key moments cần highlight:**
- **Pipeline log** (Signal → Intent → UI) — đây là **wow moment**. Audience thấy "não" AI. Nhấn confidence score — *"AI không chắc 100%, nên có threshold — dưới 0.7 thì fallback về baseline."*
- **Persona switcher** — nhắc lại *"cùng scenario, UI khác vì persona khác. Đây là chỗ rule engine fail — n × m tổ hợp."*
- **Disclaimer banner** — nhắc lại *"mock context. Production sẽ đọc từ database thật."*
- **Fallback demo** — cố tình trigger AI fail → UI về baseline + log warning. → *"Không bao giờ để user thấy broken UI."*

**Đừng:**
- Đừng demo quá nhiều scenarios/personas (12 combos nhưng show 5-6 là đủ). Audience sẽ lạc.
- Đừng nói "AI hiểu user" — nói **"AI classify intent với confidence"**. Technical term, không hype.

**Chốt section:**
> "Demo 3 = **AI đọc context, đề xuất, user react**. Đây là chỗ:
> - Content swap không đủ — cần layout restructure.
> - Rule engine bùng nổ tổ hợp — n signals × m personas.
> - GenUI win rõ — nếu bạn chấp nhận latency + cost + cần safety net.
>
> Nếu app của khách bạn là consumer-facing và có nhiều signal, đây là killer case."

---

### 🎬 Q&A + Wrap-up (50-55 phút)

**Wrap-up 2 phút trước Q&A:**

Vẽ lại diagram:
```
                    Cost    Determinism   Use when
FE Static           ~0      100%          95% form/UI đơn giản
BE SDUI             low     high          Admin cần tự edit, schema có rule
GenUI               ~3s     ~80% +repair  Không thể pre-author: unpredictable input, huge context combo
```

**Message cuối:**
> "3 takeaways:
> 1. GenUI không phải cho mọi thứ. **Đừng dùng nó cho form nếu không thực sự cần.**
> 2. Killer case là **adaptive consumer UI** — Demo 3 pattern.
> 3. Có pattern production-ready rồi: BE proxy + Zod + repair loop + fallback + metrics + disclaimer mock. **Code ở repo, đi làm được ngay.**"

---

## 3. Q&A — Câu hỏi có thể gặp và cách trả lời

### Q: "Cost của GenUI thực tế bao nhiêu một request?"
**A:** Dùng MiniMax M2.7 qua OpenRouter, ~$0.0003-0.001 per request tuỳ prompt/output. Demo 3 compose 1 layout ~$0.0005. **Ở scale consumer app thì không free** — cần cache, cần threshold để gate (chỉ trigger GenUI khi traditional không cover).

### Q: "Nếu AI fail trên production thì sao?"
**A:** Tôi có demo fallback trong Demo 1 và Demo 3. Pattern: Zod validate → repair loop (max 2 retries) → fallback về schema/UI pre-authored. **User không bao giờ thấy broken UI.**

### Q: "Latency 3 giây cho user thấy không?"
**A:** Tuỳ surface. Demo 1 form 3s là quá chậm nếu user gõ xong expect form ngay — nên Mode 1/2 cho form thường. Demo 3 adaptive thì user không gõ, 3s là background, không cảm nhận. **Latency phải match context.**

### Q: "Streaming có giúp giảm perceived latency không?"
**A:** Demo 2 có show — components render từng cái, user thấy progressive. Cần. Nhưng không giải quyết total latency, chỉ perceived.

### Q: "Security concerns — prompt injection?"
**A:** Big topic, không kịp trong talk. Ngắn gọn: (1) BE proxy filter/rate-limit, (2) output Zod validate → reject rác, (3) không bao giờ let AI output thành executable code — chỉ là **data** renderer đọc. Có thể discuss sâu sau.

### Q: "Team nhỏ có nên làm GenUI không?"
**A:** Câu hỏi hay. **Không nên bắt đầu từ GenUI.** Thứ tự: (1) FE static trước, (2) SDUI khi business cần tự config, (3) GenUI chỉ khi thực sự hit wall. Start small.

### Q: "Tại sao dùng MiniMax thay OpenAI/Claude?"
**A:** Cost + tốc độ + tool calling OK cho UI composition. Không phải best, nhưng balance tốt cho demo. Production thì tuỳ requirement — reasoning cao thì Claude/GPT-4, cost-sensitive thì MiniMax/Gemini Flash.

### Q: "Có thể self-host model không?"
**A:** Có — Llama 3.1 70B, Qwen 2.5 với tool calling OK. Trade-off: cost infra vs cost API. Với scale < 1M request/tháng thì API rẻ hơn self-host.

### Q: "Business client của chúng tôi chưa tin AI. Làm sao sell?"
**A:** Demo 1 chính là answer. Show 3 modes với metrics rõ ràng. Đừng bán "AI revolution". Bán **"escalation path — khi nào cần AI, khi nào không"**. Business thích determinism + cost control.

---

## 4. Chú ý/nhắc nhở quan trọng

### Về framing
- **B2B2C angle** — luôn nhắc audience là tech team, khách của họ là business. Use case phải pitch được cho business client.
- **Priority framework** — `realistic > easy apply > production-ready > wow`. Khi audience hỏi về 1 ý tưởng, evaluate theo 4 trục này.

### Về technical message
- **GenUI ≠ SDUI** — nhắc ít nhất 3 lần trong talk. Đây là misconception phổ biến nhất.
- **Content swap vs Layout restructure** — trục quan trọng để đánh giá GenUI có add value không.
- **Intent > Event** — GenUI không phải "if X then Y", mà là **AI classify user state**.

### Về rhetorical
- **Skeptical first, convinced later** — mở đầu nghi ngờ, cuối cùng mới chấp nhận. Không sell từ đầu.
- **Wingman pivot** — khoảnh khắc quan trọng nhất rhetorical. Đừng miss.
- **Show fail case** — Demo 1 Mode 3 fallback + Demo 3 confidence threshold. Audience tin hơn khi thấy bạn admit limitation.

### Về demo operational
- **Cache last-good response** — demo live rủi ro AI flake. Chuẩn bị cache.
- **Disclaimer banner** — mỗi demo có disclaimer "mock context". Nhắc verbally lần 1, banner visible suốt.
- **Metrics panel luôn visible** — số liệu trả lời câu hỏi cost/latency trước khi ai hỏi.
- **Pipeline log Demo 3** — wow moment. Zoom in visible từ hàng sau.

### Về thời gian
- Demo 1: **15 phút** — có thể kéo hơn vì đây là core thesis defense.
- Demo 2: **10 phút** — bridge, đừng kéo.
- Demo 3: **15 phút** — peak wow, nhưng đừng show quá nhiều combos, chọn 5-6 là đủ.

### Đừng
- Đừng dùng từ "revolution", "game-changer", "AI will replace".
- Đừng nói "GenUI is the future" — sáo rỗng.
- Đừng demo Mode 3 chỉ prompt đẹp — phải show fail case.
- Đừng để audience nghĩ "có database thật" — disclaimer banner + verbal reminder.
- Đừng vào Q&A mà chưa chốt 3 takeaways.

### Nên
- Nên pause 2-3 giây sau câu chốt quan trọng.
- Nên vẽ diagram live thay vì show slide — engage hơn.
- Nên dùng metrics panel làm bằng chứng cho mọi claim latency/cost.
- Nên mời wingman chốt 1 câu phản biện thân thiện.
- Nên đưa link repo cuối — audience muốn code.

---

## 5. Pre-talk checklist

### 1 tuần trước
- [ ] Demo 1 ship xong, metrics panel đúng.
- [ ] Demo 2 streaming thật, remix hoạt động.
- [ ] Demo 3 3 scenarios × 4 personas, pipeline log.
- [ ] Kịch bản đọc 1 lần, time 45 phút ±5.
- [ ] Wingman brief xong câu pivot + timing.

### 2 ngày trước
- [ ] Dry run full 45 phút với wingman.
- [ ] Record session check audio/visibility.
- [ ] Cache last-good response cho từng demo scenario.
- [ ] Check OpenRouter credit, API key BE proxy.
- [ ] Backup slides/diagram (nếu live code fail).

### Ngày talk
- [ ] Test wifi/network ở Đà Nẵng office.
- [ ] Chrome profile clean, zoom level OK.
- [ ] Dev tools mở network tab (show API key không lộ).
- [ ] Repo link sẵn để share cuối talk.
- [ ] Nước + khăn.

---

## 6. File references

| File | Mô tả |
|---|---|
| `DEMO_APPS_ENHANCEMENT_PLAN.md` | Plan tổng 3 demos (file này reference đến) |
| `DEMO1_REFACTOR_PLAN.md` | Chi tiết Demo 1 implementation |
| `DEMO1_ARCHITECT_REVIEW.md` | Review critical findings trước refactor |
| `/apps/json-render-demo/` | Demo 1 code |
| `/apps/stream-ui-demo/` | Demo 2 code |
| `/apps/agentic-ui/` | Demo 3 code |

---

## 7. Post-talk follow-up

- Share repo + slides trong channel sau talk.
- Survey 3 câu: (1) hiểu được difference FE/BE/GenUI không, (2) use case nào muốn thử, (3) concern lớn nhất.
- Note down câu hỏi khó, update kịch bản cho lần sau.
