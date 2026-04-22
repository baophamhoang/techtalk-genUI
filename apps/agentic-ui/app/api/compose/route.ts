import { NextResponse } from 'next/server';
import { buildSignalBundle } from '../../../lib/signals/collector';
import { primitives } from '../../../lib/schemas/primitives';

const SCENARIO_INSTRUCTIONS: Record<string, string> = {
  baseline: 'User is browsing at normal time. Show default trending home grid with persona-relevant content.',
  weather: "Cold weather alert! User is at home, idle. Show comfort food recommendations. Hide default trending. Add a hero banner 'Trời lạnh rồi!' with warm food options.",
  searchAbandon: "User searched for food multiple times but didn't order. Show a mood picker to help them decide.",
};

const COMPOSE_TOOLS = [
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
          },
          hideDefaultRows: { type: 'boolean' },
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
          tone: { type: 'string', enum: ['info', 'warning', 'success'] },
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
                macroBadges: { type: 'array', items: { type: 'string' } },
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
];

export async function POST(req: Request) {
  const { personaId, scenario } = await req.json();

  if (!personaId || !scenario) {
    return NextResponse.json({ error: 'Missing personaId or scenario' }, { status: 400 });
  }

  const bundle = buildSignalBundle(personaId, scenario);
  const start = Date.now();

  const prompt = `You are a food delivery UI composer. Given a user context, compose the home page layout.

Persona: ${bundle.persona.name}, ${bundle.persona.age} years old, ${bundle.persona.city}. Profile: ${bundle.persona.pattern}

Scenario: ${bundle.scenario} — ${SCENARIO_INSTRUCTIONS[bundle.scenario] ?? SCENARIO_INSTRUCTIONS.baseline}

Current time: ${bundle.time}
Weather: ${bundle.weather.temp}°C, ${bundle.weather.condition}
Location: ${bundle.location}
Recent orders: ${bundle.behavior.recentOrders}
Session minutes: ${bundle.behavior.sessionMinutes}

First write exactly 1-2 short Vietnamese sentences explaining which signals you noticed and why you're choosing this specific layout. Be specific (mention persona name, weather, time, or behavior). Then immediately call the appropriate tools to compose the UI. Use restructureHome for weather/event layout changes, showMoodPicker when user needs help deciding, showContextBanner for alerts, showCuratedRow for food rows.`;

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      const emit = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      emit({ type: 'bundle', bundle });

      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-5-haiku',
            messages: [
              { role: 'system', content: 'You are a food delivery UI composer. Call tools to compose the home page UI.' },
              { role: 'user', content: prompt },
            ],
            tools: COMPOSE_TOOLS,
            tool_choice: 'auto',
            stream: true,
            stream_options: { include_usage: true },
          }),
        });

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        const buffers = new Map<number, { name: string; argsStr: string }>();
        let lastIdx = -1;
        let tokens = 0;
        let leftover = '';

        const tryEmit = (idx: number) => {
          const buf = buffers.get(idx);
          if (!buf || !buf.name) return;
          try {
            const raw = JSON.parse(buf.argsStr);
            const schema = primitives[buf.name as keyof typeof primitives];
            if (schema) {
              const parsed = schema.safeParse(raw);
              emit({ type: 'tool', name: buf.name, args: parsed.success ? parsed.data : raw });
            }
          } catch { /* skip malformed */ }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = leftover + decoder.decode(value, { stream: true });
          const lines = text.split('\n');
          leftover = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') {
              if (lastIdx >= 0) tryEmit(lastIdx);
              continue;
            }

            try {
              const chunk = JSON.parse(payload);
              if (chunk.usage?.total_tokens) tokens = chunk.usage.total_tokens;

              const delta = chunk.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.content) {
                emit({ type: 'text', delta: delta.content });
              }

              for (const tc of delta.tool_calls ?? []) {
                const idx: number = tc.index ?? 0;

                if (idx !== lastIdx && lastIdx >= 0) {
                  tryEmit(lastIdx);
                }

                if (!buffers.has(idx)) {
                  buffers.set(idx, { name: '', argsStr: '' });
                }
                lastIdx = idx;

                const buf = buffers.get(idx)!;
                if (tc.function?.name) buf.name += tc.function.name;
                if (tc.function?.arguments) buf.argsStr += tc.function.arguments;
              }
            } catch { /* skip malformed chunk */ }
          }
        }

        emit({ type: 'done', latencyMs: Date.now() - start, tokens });
      } catch (err) {
        emit({ type: 'error', message: String(err) });
      }

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
