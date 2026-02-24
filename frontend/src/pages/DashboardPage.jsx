import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { Zap } from 'lucide-react';

export function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardService.getDashboardStats,
        refetchInterval: 5000 // Poll every 5 seconds for real-time updates
    });

    if (isLoading) {
        return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Main Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time operational insights.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-medium shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    System Operational
                </div>
            </div>

            <KPIGrid kpis={data?.kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity Trends</h2>
                        <ActivityChart data={data?.chartData} />
                    </div>
                </div>
                <div className="space-y-8">
                    <RecentActivityList activity={data?.activityHistory} />
                </div>
            </div>
        </div>
    );
}
