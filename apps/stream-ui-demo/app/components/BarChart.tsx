"use client";

interface Props {
  title: string;
  categories: string[];
  values: number[];
}

export function BarChart({ title, categories, values }: Props) {
  const max = Math.max(...values);
  const range = max || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-32">
        {values.map((val, i) => {
          const height = (val / range) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
              <span className="text-xs text-slate-500">{categories[i]}</span>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-400 mt-2 text-right">Total: {values.reduce((a, b) => a + b, 0).toLocaleString()}</div>
    </div>
  );
}