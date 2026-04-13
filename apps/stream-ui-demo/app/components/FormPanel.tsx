import { useState } from "react";
import { CheckCircle } from "lucide-react";

export interface FormField {
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormPanelProps {
  title: string;
  fields: FormField[];
  submitLabel?: string;
}

export function FormPanel({ title, fields = [], submitLabel = "Gửi" }: FormPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const set = (key: string, val: string) => setValues(v => ({ ...v, [key]: val }));

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-3">
        <CheckCircle size={48} className="text-green-500" />
        <h3 className="text-lg font-bold text-gray-800">Đã gửi thành công!</h3>
        <p className="text-sm text-gray-500">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-5">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === "select" ? (
              <select
                value={values[field.label] ?? ""}
                onChange={e => set(field.label, e.target.value)}
                required={field.required}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="">-- Chọn --</option>
                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={values[field.label] ?? ""}
                onChange={e => set(field.label, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
              />
            ) : (
              <input
                type={field.type}
                value={values[field.label] ?? ""}
                onChange={e => set(field.label, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all mt-2"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
