import React from 'react';
import { Sparkles, Tag } from 'lucide-react';

export function NlpSummaryCard({ summary }) {
    if (!summary) return null;

    const { text, entities } = summary;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 mb-8">
            <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">AI Synthesis</h3>
                    <p className="text-slate-700 leading-relaxed text-sm md:text-base">{text}</p>
                </div>
            </div>

            {entities && entities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-8">
                    {entities.map((entity, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-indigo-100 text-xs font-medium text-indigo-700 shadow-sm">
                            <Tag className="w-3 h-3 text-indigo-400" />
                            {entity.text} <span className="opacity-50 text-[10px] uppercase">({entity.type})</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
