import { defineRegistry } from "@json-render/react";

// Simple registry for demo purposes
export const genUIRegistry = defineRegistry(null as any, {
  components: {
    string: { type: "string" },
    number: { type: "number" },
    boolean: { type: "boolean" },
    array: { type: "array" },
    object: { type: "object" },
  },
});
