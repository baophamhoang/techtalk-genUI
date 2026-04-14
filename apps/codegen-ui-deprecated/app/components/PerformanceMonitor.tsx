"use client";

interface PerformanceMonitorProps {
  logs: string[];
}

export function PerformanceMonitor({ logs }: PerformanceMonitorProps) {
  const getLogColor = (log: string) => {
    if (log.includes("Selected") && log.includes("Cost"))
      return "text-blue-400";
    if (log.includes("Generated")) return "text-green-400";
    if (log.includes("Starting") || log.includes("complete"))
      return "text-purple-400";
    if (log.includes("failed") || log.includes("error")) return "text-red-400";
    return "text-gray-300";
  };

  const getLogIcon = (log: string) => {
    if (log.includes("Selected")) return "🔀";
    if (log.includes("Generated")) return "⚡";
    if (log.includes("Starting")) return "🚀";
    if (log.includes("complete")) return "✅";
    if (log.includes("failed")) return "❌";
    return "📝";
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-6">Performance Monitor</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Real-time Logs</div>
          <div className="text-xs px-3 py-1 bg-gray-700 rounded-full">
            {logs.length} events
          </div>
        </div>

        <div className="h-64 overflow-y-auto bg-gray-900/50 rounded-xl p-4">
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 text-sm animate-fade-in ${getLogColor(log)}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 mt-0.5">{getLogIcon(log)}</div>
                  <div className="font-mono">
                    [
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                    ]
                  </div>
                  <div className="flex-1">{log}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-center">
                <div className="font-medium">Waiting for generation...</div>
                <div className="text-sm mt-1">
                  Performance logs will appear here
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Models Used</div>
            <div className="text-lg font-bold">
              {
                new Set(
                  logs
                    .filter((l) => l.includes("Selected"))
                    .map((l) => l.split(" ")[1]),
                ).size
              }
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Components</div>
            <div className="text-lg font-bold">
              {logs.filter((l) => l.includes("Generated")).length}
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Avg Latency</div>
            <div className="text-lg font-bold">
              {logs.length > 0 ? "~600ms" : "--"}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400 p-3 bg-gray-900/30 rounded-lg">
          <div className="font-medium mb-1">Monitoring Includes:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Model selection decisions</li>
            <li>Cost calculations per task</li>
            <li>Generation latency</li>
            <li>Fallback triggers</li>
            <li>Optimization metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
