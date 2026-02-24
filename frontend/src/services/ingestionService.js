import api from './api';

export const ingestionService = {
    // Connectors
    getConnectors: async () => {
        const response = await api.get('/ingestion/connectors');
        return response.data;
    },
    runConnector: async (id) => {
        const response = await api.post(`/ingestion/connectors/${id}/run`);
        return response.data;
    },

    // Jobs
    getIngestionJobs: async () => {
        const response = await api.get('/ingestion/jobs');
        return response.data;
    },

    // Documents
    getDocuments: async (params) => {
        // params: q, page, size
        const response = await api.get('/ingestion/documents', { params });
        return response.data;
    },
    getDocumentById: async (id) => {
        const response = await api.get(`/ingestion/documents/${id}`);
        return response.data;
    },
    uploadDocument: async (formData) => {
        const response = await api.post('/ingestion/upload/doc', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    deleteDocument: async (id) => {
        const response = await api.delete(`/ingestion/documents/${id}`);
        return response.data;
    }
};
