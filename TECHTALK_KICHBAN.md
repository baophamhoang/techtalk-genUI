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
3. **Dám áp dụng** — có code pattern production-ready (BE proxy, Zod validate, failure-visible UX, fallback) để chạy thật, không chỉ demo.

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
| 25-35 | Demo 2 — Chat + Inline UI | User-initiated GenUI, chat palette |
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
2. **Mode 2 — BE SDUI:** show admin mock panel. Edit schema JSON live → form đổi. Latency low. Admin quyết định, không phải dev deploy. → *"Cái này gọi là Server-Driven UI. Đã có 10 năm rồi. Không phải GenUI. Admin panel thực tế có thể là Retool, Strapi, hoặc CMS đã có — SDUI là pattern, không phải build from scratch."*
3. **Mode 3 — GenUI:** 2 bucket, mỗi bucket gõ 1 description → AI compose form. Latency ~3s. Có validate, có fallback.
   - **Bucket 1 — Dev/ops artifact triage:** paste stack trace / config snippet / log tail → form follow-up phù hợp loại artifact (env vars, topology, v.v.).
   - **Bucket 2 — Consumer service intake:** mô tả vấn đề reactive ("bồn rửa rò nước" / "xe nổ tiếng lạ" / "chó nôn 3 lần") → form intake theo trade được infer từ mô tả.

**Key moments cần highlight:**
- Metrics panel: latency Mode 1 (5ms) vs Mode 3 (3000ms) — audience phải **thấy** con số.
- Mode 3 **fail case** — cố tình trigger prompt rác để show fallback + raw AI output + Zod issues. → *"GenUI không phải cứ gọi là có — phải có safety net, và phải làm failure visible để biết chỗ nào production cần đầu tư."*
- **Visual guard rail:** Mode 3 UI **không** phải chatbox — chỉ 1 textarea mô tả + 1 button "Tạo form phù hợp" + form reveal bên dưới. Audience phải nhìn thấy metaphor "intake form", không phải "chat". (Chatbox sẽ xuất hiện ở Demo 2.)
- Use case thực tế đã filter kỹ:
  - **Dev/ops triage** — artifact unknown, FE/BE không enumerate được schema trước.
  - **Consumer service intake** — trade space quá rộng (plumbing, HVAC, auto, vet, IT helpdesk) để SDUI phủ từng branch.

**Đừng:**
- Đừng demo Mode 3 quá nhiều prompts đẹp. Audience thông minh, biết cherry-pick. → **Phải** show fail case + fallback.
- Đừng nhắc insurance / KYC / medical ở đây — regulated domain thì SDUI handle đàng hoàng hơn, dùng GenUI là sai trục.
- Đừng để Mode 3 UI trông giống chat — sẽ lẫn với Demo 2 và pha loãng narrative "form là điểm yếu, chat mới là home turf".
- Đừng quên nói về **API key security** — BE proxy, không expose client.

**Chốt section:**
> "Ba modes, ba chi phí khác nhau, ba use case khác nhau. Mode 3 có giá trị nhưng **không free** — latency + cost + khả năng fail. Nếu bài toán của bạn pre-author được, đừng dùng Mode 3. Và để ý — Mode 3 chỉ làm được 1 thứ: render form. Đấy là trần của json-render. Giữ ý này cho transition."

**Câu hỏi thường gặp sau Demo 1:**

- **"Admin panel Mode 2 ai build? Mất bao lâu?"** → Đây là mock simplified. Thực tế dùng Retool / Strapi / CMS đã có — SDUI là pattern, không build from scratch. Cost: 1-2 sprint setup, sau đó business tự config mà không cần dev.
- **"95% form chỉ cần Mode 1 — bold quá không?"** → 95% về số use case (login, checkout, contact form), không phải volume schema. Long tail (marketplace onboarding, service intake với 100+ trades) thì Mode 2/3 mới cần.
- **"Client banking/fintech/KYC của tôi dùng Mode mấy?"** → Regulated domain thì SDUI — schema phải audit được, AI compose là sai trục. GenUI chỉ cho non-regulated context hoặc internal tooling.
- **"Nếu AI fail trên production thì sao?"** → Zod validate → nếu output invalid thì show raw JSON + issues (failure-visible), không silently break. Production thì Zod → fallback về pre-authored schema + optional retry. User không bao giờ thấy blank UI.

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

**Bridge script (~20 giây):**
> "Chốt Demo 1: json-render chỉ biết render **1 class component** — form. Đấy là giới hạn. Gọi Mode 3 là 'GenUI' hơi quá — về mặt tech nó là structured output, LLM spit ra 1 cục JSON match schema, FE render. Pattern này có từ 2023.
>
> Cái pattern đáng tên 'Generative UI' nằm ở Demo 2 — chatbox. LLM có cả **palette** (chart, card, table, form — bất cứ thứ gì mình register dưới dạng tool) và chọn tại runtime, stream component vào giữa câu trả lời. Vercel AI SDK gọi pattern này là `streamText` với tools — tool call complete thì component pop in, không đợi end-of-message. **Form sẽ xuất hiện lại ở Demo 2**, nhưng chỉ là 1 quân bài trong palette, không phải deliverable duy nhất."

**Pause 2 giây.** Để audience register "form = weak, chat = strong" trước khi mở 2×2.

**Rồi setup 2 trục cho Demo 2 và Demo 3:**
> "Chat là habitat tự nhiên của GenUI. 2 demo tiếp theo cover 2 trục khác nhau của habitat này:
> 1. **Who initiates** — User-initiated (Demo 2, user gõ prompt) vs AI/context-initiated (Demo 3, AI đọc context tự restructure).
> 2. **Content swap** (traditional tooling làm được) vs **Layout restructure** (GenUI shine)."

Vẽ nhanh 2×2 matrix:
```
                User-initiated    AI-initiated
Content swap    (traditional ok)  (rule engine ok)
Layout restruct DEMO 2            DEMO 3
```

**Nhắc nhở operational:**
- Đừng đi sâu vào structured output / `streamText` + tools ở đây — chỉ drop tên để audience có handle. Sẽ show code pattern trong Demo 2 khi streaming render.
- Giữ "1 class vs palette" là mental hook chính cho transition. Bỏ qua phần "form xuất hiện 2 lần ở 2 container khác nhau" — đã đơn giản hóa, không cần belabor.

---

### 🎬 Demo 2 — Chat Assistant with Inline UI (25-35 phút)

**Setup:**
> "Chatbox. Cái này mọi người quen rồi — nhưng khác ở chỗ AI không chỉ trả lời bằng text, mà còn **stream component vào giữa câu trả lời**. Chart, card, form, table — mỗi turn AI chọn cái gì phù hợp nhất, render inline.
>
> Đây là lý do mình nói chatbox là habitat tự nhiên của GenUI: cùng 1 app, không cần predefine layout, user hỏi gì AI render cái đó."

**Demo flow — 3 intent trong cùng 1 conversation, chọn "📈 Business Analytics" scenario:**

> **Giữ nguyên analytics scenario suốt** — không switch sang travel/food giữa chừng. 3 intent khác nhau đủ demonstrate palette diversity mà không làm demo trông staged.

1. **Viz intent** — gõ *"Báo cáo doanh thu tháng 3 theo kênh"* → AI reply text ngắn + stream `show_chart` (bar chart inline).
   → *"Chart inline. Không redirect, không popup. Chart là 1 phần của câu trả lời."*

2. **Table intent** — gõ tiếp *"Danh sách 5 sản phẩm bán chạy nhất tháng này"* → AI stream `show_table` trong cùng conversation.
   → *"Multi-turn. AI nhớ context, không cần reset. Cùng 1 chatbox, component khác hẳn — và AI biết user đang xem báo cáo gì."*

3. **Input capture intent** — gõ *"Tạo form nhập target doanh thu quý 2"* → AI stream `show_form` (mini form: target, kênh, ghi chú) inline.
   - User fill, submit → summary text post back như 1 user turn → AI xác nhận "Đã ghi nhận target...".
   → *"**Form xuất hiện lại ở đây.** Nhưng khác Demo 1 hoàn toàn — không phải deliverable duy nhất, chỉ là 1 widget trong 1 turn. Form là quân bài, không phải cả ván."*

**Key points cần highlight:**
- **Tool palette visible** — show `lib/schemas/tools.ts` ngắn. *"5 tool, LLM chọn runtime. Thêm 1 tool thứ 6 là thêm 1 class UI AI có thể compose."*
- **Real streaming** — component render đúng lúc tool-call args parse xong, chèn giữa prose tokens. Không phải end-of-message.
- **Mock data layer** — AI invent plausible Vietnamese numbers từ system prompt context. → *"Số liệu là mock do AI tạo — production sẽ inject real data từ data warehouse / API vào system prompt hoặc tool execute. Điểm quan trọng: AI quyết định HIỂN THỊ NHƯ NÀO, không phải DATA GÌ."*
- **Disclaimer banner visible** — *"Dữ liệu mock — production sẽ query từ data warehouse / hotel API / reservation system."*
- **Metrics panel** — time-to-first-token vs total latency. First-token ~500ms, full turn ~2-3s cho 1 component. → *"Streaming không giảm total latency, chỉ giảm perceived."*

**Đừng:**
- Đừng làm Demo 2 quá lâu — 10 phút là đủ. Đây là bridge lên Demo 3.
- Đừng demo intent quá giống nhau (3 cái đều chart là lãng phí). Phải show **3 class component khác hẳn** để audience thấy palette đa dạng.
- Đừng over-emphasize "form ở đây khác form Demo 1" — drop 1 câu để audience để ý rồi move on. Narrative là linear "form yếu → chat mạnh, form chỉ là 1 trong N", không phải punchline về container.

**Chốt section:**
> "Demo 2 = **user asks, AI picks component, streams inline**. `streamText` + tools — tool call complete thì component render, không đợi end-of-message. Đây là lý do chatbox là sân nhà của GenUI. Next: ngược trục — user không hỏi, AI tự đọc context và restructure UI."

**Câu hỏi thường gặp sau Demo 2:**

- **"Data trong chart/card là real không?"** → Mock — AI invent plausible numbers từ context scenario. Production pattern: tool có `execute` function thật — nó query DB rồi inject data vào args, AI chỉ quyết định render component nào và format thế nào. AI không query DB trực tiếp.
- **"Form submit về đâu? Có ghi DB không?"** → Demo: submit gửi summary text trở lại AI turn, AI reply confirm. Production: `execute` function trong tool definition gọi reservation API / ghi DB thật, rồi trả confirmation payload cho AI compose response.
- **"Streaming có giúp giảm latency không?"** → Không giảm total latency, chỉ giảm perceived. First-token ~500ms, user thấy AI "đang gõ" ngay. Chart pop in khi tool call args parse xong — không đợi full response. Total turn vẫn 2-3s.
- **"Tool calling có unreliable không? AI có trả text thay vì tool không?"** → Có — Minimax M2.7 đôi khi chỉ trả text. Demo này là lý do chuẩn bị cache. Production thì dùng model reliable hơn (GPT-4o-mini hoặc Claude) hoặc thêm retry logic.

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

**Scenario 1 — Baseline**
- Chọn persona Minh → home grid trending bình thường.
- Chuyển persona Tuấn → home grid khác (món rẻ, freeship chase).
- → *"Cùng 1 scenario, 2 user, 2 UI khác. Đây không phải GenUI đâu — rule engine cũng filter được. Baseline."*
- **[Đây là lúc drop câu chốt về rule engine:]** → *"Nhưng rule engine này hoạt động được vì chúng ta chỉ có 2 signals: persona + time. Thêm weather + behavior + location vào — tổ hợp bùng nổ. 10 signals × 10 personas = 100 tổ hợp rules, mỗi rule phải maintain riêng. GenUI collapse tất cả về 1 prompt."*

**Scenario 2 — Weather Shift**
- Click scenario "❄️ Weather Shift" — weather preset 16°C lạnh, time theo từng persona.
- Persona Minh → home restructure: hero "Trời lạnh rồi" + 3 rows comfort (lẩu mini / cháo-súp / bánh mì nóng), hide default rows.
- Persona Tuấn → home restructure tương tự nhưng **món rẻ + nhanh** (mì gói nóng quán cạnh, cháo 25k).
- → *"Layout đổi, không chỉ content. Và cùng signal nhưng 2 persona ra 2 restructure khác nhau."*
- **Show pipeline log:** signal bundle (persona + thời tiết + location + searchHistory) → tool calls được AI chọn.

**Scenario 3 — Search Abandon**
- Click scenario "🔍 Search Abandon" — behavior preset: searchHistory đã có sẵn ["mì cay", "bún bò", "lẩu cay"] (Minh) hoặc ["cơm cho bé", "cháo", "phở ít dầu"] (Lan).
- Persona Minh → Mood Picker 3 cards (nhẹ / đậm / cay healthy).
- Persona Lan → Mood Picker 3 cards khác (combo cho cả nhà 3 người).
- → *"Search abandon signal baked vào context bundle. AI đọc searchHistory + sessionMinutes → hiểu user đang do dự → render Mood Picker thay home grid."*

**Key moments cần highlight:**
- **Pipeline log** (Signal Bundle → Tool Calls) — đây là **wow moment**. Audience thấy "não" AI. Zoom in pipeline log: *"Đây là signal bundle AI nhận — persona, thời tiết, location, searchHistory, sessionMinutes. Đây là tool calls AI chọn. Hai bên đó là cả quá trình quyết định."*
- **Persona switcher** — nhắc lại *"cùng scenario, UI khác vì persona khác. Đây là chỗ rule engine fail — n × m tổ hợp."*
- **Disclaimer banner** — nhắc lại *"mock context. Production sẽ đọc từ database thật."*
- **Zod fallback** — thay vì "trigger AI fail", giải thích pattern: *"Nếu AI trả tool call với args sai schema — Zod safeParse catch, truyền raw args thay vì drop. UI vẫn render, không blank. Đây là failure-visible design — team thấy chỗ nào cần tighten schema."*

**Đừng:**
- Đừng demo quá nhiều scenarios/personas (12 combos nhưng show 5-6 là đủ). Audience sẽ lạc.
- Đừng nói "AI hiểu user" — nói **"AI classify intent với confidence"**. Technical term, không hype.

**Chốt section:**
> "Demo 3 = **AI đọc context, đề xuất, user react**. Đây là chỗ:
> - Content swap không đủ — cần layout restructure.
> - Rule engine bùng nổ tổ hợp — n signals × m personas × m scenarios — không thể pre-author.
> - GenUI win rõ — nếu bạn chấp nhận latency + cost + cần safety net.
>
> Production gap thật sự không phải ở AI layer — mà ở signal pipeline. Bắt đầu từ 3 signals đơn giản nhất: time of day, last order behavior, weather. GenUI layer là phần cuối, không phải phần đầu.
>
> Nếu app của khách bạn là consumer-facing và có nhiều signal, đây là killer case."

**Câu hỏi thường gặp sau Demo 3:**

- **"Đây chẳng phải rule engine tinh vi hơn không?"** → Rule engine hoạt động tốt khi signals ít và tổ hợp manageable. Thêm signals vào: 4 personas × 3 scenarios × weather × behavior × time = hàng chục ngàn tổ hợp rules phải maintain riêng. GenUI collapse về 1 prompt, thêm signal chỉ cần thêm 1 dòng context. Trade-off: mất determinism.
- **"Nếu user reload, layout có đổi không? Non-determinism xử lý sao?"** → Cache layout result per user per session — GenUI chỉ re-trigger khi signal thay đổi đủ lớn (weather drop >5°C, new search abandon event). Session đang dùng thì giữ nguyên layout.
- **"Latency 3-4 giây cho consumer app là quá chậm?"** → Pattern production: GenUI chạy background khi user đang ở splash screen hoặc app loading. Layout ready trước khi home render. User không thấy latency — họ thấy kết quả đã compose sẵn.
- **"Cần build bao nhiêu infra trước khi chạy được?"** → Signal pipeline là phần tốn công nhất. Start small: 3 signals (time, last order, weather API) → 1 GenUI endpoint → 1 persona. Prove value trước khi scale lên full telemetry pipeline.
- **"Data signals có PII không? Compliance?"** → Signal bundle chỉ cần aggregated behavior — không cần user ID hay personal data. Model nhận context bundle (thời tiết, số đơn gần đây, session minutes), không nhận tên hay địa chỉ thật.

---

### 🎬 Q&A + Wrap-up (50-55 phút)

**Wrap-up 2 phút trước Q&A:**

Vẽ lại diagram:
```
                    Cost    Determinism   Use when
FE Static           ~0      100%          95% form/UI đơn giản
BE SDUI             low     high          Admin cần tự edit, schema có rule
GenUI               ~3s     ~80% raw      Không thể pre-author: unpredictable input, huge context combo. Fail → raw AI + Zod issues → fallback
```

**Message cuối:**
> "3 takeaways:
> 1. GenUI không phải cho mọi thứ. **Đừng dùng nó cho form nếu không thực sự cần.**
> 2. Killer case là **adaptive consumer UI** — Demo 3 pattern.
> 3. Có pattern production-ready rồi: BE proxy + Zod validate + failure-visible UX + fallback + metrics + disclaimer mock. **Code ở repo, đi làm được ngay.**"

---

## 3. Q&A — Câu hỏi cross-cutting (không thuộc demo cụ thể)

> Câu hỏi gắn với demo cụ thể đã được list dưới mỗi demo section ở trên.

### Q: "Cost của GenUI thực tế bao nhiêu một request?"
**A:** Tuỳ model và demo. Demo 1 & 2 dùng MiniMax M2.7 — ~$0.0003-0.001/request. Demo 3 dùng claude-3-5-haiku — ~$0.009/layout. **Ở scale consumer app thì không free** — cần cache, cần threshold để gate (chỉ trigger GenUI khi traditional không cover).

### Q: "Security concerns — prompt injection?"
**A:** Big topic. Ngắn gọn: (1) BE proxy — API key không bao giờ ra client, (2) output Zod validate → reject rác trước khi render, (3) AI output là **data** renderer đọc, không phải executable code — attack surface nhỏ hơn nhiều so với code gen. Discuss sâu sau nếu muốn.

### Q: "Team nhỏ có nên làm GenUI không?"
**A:** **Không nên bắt đầu từ GenUI.** Thứ tự: (1) FE static trước, (2) SDUI khi business cần tự config, (3) GenUI chỉ khi thực sự hit wall. Start small — 3 signals, 1 persona, 1 endpoint.

### Q: "Tại sao chọn model khác nhau cho mỗi demo?"
**A:** Constraint khác nhau. Demo 1 & 2: MiniMax M2.7 — rẻ, streaming OK, đủ cho JSON + tool calling cơ bản. Demo 3: bắt buộc Claude — model duy nhất vừa stream explanation text vừa call tools trong cùng response (GPT-4o-mini, DeepSeek, Minimax đều fail pattern này). Production: benchmark riêng — Gemini Flash cho JSON, GPT-4o-mini cho tool calling, Claude cho agentic compose.

### Q: "Có thể self-host model không?"
**A:** Có — Llama 3.1 70B, Qwen 2.5 với tool calling OK. Trade-off: cost infra vs cost API. Scale < 1M request/tháng thì API thường rẻ hơn self-host + engineering overhead.

### Q: "Business client của chúng tôi chưa tin AI. Làm sao sell?"
**A:** Demo 1 chính là answer. Show 3 modes với metrics rõ ràng — latency, cost, determinism side by side. Đừng bán "AI revolution". Bán **"escalation path — khi nào cần AI, khi nào không"**. Business thích determinism + cost control — GenUI là option cuối cùng trong escalation path, không phải default.

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
- [ ] Demo 2 streaming thật, 3 intent (chart / card list / form inline) chạy mượt.
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
