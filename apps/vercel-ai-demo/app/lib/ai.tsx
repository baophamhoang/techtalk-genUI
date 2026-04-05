import React from "react";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";

// Create OpenRouter client
const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://genui-techtalk.com",
    "X-Title": "GenUI Techtalk Demo",
  },
});

// Fallback to mock mode if no API key
const isMockMode = !process.env.OPENROUTER_API_KEY;

// Helper function to generate mock UI data
function getMockUI(
  role: "admin" | "manager" | "user",
  currentTask: string,
  recentActions: string[],
): GeneratedUI {
  console.log("Generating mock UI data");

  const baseCards = [
    {
      id: "1",
      title: role === "admin" ? "System Health" : "My Stats",
      content:
        role === "admin" ? "Server uptime: 99.9%" : "Tasks completed: 12",
      type: "metric" as const,
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Recent Activity",
      content: `Based on: ${currentTask}`,
      type: "list" as const,
      priority: "medium" as const,
    },
    {
      id: "3",
      title: "Quick Actions",
      content:
        role === "admin"
          ? "Manage users, View logs"
          : "Submit report, Request time off",
      type: "action" as const,
      priority: "high" as const,
    },
  ];

  // Add role-specific cards
  if (role === "admin") {
    baseCards.push({
      id: "4",
      title: "Security Dashboard",
      content: "Active threats: 0 • Last scan: 2 hours ago",
      type: "metric" as const,
      priority: "high" as const,
    });
  } else if (role === "manager") {
    baseCards.push({
      id: "4",
      title: "Team Performance",
      content: "Average completion: 87% • Pending reviews: 3",
      type: "chart" as const,
      priority: "medium" as const,
    });
  }

  return {
    layout:
      role === "admin" ? "dashboard" : role === "manager" ? "grid" : "list",
    cards: baseCards,
    recommendations: [
      `Check ${role === "admin" ? "system alerts" : "pending tasks"}`,
      `Review ${recentActions.length > 0 ? recentActions[0] : "performance metrics"}`,
      `Update ${role === "admin" ? "security settings" : "profile information"}`,
    ],
    totalTokens: 0,
    estimatedCost: 0,
    modelUsed: "mock",
  };
}

// Helper function to generate mock UI data
function getMockUI(
  role: "admin" | "manager" | "user",
  currentTask: string,
  recentActions: string[],
): GeneratedUI {
  console.log("Generating mock UI data");

  const baseCards = [
    {
      id: "1",
      title: role === "admin" ? "System Health" : "My Stats",
      content:
        role === "admin" ? "Server uptime: 99.9%" : "Tasks completed: 12",
      type: "metric" as const,
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Recent Activity",
      content: `Based on: ${currentTask}`,
      type: "list" as const,
      priority: "medium" as const,
    },
    {
      id: "3",
      title: "Quick Actions",
      content:
        role === "admin"
          ? "Manage users, View logs"
          : "Submit report, Request time off",
      type: "action" as const,
      priority: "high" as const,
    },
  ];

  // Add role-specific cards
  if (role === "admin") {
    baseCards.push({
      id: "4",
      title: "Security Dashboard",
      content: "Active threats: 0 • Last scan: 2 hours ago",
      type: "metric" as const,
      priority: "high" as const,
    });
  } else if (role === "manager") {
    baseCards.push({
      id: "4",
      title: "Team Performance",
      content: "Average completion: 87% • Pending reviews: 3",
      type: "chart" as const,
      priority: "medium" as const,
    });
  }

  return {
    layout:
      role === "admin" ? "dashboard" : role === "manager" ? "grid" : "list",
    cards: baseCards,
    recommendations: [
      `Check ${role === "admin" ? "system alerts" : "pending tasks"}`,
      `Review ${recentActions.length > 0 ? recentActions[0] : "performance metrics"}`,
      `Update ${role === "admin" ? "security settings" : "profile information"}`,
    ],
    totalTokens: 0,
    estimatedCost: 0,
    modelUsed: "mock",
  };
}

// Types for UI components
export interface DashboardCard {
  id: string;
  title: string;
  content: string;
  type: "metric" | "chart" | "list" | "action";
  priority: "high" | "medium" | "low";
}

export interface UserIntent {
  role: "admin" | "manager" | "user";
  currentTask: string;
  recentActions: string[];
}

export interface GeneratedUI {
  layout: "grid" | "list" | "dashboard";
  cards: DashboardCard[];
  recommendations: string[];
  totalTokens?: number;
  estimatedCost?: number;
  modelUsed?: string;
}

// Mock user data for demo
const mockUsers = {
  admin: {
    role: "admin" as const,
    name: "Admin User",
    permissions: ["read", "write", "delete", "manage"],
  },
  manager: {
    role: "manager" as const,
    name: "Manager User",
    permissions: ["read", "write"],
  },
  user: {
    role: "user" as const,
    name: "Regular User",
    permissions: ["read"],
  },
};

// Simulate AI generating UI based on user intent
export async function generateUIForIntent(
  intent: UserIntent,
): Promise<GeneratedUI> {
  const { role, currentTask, recentActions } = intent;

  const prompt = `
    User Role: ${role}
    Current Task: ${currentTask}
    Recent Actions: ${recentActions.join(", ")}

    Generate a dashboard UI with 3-5 cards that are most relevant for this user.
    Consider their role and what they're currently working on.
    
    Return a JSON object with:
    - layout: one of 'grid', 'list', 'dashboard'
    - cards: array of cards with id, title, content, type, priority
    - recommendations: array of 2-3 suggested actions
  `;

  // If mock mode or no API key, return mock data immediately
  if (isMockMode) {
    console.log("Using mock data (no OpenRouter API key)");
    return getMockUI(role, currentTask, recentActions);
  }

  try {
    console.log("Calling OpenRouter API...");
    const result = await streamUI({
      model: openrouter("openai/gpt-4o-mini"), // Using GPT-4o-mini via OpenRouter
      system:
        "You are a UI/UX expert that generates adaptive dashboard interfaces. Respond with a JSON object containing layout, cards array, and recommendations array.",
      prompt,
      tools: {
        generateDashboard: {
          description:
            "Generate dashboard UI components based on user role and context",
          parameters: z.object({
            layout: z.enum(["grid", "list", "dashboard"]),
            cards: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                content: z.string(),
                type: z.enum(["metric", "chart", "list", "action"]),
                priority: z.enum(["high", "medium", "low"]),
              }),
            ),
            recommendations: z.array(z.string()),
            totalTokens: z.number().optional(),
            estimatedCost: z.number().optional(),
          }),
          generate: async function* (args: {
            layout: string;
            cards: Array<{
              id: string;
              title: string;
              content: string;
              type: string;
              priority: string;
            }>;
            recommendations: string[];
            totalTokens?: number;
            estimatedCost?: number;
          }) {
            const {
              layout,
              cards,
              recommendations,
              totalTokens,
              estimatedCost,
            } = args;

            yield (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated {cards.length} cards with {layout} layout
                </div>
                {totalTokens && (
                  <div className="text-xs text-muted-foreground">
                    Tokens used: {totalTokens} • Estimated cost: $
                    {estimatedCost?.toFixed(6) || "0.000"}
                  </div>
                )}
              </div>
            );

            return (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Dashboard generated successfully via OpenRouter
                </div>
                {totalTokens && (
                  <div className="text-xs text-muted-foreground">
                    Total: {totalTokens} tokens (${estimatedCost?.toFixed(6)})
                  </div>
                )}
              </div>
            );
          },
        },
      },
    });

    const aiState = getMutableAIState();
    aiState.update({
      ...aiState.get(),
      lastGeneratedUI: {
        layout: "dashboard",
        cards: [],
        recommendations: [],
      },
    });

    // Extract data from result if available
    if (result && typeof result === "object" && "object" in result) {
      const data = result.object as any;
      return {
        layout: data.layout || "dashboard",
        cards: data.cards || [],
        recommendations: data.recommendations || [],
        totalTokens: data.totalTokens || 0,
        estimatedCost: data.estimatedCost || 0,
      };
    }

    // Fallback to mock data
    return getMockUI(role, currentTask, recentActions);
  } catch (error) {
    console.error("OpenRouter API call failed:", error);
    console.log("Falling back to mock data");
    return getMockUI(role, currentTask, recentActions);
  }
}

// Get user intent from context (simulated)
export function getUserIntent(userId: string, currentPath: string): UserIntent {
  const user = mockUsers[userId as keyof typeof mockUsers] || mockUsers.user;

  // Simulate detecting intent from URL path
  let currentTask = "general";
  if (currentPath.includes("/dashboard")) currentTask = "monitoring";
  if (currentPath.includes("/analytics")) currentTask = "analysis";
  if (currentPath.includes("/settings")) currentTask = "configuration";

  return {
    role: user.role,
    currentTask,
    recentActions: ["login", "view_dashboard", currentTask],
  };
}

export const AI = createAI({
  actions: {
    generateUIForIntent,
    getUserIntent,
  },
  initialAIState: {},
  initialUIState: {},
});
