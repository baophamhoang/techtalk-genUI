import { z } from "zod";

export const addKpiSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  delta: z.string().optional(),
});

export const addLineChartSchema = z.object({
  title: z.string(),
  series: z.array(z.object({
    name: z.string(),
    data: z.array(z.number()),
  })),
});

export const addBarChartSchema = z.object({
  title: z.string(),
  categories: z.array(z.string()),
  values: z.array(z.number()),
});

export const addTableSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const tools = {
  add_kpi: addKpiSchema,
  add_line_chart: addLineChartSchema,
  add_bar_chart: addBarChartSchema,
  add_table: addTableSchema,
} as const;

export type ToolName = keyof typeof tools;