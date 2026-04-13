export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a UI composer. When given a UI request, you MUST call the available tools to build it.
Each tool renders a polished pre-built component. Compose multiple tools to build complete UIs.
Use realistic Vietnamese content (names, prices, labels, addresses).
You MUST only respond via tool calls — never write plain text responses.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'showProductCard',
      description: 'Render a product card with image, price, and add-to-cart button',
      parameters: {
        type: 'object',
        properties: {
          name:          { type: 'string', description: 'Product name in Vietnamese' },
          price:         { type: 'number', description: 'Price in VND' },
          originalPrice: { type: 'number', description: 'Original price before discount' },
          discount:      { type: 'number', description: 'Discount percentage (0-100)' },
          description:   { type: 'string', description: 'Short product description' },
          imageUrl:      { type: 'string', description: 'Product image URL (use a real Unsplash URL)' },
          inStock:       { type: 'boolean' },
          rating:        { type: 'number', description: 'Rating 1-5' },
        },
        required: ['name', 'price', 'description', 'imageUrl'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'showForm',
      description: 'Render an interactive form with various field types',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string', description: 'Form title' },
          submitLabel: { type: 'string', description: 'Submit button label' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label:       { type: 'string' },
                type:        { type: 'string', enum: ['text', 'email', 'number', 'select', 'textarea', 'date'] },
                placeholder: { type: 'string' },
                required:    { type: 'boolean' },
                options:     { type: 'array', items: { type: 'string' } },
              },
              required: ['label', 'type'],
            },
          },
        },
        required: ['title', 'fields'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'showStatsGrid',
      description: 'Render a grid of metric/stats cards',
      parameters: {
        type: 'object',
        properties: {
          stats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label:      { type: 'string', description: 'Metric label' },
                value:      { description: 'Metric value (string or number)' },
                unit:       { type: 'string', description: 'Unit suffix e.g. "đ", "%", "đơn"' },
                trend:      { type: 'string', enum: ['up', 'down', 'neutral'] },
                trendValue: { type: 'string', description: 'e.g. "+12% so với tuần trước"' },
              },
              required: ['label', 'value'],
            },
          },
        },
        required: ['stats'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'showDataTable',
      description: 'Render a data table with columns and rows',
      parameters: {
        type: 'object',
        properties: {
          title:   { type: 'string' },
          columns: { type: 'array', items: { type: 'string' }, description: 'Column header names' },
          rows:    { type: 'array', items: { type: 'array', items: { type: 'string' } }, description: 'Table rows' },
        },
        required: ['title', 'columns', 'rows'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'showAlertBanner',
      description: 'Render an alert or notification banner',
      parameters: {
        type: 'object',
        properties: {
          type:    { type: 'string', enum: ['success', 'warning', 'error', 'info'] },
          title:   { type: 'string' },
          message: { type: 'string' },
        },
        required: ['type', 'title', 'message'],
      },
    },
  },
];

export async function POST(req: Request) {
  const { description } = await req.json();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      // Call OpenRouter directly — no AI SDK (avoids schema serialization bugs)
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Build a UI for: ${description}` },
          ],
          tools: TOOLS,
          tool_choice: 'required',
          stream: false,
        }),
      });

      const data = await res.json() as any;
      const toolCalls = data?.choices?.[0]?.message?.tool_calls ?? [];
      console.log('[compose-ui]', toolCalls.length, 'tool calls');

      for (const tc of toolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments);
          const payload = JSON.stringify({ tool: tc.function.name, args });
          await writer.write(encoder.encode(`\n\n__TOOL__${payload}__ENDTOOL__`));
        } catch { /* skip malformed */ }
      }

      await writer.write(encoder.encode('\n\n__DONE__'));
    } catch (err) {
      console.error('compose-ui error:', err);
      await writer.write(encoder.encode('\n\n__DONE__'));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
