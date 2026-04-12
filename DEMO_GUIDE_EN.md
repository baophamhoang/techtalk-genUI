# Demo Comparison Guide — Generative UI

> **What is Generative UI?** Instead of developers hardcoding every screen, the system *generates* UI dynamically based on data, context, or natural language. The three demos below illustrate three levels of "intelligence" in this approach.

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

## Demo 3 — AI Writes React Code Directly

### How It Works

```
User enters a description in natural language
        ↓
API call: POST /api/generate-ui
        ↓
AI (streamText) — writes React JSX, streaming to FE character by character
        ↓
BE simultaneously: accumulates code → buildPreviewHtml() → stores in memory
        ↓
End of stream: BE appends __PREVIEW_ID__{id}__END__
        ↓
FE parses previewId → sets <iframe src="/api/preview/{id}" sandbox="allow-scripts">
        ↓
iframe loads HTML from BE → Babel transpiles JSX → React renders → Live UI
```

**iframe security model:**
```
sandbox="allow-scripts" (without allow-same-origin)
        ↓
iframe receives a null/opaque origin
        ↓
Cannot read app's cookies or localStorage
Cannot call app APIs with the user's session
Cannot access window.parent
```

### Advantages
- **No limits** — any UI that can be described can be created
- **No Registry** — the AI decides what components it needs
- **Strong demo effect** — users watch code being written character by character
- **Natural language input** — a plain description is enough

### Disadvantages
- **Slowest** — React code is much longer than JSON (100–300 lines vs 20–50 lines)
- **Most expensive** — significantly higher API token cost
- **Unreliable** — AI can produce syntax errors
- **Security risk** — dynamically executed code (see security section below)
- **Not auditable** — output cannot be predicted in advance

### Best Use Cases
- Internal prototyping tools
- No-code / low-code builders for developers
- Demos, R&D, proof-of-concept work
- Cases requiring completely unique UIs that can't be templatized

---

## Comparison Table

| Criterion | Demo 1 — Rule Engine | Demo 2 — AI Schema | Demo 3 — AI Code |
|---|---|---|---|
| **Speed** | Instant | 3–8 seconds | 10–30 seconds |
| **Flexibility** | Pre-defined schemas only | Any field combination | Any imaginable UI |
| **Predictability** | 100% | Low | Very low |
| **API Cost** | $0 | Low (small JSON) | High (long code) |
| **Security** | Highest | High | Medium (sandbox required) |
| **On AI failure** | N/A | Empty form | Red error in iframe |
| **Production-ready** | Yes | Yes (with validation) | Needs extra infrastructure |
| **Key technology** | Rule engine + Registry | `streamText` + JSON.parse | `streamText` + Babel + iframe |

---

## Frequently Asked Questions (FAQ)

### General Architecture

**Q: How is Generative UI different from a regular AI chatbot?**

A chatbot returns text. Generative UI returns *something renderable* — a JSON schema, a React component, or raw HTML. The user doesn't read the output; they *interact* with it. That distinction is the whole point.

---

**Q: Why use JSON Schema in Demos 1 and 2 instead of having AI write HTML directly?**

JSON Schema is a safe abstraction layer. The Renderer has 100% control over what gets put on the DOM, eliminating XSS risk. Schema is also easy to validate, easy to store, and easy to migrate later. Demo 3 shows what you give up when you remove that layer.

---

**Q: `streamText` vs `streamObject` — when to use which?**

- **`streamText`**: When output is free-form text or code. FE receives a raw string and processes it however it needs.
- **`streamObject`**: When output must match a specific Zod schema. The SDK validates and emits only structurally valid partial objects. Demo 2 should ideally use `streamObject` in production — this demo uses `streamText` to illustrate manual parsing.

---

### About Demo 1

**Q: Can the rule engine scale as the number of schemas grows?**

Yes, but this is the fundamental challenge of any rule engine — complexity grows linearly with the number of cases. The practical solution: store schemas in a database instead of hardcoding, use tags/categories to filter. The rule engine stays as code; the data source is externalized.

---

**Q: Can Demo 1 and Demo 2 be combined?**

Absolutely. A common pattern: Demo 1 for high-frequency workflows (80% of cases), Demo 2 for edge cases or custom requests. This is "AI as fallback" — try the rule engine first; if no schema matches, call the AI.

---

### About Demo 2

**Q: What happens if the AI returns malformed JSON?**

Currently: a try/catch on parse — if it fails, the form doesn't render. In production: use `streamObject` with a Zod schema so the SDK validates automatically. If using `streamText`, add a sanitize-and-validate step before passing data to the Renderer.

---

**Q: Why is it still limited by the Renderer if AI is supposedly smarter?**

Because the Renderer only knows how to render the component types it was programmed for: `string`, `number`, `boolean`, `object`. The AI might want to create a date picker or file upload, but if the Renderer has no matching component, that field is silently dropped. Demo 3 solves this by eliminating the Renderer entirely.

---

**Q: Is streaming JSON actually useful here?**

For Demo 2, streaming allows the FE to start parsing and rendering as soon as enough JSON has arrived (progressive rendering). However, since JSON must be parsed as a complete document, you still have to wait for the stream to finish. The real benefit is UX — users see the JSON "flowing in" on the right panel instead of staring at a blank screen.

---

### About Demo 3

**Q: Why do I have to wait for all the code before seeing the preview?**

Babel compiles the entire script in one pass. Incomplete JSX throws a syntax error. There is no way to render a "partial React component." The only option is to wait for the stream to finish. The streaming code animation on the left is how we keep UX alive during that wait.

---

**Q: Can the iframe steal data from the app?**

With `sandbox="allow-scripts"` and **no** `allow-same-origin`, the iframe receives a **null origin** — it cannot read the app's cookies or localStorage, and cannot make API calls with the user's session. This is the same protection mechanism Claude Artifacts uses.

What sandbox **does not** prevent: code inside the iframe can still `fetch()` to external servers. If a user fills in a form generated by the AI, that data could potentially be sent elsewhere. Production mitigation: add `Content-Security-Policy: connect-src 'none'` to the preview endpoint response headers.

---

**Q: Claude uses this same approach — how do they handle security?**

Claude serves Artifacts from a completely separate domain (`artifacts.claude.ai`) rather than the same domain as the app. This is true cross-origin, not just null-origin. Additionally, Anthropic runs output through a content moderation pipeline before rendering, and no user data exists in the artifact's execution context. Vercel v0 and bolt.new use WebContainers (Node.js running in WebAssembly) — OS-process-level isolation, far stronger than an iframe.

---

**Q: Can Demo 3 be used in production?**

Yes, but it requires:
1. **Separate domain** for preview serving (not co-located with the app)
2. **Content moderation** on AI output before storing
3. **Rate limiting** on `/api/generate-ui`
4. **Generation timeout** (prevent hung requests)
5. **No sensitive data** in the iframe execution context

---

**Q: Why store HTML on the backend instead of having the FE build it and use srcDoc?**

Two reasons:
1. **Cleaner architecture**: FE doesn't need to know how to build the preview HTML, doesn't need to import Babel config or sanitization logic
2. **The preview has a real URL**: `/api/preview/{id}` can be shared, opened in a new tab, or embedded elsewhere

The security outcome is identical — both approaches achieve null origin with `sandbox="allow-scripts"`.

---

**Q: Why does Demo 3 take longer than expected even for simple components?**

Three factors compound: (1) the AI model's time-to-first-token (cold start), (2) the sheer number of tokens in a complete React component vs a JSON blob, and (3) the CDN load time for React/Babel/Tailwind inside the iframe. We address #3 with a loading spinner; #1 and #2 are inherent to the approach.

---

## Natural Evolution Path

```
Demo 1 (Rule Engine)
    ↓  "Too many schemas to write by hand"
Demo 2 (AI Schema)
    ↓  "Renderer is still limiting, want richer UI"
Demo 3 (AI Code)
    ↓  "Need production-grade security & reliability"
Production Architecture:
  - Separate preview domain
  - Output moderation pipeline
  - Schema validation layer (Demo 2 pattern) for common flows
  - Code generation (Demo 3 pattern) for edge cases
  - Rate limiting, abuse monitoring, usage metering
```

The three demos are not "each one better than the last" — they represent **different trade-offs**. A real production system typically combines all three: rule engine for core flows, AI schema for flexibility, AI code for edge cases where nothing else fits.
