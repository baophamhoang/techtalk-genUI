import { NextResponse } from "next/server";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string().default("Submit"),
  fields: z.array(z.object({ key: z.string(), field: z.any() })),
});

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

const SYSTEM_PROMPT = `You are a UI architect for Vietnamese business forms.
Generate a JSON form schema based on the user's requirement.
Always respond with ONLY valid JSON matching this structure:
{
  "id": "unique-form-id",
  "title": "Form Title in Vietnamese",
  "description": "Optional description",
  "submitLabel": "Submit button label",
  "fields": [
    { "key": "fieldKey", "field": { "type": "text|email|number|date|select|textarea|phone|checkbox|radio|file", "label": "Label in Vietnamese", "required": boolean, ...other field-specific options } }
  ]
}
Rules: Vietnamese labels, 4-8 fields, appropriate field types for the use case.`;

interface RequestBody {
  industry?: string;
  workflow?: string;
  requirement?: string;
}

export async function POST(req: Request) {
  const start = Date.now();
  const { industry, workflow, requirement } = await req.json() as RequestBody;

  let prompt = "";
  if (requirement) {
    prompt = `Generate a form for: ${requirement}`;
  } else if (industry && workflow) {
    prompt = `Generate a form schema for ${industry} industry, workflow: ${workflow}`;
  } else {
    return NextResponse.json({ ok: false, error: "Missing requirement or industry+workflow" }, { status: 400 });
  }

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
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    const data = await res.json() as any;
    const raw = data.choices?.[0]?.message?.content ?? "";
    const latencyMs = Date.now() - start;
    const tokens = data.usage?.total_tokens ?? 0;

    const extracted = extractJson(typeof raw === "string" ? raw : "");
    if (!extracted.ok) {
      return NextResponse.json({
        ok: false,
        raw,
        issues: [{ message: "Could not parse JSON from response" }],
        latencyMs,
        tokens,
      });
    }

    const result = FormSchema.safeParse(extracted.data);
    if (!result.success) {
      return NextResponse.json({
        ok: false,
        raw: JSON.stringify(extracted.data, null, 2),
        issues: result.error.issues.map(i => ({ path: i.path, message: i.message })),
        latencyMs,
        tokens,
      });
    }

    return NextResponse.json({
      ok: true,
      schema: result.data,
      latencyMs,
      tokens,
    });
  } catch (err) {
    console.error("genui/form error:", err);
    return NextResponse.json({
      ok: false,
      raw: "",
      issues: [{ message: `Server error: ${err}` }],
      latencyMs: Date.now() - start,
      tokens: 0,
    });
  }
}