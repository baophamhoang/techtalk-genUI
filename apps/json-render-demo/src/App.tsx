import React, { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import "./App.css";
import { genUIRegistry } from "./catalog";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", background: "#fee" }}>
          <h2>Something went wrong in the component.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary>Error details</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
            <br />
            {this.state.error?.stack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Event definitions ────────────────────────────────────────────────────────
const EVENTS = [
  {
    icon: "💻",
    label: "Event 1: Product Configurator (Web Routing)",
    description: "User clicked 'Build PC Configuration' on an e-commerce website. Generate a PC hardware customization form with GPU, RAM, warranty, and color options.",
  },
  {
    icon: "🚗",
    label: "Event 2: Interactive Triage (IoT Sensor Trigger)",
    description: "IoT sensor detected engine error code P0300 (Engine Misfire) and abnormal temperature increase in vehicle. Generate a vehicle diagnostic triage form.",
  },
  {
    icon: "🧾",
    label: "Event 3: Extract & Correction (Image OCR Input)",
    description: "OCR system finished extracting data from a restaurant bill image and needs user confirmation. Generate a bill-splitting confirmation form.",
  },
];

const SYSTEM_PROMPT = `You are a UI architect. Always respond with ONLY valid JSON, no markdown, no explanation.`;

function buildUserPrompt(eventDescription: string): string {
  return `A system event has been detected: "${eventDescription}"

Generate a JSON schema for the UI form that should appear in response to this event.

Return ONLY this exact JSON structure, no other text:
{
  "fields": [
    {
      "key": "camelCaseKey",
      "field": {
        "type": "string",
        "title": "Vietnamese label",
        "placeholder": "optional hint"
      }
    },
    {
      "key": "dropdownField",
      "field": {
        "type": "string",
        "title": "Vietnamese label",
        "enum": ["val1", "val2"],
        "enumNames": ["Tên 1", "Tên 2"]
      }
    },
    {
      "key": "checkboxField",
      "field": {
        "type": "boolean",
        "title": "Vietnamese checkbox label"
      }
    }
  ],
  "required": ["key1", "key2"],
  "actionButtons": [
    {
      "label": "Vietnamese button text",
      "variant": "primary",
      "action": "snake_case_action"
    }
  ]
}

Rules:
- Use Vietnamese for ALL titles, labels, button text, placeholders
- Generate 3-5 fields appropriate for this event context
- At least one field must use enum (dropdown)
- 1-2 action buttons matching the event intent
- Return ONLY the JSON, nothing else`;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Hãy chọn một Sự kiện hệ thống (Event) bên dưới để xem luồng SDUI!");
  const [currentSchema, setCurrentSchema] = useState<any>({});
  const [rawJson, setRawJson] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");

  const handleGenerateWithAI = async (eventDescription: string, eventLabel: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setCurrentPrompt(eventLabel);
    setCurrentSchema({});
    setRawJson("");
    setReasoning("");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2.7",
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(eventDescription) },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Buffer incomplete lines — chunks can split mid-line
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep last incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const data = JSON.parse(raw);
            const delta = data.choices?.[0]?.delta ?? {};
            // Show reasoning tokens as visual feedback while AI thinks
            if (delta.reasoning) {
              setReasoning(prev => prev + delta.reasoning);
            }
            // Accumulate actual JSON content
            if (delta.content) {
              accumulated += delta.content;
              setRawJson(accumulated);
            }
          } catch { /* skip malformed lines */ }
        }
      }

      // Final parse after stream completes — extract outermost { } to handle extra text
      const start = accumulated.indexOf("{");
      const end = accumulated.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) throw new Error("No valid JSON found in response");
      const parsed = JSON.parse(accumulated.slice(start, end + 1));

      const properties: Record<string, any> = {};
      for (const { key, field } of (parsed.fields || [])) {
        if (key && field) properties[key] = field;
      }

      if (Object.keys(properties).length > 0) {
        setCurrentSchema({
          root: "generatedForm",
          elements: {
            generatedForm: {
              type: "object",
              props: {
                properties,
                required: parsed.required || [],
                actionButtons: parsed.actionButtons || [],
              },
            },
          },
        });
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      setRawJson(`Error: ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <JSONUIProvider registry={genUIRegistry.registry}>
        <div className="app">
          <header>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ margin: 0 }}>Demo 1 — Server-Driven UI (SDUI)</h1>
                <p style={{ margin: "4px 0 0", opacity: 0.8 }}>UI tự sinh từ System Events — AI nhận event và stream schema tương ứng</p>
              </div>
              <span style={{ padding: "6px 14px", backgroundColor: "#1e3a5f", color: "#93c5fd", borderRadius: "999px", fontSize: "13px", fontWeight: "bold", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                🤖 AI-POWERED · MINIMAX M2.5
              </span>
            </div>

            {/* Flow diagram */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap", fontSize: "13px", fontWeight: "600" }}>
              {[
                { icon: "📡", label: "System Event" },
                { icon: "🤖", label: "AI (Minimax M2.5)" },
                { icon: "📋", label: "JSON Schema" },
                { icon: "✨", label: "UI Render" },
              ].map((step, i, arr) => (
                <React.Fragment key={step.label}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <span style={{ opacity: 0.5, fontSize: "18px" }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </header>

          <div className="demo-container">
            {/* Left: Event Triggers */}
            <div className="controls">
              <h3>📡 System Event Triggers</h3>
              <div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
                <strong>Event nhận được: </strong> <i>"{currentPrompt}"</i>
                {isGenerating && <span style={{ marginLeft: "8px", color: "#16a34a", fontWeight: "bold" }}> → AI đang stream schema...</span>}
              </div>

              <div className="button-group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {EVENTS.map((event) => (
                  <button
                    key={event.label}
                    onClick={() => handleGenerateWithAI(event.description, event.label)}
                    disabled={isGenerating}
                    style={{ textAlign: "left", padding: "12px" }}
                  >
                    {event.icon} {event.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Rendered Form */}
            <div className="form-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>✨ UI Render (từ JSON Schema)</h3>
                {isGenerating && (
                  <div className="spinner" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "3px solid #ccc", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />
                )}
              </div>

              <div className="form-wrapper" style={{ minHeight: "300px" }}>
                {currentSchema.root ? (
                  <Renderer spec={currentSchema as any} registry={genUIRegistry.registry} />
                ) : (
                  <p style={{ color: "#6b7280", fontStyle: "italic", textAlign: "center", marginTop: "100px" }}>
                    {isGenerating ? "AI đang tạo schema..." : "UI sẽ xuất hiện tại đây khi AI stream xong..."}
                  </p>
                )}
              </div>
            </div>

            {/* Right: JSON Stream */}
            <div className="schema-section" style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ color: "#94a3b8", fontSize: "13px", marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isGenerating ? "#4ade80" : rawJson ? "#4ade80" : "#475569", display: "inline-block", animation: isGenerating ? "pulse 1s infinite" : "none" }} />
                📋 JSON Stream (live)
              </h3>
              {/* Reasoning panel */}
              {(reasoning || (isGenerating && !rawJson)) && (
                <div style={{ borderLeft: "2px solid #334155", paddingLeft: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: "bold", letterSpacing: "0.05em" }}>🧠 AI REASONING...</div>
                  <pre style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace", overflow: "auto", maxHeight: "150px", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                    {reasoning || "..."}
                  </pre>
                </div>
              )}
              {/* JSON content */}
              <pre style={{ fontSize: "12px", color: "#4ade80", fontFamily: "monospace", overflow: "auto", maxHeight: "280px", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                {rawJson || <span style={{ color: "#1e293b", fontStyle: "italic" }}>Chờ AI stream JSON schema...</span>}
              </pre>
            </div>
          </div>

          <footer>
            <h4>Tại sao SDUI là nền tảng của GenUI?</h4>
            <ul>
              <li><strong>Không cần tạo file `.tsx` mới:</strong> Component lắp ráp on-the-fly từ JSON — engineer định nghĩa Registry một lần duy nhất.</li>
              <li><strong>Safe by design:</strong> Chỉ render các component đã đăng ký trong Registry, tránh HTML injection hoàn toàn.</li>
              <li><strong>Tách biệt data và presentation:</strong> Server quyết định <em>cái gì</em> hiển thị, client chỉ lo <em>hiển thị như thế nào</em>.</li>
              <li style={{ color: "#2563eb", fontWeight: "bold" }}>→ Demo 2 sẽ thay System Event bằng user context (industry + workflow) để AI tự tạo ra JSON Schema này.</li>
            </ul>
          </footer>

          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          `}</style>
        </div>
      </JSONUIProvider>
    </ErrorBoundary>
  );
}

export default App;
