"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STATIC_SCHEMAS, SCHEMA_IDS } from "../../src/schemas/static";

const SCHEMA_LABELS: Record<string, string> = {
  healthcare: "🏥 Healthcare Booking",
  fintech: "💳 Fintech KYC",
  insurance: "🛡️ Insurance Claim",
  logistics: "🚚 Logistics Tracking",
  ecommerce: "🛒 E-commerce Onboarding",
  "real-estate": "🏠 Real Estate Inspection",
};

type Status = "idle" | "loading" | "success" | "error";

interface Metrics {
  latencyMs: number;
  tokens: number;
  source: "bundle" | "api" | "cache" | "ai" | "fallback";
  determinism?: number;
}

interface FormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  fields: { key: string; field: any }[];
}

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
          <div className="text-lg font-bold text-slate-800">{tokens.toLocaleString()}</div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(JSON.stringify(values, null, 2));
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
              placeholder={field.placeholder} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
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

export default function ComparePage() {
  const router = useRouter();
  const [selectedSchema, setSelectedSchema] = useState("healthcare");

  const [m1Status, setM1Status] = useState<Status>("idle");
  const [m1Metrics, setM1Metrics] = useState<Metrics | null>(null);
  const [m1Data, setM1Data] = useState<FormSchema | null>(null);

  const [m2Status, setM2Status] = useState<Status>("idle");
  const [m2Metrics, setM2Metrics] = useState<Metrics | null>(null);
  const [m2Data, setM2Data] = useState<FormSchema | null>(null);
  const [m2Cached, setM2Cached] = useState(false);

  const [m3Status, setM3Status] = useState<Status>("idle");
  const [m3Metrics, setM3Metrics] = useState<Metrics | null>(null);
  const [m3Data, setM3Data] = useState<FormSchema | null>(null);
  const [m3Raw, setM3Raw] = useState<string>("");
  const [m3Issues, setM3Issues] = useState<unknown[]>([]);

  const runAll = async () => {
    setM1Status("loading");
    setM2Status("loading");
    setM3Status("loading");
    setM1Metrics(null);
    setM2Metrics(null);
    setM3Metrics(null);
    setM1Data(null);
    setM2Data(null);
    setM3Data(null);
    setM3Raw("");
    setM3Issues([]);

    const schema = STATIC_SCHEMAS[selectedSchema];
    if (!schema) return;

    const t0 = performance.now();
    setM1Data(schema as FormSchema);
    setM1Metrics({ latencyMs: Math.round(performance.now() - t0), tokens: 0, source: "bundle", determinism: 100 });
    setM1Status("success");

    const cachedKey = `sdui_${selectedSchema}`;
    const cached = sessionStorage.getItem(cachedKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      setM2Data(cachedData.schema);
      setM2Cached(true);
      setM2Metrics({ latencyMs: 5, tokens: 0, source: "cache", determinism: 100 });
      setM2Status("success");
    } else {
      try {
        const res = await fetch(`/api/sdui/forms/${selectedSchema}`);
        const data = await res.json();
        setM2Data(data.schema);
        setM2Cached(data.cached);
        setM2Metrics({ latencyMs: data.latencyMs, tokens: 0, source: data.cached ? "cache" : "api", determinism: 100 });
        setM2Status("success");
        sessionStorage.setItem(cachedKey, JSON.stringify(data));
      } catch {
        setM2Status("error");
        setM2Metrics({ latencyMs: 0, tokens: 0, source: "fallback" });
      }
    }

    try {
      const res = await fetch("/api/genui/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: `Generate a ${selectedSchema} form` }),
      });
      const data = await res.json();
      setM3Metrics({ latencyMs: data.latencyMs, tokens: data.tokens, source: data.ok ? "ai" : "fallback", determinism: data.ok ? 80 : 0 });
      if (data.ok) {
        setM3Data(data.schema);
        setM3Status("success");
      } else {
        setM3Raw(data.raw ?? "");
        setM3Issues(data.issues ?? []);
        setM3Status("error");
      }
    } catch {
      setM3Status("error");
      setM3Metrics({ latencyMs: 0, tokens: 0, source: "fallback", determinism: 0 });
    }
  };

  useEffect(() => {
    runAll();
  }, [selectedSchema]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white text-sm mb-2">← Back to Demo 1</button>
            <h1 className="text-2xl font-black tracking-tight">Form Mode Comparison</h1>
            <p className="text-slate-400 mt-1">Compare FE Static · BE SDUI · GenUI side by side</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedSchema}
              onChange={e => setSelectedSchema(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
            >
              {SCHEMA_IDS.map(id => (
                <option key={id} value={id} className="bg-slate-900">{SCHEMA_LABELS[id]}</option>
              ))}
            </select>
            <button onClick={runAll} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors text-sm">
              Re-run All
            </button>
          </div>
        </header>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6 text-sm">
          <span className="text-amber-400">⚠️ Mock context</span>
          <span className="text-slate-300 ml-2">Production would read from database, telemetry, and analytics pipelines.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mode 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h2 className="font-bold text-slate-200">FE Static</h2>
                <p className="text-xs text-slate-500">Schema in client bundle</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 min-h-[400px]">
              {m1Status === "loading" ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-slate-300 border-top-transparent rounded-full animate-spin" />
                </div>
              ) : m1Data ? (
                <FormRenderer schema={m1Data} />
              ) : (
                <div className="text-slate-400 text-sm text-center">No data</div>
              )}
            </div>
            {m1Metrics && <MetricsPanel label="Mode 1" {...m1Metrics} />}
          </div>

          {/* Mode 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h2 className="font-bold text-blue-300">BE SDUI</h2>
                <p className="text-xs text-slate-500">Schema from server with admin control</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 min-h-[400px]">
              {m2Status === "loading" ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-400 border-top-transparent rounded-full animate-spin" />
                </div>
              ) : m2Data ? (
                <>
                  <FormRenderer schema={m2Data} />
                  {m2Cached && (
                    <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg font-medium">
                      ✓ Cache hit — no server call made
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-sm text-center">No data</div>
              )}
            </div>
            {m2Metrics && <MetricsPanel label={`Mode 2${m2Cached ? " (cached)" : ""}`} {...m2Metrics} />}
          </div>

          {/* Mode 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h2 className="font-bold text-violet-300">GenUI</h2>
                <p className="text-xs text-slate-500">AI composes schema on demand</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 min-h-[400px]">
              {m3Status === "loading" ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-violet-400 border-top-transparent rounded-full animate-spin" />
                </div>
              ) : m3Status === "success" && m3Data ? (
                <FormRenderer schema={m3Data} />
              ) : m3Status === "error" ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-700 text-sm mb-2">⚠️ AI Validation Failed</h4>
                    <p className="text-xs text-red-600 mb-3">The AI output could not be parsed as a valid form schema.</p>
                    {m3Issues.length > 0 && (
                      <div className="bg-white rounded p-3 text-xs">
                        <strong className="text-red-600">Issues:</strong>
                        <pre className="mt-1 text-red-500 whitespace-pre-wrap">{JSON.stringify(m3Issues, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  {m3Raw && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1">Raw AI Output:</h4>
                      <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
                        {m3Raw.slice(0, 500)}
                      </pre>
                    </div>
                  )}
                  <button onClick={runAll} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors">
                    🔄 Retry
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 text-sm text-center">No data</div>
              )}
            </div>
            {m3Metrics && <MetricsPanel label="Mode 3" {...m3Metrics} />}
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold text-slate-300 mb-4">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Latency</div>
              <div className="text-2xl font-black text-slate-200">
                {m1Metrics?.latencyMs ?? 0}ms / {m2Metrics?.latencyMs ?? 0}ms / {m3Metrics?.latencyMs ?? 0}ms
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Tokens</div>
              <div className="text-2xl font-black text-slate-200">
                0 / 0 / {m3Metrics?.tokens ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">Determinism</div>
              <div className="text-2xl font-black text-slate-200">
                {m1Metrics?.determinism ?? 0}% / {m2Metrics?.determinism ?? 0}% / {m3Metrics?.determinism ?? 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Bundle / API / AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}