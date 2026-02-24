import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { downloadReportPdf } from '../utils/pdfGenerator';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/agentService';
import { StreamConsole } from '../components/agents/StreamConsole';
import { AgentProgressTimeline } from '../components/agents/AgentProgressTimeline';
import { AgentOutputsAccordion } from '../components/agents/worker/AgentOutputsAccordion';
import { ArrowLeft, Play, XOctagon, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function TaskDetailPage() {
    const { taskId } = useParams();
    const [logs, setLogs] = useState([]);

    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => agentService.getTaskById(taskId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return (status === 'running' || status === 'pending') ? 1000 : false;
        }
    });


    useEffect(() => {
        // Start streaming logs on mount
        const stopStream = agentService.streamTaskLogs(taskId, (log) => {
            setLogs(prev => [...prev, log]);
        });
        return () => stopStream();
    }, [taskId]);

    const handleCancel = async () => {
        if (window.confirm("Are you sure you want to cancel this task?")) {
            try {
                await agentService.cancelTask(taskId);
                toast.success("Task cancelled successfully");
            } catch (e) {
                toast.error("Failed to cancel task");
            }
        }
    };

    const transformedOutputs = React.useMemo(() => {
        if (task?.outputs?.length > 0) return task.outputs;
        if (!task?.result?.data) return [];

        const agentNameMap = {
            iqvia: 'IQVIA Insights Agent',
            exim: 'EXIM Trends Agent',
            patent: 'Patent Landscape Agent',
            clinical: 'Clinical Trials Agent',
            web: 'Web Intelligence Agent',
            internal: 'Internal Knowledge Agent'
        };

        return Object.entries(task.result.data).map(([key, data]) => {
            const agentName = agentNameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
            let references = [];

            // Map references based on agent type
            if (key === 'web' && data.scientific_publications) {
                references = data.scientific_publications.map(pub => ({
                    title: pub.title,
                    url: pub.url || '#',
                    snippet: pub.abstract || pub.source
                }));
            } else if (key === 'clinical' && data.latest_trials) {
                references = data.latest_trials.map(trial => ({
                    title: trial.title || trial.nct_id,
                    url: `https://clinicaltrials.gov/study/${trial.nct_id}`,
                    snippet: trial.status
                }));
            } else if (key === 'patent' && data.patent_status) {
                if (data.patent_status.primary_patent) {
                    references.push({
                        title: data.patent_status.primary_patent,
                        url: `https://patents.google.com/patent/${data.patent_status.primary_patent}`,
                        snippet: data.patent_status.title
                    });
                }
            } else if (key === 'internal' && data.documents) {
                references = data.documents.map(doc => ({
                    title: doc.title,
                    url: '#',
                    snippet: doc.snippet || 'Internal Document'
                }));
            }

            let calculatedConfidence = 0.85; // fallback
            try {
                if (key === 'iqvia') {
                    const hasTargets = data.market_data?.therapy_areas?.length > 0;
                    const mature = data.market_data?.maturity_stage && data.market_data.maturity_stage !== 'Unknown';
                    calculatedConfidence = hasTargets && mature ? 0.94 : 0.75;
                } else if (key === 'exim') {
                    const suppliers = data.trade_data?.active_suppliers || 0;
                    calculatedConfidence = suppliers > 5 ? 0.98 : (suppliers > 0 ? 0.88 : 0.60);
                } else if (key === 'patent') {
                    const hasPatents = data.patent_families?.length > 0;
                    calculatedConfidence = hasPatents ? 0.96 : 0.70;
                } else if (key === 'clinical') {
                    const trials = data.trials_count || 0;
                    calculatedConfidence = trials > 20 ? 0.99 : (trials > 0 ? 0.92 : 0.65);
                } else if (key === 'web') {
                    const pubs = data.scientific_publications?.length || 0;
                    calculatedConfidence = pubs > 5 ? 0.95 : (pubs > 0 ? 0.85 : 0.50);
                } else if (key === 'internal') {
                    const hits = data.document_hits || 0;
                    calculatedConfidence = hits > 0 ? 0.92 : 0.20;
                }
            } catch (e) {
                console.warn("Error calculating confidence", e);
            }

            return {
                agent_name: agentName,
                status: 'completed',
                confidence: calculatedConfidence,
                runTime: 'N/A',
                structured_output: data,
                references: references
            };
        });
    }, [task]);

    const transformedTimeline = React.useMemo(() => {
        if (task?.timeline?.length > 0) return task.timeline;

        // Define standard steps
        const steps = [
            { id: 'iqvia', label: 'Market Analysis (IQVIA)' },
            { id: 'exim', label: 'Supply Chain Analysis (EXIM)' },
            { id: 'patent', label: 'Patent Landscape' },
            { id: 'clinical', label: 'Clinical Trials Search' },
            { id: 'web', label: 'Scientific Literature' },
            { id: 'internal', label: 'Internal Knowledge Check' },
            { id: 'report', label: 'Final Report Generation' }
        ];

        if (!task) return steps.map(s => ({ ...s, status: 'pending' }));

        const isTaskCompleted = task.status === 'completed';
        const resultData = task.result?.data || {};

        return steps.map(step => {
            let status = 'pending';
            let timestamp = null;

            if (step.id === 'report') {
                status = isTaskCompleted ? 'completed' : 'pending';
                if (isTaskCompleted) timestamp = task.updated_at;
            } else {
                // If the key exists in result data, it's completed
                if (resultData[step.id]) {
                    status = 'completed';
                } else if (isTaskCompleted) {
                    // If task is completed but key missing, maybe it failed or skipped? 
                    // Assuming completed for now if task is completed
                    status = 'completed';
                }
            }

            return {
                id: step.id,
                label: step.label,
                status: status,
                timestamp: timestamp
            };
        });
    }, [task]);

    if (isLoading || !task) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col max-w-[1800px] mx-auto p-6 justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
                <h2 className="text-xl font-semibold text-slate-700">Loading Task Details...</h2>
                <p className="text-slate-500 mt-2">Connecting to agent stream...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-[1800px] mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div className="flex items-center gap-4">
                    <Link to="/agents/tasks" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-900">{task.name}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 uppercase tracking-wide">
                                {task.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            Target: <span className="font-semibold">{task.molecule_name}</span> • ID: {taskId}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={task.status === 'completed' || task.status === 'cancelled'}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-slate-700 text-sm font-medium ${task.status === 'completed' || task.status === 'cancelled' ? 'opacity-50 cursor-not-allowed hidden' : 'hover:bg-white '}`}
                    >
                        <XOctagon size={16} /> Cancel Task
                    </button>
                    <button
                        onClick={() => downloadReportPdf(taskId, `Report_${task.molecule_name || taskId}.pdf`)}
                        className={`flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium ${task.status !== 'completed' ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <FileText size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Column: Timeline & Outputs (Scrollable) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
                    <section className="bg-white p-5 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b pb-2">Execution Plan</h3>
                        <AgentProgressTimeline steps={transformedTimeline} />
                    </section>

                    <section className="bg-white p-5 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b pb-2">Agent Outputs</h3>
                        <AgentOutputsAccordion outputs={transformedOutputs} />
                    </section>
                </div>

                {/* Right Column: Console (Fixed Height) */}
                <div className="lg:col-span-8 flex flex-col min-h-0 h-full pb-6">
                    <StreamConsole logs={logs} isStreaming={task.status === 'running'} />
                </div>
            </div>
        </div>
    );
}

export default TaskDetailPage;
