import { DashboardCard as DashboardCardType } from "@/app/lib/ai";
import { cn } from "@/app/lib/utils";

interface DashboardCardProps {
  card: DashboardCardType;
  className?: string;
}

export function DashboardCard({ card, className }: DashboardCardProps) {
  const getCardStyles = () => {
    const baseStyles = "rounded-lg border p-4 transition-all hover:shadow-md";

    switch (card.type) {
      case "metric":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
        );
      case "chart":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
        );
      case "list":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
        );
      case "action":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
        );
      default:
        return cn(baseStyles, "bg-white border-gray-200");
    }
  };

  const getPriorityBadge = () => {
    switch (card.priority) {
      case "high":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
    }
  };

  return (
    <div className={cn(getCardStyles(), className)}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{card.title}</h3>
        <div className="flex items-center gap-2">
          {getPriorityBadge()}
          <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
            {card.type}
          </span>
        </div>
      </div>

      <div className="text-gray-700">{card.content}</div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AI Generated</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
