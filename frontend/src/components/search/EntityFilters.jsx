import React from 'react';
import { Tag } from 'lucide-react';

export function EntityFilters({ selected, onChange }) {
    const filters = [
        { id: 'disease', label: 'Disease/Indication', count: 12 },
        { id: 'molecule', label: 'Molecule/Drug', count: 8 },
        { id: 'gene', label: 'Gene/Target', count: 5 },
        { id: 'pathway', label: 'Pathway', count: 3 }
    ];

    const toggleFilter = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(f => f !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-32">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" /> Filter Results
                </h3>
                {selected.length > 0 && (
                    <button
                        onClick={() => onChange([])}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {filters.map(filter => {
                    const isSelected = selected.includes(filter.id);
                    return (
                        <label
                            key={filter.id}
                            className={`flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default label click behavior which might be causing issues
                                toggleFilter(filter.id);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-sm tracking-wide ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>{filter.label}</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                {filter.count}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
