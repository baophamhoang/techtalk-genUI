import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs, type CoreMessage } from "ai";
import {
  chartSchema,
  cardListSchema,
  formSchema,
  kpiSchema,
  tableSchema,
} from "../../../lib/schemas/tools";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

const SYSTEM_PROMPT = `You are a helpful GenUI Assistant. Reply in Vietnamese.
Write a brief prose reply, then call the appropriate UI tool(s): show_chart, show_card_list, show_form, show_kpi, show_table.
For mock data, invent plausible Vietnamese numbers. Do not mention tool names in prose.`;

// Convert UIMessage[] (parts-based format from useChat) to CoreMessage[]
// Tool calls are display-only so we strip them — the model only needs the text context.
function toCoreMessages(uiMessages: any[]): CoreMessage[] {
  const result: CoreMessage[] = [];

  for (const msg of uiMessages) {
    const role = msg.role as "user" | "assistant" | "system";

    if (role === "user" || role === "system") {
      const text =
        (msg.parts as any[] | undefined)
          ?.filter((p) => p.type === "text")
          .map((p) => p.text as string)
          .join("") ??
        (typeof msg.content === "string" ? msg.content : "");
      if (text) result.push({ role, content: text });
      continue;
    }

    if (role === "assistant") {
      const textContent = (msg.parts as any[] | undefined)
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text as string)
        .join("") ?? "";
      if (textContent) result.push({ role: "assistant", content: textContent });
    }
  }

  return result;
}

export async function POST(req: Request) {
  const { messages, scenario } = await req.json();

  let contextInstruction = "";
  if (scenario === "analytics") {
    contextInstruction =
      "\nYou are operating in the 'Business Analytics' domain. Focus on mock KPIs, sales charts, and tabular business data.";
  } else if (scenario === "travel") {
    contextInstruction =
      "\nYou are operating in the 'Travel & Booking' domain. Focus on mock flight info, hotel cards, and booking forms.";
  } else if (scenario === "food") {
    contextInstruction =
      "\nYou are operating in the 'Food & Beverage' domain. Focus on mock restaurant menus, food delivery summaries, and rating forms.";
  }

  try {
    const result = streamText({
      model: openrouter.chat("minimax/minimax-m2.7"),
      system: SYSTEM_PROMPT + contextInstruction,
      messages: toCoreMessages(messages),
      stopWhen: stepCountIs(4),
      tools: {
        show_chart: tool({
          description: "Hiển thị biểu đồ (line hoặc bar)",
          inputSchema: chartSchema,
        }),
        show_card_list: tool({
          description:
            "Hiển thị danh sách card (ví dụ: danh sách món ăn, danh sách khách sạn)",
          inputSchema: cardListSchema,
        }),
        show_form: tool({
          description: "Hiển thị một form thu thập thông tin",
          inputSchema: formSchema,
        }),
        show_kpi: tool({
          description: "Hiển thị một chỉ số quan trọng (KPI)",
          inputSchema: kpiSchema,
        }),
        show_table: tool({
          description: "Hiển thị bảng dữ liệu",
          inputSchema: tableSchema,
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
