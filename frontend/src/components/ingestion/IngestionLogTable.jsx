import React from 'react';
import { DataTable } from '../ui/DataTable';

export function IngestionLogTable({ logs }) {
    const columns = [
        { header: 'Job ID', accessor: '_id', className: 'font-mono text-xs text-slate-500' },
        { header: 'Connector', accessor: 'connector_name' },
        {
            header: 'Status',
            accessor: (item) => (
                <span className={`text-xs font-medium ${item.status === 'success' ? 'text-green-600' :
                    item.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {item.status?.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Started',
            accessor: (item) => new Date(item.start_time).toLocaleString()
        },
        {
            header: 'Duration',
            accessor: (item) => item.duration ? `${item.duration}s` : '-'
        },
        {
            header: 'Records',
            accessor: 'records_processed'
        }
    ];

    // Assuming logs is simple array for now, client-side pagination or just limit 5
    // Wrapping in simple structure for DataTable if needed or just simple table
    // Let's use DataTable for consistency but with dummy pagination if logs is just an array

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-slate-900">Ingestion Logs</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs?.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50/50">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-6 py-3">
                                        {typeof col.accessor === 'function' ? col.accessor(log) : log[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {!logs?.length && (
                            <tr><td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">No logs available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
