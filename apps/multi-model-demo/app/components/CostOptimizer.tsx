"use client";

interface CostOptimizerProps {
  budget: "low" | "medium" | "high";
  totalCost: number;
  generationResult?: any;
}

export function CostOptimizer({
  budget,
  totalCost,
  generationResult,
}: CostOptimizerProps) {
  const costComparison = {
    low: { traditional: 0.0025, optimized: 0.0008, savings: 68 },
    medium: { traditional: 0.004, optimized: 0.002, savings: 50 },
    high: { traditional: 0.006, optimized: 0.0045, savings: 25 },
  };

  const comparison = costComparison[budget];

  const getBudgetColor = () => {
    switch (budget) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
    }
  };

  const getBudgetDescription = () => {
    switch (budget) {
      case "low":
        return "Maximize cost savings, accept slightly lower quality";
      case "medium":
        return "Balance between cost and quality";
      case "high":
        return "Prioritize quality, accept higher cost";
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-6">Cost Optimization</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Budget Priority</div>
            <div
              className={`text-2xl font-bold ${getBudgetColor()} mb-2 capitalize`}
            >
              {budget}
            </div>
            <div className="text-sm text-gray-300">
              {getBudgetDescription()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl p-5 border border-green-700/30">
            <div className="text-sm text-gray-400 mb-2">Estimated Cost</div>
            <div className="text-2xl font-bold text-green-400">
              ${totalCost.toFixed(6)}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              {generationResult?.totalTokens
                ? `${generationResult.totalTokens.toLocaleString()} tokens`
                : "Calculating..."}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl p-5 border border-blue-700/30">
            <div className="text-sm text-gray-400 mb-2">Cost Savings</div>
            <div className="text-2xl font-bold text-blue-400">
              {comparison.savings}%
            </div>
            <div className="text-sm text-gray-300 mt-2">
              vs traditional single-model approach
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Cost Comparison</div>
            <div className="text-sm text-gray-400">Per generation</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Traditional (Single Model)</span>
                <span>${comparison.traditional.toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-400 rounded-full h-3 transition-all duration-500"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Optimized (Multi-Model)</span>
                <span>${comparison.optimized.toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 rounded-full h-3 transition-all duration-500"
                  style={{
                    width: `${(comparison.optimized / comparison.traditional) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400">Savings</span>
                <span className="text-green-400">
                  ${(comparison.traditional - comparison.optimized).toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-500 rounded-full h-2"
                  style={{ width: `${comparison.savings}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/30 rounded-xl p-4">
            <h4 className="font-medium mb-3 text-blue-300">
              Optimization Strategies
            </h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                Task-based model selection
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                Token usage optimization
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                Parallel processing
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/30 rounded-xl p-4">
            <h4 className="font-medium mb-3 text-green-300">
              Enterprise Benefits
            </h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                Scalable cost structure
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                </div>
                Predictable budgeting
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                </div>
                Vendor redundancy
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-400 p-4 bg-gray-900/30 rounded-xl">
          <div className="font-medium mb-2">Use Case Example:</div>
          <p>
            E-commerce dashboard generation: Layout (Kimi) + Charts (GPT-4o) +
            Product components (DeepSeek) = 50% cheaper than using GPT-4 for
            everything, with equal or better quality for each specialized task.
          </p>
        </div>
      </div>
    </div>
  );
}
