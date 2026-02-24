import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { agentService } from '../services/agentService';
import { TaskCard } from '../components/agents/TaskCard';
import { Filter, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

export function AgentTasksPage() {
    const [filter, setFilter] = useState('all');

    const { data: tasks, isLoading, refetch } = useQuery({
        queryKey: ['agent-tasks', filter],
        queryFn: () => agentService.getTasks({ status: filter === 'all' ? undefined : filter }),
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await agentService.deleteTask(id);
                refetch();
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete task");
            }
        }
    };

    const categories = ['all', 'queued', 'running', 'completed', 'failed'];

    const filteredTasks = tasks?.items || []; // Use items from paginated response
    // Logic for frontend filtering if backend doesn't support it fully yet, 
    // but here we are calling backend with params.
    // If backend ignores status param, we might need client side filter:
    // const displayTasks = filteredTasks.filter(...) 
    // BUT agentService.getTasks returns { items: [], total: ... }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Agent Orchestrator</h1>
                    <p className="text-slate-500 mt-1">Monitor and manage autonomous pharmaceutical analysis workflows.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-lg border">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                                filter === cat ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <TaskCard key={task._id} task={task} onDelete={handleDelete} />
                    )) : !isLoading && <p className="text-slate-500">No tasks found.</p>}
                    {isLoading && <p>Loading tasks...</p>}
                </div>

                {/* Agent Roles Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <HelpCircle size={18} className="text-slate-400" />
                            Agent Roles
                        </h3>
                        <div className="space-y-4">
                            <Link to="/agents/workers/researcher" className="block pb-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded p-1">
                                <h4 className="font-medium text-slate-900 text-sm">🧪 Researcher</h4>
                                <p className="text-xs text-slate-500 mt-1">Ingests literature and aggregates raw data from PubMed/ClinTrials.</p>
                            </Link>
                            <Link to="/agents/workers/analyst" className="block pb-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded p-1">
                                <h4 className="font-medium text-slate-900 text-sm">📊 Analyst</h4>
                                <p className="text-xs text-slate-500 mt-1">Evaluates molecular viability using the multi-dimensional scoring matrix.</p>
                            </Link>
                            <Link to="/agents/workers/critic" className="block pb-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded p-1">
                                <h4 className="font-medium text-slate-900 text-sm">⚖️ Critic</h4>
                                <p className="text-xs text-slate-500 mt-1">Adversarial review to detect hallucinations and logical inconsistencies.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgentTasksPage;
