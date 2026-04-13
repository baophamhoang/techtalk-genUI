import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { previewStore } from '../../lib/preview-store';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  baseURL: 'https://openrouter.ai/api/v1',
});

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior web developer. Generate a complete, interactive HTML page.

RULES:
1. Full <!DOCTYPE html> document
2. Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. All interactivity in a single <script> tag at the very end of <body>, just before </body>
4. Vanilla JS only — querySelector, addEventListener, classList, textContent, etc.
5. Vietnamese placeholder content (names, prices, labels, addresses)
6. Clean, modern layout — as if from a real product
7. Genuinely interactive: counters work, toggles toggle, tabs switch, forms update state
8. Aim for 80-110 lines total
9. Output ONLY the HTML document — no markdown, no explanation`;

// Matches the inline <script> block at the bottom (not CDN scripts which have src="...")
// Looks for <script> with optional whitespace before it, followed by a newline
const SCRIPT_DELIMITER_RE = /\n[ \t]*<script>[ \t]*\n/;

function closeHtmlDoc(partial: string): string {
  // Ensure the static template is a valid closed document
  let doc = partial.trimEnd();
  if (!doc.includes('</body>')) doc += '\n</body>';
  if (!doc.includes('</html>')) doc += '\n</html>';
  return doc;
}

function wrapHtml(rawHtml: string): string {
  const clean = rawHtml
    .replace(/^```html\n?/gm, '').replace(/^```\n?/gm, '').replace(/```$/gm, '')
    .trim();
  if (clean.startsWith('<!DOCTYPE') || clean.startsWith('<html')) return clean;
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

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const result = streamText({
        model: openrouter('minimax/minimax-m2.7'),
        system: SYSTEM_PROMPT,
        prompt: `Generate an interactive UI for: ${description}`,
        temperature: 0.4,
        maxTokens: 1400,
      });

      let accumulated = '';
      let templateSaved = false;

      for await (const chunk of result.textStream) {
        accumulated += chunk;
        await writer.write(encoder.encode(chunk));

        // Detect the inline <script> block the moment it appears
        if (!templateSaved) {
          const match = SCRIPT_DELIMITER_RE.exec(accumulated);
          if (match) {
            templateSaved = true;
            const htmlPart = accumulated.substring(0, match.index);
            const templateId = crypto.randomUUID();
            previewStore.set(templateId, closeHtmlDoc(wrapHtml(htmlPart)));
            // Inject template-ready signal into the stream
            await writer.write(encoder.encode(`\n\n__TEMPLATE_ID__${templateId}__`));
          }
        }
      }

      // Save the full document (HTML + JS)
      const previewId = crypto.randomUUID();
      previewStore.set(previewId, wrapHtml(accumulated));
      await writer.write(encoder.encode(`\n\n__PREVIEW_ID__${previewId}__END__`));
    } catch (err) {
      console.error('generate-progressive error:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
