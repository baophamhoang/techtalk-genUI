# Demo Apps Enhancement Plan

Technical specification for three demo apps that compare Generative UI (GenUI) against Server-Driven UI (SDUI) and static FE schemas for a 55-minute tech talk.

## Shared Infrastructure

All three demos share the following infrastructure. Implement once, reuse across apps.

### Framework

All three apps run on Next.js (App Router). Demo 1 is migrated from Vite to Next.js so every demo uses the same route handler pattern for backend endpoints.

### BE Proxy

- All LLM calls go through Next.js route handlers under `app/api/*/route.ts`.
- OpenRouter API key is read from `process.env.OPENROUTER_API_KEY` on the server only.
- No `NEXT_PUBLIC_*` key exposure in client bundles.

### Shared OpenRouter Client

`packages/shared/src/ai/openrouter.ts` — single wrapper with:

- Model selection (default `minimax/minimax-m2.7`).
- Retry on transient 5xx (max 2, exponential backoff).
- Token counting.
- Streaming support via `stream: true` with SSE delta assembly.
- Helper `extractJson(raw)` that slices the first `{…}` block from a prose response.

### Validation

Each AI-produced artifact is parsed via `zod.safeParse` against an artifact-specific schema at the call site. Failures are rendered to the user as raw AI output + Zod issues — no repair loop. Failures are deliberately visible so the audience sees where production needs to invest.

### Metrics Panel

`packages/shared/src/ui/MetricsPanel.tsx` — stateless prop-driven component:

```ts
type Props = {
  label: string;
  latencyMs: number;
  tokens: number;
  source: 'bundle' | 'api' | 'cache' | 'ai' | 'fallback';
  determinism?: number; // 0..100
};
```

Each demo keeps its own metric state in `useState` and re-renders the panel with new props per call. No global collector, no pub/sub.

### Mock Context Disclaimer

Each demo renders a single line of inline JSX near the top of the surface:
> Mock context — production reads from database, telemetry, and analytics pipelines.

No shared component — the copy is short enough to inline and lets each demo tune the wording.

### Shared Package Surface

```
packages/shared/src/
  ai/openrouter.ts           # callOpenRouter, streamOpenRouter, extractJson
  schemas/formSchema.ts      # FieldSchema, FormSchema, buildPayloadValidator (Demo 1)
  ui/FormRenderer.tsx        # renders a FormSchema (Demo 1)
  ui/MetricsPanel.tsx        # stateless card
  index.ts
```

---

## Demo 1 — Form: 3 Modes Comparison

Location: `apps/json-render-demo/`

### Pattern

Form rendering with three distinct modes side-by-side for direct comparison. Existing Events / Context showcase preserved as the landing page; mode comparison added as a second page.

### Current State

- Vite app. Single-file `App.tsx` with two tabs (Events, Context).
- Both tabs call OpenRouter directly from the client.
- `VITE_OPENROUTER_API_KEY` exposed in the client bundle.
- No Zod validation on AI output.
- Renderer (`catalog.tsx`) handles `string | number | boolean | array | object` only.

### Target State

Migrate the app to Next.js (App Router). Two pages:

- `app/page.tsx` — existing Events / Context UI, wired to a server route for the LLM call so the API key leaves the client bundle.
- `app/compare/page.tsx` — three-mode comparison using `FormRenderer` + `FormSchema` from `@techtalk/shared`.

A small nav strip at the top of each page links to the other.

#### Mode 1 — FE Static

- Schema imported from `schemas/static.ts` (TypeScript literals).
- Zero network calls. Deterministic.
- Latency measured via `performance.now()` wrapping a `setState`.
- Record `{ source: 'bundle', determinism: 100, tokens: 0 }`.

#### Mode 2 — BE-Driven SDUI

- Schema fetched from `app/api/sdui/forms/[id]/route.ts`.
- Route returns entries from the same `schemas/static.ts` fixture map with a simulated 200–400 ms delay.
- Client memoises in React state to demonstrate cache hit on second fetch.
- Record `{ source: 'api' | 'cache', latencyMs, tokens: 0 }`.

#### Mode 3 — GenUI

- `app/api/genui/form/route.ts` accepts `{ bucket, description }`.
- Route calls `callOpenRouter`, runs `extractJson`, then `FormSchema.safeParse(...)`.
- On success: return `{ schema, latencyMs, tokens }`.
- On failure: return `{ ok: false, raw, issues }`. Client renders the raw AI JSON + the Zod issues in place of the form, plus a "retry" button.
- Record `{ source: 'ai' | 'fallback', latencyMs, tokens, determinism? }`.

##### GenUI Scenarios

Two scenario buckets in `src/scenarios/genui.ts`. Each bucket presets the system prompt and exposes a describe-textarea + "Generate form" button:

- **Bucket 1 — Dev / ops artifact triage.** Input: a paste of an unknown artifact (stack trace, config snippet, API response, slow query, log tail). The prompt primes the model to produce follow-up fields appropriate for the inferred artifact type (env vars for stack trace, topology for config, etc.).
- **Bucket 2 — Consumer service intake.** Input: a free-text description of a reactive problem across unbounded trades (plumbing, HVAC, auto, vet, IT helpdesk). The prompt primes the model to produce an intake form specific to the trade inferred from the description.

Flow in both buckets: describe once → generate → fill → submit → done. Single-turn, no chat.

##### Visual Guard Rails (Mode 3)

To keep Mode 3 visually distinct from Demo 2 (chatbox):

- No chat bubbles, no message history, no typing indicator.
- Single textarea input labelled by bucket ("Mô tả sự cố" / "Mô tả yêu cầu dịch vụ").
- One action button ("Tạo form phù hợp").
- Generated form appears below the input as a reveal — not streamed token-by-token.
- Form has an explicit submit button; submit is the terminal state.

##### Tech Pattern (Mode 3)

One-shot structured output: a single `callOpenRouter` call returns a complete JSON blob parsed as `FormSchema`. Conceptually equivalent to Vercel AI SDK's `generateObject`. No tool calls, no streaming of UI components, no multi-turn state.

### Use Cases (static schemas)

`apps/json-render-demo/src/schemas/static.ts`:

- Healthcare booking.
- Fintech KYC.
- Insurance claim (auto).
- Logistics tracking.
- E-commerce onboarding.
- Real estate inspection.

### Field Type Schema

`packages/shared/src/schemas/formSchema.ts` — discriminated union:

```ts
type Field =
  | { type: 'text'; label: string; required?: boolean; pattern?: string; minLength?: number; maxLength?: number; placeholder?: string }
  | { type: 'email'; label: string; required?: boolean; placeholder?: string }
  | { type: 'number'; label: string; required?: boolean; min?: number; max?: number; step?: number }
  | { type: 'date'; label: string; required?: boolean; min?: string; max?: string }
  | { type: 'select'; label: string; required?: boolean; options: { value: string; label: string }[]; multi?: boolean }
  | { type: 'textarea'; label: string; required?: boolean; rows?: number; maxLength?: number }
  | { type: 'phone'; label: string; required?: boolean; country?: string }
  | { type: 'checkbox'; label: string; required?: boolean }
  | { type: 'radio'; label: string; required?: boolean; options: { value: string; label: string }[] }
  | { type: 'file'; label: string; required?: boolean; accept?: string; maxSize?: number };

type FormSchema = {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  fields: { key: string; field: Field }[];
};
```

### Renderer

`packages/shared/src/ui/FormRenderer.tsx` renders all field types above with an exhaustive `switch` over `field.type`. Compile-time exhaustiveness enforced with a `never` guard.

### Submit Handler

`onSubmit` runs `buildPayloadValidator(schema).safeParse(payload)`. On success, show a success card with submitted JSON. On failure, show field-level errors inline.

### Env

`.env.local`:
```
OPENROUTER_API_KEY=sk-...
```

No `NEXT_PUBLIC_*` variants for this key.

### Acceptance

- Landing page preserves the Events / Context flow; API key is not present in the client bundle (verifiable via browser Network tab).
- `/compare` page renders all three modes on the same set of schemas.
- Mode 2 shows "cache hit" on second fetch of the same schema.
- Mode 3 renders raw JSON + Zod issues on validation failure without crashing the page.
- Submit validates end-to-end on any rendered form.
- MetricsPanel shows latency, tokens, and source for every render.

---

## Tech Pattern: Demo 1 vs Demo 2

| Axis | Demo 1 (Mode 3) | Demo 2 |
|---|---|---|
| Output shape | One atomic JSON blob matching a single schema | Interleaved stream of prose tokens + tool-call fragments |
| LLM API pattern | `generateObject` equivalent (structured output) | `streamUI` equivalent (streaming tool-call rendering) |
| Component classes exposed to LLM | Exactly one: `FormSchema` | Palette of N: chart, card list, form, kpi, table |
| Turn count | 1 (describe → generate → fill → submit) | N (multi-turn conversation with history) |
| Naming lineage | Structured output — existed since 2023 | "Generative UI" — coined by Vercel AI SDK in 2024 |

`json-render-demo` exposes a single component class (form) to the LLM — that is its ceiling. `stream-ui-demo` exposes a palette and lets the LLM compose from it at runtime; this is why chat is GenUI's native habitat and form-only is GenUI's narrowest use case.

---

## Demo 2 — Chat Assistant with Inline UI

Location: `apps/stream-ui-demo/`

### Pattern

Multi-turn chatbox where the AI's reply may interleave prose with widgets streamed inline between message text. Each turn the AI can choose zero or more widgets from a component palette.

### Current State

- Chat UI with five fixed tools (`showProductCard`, `showForm`, `showStatsGrid`, `showDataTable`, `showAlertBanner`).
- Fake streaming via `__TOOL__...__ENDTOOL__` markers with `stream: false`.
- No Zod validation on tool args.
- Use case unfocused (general-purpose UI composer).

### Target State

**Use case: Chat assistant with inline UI.** One chatbox, message history visible, AI interleaves prose with inline widgets per turn. Three target intents demonstrated on stage:

- **Analytics** — "Doanh thu tháng 3 theo kênh" → inline bar chart.
- **Navigation / choice** — "Tìm khách sạn Đà Nẵng tối nay dưới 5 triệu" → inline card list.
- **Input capture** — "Đặt bàn nhà hàng cho 4 người tối mai" → inline form widget; submit posts the payload back into the chat as a user turn, conversation continues.

### Tool Set

Chat-oriented palette emphasising component variety (viz + navigation + input):

- `show_chart({ title, kind: 'line' | 'bar', series })` — data visualisation
- `show_card_list({ title, cards: { title, subtitle?, meta?, ctaLabel?, ctaHref? }[] })` — navigation / choice
- `show_form({ title, fields, submitLabel })` — input capture; payload reuses `FormSchema` from `@techtalk/shared` so the field renderer is shared with Demo 1
- `show_kpi({ title, value, delta })` — single-metric callout
- `show_table({ title, columns, rows })` — structured comparison

Each tool has a Zod schema in `lib/schemas/tools/*.ts`. Tool args parsed via `safeParse` at the call site; malformed tool calls render a small "skipped" badge inline in the assistant message.

### Real Streaming

Replace fake marker streaming with real OpenRouter streaming via `streamOpenRouter` from `@techtalk/shared`:

- `stream: true` in the request.
- Stream deltas parsed into prose tokens + tool-call fragments in `lib/ai/stream-parser.ts`.
- Each completed tool-call renders its widget inline the moment its args finish — widgets appear between prose tokens, not at the end.

### Mock Data Layer

BE route `app/api/mock-data/[dataset]/route.ts` returns JSON from fixtures under `fixtures/`:

- `fixtures/sales.json`
- `fixtures/hotels.json`
- `fixtures/restaurants.json`

System prompt instructs the LLM to reference dataset names rather than hallucinate numbers. The chat BE fetches the dataset server-side when a tool-call references it and embeds the result into the tool's args.

### Tech Pattern

Streaming tool calls: LLM emits a mixed stream of prose + tool-call fragments. Each completed tool-call renders its widget immediately in the assistant's message. Conceptually equivalent to Vercel AI SDK's `streamUI`. Multi-turn — the full conversation history is sent on each turn, including submitted form payloads as prior user turns.

### Metrics

`MetricsPanel` shows time-to-first-token, total latency, tokens, and tool-call count per turn. Inline `useState` in the page component.

### Acceptance

- Three intents (analytics, nav, input capture) each trigger the correct tool family.
- Widgets render inline between prose tokens, not deferred to end of message.
- Form widget submit is round-tripped back as a user turn; conversation continues.
- Mock data is real fixture data, not hallucinated numbers.
- Malformed tool args render a "skipped" badge inline without breaking the turn.
- MetricsPanel shows first-token and last-token latency.

---

## Demo 3 — Adaptive Context-Aware UI

Location: `apps/agentic-ui/`

### Pattern

AI/context-initiated GenUI. The app restructures UI based on a persona + context bundle with no user command. Surface: food delivery consumer app.

### Current State

- Multi-turn chat UI — UX indistinguishable from Demo 2.
- Reuses the same five components as Demo 2.

### Target State

Food delivery surface with persona selection, context simulator, three scenario buttons, and a Signal → UI pipeline log visible to the user.

### Personas

Four personas with 30-day mock histories in `fixtures/personas.json`:

| ID | Name | Age | City | Profile | Pattern |
|---|---|---|---|---|---|
| `minh` | Minh | 28 | HCM | Office worker | Healthy-leaning, 5 orders/week, office-lunch, AOV 60k |
| `lan` | Lan | 35 | Hanoi | Single mother, 2 kids | Group orders of 3, weekend-heavy, AOV 180k, budget-conscious |
| `tuan` | Tuan | 22 | Da Nang | Student | Late-night (>22:00), AOV 35k, fast/cheap food, freeship chaser |
| `an` | An | 40 | HCM | Family of 4 | Premium spender, AOV 300k, weekend dinner + holidays, quality-focused |

Same scenario + different persona produces visibly different UI.

### Scenarios

Three scripted scenarios accessible via labelled buttons on the Context Simulator panel.

#### Scenario 1 — Baseline (10:00)
- **Signals:** normal weather, active session, no specific triggers.
- **UI:** default home grid (trending section). Persona-specific content, no layout restructure.

#### Scenario 2 — Sudden Weather Shift (14:00)
- **Signals:** temperature drop ≥8°C vs. yesterday, user idle at home location, 0 orders today.
- **UI:** home restructure. Hero banner ("Cold snap"), three curated comfort rows (contents vary per persona), default trending rows hidden.

#### Scenario 3 — Search Abandon (22:30)
- **Signals:** search sequence `query → clear → query → clear → query → clear` within 2 minutes.
- **UI:** search blank state replaced with a three-card Mood Picker. Moods curated per persona.

### Pipeline

Single LLM call per scenario:

```
Persona Picker ──┐
                 ▼
Context Simulator ──►  Signal Bundle ──►  UI Composer (one LLM call)
                                                  ▼
                                    Validate + Render + Pipeline Log
```

The prompt includes persona profile, full signal bundle, and tool definitions. Simpler than a two-model intent + compose pipeline; easier to inspect on stage. Production would likely split this into detect + compose for cost reasons — call that out verbally.

### Modules

- `lib/signals/collector.ts` — aggregates persona + scenario inputs into a signal bundle.
- `lib/compose/composer.ts` — given the bundle, calls OpenRouter with the layout-primitive tool set and returns the parsed result.
- `components/PipelineLog.tsx` — two columns: signal bundle (pretty-printed JSON), resulting tool calls.

### Tool Set (Layout Primitives)

Distinct from Demo 2 — these are layout primitives, not content cards:

- `restructureHome({ hero?, rows: { title, items[] }[], hideDefaultRows? })`
- `showMoodPicker({ prompt, moods: { label, icon, curatedItems[] }[] })`
- `showContextBanner({ tone, title, message })`
- `showCuratedRow({ title, tag, items[], macroBadges?, priceRange? })`

### Validation

Tool args parsed via `zod.safeParse` at render time. On failure, the pipeline log shows the raw tool call + Zod issues, and the surface falls back to the baseline home grid. The fallback is visible in the log, not hidden.

### Context Simulator Panel

Left-side panel that shows the current signal bundle and three scenario buttons. No free-form sliders in the demo — the three scenarios are scripted because live signal tweaking wastes stage time.

### Disclaimer

Inline banner on the demo surface:
> Mock context simulator — production reads from weather APIs, analytics events, order databases, device telemetry, and session behavior trackers.

### Acceptance

- Three scripted scenarios accessible from the Context Simulator.
- Four personas switchable; same scenario produces visibly different UIs across personas.
- PipelineLog renders the signal bundle and the resulting tool calls for each run.
- Validation failures visibly fall back to baseline with the failure reason shown.
- Disclaimer banner visible on the demo surface.
- MetricsPanel shows latency and tokens for each run.

---

## File Layout

```
apps/
  json-render-demo/         # Demo 1 (Next.js)
    app/
      layout.tsx
      page.tsx              # Events / Context (existing flow, migrated)
      compare/page.tsx      # Mode 1 / 2 / 3 comparison
      api/
        legacy-stream/route.ts    # server proxy for the existing Events/Context flow
        sdui/forms/[id]/route.ts  # Mode 2
        genui/form/route.ts       # Mode 3
    src/
      schemas/static.ts     # 6 Vietnamese static schemas
      compare/
        Mode1Static.tsx
        Mode2Sdui.tsx
        Mode3Genui.tsx
      catalog.tsx           # kept for the existing Events/Context renderer
    next.config.mjs
    package.json

  stream-ui-demo/           # Demo 2 (Next.js — unchanged framework)
    app/
      page.tsx
      api/
        chat/route.ts
        mock-data/[dataset]/route.ts
    components/
      ChatInput.tsx
      ChatThread.tsx
      tools/
        Chart.tsx            # show_chart (line | bar)
        CardList.tsx         # show_card_list
        InlineForm.tsx       # show_form (reuses FormRenderer)
        KPICard.tsx          # show_kpi
        Table.tsx            # show_table
    lib/
      schemas/tools/*.ts
      ai/stream-parser.ts
    fixtures/*.json

  agentic-ui/               # Demo 3 (Next.js — unchanged framework)
    app/
      page.tsx
      api/
        compose/route.ts
    components/
      PersonaPicker.tsx
      ContextSimulator.tsx
      HomeSurface.tsx
      SearchSurface.tsx
      PipelineLog.tsx
      primitives/
        HomeRestructure.tsx
        MoodPicker.tsx
        ContextBanner.tsx
        CuratedRow.tsx
    lib/
      signals/collector.ts
      compose/composer.ts
      schemas/primitives/*.ts
    fixtures/
      personas.json

packages/
  shared/
    src/
      ai/openrouter.ts
      schemas/formSchema.ts
      ui/FormRenderer.tsx
      ui/MetricsPanel.tsx
      index.ts
    package.json
    tsconfig.json
```

## Priority Order

1. Demo 1 — migrate to Next.js; port Events / Context to `app/page.tsx`; verify existing flow still works end-to-end behind a server route.
2. Demo 1 — `/compare` page with Mode 1 (static).
3. Demo 1 — Mode 2 (SDUI route with simulated delay + cache).
4. Demo 1 — Mode 3 (GenUI route with `safeParse`, failure-visible UX).
5. Demo 2 — reshape tool palette (`show_chart` / `show_card_list` / `show_form` / `show_kpi` / `show_table`) and render widgets inline inside assistant messages.
6. Demo 2 — swap direct fetch calls for `streamOpenRouter` from shared; parse tool args with Zod.
7. Demo 2 — mock data fixtures + dataset route.
8. Demo 3 — persona picker + signal bundle + three scenarios with one compose call each.

Stop at any point the narrative holds — Demo 1 through step 4 is enough to land the thesis.

## Scope Reduction Fallbacks

If time-constrained:

- Demo 1: ship Modes 1 + 3 only, skip Mode 2 (SDUI is the easiest story to explain verbally without a live demo).
- Demo 2: drop mock data layer; let the LLM hallucinate numbers and call that out verbally.
- Demo 3: keep personas `minh` + `tuan` and scenarios 2 + 3 only.
