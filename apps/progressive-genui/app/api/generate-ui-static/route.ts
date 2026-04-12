import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { previewStore } from '../../lib/preview-store';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  baseURL: 'https://openrouter.ai/api/v1',
});

export const maxDuration = 30;

// Phase 1: pure HTML + Tailwind only — no JavaScript at all.
// Renders without Babel, gives the user immediate visual feedback in ~2s.
const SYSTEM_PROMPT = `You are a UI designer. Output ONLY a raw HTML snippet using Tailwind CSS classes.

RULES:
1. Output ONLY the inner body HTML — no <!DOCTYPE>, no <html>, no <head>, no <body> tags
2. Use Tailwind classes for all styling (Tailwind CDN is loaded)
3. ZERO JavaScript — no onclick, no event handlers, no <script> tags
4. Make it visually polished with realistic Vietnamese placeholder content
5. Keep it under 60 lines`;

function buildStaticHtml(snippet: string): string {
  const clean = snippet
    .replace(/^```html\n?/gm, '').replace(/^```\n?/gm, '').replace(/```$/gm, '')
    .trim();
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; }</style>
</head>
<body class="bg-gray-50 p-4 min-h-screen">
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
        prompt: `Create a static HTML layout for: ${description}`,
        temperature: 0.4,
        maxTokens: 600,
      });

      let fullSnippet = '';
      for await (const chunk of result.textStream) {
        fullSnippet += chunk;
        await writer.write(encoder.encode(chunk));
      }

      previewStore.set(previewId, buildStaticHtml(fullSnippet));
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
