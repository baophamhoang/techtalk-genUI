export interface DataTableProps {
  title: string;
  columns: string[];
  rows: string[][];
}

export function DataTable({ title, columns = [], rows = [] }: DataTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col, i) => (
                <th key={i} className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-6 py-3.5 text-gray-700 border-t border-gray-50">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400">{rows.length} bản ghi</p>
      </div>
    </div>
  );
}
