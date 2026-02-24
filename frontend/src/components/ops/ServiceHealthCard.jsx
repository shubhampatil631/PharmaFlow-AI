import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, XCircle, Server } from 'lucide-react';

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'healthy': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'degraded': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'down': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <Server className="w-5 h-5 text-slate-400" />;
    }
};

const StatusBadge = ({ status }) => {
    const styles = {
        healthy: 'bg-green-50 text-green-700 ring-green-600/20',
        degraded: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        down: 'bg-red-50 text-red-700 ring-red-600/20'
    };

    return (
        <span className={clsx(
            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
            styles[status] || 'bg-slate-50 text-slate-600 ring-slate-500/10'
        )}>
            {status.toUpperCase()}
        </span>
    );
};

export function ServiceHealthCard({ service }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={service.status} />
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Uptime: <span className="text-slate-700">{service.uptime}</span></p>
                    <p className="text-xs text-slate-500">Version: <span className="text-slate-700">{service.version}</span></p>
                    {service.message && (
                        <p className="text-xs text-amber-600 mt-2 font-medium">{service.message}</p>
                    )}
                </div>
            </div>
            <StatusBadge status={service.status} />
        </div>
    );
}
