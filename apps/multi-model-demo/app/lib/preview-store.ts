// Simple in-memory store for generated preview HTML.
// Module-level singleton — persists across requests in the same server process.
const store = new Map<string, string>();

export const previewStore = {
  set(id: string, html: string) {
    store.set(id, html);
    // Keep last 50 previews to avoid unbounded growth
    if (store.size > 50) {
      const firstKey = store.keys().next().value;
      if (firstKey) store.delete(firstKey);
    }
  },
  get(id: string): string | undefined {
    return store.get(id);
  },
};
