"use client";

interface Props {
  title: string;
  columns: string[];
  rows: string[][];
}

export function DataTable({ title, columns, rows }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-auto">
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col, i) => (
              <th key={i} className="text-left py-2 px-3 font-bold text-slate-600">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}