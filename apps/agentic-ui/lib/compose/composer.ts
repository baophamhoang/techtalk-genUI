import { primitives } from '../schemas/primitives';
import type { SignalBundle } from '../signals/collector';

export interface ComposeResult {
  ok: boolean;
  tools: Array<{ name: string; args: Record<string, unknown> }>;
  raw?: string;
  issues?: unknown[];
  latencyMs: number;
  tokens: number;
}

export async function composeUI(bundle: SignalBundle): Promise<ComposeResult> {
  const start = Date.now();

  const persona = bundle.persona;
  const scenarioInstructions: Record<string, string> = {
    baseline:
      'User is browsing at normal time. Show default trending home grid with persona-relevant content.',
    weather:
      "Cold weather alert! User is at home, idle. Show comfort food recommendations. Hide default trending. Add a hero banner 'Trời lạnh rồi!' with warm food options.",
    searchAbandon:
      "User searched for food multiple times but didn't order. Show a mood picker to help them decide.",
  };

  const prompt = `You are a food delivery UI composer. Given a user context, compose the home page layout.

Persona: ${persona.name}, ${persona.age} years old, ${persona.city}. Profile: ${persona.pattern}

Scenario: ${bundle.scenario} — ${scenarioInstructions[bundle.scenario] ?? scenarioInstructions.baseline}

Current time: ${bundle.time}
Weather: ${bundle.weather.temp}°C, ${bundle.weather.condition}
Location: ${bundle.location}
Recent orders: ${bundle.behavior.recentOrders}
Session minutes: ${bundle.behavior.sessionMinutes}

Use tools to compose the UI:
- restructureHome: Hero banner + curated rows. Use when weather/event changes the home layout significantly.
- showMoodPicker: 3 cards with moods + curated items per mood. Use when user needs help deciding what to eat.
- showContextBanner: A simple info/warning/success banner.
- showCuratedRow: A row of food items with optional tags and price ranges.

Return JSON with tool calls.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a food delivery UI composer. Always respond with valid JSON tool calls.',
          },
          { role: 'user', content: prompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'restructureHome',
              description: 'Restructure home page layout',
              parameters: {
                type: 'object',
                properties: {
                  hero: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      subtitle: { type: 'string' },
                      tag: { type: 'string' },
                    },
                  },
                  rows: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        items: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              price: { type: 'string' },
                              image: { type: 'string' },
                              badge: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    hideDefaultRows: { type: 'boolean' },
                  },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'showMoodPicker',
              description: 'Show mood picker',
              parameters: {
                type: 'object',
                properties: {
                  prompt: { type: 'string' },
                  moods: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        icon: { type: 'string' },
                        curatedItems: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              price: { type: 'string' },
                              image: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'showContextBanner',
              description: 'Show context banner',
              parameters: {
                type: 'object',
                properties: {
                  tone: {
                    type: 'string',
                    enum: ['info', 'warning', 'success'],
                  },
                  title: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'showCuratedRow',
              description: 'Show curated row',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  tag: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        price: { type: 'string' },
                        image: { type: 'string' },
                        macroBadges: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        priceRange: { type: 'string' },
                      },
                    },
                  },
                  macroBadges: { type: 'array', items: { type: 'string' } },
                  priceRange: { type: 'string' },
                },
              },
            },
          },
        ],
        tool_choice: 'required',
        stream: false,
      }),
    });

    const data = (await res.json()) as any;
    const latencyMs = Date.now() - start;
    const tokens = data.usage?.total_tokens ?? 0;

    const toolCalls = data.choices?.[0]?.message?.tool_calls ?? [];
    const parsedTools: Array<{ name: string; args: Record<string, unknown> }> =
      [];

    for (const tc of toolCalls) {
      try {
        const schema = primitives[tc.function.name as keyof typeof primitives];
        if (schema) {
          const parsed = schema.safeParse(JSON.parse(tc.function.arguments));
          if (parsed.success) {
            parsedTools.push({ name: tc.function.name, args: parsed.data });
          }
        }
      } catch {
        /* skip */
      }
    }

    if (parsedTools.length > 0) {
      return { ok: true, tools: parsedTools, latencyMs, tokens };
    }

    return {
      ok: false,
      tools: [],
      raw: JSON.stringify(data.choices?.[0]?.message),
      issues: [{ message: 'No valid tool calls parsed' }],
      latencyMs,
      tokens,
    };
  } catch (err) {
    return {
      ok: false,
      tools: [],
      issues: [{ message: `Error: ${err}` }],
      latencyMs: Date.now() - start,
      tokens: 0,
    };
  }
}
