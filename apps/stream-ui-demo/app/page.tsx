"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader2, MessageSquare, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { KPICard } from "./components/KPICard";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { DataTable } from "./components/DataTable";
import { CardList } from "./components/CardList";
import { InlineForm } from "./components/InlineForm";

function renderTool(
  type: string,
  input: any,
  onFormSubmit: (summary: string) => void,
  onSuggestionClick: (text: string) => void,
) {
  switch (type) {
    case "tool-show_kpi":
      return <KPICard title={input?.title || "..."} value={input?.value ?? "-"} delta={input?.delta} />;
    case "tool-show_chart":
      return input?.kind === "line"
        ? <LineChart title={input?.title || "..."} series={input?.series || []} />
        : <BarChart title={input?.title || "..."} categories={input?.categories || []} values={input?.series?.[0]?.data || []} />;
    case "tool-show_table": {
      const cols: string[] = input?.columns || [];
      const rows: any[] = input?.rows || [];
      return (
        <DataTable
          title={input?.title || "..."}
          columns={cols}
          rows={rows.map((r: any) =>
            Array.isArray(r) ? r.map((c: any) => String(c ?? "")) : cols.map((c) => String(r?.[c] ?? ""))
          )}
        />
      );
    }
    case "tool-show_card_list":
      return <CardList title={input?.title || "..."} cards={input?.cards || []} />;
    case "tool-show_form":
      return (
        <InlineForm
          title={input?.title || "Biểu mẫu"}
          description={input?.description}
          submitLabel={input?.submitLabel || "Gửi"}
          fields={input?.fields || []}
          onSubmitted={onFormSubmit}
        />
      );
    case "tool-show_suggestions":
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {(input?.suggestions ?? []).map((s: string, i: number) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300 rounded-full transition-colors font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ─── ChatSession (key-reset clears useChat state) ─────────────────────────────
interface ChatSessionProps {
  activeScenario: string;
  onScenarioChange: (s: string) => void;
  onReset: () => void;
}

function ChatSession({ activeScenario, onScenarioChange, onReset }: ChatSessionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const lastUserTextRef = useRef("");
  useEffect(() => { setIsMounted(true); }, []);

  const scenarioRef = useRef(activeScenario);
  useEffect(() => { scenarioRef.current = activeScenario; }, [activeScenario]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: () => ({ scenario: scenarioRef.current }) }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";
  const hasMessages = messages.length > 0;

  // Fetch AI-generated suggestions after each completed turn
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasLoading = prevStatusRef.current === "streaming" || prevStatusRef.current === "submitted";
    if (wasLoading && status === "ready" && lastUserTextRef.current) {
      setIsFetchingSuggestions(true);
      fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: lastUserTextRef.current, scenario: scenarioRef.current }),
      })
        .then((r) => r.json())
        .then((data) => setSuggestions(data.suggestions ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setIsFetchingSuggestions(false));
    }
    prevStatusRef.current = status;
  }, [status]);

  const send = useCallback((text: string) => {
    if (!text.trim() || isLoading) return;
    lastUserTextRef.current = text;
    setSuggestions([]);
    sendMessage({ text });
  }, [isLoading, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Messages */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-6">

          {/* Empty state */}
          {isMounted && !hasMessages && (
            <div className="flex flex-col items-center justify-center gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-violet-100 text-violet-600 p-3 rounded-2xl">
                    <MessageSquare size={32} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm">Select a scenario and start chatting to render UI widgets.</p>
              </div>

              {/* Scenario cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {[
                  { id: "analytics", icon: "📈", title: "Business Analytics", desc: "Mock KPI, tables, and sales charts." },
                  { id: "travel",    icon: "✈️", title: "Travel & Booking",   desc: "Flight info, hotel cards, forms." },
                  { id: "food",      icon: "🍔", title: "F&B / Restaurant",   desc: "Menus, order summaries, feedback." },
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => onScenarioChange(sc.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeScenario === sc.id
                        ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200"
                        : "bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{sc.icon}</div>
                    <div className="font-bold text-sm text-slate-800">{sc.title}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">{sc.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quick prompts */}
              <div className="w-full max-w-3xl">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thử các prompt sau:</div>
                <div className="flex flex-wrap gap-2">
                  {activeScenario === "analytics" && (<>
                    <button onClick={() => send("Báo cáo doanh thu tháng 3 theo kênh")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📊 Báo cáo doanh thu</button>
                    <button onClick={() => send("Danh sách 5 sản phẩm bán chạy nhất tháng")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📦 Top sản phẩm</button>
                    <button onClick={() => send("Biểu đồ tăng trưởng người dùng quý 1")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📈 Tăng trưởng user</button>
                  </>)}
                  {activeScenario === "travel" && (<>
                    <button onClick={() => send("Tìm khách sạn 4 sao gần biển Đà Nẵng, giá dưới 1 triệu")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🏨 Khách sạn Đà Nẵng</button>
                    <button onClick={() => send("Tạo form thu thập thông tin khách đặt tour")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📝 Form đặt tour</button>
                    <button onClick={() => send("Danh sách các chuyến bay giá rẻ đi Phú Quốc")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">✈️ Vé bay Phú Quốc</button>
                  </>)}
                  {activeScenario === "food" && (<>
                    <button onClick={() => send("Danh sách 5 món chay nổi bật nhất trong menu")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🥗 Menu chay</button>
                    <button onClick={() => send("Tạo form khảo sát mức độ hài lòng của thực khách")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">⭐ Form feedback</button>
                    <button onClick={() => send("Báo cáo tổng giá trị đơn hàng giao đi hôm nay")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🛵 Đơn Delivery</button>
                  </>)}
                </div>
              </div>
            </div>
          )}

          {/* Message thread */}
          {messages.map((m) => {
            const textParts = m.parts.filter((p: any) => p.type === "text");
            const hasAnyContent = m.parts.length > 0;
            const isActiveStream = isLoading && m.role === "assistant" && m.id === messages[messages.length - 1]?.id;
            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 transition-all ${
                  m.role === "user"
                    ? "bg-violet-600 text-white"
                    : isActiveStream
                      ? "bg-white border border-violet-300 shadow-sm ring-2 ring-violet-100"
                      : "bg-white border border-slate-200 shadow-sm"
                }`}>
                  <div className="space-y-3">
                    {m.parts.map((part: any, idx: number) => {
                      if (part.type === "text") {
                        return (
                          <div key={`${m.id}-t-${idx}`} className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : "prose-slate"}`}>
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        );
                      }
                      if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                        const isPartial = part.state === "input-streaming";
                        if (isPartial && part.type === "tool-show_suggestions") return null;

                        // Suggestions render borderless, inline
                        if (part.type === "tool-show_suggestions") {
                          return (
                            <div key={`${m.id}-${part.toolCallId ?? idx}`}>
                              {renderTool(part.type, part.input, () => {}, send)}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`${m.id}-${part.toolCallId ?? idx}`}
                            className={`animate-in fade-in slide-in-from-bottom-2 duration-300 text-slate-900 border overflow-hidden shadow-sm rounded-xl ${
                              isPartial ? "border-dashed border-violet-300 opacity-90" : "border-slate-200"
                            }`}
                          >
                            {renderTool(part.type, part.input, (summary) => send(summary), send)}
                          </div>
                        );
                      }
                      return null;
                    })}

                    {isActiveStream && (
                      <div className="flex gap-1 items-center pt-0.5">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                    {!isActiveStream && !hasAnyContent && m.role !== "user" && (
                      <Loader2 size={16} className="animate-spin text-violet-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI-generated follow-up suggestions */}
          {isFetchingSuggestions && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
              <Loader2 size={11} className="animate-spin" /> Gợi ý tiếp theo...
            </div>
          )}
          {suggestions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 pl-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300 rounded-full transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error.message}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3 items-center">
          {hasMessages && !isLoading && (
            <button
              onClick={onReset}
              title="Start over"
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 font-medium"
            >
              <RotateCcw size={13} />
              Start over
            </button>
          )}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={hasMessages ? "Tiếp tục hội thoại..." : "Gõ tin nhắn..."}
              className="flex-1 border border-slate-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
            />
            <button
              disabled={!input.trim() || isLoading}
              type="submit"
              className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center disabled:bg-slate-200 transition-colors"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </footer>
    </>
  );
}

// ─── Home shell ───────────────────────────────────────────────────────────────
export default function Home() {
  const [chatKey, setChatKey]           = useState(0);
  const [activeScenario, setActiveScenario] = useState("analytics");

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-xl text-white">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Demo 2 — Chat Assistant with Inline UI</h1>
            <p className="text-xs text-slate-500">Multi-turn chat · AI picks widgets · renders inline</p>
          </div>
        </div>
      </header>

      <ChatSession
        key={chatKey}
        activeScenario={activeScenario}
        onScenarioChange={setActiveScenario}
        onReset={() => setChatKey((k) => k + 1)}
      />
    </div>
  );
}
