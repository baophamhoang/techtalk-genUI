import { z } from "zod";

const BaseField = z.object({
  label: z.string(),
  required: z.boolean().optional(),
});

export const FieldSchema = z.discriminatedUnion("type", [
  BaseField.extend({ type: z.literal("text"), pattern: z.string().optional(), minLength: z.number().optional(), maxLength: z.number().optional(), placeholder: z.string().optional() }),
  BaseField.extend({ type: z.literal("email"), placeholder: z.string().optional() }),
  BaseField.extend({ type: z.literal("number"), min: z.number().optional(), max: z.number().optional(), step: z.number().optional() }),
  BaseField.extend({ type: z.literal("date"), min: z.string().optional(), max: z.string().optional() }),
  BaseField.extend({ type: z.literal("select"), options: z.array(z.object({ value: z.string(), label: z.string() })), multi: z.boolean().optional() }),
  BaseField.extend({ type: z.literal("textarea"), rows: z.number().optional(), maxLength: z.number().optional() }),
  BaseField.extend({ type: z.literal("phone"), country: z.string().optional() }),
  BaseField.extend({ type: z.literal("checkbox") }),
  BaseField.extend({ type: z.literal("radio"), options: z.array(z.object({ value: z.string(), label: z.string() })) }),
  BaseField.extend({ type: z.literal("file"), accept: z.string().optional(), maxSize: z.number().optional() }),
]);

export type Field = z.infer<typeof FieldSchema>;

export const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string().default("Submit"),
  fields: z.array(z.object({ key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/), field: FieldSchema })),
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