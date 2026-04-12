"use client";

import { useState, useRef } from "react";
import { Wand2, ChevronRight, Loader2, RotateCcw, Lightbulb, Zap, CheckCircle2 } from "lucide-react";

const PREVIEW_ID_MARKER = /\n\n__PREVIEW_ID__([a-f0-9-]+)__END__$/;

const EXAMPLE_PROMPTS = [
  "Form đăng ký khóa học online: chọn khóa học, ca học, phương thức thanh toán",
  "Dashboard theo dõi đơn hàng với bảng trạng thái và bộ lọc",
  "Card sản phẩm có thể add to cart với counter số lượng",
  "Form tạo ticket hỗ trợ kỹ thuật với mức độ ưu tiên và upload ảnh",
  "Bảng chấm công nhân viên theo tuần với tổng giờ làm",
  "Wizard 3 bước: Thông tin cá nhân → Địa chỉ → Xác nhận",
];

type GenPhase = "idle" | "static" | "react" | "done";

// ─── Sandwiched phase indicator ───────────────────────────────────────────────
function PhaseBar({ phase }: { phase: GenPhase }) {
  const steps = [
    { key: "static", label: "Phase 1 — Static HTML", time: "~2s" },
    { key: "react",  label: "Phase 2 — Interactive React", time: "~10s" },
  ] as const;

  return (
    <div className="flex items-center gap-4">
      {steps.map(s => {
        const isDone    = phase === "done" || (s.key === "static" && phase === "react");
        const isActive  = phase === s.key;
        return (
          <span
            key={s.key}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${
              isDone   ? "bg-green-900/30 text-green-400 border-green-800" :
              isActive ? "bg-amber-900/30 text-amber-300 border-amber-700 animate-pulse" :
                         "bg-slate-800 text-slate-600 border-slate-700"
            }`}
          >
            {isDone ? <CheckCircle2 size={11} /> : isActive ? <Loader2 size={11} className="animate-spin" /> : null}
            {s.label}
            <span className="opacity-60">{s.time}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Live Preview iframe ───────────────────────────────────────────────────────
function LivePreview({ url, isUpgrading }: { url: string; isUpgrading: boolean }) {
  return (
    <div className="relative">
      {isUpgrading && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-900/80 text-amber-300 border border-amber-700">
          <Zap size={10} className="animate-pulse" /> Upgrading to React...
        </div>
      )}
      <iframe
        key={url}
        src={url}
        sandbox="allow-scripts"
        style={{
          width: "100%",
          height: "560px",
          border: `1px solid ${isUpgrading ? "#92400e" : "#334155"}`,
          borderRadius: "0.75rem",
          background: "#fff",
          transition: "border-color 0.3s",
        }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedCode, setStreamedCode] = useState("");
  const [staticUrl, setStaticUrl]   = useState("");   // Phase 1 result
  const [reactUrl, setReactUrl]     = useState("");   // Phase 2 result
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const streamEndpoint = async (
    endpoint: string,
    prompt: string,
    onChunk: (text: string) => void,
    signal: AbortSignal,
  ): Promise<string | null> => {
    const res = await fetch(endpoint, {
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
      onChunk(accumulated.replace(PREVIEW_ID_MARKER, ""));
    }
    const match = accumulated.match(PREVIEW_ID_MARKER);
    return match ? match[1] : null;
  };

  const handleGenerate = async (desc?: string) => {
    const prompt = desc ?? description;
    if (!prompt.trim() || isGenerating) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setIsGenerating(true);
    setGenPhase("static");
    setStreamedCode("");
    setStaticUrl("");
    setReactUrl("");

    try {
      // ── Phase 1: static HTML — appears fast ──────────────────────────────
      const staticId = await streamEndpoint(
        "/api/generate-ui-static", prompt,
        (text) => setStreamedCode(text),
        signal,
      );
      if (staticId) setStaticUrl(`/api/preview/${staticId}`);

      // ── Phase 2: full React — upgrades the preview silently ───────────────
      setGenPhase("react");
      const reactId = await streamEndpoint(
        "/api/generate-ui", prompt,
        (text) => setStreamedCode(text),
        signal,
      );
      if (reactId) setReactUrl(`/api/preview/${reactId}`);

      setGenPhase("done");
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
      setGenPhase("done");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setStreamedCode("");
    setStaticUrl("");
    setReactUrl("");
    setGenPhase("idle");
    setIsGenerating(false);
  };

  // Show React preview when available, fall back to static while upgrading
  const activeUrl       = reactUrl || staticUrl;
  const isUpgrading     = !!staticUrl && !reactUrl && genPhase === "react";
  const isIdle          = genPhase === "idle";
  const codeLabel =
    genPhase === "static" ? "🖼️ Phase 1 — HTML/Tailwind streaming..." :
    genPhase === "react"  ? "⚛️ Phase 2 — React code streaming..." :
    genPhase === "done"   ? "✅ React component ready" :
    "⚛️ AI đang viết code...";

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Zap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 4 — Progressive GenUI</h1>
              <p className="text-xs text-slate-400">Static preview ngay lập tức (~2s) → Tự động upgrade lên Interactive React (~10s)</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-900/50 text-emerald-300 rounded-full border border-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PROGRESSIVE · MINIMAX
          </span>
        </div>

        {/* Flow diagram */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          {[
            { icon: "✍️", label: "Natural Language" },
            { icon: "🖼️", label: "Static HTML (~2s)" },
            { icon: "⚛️", label: "React JSX (~10s)" },
            { icon: "🚀", label: "Progressive Preview" },
          ].map((step, i, arr) => (
            <span key={step.label} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 rounded-md border border-emerald-900 text-emerald-300">
                {step.icon} {step.label}
              </span>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-700" />}
            </span>
          ))}
        </div>
      </header>

      {/* Input bar */}
      <div className="border-b border-slate-800 bg-[#111] px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="Mô tả UI bạn muốn... VD: 'Card sản phẩm có thể add to cart'"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={!description.trim() || isGenerating}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating
              ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
              : <><Zap size={16} /> Generate UI</>
            }
          </button>
          {!isIdle && (
            <button onClick={handleReset} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all" title="Reset">
              <RotateCcw size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Phase status bar */}
        {!isIdle && (
          <div className="max-w-[1400px] mx-auto mt-3">
            <PhaseBar phase={genPhase} />
          </div>
        )}

        {/* Quick prompts */}
        {isIdle && (
          <div className="max-w-[1400px] mx-auto mt-3 flex gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Lightbulb size={12} /> Thử nhanh:
            </span>
            {EXAMPLE_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => { setDescription(p); handleGenerate(p); }}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition-all line-clamp-1 text-left"
                style={{ maxWidth: "260px" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Code stream */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                isGenerating ? "bg-emerald-400 animate-pulse" :
                genPhase === "done" ? "bg-green-400" : "bg-slate-600"
              }`} />
              {codeLabel}
            </h2>
            {genPhase === "done" && (
              <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2.5 py-1 rounded-full border border-green-800">
                ✅ {streamedCode.split("\n").length} dòng
              </span>
            )}
            {isGenerating && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-800">
                {streamedCode.length} ký tự...
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-auto" style={{ minHeight: "500px" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <Zap size={40} className="stroke-1" />
                <p className="text-sm">Phase 1: HTML stream • Phase 2: React stream</p>
              </div>
            ) : (
              <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all" style={{
                color: genPhase === "static" ? "#86efac" : "#6ee7b7",
              }}>
                {streamedCode || <span className="text-slate-500 animate-pulse">AI đang suy nghĩ...</span>}
              </pre>
            )}
          </div>
        </div>

        {/* Right: Progressive preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300">🚀 Live Preview</h2>
            {genPhase === "done" && (
              <span className="text-xs text-slate-500">React 18 • Tailwind CSS • Babel</span>
            )}
          </div>

          {activeUrl ? (
            <LivePreview url={activeUrl} isUpgrading={isUpgrading} />
          ) : (
            <div className="bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-600 gap-3" style={{ height: "560px" }}>
              {isGenerating ? (
                <>
                  <Loader2 size={36} className="stroke-1 animate-spin text-emerald-500" />
                  <p className="text-sm">Static preview đang được tạo...</p>
                  <p className="text-xs text-slate-700">Sẽ xuất hiện trong ~2 giây</p>
                </>
              ) : (
                <>
                  <div className="text-4xl">⚡</div>
                  <p className="text-sm">Static preview trong ~2s, React trong ~10s</p>
                  <p className="text-xs text-slate-700">Progressive enhancement — không cần đợi code hoàn chỉnh</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-sm text-emerald-200">
            <strong>Vấn đề của Demo 3:</strong> Phải đợi toàn bộ React code hoàn thành (10–30s) mới thấy preview — Babel cần code đầy đủ mới compile được.{" "}
            <strong>Giải pháp:</strong> Chạy 2 phases song song: Phase 1 sinh HTML thuần (~2s) để user thấy layout ngay,
            Phase 2 sinh React có interaction (~10s) rồi tự động upgrade preview — user không cần làm gì.
          </div>
        </div>
      </div>
    </div>
  );
}
