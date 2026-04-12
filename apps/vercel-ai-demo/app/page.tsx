"use client";

import { useChat } from '@ai-sdk/react';
import { Send, Plane, CloudSnow, TrendingUp, User, Bot, Loader2, Zap } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// --- Tool Rendering Components ---
// (omitting standard components up to Home)
// ... keeping imports from above ...

const WeatherCard = ({ data }: { data: any }) => (
  <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6 shadow-lg w-full max-w-sm my-3 transform transition-all hover:scale-[1.02]">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">{data.city}</h3>
      <CloudSnow size={32} className="opacity-90" />
    </div>
    <div className="text-5xl font-black mb-2 tracking-tighter">{data.temperature}°C</div>
    <p className="text-blue-100 font-medium text-lg leading-relaxed">{data.condition}</p>
    <div className="mt-4 pt-4 border-t border-blue-300/30 flex justify-between text-sm font-medium text-blue-100">
      <span>Độ ẩm: {data.humidity}%</span>
      <span>Cập nhật lúc: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    </div>
  </div>
);

const FlightCard = ({ data }: { data: any }) => (
  <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-lg w-full max-w-md my-3 overflow-hidden">
    <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-slate-800 p-2 rounded-full"><Plane size={20} className="text-blue-400" /></div>
        <span className="font-bold text-xl">{data.from} <span className="opacity-40 mx-2 font-light">→</span> {data.to}</span>
      </div>
    </div>
    <div className="p-0">
      {data.flights.map((f: any, i: number) => (
        <div key={i} className="flex justify-between items-center p-5 border-b last:border-0 hover:bg-slate-50 transition-colors group">
          <div>
            <div className="font-bold text-slate-800 text-lg">{f.time}</div>
            <div className="text-sm text-slate-500 font-medium mt-1">{f.airline} • {f.id}</div>
          </div>
          <div className="text-right">
            <div className="font-black text-blue-600 text-xl">{f.price}</div>
            <button className="text-xs font-bold bg-blue-50 text-blue-700 px-4 py-2 mt-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
              Mua vé ngay
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StockCard = ({ data }: { data: any }) => {
  const isUp = data.trend === 'up';
  return (
    <div className="bg-[#1C1C1E] text-white rounded-3xl p-7 shadow-2xl w-full max-w-sm my-3 border border-slate-800 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-black tracking-tight">{data.ticker}</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">{data.companyName}</p>
        </div>
        <div className={`p-3 rounded-2xl ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          <TrendingUp size={28} className={isUp ? '' : 'rotate-180'} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-light tracking-tighter">${data.price}</span>
        <span className="text-slate-500 text-xl font-medium">{data.currency}</span>
      </div>
      <div className={`text-xl font-bold mt-2 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {data.change} (Hôm nay)
      </div>
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error, reload } = useChat({
    maxSteps: 5, // Important: Allows the AI to call tools and respond automatically
  } as any) as any;

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Per Vercel AI SDK 6 docs, sendMessage expects { text: string } rather than the older complete Message pattern 
    sendMessage({ text: input });
    
    setInput('');
  };
  
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center">
      <header className="w-full bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Vercel AI SDK</h1>
              <p className="text-xs text-slate-500 font-medium">Agentic Generative UI Demo (RSC)</p>
            </div>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded-full flex items-center gap-2 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI ACTIVE
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl flex flex-col p-4 md:p-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20 opacity-50">
            <Bot size={64} className="mb-6 stroke-1 text-slate-400" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Tôi là Agent AI</h2>
            <p className="text-slate-500 max-w-md">Hãy thử yêu cầu tôi làm điều gì đó cần tới Widget.<br/>Ví dụ: "Giá vé máy bay rẻ nhất từ HN vào SG là bao nhiêu?" hoặc "Thời tiết hôm nay thế nào?"</p>
          </div>
        ) : (
          <div className="space-y-8 flex-1">
            {messages.map((message: any) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {message.parts?.map((part: any, index: number) => {
                    if (part.type === 'text' && part.text) {
                      return (
                        <div key={index} className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-sm font-medium' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                        }`}>
                          {part.text}
                        </div>
                      );
                    }

                    if (part.type?.startsWith('tool-')) {
                      const toolName = part.type.replace('tool-', '');
                      
                      if (part.state === 'input-available' || part.state === 'call') {
                        return (
                          <div key={index} className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-medium text-slate-500 shadow-sm inline-flex">
                            <Loader2 size={16} className="animate-spin text-blue-500" />
                            Đang xử lý nghiệp vụ ({toolName === 'getWeather' ? 'thời tiết' : toolName === 'searchFlights' ? 'vé máy bay' : toolName === 'checkStock' ? 'chứng khoán' : toolName})...
                          </div>
                        );
                      }

                      if (part.state === 'output-available' || part.state === 'result') {
                        return (
                          <div key={index} className="w-full flex justify-start my-2 animate-in fade-in zoom-in duration-500">
                            {toolName === 'getWeather' && <WeatherCard data={part.output || part.result} />}
                            {toolName === 'searchFlights' && <FlightCard data={part.output || part.result} />}
                            {toolName === 'checkStock' && <StockCard data={part.output || part.result} />}
                          </div>
                        );
                      }
                      
                      if (part.state === 'output-error') {
                        return (
                          <div key={index} className="px-4 py-3 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-medium">
                            Lỗi khi gọi tool ({toolName}): {part.errorText || 'Unknown error'}
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  })}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
        
        {/* Render Error State if API/Network fails */}
        {error && (
          <div className="mx-auto mt-4 w-full max-w-md bg-red-50 border border-red-200 text-red-500 px-5 py-3 rounded-xl text-sm font-medium flex justify-between items-center shadow-sm">
            <span>❌ Lỗi từ LLM: {error.message || 'Yêu cầu thất bại'}</span>
            <button 
              onClick={() => reload()} 
              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs tracking-wider transition-colors"
            >
              THỬ LẠI
            </button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <input
            type="text"
            className="w-full pl-6 pr-16 py-4 rounded-full bg-white border-2 border-slate-200 shadow-lg focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all text-[15px] font-medium"
            placeholder="Hỏi bất cứ điều gì... (VD: Cổ phiếu FPT đang bao nhiêu?)"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-400 transition-colors shadow-sm"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
          </button>
        </form>
      </footer>
    </div>
  );
}
