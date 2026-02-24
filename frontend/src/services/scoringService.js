export const scoringService = {
    getScore: async (taskId) => {
        const response = await api.get(`/scoring/${taskId}`);
        return response.data;
    },

    recomputeScore: async (taskId, components) => {
        const response = await api.post(`/scoring/${taskId}/recompute`, { components });
        return response.data;
    },

    saveSnapshot: async (taskId, data) => {
        const response = await api.post(`/scoring/${taskId}/snapshots`, data);
        return response.data;
    },

    getSnapshots: async (taskId) => {
        const response = await api.get(`/scoring/${taskId}/snapshots`);
        return response.data;
    }
};
