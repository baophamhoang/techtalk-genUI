"use client";

import { useState, useEffect } from "react";
import { DashboardCard } from "@/app/components/DashboardCard";
import { UserRoleSelector } from "@/app/components/UserRoleSelector";
import { cn } from "@/app/lib/utils";
import { GeneratedUI, getUserIntent, generateUIForIntent } from "@/app/lib/ai";

export default function Home() {
  const [userRole, setUserRole] = useState<"admin" | "manager" | "user">(
    "user",
  );
  const [generatedUI, setGeneratedUI] = useState<GeneratedUI | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTask, setCurrentTask] = useState("general");

  const handleRoleChange = async (role: "admin" | "manager" | "user") => {
    setUserRole(role);
    await generateUI(role, currentTask);
  };

  const generateUI = async (
    role: "admin" | "manager" | "user",
    task: string,
  ) => {
    setIsGenerating(true);
    try {
      const intent = getUserIntent(role, `/${task}`);
      const ui = await generateUIForIntent(intent);
      setGeneratedUI(ui);
    } catch (error) {
      console.error("Failed to generate UI:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateUI(userRole, currentTask);
  }, []);

  const tasks = [
    { id: "general", label: "General", description: "Default dashboard view" },
    {
      id: "monitoring",
      label: "Monitoring",
      description: "System health and metrics",
    },
    {
      id: "analysis",
      label: "Analysis",
      description: "Data analysis and reports",
    },
    {
      id: "configuration",
      label: "Configuration",
      description: "System settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Vercel AI SDK Demo - Intent-based GenUI
              </h1>
              <p className="text-muted-foreground mt-2">
                Dashboard tự động thay đổi dựa trên role và task của user -
                không cần prompt
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">AI-Powered UI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl border p-6">
              <UserRoleSelector
                currentRole={userRole}
                onRoleChange={handleRoleChange}
              />
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">
                Current Task Context
              </h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setCurrentTask(task.id);
                      generateUI(userRole, task.id);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      currentTask === task.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                    )}
                  >
                    <div className="font-medium">{task.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium mb-2">How it works:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>AI detects user role and current task</li>
                    <li>Generates appropriate UI components</li>
                    <li>No manual prompting required</li>
                    <li>Real-time adaptation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - Generated UI */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Adaptive Dashboard</h2>
                  <p className="text-muted-foreground">
                    Generated for:{" "}
                    <span className="font-medium capitalize">{userRole}</span> •
                    Task:{" "}
                    <span className="font-medium capitalize">
                      {currentTask}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      AI is generating UI...
                    </div>
                  )}
                  <button
                    onClick={() => generateUI(userRole, currentTask)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Regenerate UI
                  </button>
                </div>
              </div>

              {generatedUI ? (
                <div className="space-y-6">
                  {/* Layout indicator */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Layout:</span>
                      <span className="ml-2 capitalize">
                        {generatedUI.layout}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {generatedUI.cards.length} components generated
                    </div>
                  </div>

                  {/* Cards grid */}
                  <div
                    className={cn(
                      "gap-4",
                      generatedUI.layout === "grid" &&
                        "grid grid-cols-1 md:grid-cols-2",
                      generatedUI.layout === "list" && "flex flex-col",
                      generatedUI.layout === "dashboard" &&
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                    )}
                  >
                    {generatedUI.cards.map((card) => (
                      <DashboardCard
                        key={card.id}
                        card={card}
                        className={cn(
                          generatedUI.layout === "dashboard" &&
                            card.priority === "high" &&
                            "lg:col-span-2",
                          generatedUI.layout === "dashboard" &&
                            card.priority === "high" &&
                            "md:col-span-2",
                        )}
                      />
                    ))}
                  </div>

                  {/* Recommendations */}
                  {generatedUI.recommendations.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                      <h3 className="font-semibold text-lg mb-3">
                        AI Recommendations
                      </h3>
                      <div className="space-y-2">
                        {generatedUI.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            </div>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium">
                    Generating adaptive UI...
                  </p>
                  <p className="text-muted-foreground mt-2">
                    AI is analyzing your role and context
                  </p>
                </div>
              )}
            </div>

            {/* Key Takeaways */}
            <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-300">
                    ✅ Intent-based Design
                  </h4>
                  <p className="text-gray-300">
                    UI tự động thay đổi dựa trên ngữ cảnh user, không cần manual
                    prompting
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-300">
                    ✅ Real-time Adaptation
                  </h4>
                  <p className="text-gray-300">
                    Components được generate ngay lập tức khi context thay đổi
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-300">
                    ✅ Vercel AI SDK
                  </h4>
                  <p className="text-gray-300">
                    Stream UI generation với type-safe React components
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-300">
                    ✅ Use Cases
                  </h4>
                  <p className="text-gray-300">
                    Adaptive dashboards, smart forms, personalized interfaces
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
