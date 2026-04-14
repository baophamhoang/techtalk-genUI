"use client";

import { useState, useRef } from "react";
import { ChevronRight, Loader2, RotateCcw, Lightbulb, Zap, Unlock } from "lucide-react";

const TEMPLATE_ID_RE = /\n\n__TEMPLATE_ID__([a-f0-9-]+)__/;
const PREVIEW_ID_RE  = /\n\n__PREVIEW_ID__([a-f0-9-]+)__END__/;

const EXAMPLE_PROMPTS = [
  "Form đăng ký khóa học online: chọn khóa học, ca học, phương thức thanh toán",
  "Dashboard theo dõi đơn hàng với bảng trạng thái và bộ lọc",
  "Card sản phẩm có thể add to cart với counter số lượng",
  "Form tạo ticket hỗ trợ kỹ thuật với mức độ ưu tiên và upload ảnh",
  "Bảng chấm công nhân viên theo tuần với tổng giờ làm",
  "Wizard 3 bước: Thông tin cá nhân → Địa chỉ → Xác nhận",
];

// ─── Crossfade preview ─────────────────────────────────────────────────────────
// Layer 1: static template (HTML only, no JS)  — shows first
// Layer 2: full interactive (HTML + vanilla JS) — fades in on top
function CrossfadePreview({ templateUrl, previewUrl }: { templateUrl: string; previewUrl: string }) {
  return (
    <div className="relative w-full h-full">
      {/* Layer 1 — static HTML template */}
      {templateUrl && (
        <iframe
          key={templateUrl}
          src={templateUrl}
          sandbox="allow-scripts"
          title="HTML template preview"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", background: "#fff" }}
        />
      )}

      {/* Layer 2 — full interactive, fades in over template */}
      <iframe
        key={previewUrl || "empty"}
        src={previewUrl || "about:blank"}
        sandbox="allow-scripts"
        title="Interactive preview"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", background: "#fff",
          opacity: previewUrl ? 1 : 0,
          transition: "opacity 0.6s ease-in-out",
          pointerEvents: previewUrl ? "auto" : "none",
        }}
      />
    </div>
  );
}

type Phase = "idle" | "template" | "scripting" | "done";

export default function Home() {
  const [description,  setDescription]  = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedCode, setStreamedCode] = useState("");
  const [templateUrl,  setTemplateUrl]  = useState("");
  const [previewUrl,   setPreviewUrl]   = useState("");
  const [phase,        setPhase]        = useState<Phase>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (desc?: string) => {
    const prompt = desc ?? description;
    if (!prompt.trim() || isGenerating) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setIsGenerating(true);
    setPhase("template");
    setStreamedCode("");
    setTemplateUrl("");
    setPreviewUrl("");

    try {
      const res = await fetch("/api/generate-progressive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
        signal,
      });

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated   = "";
      let templateIdSet = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Strip both markers for clean code display
        setStreamedCode(
          accumulated
            .replace(TEMPLATE_ID_RE, "")
            .replace(PREVIEW_ID_RE, ""),
        );

        // Template marker — HTML structure is ready, JS still streaming
        if (!templateIdSet) {
          const m = accumulated.match(TEMPLATE_ID_RE);
          if (m) {
            templateIdSet = true;
            setTemplateUrl(`/api/preview/${m[1]}`);
            setPhase("scripting");
          }
        }

        // Preview marker — full interactive document is ready
        const pm = accumulated.match(PREVIEW_ID_RE);
        if (pm) {
          setPreviewUrl(`/api/preview/${pm[1]}`);
          setPhase("done");
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
      setPhase(p => p !== "idle" && p !== "done" ? "done" : p);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setStreamedCode("");
    setTemplateUrl("");
    setPreviewUrl("");
    setPhase("idle");
    setIsGenerating(false);
  };

  const isIdle = phase === "idle";
  const isDone = phase === "done";
  const lineCount = streamedCode.split("\n").length;

  const phaseSteps = [
    { key: "template",  icon: "🏗️",  label: "HTML template" },
    { key: "scripting", icon: "⚡",  label: "JavaScript"    },
    { key: "done",      icon: "✅",  label: "Interactive"   },
  ] as const;
  const phaseOrder: Phase[] = ["idle", "template", "scripting", "done"];
  const phaseIdx = phaseOrder.indexOf(phase);

  const codeLabel =
    phase === "template"  ? "🏗️ Đang stream HTML template..." :
    phase === "scripting" ? "⚡ Đang stream JavaScript..."   :
    isDone                ? `✅ Hoàn thành — ${lineCount} dòng` :
                            "Code sẽ stream ra đây";

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
              <p className="text-xs text-slate-400">HTML template ngay → JavaScript upgrade → Interactive</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-900/50 text-emerald-300 rounded-full border border-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MINIMAX M2.7
          </span>
        </div>

        {/* Flow */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          {[
            { icon: "✍️", label: "Natural Language" },
            { icon: "🏗️", label: "HTML template (~5s)" },
            { icon: "⚡", label: "Vanilla JS (~10s)" },
            { icon: "🔓", label: "Interactive ngay" },
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

      {/* Input */}
      <div className="border-b border-slate-800 bg-[#111] px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="Mô tả UI bạn muốn... VD: 'Form đặt lịch khám bệnh'"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <button onClick={handleReset} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">
              <RotateCcw size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Phase progress */}
        {!isIdle && (
          <div className="max-w-[1400px] mx-auto mt-3 flex items-center gap-2">
            {phaseSteps.map((s, i) => {
              const sIdx  = i + 1; // template=1, scripting=2, done=3
              const done   = phaseIdx > sIdx;
              const active = phaseIdx === sIdx;
              return (
                <span key={s.key} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-300 ${
                  done   ? "bg-green-900/40 text-green-400 border-green-800" :
                  active ? "bg-amber-900/40 text-amber-300 border-amber-700" :
                           "bg-slate-800/40 text-slate-600 border-slate-700/50"
                }`}>
                  {active && <Loader2 size={10} className="animate-spin" />}
                  {s.icon} {s.label}
                </span>
              );
            })}
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
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 line-clamp-1 text-left"
                style={{ maxWidth: "260px" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: code stream */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                phase === "template"  ? "bg-amber-400 animate-pulse" :
                phase === "scripting" ? "bg-emerald-400 animate-pulse" :
                isDone                ? "bg-green-400"   : "bg-slate-600"
              }`} />
              {codeLabel}
            </h2>
            {!isIdle && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isDone
                  ? "text-green-400 bg-green-900/30 border-green-800"
                  : "text-emerald-400 bg-emerald-900/30 border-emerald-800"
              }`}>
                {streamedCode.length} ký tự
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-auto" style={{ minHeight: "520px" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <Zap size={40} className="stroke-1" />
                <p className="text-sm font-medium">HTML template trước, JS sau</p>
                <p className="text-xs text-slate-700">Preview xuất hiện khi HTML xong — không cần đợi JS</p>
              </div>
            ) : (
              <pre className={`p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all ${
                phase === "scripting" ? "text-emerald-300" : "text-amber-200"
              }`}>
                {streamedCode || <span className="text-slate-500 animate-pulse">AI đang sinh code...</span>}
              </pre>
            )}
          </div>
        </div>

        {/* Right: crossfade preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300">🚀 Live Preview</h2>
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              {isDone && previewUrl
                ? <><Unlock size={11} className="text-green-400" /> Interactive · Vanilla JS</>
                : templateUrl
                ? <span className="text-amber-400">🏗️ Template loaded — JS đang stream...</span>
                : null
              }
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-900" style={{ height: "560px", border: "1px solid #334155" }}>
            {isIdle ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <div className="text-4xl">⚡</div>
                <p className="text-sm font-medium">Template hiện trong ~5s</p>
                <p className="text-xs text-slate-700">JS upgrade tự động khi xong — không reload, không flash</p>
              </div>
            ) : !templateUrl ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <Loader2 size={32} className="animate-spin text-amber-500" />
                <p className="text-sm">Đang sinh HTML template...</p>
              </div>
            ) : (
              <CrossfadePreview templateUrl={templateUrl} previewUrl={previewUrl} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-sm text-emerald-200">
            <strong>Cách hoạt động:</strong>{" "}
            AI sinh một HTML document duy nhất — layout HTML trước, <code className="bg-emerald-900/40 px-1 rounded">&lt;script&gt;</code> ở cuối.
            Khi phát hiện tag <code className="bg-emerald-900/40 px-1 rounded">&lt;script&gt;</code> trong stream, template tĩnh được lưu và hiển thị ngay (~5s).
            Khi JS xong, bản đầy đủ crossfade vào — cùng layout, có tương tác — không reload, không flash.
          </div>
        </div>
      </div>
    </div>
  );
}
