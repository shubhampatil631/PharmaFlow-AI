import api from './api';

export const reportService = {
    generateReport: async (taskId, options) => {
        const response = await api.post(`/reports/generate/${taskId}`);
        return response.data;
    },

    getReports: async () => {
        const response = await api.get('/reports');
        return response.data;
    },

    getReportById: async (id) => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    getDownloadUrl: (taskId) => {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/download/${taskId}`;
    },

    deleteReport: async (taskId) => {
        const response = await api.delete(`/reports/${taskId}`);
        return response.data;
    }
};
