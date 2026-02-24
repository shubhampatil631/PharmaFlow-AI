import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Terminal } from 'lucide-react';

export function LogViewer({ logs, onSearch, isLoading }) {
    const [filter, setFilter] = useState('');

    const handleSearch = (e) => {
        setFilter(e.target.value);
        onSearch(e.target.value);
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'ERROR': return 'text-red-500';
            case 'WARN': return 'text-amber-500';
            case 'INFO': return 'text-blue-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="bg-slate-900 rounded-xl shadow-sm text-slate-300 overflow-hidden border border-slate-800 font-mono text-sm h-[600px] flex flex-col">
            {/* Toolbar */}
            <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-200">System Logs</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filter}
                            onChange={handleSearch}
                            className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-600 text-xs w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Log Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {isLoading ? (
                    <div className="text-slate-500 italic">Streaming logs...</div>
                ) : logs?.length > 0 ? (
                    logs.map(log => (
                        <div key={log.id} className="flex gap-4 hover:bg-slate-800/50 p-1 rounded">
                            <span className="text-slate-500 shrink-0 w-36">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`font-bold shrink-0 w-16 ${getLevelColor(log.level)}`}>{log.level}</span>
                            <span className="text-slate-400 shrink-0 w-24">[{log.source}]</span>
                            <span className="text-slate-300 break-all">{log.message}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-slate-500 italic">No logs found matching filter</div>
                )}
            </div>
        </div>
    );
}
