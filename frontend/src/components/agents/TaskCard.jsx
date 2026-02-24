import { Clock, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export function TaskCard({ task, onDelete }) {
    const { _id, name, molecule_name, status, created_at, progress = 0 } = task;

    const statusColors = {
        queued: 'text-slate-500 bg-slate-100',
        running: 'text-blue-600 bg-blue-100',
        completed: 'text-green-600 bg-green-100',
        failed: 'text-red-600 bg-red-100'
    };

    const statusIcons = {
        queued: <Clock size={16} />,
        running: <RefreshCw size={16} className="animate-spin" />,
        completed: <CheckCircle size={16} />,
        failed: <AlertCircle size={16} />
    };

    return (
        <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3", statusColors[status])}>
                        {statusIcons[status]}
                        {status.toUpperCase()}
                    </span>
                    <h3 className="font-semibold text-slate-900">{name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Target: <span className="font-medium text-slate-700">{molecule_name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete && onDelete(_id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Task"
                    >
                        <Trash2 size={18} />
                    </button>
                    <Link to={`/agents/tasks/${_id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <ExternalLink size={20} />
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={clsx("h-full rounded-full transition-all duration-500",
                                status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 pt-3 border-t">
                    <span>Started: {new Date(created_at).toLocaleDateString()}</span>
                    <span>ID: {_id}</span>
                </div>
            </div>
        </div>
    );
}
