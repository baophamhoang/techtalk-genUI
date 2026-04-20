import { NextResponse } from "next/server";
import { FormSchema } from "@techtalk/shared";

function extractJson(raw: string): { ok: true; data: unknown } | { ok: false; raw: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return { ok: false, raw };
  try {
    return { ok: true, data: JSON.parse(raw.slice(start, end + 1)) };
  } catch {
    return { ok: false, raw };
  }
}

import { GENUI_BUCKETS } from "../../../../src/scenarios/genui";

interface RequestBody {
  bucket?: "artifact_triage" | "service_intake" | "fallback";
  description?: string;
}

export async function POST(req: Request) {
  const start = Date.now();
  const { bucket, description } = await req.json() as RequestBody;

  let systemPrompt = "";
  if (bucket && bucket === "fallback" && description) {
    systemPrompt = `You are a helpful UI generator. The user will ask for a form.
You MUST return ONLY a valid JSON object matching the FormSchema requirements.
Include an 'id', 'title', 'description', 'submitLabel', and a 'fields' array.
Each field must have 'key' and 'field' (with 'type', 'label', and optional 'required').
If field type is 'select' or 'radio', you MUST include an 'options' array where each item has 'label' and 'value'.
Allowed field types: text, email, number, date, select, textarea, phone, checkbox, radio, file.
No markdown, no prose.`;
  } else if (bucket && GENUI_BUCKETS[bucket as keyof typeof GENUI_BUCKETS]) {
    systemPrompt = GENUI_BUCKETS[bucket as keyof typeof GENUI_BUCKETS].systemPrompt;
  }

  if (!systemPrompt || !description) {
    return NextResponse.json({ ok: false, error: "Missing valid bucket or description" }, { status: 400 });
  }

  let totalTokens = 0;
  let rawResponse = "";

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
          { role: "system", content: systemPrompt },
          { role: "user", content: description },
        ],
        stream: true,
      }),
    });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
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
            if (raw === "[DONE]") break;
            try {
              const parsed = JSON.parse(raw);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                rawResponse += delta;
                await writer.write(encoder.encode(delta));
              }
              if (parsed.usage?.total_tokens) {
                totalTokens = parsed.usage.total_tokens;
              }
            } catch {}
          }
        }
        
        const metadata = JSON.stringify({ tokens: totalTokens });
        await writer.write(encoder.encode(`\n__METADATA__${metadata}`));
      } catch (err) {
        console.error("Stream error:", err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (err) {
    console.error("genui/form error:", err);
    return NextResponse.json({
      ok: false,
      raw: rawResponse,
      issues: [{ message: "Network or Server error calling" }],
      latencyMs: Date.now() - start,
      tokens: totalTokens,
    });
  }
}