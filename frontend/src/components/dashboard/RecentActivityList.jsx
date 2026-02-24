import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

function StatusIcon({ status }) {
    switch (status) {
        case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
        case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
        default: return <div className="w-2 h-2 rounded-full bg-slate-300" />;
    }
}

export function RecentActivityList({ activity }) {
    if (!activity) return null;

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <Link to="/agents/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {activity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <StatusIcon status={item.status} />
                            <div>
                                <div className="font-medium text-slate-900 text-sm">{item.molecule}</div>
                                <div className="text-xs text-slate-500">{item.task}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            {item.score && (
                                <div className="text-sm font-bold text-slate-700">
                                    {item.score}<span className="text-slate-400 text-xs font-normal">/100</span>
                                </div>
                            )}
                            <div className="text-xs text-slate-400 mt-0.5">
                                {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                <Link to="/search" className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors">
                    New Analysis
                </Link>
                <Link to="/ingestion/upload" className="block w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg text-center transition-colors">
                    Upload Dataset
                </Link>
            </div>
        </div>
    );
}
