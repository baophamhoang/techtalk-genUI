"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Plus } from "lucide-react";
import { KPICard } from "./components/KPICard";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { DataTable } from "./components/DataTable";
import { CardList } from "./components/CardList";
import { InlineForm } from "./components/InlineForm";
import ReactMarkdown from "react-markdown";

interface ToolCall {
  id: string;
  tool: string;
  args: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

const TOOL_RE = /_*TOOL_*([\s\S]*?)_*ENDTOOL_*/g;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCall[]>([]);
  const [activeScenario, setActiveScenario] = useState("analytics");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentText, currentToolCalls]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setCurrentText("");
    setCurrentToolCalls([]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          scenario: activeScenario
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let streamedText = "";
      let calls: ToolCall[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Parse tools
        TOOL_RE.lastIndex = 0;
        let match: RegExpExecArray | null;
        let newCalls = [...calls];
        while ((match = TOOL_RE.exec(accumulated)) !== null) {
          try {
             const parsed = JSON.parse(match[1]);
             if (!newCalls.find(c => c.id === `${parsed.tool}-${JSON.stringify(parsed.args)}`)) {
                 newCalls.push({ id: `${parsed.tool}-${JSON.stringify(parsed.args)}`, tool: parsed.tool, args: parsed.args });
             }
          } catch {}
        }
        if (newCalls.length > calls.length) {
            calls = newCalls;
            setCurrentToolCalls(calls);
        }

        // Parse chunks
        const chunks = accumulated.split("__CHUNK__").slice(1);
        let plain = "";
        for (const c of chunks) {
            const clean = c.replace(/_*TOOL_*[\s\S]*?_*ENDTOOL_*/g, "");
            plain += clean;
        }
        const finalPlain = (plain.split("__DONE__")[0] || plain).replace(/\**DONE_*\**/g, "");
        streamedText = finalPlain;
        setCurrentText(streamedText);

        if (accumulated.includes("__DONE__")) {
           break;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: streamedText,
        toolCalls: calls
      }]);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setIsGenerating(false);
      setCurrentText("");
      setCurrentToolCalls([]);
    }
  };

  const renderTool = (tool: string, args: any) => {
    switch (tool) {
      case "show_kpi":
        return <KPICard title={args.title} value={args.value} delta={args.delta} />;
      case "show_chart":
        return args.kind === "line" ? <LineChart title={args.title} series={args.series} /> : <BarChart title={args.title} categories={args.categories || []} values={args.series?.[0]?.data || []} />;
      case "show_table":
        return <DataTable title={args.title} columns={args.columns} rows={args.rows.map((r:any) => args.columns.map((c:any) => r[c]))} />;
      case "show_card_list":
        return <CardList title={args.title} cards={args.cards} />;
      case "show_form":
        return <InlineForm {...args} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-xl text-white">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Demo 2 — Chat Assistant with Inline UI</h1>
            <p className="text-xs text-slate-500">Multiturn chat rendering textual response intermixed with semantic generative widgets.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {isMounted && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-2">
                 <div className="flex justify-center mb-4">
                   <div className="bg-violet-100 text-violet-600 p-3 rounded-2xl">
                     <MessageSquare size={32} />
                   </div>
                 </div>
                 <p className="text-slate-500 text-sm">Select a scenario context and start chatting to render UI widgets.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                 {[
                   { id: "analytics", icon: "📈", title: "Business Analytics", desc: "Mock KPI, tables, and sales charts." },
                   { id: "travel", icon: "✈️", title: "Travel & Booking", desc: "Flight info, hotel cards, forms." },
                   { id: "food", icon: "🍔", title: "F&B / Restaurant", desc: "Menus, order summaries, feedback." }
                 ].map(sc => (
                   <button 
                     key={sc.id}
                     onClick={() => setActiveScenario(sc.id)}
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

               <div className="w-full max-w-3xl">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thử các prompt sau:</div>
                 <div className="flex flex-wrap gap-2">
                   {activeScenario === "analytics" && (
                     <>
                       <button onClick={() => setInput("Báo cáo doanh thu tháng 3 theo kênh")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📊 Báo cáo doanh thu</button>
                       <button onClick={() => setInput("Danh sách 5 sản phẩm bán chạy nhất tháng")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📦 Top sản phẩm</button>
                       <button onClick={() => setInput("Biểu đồ tăng trưởng người dùng quý 1")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📈 Tăng trưởng user</button>
                     </>
                   )}
                   {activeScenario === "travel" && (
                     <>
                       <button onClick={() => setInput("Tìm khách sạn 4 sao gần biển Đà Nẵng, giá dưới 1 triệu")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🏨 Khách sạn Đà Nẵng</button>
                       <button onClick={() => setInput("Tạo form thu thập thông tin khách đặt tour")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">📝 Form đặt tour</button>
                       <button onClick={() => setInput("Danh sách các chuyến bay giá rẻ đi Phú Quốc")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">✈️ Vé bay Phú Quốc</button>
                     </>
                   )}
                   {activeScenario === "food" && (
                     <>
                       <button onClick={() => setInput("Danh sách 5 món chay nổi bật nhất trong menu")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🥗 Menu chay</button>
                       <button onClick={() => setInput("Tạo form khảo sát mức độ hài lòng của thực khách")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">⭐ Form feedback</button>
                       <button onClick={() => setInput("Báo cáo tổng giá trị đơn hàng giao đi hôm nay")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs hover:border-violet-300 transition-colors">🛵 Đơn Delivery</button>
                     </>
                   )}
                 </div>
               </div>
            </div>
          )}

          {messages.map((m) => (
             <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
               <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${m.role === "user" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 shadow-sm"}`}>
                 <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : "prose-slate"}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                 </div>
                 {m.toolCalls && m.toolCalls.length > 0 && (
                   <div className="mt-4 space-y-4">
                     {m.toolCalls.map((tc, i) => (
                       <div key={tc.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto text-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                         {renderTool(tc.tool, tc.args)}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          ))}

          {isGenerating && (
             <div className="flex justify-start">
               <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-white border border-slate-200 shadow-sm">
                 <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{currentText}</ReactMarkdown>
                    {!currentText && <Loader2 size={16} className="animate-spin text-violet-500" />}
                 </div>
                 {currentToolCalls.length > 0 && (
                   <div className="mt-4 space-y-4">
                     {currentToolCalls.map((tc, i) => (
                       <div key={tc.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                         {renderTool(tc.tool, tc.args)}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3">
           <form onSubmit={handleSubmit} className="flex-1 flex gap-3 relative">
              <input
                 type="text"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 disabled={isGenerating}
                 placeholder="Gõ tin nhắn..."
                 className="flex-1 border border-slate-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
              />
              <button disabled={!input.trim() || isGenerating} type="submit" className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center disabled:bg-slate-200">
                 <Send size={16} />
              </button>
           </form>
        </div>
      </footer>
    </div>
  );
}