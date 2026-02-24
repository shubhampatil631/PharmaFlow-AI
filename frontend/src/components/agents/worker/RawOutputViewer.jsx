import React from 'react';

export function RawOutputViewer({ output }) {
    const isJson = typeof output === 'object';
    const displayContent = isJson ? JSON.stringify(output, null, 2) : output;

    return (
        <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto font-mono text-sm border border-slate-700">
            <pre>{displayContent}</pre>
        </div>
    );
}
