"use client";

import { useState } from "react";
import { Bot, Sun, Cloud, Moon, Thermometer, Search, TrendingUp, AlertTriangle } from "lucide-react";

interface SignalBundle {
  persona: { id: string; name: string; age: number; city: string; profile: string; pattern: string };
  scenario: string;
  time: string;
  weather: { temp: number; condition: string };
  behavior: { recentOrders: number; searchHistory: string[]; sessionMinutes: number };
  location: string;
}

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

interface Metrics {
  latencyMs: number;
  tokens: number;
}


function MetricsPanel({ label, latencyMs, tokens, source, determinism }: { label: string; latencyMs: number; tokens: number; source: string; determinism?: number; }) {
  const sourceColors: Record<string, string> = {
    ai: "bg-emerald-100 text-emerald-700",
    fallback: "bg-amber-100 text-amber-700",
  };
  const sourceLabels: Record<string, string> = { ai: "AI", fallback: "Fallback" };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${sourceColors[source] ?? "bg-slate-100 text-slate-600"}`}>
          {sourceLabels[source] ?? source}
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
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${determinism}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-700">{determinism}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

const PERSONAS = [
  { id: "minh", name: "Minh", label: "Văn phòng · HCM", hint: "Thích đồ cay · ăn trưa", icon: "💼" },
  { id: "lan", name: "Lan", label: "Mẹ đơn thân · Hà Nội", hint: "Lành mạnh · tiết kiệm", icon: "👩‍👧‍👦" },
  { id: "tuan", name: "Tuấn", label: "Sinh viên · Đà Nẵng", hint: "Gà rán · ăn khuya", icon: "🎓" },
  { id: "an", name: "An", label: "Gia đình · HCM", hint: "Hải sản cao cấp · cuối tuần", icon: "👨‍👩‍👧‍👦" },
];

const SCENARIOS = [
  { id: "baseline", label: "📊 Baseline (10:00)", desc: "Normal browsing — default home grid" },
  { id: "weather", label: "❄️ Weather Shift (14:00)", desc: "Cold snap — comfort food restructure" },
  { id: "searchAbandon", label: "🔍 Search Abandon (22:30)", desc: "Multiple searches no order — mood picker" },
];

function HomeSurface({ tools }: { tools: ToolCall[] }) {
  if (tools.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p className="text-sm">Run a scenario to see the UI</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tools.map((tc, i) => {
        if (tc.name === "restructureHome") {
          const args = tc.args as { hero?: { title: string; subtitle: string; tag?: string }; rows: Array<{ title: string; items: Array<{ name: string; price: string; badge?: string }> }>; hideDefaultRows?: boolean };
          return (
            <div key={i} className="space-y-3">
              {args.hero && (
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    {args.hero.tag && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{args.hero.tag}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{args.hero.title}</h3>
                  <p className="text-sm opacity-80">{args.hero.subtitle}</p>
                </div>
              )}
              {(args.rows ?? []).map((row, j) => (
                <div key={j} className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-700">{row.title}</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {row.items.map((item, k) => (
                      <div key={k} className="flex-shrink-0 w-36 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <div className="bg-slate-100 rounded-lg h-24 mb-2 flex items-center justify-center text-2xl">🍜</div>
                        <div className="text-xs font-medium text-slate-800 truncate">{item.name}</div>
                        <div className="text-xs text-violet-600 font-bold">{item.price}</div>
                        {item.badge && (
                          <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{item.badge}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (tc.name === "showMoodPicker") {
          const args = tc.args as { prompt: string; moods: Array<{ label: string; icon: string; curatedItems: Array<{ name: string; price: string }> }> };
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">{args.prompt}</h3>
              <div className="grid grid-cols-3 gap-3">
                {args.moods.map((mood, j) => (
                  <div key={j} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 hover:border-violet-300 cursor-pointer">
                    <div className="text-2xl mb-2">{mood.icon}</div>
                    <div className="text-sm font-bold text-slate-700 mb-2">{mood.label}</div>
                    <div className="space-y-1">
                      {mood.curatedItems.slice(0, 2).map((item, k) => (
                        <div key={k} className="text-xs text-slate-500">{item.name} — {item.price}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (tc.name === "showContextBanner") {
          const args = tc.args as { tone: string; title: string; message: string };
          const colors = {
            info: "bg-blue-50 border-blue-200 text-blue-800",
            warning: "bg-amber-50 border-amber-200 text-amber-800",
            success: "bg-green-50 border-green-200 text-green-800",
          };
          return (
            <div key={i} className={`rounded-xl p-4 border ${colors[args.tone as keyof typeof colors] ?? colors.info}`}>
              <div className="font-bold text-sm">{args.title}</div>
              <div className="text-xs mt-1 opacity-80">{args.message}</div>
            </div>
          );
        }

        if (tc.name === "showCuratedRow") {
          const args = tc.args as { title: string; tag?: string; items: Array<{ name: string; price: string; priceRange?: string }> };
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-bold text-slate-700">{args.title}</h4>
                {args.tag && (
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{args.tag}</span>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto">
                {args.items.map((item, j) => (
                  <div key={j} className="flex-shrink-0 w-32 text-center">
                    <div className="bg-slate-100 rounded-lg h-20 mb-1 flex items-center justify-center text-xl">🍲</div>
                    <div className="text-xs font-medium text-slate-700 truncate">{item.name}</div>
                    <div className="text-xs text-violet-600">{item.priceRange ?? item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function PipelineLog({ bundle, tools, metrics }: { bundle: SignalBundle; tools: ToolCall[]; metrics: Metrics | null }) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono overflow-auto h-full">
      <div className="text-emerald-400 font-bold mb-3">📋 Pipeline Log</div>

      <div className="mb-4">
        <div className="text-slate-400 mb-1">SIGNAL BUNDLE</div>
        <pre className="text-slate-300 whitespace-pre-wrap">
          {JSON.stringify({
            persona: bundle.persona.name,
            scenario: bundle.scenario,
            time: bundle.time,
            weather: `${bundle.weather.temp}°C ${bundle.weather.condition}`,
            location: bundle.location,
            recentOrders: bundle.behavior.recentOrders,
            searchHistory: bundle.behavior.searchHistory,
          }, null, 2)}
        </pre>
      </div>

      {tools.length > 0 ? (
        <div>
          <div className="text-slate-400 mb-1">TOOL CALLS</div>
          <div className="space-y-2">
            {tools.map((tc, i) => (
              <div key={i} className="bg-slate-800 rounded p-2">
                <div className="text-violet-400">{tc.name}</div>
                <pre className="text-slate-400 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(tc.args, null, 2).slice(0, 300)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-slate-500 italic">Waiting for tool calls…</div>
      )}

      {metrics && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="text-slate-500">
            Latency: {metrics.latencyMs}ms · Tokens: {metrics.tokens}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState("minh");
  const [selectedScenario, setSelectedScenario] = useState("baseline");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [bundle, setBundle] = useState<SignalBundle | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    setHasRun(true);
    setTools([]);
    setBundle(null);
    setMetrics(null);
    setReasoning("");

    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: selectedPersona, scenario: selectedScenario }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let leftover = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = leftover + decoder.decode(value, { stream: true });
        const lines = text.split("\n");
        leftover = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            console.log('event :>> ', event);
            if (event.type === "bundle") setBundle(event.bundle);
            if (event.type === "text") setReasoning(prev => prev + event.delta);
            if (event.type === "tool") setTools(prev => [...prev, { name: event.name, args: event.args }]);
            if (event.type === "done") {
              setMetrics({ latencyMs: event.latencyMs, tokens: event.tokens });
              setIsLoading(false);
            }
            if (event.type === "error") setIsLoading(false);
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 3 — Adaptive Context-Aware UI</h1>
              <p className="text-xs text-slate-500">Food delivery · AI reads context · Restructures UI</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            🌐 CONSUMER · FOOD DELIVERY
          </span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Persona picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-600 mb-3">👤 Persona</h2>
            <div className="space-y-2">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    selectedPersona === p.id
                      ? "bg-emerald-50 border-2 border-emerald-500"
                      : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{p.name} <span className="font-normal text-slate-500">· {p.label}</span></div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Context simulator */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-600 mb-3">🎯 Context Simulator</h2>
            <div className="space-y-2">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedScenario === s.id
                      ? "bg-emerald-50 border-2 border-emerald-500"
                      : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-top-transparent rounded-full animate-spin" />
                Composing...
              </>
            ) : (
              "▶ Run Scenario"
            )}
          </button>

          {/* Metrics */}
          {metrics && (
            <MetricsPanel
              label="Demo 3"
              latencyMs={metrics.latencyMs}
              tokens={metrics.tokens}
              source={tools.length > 0 ? "ai" : "fallback"}
              determinism={tools.length > 0 ? 80 : 0}
            />
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <span className="text-amber-700 font-bold">⚠️ Mock context simulator</span>
            <span className="text-amber-600 ml-2">Production reads from weather APIs, analytics events, order DB, device telemetry.</span>
          </div>

          {/* Home surface */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 min-h-[400px] shadow-sm">
            <h2 className="text-sm font-bold text-slate-600 mb-4">🏠 Home Surface</h2>

            {/* AI reasoning — streams in before tools render */}
            {(reasoning || (isLoading && hasRun)) && (
              <div className="mb-4 flex gap-2 items-start bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="text-base mt-0.5">🤖</span>
                <p className="text-sm text-emerald-800 italic leading-relaxed">
                  {reasoning || <span className="text-emerald-400">Đang phân tích ngữ cảnh…</span>}
                  {isLoading && reasoning && <span className="inline-block w-0.5 h-3.5 bg-emerald-500 ml-0.5 animate-pulse align-middle" />}
                </p>
              </div>
            )}

            {tools.length > 0 ? (
              <HomeSurface tools={tools} />
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-xs text-slate-400">Composing UI…</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                Run a scenario to see the adaptive UI
              </div>
            )}
          </div>

          {/* Pipeline log */}
          {bundle && hasRun && (
            <div className="min-h-[300px]">
              <PipelineLog bundle={bundle} tools={tools} metrics={metrics} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}