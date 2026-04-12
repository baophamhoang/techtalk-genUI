"use client";

import { useState, useRef } from "react";
import { Wand2, ChevronRight, Loader2, RotateCcw, Lightbulb } from "lucide-react";

// Marker appended by the BE at the end of the stream to hand off the previewId
const PREVIEW_ID_MARKER = /\n\n__PREVIEW_ID__([a-f0-9-]+)__END__$/;

const EXAMPLE_PROMPTS = [
  "Form đăng ký khóa học online: chọn khóa học, ca học, phương thức thanh toán",
  "Dashboard theo dõi đơn hàng với bảng trạng thái và bộ lọc",
  "Card sản phẩm có thể add to cart với counter số lượng",
  "Form tạo ticket hỗ trợ kỹ thuật với mức độ ưu tiên và upload ảnh",
  "Bảng chấm công nhân viên theo tuần với tổng giờ làm",
  "Wizard 3 bước: Thông tin cá nhân → Địa chỉ → Xác nhận",
];

// ─── iframe pointing to BE-served preview URL ────────────────────────────────
function LivePreview({ url }: { url: string }) {
  return (
    <iframe
      key={url}
      src={url}
      style={{
        width: "100%",
        height: "560px",
        border: "1px solid #334155",
        borderRadius: "0.75rem",
        background: "#fff",
      }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedCode, setStreamedCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "streaming" | "done">("idle");
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (desc?: string) => {
    const prompt = desc ?? description;
    if (!prompt.trim() || isGenerating) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setPhase("streaming");
    setStreamedCode("");
    setPreviewUrl("");

    try {
      const res = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Show code without the trailing marker while streaming
        setStreamedCode(accumulated.replace(PREVIEW_ID_MARKER, ""));
      }

      // Extract BE-issued previewId from the end of the stream
      const match = accumulated.match(PREVIEW_ID_MARKER);
      if (match) {
        setPreviewUrl(`/api/preview/${match[1]}`);
      }
      setStreamedCode(accumulated.replace(PREVIEW_ID_MARKER, "").trim());
      setPhase("done");
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setStreamedCode("");
    setPreviewUrl("");
    setPhase("idle");
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-xl">
              <Wand2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 3 — AI Code Generator</h1>
              <p className="text-xs text-slate-400">Mô tả bằng tiếng Việt → AI viết React code → Live Preview ngay lập tức</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-purple-900/50 text-purple-300 rounded-full border border-purple-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI CODE GEN · MINIMAX
          </span>
        </div>

        {/* Flow diagram */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          {[
            { icon: "✍️", label: "Natural Language" },
            { icon: "🤖", label: "AI (streamText)" },
            { icon: "⚛️", label: "React JSX Code" },
            { icon: "🚀", label: "BE-Served Preview" },
          ].map((step, i, arr) => (
            <span key={step.label} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/50 rounded-md border border-purple-900 text-purple-300">
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
          <div className="flex-1 relative">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="Mô tả UI bạn muốn bằng tiếng Việt... VD: 'Form đặt lịch khám bệnh với chọn bác sĩ và giờ khám'"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={!description.trim() || isGenerating}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Wand2 size={16} /> Generate UI</>
            )}
          </button>
          {phase !== "idle" && (
            <button
              onClick={handleReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              title="Reset"
            >
              <RotateCcw size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Quick prompts */}
        {phase === "idle" && (
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

        {/* Left: Streamed code (raw view) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-purple-400 animate-pulse" : phase === "done" ? "bg-green-400" : "bg-slate-600"}`} />
              ⚛️ AI đang viết code...
            </h2>
            {phase === "done" && (
              <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2.5 py-1 rounded-full border border-green-800">
                ✅ {streamedCode.split("\n").length} dòng code
              </span>
            )}
            {isGenerating && (
              <span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2.5 py-1 rounded-full border border-purple-800">
                {streamedCode.length} ký tự...
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-auto" style={{ minHeight: "500px" }}>
            {phase === "idle" ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <Wand2 size={40} className="stroke-1" />
                <p className="text-sm">Code sẽ stream ra đây từng ký tự một</p>
              </div>
            ) : (
              <pre className="p-4 text-xs text-green-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                {streamedCode || <span className="text-slate-500 animate-pulse">AI đang suy nghĩ...</span>}
              </pre>
            )}
          </div>
        </div>

        {/* Right: Live Sandpack preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300">🚀 Live Preview</h2>
            {phase === "done" && (
              <span className="text-xs text-slate-500">React 18 • Tailwind CSS • Babel</span>
            )}
          </div>

          <div>
            {phase === "done" && previewUrl ? (
              <LivePreview url={previewUrl} />
            ) : (
              <div className="bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-slate-600 gap-3" style={{ height: "560px" }}>
                {isGenerating ? (
                  <>
                    <Loader2 size={36} className="stroke-1 animate-spin text-purple-500" />
                    <p className="text-sm">Preview sẽ xuất hiện khi code hoàn chỉnh...</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl">🚀</div>
                    <p className="text-sm">Live preview xuất hiện khi AI hoàn thành</p>
                    <p className="text-xs text-slate-700">Không cần setup, không cần compile thủ công</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer comparison */}
      <div className="border-t border-slate-800 bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 text-sm text-purple-200">
            <strong>So sánh 3 demos:</strong>{" "}
            Demo 1 → Rule Engine <em>chọn</em> JSON schema có sẵn.{" "}
            Demo 2 → AI <em>tạo ra</em> JSON schema (vẫn giới hạn bởi Registry).{" "}
            <strong>Demo 3 → AI viết trực tiếp React code — không còn Registry, không còn giới hạn. Mọi UI đều có thể được tạo ra từ ngôn ngữ tự nhiên.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
