"use client";

import { useState, useRef } from "react";
import { JSONUIProvider, Renderer, defineRegistry } from "@json-render/react";
import { Sparkles, Zap, ChevronRight, Loader2 } from "lucide-react";

// ─── Same registry concept as Demo 1, but in a Next.js app ───────────────────
const genUIRegistry = defineRegistry(null as any, {
  components: {
    string: ({ props }: any) => {
      if (props.enum) {
        return (
          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-semibold text-slate-700">{props.title}</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">-- Chọn --</option>
              {props.enum.map((opt: string, i: number) => (
                <option key={opt} value={opt}>{props.enumNames?.[i] || opt}</option>
              ))}
            </select>
          </div>
        );
      }
      return (
        <div className="mb-4">
          <label className="block mb-1.5 text-sm font-semibold text-slate-700">{props.title}</label>
          <input type="text" placeholder={props.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      );
    },
    number: ({ props }: any) => (
      <div className="mb-4">
        <label className="block mb-1.5 text-sm font-semibold text-slate-700">{props.title}</label>
        <input type="number" placeholder={props.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    ),
    boolean: ({ props }: any) => (
      <div className="mb-4 flex items-center gap-3">
        <input type="checkbox" id={props.title} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
        <label htmlFor={props.title} className="text-sm font-semibold text-slate-700">{props.title}</label>
      </div>
    ),
    object: ({ props, emit, on }: any) => (
      <div className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm">
        {props.properties && Object.entries(props.properties).map(([key, childProps]: [string, any]) => {
          const Component = genUIRegistry.registry[childProps.type as keyof typeof genUIRegistry.registry];
          return Component
            ? <Component key={key} element={{ type: childProps.type, props: childProps }} emit={emit} on={on} />
            : null;
        })}
        {props.actionButtons && (
          <div className="flex gap-3 mt-5 pt-4 border-t border-dashed border-slate-200">
            {props.actionButtons.map((btn: any, idx: number) => (
              <button
                key={idx}
                onClick={() => alert(`Action triggered: ${btn.action}`)}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-80 ${
                  btn.variant === 'danger' ? 'bg-red-500 text-white' :
                  btn.variant === 'secondary' ? 'bg-slate-100 text-slate-700' :
                  'bg-blue-600 text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ),
  },
});

// ─── Data ────────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { value: "healthcare", label: "🏥 Healthcare", desc: "Bệnh viện, phòng khám" },
  { value: "fintech", label: "💳 Fintech", desc: "Ngân hàng, cho vay" },
  { value: "logistics", label: "🚚 Logistics", desc: "Vận chuyển, kho bãi" },
  { value: "ecommerce", label: "🛒 E-commerce", desc: "Bán lẻ online" },
  { value: "education", label: "🎓 Education", desc: "Đào tạo, khóa học" },
  { value: "real-estate", label: "🏠 Real Estate", desc: "Bất động sản" },
];

const WORKFLOWS = [
  { value: "onboarding", label: "Onboarding khách hàng mới" },
  { value: "approval", label: "Phê duyệt / Approval" },
  { value: "intake", label: "Thu thập thông tin ban đầu" },
  { value: "inspection", label: "Kiểm tra / Inspection" },
  { value: "booking", label: "Đặt lịch / Booking" },
  { value: "complaint", label: "Tiếp nhận khiếu nại" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [industry, setIndustry] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<any>(null);
  const [rawJson, setRawJson] = useState<string>("");
  const [phase, setPhase] = useState<"idle" | "streaming" | "done">("idle");
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!industry || !workflow || isGenerating) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setPhase("streaming");
    setCurrentSchema(null);
    setRawJson("");

    try {
      const res = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, workflow }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRawJson(accumulated);
      }

      // Parse full JSON after stream completes
      try {
        const clean = accumulated.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
        const parsed = JSON.parse(clean);

        const properties: Record<string, any> = {};
        for (const { key, field } of (parsed.fields || [])) {
          if (key && field) properties[key] = field;
        }

        if (Object.keys(properties).length > 0) {
          setCurrentSchema({
            root: "aiGeneratedForm",
            elements: {
              aiGeneratedForm: {
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
      } catch {
        console.error("Failed to parse AI JSON response");
      }

      setPhase("done");
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const industryLabel = INDUSTRIES.find(i => i.value === industry)?.label;
  const workflowLabel = WORKFLOWS.find(w => w.value === workflow)?.label;

  return (
    <JSONUIProvider registry={genUIRegistry.registry}>
      <div className="min-h-screen bg-[#F8FAFC]">

        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Sparkles size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">Demo 2 — AI-Generated Schema</h1>
                <p className="text-xs text-slate-500">Context selectors → AI tạo JSON Schema → Cùng renderer với Demo 1</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 flex items-center gap-1.5">
              ⚠️ DEPRECATED — merged into Demo 1 (json-render-demo)
            </span>
          </div>

          {/* Flow diagram */}
          <div className="max-w-6xl mx-auto px-5 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
            {[
              { icon: "🖱️", label: "Context Selection" },
              { icon: "🤖", label: "AI (streamObject)" },
              { icon: "📋", label: "JSON Schema" },
              { icon: "✨", label: "UI Render" },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md border border-blue-100 text-blue-700">
                  {step.icon} {step.label}
                </span>
                {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </span>
            ))}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-6">

          {/* Left: Context Selectors */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">1. Chọn Industry</h2>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.value}
                    onClick={() => setIndustry(ind.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      industry === ind.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-base">{ind.label.split(" ")[0]}</div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{ind.label.split(" ").slice(1).join(" ")}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ind.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">2. Chọn Workflow</h2>
              <div className="space-y-2">
                {WORKFLOWS.map(wf => (
                  <button
                    key={wf.value}
                    onClick={() => setWorkflow(wf.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      workflow === wf.value
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-slate-100 hover:border-slate-200 text-slate-700"
                    }`}
                  >
                    {wf.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!industry || !workflow || isGenerating}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> AI đang tạo schema...</>
              ) : (
                <><Sparkles size={16} /> Tạo Form với AI</>
              )}
            </button>

            {industry && workflow && !isGenerating && phase === "idle" && (
              <p className="text-xs text-center text-slate-400">
                AI sẽ tạo form cho <strong>{industryLabel}</strong> — <strong>{workflowLabel}</strong>
              </p>
            )}
          </div>

          {/* Center: Rendered Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">✨ UI Render (real-time)</h2>
              {isGenerating && (
                <span className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  AI đang stream schema...
                </span>
              )}
              {phase === "done" && (
                <span className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                  ✅ Schema hoàn chỉnh
                </span>
              )}
            </div>

            {currentSchema ? (
              <Renderer spec={currentSchema} registry={genUIRegistry.registry} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <Zap size={48} className="mb-4 stroke-1" />
                <p className="text-sm font-medium">Chọn Industry + Workflow rồi nhấn Generate</p>
                <p className="text-xs mt-1">AI sẽ tạo form phù hợp — không cần viết tay một dòng schema nào</p>
              </div>
            )}
          </div>

          {/* Right: JSON stream */}
          <div className="bg-slate-900 rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col">
            <h2 className="font-bold text-slate-300 text-sm mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-green-400 animate-pulse" : phase === "done" ? "bg-green-400" : "bg-slate-600"}`} />
              📋 JSON Stream (live)
            </h2>
            <pre className="text-xs text-green-300 font-mono overflow-auto flex-1 leading-relaxed whitespace-pre-wrap break-all">
              {rawJson || <span className="text-slate-600 italic">Chờ AI stream JSON schema...</span>}
            </pre>
          </div>
        </main>

        {/* Footer */}
        <div className="max-w-6xl mx-auto px-5 pb-10">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
            <strong>So sánh với Demo 1:</strong> Demo 1 dùng Rule Engine để <em>chọn</em> schema có sẵn. Demo 2 để AI <em>sáng tạo</em> schema chưa từng được viết — cùng một renderer, nhưng không còn giới hạn bởi số lượng schema đã định nghĩa.
            <span className="ml-2 font-bold">→ Demo 3 sẽ phá vỡ giới hạn cuối cùng: thay vì sinh schema, AI gọi tool để chọn component phong phú hơn từ design system.</span>
          </div>
        </div>
      </div>
    </JSONUIProvider>
  );
}
