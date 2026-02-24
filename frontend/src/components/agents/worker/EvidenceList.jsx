import React from 'react';
import { ExternalLink, FileText, Link as LinkIcon } from 'lucide-react';

export function EvidenceList({ evidence }) {
    if (!evidence || evidence.length === 0) {
        return <p className="text-slate-500 italic text-sm">No evidence provided.</p>;
    }

    return (
        <div className="space-y-2">
            {evidence.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md hover:bg-slate-50 transition-colors bg-white">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            {item.title || item.url}
                        </p>
                        {item.snippet && (
                            <p className="text-xs text-slate-500 truncate">{item.snippet}</p>
                        )}
                    </div>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="Open Link"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            ))}
        </div>
    );
}
