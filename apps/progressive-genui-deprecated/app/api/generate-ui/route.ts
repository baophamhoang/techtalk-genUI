import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { previewStore } from '../../lib/preview-store';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  baseURL: 'https://openrouter.ai/api/v1',
});

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert React developer. Generate a single self-contained React component.

RULES:
1. Output ONLY raw JSX code — no markdown fences, no explanations, no import statements
2. Component MUST be named "App" with export default
3. Use Tailwind classes for styling (available via CDN)
4. Only React hooks (useState, useEffect) — no external libraries
5. Make it interactive: buttons with onClick, forms with state
6. Do NOT include any import or export statements — start with: export default function App() {
7. CRITICAL: JS number literals must be valid integers — 7990000 NOT 7.990.000
8. Keep it concise — aim for 60-100 lines

Example:
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold">{count}</h1>
      <button onClick={() => setCount(c => c + 1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Tăng
      </button>
    </div>
  );
}`;

function sanitizeCode(code: string): string {
  return code
    .replace(/\b(\d{1,3})\.(\d{3})\.(\d{3})\b/g, '$1$2$3')
    .replace(/\b(\d{1,3})\.(\d{3})\b(?=\s*[,}\])])/g, '$1$2')
    .replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '')
    .trim();
}

function buildReactHtml(code: string): string {
  const clean = sanitizeCode(code).replace(/^export\s+default\s+function\s+/m, 'function ');
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; }
    #loading { display:flex; align-items:center; justify-content:center; height:100vh;
      font-family:sans-serif; color:#94a3b8; font-size:13px; gap:8px; }
    #loading::before { content:''; width:16px; height:16px; border:2px solid #94a3b8;
      border-top-color:transparent; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  </style>
</head>
<body>
  <div id="root"><div id="loading">Rendering...</div></div>
  <script type="text/babel" data-presets="react">
    const { useState, useEffect, useRef } = React;
    ${clean}
    try {
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div style="padding:1.5rem;font-family:monospace;color:#ef4444;font-size:12px">' +
        '<strong>Render error:</strong><br/>' + e.message + '</div>';
    }
  </script>
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
        prompt: `Generate a React component for: ${description}`,
        temperature: 0.7,
      });

      let fullCode = '';
      for await (const chunk of result.textStream) {
        fullCode += chunk;
        await writer.write(encoder.encode(chunk));
      }

      previewStore.set(previewId, buildReactHtml(fullCode));
      await writer.write(encoder.encode(`\n\n__PREVIEW_ID__${previewId}__END__`));
    } catch (err) {
      console.error('generate-ui error:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
