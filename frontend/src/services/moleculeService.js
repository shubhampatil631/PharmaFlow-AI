import api from './api';

export const moleculeService = {
    getMolecules: async (params) => {
        // params: { q, page, size, status, sort }
        const requestParams = { ...params };
        if (Array.isArray(requestParams.status)) {
            requestParams.status = requestParams.status.join(',');
        }
        const response = await api.get('/molecules', { params: requestParams });
        return response.data;
    },
    getMoleculeById: async (id) => {
        const response = await api.get(`/molecules/${id}`);
        return response.data;
    },
    createMolecule: async (data) => {
        const response = await api.post('/molecules', data);
        return response.data;
    },
    requestEvaluation: async (id, data) => {
        const response = await api.post(`/molecules/${id}/request-eval`, data);
        return response.data;
    },
    updateMolecule: async (id, data) => {
        const response = await api.put(`/molecules/${id}`, data);
        return response.data;
    },
    enrichMolecule: async (id) => {
        const response = await api.post(`/molecules/${id}/enrich`);
        return response.data;
    }
};
