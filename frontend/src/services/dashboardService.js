import api from './api';
import { formatDistanceToNow } from 'date-fns'; // useful for relative times if needed

export const dashboardService = {
    getDashboardStats: async () => {
        const response = await api.get('/dashboard');
        const data = response.data; // { stats, recent_molecules, active_tasks, alerts }

        // Map stats to KPIs
        const kpis = [
            {
                id: 'running',
                label: 'Active Agents',
                value: data.stats.active_agents.toString(),
                change: data.stats.active_agents > 0 ? 'Active' : 'Idle',
                trend: data.stats.active_agents > 0 ? 'up' : 'neutral'
            },
            {
                id: 'molecules',
                label: 'Molecules Analyzed',
                value: data.stats.active_molecules.toLocaleString(),
                change: '+12% this week', // Mocking trend as backend doesn't track history yet
                trend: 'up'
            },
            {
                id: 'score',
                label: 'Documents Ingested',
                value: data.stats.docs_ingested.toLocaleString(),
                change: 'Latest batch processed',
                trend: 'up'
            },
            {
                id: 'time',
                label: 'Pending Reviews',
                value: data.stats.pending_reviews.toString(),
                change: data.stats.pending_reviews > 0 ? 'Action Needed' : 'All Clear',
                trend: data.stats.pending_reviews > 0 ? 'down' : 'neutral'
            }
        ];

        // Map tasks and alerts to Activity History
        const activityHistory = [];

        // Add active/recent tasks
        if (data.active_tasks && Array.isArray(data.active_tasks)) {
            data.active_tasks.forEach((t, i) => {
                activityHistory.push({
                    id: `task-${i}`,
                    molecule: t.task.replace('Analysis: ', ''), // extract molecule name
                    task: t.agent,
                    status: t.status.toLowerCase() === 'processing' ? 'running' : 'completed',
                    time: new Date().toISOString(), // Fallback if no real time, though backend currently doesn't send time for active tasks
                    score: t.progress === 100 ? 85 : null // Mock score if completed
                });
            });
        }

        // Add alerts
        if (data.alerts && Array.isArray(data.alerts)) {
            data.alerts.forEach((a, i) => {
                // Try to parse relative times or use current
                let status = 'info';
                if (a.type === 'success') status = 'completed';
                if (a.type === 'error') status = 'failed';
                if (a.msg.includes('started')) status = 'running';

                activityHistory.push({
                    id: `alert-${i}`,
                    molecule: 'System Event',
                    task: a.msg,
                    status: status,
                    time: new Date().toISOString()
                });
            });
        }

        // Mock Chart Data - Backend only gives current totals, so we simulate a trend ending at current total
        const baseVol = Math.max(0, data.stats.active_molecules - 20);
        const chartData = [
            { name: 'Mon', tasks: baseVol + 2 },
            { name: 'Tue', tasks: baseVol + 8 },
            { name: 'Wed', tasks: baseVol + 5 },
            { name: 'Thu', tasks: baseVol + 12 },
            { name: 'Fri', tasks: baseVol + 15 },
            { name: 'Sat', tasks: baseVol + 4 },
            { name: 'Sun', tasks: data.stats.active_molecules } // Ends on real correct number
        ];

        return {
            ...data, // keep original data for LandingPage
            kpis,
            activityHistory,
            chartData
        };
    }
};
