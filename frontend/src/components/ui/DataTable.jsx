import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export function DataTable({
    data,
    columns,
    total,
    page,
    pageSize,
    onPageChange,
    isLoading
}) {
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={clsx("px-4 py-3", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIdx) => (
                                <tr key={item._id || item.id || rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={clsx("px-4 py-3 align-middle", col.className)}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : item[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-slate-500">
                <div>
                    Showing {Math.min(total, (page - 1) * pageSize + 1)} to {Math.min(total, page * pageSize)} of {total} results
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-1 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span>Page {page} of {totalPages || 1}</span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="p-1 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
