// Simple AI integration for Demo 2 with OpenRouter

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

// Mock user data
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

// Get user intent from context
export function getUserIntent(userId: string, currentPath: string): UserIntent {
  const user = mockUsers[userId as keyof typeof mockUsers] || mockUsers.user;

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

// Generate mock UI data (fallback when no API key)
function getMockUI(
  role: "admin" | "manager" | "user",
  currentTask: string,
  recentActions: string[],
): GeneratedUI {
  const baseCards: DashboardCard[] = [
    {
      id: "1",
      title: role === "admin" ? "System Health" : "My Stats",
      content:
        role === "admin" ? "Server uptime: 99.9%" : "Tasks completed: 12",
      type: "metric",
      priority: "high",
    },
    {
      id: "2",
      title: "Recent Activity",
      content: `Based on: ${currentTask}`,
      type: "list",
      priority: "medium",
    },
    {
      id: "3",
      title: "Quick Actions",
      content:
        role === "admin"
          ? "Manage users, View logs"
          : "Submit report, Request time off",
      type: "action",
      priority: "high",
    },
  ];

  // Add role-specific cards
  if (role === "admin") {
    baseCards.push({
      id: "4",
      title: "Security Dashboard",
      content: "Active threats: 0 • Last scan: 2 hours ago",
      type: "metric",
      priority: "high",
    });
  } else if (role === "manager") {
    baseCards.push({
      id: "4",
      title: "Team Performance",
      content: "Average completion: 87% • Pending reviews: 3",
      type: "metric",
      priority: "medium",
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

// Simulate API call with OpenRouter (or return mock data)
export async function generateUIForIntent(
  intent: UserIntent,
): Promise<GeneratedUI> {
  const { role, currentTask, recentActions } = intent;

  // Check if we have OpenRouter API key
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;

  if (!hasApiKey) {
    console.log("No OpenRouter API key found, using mock data");
    return getMockUI(role, currentTask, recentActions);
  }

  // Simulate API call (in real implementation, this would call OpenRouter)
  console.log("Simulating OpenRouter API call...");

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return enhanced mock data with simulated API metrics
  const mockData = getMockUI(role, currentTask, recentActions);

  return {
    ...mockData,
    totalTokens: 450, // Simulated token usage
    estimatedCost: 0.0000675, // $0.00015/1K tokens * 450 tokens
    modelUsed: "openai/gpt-4o-mini (via OpenRouter)",
  };
}
