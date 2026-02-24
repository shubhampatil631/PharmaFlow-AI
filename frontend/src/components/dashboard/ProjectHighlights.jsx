import React from 'react';
import { Brain, Share2, ShieldCheck, Zap } from 'lucide-react';

export function ProjectHighlights() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Cognitive Core</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                    Powered by advanced LLMs (GPT-4o) and domain-specific embeddings (BioBERT) to understand complex medical literature.
                </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-sky-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Agentic Speed</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Worker agents parallelize research tasks, cutting analysis time from weeks to minutes.
                </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Safety First</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Dedicated "Safety Analyst" agents cross-reference adverse events and toxicological data automatically.
                </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Knowledge Graph</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Builds a connected web of molecules, diseases, and pathways for hidden relationship discovery.
                </p>
            </div>
        </div>
    );
}
