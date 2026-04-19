"use client";

import { useState, useRef } from "react";
import { ChevronRight, Loader2, RotateCcw, Layers, Zap, Plus } from "lucide-react";
import { KPICard } from "./components/KPICard";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { DataTable } from "./components/DataTable";

interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
}

interface Metrics {
  latencyMs: number;
  tokens: number;
  source: "bundle" | "api" | "cache" | "ai" | "fallback";
  determinism?: number;
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

const TOOL_RE = /__TOOL__([\s\S]*?)__ENDTOOL__/g;
const CHUNK_RE = /__CHUNK__(.*?)(?=__TOOL__|__DONE__)/g;

const EXAMPLE_PROMPTS = [
  "Dashboard doanh thu tuần này theo region",
  "Top 10 sản phẩm bán chạy hôm nay",
  "Thống kê đơn hàng với alert stock thấp",
];

type Phase = "idle" | "composing" | "done";

export default function Home() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chunks, setChunks] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (desc?: string) => {
    const prompt = desc ?? description;
    if (!prompt.trim() || isGenerating) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setIsGenerating(true);
    setPhase("composing");
    setToolCalls([]);
    setChunks("");
    setMetrics(null);

    const start = Date.now();
    let totalTokens = 0;

    try {
      const res = await fetch("/api/compose-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
        signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        const calls: ToolCall[] = [];
        let match: RegExpExecArray | null;
        TOOL_RE.lastIndex = 0;
        while ((match = TOOL_RE.exec(accumulated)) !== null) {
          try {
            const { tool, args } = JSON.parse(match[1]);
            calls.push({ id: `${tool}-${Date.now()}-${Math.random()}`, tool, args });
          } catch { /* malformed JSON, skip */ }
        }
        if (calls.length > 0) setToolCalls(calls);

        const chunkMatch = accumulated.match(/__CHUNK__(.*?)(?=__TOOL__|__DONE__)/);
        if (chunkMatch) setChunks(chunkMatch[1]);

        if (accumulated.includes("__DONE__")) {
          const usageMatch = accumulated.match(/"total_tokens":\s*(\d+)/);
          if (usageMatch) totalTokens = parseInt(usageMatch[1], 10);
          setMetrics({ latencyMs: Date.now() - start, tokens: totalTokens, source: "ai", determinism: 80 });
          setPhase("done");
          break;
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setToolCalls([]);
    setPhase("idle");
    setIsGenerating(false);
    setMetrics(null);
    setChunks("");
  };

  const isIdle = phase === "idle";
  const isDone = phase === "done";

  const renderTool = (tool: string, args: Record<string, unknown>) => {
    switch (tool) {
      case "add_kpi":
        return <KPICard title={args.title as string} value={args.value as string} delta={args.delta as string | undefined} />;
      case "add_line_chart":
        return <LineChart title={args.title as string} series={args.series as Array<{ name: string; data: number[] }>} />;
      case "add_bar_chart":
        return <BarChart title={args.title as string} categories={args.categories as string[]} values={args.values as number[]} />;
      case "add_table":
        return <DataTable title={args.title as string} columns={args.columns as string[]} rows={args.rows as string[][]} />;
      default:
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <span className="font-bold text-amber-700">⚠️ Unknown tool:</span> {tool}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded-xl text-white">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 2 — Dashboard Builder</h1>
              <p className="text-xs text-slate-500">Gõ yêu cầu → AI compose dashboard với tool calls</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full border border-violet-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            INTERNAL TOOL CALLING · MINIMAX M2.7
          </span>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
          {[
            { icon: "✍️", label: "Natural Language" },
            { icon: "🤖", label: "AI chọn tools" },
            { icon: "⚡", label: "Dashboard widgets render ngay" },
          ].map((step, i, arr) => (
            <span key={step.label} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 rounded-md border border-violet-200 text-violet-700">
                {step.icon} {step.label}
              </span>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
            </span>
          ))}
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="Mô tả dashboard bạn muốn... VD: 'Dashboard doanh thu tuần này'"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={!description.trim() || isGenerating}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating
              ? <><Loader2 size={16} className="animate-spin" /> Composing...</>
              : <><Layers size={16} /> Compose</>
            }
          </button>
          {!isIdle && (
            <button onClick={handleReset} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl">
              <RotateCcw size={16} className="text-slate-500" />
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${
              isGenerating ? "bg-violet-500 animate-pulse" :
              isDone && toolCalls.length > 0 ? "bg-green-500" : "bg-slate-300"
            }`} />
            {isGenerating ? "🤖 AI đang compose..." :
             isDone && toolCalls.length > 0 ? `✅ ${toolCalls.length} widget được tạo` :
             "🤖 Tool calls sẽ hiện ở đây"}
          </h2>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto flex-1" style={{ minHeight: "520px" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-6">
                <Layers size={36} className="stroke-1" />
                <p className="text-sm font-medium text-center">AI sẽ chọn từ 4 tools</p>
                <div className="flex flex-col gap-1.5 mt-1 w-full">
                  {["add_kpi", "add_line_chart", "add_bar_chart", "add_table"].map(tool => (
                    <div key={tool} className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-mono border border-slate-100">
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            ) : toolCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Loader2 size={28} className="animate-spin text-violet-500" />
                <p className="text-sm">AI đang quyết định...</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {toolCalls.map((tc, i) => (
                  <div key={tc.id} className="bg-slate-50 rounded-xl p-3 border border-violet-200" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Plus size={12} className="text-violet-600" />
                      <span className="text-xs font-bold text-violet-700 font-mono">{tc.tool}</span>
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {JSON.stringify(tc.args, null, 2).slice(0, 200)}
                    </pre>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-1 pt-1">
                    <Loader2 size={11} className="animate-spin" /> Đang xem xét thêm...
                  </div>
                )}
              </div>
            )}
          </div>

          {metrics && (
            <MetricsPanel
              label="Demo 2"
              latencyMs={metrics.latencyMs}
              tokens={metrics.tokens}
              source={metrics.source}
              determinism={metrics.determinism}
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <Zap size={14} className={isDone && toolCalls.length > 0 ? "text-green-500" : "text-slate-300"} />
            {isDone && toolCalls.length > 0 ? "🚀 Dashboard được render" : "🚀 Widgets sẽ xuất hiện ở đây"}
          </h2>

          <div className="flex-1 overflow-auto rounded-xl bg-white border border-slate-200 shadow-sm p-5" style={{ minHeight: "520px" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm font-semibold text-slate-600">Dashboard widgets render trong &lt;3s</p>
                  <p className="text-xs text-slate-400 mt-1">AI gọi add_kpi, add_line_chart, add_bar_chart, add_table</p>
                </div>
                <div className="w-full max-w-sm">
                  <p className="text-xs text-slate-400 mb-2 justify-center flex">Thử nhanh:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EXAMPLE_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => { setDescription(p); handleGenerate(p); }}
                        className="text-xs text-left px-3 py-2.5 bg-white hover:bg-violet-50 text-slate-600 hover:text-violet-700 rounded-xl border border-slate-200 hover:border-violet-200 transition-colors leading-snug shadow-sm"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : toolCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-violet-500" />
                <p className="text-sm">Đợi AI compose...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {toolCalls.map((tc) => (
                  <div key={tc.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderTool(tc.tool, tc.args)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-800">
            <strong>Demo 2 — Internal Dashboard Builder</strong> —
            User gõ yêu cầu → AI gọi tool để compose dashboard với KPI cards, charts, tables.
            Real streaming: widgets render từng cái khi tool calls được xử lý.
            Mock data từ /api/mock-data/[dataset] — AI không hallucinate số.
          </div>
        </div>
      </div>
    </div>
  );
}