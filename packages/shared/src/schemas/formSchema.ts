import { z } from "zod";

export type Field =
  | { type: "text"; label: string; required?: boolean; pattern?: string; minLength?: number; maxLength?: number; placeholder?: string }
  | { type: "email"; label: string; required?: boolean; placeholder?: string }
  | { type: "number"; label: string; required?: boolean; min?: number; max?: number; step?: number }
  | { type: "date"; label: string; required?: boolean; min?: string; max?: string }
  | { type: "select"; label: string; required?: boolean; options: { value: string; label: string }[]; multi?: boolean }
  | { type: "textarea"; label: string; required?: boolean; rows?: number; maxLength?: number }
  | { type: "phone"; label: string; required?: boolean; country?: string }
  | { type: "checkbox"; label: string; required?: boolean }
  | { type: "radio"; label: string; required?: boolean; options: { value: string; label: string }[] }
  | { type: "file"; label: string; required?: boolean; accept?: string; maxSize?: number };

export const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string().default("Submit"),
  fields: z.array(z.object({ key: z.string(), field: Field })),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

export function buildPayloadValidator(schema: FormSchemaType) {
  const shape: Record<string, unknown> = {};
  for (const { key, field } of schema.fields) {
    const isRequired = field.required !== false;
    switch (field.type) {
      case "text":
      case "textarea":
      case "phone":
        shape[key] = isRequired ? z.string() : z.string().optional();
        if (field.minLength) (shape[key] as z.ZodType).checks?.push({ kind: "min", value: field.minLength, message: `Tối thiểu ${field.minLength} ký tự` });
        if (field.maxLength) (shape[key] as z.ZodType).checks?.push({ kind: "max", value: field.maxLength, message: `Tối đa ${field.maxLength} ký tự` });
        break;
      case "email":
        shape[key] = isRequired ? z.string().email() : z.string().email().optional();
        break;
      case "number":
        shape[key] = isRequired ? z.number() : z.number().optional();
        if (field.min !== undefined) (shape[key] as z.ZodType).checks?.push({ kind: "min", value: field.min, message: `Giá trị tối thiểu ${field.min}` });
        if (field.max !== undefined) (shape[key] as z.ZodType).checks?.push({ kind: "max", value: field.max, message: `Giá trị tối đa ${field.max}` });
        break;
      case "date":
        shape[key] = isRequired ? z.string() : z.string().optional();
        break;
      case "select":
        if (field.multi) {
          shape[key] = isRequired ? z.array(z.string()) : z.array(z.string()).optional();
        } else {
          const vals = field.options.map(o => o.value);
          shape[key] = isRequired ? z.enum(vals as [string, ...string[]]) : z.enum(vals as [string, ...string[]]).optional();
        }
        break;
      case "checkbox":
        shape[key] = isRequired ? z.boolean() : z.boolean().optional();
        break;
      case "radio":
        const vals = field.options.map(o => o.value);
        shape[key] = isRequired ? z.enum(vals as [string, ...string[]]) : z.enum(vals as [string, ...string[]]).optional();
        break;
      case "file":
        shape[key] = isRequired ? z.any() : z.any().optional();
        break;
    }
  }
  return z.object(shape);
}