import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface Stat {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface StatsGridProps {
  stats: Stat[];
}

const trendColors = {
  up:      { bg: "bg-green-50",  text: "text-green-600",  Icon: TrendingUp },
  down:    { bg: "bg-red-50",    text: "text-red-600",    Icon: TrendingDown },
  neutral: { bg: "bg-gray-50",   text: "text-gray-500",   Icon: Minus },
};

export function StatsGrid({ stats = [] }: StatsGridProps) {
  if (!stats.length) return null;
  return (
    <div className={`grid gap-4 ${stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {stats.map((stat, i) => {
        const td = trendColors[stat.trend ?? "neutral"];
        return (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 leading-none">
              {typeof stat.value === "number" ? stat.value.toLocaleString("vi-VN") : stat.value}
              {stat.unit && <span className="text-sm font-semibold text-gray-400 ml-1">{stat.unit}</span>}
            </p>
            {(stat.trend || stat.trendValue) && (
              <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${td.bg} ${td.text}`}>
                <td.Icon size={12} />
                {stat.trendValue}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
