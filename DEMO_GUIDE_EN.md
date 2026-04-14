# Demo Guide — Generative UI

> **What is Generative UI?** Instead of developers hardcoding every screen, the system *generates* UI dynamically based on data, context, or natural language. The four demos below illustrate a spectrum of trade-offs: from zero-latency rule engines to conversational AI agents that build and refine interfaces across multiple turns.

---

## Demo 1 — Rule Engine Selects a Pre-defined JSON Schema

### How It Works

```
User selects context (industry + workflow)
        ↓
Rule Engine (if-else logic)
        ↓
Picks 1 of N pre-defined schemas
        ↓
JSON Schema Renderer → UI
```

All logic runs on the client. No AI, no API call. The rule engine is a `selectSchema(industry, workflow)` function that returns a matching schema object from a fixed registry.

**Example rule:**
```ts
if (industry === "healthcare" && workflow === "booking") {
  return SCHEMAS.healthcareBooking;
}
```

**Example schema:**
```json
{
  "type": "object",
  "props": {
    "properties": {
      "patientName": { "type": "string", "title": "Patient Name" },
      "doctor":      { "type": "string", "title": "Doctor", "enum": ["Dr. Minh", "Dr. Lan"] }
    },
    "actionButtons": [{ "label": "Book Appointment", "variant": "primary" }]
  }
}
```

### Advantages
- **Instant** — no latency, no network required
- **Fully predictable** — same input always produces same output
- **Zero API cost**
- **Maximum security** — no dynamic code execution whatsoever
- **Auditable and testable** — unit tests can cover every case

### Disadvantages
- **Inflexible** — N forms = N schemas written by hand upfront
- **Doesn't scale with unique requirements** — each customer wanting a custom form means more code
- **High maintenance cost** — adding a new industry requires a code change

### Best Use Cases
- Banking, insurance, healthcare — outputs that must be strictly audited
- Applications that need to work offline
- When the team needs 100% control over what users see
- MVPs with a known, finite set of forms

---

## Demo 2 — AI Generates a JSON Schema

### How It Works

```
User selects context (industry + workflow)
        ↓
API call: POST /api/generate-form
        ↓
AI (streamText / streamObject) — generates a JSON schema
        ↓
JSON streamed to FE in real time
        ↓
Parse JSON → feed into the same Renderer as Demo 1 → UI
```

The AI receives a JSON schema template and is instructed to fill it in for the given context. The AI's output must still conform to a structure the Renderer understands.

**Prompt sent to AI:**
```
Generate a form schema for a healthcare business, workflow: "booking".
Return ONLY this exact JSON structure: { "fields": [...], "actionButtons": [...] }
```

### Advantages
- **More flexible than Demo 1** — AI handles any industry × workflow combination
- **Still safe** — JSON doesn't execute; the Renderer controls what gets on the DOM
- **Structured output** — worst case on AI failure is an empty form, not a crash
- **Saves development time** — no need to author every schema by hand

### Disadvantages
- **Non-deterministic** — same input can yield different output on each run
- **Still limited by the Renderer** — AI can't create component types the Renderer doesn't know about
- **API latency** — typically 3–8 seconds
- **Token cost** — every generation consumes API credits

### Best Use Cases
- SaaS platforms serving many industries (fintech, logistics, healthcare...)
- Internal tool builders — employees create forms for their own workflows
- When the combination space (industry × workflow) is too large to author by hand

---

## Demo 3 — AI Calls Tools to Compose Pre-built Components

### How It Works

```
User describes desired UI in natural language
        ↓
POST /api/compose-ui
        ↓
AI receives a fixed tool registry (showProductCard, showForm, showStatsGrid, showDataTable, showAlertBanner)
        ↓
AI calls the appropriate tools, filling in parameters (name, price, fields, stats...)
        ↓
Server sends completed tool calls as __TOOL__{json}__ENDTOOL__ stream markers
        ↓
FE parses markers → maps tool name → renders the matching React component directly
        ↓
Components appear instantly — no iframe, no sandbox, no code compilation
```

The AI never writes code. It only decides *which* components to use and *what data* to fill them with. The components themselves are always the same React code, maintained by developers.

**Tool call from AI (example):**
```json
{
  "tool": "showStatsGrid",
  "args": {
    "stats": [
      { "label": "Total Orders", "value": 125, "trend": "up", "trendValue": "+12% vs last week" },
      { "label": "Revenue",      "value": 42500000, "unit": "đ", "trend": "up" }
    ]
  }
}
```

**FE component mapping:**
```tsx
function RenderedTool({ tool, args }) {
  switch (tool) {
    case "showStatsGrid":    return <StatsGrid {...args} />;
    case "showProductCard":  return <ProductCard {...args} />;
    case "showForm":         return <FormPanel {...args} />;
    case "showDataTable":    return <DataTable {...args} />;
    case "showAlertBanner":  return <AlertBanner {...args} />;
  }
}
```

### Advantages
- **Fast** — AI only generates ~50 tokens of tool parameters, not 300 lines of code. Response in ~3–5s
- **Design system consistent** — all components come from the same library, always look the same
- **No sandbox** — components render directly in React, no iframe, no null-origin restrictions
- **No Babel** — no runtime code compilation step
- **Reliable** — structured JSON parameters, not free-form code that can have syntax errors
- **Secure** — the AI cannot inject arbitrary HTML or run arbitrary code

### Disadvantages
- **Limited to the registry** — AI can only use components that developers have pre-built
- **Parameters must match schemas** — AI cannot invent new props; it fills existing ones
- **Adding new UI types requires developer work** — each new component needs a tool definition + React component

### Best Use Cases
- Internal dashboards built from a consistent design system
- Customer-facing "AI assistant" that surfaces relevant UI (product cards, forms, summaries)
- Applications where design consistency is non-negotiable
- Teams who want AI flexibility without giving up component control

---

## Demo 4 — Agentic UI (Conversational, Multi-turn)

### How It Works

```
User sends a message (text)
        ↓
Full conversation history sent to POST /api/chat
        ↓
AI uses the same tool registry as Demo 3
        ↓
AI responds with: optional text + tool calls
        ↓
Server returns { text, toolCalls[] } as JSON
        ↓
FE appends a new assistant message to the chat thread
  → text rendered as a chat bubble
  → toolCalls[] rendered as components inline below the bubble
        ↓
User replies → history grows → AI can modify, add, or remove components
```

The key difference from Demo 3: the AI has **memory**. It knows what it already built. When you say "remove the alert" or "add more rows to the table", the AI understands the reference and updates accordingly.

**Multi-turn example:**
```
User:      "Build me an order management dashboard"
Assistant: [StatsGrid — 4 metrics] [DataTable — 5 orders]

User:      "Add a low-stock warning"
Assistant: [AlertBanner — warning] [previous components updated]

User:      "Change the revenue metric to show weekly not monthly"
Assistant: [StatsGrid updated — weekly revenue]
```

**Server route (simplified):**
```ts
const messages = [
  { role: "system",    content: SYSTEM_PROMPT },
  ...conversationHistory,  // ← full history passed each turn
];
// AI calls tools from the same registry as Demo 3
// Returns both text content and tool_calls
```

### Advantages
- **Refinement loop** — users can iterate on the UI with plain language
- **Context-aware** — AI understands "that table", "the first card", "the stats from before"
- **Most natural UX** — conversation is a familiar paradigm
- **Still uses design system** — same component registry, same visual consistency as Demo 3
- **No sandbox** — same rendering approach as Demo 3

### Disadvantages
- **More complex server state** — history must be maintained client-side and sent each turn
- **Token cost grows with conversation** — each turn sends the full history
- **AI can "forget" in long conversations** — context window limits still apply
- **Harder to test** — non-deterministic multi-turn flows are difficult to unit test

### Best Use Cases
- AI assistants that help build reports, forms, or dashboards interactively
- "Talk to your data" products where users iterate on visualizations
- Support agents that surface contextually relevant UI (e.g., a refund form after a complaint)
- Any product where the user's intent evolves mid-session

---

## Comparison Table

| Criterion | Demo 1 — Rule Engine | Demo 2 — AI Schema | Demo 3 — Tool Calling | Demo 4 — Agentic |
|---|---|---|---|---|
| **Speed** | Instant | 3–8s | 3–5s | 3–5s per turn |
| **Flexibility** | Pre-defined only | Any field combination | Any component in registry | Same + iterative refinement |
| **Predictability** | 100% | Low | Medium (tool names fixed) | Low (multi-turn) |
| **API cost** | $0 | Low (small JSON) | Low (~50 tokens) | Medium (grows with history) |
| **Design consistency** | ✅ High | ✅ High | ✅ High | ✅ High |
| **Security** | Highest | High | High (no sandbox) | High (no sandbox) |
| **sandbox / iframe** | ❌ None | ❌ None | ❌ None | ❌ None |
| **Multi-turn** | ❌ | ❌ | ❌ | ✅ |
| **On AI failure** | N/A | Empty form | No components rendered | Error message in chat |
| **Production-ready** | Yes | Yes (with validation) | Yes | Yes (with history management) |
| **Key technology** | Rule engine + Registry | `streamText` + JSON.parse | OpenAI tool calling + Registry | Tool calling + chat history |

---

## ⚠️ Deprecated Approaches

The following approaches were explored and discarded. They are preserved here for reference, not as recommended patterns.

---

### ❌ Deprecated — AI Writes React JSX Code (iframe)

```
User describes UI
        ↓
AI generates full React component code (~200–400 tokens of JSX)
        ↓
Server wraps code in an HTML page with React CDN + Babel CDN
        ↓
Stores page in memory → /api/preview/{id}
        ↓
FE renders <iframe src="/api/preview/{id}" sandbox="allow-scripts" />
        ↓
Babel compiles JSX at runtime inside iframe → React renders
```

**Why we stopped using it:**

| Problem | Impact |
|---|---|
| Slow (10–30s) | AI must generate 200–400 tokens of syntactically valid JSX code — far more than tool parameters (~50 tokens) |
| Inconsistent UI | Every generation produces different styling, spacing, and component choices — no design system |
| Runtime compilation | Babel running inside the iframe adds 1–3s overhead and can fail on edge-case JSX |
| sandbox limitations | `sandbox="allow-scripts"` creates a null origin — the iframe can't communicate with the parent app |
| Code can fail silently | Syntax errors, missing imports, or bad props produce a blank or broken iframe |
| Not production-viable | Dynamically executed AI-generated code requires a separate domain, content moderation pipeline, and output validation |

**vs. Demo 3 (Tool Calling):** Same flexibility goal, but Demo 3 achieves it in ~3–5s with zero code execution and full design system consistency. The registry constraint (AI can only pick pre-built components) is a worthwhile trade-off for the reliability and speed gains.

---

### ❌ Deprecated — Progressive HTML + Vanilla JS (Two-phase iframe)

```
User describes UI
        ↓
AI generates HTML template first (structure only, no JS)
        ↓
Server detects <script> tag delimiter mid-stream
        ↓
Saves HTML-only page → sends __TEMPLATE_ID__ marker
        ↓
FE renders Layer 1 iframe (static template) immediately
        ↓
AI continues generating <script> block (vanilla JS interactivity)
        ↓
Server saves complete HTML+JS page → sends __PREVIEW_ID__ marker
        ↓
FE fades in Layer 2 iframe (interactive) over Layer 1
```

This approach was an attempt to fix the blank-screen problem of the JSX approach by showing a static preview sooner.

**Why we stopped using it:**

| Problem | Impact |
|---|---|
| Still slow (8–15s total) | Two-phase generation just spreads the wait — it doesn't reduce total tokens generated |
| Two iframes = double complexity | Crossfade logic, z-index management, race conditions between layer transitions |
| Still an iframe | Same null-origin restrictions, Babel-less but still sandboxed and disconnected from the app |
| Vanilla JS inconsistency | Without a design system, each generation looks different |
| Delimiter fragile | Detecting `<script>` mid-stream is a heuristic — malformed AI output breaks the split |
| UX improvement is cosmetic | Users see *something* sooner, but it's a static skeleton — not the real UI |

**vs. Demo 3 (Tool Calling):** The two-phase approach traded one set of problems (blank screen) for another (complexity, fragility). Demo 3 eliminates the problem entirely — components render directly in React with no iframe, no two-phase logic, and full interactivity from the first render.

---

## FAQ

### General

**Q: How is Generative UI different from a regular AI chatbot?**

A chatbot returns text. Generative UI returns *something renderable* — a JSON schema, a component tree, or a structured set of tool calls. The user doesn't read the output; they *interact* with it. That distinction is the whole point.

---

**Q: Why use a component registry (Demos 3 & 4) instead of letting AI write whatever it wants?**

Unconstrained AI output (HTML, JSX) is non-deterministic, slow to generate, and requires runtime execution — creating security, reliability, and consistency problems. A registry inverts the model: developers define what's possible, AI decides what to use. This is the same philosophy as giving a designer a component library instead of a blank canvas.

---

**Q: `streamText` vs `streamObject` — when to use which?**

- **`streamText`**: When output is free-form text or code. FE receives a raw string.
- **`streamObject`**: When output must match a specific Zod schema. The SDK validates and emits only structurally valid partial objects. Prefer `streamObject` in production for Demo 2.

---

### About Demo 3

**Q: What happens if the AI calls a tool that doesn't exist in the registry?**

The `RenderedTool` switch falls through to `return null` — nothing renders. No crash, no blank screen. The tool call log on the left panel shows the unknown tool name so developers can detect gaps in the registry.

---

**Q: Why bypass the AI SDK and call OpenRouter directly via `fetch`?**

The Vercel AI SDK (as of v6 / `@ai-sdk/openai-compatible` v2) has a schema serialization bug where Zod tool parameters are sent to OpenAI with `type: "None"` — causing a 400 error. Calling the OpenAI-compatible API directly with plain JSON tool schemas sidesteps the bug entirely and is also simpler to debug.

---

**Q: Can the AI inject malicious content through tool parameters?**

The AI can only fill in parameter values (strings, numbers, arrays). Those values are passed as props to React components that control exactly how they're rendered. A malicious string in `name` becomes `{name}` in JSX — React escapes it automatically. No `dangerouslySetInnerHTML`, no `eval`, no script execution.

---

### About Demo 4

**Q: How is Demo 4 different from Demo 3 — aren't they both tool calling?**

Same underlying mechanism, different interaction model. Demo 3 is one-shot: one prompt → one set of components. Demo 4 is conversational: the AI receives the full message history each turn and can reference, modify, or extend what it already built. The UX shifts from "generate" to "collaborate."

---

**Q: How do you prevent the conversation history from becoming too long?**

Options in production: (1) sliding window — keep only the last N turns; (2) summarization — periodically ask the AI to summarize the conversation state; (3) explicit state — serialize the current component tree as structured data and re-inject it at the start of each turn instead of replaying the full history.

---

**Q: Can Demo 4 be used to build a full no-code tool?**

Yes, with additions: persist conversations to a database, allow users to "save" a layout (snapshot the component tree), add an undo/redo stack, and let users share layouts via URL. The AI stays as the "compiler" — translating natural language into component configurations.

---

## Natural Evolution Path

```
Demo 1 (Rule Engine)
    ↓  "Too many schemas to write by hand"
Demo 2 (AI Schema)
    ↓  "Renderer is limiting, want richer and more varied components"
Demo 3 (Tool Calling)
    ↓  "Users want to iterate, not just generate once"
Demo 4 (Agentic)
    ↓  "Need to ship to production"
Production Architecture:
  - Demo 1 pattern for high-frequency, auditable flows
  - Demo 2 pattern for structured but flexible forms
  - Demo 3/4 pattern for interactive surfaces and dashboards
  - Persistent conversation history (database)
  - Component registry versioning (registry v2, v3...)
  - Usage metering, rate limiting, abuse monitoring
```

Demos 1–4 are not "each one better than the last" — they represent **different trade-offs**. A real production system typically combines multiple approaches: rule engine for core flows, AI schema for flexibility, tool calling for rich UI surfaces, agentic loop for iterative experiences.
