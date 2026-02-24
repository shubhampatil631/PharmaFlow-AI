import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

const RadialProgress = ({ score, size = 180, strokeWidth = 15, color = "text-blue-600", label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="stroke-slate-200 fill-none"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={`fill-none transition-all duration-1000 ease-out ${color}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">{score}</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">{label}</span>
            </div>
        </div>
    );
};

export function ScoreOverview({ score, risk, onRecompute, onExport }) {
    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-500 stroke-current";
        if (s >= 60) return "text-blue-500 stroke-current";
        return "text-amber-500 stroke-current";
    };

    const getRiskColor = (s) => {
        if (s <= 30) return "text-green-500 stroke-current";
        if (s <= 60) return "text-amber-500 stroke-current";
        return "text-red-500 stroke-current";
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Decision Matrix</h2>
                <p className="text-slate-500 mb-6 max-w-lg">
                    Current analysis indicates a high probability of success for repurposing in the target indication. Risk factors are minimal.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onRecompute}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Recompute
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-12">
                <RadialProgress
                    score={score}
                    label="Success Prob."
                    color={getScoreColor(score)}
                />
                <div className="h-24 w-px bg-slate-200" />
                <RadialProgress
                    score={risk}
                    label="Risk Score"
                    color={getRiskColor(risk)}
                    size={140}
                />
            </div>
        </div>
    );
}
