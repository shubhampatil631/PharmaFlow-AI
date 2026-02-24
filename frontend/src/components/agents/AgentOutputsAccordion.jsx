import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Download } from 'lucide-react';
import clsx from 'clsx';

export function AgentOutputsAccordion({ outputs }) {
    // outputs: array of { agent, title, content, type }
    const [expanded, setExpanded] = useState({});

    const toggle = (idx) => {
        setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="space-y-3">
            {outputs.map((out, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <button
                        onClick={() => toggle(idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                <FileText size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-900">{out.title}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">{out.agent}</div>
                            </div>
                        </div>
                        {expanded[idx] ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                    </button>

                    {expanded[idx] && (
                        <div className="p-4 border-t bg-slate-50/50">
                            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-mono text-xs bg-white p-3 border rounded">
                                {out.content}
                            </div>
                            <div className="flex justify-end mt-3">
                                <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600">
                                    <Download size={14} /> Download Output
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {outputs.length === 0 && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                    No outputs generated yet.
                </div>
            )}
        </div>
    );
}
