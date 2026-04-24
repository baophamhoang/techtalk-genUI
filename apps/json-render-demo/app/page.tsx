"use client";

import { useState, useEffect } from "react";
import { STATIC_SCHEMAS, SCHEMA_IDS } from "../src/schemas/static";
import { FormSchema as FormSchemaValidator, type FormSchemaType } from "@techtalk/shared";

const SCHEMA_LABELS: Record<string, string> = {
  healthcare: "🏥 Healthcare",
  fintech: "💳 KYC",
  insurance: "🛡️ Insurance",
  logistics: "📦 Logistics",
  ecommerce: "🛒 E-commerce",
  realestate: "🏢 Real Estate",
};

type Status = "idle" | "loading" | "streaming" | "success" | "error";

interface Metrics {
  latencyMs: number;
  tokens: number;
  source: "bundle" | "api" | "cache" | "ai" | "fallback";
  determinism?: number;
}

type FormSchema = FormSchemaType;

function MetricsPanel({ label, latencyMs, tokens, source, determinism }: Metrics & { label: string }) {
  const sourceColors: Record<string, string> = {
    bundle: "bg-slate-100 text-slate-600",
    api: "bg-blue-100 text-blue-700",
    cache: "bg-green-100 text-green-700",
    ai: "bg-violet-100 text-violet-700",
    fallback: "bg-amber-100 text-amber-700",
  };
  const sourceLabels: Record<string, string> = {
    bundle: "Bundle", api: "API", cache: "Cache", ai: "AI", fallback: "Fallback",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${sourceColors[source]}`}>
          {sourceLabels[source]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Latency</div>
          <div className="text-lg font-bold text-slate-800">{latencyMs}ms</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Tokens</div>
          <div className="text-lg font-bold text-slate-800">{(tokens ?? 0).toLocaleString()}</div>
        </div>
      </div>
      {determinism !== undefined && (
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Determinism</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${determinism}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-700">{determinism}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function FormRenderer({ schema }: { schema: FormSchema }) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/submit/${schema.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, _fullSchema: schema })
      });
      const data = await res.json();
      if (data.ok) {
        alert("✅ Payload Validated (Type-Safe):\n" + JSON.stringify(data.data, null, 2));
      } else {
        alert("❌ Validation Failed:\n" + JSON.stringify(data.issues, null, 2));
      }
    } catch (err) {
      alert("Error submitting form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{schema.title}</h2>
      {schema.description && <p className="text-sm text-slate-500">{schema.description}</p>}

      {schema.fields.map(({ key, field }) => (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "text" && (
            <input type="text" value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              placeholder={field.placeholder} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "email" && (
            <input type="email" value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              placeholder={field.placeholder} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "phone" && (
            <input type="tel" value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              placeholder={(field as any).placeholder} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "number" && (
            <input type="number" value={(values[key] as number) ?? ""} onChange={e => handleChange(key, Number(e.target.value))}
              min={field.min} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "date" && (
            <input type="date" value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "textarea" && (
            <textarea value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              rows={field.rows ?? 3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          )}
          {field.type === "select" && (
            <select value={(values[key] as string) ?? ""} onChange={e => handleChange(key, e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Chọn...</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {field.type === "checkbox" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={(values[key] as boolean) ?? false} onChange={e => handleChange(key, e.target.checked)}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500" />
              <span className="text-sm text-slate-600">{field.label}</span>
            </label>
          )}
          {field.type === "file" && (
            <input type="file" accept={field.accept} onChange={e => handleChange(key, e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:font-bold" />
          )}
        </div>
      ))}

      <button type="submit" className="w-full bg-violet-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-violet-700 transition-colors">
        {schema.submitLabel}
      </button>
    </form>
  );
}

export default function HomePage() {
  const [selectedSchema, setSelectedSchema] = useState("healthcare");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeMode, setActiveMode] = useState<"static" | "sdui" | "genui">("genui");

  const [staticStatus, setStaticStatus] = useState<Status>("idle");
  const [staticData, setStaticData] = useState<FormSchema | null>(null);
  const [staticMetrics, setStaticMetrics] = useState<Metrics | null>(null);
  const [staticIssues, setStaticIssues] = useState<unknown[]>([]);

  const [sduiStatus, setSduiStatus] = useState<Status>("idle");
  const [sduiData, setSduiData] = useState<FormSchema | null>(null);
  const [sduiMetrics, setSduiMetrics] = useState<Metrics | null>(null);
  const [sduiCached, setSduiCached] = useState(false);
  const [sduiIssues, setSduiIssues] = useState<unknown[]>([]);

  const [genuiStatus, setGenuiStatus] = useState<Status>("idle");
  const [genuiData, setGenuiData] = useState<FormSchema | null>(null);
  const [genuiMetrics, setGenuiMetrics] = useState<Metrics | null>(null);
  const [genuiRaw, setGenuiRaw] = useState<string>("");
  const [genuiIssues, setGenuiIssues] = useState<unknown[]>([]);

  const runStaticAndSdui = async () => {
    setStaticStatus("loading");
    setSduiStatus("loading");
    setGenuiStatus("idle");
    setStaticMetrics(null);
    setSduiMetrics(null);
    setGenuiMetrics(null);
    setStaticData(null);
    setSduiData(null);
    setGenuiData(null);
    setStaticIssues([]);
    setSduiIssues([]);
    setGenuiRaw("");
    setGenuiIssues([]);

    const schema = STATIC_SCHEMAS[selectedSchema];
    const isGenUI = selectedSchema === "artifact_triage" || selectedSchema === "service_intake";

    const t0 = performance.now();
    if (isGenUI) {
      setStaticStatus("error");
      setStaticMetrics({ latencyMs: 0, tokens: 0, source: "bundle", determinism: 100 });
      setStaticData(null);
    } else if (schema) {
      const parsed = FormSchemaValidator.safeParse(schema);
      const latencyMs = Math.round(performance.now() - t0);
      if (parsed.success) {
        setStaticData(parsed.data);
        setStaticMetrics({ latencyMs, tokens: 0, source: "bundle", determinism: 100 });
        setStaticStatus("success");
      } else {
        setStaticIssues(parsed.error.issues);
        setStaticMetrics({ latencyMs, tokens: 0, source: "bundle", determinism: 100 });
        setStaticStatus("error");
      }
    }

    if (isGenUI) {
      setSduiStatus("error");
      setSduiMetrics({ latencyMs: 0, tokens: 0, source: "fallback" });
      setSduiData(null);
    } else {
      const cachedKey = `sdui_${selectedSchema}`;
      const cached = sessionStorage.getItem(cachedKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        const parsed = FormSchemaValidator.safeParse(cachedData.schema);
        if (parsed.success) {
          setSduiData(parsed.data);
          setSduiCached(true);
          setSduiMetrics({ latencyMs: 5, tokens: 0, source: "cache", determinism: 100 });
          setSduiStatus("success");
        } else {
          setSduiIssues(parsed.error.issues);
          setSduiMetrics({ latencyMs: 5, tokens: 0, source: "cache", determinism: 100 });
          setSduiStatus("error");
        }
      } else {
        try {
          const res = await fetch(`/api/sdui/forms/${selectedSchema}`);
          const data = await res.json();
          const parsed = FormSchemaValidator.safeParse(data.schema);
          if (parsed.success) {
            setSduiData(parsed.data);
            setSduiCached(data.cached);
            setSduiMetrics({ latencyMs: data.latencyMs, tokens: 0, source: data.cached ? "cache" : "api", determinism: 100 });
            setSduiStatus("success");
            sessionStorage.setItem(cachedKey, JSON.stringify(data));
          } else {
            setSduiIssues(parsed.error.issues);
            setSduiMetrics({ latencyMs: data.latencyMs, tokens: 0, source: data.cached ? "cache" : "api", determinism: 100 });
            setSduiStatus("error");
          }
        } catch {
          setSduiStatus("error");
          setSduiMetrics({ latencyMs: 0, tokens: 0, source: "fallback" });
        }
      }
    }
  };

  const runGenui = async () => {
    const isGenUI = selectedSchema === "artifact_triage" || selectedSchema === "service_intake";
    setGenuiStatus("loading");
    setGenuiMetrics(null);
    setGenuiData(null);
    setGenuiRaw("");
    setGenuiIssues([]);

    const t0 = performance.now();
    try {
      const requirement = isGenUI ? customPrompt : `Generate a ${selectedSchema} form`;
      const bucket = isGenUI ? selectedSchema : "fallback";

      const res = await fetch("/api/genui/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, description: requirement }),
      });

      setGenuiStatus("streaming");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let rawText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawText += decoder.decode(value, { stream: true });

        const stripped = rawText.split("__METADATA__")[0];
        setGenuiRaw(stripped);
      }

      const parts = rawText.split("__METADATA__");
      const jsonText = parts[0];
      const metadata = parts[1] ? JSON.parse(parts[1]) : {};

      const latencyMs = Math.round(performance.now() - t0);
      setGenuiMetrics({ latencyMs, tokens: metadata.tokens || 0, source: "ai", determinism: 80 });

      let parsedJson: any;
      try {
        const start = jsonText.indexOf("{");
        const end = jsonText.lastIndexOf("}");
        if (start === -1 || end <= start) throw new Error("No JSON object found");
        parsedJson = JSON.parse(jsonText.slice(start, end + 1));
      } catch (err) {
        setGenuiIssues([{ message: "Could not parse JSON from complete response." }]);
        setGenuiStatus("error");
        return;
      }

      if (parsedJson && parsedJson.fields && Array.isArray(parsedJson.fields)) {
        setGenuiData(parsedJson as FormSchema);
        setGenuiStatus("success");
      } else {
        setGenuiIssues([{ message: "Invalid schema structure. Missing 'fields' array." }]);
        setGenuiStatus("error");
      }
    } catch {
      setGenuiStatus("error");
      setGenuiMetrics({ latencyMs: 0, tokens: 0, source: "fallback", determinism: 0 });
    }
  };

  const runAll = async () => {
    await runStaticAndSdui();
    await runGenui();
  };

  useEffect(() => {
    runStaticAndSdui();
  }, [selectedSchema]);

  const renderForm = (mode: "static" | "sdui" | "genui") => {
    const status = mode === "static" ? staticStatus : mode === "sdui" ? sduiStatus : genuiStatus;
    const data = mode === "static" ? staticData : mode === "sdui" ? sduiData : genuiData;
    const cached = mode === "sdui" ? sduiCached : false;
    const issues = mode === "static" ? staticIssues : mode === "sdui" ? sduiIssues : genuiIssues;

    if (status === "idle" && mode === "genui") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
          <span className="text-4xl">✨</span>
          <p className="text-sm font-medium">Click <strong>▶ Chạy Demo</strong> to generate with AI</p>
        </div>
      );
    }

    if (status === "loading") {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-violet-400 border-top-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (status === "streaming" && mode === "genui") {
      return (
        <div className="space-y-4 font-mono h-full flex flex-col">
           <h3 className="text-violet-500 font-bold mb-2 flex items-center gap-2">
             <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
             AI is streaming JSON structured UI...
           </h3>
           <pre className="flex-1 bg-slate-900 border border-slate-700 text-green-400 p-4 rounded-lg text-xs whitespace-pre-wrap overflow-auto">
             {genuiRaw}
             <span className="inline-block w-2 h-3 bg-green-400 ml-1 animate-pulse" />
           </pre>
        </div>
      );
    }

    if (status === "success" && data) {
      return (
        <>
          <FormRenderer schema={data} />
          {cached && (
            <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg font-medium">
              ✓ Cache hit — no server call made
            </div>
          )}
        </>
      );
    }

    if (status === "error" && (selectedSchema === "artifact_triage" || selectedSchema === "service_intake") && mode !== "genui") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
          <div className="text-4xl">🚫</div>
          <p className="text-sm font-medium">Not supported in this mode.</p>
          <p className="text-xs max-w-xs text-center text-slate-500">
            Static and SDUI modes require pre-authored schemas. They cannot handle long-tail or dynamic user prompts.
          </p>
        </div>
      );
    }

    if (status === "error") {
      const label = mode === "static" ? "Bundle Schema" : mode === "sdui" ? "SDUI API" : "AI";
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-700 text-sm mb-2">⚠️ {label} Validation Failed</h4>
            <p className="text-xs text-red-600 mb-3">Schema could not be validated against FormSchema.</p>
            {issues.length > 0 && (
              <div className="bg-white rounded p-3 text-xs">
                <strong className="text-red-600">Issues:</strong>
                <pre className="mt-1 text-red-500 whitespace-pre-wrap">{JSON.stringify(issues, null, 2)}</pre>
              </div>
            )}
          </div>
          {mode === "genui" && genuiRaw && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-1">Raw AI Output:</h4>
              <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
                {genuiRaw.slice(0, 500)}
              </pre>
            </div>
          )}
          <button onClick={mode === "genui" ? runAll : runStaticAndSdui} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors">
            🔄 Retry
          </button>
        </div>
      );
    }

    return <div className="text-slate-400 text-sm text-center">No data</div>;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col gap-6 mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Demo 1 — The Spectrum of UI Control</h1>
            <p className="text-slate-400 mt-1">FE Static Schema · BE SDUI · GenUI</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {SCHEMA_IDS.map(id => (
              <button 
                key={id}
                onClick={async () => {
                  setSelectedSchema(id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                  selectedSchema === id 
                    ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {SCHEMA_LABELS[id]}
              </button>
            ))}
            
            <div className="w-[1px] h-8 bg-white/20 mx-2"></div>
            
            <button 
              onClick={() => { setSelectedSchema("artifact_triage"); setCustomPrompt(""); setActiveMode("genui"); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border outline-none ${
                selectedSchema === "artifact_triage" 
                  ? "bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
              }`}
            >
              🛠️ Dev/Ops Triage
            </button>

            <button 
              onClick={() => { setSelectedSchema("service_intake"); setCustomPrompt(""); setActiveMode("genui"); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border outline-none ${
                selectedSchema === "service_intake" 
                  ? "bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
              }`}
            >
              🎧 Consumer Intake
            </button>
            
            <button onClick={runAll} className="ml-auto px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-lg transition-colors text-sm flex items-center gap-2">
              <span className="text-xl leading-none">▶</span> Chạy Demo
            </button>
          </div>
        </header>

        {(selectedSchema === "artifact_triage" || selectedSchema === "service_intake") && (
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-slate-400 font-medium py-1">Gợi ý:</span>
              {selectedSchema === "artifact_triage" ? (
                <>
                  <button onClick={() => setCustomPrompt(`NullPointerException in checkout-service (prod) — 14:32 UTC\n\njava.lang.NullPointerException: Cannot invoke method getPrice() on null object\n  at com.shop.checkout.CartService.calculateTotal(CartService.java:87)\n  at com.shop.checkout.CheckoutController.submit(CheckoutController.java:42)\n  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nAffecting ~12% of checkout attempts. Started ~14:28 UTC.`)} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">🚨 NullPointer checkout</button>
                  <button onClick={() => setCustomPrompt(`DB connection pool exhausted — payments-db (us-east-1)\n\n[ERROR] HikariPool-1 - Connection is not available, request timed out after 30000ms\n  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)\n  at com.shop.payments.PaymentRepository.save(PaymentRepository.java:56)\nPool size: 20/20 active. Queue depth: 47. Latency p99: 8200ms (baseline 120ms).`)} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">⌛ DB pool exhausted</button>
                  <button onClick={() => setCustomPrompt(`Pod OOMKilled — worker-queue (k8s prod cluster)\n\nName: worker-queue-7d9f8b-xk2pq\nNamespace: production\nReason: OOMKilled\nLast State: Terminated (OOMKilled) at Mon, 22 Apr 2026 09:14:33\nRestart Count: 8\nLimits: memory 512Mi\nRequests: memory 256Mi\nRecent job: nightly-report-aggregation (started 09:00 UTC, ~14min before kill)`)} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">💀 OOMKilled worker pod</button>
                </>
              ) : (
                <>
                  <button onClick={() => setCustomPrompt("I bumped my car into a tree while parking. The front left bumper is dented.")} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">🚗 Car Bumper Dent</button>
                  <button onClick={() => setCustomPrompt("My flight was cancelled and I need to rebook or get a refund.")} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">✈️ Cancelled Flight</button>
                  <button onClick={() => setCustomPrompt("I received the wrong item in my recent order. I ordered a blue shirt but got a red one.")} className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 border border-slate-700/50 hover:border-amber-500/30 rounded-full text-xs text-slate-300 transition-colors whitespace-nowrap">📦 Wrong Item</button>
                </>
              )}
            </div>
            <label className="text-sm font-bold text-amber-400">
              {selectedSchema === "artifact_triage" ? "Mô phỏng incident — AI nhận stack trace, tự suy ra loại lỗi và hỏi thêm context xung quanh:" : "Mô tả yêu cầu dịch vụ — AI sẽ tạo form intake phù hợp với loại dịch vụ:"}
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={selectedSchema === "artifact_triage" ? "Paste stack trace, error log, or crash report here..." : "e.g., My kitchen sink has been leaking under the cabinet for 2 days."}
              className="w-full bg-slate-900/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  runAll();
                }
              }}
            />
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6 text-sm">
          <span className="text-amber-400">⚠️ Mock context</span>
          <span className="text-slate-300 ml-2">Production would read from database, telemetry, and analytics pipelines.</span>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: "static", label: "1️⃣ FE Static Schema", desc: "Schema in bundle" },
            { key: "sdui", label: "2️⃣ BE-Driven Schema (SDUI)", desc: "From CMS/DB" },
            { key: "genui", label: "3️⃣ GenUI", desc: "AI composes" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveMode(tab.key as typeof activeMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeMode === tab.key
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-xs opacity-70">({tab.desc})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 min-h-[500px] text-slate-900">
            {renderForm(activeMode)}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-4">
                {activeMode === "static" && "FE Static — Bundle"}
                {activeMode === "sdui" && "BE SDUI — API"}
                {activeMode === "genui" && "GenUI — AI"}
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                {activeMode === "static" && (
                  <>
                    <p>✅ <strong>Source:</strong> Schema hardcoded in client bundle</p>
                    <p>✅ <strong>Latency:</strong> ~0ms (no network call)</p>
                    <p>✅ <strong>Determinism:</strong> 100% (always same output)</p>
                    <p>✅ <strong>Cost:</strong> $0 (no API cost)</p>
                    <p className="mt-3 text-slate-400">Best for: 95% of forms that don't change frequently.</p>
                  </>
                )}
                {activeMode === "sdui" && (
                  <>
                    <p>✅ <strong>Source:</strong> Schema fetched from server API</p>
                    <p>✅ <strong>Latency:</strong> ~200-400ms (network + server)</p>
                    <p>✅ <strong>Determinism:</strong> 100% (admin controls schema)</p>
                    <p>✅ <strong>Cost:</strong> Low (simple API call)</p>
                    
                    <div className="mt-4 p-4 border border-violet-200 bg-violet-50 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-violet-700 uppercase">Mock Admin Portal</span>
                         <span className="text-[10px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded">Admin Only</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">If you were a business admin, you could edit the schema JSON here and it would instantly update the form without needing to deploy the frontend.</p>
                      <pre className="text-[10px] bg-slate-900 text-green-400 p-2 rounded overflow-hidden h-[80px]">
                        {sduiData ? JSON.stringify(sduiData, null, 2).slice(0, 200) + "\n..." : "Loading..."}
                      </pre>
                    </div>

                    <p className="mt-3 text-slate-400">Best for: When business users need to flexibly edit schemas without deploying code.</p>
                  </>
                )}
                {activeMode === "genui" && (
                  <>
                    <p>⏳ <strong>Source:</strong> AI generates schema on-demand</p>
                    <p>⏳ <strong>Latency:</strong> ~3-8s (AI processing)</p>
                    <p>⏳ <strong>Determinism:</strong> ~80% (AI may output invalid)</p>
                    <p>⏳ <strong>Cost:</strong> ~$0.001 per request</p>
                    <p className="mt-3 text-slate-400">Best for: The critical 10% long tail — dynamic intake built around unstructured user context.</p>
                  </>
                )}
              </div>
            </div>

            {activeMode === "static" && staticMetrics && (
              <MetricsPanel label="Mode 1 - FE Static" {...staticMetrics} />
            )}
            {activeMode === "sdui" && sduiMetrics && (
              <MetricsPanel label={`Mode 2 - BE SDUI${sduiCached ? " (cached)" : ""}`} {...sduiMetrics} />
            )}
            {activeMode === "genui" && genuiMetrics && (
              <MetricsPanel label="Mode 3 - GenUI" {...genuiMetrics} />
            )}
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold text-slate-300 mb-4">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Latency</div>
              <div className="text-2xl font-black text-slate-200">
                {staticMetrics?.latencyMs ?? 0}ms / {sduiMetrics?.latencyMs ?? 0}ms / {genuiMetrics?.latencyMs ?? 0}ms
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Tokens</div>
              <div className="text-2xl font-black text-slate-200">
                0 / 0 / {genuiMetrics?.tokens ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Determinism</div>
              <div className="text-2xl font-black text-slate-200">
                {staticMetrics?.determinism ?? 0}% / {sduiMetrics?.determinism ?? 0}% / {genuiMetrics?.determinism ?? 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}