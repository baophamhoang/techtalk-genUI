"use client";

import { useState } from "react";
import { FormSchemaType } from "../schemas/formSchema";

interface Props {
  schema: FormSchemaType;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function FormRenderer({ schema, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{schema.title}</h2>
      {schema.description && <p className="text-sm text-slate-500">{schema.description}</p>}

      {schema.fields.map(({ key, field }) => (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={field.placeholder}
              pattern={field.pattern}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "email" && (
            <input
              type="email"
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={(values[key] as number) ?? ""}
              onChange={e => handleChange(key, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "date" && (
            <input
              type="date"
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              min={field.min}
              max={field.max}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              rows={field.rows ?? 3}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "select" && !field.multi && (
            <select
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Chọn...</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {field.type === "select" && field.multi && (
            <select
              multiple
              value={(values[key] as string[]) ?? []}
              onChange={e => handleChange(key, Array.from(e.target.selectedOptions, o => o.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {field.type === "checkbox" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(values[key] as boolean) ?? false}
                onChange={e => handleChange(key, e.target.checked)}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm text-slate-600">{field.label}</span>
            </label>
          )}

          {field.type === "radio" && (
            <div className="flex gap-4 flex-wrap">
              {field.options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={key}
                    value={opt.value}
                    checked={values[key] === opt.value}
                    onChange={() => handleChange(key, opt.value)}
                    className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-600">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === "phone" && (
            <input
              type="tel"
              value={(values[key] as string) ?? ""}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={field.placeholder ?? "+84..."}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          )}

          {field.type === "file" && (
            <input
              type="file"
              accept={field.accept}
              onChange={e => handleChange(key, e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:font-bold hover:file:bg-violet-700"
            />
          )}

          {errors[key] && (
            <p className="text-xs text-red-500">{errors[key]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-violet-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-violet-700 transition-colors"
      >
        {schema.submitLabel}
      </button>
    </form>
  );
}