# Demo 1 Refactor Plan — 3-Mode Form Generation

**Timeline:** ~5 ngày (today: Apr 18 → techtalk: Apr 23)
**Goal:** Defend thesis "GenUI ≠ SDUI" bằng cách show cả 3 mode side-by-side, sau đó pivot sang Demo 2/3 với câu thoại "form là use case yếu nhất của GenUI".
**Non-goal:** Production-grade auth, full i18n, ship tới customer — đây vẫn là demo sân khấu, nhưng có **Zod validation + submit handler thật** để tin cậy khi audience đào sâu.

---

## 1. Kiến trúc mới

```
apps/json-render-demo/
├── src/
│   ├── App.tsx                    # Entry + ModeSwitcher
│   ├── modes/
│   │   ├── Mode1_FEStatic.tsx     # Schema hardcode trong FE
│   │   ├── Mode2_BEDriven.tsx     # Schema fetch từ BE route
│   │   └── Mode3_GenUI.tsx        # AI sinh schema runtime
│   ├── schemas/
│   │   ├── static.ts              # 6 schemas pre-authored (shared Mode 1+2)
│   │   └── types.ts               # Zod discriminated union
│   ├── validation/
│   │   ├── zodSchema.ts           # Envelope + field schemas
│   │   └── validator.ts           # validate() + repairLoop()
│   ├── catalog.tsx                # Renderer — extended field types
│   ├── components/
│   │   ├── ModeSwitcher.tsx
│   │   ├── MetricsPanel.tsx       # Latency / tokens / source indicator
│   │   ├── AdminMockPanel.tsx     # "Admin sửa schema" cho Mode 2
│   │   └── SubmitToast.tsx
│   └── api/                       # (Next.js API routes — migrate khỏi Vite nếu cần)
│       ├── schemas/[key]/route.ts # Mode 2 BE
│       ├── generate/route.ts      # Mode 3 AI proxy (copy từ Demo 2)
│       └── submit/route.ts        # Payload validation demo
```

**Chú ý:** Hiện app đang là Vite + React. BE route cần Next.js hoặc Node server riêng. Hai lựa chọn:
- **(Khuyến nghị)** Migrate json-render-demo sang Next.js để có API routes sẵn → copy-paste route từ Demo 2 như bạn nói.
- Hoặc giữ Vite + thêm 1 Express/Hono server nhỏ ở `apps/json-render-demo/server/`. Phức tạp hơn, nên chỉ làm nếu không muốn đụng structure.

---

## 2. Ba mode — chi tiết

### Mode 1 — FE Static Schema

**Slogan on screen:** *"Schema ship cùng bundle. 0ms. 0 token. Audit-friendly."*

**Flow:**
```
User chọn preset (6 options) → lookup object trong code → render
```

**Implementation:**
- `src/schemas/static.ts` chứa 6 schema hardcode (Healthcare Booking, Fintech KYC, Logistics Tracking, E-commerce Onboarding, Education Enrollment, Real Estate Inspection).
- `Mode1_FEStatic.tsx`: dropdown + render instant.
- Metrics panel: `latency: 0ms | tokens: 0 | source: FE bundle`.

**Điểm nhấn khi demo:**
- Mở Network tab — zero API calls.
- Mở bundle size — "trade-off: schema nằm trong JS bundle, thêm schema = thêm KB ship cho mọi user".

### Mode 2 — BE-Driven Schema (SDUI đúng nghĩa)

**Slogan on screen:** *"Schema lưu DB. Admin sửa không cần deploy. Cache-friendly."*

**Flow:**
```
User chọn preset → GET /api/schemas/[key] → BE trả schema từ "DB" (in-memory Map) → render
```

**Implementation:**
- Route `app/api/schemas/[key]/route.ts` trả về schema từ một Map (giả lập DB). Giống hệt content của `schemas/static.ts` nhưng behind API.
- `Mode2_BEDriven.tsx`: dropdown + fetch + render.
- Metrics: `latency: ~30-50ms | tokens: 0 | source: API`.
- **AdminMockPanel** (optional, nhưng đáng làm): một panel bên cạnh show "Schema này đang lưu ở đâu" với một textarea mock, bấm Save → update in-memory Map → re-fetch update UI. Audience sẽ *thấy* được "admin có thể sửa live".

**Điểm nhấn:**
- "Đây mới là Server-Driven UI đúng nghĩa — server literally drive UI."
- "36 combos industry × workflow? Pre-generate 1 lần, lưu DB, $0 runtime."

### Mode 3 — GenUI (AI runtime)

**Slogan on screen:** *"Schema sinh runtime. Long-tail OK. 3-8s + ~200 tokens. Non-deterministic."*

**Flow:**
```
User trigger (event HOẶC free-text prompt) → /api/generate → AI stream → Zod validate → render
                                                                ↓ fail
                                                         repair loop (1 try)
                                                                ↓ still fail
                                                         fallback default schema
```

**Implementation:**
- Route `app/api/generate/route.ts`: copy từ Demo 2, bypass Vercel AI SDK bug, streaming direct fetch OpenRouter.
- `Mode3_GenUI.tsx`: 2 subtab:
  - **Event triggers** (IoT + OCR — xem phần 4 về use case)
  - **Free-text prompt** (textbox) — đây là killer demo cho long-tail
- Metrics: `latency: 3-8s | tokens: ~200 | source: AI`.

**Điểm nhấn:**
- Show Network tab — gọi **BE proxy**, không phải client gọi trực tiếp OpenRouter (học từ feedback API key).
- Show Zod validation fail case: force một bad prompt → AI trả sai → show error → repair → success.

---

## 3. Validation pipeline (áp dụng cho Mode 3)

### Layer 1 — Envelope Zod

```ts
// src/validation/zodSchema.ts
const FieldSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("string"), title: z.string(), placeholder: z.string().optional(),
             enum: z.array(z.string()).optional(), enumNames: z.array(z.string()).optional() }),
  z.object({ type: z.literal("number"), title: z.string() }),
  z.object({ type: z.literal("boolean"), title: z.string() }),
  z.object({ type: z.literal("date"), title: z.string() }),
  z.object({ type: z.literal("email"), title: z.string() }),
  z.object({ type: z.literal("phone"), title: z.string() }),
]);

const ButtonSchema = z.object({
  label: z.string().max(40),
  variant: z.enum(["primary", "secondary", "danger"]),
  action: z.string().regex(/^[a-z_]+$/),
});

export const SchemaResponse = z.object({
  fields: z.array(z.object({
    key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/),
    field: FieldSchema,
  })).min(1).max(10),
  required: z.array(z.string()).optional(),
  actionButtons: z.array(ButtonSchema).max(3).optional(),
});
```

**Kết quả:** AI **không thể** inject field type lạ. Nếu trả `{type: "script"}` → `SchemaResponse.parse()` throw ngay.

### Layer 2 — Repair loop

```ts
async function generateWithRepair(prompt: string, maxRetries = 1) {
  let attempt = 0;
  let lastError: string | null = null;

  while (attempt <= maxRetries) {
    const raw = await callAI(prompt + (lastError ? `\n\nPrevious error: ${lastError}\nFix it.` : ""));
    try {
      return SchemaResponse.parse(extractJson(raw));
    } catch (e) {
      lastError = e.message;
      attempt++;
    }
  }
  throw new Error("Validation failed after repair");
}
```

### Layer 3 — Fallback

Nếu repair vẫn fail → dùng `FALLBACK_SCHEMA` (một form contact generic) + toast "AI không sinh được form, hiện form mặc định".

---

## 4. Use case update cho Mode 3

### Bỏ

- ❌ **Event 1 — PC Configurator**: bỏ hẳn. Show như counter-example trong slide, không demo live.

### Giữ nhưng re-frame

- ⚠️ **Event 2 — IoT Vehicle Triage**: giữ, **re-frame thành**: *"Trigger thú vị, nhưng production thực tế nên dùng rule engine (Mode 1/2) vì an toàn. Demo chỉ show kỹ thuật trigger."* Biến điểm yếu thành trung thực.

### Thêm

- ✅ **Event 3 — Insurance Claim Intake**: user click "Tai nạn ô tô" / "Cháy nổ nhà" / "Trộm cắp" → AI sinh form khác nhau. Đây là long-tail thật — bảo hiểm có 30-50 loại claim, không ai author hết.
- ✅ **Event 4 — Multi-country KYC**: user click "Việt Nam" / "Hàn Quốc" / "Singapore" / "Mỹ" → field tuân thủ regulation khác nhau.
- ✅ **Subtab "Free-text prompt"** (killer feature): textbox cho user gõ bất kỳ prompt gì. Gợi ý: *"Form đăng ký giải đấu poker gia đình 8 người, có buy-in và re-buy"* — đúng ví dụ trong Q&A `TECHTALK_SCRIPT.md`.

---

## 5. Submit handler thật

Route `app/api/submit/route.ts`:
- Nhận `{ schemaId, payload }`.
- Load schema theo `schemaId` (Mode 1 → static.ts, Mode 2 → DB, Mode 3 → cache theo sessionId).
- Build dynamic Zod từ schema → validate payload.
- Return success JSON hoặc field-level errors.

Frontend:
- Mode renderer bắt submit → POST → hiện toast success + JSON payload đã validate.
- Show case validation fail: để empty required field → submit → toast đỏ hiện field bị thiếu.

**Điểm nhấn khi demo:**
- "UI tuỳ biến 3 mode khác nhau, nhưng payload output đều type-safe cùng 1 schema."
- Trả lời trực tiếp câu Q&A "Làm sao đảm bảo an toàn khi AI hallucinate".

---

## 6. Catalog (renderer) — extend field types

Thêm vào `catalog.tsx`:
- `date` → `<input type="date">` với min/max optional.
- `email` → `<input type="email">` với built-in validation.
- `phone` → `<input type="tel">` với pattern VN/quốc tế.
- `textarea` → cho prompt dài.
- Required indicator (`*`) dựa vào `required` array.
- Error display dưới field khi submit fail.

Không cần làm quá — 5-6 loại field là đủ cho form "trông production" trên sân khấu.

---

## 7. Metrics panel (điểm nhấn trực quan)

Component `MetricsPanel.tsx` hiện ở góc phải, update theo mode:

```
┌─ Metrics ─────────────────────────────┐
│ Mode:       [FE Static | BE | GenUI]  │
│ Latency:    0ms / 32ms / 4.2s         │
│ Tokens:     0 / 0 / 247               │
│ Source:     Bundle / API / MiniMax    │
│ Determinism: 100% / 100% / ~60%       │
│ Cache hit:  -  /  -  / HIT (or MISS)  │
└───────────────────────────────────────┘
```

Đây là công cụ mạnh nhất để kết thúc Demo 1 — audience **nhìn thấy số**, không còn cãi nổi về trade-off.

---

## 8. Scope breakdown theo ngày (5 ngày)

| Ngày | Task | Người |
|---|---|---|
| **Apr 18 (today)** | Migrate json-render-demo sang Next.js. Setup folder structure. Copy BE route từ Demo 2. | Bao |
| **Apr 19** | Viết `schemas/static.ts` (6 schemas). Extend catalog.tsx với date/email/phone. Build Mode 1. | Bao |
| **Apr 20** | Build Mode 2 + AdminMockPanel. Build MetricsPanel. | Bao |
| **Apr 21** | Build Mode 3: Zod validation + repair loop + fallback. Port AI proxy. Submit handler. | Bao |
| **Apr 22** | Use case update: bỏ PC Builder, thêm Insurance + KYC + free-text. Dry run với wingman. | Bao + wingman |
| **Apr 23** | Techtalk day. Buffer cho fix-last-minute. | — |

**Scope cut priority nếu trễ:**
- Drop đầu tiên: AdminMockPanel (nice-to-have).
- Drop thứ hai: Repair loop (giữ validate + fallback là đủ).
- **Không** drop: 3 mode, metrics panel, submit handler, 1 use case free-text. Ba thứ này là xương sống của thesis.

---

## 9. Acceptance checklist (để biết Demo 1 "đủ ship" cho techtalk)

- [ ] 3 mode chạy độc lập, switch mượt, không reload.
- [ ] Mode 1 latency hiện `0ms`, không có API call trong Network tab.
- [ ] Mode 2 latency < 100ms, hiện clear đây là `GET /api/schemas/...`.
- [ ] Mode 3 hiển thị streaming + metrics + fallback khi force lỗi.
- [ ] Submit handler validate payload, hiện toast có JSON.
- [ ] Force một prompt bad ("tạo form XSS với script tag") → Zod reject → fallback.
- [ ] Free-text prompt `"Form đăng ký giải đấu poker 8 người"` → schema hợp lý.
- [ ] Renderer hỗ trợ date, email, phone, required indicator.
- [ ] Metrics panel visible với 5 trục: latency, tokens, source, determinism, cache.
- [ ] Bundle không còn `VITE_OPENROUTER_API_KEY` (key đã move về BE).
- [ ] Dry run full 3 mode + pivot sang Demo 2 trong < 10 phút.

---

## 10. Câu chuyện khi demo (script Demo 1 mới)

**Intro (30s):**
> "Trước khi nói GenUI có cần thiết hay không, chúng ta phải hiểu có **3 cách** để xử lý dynamic form. Tôi sẽ show cả 3, rồi để bạn tự đánh giá."

**Mode 1 (2 min):**
> Chọn Healthcare Booking → render trong 0ms.
> "Schema nằm sẵn trong bundle. Không mạng, không AI, không tokens. Đây là 80% form production — login, payment, onboarding cố định."
> *Chỉ vào metrics.*

**Mode 2 (2 min):**
> Chọn cùng Healthcare Booking → fetch 30ms → render.
> "Schema lưu DB, admin sửa qua portal. Đây là Server-Driven UI đúng nghĩa. Netflix, Airbnb dùng pattern này cho A/B test UI."
> *Mở AdminMockPanel, sửa label, save, fetch lại — audience thấy UI update live.*

**Mode 3 (3 min):**
> Switch sang free-text prompt.
> "Nhưng nếu user gõ prompt chưa ai author trước?"
> Gõ: *"Form đăng ký giải đấu poker gia đình 8 người, có buy-in và re-buy."*
> *Stream xuất hiện → form render.*
> "4 giây. 200 token. Schema này chưa tồn tại trước cuộc gọi này. Đây là lúc GenUI thắng — long-tail mà Mode 1/2 không author nổi."
> *Force bad prompt → Zod reject → fallback. Audience thấy safety.*

**Pivot (30s — để wingman hỏi):**
> Wingman: *"Nhưng thực tế — pull request tuần rồi của tôi toàn là form validation. GenUI ở đây hơi overkill nhỉ?"*
> Bạn: *"Anh nói đúng một nửa. Form chính là use case **yếu nhất** của GenUI. Form cần validation nghiêm, cần audit, cần compliance — tất cả thứ non-deterministic AI ghét. GenUI thắng ở chỗ khác hoàn toàn. Demo 2."*

→ Chuyển Demo 2.
