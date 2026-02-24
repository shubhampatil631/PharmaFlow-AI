import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Pause, Play, Copy, ArrowDown } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

export function StreamConsole({ logs, isStreaming }) {
    const bottomRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const handleCopy = () => {
        const text = logs.map(l => `[${l.timestamp}] ${l.level}: ${l.message}`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('Logs copied to clipboard');
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Terminal size={16} />
                    <span>Live Execution Logs</span>
                    {isStreaming && (
                        <span className="flex items-center gap-1.5 ml-2 text-xs text-green-500">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Live
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        title="Auto-scroll"
                        className={clsx("p-1.5 rounded hover:bg-slate-800", autoScroll && "text-blue-400 bg-slate-800")}
                    >
                        <ArrowDown size={16} />
                    </button>
                    <button
                        onClick={handleCopy}
                        title="Copy logs"
                        className="p-1.5 rounded hover:bg-slate-800"
                    >
                        <Copy size={16} />
                    </button>
                </div>
            </div>

            {/* Log Area */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                {logs.length === 0 && (
                    <div className="text-slate-600 italic">Waiting for logs...</div>
                )}
                {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-2">
                        <span className="text-slate-500 shrink-0 w-32 tabular-nums">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={clsx("shrink-0 w-12 font-bold",
                            log.level === 'ERROR' ? 'text-red-400' :
                                log.level === 'WARN' ? 'text-yellow-400' : 'text-blue-400'
                        )}>
                            [{log.level}]
                        </span>
                        <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
