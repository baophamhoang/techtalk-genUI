import { NextResponse } from "next/server";
import { tools } from "../../../lib/schemas/tools";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "add_kpi",
      description: "Add a KPI card to the dashboard showing a metric with optional trend",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Metric label" },
          value: { type: "string", description: "Metric value (string or number)" },
          delta: { type: "string", description: "Trend text e.g. '+12% so với tuần trước'" },
        },
        required: ["title", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_line_chart",
      description: "Add a line chart to the dashboard",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          series: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                data: { type: "array", items: { type: "number" } },
              },
              required: ["name", "data"],
            },
          },
        },
        required: ["title", "series"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_bar_chart",
      description: "Add a bar chart to the dashboard",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          categories: { type: "array", items: { type: "string" } },
          values: { type: "array", items: { type: "number" } },
        },
        required: ["title", "categories", "values"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_table",
      description: "Add a data table to the dashboard",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          columns: { type: "array", items: { type: "string" } },
          rows: { type: "array", items: { type: "array", items: { type: "string" } } },
        },
        required: ["title", "columns", "rows"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are an Internal Dashboard Builder AI. When given a request, you MUST call the available tools to build a dashboard.
Available tools: add_kpi, add_line_chart, add_bar_chart, add_table.
Use realistic Vietnamese content for labels, titles, and values.
You MUST only respond via tool calls — never write plain text.
Use add_kpi for 2-4 metrics. Use add_line_chart or add_bar_chart for charts. Use add_table for tabular data.
Dataset reference: when users ask about "doanh thu" (revenue), use dataset "sales"; for "đơn hàng" (orders), use "orders"; for "khách hàng" (users), use "users".`;

export async function POST(req: Request) {
  const { description } = await req.json();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2.7",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Build a dashboard for: ${description}` },
          ],
          tools: TOOLS,
          tool_choice: "required",
          stream: true,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            await writer.write(encoder.encode("__DONE__\n"));
            break;
          }
          try {
            const data = JSON.parse(raw);
            const delta = data.choices?.[0]?.delta ?? {};
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                try {
                  const parsed = tools[tc.function.name as keyof typeof tools].safeParse(JSON.parse(tc.function.arguments));
                  if (parsed.success) {
                    const payload = JSON.stringify({ tool: tc.function.name, args: parsed.data });
                    await writer.write(encoder.encode(`__TOOL__${payload}__ENDTOOL__`));
                  }
                } catch { /* skip malformed */ }
              }
            }
            if (delta.content) {
              await writer.write(encoder.encode(`__CHUNK__${delta.content}`));
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      console.error("compose-ui error:", err);
      await writer.write(encoder.encode("__DONE__\n"));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}