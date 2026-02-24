import api from './api';

export const agentService = {
    getTasks: async (params) => {
        const response = await api.get('/agents', { params });
        return response.data;
    },
    getTaskById: async (id) => {
        const response = await api.get(`/agents/${id}`);
        return response.data;
    },
    streamTaskLogs: (taskId, onMessage) => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/agents/${taskId}/stream`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Backend sends { log: "..." }
                // Frontend expects { message: "...", level: "...", timestamp: "..." }
                // We adapt it here
                if (data.log) {
                    let msgStr = data.log;
                    let ts = new Date().toISOString();

                    // Backend sends logs starting with [UTC_ISO_DATE]
                    // ex: "[2026-02-23T03:36:48.449448] 🚀 Starting detailed analysis..."
                    const match = msgStr.match(/^\[(.*?)\]\s?(.*)/);
                    if (match) {
                        ts = match[1];
                        msgStr = match[2];
                    }

                    onMessage({
                        timestamp: ts,
                        level: 'INFO',
                        message: msgStr
                    });
                }
            } catch (e) {
                console.error("Error parsing SSE message", e);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    },
    createTask: async (data) => {
        const response = await api.post('/agents', data);
        return response.data;
    },
    cancelTask: async (id) => {
        // Not implemented in backend yet, but kept for interface consistency
        const response = await api.post(`/agents/${id}/cancel`);
        return response.data;
    },
    deleteTask: async (id) => {
        const response = await api.delete(`/agents/${id}`);
        return response.data;
    },
    getWorkerConfig: async (name) => {
        const response = await api.get(`/agents/workers/${name}/config`);
        return response.data;
    },
    updateWorkerConfig: async (name, config) => {
        const response = await api.post(`/agents/workers/${name}/config`, config);
        return response.data;
    }
};
