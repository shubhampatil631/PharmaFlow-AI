import React from 'react';
import { Database, Search, Bot, TrendingUp, FileText, ArrowRight } from 'lucide-react';

const steps = [
    {
        id: 'ingestion',
        title: 'Data Ingestion',
        description: 'Syncs with PubMed, ClinicalTrials.gov, and Patents.',
        icon: Database,
        color: 'bg-indigo-100 text-indigo-600'
    },
    {
        id: 'search',
        title: 'Semantic Search',
        description: 'Identifies potential molecule candidates using NLP.',
        icon: Search,
        color: 'bg-sky-100 text-sky-600'
    },
    {
        id: 'agents',
        title: 'Agent Analysis',
        description: 'Multi-agent system researches efficacy and safety.',
        icon: Bot,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 'scoring',
        title: 'Scoring Engine',
        description: 'Calculates success probability and repurposing scores.',
        icon: TrendingUp,
        color: 'bg-emerald-100 text-emerald-600'
    },
    {
        id: 'reporting',
        title: 'Reporting',
        description: 'Generates comprehensive PDF/PPTX briefs for review.',
        icon: FileText,
        color: 'bg-violet-100 text-violet-600'
    }
];

export function WorkflowVisualizer() {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900">System Workflow</h3>
                <p className="text-slate-500">How PharmaFlow AI accelerates molecule repurposing.</p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-8 left-10 right-10 h-0.5 bg-slate-100 -z-0"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm ${step.color}`}>
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">{step.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed px-2">
                                {step.description}
                            </p>

                            {/* Mobile Arrow */}
                            {index < steps.length - 1 && (
                                <div className="lg:hidden mt-6 text-slate-300">
                                    <ArrowRight size={24} className="rotate-90 md:rotate-0" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center text-sm">
                <div className="flex gap-8">
                    <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-slate-600 font-medium">Auto-Scaling Agents</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-600 font-medium">Real-time Ingestion</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-slate-600 font-medium">Explainable AI</span>
                    </div>
                </div>
                <div className="text-slate-400 italic">
                    Powered by CrewAI & GPT-4o
                </div>
            </div>
        </div>
    );
}
