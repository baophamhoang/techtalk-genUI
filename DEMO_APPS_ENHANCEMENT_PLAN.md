# Demo Apps Enhancement Plan

Technical specification for refactoring three demo apps to compare Generative UI (GenUI) against Server-Driven UI (SDUI) and static FE schemas.

## Shared Infrastructure

All three demos share the following infrastructure. Implement once, reuse across apps.

### BE Proxy

- All LLM calls go through a Next.js / Node route handler under `/api/*`.
- OpenRouter API key is read from `process.env.OPENROUTER_API_KEY` on the server only.
- No `VITE_*` or `NEXT_PUBLIC_*` key exposure in client bundles.
- Exception: Demo 1 may keep one mode with a client-side key deliberately, to contrast security posture — flag it clearly in UI.

### Validation Pipeline

Every AI-produced artifact (schema, tool args, layout tree) passes through:

1. **Zod parse** against a discriminated-union schema per artifact type.
2. **Repair loop** — on parse failure, resend to LLM with the Zod error as context, max 2 retries.
3. **Fallback** — if repair fails, render a pre-authored artifact and log `source: 'fallback'`.

Shared helper: `lib/ai/validate.ts` exports `validateOrRepair<T>(schema, rawOutput, { retries, repairCall })`.

### Metrics Panel

Each demo renders a `<MetricsPanel />` showing:

- `latency` — ms end-to-end from request to first render.
- `tokens` — input + output token counts.
- `source` — one of `cache | ai | fallback`.
- `determinism` — percentage match across N repeated runs (computed for Demo 1 only; stubbed elsewhere).

Metrics collector: `lib/metrics/collector.ts`.

### Shared OpenRouter Client

`lib/ai/openrouter.ts` — single wrapper with:

- Model selection (default `minimax/minimax-m2.7`).
- Retry on transient 5xx (max 2).
- Token counting.
- Streaming support via `stream: true` with delta assembly.

### Mock Context Disclaimer

Each demo renders a banner:
> Mock context — production reads from database, telemetry, and analytics pipelines.

Component: `components/MockContextBanner.tsx`.

---

## Demo 1 — Form: 3 Modes Comparison

Location: `apps/json-render-demo/`

### Pattern

Form rendering with three distinct modes side-by-side for direct comparison.

### Current State

- Single-file `App.tsx` calls LLM for every trigger (contradicts docs which claim Mode 1 is SDUI-only).
- `VITE_OPENROUTER_API_KEY` leaks into client bundle.
- No Zod validation on AI output.
- Use cases: PC Configurator (anti-pattern — deterministic rules), IoT triage (risky intent model), small Industry × Workflow matrix.

### Target State

Three modes controllable via tab switcher:

#### Mode 1 — FE Static
- Schema imported from `schemas/fe/*.ts` (TypeScript literals).
- Zero network calls.
- Deterministic.

#### Mode 2 — BE-Driven SDUI
- Schema fetched from `/api/form-schema?mode=sdui&useCase=<id>`.
- BE route reads from a rule engine + schema registry (`lib/sdui/registry.ts`).
- `AdminMockPanel` lets the user edit the schema JSON live; form re-renders on save.

#### Mode 3 — GenUI
- Schema composed from free-text input via `/api/form-schema?mode=genui`.
- Input: user's natural-language description.
- Output: schema validated against discriminated-union Zod schema.
- Fallback: on validation failure after repair loop, render Mode 2 schema.

### Use Cases

Drop:
- PC Configurator (anti-pattern).

Reframe:
- IoT triage — AI composes a follow-up form when an operator reports a sensor issue, not diagnosing the sensor itself.

Add:
- Insurance claim intake.
- KYC adaptive (steps vary by nationality / document type).
- Free-text → form (Mode 3 showcase — e.g., input "register motorbike for Grab driver").

### Field Type Schema

`lib/schemas/field.ts` — discriminated union:

```ts
type Field =
  | { type: 'text'; label: string; required?: boolean; pattern?: string; minLength?: number; maxLength?: number }
  | { type: 'email'; label: string; required?: boolean }
  | { type: 'number'; label: string; min?: number; max?: number; step?: number }
  | { type: 'date'; label: string; min?: string; max?: string }
  | { type: 'select'; label: string; options: { value: string; label: string }[]; multi?: boolean }
  | { type: 'textarea'; label: string; rows?: number; maxLength?: number }
  | { type: 'file'; label: string; accept?: string; maxSize?: number }
  | { type: 'phone'; label: string; country?: string }
  | { type: 'checkbox'; label: string }
  | { type: 'radio'; label: string; options: { value: string; label: string }[] };
```

Schema wrapper:
```ts
type FormSchema = {
  title: string;
  submitLabel: string;
  fields: Field[];
};
```

### Renderer

Extend `catalog.tsx` to support all field types above. Current renderer only handles `string | number | boolean | array | object`.

### Submit Handler

`onSubmit` runs Zod validate against the schema's derived validator. On success, show a success card with submitted JSON. On failure, show field-level errors.

### Acceptance

- Three modes toggle on the same use case.
- Mode 3 falls back to Mode 2 on AI failure (deliberately triggerable via a "fail prompt" button).
- Submit validates end-to-end.
- MetricsPanel shows latency, tokens, source, determinism for all modes.
- No API key present in the client bundle (verifiable via browser Network tab).

---

## Demo 2 — Copilot Command Bar

Location: `apps/stream-ui-demo/`

### Pattern

User-initiated single-shot GenUI. User types a command; AI composes a UI by calling tools in a single LLM turn.

### Current State

- Chat UI with five fixed tools: `showProductCard`, `showForm`, `showStatsGrid`, `showDataTable`, `showAlertBanner`.
- Fake streaming via `__TOOL__...__ENDTOOL__` markers with `stream: false`.
- No Zod validation on tool args.
- Use case unfocused (general-purpose UI composer).

### Target State

**Use case: Internal Dashboard Builder.**

### Tool Set

Replace existing tools with:

- `showKPICard({ label, value, unit?, trend?, sparkline? })`
- `showTimeSeriesChart({ title, xAxis, series[] })`
- `showDistributionChart({ title, kind: 'bar' | 'pie', data[] })`
- `showDataTable({ title, columns[], rows[][], sortable?, filterable? })`
- `showMapView({ title, regions[], metric })` (optional)
- `showAlertBanner({ severity, title, message })`

Remove: `showProductCard`, `showForm`.

### Real Streaming

Replace fake marker streaming with OpenRouter streaming mode:

- `stream: true` in the OpenRouter request.
- Stream deltas parsed into tool-call fragments via `lib/ai/stream-parser.ts`.
- Each completed tool-call emits a server-sent event to the client.
- Client renders each component as its tool-call completes — no wait for the full response.

### Zod Validation

Each tool has a Zod schema in `lib/schemas/tools/*.ts`. Tool args parsed + repair-looped before render.

### Mock Data Layer

BE route `/api/mock-data/:dataset` returns JSON from fixtures under `fixtures/`:
- `fixtures/sales.json`
- `fixtures/orders.json`
- `fixtures/users.json`
- `fixtures/stock.json`

System prompt instructs the LLM to reference dataset names rather than hallucinate numbers. Tool handlers fetch the dataset server-side and inject it into the rendered component.

### Remix Feature

After initial compose, user can click a rendered component and type an edit instruction (e.g., "switch to daily"). Implementation:

- Client sends `{ previousTree, targetComponentId, editInstruction }` to `/api/compose-ui/remix`.
- LLM receives the full tree + edit instruction and returns a patched tool-call for the target component.
- Client replaces only the targeted component; other components preserve state.

### History Panel

Client-side store (React state, no localStorage — Demo 2 is a single session) retains the last 5 compositions. Each entry: `{ prompt, toolCalls[], timestamp }`. Re-run button re-issues the original prompt.

### Acceptance

- Prompt produces a dashboard of 3–5 components.
- Components render progressively as tool-calls stream in.
- Remix preserves unchanged components' state.
- Mock data is real fixture data, not hallucinated numbers.
- MetricsPanel shows real streaming latency (first-token, last-token).

---

## Demo 3 — Adaptive Context-Aware UI

Location: `apps/agentic-ui/`

### Pattern

AI/context-initiated GenUI. The app detects signal changes and restructures UI without user command. Surface: food delivery consumer app.

### Current State

- Multi-turn chat UI — UX indistinguishable from Demo 2.
- Reuses the same five components as Demo 2.

### Target State

Food delivery surface with persona selection, context simulator, three rotation scenarios, and a Signal → Intent → UI pipeline log visible to the user.

### Personas

Four personas with 30-day mock histories. Persona data in `fixtures/personas.json` and `fixtures/order-history.json`. Persona picker at top of the demo.

| ID | Name | Age | City | Profile | Pattern |
|---|---|---|---|---|---|
| `minh` | Minh | 28 | HCM | Office worker | Healthy-leaning, 5 orders/week, office-lunch, AOV 60k |
| `lan` | Lan | 35 | Hanoi | Single mother, 2 kids | Group orders of 3, weekend-heavy, AOV 180k, budget-conscious |
| `tuan` | Tuan | 22 | Da Nang | Student | Late-night (>22:00), AOV 35k, fast/cheap food, freeship chaser |
| `an` | An | 40 | HCM | Family of 4 | Premium spender, AOV 300k, weekend dinner + holidays, quality-focused |

Same scenario + different persona must produce visibly different UI.

### Scenarios

Three scenarios accessible via the Context Simulator panel.

#### Scenario 1 — Baseline (10:00)
- **Signals:** normal weather, active session, no specific triggers.
- **Intent:** baseline.
- **UI:** default home grid (trending section). Persona-specific content but no layout restructure.

#### Scenario 2 — Sudden Weather Shift (14:00)
- **Signals:** temperature drop ≥8°C vs. yesterday, user idle at home location, 0 orders today.
- **Intent:** `weather-shift-comfort-seeking`.
- **UI:** home restructure. Hero banner ("Cold snap"), three curated comfort rows (contents vary per persona), default trending rows hidden.

#### Scenario 3 — Search Abandon (22:30)
- **Signals:** search sequence `query → clear → query → clear → query → clear` within 2 minutes.
- **Intent:** `indecision-noodle-category`.
- **UI:** search blank state replaced with a three-card Mood Picker. Moods curated per persona (e.g., Minh: light / rich / spicy-healthy; Tuan: cheapest / fastest / freeship-eligible).

### Architecture

```
Persona Picker  ─────────────────┐
                                 ▼
Context Simulator  ──►  Signal Collector (aggregates all signals)
                                 ▼
                        Intent Detector (LLM call #1 — cheap model, classifies state)
                                 ▼
                        UI Composer (LLM call #2 — richer model, tool calls)
                                 ▼
                        Render + Metrics + Pipeline Log
```

### Modules

- `lib/signals/collector.ts` — aggregates persona + context into a signal bundle.
- `lib/intent/detector.ts` — `detectIntent(signals): Promise<{ intent: string; confidence: number }>`. Uses a cheap model (`meta-llama/llama-3.1-8b-instruct` or similar).
- `lib/compose/composer.ts` — given intent + persona + signals, calls the richer model with the layout-primitive tool set.
- `components/PipelineLog.tsx` — renders three columns: signals, intent + confidence, tool calls.

### Tool Set (Layout Primitives)

Distinct from Demo 2 — these are layout primitives, not content cards:

- `restructureHome({ hero?, rows: { title, items[] }[], hideDefaultRows? })`
- `showMoodPicker({ prompt, moods: { label, icon, curatedItems[] }[] })`
- `showContextBanner({ tone, title, message })`
- `showCuratedRow({ title, tag, items[], macroBadges?, priceRange? })`

### Intent Threshold

If `confidence < 0.7`, bypass UI composer and render baseline. Log `source: 'fallback'`. Surface decision in PipelineLog.

### Context Simulator Panel

Left-side panel with controls to mutate signals live:

- Time slider (00:00–23:59).
- Weather dropdown (normal | heavy rain | cold snap | heatwave).
- Behavior toggles (idle | search-abandon sequence | cart-abandon | refresh-loop).

Mutations trigger a debounced re-run of Signal Collector → Intent Detector → UI Composer.

### Disclaimer

Render `<MockContextBanner />` prominently:
> Mock context simulator — production reads from weather APIs, analytics events, order databases, device telemetry, and session behavior trackers.

### Acceptance

- Three scenarios accessible from the Context Simulator.
- Four personas switchable; same scenario produces visibly different UIs across personas.
- PipelineLog renders signals, intent + confidence, tool calls.
- Intent threshold gating works — low confidence → baseline fallback.
- Disclaimer banner visible on the demo surface.
- MetricsPanel shows latency for both LLM calls (intent + compose).

---

## File Layout

```
apps/
  json-render-demo/         # Demo 1
    app/page.tsx            # Mode switcher + panels
    app/api/form-schema/route.ts
    components/
      ModeTabs.tsx
      FormRenderer.tsx
      AdminMockPanel.tsx
      MetricsPanel.tsx
    lib/
      schemas/field.ts
      schemas/form.ts
      sdui/registry.ts
    schemas/fe/*.ts         # Mode 1 static schemas
    fixtures/               # Mode 2 sample schemas

  stream-ui-demo/           # Demo 2
    app/page.tsx
    app/api/compose-ui/route.ts
    app/api/compose-ui/remix/route.ts
    app/api/mock-data/[dataset]/route.ts
    components/
      CommandBar.tsx
      DashboardCanvas.tsx
      RemixPrompt.tsx
      HistoryPanel.tsx
      tools/
        KPICard.tsx
        TimeSeriesChart.tsx
        DistributionChart.tsx
        DataTable.tsx
        MapView.tsx
        AlertBanner.tsx
    lib/
      schemas/tools/*.ts
      ai/stream-parser.ts
    fixtures/*.json

  agentic-ui/               # Demo 3
    app/page.tsx
    app/api/intent/route.ts
    app/api/compose/route.ts
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
      intent/detector.ts
      compose/composer.ts
      schemas/primitives/*.ts
    fixtures/
      personas.json
      order-history.json

packages/
  shared/
    lib/
      ai/openrouter.ts
      ai/validate.ts
      metrics/collector.ts
    components/
      MetricsPanel.tsx
      MockContextBanner.tsx
```

## Priority Order

1. Demo 1 — blocks thesis comparison; must ship first.
2. Demo 2 — user-initiated counterpoint.
3. Demo 3 — largest rewrite; scope down to 2 personas + 2 scenarios if needed.

## Scope Reduction Fallbacks

If time-constrained:
- Demo 3: keep personas `minh` + `tuan`, scenarios 2 + 3.
- Demo 2: drop `showMapView`.
- Demo 1: drop free-text → form use case (keep insurance + KYC).
