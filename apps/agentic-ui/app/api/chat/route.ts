export const maxDuration = 30;

const SYSTEM_PROMPT = `You are an agentic UI builder. You help users build and refine UI interfaces through conversation.

When the user asks you to build something, call the appropriate tools to compose the UI.
When the user asks to modify what was already built, call the same tools again with updated parameters — the frontend will replace the previous output with whatever you return in this turn.
You can also reply with plain text to ask clarifying questions or explain what you built.

Always use realistic Vietnamese content (names, prices, labels, addresses).
Prefer calling multiple tools at once to compose a complete UI rather than one component at a time.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'showProductCard',
      description: 'Render a product card with image, price, rating, and add-to-cart button',
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
      description: 'Render a grid of metric/stats cards with optional trend indicators',
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
  const { messages } = await req.json();

  try {
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
          ...messages,
        ],
        tools: TOOLS,
        tool_choice: 'auto',  // AI can choose: tools, text, or both
        stream: false,
      }),
    });

    const data = await res.json() as any;
    const choice = data?.choices?.[0];
    const message = choice?.message;

    const text = message?.content ?? '';
    const toolCalls: { tool: string; args: Record<string, unknown> }[] = [];

    for (const tc of message?.tool_calls ?? []) {
      try {
        const args = JSON.parse(tc.function.arguments);
        toolCalls.push({ tool: tc.function.name, args });
      } catch { /* skip malformed */ }
    }

    console.log('[chat] text:', text.slice(0, 80), '| tools:', toolCalls.map(t => t.tool));

    return Response.json({ text, toolCalls });
  } catch (err) {
    console.error('[chat] error:', err);
    return Response.json({ text: 'Đã xảy ra lỗi. Vui lòng thử lại.', toolCalls: [] }, { status: 500 });
  }
}
