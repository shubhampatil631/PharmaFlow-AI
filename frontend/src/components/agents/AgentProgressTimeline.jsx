import React from 'react';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export function AgentProgressTimeline({ steps, currentStep }) {
    // steps: { id, label, status, timestamp }

    return (
        <div className="py-2">
            <div className="space-y-6 relative">
                {/* Vertical line connecting steps */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100 -z-10" />

                {steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isCurrent = step.status === 'running';
                    const isFailed = step.status === 'failed';
                    const isPending = step.status === 'pending';

                    return (
                        <div key={step.id} className="flex gap-4 items-start">
                            <div className={clsx(
                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 bg-white",
                                isCompleted ? "border-green-500 text-green-500" :
                                    isCurrent ? "border-blue-500 text-blue-500" :
                                        isFailed ? "border-red-500 text-red-500" :
                                            "border-slate-300 text-slate-300"
                            )}>
                                {isCompleted ? <Check size={14} strokeWidth={3} /> :
                                    isCurrent ? <Loader2 size={14} className="animate-spin" /> :
                                        isFailed ? <AlertCircle size={14} /> :
                                            <Circle size={10} fill="currentColor" className="text-transparent" />
                                }
                            </div>
                            <div className="pt-0.5 flex-1">
                                <h4 className={clsx("text-sm font-medium", isPending ? "text-slate-500" : "text-slate-900")}>
                                    {step.label}
                                </h4>
                                {step.timestamp && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {new Date(step.timestamp).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
