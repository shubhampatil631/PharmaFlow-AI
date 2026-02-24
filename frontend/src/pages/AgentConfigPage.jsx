import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { agentService } from '../services/agentService';
import { ArrowLeft, Settings, RotateCcw, Save, Activity, History } from 'lucide-react';
import { toast } from 'sonner';

export function AgentConfigPage() {
    const { workerName } = useParams();
    const formattedName = workerName?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Fetch Config
    const { data: config, isLoading } = useQuery({
        queryKey: ['worker-config', workerName],
        queryFn: () => agentService.getWorkerConfig(workerName),
    });

    // Save Mutation
    const mutation = useMutation({
        mutationFn: (newConfig) => agentService.updateWorkerConfig(workerName, newConfig),
        onSuccess: () => {
            toast.success('Configuration saved successfully');
        },
        onError: () => {
            toast.error('Failed to save configuration');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newConfig = {
            max_results: parseInt(formData.get('max_results')),
            similarity_threshold: parseFloat(formData.get('similarity_threshold')),
            temperature: parseFloat(formData.get('temperature'))
        };
        mutation.mutate(newConfig);
    };

    if (isLoading) return <div className="p-8 text-center">Loading config...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/agents/tasks" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{formattedName} Configuration</h1>
                    <p className="text-slate-500">Manage parameters and view history for this worker agent.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                            <Settings className="w-5 h-5 text-slate-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Parameters</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Search Results</label>
                                <input name="max_results" type="number" defaultValue={config?.max_results || 20} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Similarity Threshold</label>
                                <div className="flex items-center gap-4">
                                    <input name="similarity_threshold" type="range" min="0" max="1" step="0.1" defaultValue={config?.similarity_threshold || 0.7} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                    <span className="text-sm font-mono text-slate-600">0.7</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Model Temperature</label>
                                <input name="temperature" type="number" step="0.1" defaultValue={config?.temperature || 0.2} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> Reset
                                </button>
                                <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                    <Save className="w-4 h-4" /> {mutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                            <History className="w-5 h-5 text-slate-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                        </div>

                        <div className="space-y-0 text-sm">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <p className="font-medium text-slate-900">Task #{100 + i}: Molecule Analysis</p>
                                            <p className="text-slate-500 text-xs">2 hours ago</p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-slate-500">0.45s</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                            <Activity className="w-5 h-5 text-slate-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Performance</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Success Rate</p>
                                <p className="text-2xl font-bold text-slate-900">98.5%</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Avg Latency</p>
                                <p className="text-2xl font-bold text-slate-900">1.2s</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Total Runs</p>
                                <p className="text-2xl font-bold text-slate-900">1,245</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
