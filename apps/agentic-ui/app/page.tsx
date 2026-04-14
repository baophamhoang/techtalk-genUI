"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, User, Loader2, Layers, ChevronRight, Lightbulb } from "lucide-react";
import { ProductCard } from "./components/ProductCard";
import { FormPanel } from "./components/FormPanel";
import { StatsGrid } from "./components/StatsGrid";
import { DataTable } from "./components/DataTable";
import { AlertBanner } from "./components/AlertBanner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

// ─── Component renderer ───────────────────────────────────────────────────────
function RenderedTool({ tool, args }: { tool: string; args: Record<string, unknown> }) {
  switch (tool) {
    case "showProductCard":  return <ProductCard {...(args as any)} />;
    case "showForm":         return <FormPanel {...(args as any)} />;
    case "showStatsGrid":    return <StatsGrid {...(args as any)} />;
    case "showDataTable":    return <DataTable {...(args as any)} />;
    case "showAlertBanner":  return <AlertBanner {...(args as any)} />;
    default:                 return null;
  }
}

const toolLabels: Record<string, string> = {
  showProductCard:  "🛍️  ProductCard",
  showForm:         "📝  FormPanel",
  showStatsGrid:    "📊  StatsGrid",
  showDataTable:    "📋  DataTable",
  showAlertBanner:  "🔔  AlertBanner",
};

const STARTER_PROMPTS = [
  "Dashboard quản lý đơn hàng tuần này",
  "Form đặt lịch khám bệnh với chọn bác sĩ",
  "Card sản phẩm tai nghe Sony với giỏ hàng",
  "Thống kê tổng quan kho hàng với cảnh báo",
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;
    setInput("");

    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Build API-format history (only role + content, no toolCalls metadata)
      const apiMessages = nextMessages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const { text: replyText, toolCalls } = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: replyText,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Đã xảy ra lỗi kết nối. Vui lòng thử lại.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#111] flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Demo 4 — Agentic UI</h1>
              <p className="text-xs text-slate-400">Hội thoại với AI để xây và tinh chỉnh UI theo thời gian thực</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-900/50 text-emerald-300 rounded-full border border-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AGENTIC · GPT-4O-MINI
            </span>
            {!isEmpty && (
              <button
                onClick={handleReset}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Flow */}
        <div className="max-w-4xl mx-auto px-6 pb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          {[
            { icon: "💬", label: "Mô tả UI bằng chat" },
            { icon: "🤖", label: "AI gọi tools" },
            { icon: "⚡", label: "Components render ngay" },
            { icon: "🔄", label: "Tinh chỉnh qua hội thoại" },
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

      {/* Chat thread */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="bg-emerald-900/30 border border-emerald-800/40 p-6 rounded-2xl text-center max-w-sm">
                <div className="text-4xl mb-3">🤖</div>
                <h2 className="font-bold text-slate-200 mb-2">Bắt đầu hội thoại</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Mô tả UI bạn muốn. Tôi sẽ xây ngay, và bạn có thể yêu cầu chỉnh sửa bất cứ lúc nào.
                </p>
              </div>
              <div className="w-full max-w-lg">
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                  <Lightbulb size={12} /> Thử nhanh:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STARTER_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-xs text-left px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition-colors leading-snug"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                msg.role === "user"
                  ? "bg-slate-600 text-white"
                  : "bg-emerald-700 text-white"
              }`}>
                {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>

              {/* Bubble + components */}
              <div className={`flex-1 flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Text bubble */}
                {msg.content && (
                  <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-200 rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                )}

                {/* Rendered components */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="w-full max-w-2xl space-y-3">
                    {/* Tool call pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {msg.toolCalls.map((tc, j) => (
                        <span
                          key={j}
                          className="text-[10px] font-bold px-2 py-0.5 bg-emerald-900/50 text-emerald-400 border border-emerald-800/60 rounded-full font-mono"
                        >
                          {toolLabels[tc.tool] ?? tc.tool}
                        </span>
                      ))}
                    </div>
                    {/* Rendered components */}
                    {msg.toolCalls.map((tc, j) => (
                      <div key={j} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <RenderedTool tool={tc.tool} args={tc.args} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin text-emerald-400" />
                AI đang xây UI...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-slate-800 bg-[#111] flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Suggestion chips after first AI response */}
          {messages.some(m => m.role === "assistant" && m.toolCalls?.length) && !isLoading && (
            <div className="flex gap-2 flex-wrap mb-3">
              {["Thêm cảnh báo tồn kho thấp", "Đổi sang dạng tuần", "Thêm cột trạng thái vào bảng", "Làm form đơn giản hơn"].map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full border border-slate-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={isEmpty ? "Mô tả UI bạn muốn..." : "Yêu cầu chỉnh sửa hoặc thêm component..."}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              {isLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Footer explanation */}
      <div className="border-t border-slate-800 bg-[#111] flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-sm text-emerald-200">
            <strong>Tại sao tốt hơn Demo 3?</strong>{" "}
            AI có <em>bộ nhớ hội thoại</em> — nó biết mình đã xây gì và có thể tinh chỉnh dựa trên yêu cầu tiếp theo.
            Cùng registry component, cùng tốc độ ~3–5s, nhưng bạn có thể nói{" "}
            <em>"bỏ cái cảnh báo đi"</em> hoặc <em>"thêm cột giá vào bảng"</em> và AI hiểu ngữ cảnh.
          </div>
        </div>
      </div>
    </div>
  );
}
