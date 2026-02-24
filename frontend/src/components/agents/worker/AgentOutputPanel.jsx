import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { RawOutputViewer } from './RawOutputViewer';
import { StructuredOutput } from './StructuredOutput';
import { EvidenceList } from './EvidenceList';
import { FeedbackButtons } from './FeedbackButtons';

export function AgentOutputPanel({ agentName, data, isOpen, onToggle }) {
    const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'raw'
    const { status, confidence, runTime, structured_output, raw_output, references } = data;

    const getStatusColor = (s) => {
        switch (s) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'running': return 'text-blue-600 bg-blue-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getStatusIcon = (s) => {
        switch (s) {
            case 'completed': return <CheckCircle2 className="w-5 h-5" />;
            case 'failed': return <AlertCircle className="w-5 h-5" />;
            case 'running': return <Clock className="w-5 h-5 animate-pulse" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-full", getStatusColor(status))}>
                        {getStatusIcon(status)}
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-slate-900">{agentName}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>Status: <span className="capitalize font-medium">{status}</span></span>
                            <span>•</span>
                            <span>Confidence: <span className="font-medium text-slate-700">{(confidence * 100).toFixed(0)}%</span></span>
                            {runTime && (
                                <>
                                    <span>•</span>
                                    <span>Time: {runTime}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
                        <button
                            onClick={() => setViewMode('structured')}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                                viewMode === 'structured' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Structured Output
                        </button>
                        <button
                            onClick={() => setViewMode('raw')}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                                viewMode === 'raw' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Raw JSON
                        </button>
                    </div>

                    <div className="space-y-6">
                        {viewMode === 'structured' ? (
                            <StructuredOutput data={structured_output} />
                        ) : (
                            <RawOutputViewer output={raw_output || structured_output} />
                        )}

                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-xs uppercase tracking-wide">Evidence & References</span>
                            </h4>
                            <EvidenceList evidence={references} />
                        </div>

                        <FeedbackButtons
                            onAccept={() => console.log('Accepted', agentName)}
                            onFlag={() => console.log('Flagged', agentName)}
                            onAddNote={() => console.log('Note added', agentName)}
                            status={status}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
