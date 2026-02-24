import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConnectorCard } from '../components/ingestion/ConnectorCard';
import { IngestionLogTable } from '../components/ingestion/IngestionLogTable';
import { ingestionService } from '../services/ingestionService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { FileText, UploadCloud } from 'lucide-react';

export function IngestionDashboardPage() {
    const queryClient = useQueryClient();

    const { data: connectors, isLoading: loadingConnectors } = useQuery({
        queryKey: ['connectors'],
        queryFn: ingestionService.getConnectors,
    });

    const { data: jobs } = useQuery({
        queryKey: ['ingestion-jobs'],
        queryFn: ingestionService.getIngestionJobs,
    });

    const runMutation = useMutation({
        mutationFn: ingestionService.runConnector,
        onSuccess: () => {
            toast.success('Ingestion job started');
            queryClient.invalidateQueries(['connectors']);
            queryClient.invalidateQueries(['ingestion-jobs']);
        },
        onError: () => {
            toast.error('Failed to start ingestion');
        }
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ingestion Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage data connectors and synchronization jobs.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/ingestion/documents"
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium shadow-sm"
                    >
                        <FileText size={18} />
                        View Documents
                    </Link>
                    <Link
                        to="/ingestion/upload"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
                    >
                        <UploadCloud size={18} />
                        Upload Document
                    </Link>
                </div>
            </div>

            {/* Visual Pipeline Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between relative gap-8 md:gap-0">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0" />

                    {/* Mobile Vertical Line */}
                    <div className="md:hidden absolute left-1/2 top-0 w-0.5 h-full bg-slate-100 -translate-x-1/2 -z-0" />

                    {/* Step 1 */}
                    <div className="relative z-10 flex flex-col items-center bg-white px-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                            <UploadCloud size={24} />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">Data Ingestion</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[150px] text-center">Patents, Papers, Trials</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 flex flex-col items-center bg-white px-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                            <FileText size={24} />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">Processing</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[150px] text-center">Parsing & Normalization</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 flex flex-col items-center bg-white px-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                            <div className="text-lg font-bold">V</div>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">Vectorization</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[150px] text-center">Semantic Embedding</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative z-10 flex flex-col items-center bg-white px-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border-4 border-white shadow-sm mb-3">
                            <div className="text-lg font-bold">KG</div>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">Knowledge Graph</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[150px] text-center">Relationship Mapping</p>
                    </div>
                </div>
            </div>

            <section>
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Active Connectors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connectors?.map(connector => (
                        <ConnectorCard
                            key={connector._id}
                            connector={connector}
                            onRun={(id) => runMutation.mutate(id)}
                        />
                    ))}
                    {loadingConnectors && <p>Loading connectors...</p>}
                </div>
            </section>

            <section>
                <IngestionLogTable logs={jobs} />
            </section>
        </div>
    );
}

export default IngestionDashboardPage;
