"use client";

interface ModelOrchestratorProps {
  complexity: "simple" | "medium" | "complex";
  budget: "low" | "medium" | "high";
  isActive: boolean;
}

export function ModelOrchestrator({
  complexity,
  budget,
  isActive,
}: ModelOrchestratorProps) {
  const models = [
    {
      name: "DeepSeek Coder",
      color: "bg-green-500",
      cost: "$0.00014/1K",
      bestFor: "Code generation",
    },
    {
      name: "GPT-4o Mini",
      color: "bg-blue-500",
      cost: "$0.00015/1K",
      bestFor: "General purpose",
    },
    {
      name: "Kimi Math",
      color: "bg-purple-500",
      cost: "$0.00018/1K",
      bestFor: "Analysis",
    },
    {
      name: "Claude Haiku",
      color: "bg-orange-500",
      cost: "$0.00025/1K",
      bestFor: "Reasoning",
    },
    {
      name: "MiniMax Text",
      color: "bg-pink-500",
      cost: "$0.00012/1K",
      bestFor: "Creative tasks",
    },
  ];

  const getActiveModels = () => {
    switch (budget) {
      case "low":
        return [models[4], models[0]]; // MiniMax, DeepSeek
      case "medium":
        return [models[0], models[1], models[2]]; // DeepSeek, GPT-4o, Kimi
      case "high":
        return [models[1], models[3], models[2]]; // GPT-4o, Claude, Kimi
    }
  };

  const activeModels = getActiveModels();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-6">Model Orchestration</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Current Strategy</div>
            <div className="text-lg font-bold capitalize">
              {budget === "low"
                ? "Cost-Optimized"
                : budget === "medium"
                  ? "Balanced"
                  : "Quality-First"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Complexity</div>
            <div className="text-lg font-bold capitalize">{complexity}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Active Models</div>
            <div className="text-lg font-bold">{activeModels.length}</div>
          </div>
        </div>

        <div className="relative">
          {/* Orchestration flow visualization */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-green-500/50 transform -translate-y-1/2"></div>

          <div className="relative flex justify-between items-center py-8">
            {activeModels.map((model, index) => (
              <div key={model.name} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full ${model.color} flex items-center justify-center mb-3 border-4 border-gray-800 ${isActive ? "animate-pulse" : ""}`}
                >
                  <div className="text-xs font-bold">{index + 1}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{model.cost}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {model.bestFor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Routing Logic</div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                Complexity-based selection
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                Budget constraints
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                Fallback strategies
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Optimization</div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                Cost per token minimized
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-pink-500 mr-2"></div>
                Latency optimization
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                Quality matching
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-2">Benefits</div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                Up to 60% cost savings
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                Better quality for budget
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                Redundancy & reliability
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-400 p-4 bg-gray-900/30 rounded-xl">
          <div className="font-medium mb-2">How It Works:</div>
          <p>
            AI analyzes task complexity and budget, then routes requests to
            optimal models. Simple tasks → cheaper models, complex tasks →
            specialized models. Fallback to alternatives if primary model fails
            or is too slow.
          </p>
        </div>
      </div>
    </div>
  );
}
