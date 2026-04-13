// Multi-model orchestration with cost optimization and intelligent routing

export interface ModelConfig {
  name: string;
  provider: "openai" | "anthropic" | "deepseek" | "minimax" | "kimi";
  costPer1kTokens: number;
  maxTokens: number;
  strengths: string[];
  weaknesses: string[];
  latency: number; // ms
}

export interface GenerationTask {
  type: "component" | "layout" | "styling" | "logic";
  complexity: "simple" | "medium" | "complex";
  description: string;
  estimatedTokens: number;
}

export interface ModelSelection {
  model: ModelConfig;
  task: GenerationTask;
  estimatedCost: number;
  reasoning: string;
}

export interface GenerationResult {
  components: Array<{
    name: string;
    type: string;
    description: string;
    generatedBy: string;
    cost: number;
  }>;
  totalCost: number;
  totalTokens: number;
  latency: number;
  models: ModelConfig[];
  optimizations: string[];
}

// Available models with cost optimization
const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: "gpt-4o-mini",
    provider: "openai",
    costPer1kTokens: 0.00015,
    maxTokens: 128000,
    strengths: ["general purpose", "code generation", "fast"],
    weaknesses: ["higher cost than alternatives"],
    latency: 500,
  },
  {
    name: "claude-3-haiku",
    provider: "anthropic",
    costPer1kTokens: 0.00025,
    maxTokens: 200000,
    strengths: ["large context", "reasoning", "document understanding"],
    weaknesses: ["slower response"],
    latency: 800,
  },
  {
    name: "deepseek-coder",
    provider: "deepseek",
    costPer1kTokens: 0.00014,
    maxTokens: 128000,
    strengths: ["code generation", "low cost", "efficient"],
    weaknesses: ["general knowledge"],
    latency: 400,
  },
  {
    name: "minimax-text",
    provider: "minimax",
    costPer1kTokens: 0.00012,
    maxTokens: 64000,
    strengths: ["chinese language", "creative writing", "lowest cost"],
    weaknesses: ["code generation"],
    latency: 600,
  },
  {
    name: "kimi-math",
    provider: "kimi",
    costPer1kTokens: 0.00018,
    maxTokens: 128000,
    strengths: ["mathematical reasoning", "analysis", "structured output"],
    weaknesses: ["creative tasks"],
    latency: 700,
  },
];

// Task complexity mapping
const TASK_COMPLEXITY: Record<string, GenerationTask[]> = {
  simple: [
    {
      type: "component",
      complexity: "simple",
      description: "Basic form inputs",
      estimatedTokens: 500,
    },
    {
      type: "styling",
      complexity: "simple",
      description: "CSS classes",
      estimatedTokens: 300,
    },
  ],
  medium: [
    {
      type: "component",
      complexity: "medium",
      description: "Interactive components",
      estimatedTokens: 1000,
    },
    {
      type: "layout",
      complexity: "medium",
      description: "Responsive layout",
      estimatedTokens: 800,
    },
    {
      type: "logic",
      complexity: "medium",
      description: "Basic event handlers",
      estimatedTokens: 600,
    },
  ],
  complex: [
    {
      type: "component",
      complexity: "complex",
      description: "Complex interactive widgets",
      estimatedTokens: 2000,
    },
    {
      type: "layout",
      complexity: "complex",
      description: "Dynamic grid system",
      estimatedTokens: 1500,
    },
    {
      type: "logic",
      complexity: "complex",
      description: "State management",
      estimatedTokens: 1200,
    },
    {
      type: "styling",
      complexity: "complex",
      description: "Theme system",
      estimatedTokens: 1000,
    },
  ],
};

// Select optimal model for a task
function selectOptimalModel(
  task: GenerationTask,
  budget: "low" | "medium" | "high",
  logCallback: (message: string) => void,
): ModelSelection {
  const suitableModels = AVAILABLE_MODELS.filter((model) => {
    // Filter by task type strengths
    if (task.type === "component" || task.type === "logic") {
      return model.strengths.some(
        (s) => s.includes("code") || s.includes("generation"),
      );
    }
    if (task.type === "layout") {
      return model.strengths.some(
        (s) => s.includes("structured") || s.includes("reasoning"),
      );
    }
    return true;
  });

  // Sort by optimization criteria
  const sortedModels = suitableModels.sort((a, b) => {
    if (budget === "low") {
      // Lowest cost first
      return a.costPer1kTokens - b.costPer1kTokens;
    } else if (budget === "medium") {
      // Balance cost and quality
      const scoreA = (1 / a.costPer1kTokens) * (1 / a.latency);
      const scoreB = (1 / b.costPer1kTokens) * (1 / b.latency);
      return scoreB - scoreA;
    } else {
      // Best quality (assuming higher cost = better)
      return b.costPer1kTokens - a.costPer1kTokens;
    }
  });

  const selectedModel = sortedModels[0];
  const estimatedCost =
    (task.estimatedTokens / 1000) * selectedModel.costPer1kTokens;

  logCallback(
    `Selected ${selectedModel.name} for ${task.type} (${task.complexity}) - Cost: $${estimatedCost.toFixed(6)}`,
  );

  return {
    model: selectedModel,
    task,
    estimatedCost,
    reasoning: `Best ${budget} budget option for ${task.type}`,
  };
}

// Simulate generation with selected model
async function simulateGeneration(
  selection: ModelSelection,
  description: string,
  logCallback: (message: string) => void,
): Promise<{
  component: any;
  actualTokens: number;
  latency: number;
}> {
  const startTime = Date.now();

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, selection.model.latency));

  const actualTokens = Math.floor(
    selection.task.estimatedTokens * (0.8 + Math.random() * 0.4),
  );
  const latency = Date.now() - startTime;

  logCallback(
    `Generated with ${selection.model.name}: ${actualTokens} tokens in ${latency}ms`,
  );

  return {
    component: {
      name: `${selection.task.type.charAt(0).toUpperCase() + selection.task.type.slice(1)} Component`,
      type: selection.task.type,
      description: selection.task.description,
      generatedBy: selection.model.name,
      cost: (actualTokens / 1000) * selection.model.costPer1kTokens,
    },
    actualTokens,
    latency,
  };
}

// Main orchestration function
export async function generateWithModelOrchestration(
  uiDescription: string,
  complexity: "simple" | "medium" | "complex",
  budget: "low" | "medium" | "high",
  logCallback: (message: string) => void = () => {},
): Promise<GenerationResult> {
  logCallback("Starting multi-model orchestration...");

  const tasks = TASK_COMPLEXITY[complexity];
  const selectedModels: ModelSelection[] = [];
  const components: any[] = [];
  let totalCost = 0;
  let totalTokens = 0;
  let totalLatency = 0;

  // Step 1: Model selection for each task
  logCallback("Selecting optimal models for each task...");
  for (const task of tasks) {
    const selection = selectOptimalModel(task, budget, logCallback);
    selectedModels.push(selection);
  }

  // Step 2: Parallel generation simulation
  logCallback("Generating components in parallel...");
  const generationPromises = selectedModels.map((selection) =>
    simulateGeneration(selection, uiDescription, logCallback),
  );

  const results = await Promise.all(generationPromises);

  // Step 3: Aggregate results
  results.forEach((result, index) => {
    components.push(result.component);
    totalCost += result.component.cost;
    totalTokens += result.actualTokens;
    totalLatency += result.latency;
  });

  // Step 4: Apply optimizations
  const optimizations: string[] = [];
  if (budget === "low") {
    optimizations.push("Used cheapest models for each task type");
    optimizations.push("Token usage optimized for cost efficiency");
  } else if (budget === "high") {
    optimizations.push("Used premium models for best quality");
    optimizations.push("Maximized context window for complex tasks");
  } else {
    optimizations.push("Balanced cost and quality across models");
    optimizations.push("Intelligent task-to-model mapping");
  }

  logCallback(`Orchestration complete! Total cost: $${totalCost.toFixed(4)}`);

  return {
    components,
    totalCost,
    totalTokens,
    latency: totalLatency,
    models: selectedModels.map((s) => s.model),
    optimizations,
  };
}

// Utility function for cost estimation
export function estimateCost(
  description: string,
  complexity: "simple" | "medium" | "complex",
): { min: number; max: number; recommended: number } {
  const tasks = TASK_COMPLEXITY[complexity];
  const totalTokens = tasks.reduce(
    (sum, task) => sum + task.estimatedTokens,
    0,
  );

  // Calculate with cheapest and most expensive models
  const cheapestCost =
    (totalTokens / 1000) *
    Math.min(...AVAILABLE_MODELS.map((m) => m.costPer1kTokens));
  const expensiveCost =
    (totalTokens / 1000) *
    Math.max(...AVAILABLE_MODELS.map((m) => m.costPer1kTokens));
  const avgCost = (cheapestCost + expensiveCost) / 2;

  return {
    min: cheapestCost,
    max: expensiveCost,
    recommended: avgCost,
  };
}
