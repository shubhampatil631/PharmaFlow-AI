import React from 'react';

export function StructuredOutput({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return <p className="text-slate-500 italic text-sm">No structured data available.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-sm text-slate-900">
                        {Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                                {value.map((item, idx) => (
                                    <li key={idx}>
                                        {typeof item === 'object' ? JSON.stringify(item) : item}
                                    </li>
                                ))}
                            </ul>
                        ) : typeof value === 'object' ? (
                            <pre className="whitespace-pre-wrap text-xs font-mono">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                            <p>{String(value)}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
