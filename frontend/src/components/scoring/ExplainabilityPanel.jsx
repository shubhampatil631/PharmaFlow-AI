import React from 'react';
import { Bot } from 'lucide-react';

export function ExplainabilityPanel({ text }) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl shadow-sm text-white">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg">AI Analysis</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
                {text}
            </p>
        </div>
    );
}
