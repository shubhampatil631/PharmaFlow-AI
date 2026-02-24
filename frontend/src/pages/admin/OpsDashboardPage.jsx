import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { opsService } from '../../services/opsService';
import { ServiceHealthCard } from '../../components/ops/ServiceHealthCard';
import { SystemMetricsChart } from '../../components/ops/SystemMetricsChart';
import { Link } from 'react-router-dom';
import { ScrollText, Webhook, ShieldAlert } from 'lucide-react';

export function OpsDashboardPage() {
    const { data: services, isLoading: healthLoading } = useQuery({
        queryKey: ['ops', 'health'],
        queryFn: opsService.getSystemHealth
    });

    const [metricsHistory, setMetricsHistory] = React.useState([]);

    const { data: latestMetric } = useQuery({
        queryKey: ['ops', 'metrics'],
        queryFn: opsService.getMetrics,
        refetchInterval: 3000, // Poll every 3 seconds for real-time feel
    });

    React.useEffect(() => {
        if (latestMetric) {
            setMetricsHistory(prev => {
                const newPoint = {
                    time: new Date(latestMetric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: latestMetric.cpu,
                    memory: latestMetric.memory,
                    requests: latestMetric.requests
                };
                // Keep last 20 points
                return [...prev.slice(-19), newPoint];
            });
        }
    }, [latestMetric]);

    if (healthLoading) return <div className="p-12 text-center text-slate-500">Loading system status...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Operations</h1>
                    <p className="text-slate-500">Real-time monitoring and health checks.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/logs" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        <ScrollText className="w-4 h-4" /> View Logs
                    </Link>
                    <Link to="/admin/crewai" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        <Webhook className="w-4 h-4" /> Webhooks
                    </Link>
                    <Link to="/agents/worker/researcher" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                        Manage Agents
                    </Link>
                </div>
            </div>

            {/* Service Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services?.map(service => (
                    <ServiceHealthCard key={service.id} service={service} />
                ))}
            </div>

            {/* Metrics Chart & Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SystemMetricsChart data={metricsHistory} />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Resource Impact Analysis</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Vector DB Latency</span>
                                <span className="font-medium text-emerald-600">Optimal (45ms)</span>
                            </div>
                            <p className="text-xs text-slate-400">Directly affects RAG retrieval speed for Agents.</p>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Concurrent Agent Slots</span>
                                <span className="font-medium text-blue-600">85% Utilization</span>
                            </div>
                            <p className="text-xs text-slate-400">High utilization may delay "Analyst" tasks.</p>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">API Rate Limits</span>
                                <span className="font-medium text-slate-900">12k / 50k</span>
                            </div>
                            <p className="text-xs text-slate-400">Daily quota for LLM inference (Gemini 1.5 Pro).</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for Recent Alerts */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold text-amber-900">Active Alert: High Redis Latency</h3>
                    <p className="text-sm text-amber-800 mt-1">Detected variance in task queue processing times above threshold (200ms). Autoscaling triggered.</p>
                </div>
            </div>
        </div>
    );
}
