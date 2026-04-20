"use client";

import { useState } from "react";

export function InlineForm({ title, description, submitLabel, fields }: any) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Usually this would dispatch a chat message mimicking user action
  };

  if (submitted) {
    return (
      <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 shadow-sm my-4">
        ✅ Đã gửi biểu mẫu: {title}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 my-4">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}

      {fields.map(({ key, field }: any) => (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === "text" && (
            <input type="text" onChange={e => handleChange(key, e.target.value)} required={field.required}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          )}
          {field.type === "number" && (
            <input type="number" onChange={e => handleChange(key, Number(e.target.value))} required={field.required}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          )}
          {field.type === "date" && (
            <input type="date" onChange={e => handleChange(key, e.target.value)} required={field.required}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          )}
          {field.type === "textarea" && (
            <textarea onChange={e => handleChange(key, e.target.value)} required={field.required} rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          )}
          {field.type === "select" && (
            <select onChange={e => handleChange(key, e.target.value)} required={field.required}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Chọn...</option>
              {field.options?.map((opt: any) => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button type="submit" className="w-full bg-violet-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-violet-700 transition-colors text-sm">
        {submitLabel}
      </button>
    </form>
  );
}
