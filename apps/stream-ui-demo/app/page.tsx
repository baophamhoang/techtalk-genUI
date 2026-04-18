"use client";

import { useState, useRef } from "react";
import { ChevronRight, Loader2, RotateCcw, Lightbulb, Layers, Zap } from "lucide-react";
import { ProductCard } from "./components/ProductCard";
import { FormPanel } from "./components/FormPanel";
import { StatsGrid } from "./components/StatsGrid";
import { DataTable } from "./components/DataTable";
import { AlertBanner } from "./components/AlertBanner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
}

const TOOL_RE = /__TOOL__([\s\S]*?)__ENDTOOL__/g;

const EXAMPLE_PROMPTS = [
  "Dashboard quản lý đơn hàng tuần này",
  "Form đặt lịch khám bệnh với chọn bác sĩ",
  "Card sản phẩm tai nghe Sony WH-1000XM5",
  "Thống kê kho hàng với cảnh báo tồn kho thấp",
];

// ─── Component renderer ───────────────────────────────────────────────────────
function RenderedTool({ tool, args }: { tool: string; args: Record<string, unknown> }) {
  switch (tool) {
    case "showProductCard":
      return <ProductCard {...(args as any)} />;
    case "showForm":
      return <FormPanel {...(args as any)} />;
    case "showStatsGrid":
      return <StatsGrid {...(args as any)} />;
    case "showDataTable":
      return <DataTable {...(args as any)} />;
    case "showAlertBanner":
      return <AlertBanner {...(args as any)} />;
    default:
      return null;
  }
}

const toolLabels: Record<string, string> = {
  showProductCard:  "🛍️  ProductCard",
  showForm:         "📝  FormPanel",
  showStatsGrid:    "📊  StatsGrid",
  showDataTable:    "📋  DataTable",
  showAlertBanner:  "🔔  AlertBanner",
};

type Phase = "idle" | "composing" | "done";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [description,  setDescription]  = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolCalls,    setToolCalls]    = useState<ToolCall[]>([]);
  const [phase,        setPhase]        = useState<Phase>("idle");
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

    try {
      const res = await fetch("/api/compose-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
        signal,
      });

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Extract all tool calls seen so far
        const calls: ToolCall[] = [];
        let match: RegExpExecArray | null;
        TOOL_RE.lastIndex = 0;
        while ((match = TOOL_RE.exec(accumulated)) !== null) {
          try {
            const { tool, args } = JSON.parse(match[1]);
            calls.push({ id: `${tool}-${calls.length}`, tool, args });
          } catch { /* malformed JSON, skip */ }
        }
        if (calls.length > 0) setToolCalls(calls);

        if (accumulated.includes("__DONE__")) {
          setPhase("done");
          break;
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
      setPhase(p => p === "composing" ? "done" : p);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setToolCalls([]);
    setPhase("idle");
    setIsGenerating(false);
  };

  const isIdle = phase === "idle";
  const isDone = phase === "done";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded-xl text-white">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 2 — Tool Calling</h1>
              <p className="text-xs text-slate-500">AI chọn component → render ngay — không sinh code</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full border border-violet-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            TOOL CALLING · MINIMAX M2.7
          </span>
        </div>

        {/* Flow */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
          {[
            { icon: "✍️", label: "Natural Language" },
            { icon: "🤖", label: "AI chọn tools" },
            { icon: "⚡", label: "Components render ngay" },
            { icon: "✅", label: "Design system nhất quán" },
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

      {/* Input */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="Mô tả UI bạn muốn... VD: 'Dashboard quản lý đơn hàng'"
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
              : <><Layers size={16} /> Compose UI</>
            }
          </button>
          {!isIdle && (
            <button onClick={handleReset} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl">
              <RotateCcw size={16} className="text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* Left: tool call log */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${
              isGenerating ? "bg-violet-500 animate-pulse" :
              isDone && toolCalls.length > 0 ? "bg-green-500" : "bg-slate-300"
            }`} />
            {isGenerating ? "🤖 AI đang chọn components..." :
             isDone && toolCalls.length > 0 ? `✅ ${toolCalls.length} component được chọn` :
             "🤖 Tool calls sẽ hiện ở đây"}
          </h2>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto flex-1" style={{ minHeight: "520px" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-6">
                <Layers size={36} className="stroke-1" />
                <p className="text-sm font-medium text-center">AI sẽ chọn từ 5 components</p>
                <div className="flex flex-col gap-1.5 mt-1 w-full">
                  {Object.entries(toolLabels).map(([, label]) => (
                    <div key={label} className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-mono border border-slate-100">
                      {label}
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
                  <div
                    key={tc.id}
                    className="bg-slate-50 rounded-xl p-3 border border-violet-200"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs font-bold text-violet-700 font-mono">
                        {toolLabels[tc.tool] ?? tc.tool}
                      </span>
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {(() => { const s = JSON.stringify(tc.args ?? {}, null, 2); return s.slice(0, 280) + (s.length > 280 ? "\n…" : ""); })()}
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
        </div>

        {/* Right: rendered components */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <Zap size={14} className={isDone && toolCalls.length > 0 ? "text-green-500" : "text-slate-300"} />
            {isDone && toolCalls.length > 0
              ? "🚀 UI được render từ design system"
              : "🚀 Components sẽ xuất hiện ở đây"}
          </h2>

          <div
            className="flex-1 overflow-auto rounded-xl bg-white border border-slate-200 shadow-sm p-5"
            style={{ minHeight: "520px" }}
          >
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <p className="text-sm font-semibold text-slate-600">Components render trong &lt;3s</p>
                  <p className="text-xs text-slate-400 mt-1">AI chọn đúng component — không sinh code ngẫu nhiên</p>
                </div>
                <div className="w-full max-w-sm">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-2 justify-center">
                    <Lightbulb size={12} /> Thử nhanh:
                  </p>
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
                <p className="text-sm">Đợi AI chọn components...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {toolCalls.map((tc) => (
                  <div key={tc.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <RenderedTool tool={tc.tool} args={tc.args} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-800">
            <strong>Tại sao tốt hơn?</strong>{" "}
            Demo 1 để AI sinh JSON schema — renderer vẫn là bottleneck, chỉ tạo được form field đơn giản.
            Demo 2 (demo này) đảo ngược: developer định nghĩa component library, AI chỉ <em>chọn component</em> và <em>điền tham số</em> (~50 tokens).
            Kết quả: rich UI (card, table, stats, alert), design system nhất quán 100%, render trực tiếp trong React.
          </div>
        </div>
      </div>
    </div>
  );
}
