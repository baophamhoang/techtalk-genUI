import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  },
  baseURL: 'https://openrouter.ai/api/v1',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { industry, workflow } = await req.json();

  const result = streamText({
    model: openrouter('minimax/minimax-m2.5'),
    system: `You are a UI architect. Always respond with ONLY valid JSON, no markdown, no explanation.`,
    prompt: `Generate a form schema for a ${industry} business application, workflow: "${workflow}".

Return ONLY this exact JSON structure, no other text:
{
  "fields": [
    {
      "key": "camelCaseKey",
      "field": {
        "type": "string",
        "title": "Vietnamese label",
        "placeholder": "optional hint"
      }
    },
    {
      "key": "statusField",
      "field": {
        "type": "string",
        "title": "Vietnamese label",
        "enum": ["val1", "val2", "val3"],
        "enumNames": ["Tên 1", "Tên 2", "Tên 3"]
      }
    },
    {
      "key": "checkboxField",
      "field": {
        "type": "boolean",
        "title": "Vietnamese checkbox label"
      }
    }
  ],
  "required": ["key1", "key2"],
  "actionButtons": [
    {
      "label": "Vietnamese button text",
      "variant": "primary",
      "action": "snake_case_action"
    }
  ]
}

Rules:
- Use Vietnamese for ALL titles, labels, button text, placeholders
- Generate 4-6 fields appropriate for ${industry} + ${workflow}
- At least one field should use enum (dropdown)
- 1-2 action buttons matching the workflow intent
- Return ONLY the JSON, nothing else`,
  });

  return result.toTextStreamResponse();
}
