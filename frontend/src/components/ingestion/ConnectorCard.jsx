import React from 'react';
import { Play, Clock, AlertCircle, CheckCircle, Database } from 'lucide-react';
import clsx from 'clsx';

export function ConnectorCard({ connector, onRun }) {
    const { name, status, lastRun, records, _id } = connector;

    const isRunning = status === 'running';

    return (
        <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900">{name}</h3>
                        <p className="text-sm text-slate-500">Source Connector</p>
                    </div>
                </div>
                {status === 'running' ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Syncing...
                    </span>
                ) : status === 'error' ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle size={12} />
                        Error
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Active
                    </span>
                )}
            </div>

            <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                        <Clock size={16} /> Last successful run
                    </span>
                    <span className="font-medium text-slate-700">
                        {lastRun ? new Date(lastRun).toLocaleDateString() : 'Never'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Records Ingested</span>
                    <span className="font-medium text-slate-700">{records?.toLocaleString() || 0}</span>
                </div>
            </div>

            <button
                onClick={() => onRun(_id)}
                disabled={isRunning}
                className={clsx(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors",
                    isRunning
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                )}
            >
                <Play size={16} className={clsx(isRunning && "animate-spin")} />
                {isRunning ? 'Syncing...' : 'Run Sync Now'}
            </button>
        </div>
    );
}
