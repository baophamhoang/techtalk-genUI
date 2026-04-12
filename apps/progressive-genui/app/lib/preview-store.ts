const store = new Map<string, string>();

export const previewStore = {
  set(id: string, html: string) {
    store.set(id, html);
    if (store.size > 50) {
      const first = store.keys().next().value;
      if (first) store.delete(first);
    }
  },
  get(id: string): string | undefined {
    return store.get(id);
  },
};
