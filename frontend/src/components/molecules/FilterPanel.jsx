import React from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';

export function FilterPanel({ isOpen, onClose, filters, onFilterChange }) {
    const statusOptions = ['New', 'In Evaluation', 'Approved', 'Rejected'];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div className={clsx(
                "fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Filter size={20} /> Filters
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                    <div>
                        <h4 className="font-medium mb-3 text-sm text-slate-700">Status</h4>
                        <div className="space-y-2">
                            {statusOptions.map(status => (
                                <label key={status} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={filters.status?.includes(status) || false}
                                        onChange={(e) => {
                                            const current = filters.status || [];
                                            const next = e.target.checked
                                                ? [...current, status]
                                                : current.filter(s => s !== status);
                                            onFilterChange('status', next);
                                        }}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    {status}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 flex gap-3">
                    <button
                        onClick={() => onFilterChange('reset', {})}
                        className="flex-1 py-2 px-4 border rounded hover:bg-white transition-colors text-sm font-medium"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </>
    );
}
