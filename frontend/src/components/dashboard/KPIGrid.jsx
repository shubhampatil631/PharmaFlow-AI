import React from 'react';
import { Activity, Clock, Database, TrendingUp } from 'lucide-react';

const icons = {
    running: Activity,
    time: Clock,
    molecules: Database,
    score: TrendingUp
};

const colors = {
    running: 'text-blue-600 bg-blue-50',
    time: 'text-amber-600 bg-amber-50',
    molecules: 'text-purple-600 bg-purple-50',
    score: 'text-green-600 bg-green-50'
};

export function KPIGrid({ kpis }) {
    if (!kpis) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi) => {
                const Icon = icons[kpi.id] || Activity;
                const colorClass = colors[kpi.id] || 'text-slate-600 bg-slate-50';

                return (
                    <div key={kpi.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${colorClass}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${kpi.trend === 'up' && kpi.id !== 'time' ? 'bg-green-100 text-green-700' :
                                    kpi.trend === 'down' && kpi.id === 'time' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {kpi.change}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{kpi.label}</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                    </div>
                );
            })}
        </div>
    );
}
