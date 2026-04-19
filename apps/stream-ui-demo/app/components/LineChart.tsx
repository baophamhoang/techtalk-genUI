"use client";

interface Props {
  title: string;
  series: Array<{ name: string; data: number[] }>;
}

export function LineChart({ title, series }: Props) {
  const max = Math.max(...series.flatMap(s => s.data));
  const min = Math.min(...series.flatMap(s => s.data));
  const range = max - min || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <div className="flex items-end gap-1 h-32">
        {series[0]?.data.map((val, i) => {
          const height = ((val - min) / range) * 100;
          return (
            <div key={i} className="flex-1 bg-violet-500 rounded-t transition-all hover:bg-violet-600" style={{ height: `${Math.max(height, 4)}%` }} />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>Min: {min.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
    </div>
  );
}