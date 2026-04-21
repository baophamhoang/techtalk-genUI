import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

export async function POST(req: Request) {
  const { userMessage, scenario } = await req.json();

  try {
    const { text } = await generateText({
      model: openrouter.chat("openai/gpt-4o-mini"),
      prompt: `The user is chatting with a "${scenario}" assistant and just sent: "${userMessage}"

Generate exactly 3 concise Vietnamese follow-up prompts they might want to ask next. Max 8 words each.
Reply with ONLY a JSON array, e.g.: ["Prompt 1", "Prompt 2", "Prompt 3"]`,
    });

    const match = text.match(/\[[\s\S]*?\]/);
    const suggestions: string[] = match ? JSON.parse(match[0]) : [];
    return Response.json({ suggestions: suggestions.slice(0, 3) });
  } catch (err) {
    console.error("[suggest] error:", err);
    return Response.json({ suggestions: [] });
  }
}
