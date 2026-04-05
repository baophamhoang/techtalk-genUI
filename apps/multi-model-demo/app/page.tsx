"use client";

import { useState, useEffect } from "react";
import { ModelOrchestrator } from "./components/ModelOrchestrator";
import { CostOptimizer } from "./components/CostOptimizer";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { generateWithModelOrchestration } from "./lib/multi-model";

export default function Home() {
  const [uiDescription, setUiDescription] = useState(
    "A dashboard for monitoring e-commerce sales with real-time analytics",
  );
  const [complexity, setComplexity] = useState<"simple" | "medium" | "complex">(
    "medium",
  );
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelLogs, setModelLogs] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setModelLogs([]);

    try {
      const logs: string[] = [];
      const result = await generateWithModelOrchestration(
        uiDescription,
        complexity,
        budget,
        (log) => {
          logs.push(log);
          setModelLogs([...logs]);
        },
      );

      setGenerationResult(result);
      setTotalCost(result.estimatedCost || 0);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleDescriptions = [
    "A login form with email validation and password strength meter",
    "Product listing page with filters, sorting, and pagination",
    "Real-time chat interface with typing indicators and file upload",
    "Admin dashboard with user management and analytics charts",
    "E-commerce checkout flow with multiple payment options",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Multi-Model Orchestration Demo
              </h1>
              <p className="text-gray-300 mt-3 max-w-3xl">
                Advanced GenUI với intelligent model routing, cost optimization,
                và fallback strategies. AI tự động chọn model tốt nhất cho từng
                task dựa trên complexity và budget.
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium">Enterprise GenUI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-6">Configuration</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    UI Description
                  </label>
                  <textarea
                    value={uiDescription}
                    onChange={(e) => setUiDescription(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the UI you want to generate..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Complexity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["simple", "medium", "complex"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setComplexity(level)}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          complexity === level
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-800 border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <div className="font-medium capitalize">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Budget Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setBudget(level)}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          budget === level
                            ? level === "low"
                              ? "bg-green-700 border-green-600"
                              : level === "medium"
                                ? "bg-yellow-700 border-yellow-600"
                                : "bg-red-700 border-red-600"
                            : "bg-gray-800 border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <div className="font-medium capitalize">{level}</div>
                        <div className="text-xs opacity-75">
                          {level === "low"
                            ? "Cost-optimized"
                            : level === "medium"
                              ? "Balanced"
                              : "Best quality"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Quick Templates
                  </label>
                  <div className="space-y-2">
                    {sampleDescriptions.map((desc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUiDescription(desc)}
                        className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors"
                      >
                        <div className="text-sm text-gray-300 line-clamp-2">
                          {desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Orchestrating Models...
                    </span>
                  ) : (
                    "Generate Optimized UI"
                  )}
                </button>
              </div>
            </div>

            <PerformanceMonitor logs={modelLogs} />
          </div>

          {/* Main content - Results */}
          <div className="lg:col-span-2 space-y-8">
            <ModelOrchestrator
              complexity={complexity}
              budget={budget}
              isActive={isGenerating}
            />

            <CostOptimizer
              budget={budget}
              totalCost={totalCost}
              generationResult={generationResult}
            />

            {generationResult && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6">
                  Generated UI Structure
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <h3 className="font-medium mb-2 text-blue-300">
                        Selected Models
                      </h3>
                      <div className="space-y-2">
                        {generationResult.models?.map(
                          (model: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{model.name}</span>
                              <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                                ${model.cost?.toFixed(4)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <h3 className="font-medium mb-2 text-green-300">
                        Optimization
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Cost:</span>
                          <span className="font-medium">
                            ${totalCost.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tokens Used:</span>
                          <span>{generationResult.totalTokens || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Latency:</span>
                          <span>{generationResult.latency || 0}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <h3 className="font-medium mb-3 text-purple-300">
                      Generated Components
                    </h3>
                    <div className="space-y-3">
                      {generationResult.components?.map(
                        (comp: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{comp.name}</span>
                              <span className="text-xs px-2 py-1 bg-gray-700 rounded capitalize">
                                {comp.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {comp.description}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-5 border border-blue-500/20">
                    <h3 className="font-bold mb-3">Key Advantages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-blue-300">
                          ⚡ Intelligent Routing
                        </h4>
                        <p className="text-sm text-gray-300">
                          Automatically selects best model for each task based
                          on cost, latency, and quality
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-green-300">
                          💰 Cost Optimization
                        </h4>
                        <p className="text-sm text-gray-300">
                          Uses cheaper models for simple tasks, premium models
                          only when needed
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-purple-300">
                          🔄 Fallback Strategy
                        </h4>
                        <p className="text-sm text-gray-300">
                          If one model fails, automatically tries alternatives
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-yellow-300">
                          📊 Performance Monitoring
                        </h4>
                        <p className="text-sm text-gray-300">
                          Real-time tracking of cost, latency, and quality
                          metrics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
