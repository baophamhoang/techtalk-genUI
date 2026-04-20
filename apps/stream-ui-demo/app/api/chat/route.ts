import { chartSchema, cardListSchema, formSchema, kpiSchema, tableSchema } from "../../../lib/schemas/tools";

const toolsConfig = {
  show_chart: chartSchema,
  show_card_list: cardListSchema,
  show_form: formSchema,
  show_kpi: kpiSchema,
  show_table: tableSchema
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "show_chart",
      description: "Hiển thị biểu đồ (line hoặc bar)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          kind: { type: "string", enum: ["line", "bar"] },
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
          categories: { type: "array", items: { type: "string" } },
        },
        required: ["title", "kind", "series"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_card_list",
      description: "Hiển thị danh sách card (ví dụ: danh sách món ăn, danh sách khách sạn)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                subtitle: { type: "string" },
                description: { type: "string" },
                price: { type: "string" },
                rating: { type: "number" }
              },
              required: ["id", "title"]
            }
          }
        },
        required: ["title", "cards"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "show_form",
      description: "Hiển thị một form thu thập thông tin",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          submitLabel: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                 key: { type: "string" },
                 field: {
                    type: "object",
                    properties: {
                       type: { type: "string", enum: ["text", "email", "number", "date", "select", "textarea", "phone", "checkbox", "file"] },
                       label: { type: "string" },
                       required: { type: "boolean" },
                       options: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } }
                    },
                    required: ["type", "label"]
                 }
              },
              required: ["key", "field"]
            }
          }
        },
        required: ["id", "title", "submitLabel", "fields"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "show_kpi",
      description: "Hiển thị một chỉ số quan trọng (KPI)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          value: { type: "string" },
          delta: { type: "string", description: "VD: '+12%'" }
        },
        required: ["title", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "show_table",
      description: "Hiển thị bảng dữ liệu",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          columns: { type: "array", items: { type: "string" } },
          rows: { type: "array", items: { type: "object", additionalProperties: true } }
        },
        required: ["title", "columns", "rows"]
      }
    }
  }
];

const SYSTEM_PROMPT = `You are a helpful GenUI Assistant. Do NOT output a fully formed dashboard from a single turn, but act as a conversational assistant.
When the user asks you a question or requests an action:
1. Provide a prose text response natively using Vietnamese language.
2. If applicable, call the appropriate tools (show_chart, show_card_list, show_form, show_kpi, show_table) to interleave UI components with your text.
For mock datasets (sales, hotels, restaurants), if the user explicitly asks about them, make up reasonable payload data to use in the tool.
NEVER expose the name of the tools in the text response.`;

export async function POST(req: Request) {
  const { messages, scenario } = await req.json();

  let contextInstruction = "";
  if (scenario === "analytics") {
    contextInstruction = "\nYou are operating in the 'Business Analytics' domain. Focus on mock KPIs, sales charts, and tabular business data.";
  } else if (scenario === "travel") {
    contextInstruction = "\nYou are operating in the 'Travel & Booking' domain. Focus on mock flight info, hotel cards, and booking forms.";
  } else if (scenario === "food") {
    contextInstruction = "\nYou are operating in the 'Food & Beverage' domain. Focus on mock restaurant menus, food delivery summaries, and rating forms.";
  }

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
            { role: "system", content: SYSTEM_PROMPT + contextInstruction },
            ...messages,
          ],
          tools: TOOLS,
          tool_choice: "auto",
          stream: true,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let toolCallState: Record<number, { name: string, args: string }> = {};

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
                const idx = tc.index;
                if (!toolCallState[idx]) {
                  toolCallState[idx] = { name: tc.function?.name || "", args: "" };
                } else if (tc.function?.name) {
                  toolCallState[idx].name = tc.function.name;
                }
                
                if (tc.function?.arguments) {
                  toolCallState[idx].args += tc.function.arguments;
                }
                
                try {
                  const state = toolCallState[idx];
                  const schema = toolsConfig[state.name as keyof typeof toolsConfig];
                  if (schema && state.args) {
                    const parsed = schema.safeParse(JSON.parse(state.args));
                    if (parsed.success) {
                      const payload = JSON.stringify({ tool: state.name, args: parsed.data });
                      await writer.write(encoder.encode(`__TOOL__${payload}__ENDTOOL__`));
                      // We sent it, clear it so we don't send again
                      delete toolCallState[idx];
                    }
                  }
                } catch { /* wait for more chunks */ }
              }
            }
            if (delta.content) {
              await writer.write(encoder.encode(`__CHUNK__${delta.content}`));
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error("chat stream error:", err);
      await writer.write(encoder.encode("__DONE__\n"));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
