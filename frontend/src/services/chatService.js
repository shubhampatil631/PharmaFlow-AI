import api from './api';

export const chatService = {
    sendMessage: async (message, context = {}) => {
        const response = await api.post('/chat', { message, context });
        // Normalize response keys to match UI expectations (ChatPage checks .content)
        if (response.data && !response.data.content && response.data.message) {
            response.data.content = response.data.message;
            response.data.role = 'assistant';
        }
        return response.data;
    },

    getHistory: async (contextId) => {
        // MVP: Return a clean context-aware greeting
        const name = contextId && contextId !== 'general' ? contextId : 'your data';
        return [
            { id: 1, role: 'assistant', content: `Hello! I'm PharmaFlow AI. How can I help you analyze ${name}?` }
        ];
    }
};
