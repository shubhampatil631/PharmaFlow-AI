import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { opsService } from '../../services/opsService';
import { WebhookEventItem } from '../../components/ops/WebhookEventItem';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CrewAIMonitorPage() {
    const { data: webhooks, isLoading } = useQuery({
        queryKey: ['webhooks'],
        queryFn: opsService.getWebhooks
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/ops" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">CrewAI Webhook Monitor</h1>
                    <p className="text-slate-500">Incoming events from external agent orchestrators.</p>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-500">Loading events...</div>
                ) : webhooks?.length > 0 ? (
                    webhooks.map(wh => (
                        <WebhookEventItem key={wh.id} event={wh} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg text-slate-500">No events found</div>
                )}
            </div>
        </div>
    );
}
