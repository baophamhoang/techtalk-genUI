const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "minimax/minimax-m2.7";

export interface OpenRouterOptions {
  model?: string;
  system?: string;
  messages?: { role: "user" | "assistant" | "system"; content: string }[];
  tools?: unknown[];
  tool_choice?: "required" | "auto" | "none";
  stream?: boolean;
  temperature?: number;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string | null;
      tool_calls?: {
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }[];
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, backoff = 500): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status < 500) return res;
      if (attempt === retries) return res;
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
    if (attempt < retries) await sleep(backoff * Math.pow(2, attempt));
  }
  throw lastError ?? new Error("Request failed");
}

export async function callOpenRouter(options: OpenRouterOptions): Promise<{ content: string; toolCalls: { id: string; name: string; args: Record<string, unknown> }[]; latencyMs: number; tokens: number }> {
  const start = Date.now();
  const model = options.model ?? DEFAULT_MODEL;
  const stream = options.stream ?? false;

  const res = await fetchWithRetry(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream,
      messages: [
        ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
        ...(options.messages ?? []),
      ],
      tools: options.tools,
      tool_choice: options.tool_choice,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const data = await res.json() as OpenRouterResponse;
  const latencyMs = Date.now() - start;
  const tokens = data.usage?.total_tokens ?? 0;

  const rawContent = data.choices?.[0]?.message?.content ?? "";
  const toolCalls = (data.choices?.[0]?.message?.tool_calls ?? []).map(tc => ({
    id: tc.id,
    name: tc.function.name,
    args: JSON.parse(tc.function.arguments) as Record<string, unknown>,
  }));

  return { content: typeof rawContent === "string" ? rawContent : "", toolCalls, latencyMs, tokens };
}

export async function streamOpenRouter(
  options: OpenRouterOptions,
  onChunk: (delta: string, toolCall: { name: string; args: string } | null) => void,
  onDone: (totalTokens: number) => void
): Promise<{ latencyMs: number; tokens: number }> {
  const start = Date.now();
  const model = options.model ?? DEFAULT_MODEL;

  const res = await fetchWithRetry(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
        ...(options.messages ?? []),
      ],
      tools: options.tools,
      tool_choice: options.tool_choice,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let totalTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") { onDone(totalTokens); return { latencyMs: Date.now() - start, tokens: totalTokens }; }
      try {
        const data = JSON.parse(raw);
        if (data.usage?.total_tokens) totalTokens = data.usage.total_tokens;
        const delta = data.choices?.[0]?.delta;
        if (delta?.content) onChunk(delta.content, null);
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            onChunk("", { name: tc.function.name, args: tc.function.arguments });
          }
        }
      } catch { /* skip malformed */ }
    }
  }

  onDone(totalTokens);
  return { latencyMs: Date.now() - start, tokens: totalTokens };
}

export function extractJson(raw: string): { ok: true; data: unknown } | { ok: false; raw: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return { ok: false, raw };
  try {
    return { ok: true, data: JSON.parse(raw.slice(start, end + 1)) };
  } catch {
    return { ok: false, raw };
  }
}