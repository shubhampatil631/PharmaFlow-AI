import api from './api';

export const opsService = {
    getSystemHealth: async () => {
        const response = await api.get('/ops/health');
        const data = response.data; // { status, system: { cpu... }, database: ... }

        // Map backend format to UI format
        return [
            { id: 'backend', name: 'Backend API', status: 'healthy', uptime: 'N/A', version: 'v1.0.0' },
            { id: 'db', name: 'MongoDB Cluster', status: data.database.status === 'connected' ? 'healthy' : 'degraded', uptime: 'N/A', version: 'Unknown' },
            { id: 'system', name: 'System Resources', status: data.system.cpu_percent > 90 ? 'degraded' : 'healthy', uptime: 'N/A', version: `CPU: ${data.system.cpu_percent}%` },
        ];
    },

    // Note: getSystemHealth uses /ops/health which is already implemented

    getMetrics: async () => {
        // Real Backend Metrics (snapshot to append to timeline)
        const response = await api.get('/ops/metrics');
        return response.data; // { timestamp, cpu, memory, requests }
    },

    getLogs: async (filter = '') => {
        const response = await api.get('/ops/logs');
        let logs = response.data;
        if (filter) {
            logs = logs.filter(l =>
                (l.message && l.message.toLowerCase().includes(filter.toLowerCase())) ||
                (l.source && l.source.toLowerCase().includes(filter.toLowerCase()))
            );
        }
        return logs;
    },

    getWebhooks: async () => {
        // MVP: Webhooks are not yet fully implemented in backend, keeping mock for UI demo
        // or ensure backend returns empty list if not ready.
        // For now, let's return a static list to avoid empty UI 
        return [
            { id: 'wh_1', source: 'CrewAI', event: 'step_completed', timestamp: new Date().toISOString(), status: 'processed', payload: { agent: 'Analyst', step: 2 } }
        ];
    }
};
