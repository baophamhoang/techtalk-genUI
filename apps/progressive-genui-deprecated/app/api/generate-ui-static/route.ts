import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { previewStore } from '../../lib/preview-store';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  baseURL: 'https://openrouter.ai/api/v1',
});

export const maxDuration = 30;

// Phase 1: complete, polished static HTML — no JS at all.
// Rendered once, never updated incrementally.
const SYSTEM_PROMPT = `You are a senior UI designer. Generate a complete, visually polished HTML page.

STRICT RULES:
1. Output a FULL HTML document starting with <!DOCTYPE html>
2. Use Tailwind CSS via CDN (already linked) for ALL styling
3. ZERO JavaScript — no onclick, no event handlers, no <script> tags
4. Use realistic Vietnamese placeholder content (names, addresses, labels)
5. The layout must be clean, modern, well-spaced — as if from a real product
6. Input fields, selects, and buttons should look styled and realistic
7. Disabled/readonly state is fine for inputs (they're just visual)
8. Max 80 lines — keep it focused and tight
9. Output ONLY the HTML document — no markdown, no explanation`;

function wrapHtml(rawHtml: string): string {
  const clean = rawHtml
    .replace(/^```html\n?/gm, '').replace(/^```\n?/gm, '').replace(/```$/gm, '')
    .trim();

  // If AI returned a full document, use it directly
  if (clean.startsWith('<!DOCTYPE') || clean.startsWith('<html')) return clean;

  // Otherwise wrap it
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; }</style>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  ${clean}
</body>
</html>`;
}

export async function POST(req: Request) {
  const { description } = await req.json();
  const previewId = crypto.randomUUID();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const result = streamText({
        model: openrouter('minimax/minimax-m2.5'),
        system: SYSTEM_PROMPT,
        prompt: `Design a static UI for: ${description}`,
        temperature: 0.3,
        maxTokens: 900,
      });

      let full = '';
      for await (const chunk of result.textStream) {
        full += chunk;
        await writer.write(encoder.encode(chunk));
      }

      previewStore.set(previewId, wrapHtml(full));
      await writer.write(encoder.encode(`\n\n__PREVIEW_ID__${previewId}__END__`));
    } catch (err) {
      console.error('generate-ui-static error:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
