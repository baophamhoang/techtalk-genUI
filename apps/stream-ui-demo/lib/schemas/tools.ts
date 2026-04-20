import { z } from "zod";

export const chartSchema = z.object({
  title: z.string(),
  kind: z.enum(["line", "bar"]),
  series: z.array(z.object({
    name: z.string(),
    data: z.array(z.number())
  })),
  categories: z.array(z.string()).optional()
});

export const cardListSchema = z.object({
  title: z.string(),
  cards: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    price: z.string().optional(),
    rating: z.number().optional()
  }))
});

export const formSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string(),
  fields: z.array(z.object({
    key: z.string(),
    field: z.object({
      type: z.enum(["text", "email", "number", "date", "select", "textarea", "phone", "checkbox", "file"]),
      label: z.string(),
      required: z.boolean().optional(),
      options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional()
    })
  }))
});

export const kpiSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  delta: z.string().optional()
});

export const tableSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.record(z.union([z.string(), z.number()])))
});
