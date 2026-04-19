import { tools, type ToolName } from "../schemas/tools";

export interface ToolCallFragment {
  name: ToolName;
  args: string;
  complete: boolean;
}

export function parseStreamChunk(
  delta: { tool_calls?: Array<{ index: number; id?: string; function: { name: string; arguments: string } }> },
  fragments: Map<number, ToolCallFragment>
): Array<{ name: ToolName; args: Record<string, unknown> }> | null {
  if (!delta.tool_calls) return null;

  const completed: Array<{ name: ToolName; args: Record<string, unknown> }> = [];

  for (const tc of delta.tool_calls) {
    const idx = tc.index;
    let fragment = fragments.get(idx);
    if (!fragment) {
      fragment = { name: tc.function.name as ToolName, args: "", complete: false };
      fragments.set(idx, fragment);
    }

    fragment.args += tc.function.arguments;

    try {
      const parsed = tools[fragment.name].safeParse(JSON.parse(fragment.args));
      if (parsed.success) {
        fragment.complete = true;
        completed.push({ name: fragment.name, args: parsed.data });
        fragments.delete(idx);
      }
    } catch { /* incomplete */ }
  }

  return completed.length > 0 ? completed : null;
}