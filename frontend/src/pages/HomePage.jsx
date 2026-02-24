import React from 'react';
import { Link } from 'react-router-dom';
import {
    FlaskConical,
    Upload,
    Bot,
    Search,
    ArrowRight,
    MoreHorizontal,
    Bell,
    Plus,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function HomePage() {
    const currentDate = new Date();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-home'],
        queryFn: dashboardService.getDashboardStats,
        initialData: {
            stats: { active_molecules: 0, docs_ingested: 0, active_agents: 0, pending_reviews: 0 },
            recent_molecules: [],
            active_tasks: [],
            alerts: []
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Dr. Doe</h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                        <Clock size={14} />
                        {format(currentDate, 'EEEE, MMMM do, yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <Link
                        to="/molecules/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        New Analysis
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Molecules"
                    value={data.stats.active_molecules}
                    trend="Alive"
                    trendLabel="in database"
                    isPositive={true}
                    icon={FlaskConical}
                />
                <StatCard
                    title="Documents Ingested"
                    value={data.stats.docs_ingested}
                    trend="Stable"
                    trendLabel="knowledge base"
                    isPositive={true}
                    icon={FileText}
                />
                <StatCard
                    title="Active Agents"
                    value={data.stats.active_agents}
                    trend="Running"
                    trendLabel="current tasks"
                    isPositive={true}
                    icon={Bot}
                />
                <StatCard
                    title="Issues / Pending"
                    value={data.stats.pending_reviews}
                    trend="Action"
                    trendLabel="needed"
                    isPositive={false}
                    icon={AlertCircle}
                    highlight
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area - 2 Columns */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Molecules */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <FlaskConical size={18} className="text-slate-400" />
                                Recent Molecules
                            </h2>
                            <Link to="/molecules" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Molecule Name</th>
                                        <th className="px-4 py-3">Indication</th>
                                        <th className="px-4 py-3">Stage</th>
                                        <th className="px-4 py-3">Last Updated</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.recent_molecules.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                                No molecules found.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.recent_molecules.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                                <td className="px-4 py-3 text-slate-500">{item.indication}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={item.stage} />
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {item.updated ? new Date(item.updated).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {item.id ? (
                                                        <Link to={`/molecules/${item.id}`} className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded hover:bg-sky-50 inline-block">
                                                            <ArrowRight size={16} />
                                                        </Link>
                                                    ) : (
                                                        <button className="text-slate-400 hover:text-slate-600 cursor-not-allowed" disabled>
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Active Ingestion Tasks */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Activity size={18} className="text-slate-400" />
                                Active Agent Tasks
                            </h2>
                            <Link to="/agents/tasks" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                View Console
                            </Link>
                        </div>
                        <div className="p-4 space-y-4">
                            {data.active_tasks.length === 0 ? (
                                <div className="text-center text-slate-400 py-4">No active tasks running.</div>
                            ) : (
                                data.active_tasks.map((task, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-medium text-slate-900 block">{task.task}</span>
                                                <span className="text-slate-500 text-xs">{task.agent} Agent</span>
                                            </div>
                                            <span className="text-slate-600 font-medium">{task.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">

                    {/* Quick Access */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Access</h3>
                        <div className="space-y-2">
                            <QuickLink to="/ingestion" icon={Upload} label="Upload Documents" />
                            <QuickLink to="/search" icon={Search} label="Knowledge Search" />
                            <QuickLink to="/reports" icon={FileText} label="Generate Report" />
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-900">System Activity</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {data.alerts.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-sm">No recent alerts.</div>
                            ) : (
                                data.alerts.map((alert, i) => (
                                    <div key={i} className="p-3 flex gap-3 text-sm hover:bg-slate-50 transition-colors">
                                        <div className="mt-0.5 shrink-0">
                                            <StatusDot type={alert.type} />
                                        </div>
                                        <div>
                                            <p className="text-slate-700 leading-snug">{alert.msg}</p>
                                            <span className="text-xs text-slate-400">{alert.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                            <Link to="/admin/logs" className="text-xs text-slate-500 hover:text-slate-700 font-medium">View System Logs</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendLabel, isPositive, icon: Icon, highlight }) {
    return (
        <div className={`p-4 rounded-xl border shadow-sm ${highlight ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${highlight ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500'}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">{title}</p>
                <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    if (!status) return null;

    // Normalize status for mapping (e.g. "In_Evaluation" -> "in_evaluation")
    const normalized = status.toLowerCase();

    const styles = {
        analysis: 'bg-blue-50 text-blue-700 border-blue-100',
        review: 'bg-purple-50 text-purple-700 border-purple-100',
        complete: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        ingestion: 'bg-amber-50 text-amber-700 border-amber-100',
        new: 'bg-slate-100 text-slate-700 border-slate-200',
        in_evaluation: 'bg-blue-50 text-blue-700 border-blue-100'
    };

    // Format for display (e.g. In_Evaluation -> In Evaluation)
    const displayStatus = status.replace(/_/g, ' ');

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${styles[normalized] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {displayStatus}
        </span>
    );
}

function QuickLink({ to, icon: Icon, label }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 p-2.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all group"
        >
            <Icon size={18} className="text-slate-400 group-hover:text-sky-500" />
            <span className="text-sm font-medium">{label}</span>
            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function StatusDot({ type }) {
    const colors = {
        success: 'bg-emerald-500',
        info: 'bg-blue-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
    };
    return <div className={`w-2 h-2 rounded-full ${colors[type] || 'bg-slate-300'}`} />;
}
