import React from 'react';
import { Info } from 'lucide-react';
import clsx from 'clsx';

export function ScoreComponentCard({ component, onChange }) {
    const { name, value, weight, description } = component;

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {name}
                        <div className="group relative">
                            <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {description}
                            </div>
                        </div>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Raw Score: <span className="font-medium text-slate-700">{value}/100</span></p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">{((value * weight) / 100).toFixed(1)}</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Contribution</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Weight Impact</span>
                    <span className="font-medium text-blue-600">{weight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={weight}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>
        </div>
    );
}

export function ScoreBreakdown({ components, onWeightChange }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {components.map(comp => (
                <ScoreComponentCard
                    key={comp.id}
                    component={comp}
                    onChange={(newWeight) => onWeightChange(comp.id, newWeight)}
                />
            ))}
        </div>
    );
}
