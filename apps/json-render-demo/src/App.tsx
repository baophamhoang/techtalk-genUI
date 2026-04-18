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
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const EVENTS = [
  { icon: "💻", label: "Event 1: Product Configurator (Web Routing)", description: "User clicked 'Build PC Configuration' on an e-commerce website. Generate a PC hardware customization form with GPU, RAM, warranty, and color options." },
  { icon: "🚗", label: "Event 2: Interactive Triage (IoT Sensor Trigger)", description: "IoT sensor detected engine error code P0300 (Engine Misfire) and abnormal temperature increase in vehicle. Generate a vehicle diagnostic triage form." },
  { icon: "🧾", label: "Event 3: Extract & Correction (Image OCR Input)", description: "OCR system finished extracting data from a restaurant bill image and needs user confirmation. Generate a bill-splitting confirmation form." },
];

const INDUSTRIES = [
  { value: "healthcare", label: "🏥 Healthcare" },
  { value: "fintech", label: "💳 Fintech" },
  { value: "logistics", label: "🚚 Logistics" },
  { value: "ecommerce", label: "🛒 E-commerce" },
  { value: "education", label: "🎓 Education" },
  { value: "real-estate", label: "🏠 Real Estate" },
];

const WORKFLOWS = [
  { value: "onboarding", label: "Onboarding khách hàng mới" },
  { value: "approval", label: "Phê duyệt / Approval" },
  { value: "intake", label: "Thu thập thông tin ban đầu" },
  { value: "inspection", label: "Kiểm tra / Inspection" },
  { value: "booking", label: "Đặt lịch / Booking" },
  { value: "complaint", label: "Tiếp nhận khiếu nại" },
];

const SYSTEM_PROMPT = `You are a UI architect. Always respond with ONLY valid JSON, no markdown, no explanation.`;

const JSON_SCHEMA_TEMPLATE = `{
  "fields": [
    { "key": "camelCaseKey", "field": { "type": "string", "title": "Vietnamese label", "placeholder": "optional" } },
    { "key": "dropdownField", "field": { "type": "string", "title": "Vietnamese label", "enum": ["val1","val2"], "enumNames": ["Tên 1","Tên 2"] } },
    { "key": "checkField", "field": { "type": "boolean", "title": "Vietnamese checkbox label" } }
  ],
  "required": ["key1"],
  "actionButtons": [{ "label": "Vietnamese button", "variant": "primary", "action": "snake_case_action" }]
}`;

function buildEventPrompt(description: string): string {
  return `A system event has been detected: "${description}"
Generate a JSON schema for the UI form that should appear in response to this event.
Return ONLY this JSON structure: ${JSON_SCHEMA_TEMPLATE}
Rules: Vietnamese for ALL labels, 3-5 fields, at least one enum, 1-2 action buttons. Return ONLY the JSON.`;
}

function buildContextPrompt(industry: string, workflow: string): string {
  return `Generate a form schema for a ${industry} business, workflow: "${workflow}".
Return ONLY this JSON structure: ${JSON_SCHEMA_TEMPLATE}
Rules: Vietnamese for ALL labels, 4-6 fields appropriate for ${industry} + ${workflow}, at least one enum, 1-2 action buttons. Return ONLY the JSON.`;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState<"events" | "context">("events");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Hãy chọn một trigger bên dưới để xem Declarative GenUI!");
  const [currentSchema, setCurrentSchema] = useState<any>({});
  const [rawJson, setRawJson] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<string | null>(null);

  const streamFromAI = async (prompt: string, label: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setCurrentPrompt(label);
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
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const data = JSON.parse(raw);
            const delta = data.choices?.[0]?.delta ?? {};
            if (delta.reasoning) setReasoning(prev => prev + delta.reasoning);
            if (delta.content) { accumulated += delta.content; setRawJson(accumulated); }
          } catch { /* skip malformed lines */ }
        }
      }

      const start = accumulated.indexOf("{");
      const end = accumulated.lastIndexOf("}");
      if (start === -1 || end <= start) throw new Error("No valid JSON in response");
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
              props: { properties, required: parsed.required || [], actionButtons: parsed.actionButtons || [] },
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

  const handleEventTrigger = (event: typeof EVENTS[0]) =>
    streamFromAI(buildEventPrompt(event.description), event.label);

  const handleContextGenerate = () => {
    if (!industry || !workflow) return;
    const label = `${INDUSTRIES.find(i => i.value === industry)?.label} — ${WORKFLOWS.find(w => w.value === workflow)?.label}`;
    streamFromAI(buildContextPrompt(industry, workflow), label);
  };

  return (
    <ErrorBoundary>
      <JSONUIProvider registry={genUIRegistry.registry}>
        <div className="app">
          <header>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ margin: 0 }}>Demo 1 — Declarative GenUI</h1>
                <p style={{ margin: "4px 0 0", opacity: 0.8 }}>System event or user context → AI → JSON Schema → Form</p>
              </div>
              <span style={{ padding: "6px 14px", backgroundColor: "#1e3a5f", color: "#93c5fd", borderRadius: "999px", fontSize: "13px", fontWeight: "bold", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                🤖 AI-POWERED · MINIMAX M2.7
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap", fontSize: "13px", fontWeight: "600" }}>
              {[
                { icon: "⚡", label: "Trigger" },
                { icon: "🤖", label: "AI (Minimax M2.7)" },
                { icon: "📋", label: "JSON Schema" },
                { icon: "✨", label: "UI Render" },
              ].map((step, i, arr) => (
                <React.Fragment key={step.label}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <span>{step.icon}</span><span>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <span style={{ opacity: 0.5, fontSize: "18px" }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </header>

          <div className="demo-container">
            {/* Left: Controls */}
            <div className="controls">
              {/* Tab switcher */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[
                  { key: "events", label: "📡 System Events" },
                  { key: "context", label: "🧑‍💼 User Context" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    disabled={isGenerating}
                    style={{
                      flex: 1, padding: "8px 12px", fontSize: "13px", fontWeight: "bold",
                      borderRadius: "8px", border: "2px solid",
                      borderColor: activeTab === tab.key ? "#3b82f6" : "#e2e8f0",
                      backgroundColor: activeTab === tab.key ? "#eff6ff" : "#fff",
                      color: activeTab === tab.key ? "#1d4ed8" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Current trigger label */}
              <div style={{ padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                <strong>Trigger: </strong><i>"{currentPrompt}"</i>
                {isGenerating && <span style={{ marginLeft: "8px", color: "#16a34a", fontWeight: "bold" }}> → AI đang stream...</span>}
              </div>

              {/* Tab 1: System Events */}
              {activeTab === "events" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {EVENTS.map(event => (
                    <button key={event.label} onClick={() => handleEventTrigger(event)} disabled={isGenerating} style={{ textAlign: "left", padding: "12px" }}>
                      {event.icon} {event.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 2: User Context */}
              {activeTab === "context" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151" }}>1. Chọn Industry</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      {INDUSTRIES.map(ind => (
                        <button
                          key={ind.value}
                          onClick={() => setIndustry(ind.value)}
                          disabled={isGenerating}
                          style={{
                            padding: "8px", fontSize: "12px", borderRadius: "8px", border: "2px solid",
                            borderColor: industry === ind.value ? "#3b82f6" : "#e2e8f0",
                            backgroundColor: industry === ind.value ? "#eff6ff" : "#fff",
                            color: industry === ind.value ? "#1d4ed8" : "#374151",
                            cursor: "pointer", fontWeight: industry === ind.value ? "bold" : "normal",
                          }}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151" }}>2. Chọn Workflow</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {WORKFLOWS.map(wf => (
                        <button
                          key={wf.value}
                          onClick={() => setWorkflow(wf.value)}
                          disabled={isGenerating}
                          style={{
                            padding: "8px 12px", fontSize: "12px", textAlign: "left", borderRadius: "8px", border: "2px solid",
                            borderColor: workflow === wf.value ? "#3b82f6" : "#e2e8f0",
                            backgroundColor: workflow === wf.value ? "#eff6ff" : "#fff",
                            color: workflow === wf.value ? "#1d4ed8" : "#374151",
                            cursor: "pointer", fontWeight: workflow === wf.value ? "bold" : "normal",
                          }}
                        >
                          {wf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleContextGenerate}
                    disabled={!industry || !workflow || isGenerating}
                    style={{ padding: "12px", fontWeight: "bold", borderRadius: "8px", backgroundColor: (!industry || !workflow || isGenerating) ? "#e2e8f0" : "#3b82f6", color: (!industry || !workflow || isGenerating) ? "#94a3b8" : "#fff", border: "none", cursor: (!industry || !workflow || isGenerating) ? "not-allowed" : "pointer" }}
                  >
                    {isGenerating ? "⏳ AI đang tạo schema..." : "✨ Tạo Form với AI"}
                  </button>
                </div>
              )}
            </div>

            {/* Center: Rendered Form */}
            <div className="form-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>✨ UI Render (từ JSON Schema)</h3>
                {isGenerating && <div className="spinner" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "3px solid #ccc", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />}
              </div>
              <div className="form-wrapper" style={{ minHeight: "300px" }}>
                {currentSchema.root ? (
                  <Renderer spec={currentSchema as any} registry={genUIRegistry.registry} />
                ) : (
                  <p style={{ color: "#6b7280", fontStyle: "italic", textAlign: "center", marginTop: "100px" }}>
                    {isGenerating ? "AI đang tạo schema..." : "UI sẽ xuất hiện tại đây sau khi AI stream xong..."}
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
              {(reasoning || (isGenerating && !rawJson)) && (
                <div style={{ borderLeft: "2px solid #334155", paddingLeft: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: "bold" }}>🧠 AI REASONING...</div>
                  <pre style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace", overflow: "auto", maxHeight: "150px", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                    {reasoning || "..."}
                  </pre>
                </div>
              )}
              <pre style={{ fontSize: "12px", color: "#4ade80", fontFamily: "monospace", overflow: "auto", maxHeight: "280px", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                {rawJson || <span style={{ color: "#1e293b", fontStyle: "italic" }}>Chờ AI stream JSON schema...</span>}
              </pre>
            </div>
          </div>

          <footer>
            <h4>Tại sao Declarative GenUI là nền tảng?</h4>
            <ul>
              <li><strong>AI sinh JSON, không sinh code:</strong> Output có cấu trúc, an toàn, dễ validate — không bao giờ inject HTML tuỳ ý.</li>
              <li><strong>Trigger linh hoạt:</strong> Cùng một pattern hoạt động cho system event (IoT, OCR) lẫn user intent (industry + workflow).</li>
              <li><strong>Renderer là bottleneck:</strong> AI chỉ tạo được field mà renderer biết vẽ — giới hạn này dẫn đến Demo 2.</li>
              <li style={{ color: "#2563eb", fontWeight: "bold" }}>→ Demo 2 phá vỡ giới hạn này: AI không sinh schema — nó chọn component phong phú hơn từ registry.</li>
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
