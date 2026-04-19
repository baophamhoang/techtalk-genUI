export const maxDuration = 30;

const SYSTEM_PROMPT = "You are a UI architect. Always respond with ONLY valid JSON, no markdown, no explanation.";

export async function POST(req: Request) {
  const { prompt, system } = await req.json();

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
            { role: "system", content: system ?? SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
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
            await writer.write(encoder.encode("data: [DONE]\n\n"));
            break;
          }
          try {
            await writer.write(encoder.encode(`data: ${JSON.stringify(JSON.parse(raw))}\n\n`));
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      console.error("legacy-stream error:", err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}