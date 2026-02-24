import React from 'react';
import { Webhook, ArrowRight } from 'lucide-react';

export function WebhookEventItem({ event }) {
    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <Webhook className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{event.event}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{event.source}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>

                    <div className="mt-3 bg-slate-50 p-2 rounded text-xs font-mono text-slate-600 overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                    </div>
                </div>
            </div>

            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {event.status.toUpperCase()}
            </span>
        </div>
    );
}

export function CrewAIMonitorPage() {
    const { data: webhooks, isLoading } = React.useQuery({ // Assuming useQuery is available or imported in page
        queryKey: ['webhooks'],
        queryFn: opsService.getWebhooks
    });

    // We need to import these locally or use the main file structure. 
    // For this snippet, I will rely on the page wrapper importing them correctly.
    // Re-writing to be a full page component below.
    return null;
}
