"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  delta?: string;
}

export function KPICard({ title, value, delta }: Props) {
  const isUp = delta?.toLowerCase().includes("+") ?? false;
  const isDown = delta?.toLowerCase().includes("-") ?? false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="text-sm text-slate-500 mb-2">{title}</div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      {delta && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          isUp ? "text-green-600" : isDown ? "text-red-600" : "text-slate-500"
        }`}>
          {isUp && <TrendingUp size={12} />}
          {isDown && <TrendingDown size={12} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}