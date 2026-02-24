import React, { useState } from 'react';
import { X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { reportService } from '../../services/reportService';
import { toast } from 'sonner';

export function ReportGeneratorModal({ isOpen, onClose, taskId }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [options, setOptions] = useState({
        includeAgentOutputs: true,
        includeRawLogs: false,
        includeAttachments: true,
        summaryTone: 'detailed'
    });

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(0);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 200);

        try {
            await reportService.generateReport(taskId, options);
            setProgress(100);
            clearInterval(interval);
            setTimeout(() => {
                toast.success('Report generated successfully');
                onClose();
            }, 500);
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
            clearInterval(interval);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Generate Report
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Content Options */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 block">Content</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeAgentOutputs}
                                    onChange={e => setOptions({ ...options, includeAgentOutputs: e.target.checked })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600">Include Agent Outputs</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeRawLogs}
                                    onChange={e => setOptions({ ...options, includeRawLogs: e.target.checked })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600">Include Raw Logs</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeAttachments}
                                    onChange={e => setOptions({ ...options, includeAttachments: e.target.checked })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600">Include Attachments</span>
                            </label>
                        </div>
                    </div>

                    {/* Tone Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 block">Executive Summary Tone</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setOptions({ ...options, summaryTone: 'concise' })}
                                className={clsx(
                                    "px-3 py-2 text-sm rounded-lg border transition-all text-center",
                                    options.summaryTone === 'concise'
                                        ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                )}
                            >
                                Concise
                            </button>
                            <button
                                onClick={() => setOptions({ ...options, summaryTone: 'detailed' })}
                                className={clsx(
                                    "px-3 py-2 text-sm rounded-lg border transition-all text-center",
                                    options.summaryTone === 'detailed'
                                        ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                )}
                            >
                                Detailed
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && (
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Generating PDF...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
