import api from './api';

export const searchService = {
    search: async ({ query, limit = 20, filters = [] }) => {
        const response = await api.post('/search', { query, limit, filters });

        // Save query to recent history if successful and query exists
        if (query && query.trim()) {
            const trimmedQuery = query.trim();
            let recent = [];
            try {
                const stored = localStorage.getItem('recent_searches');
                if (stored) recent = JSON.parse(stored);
            } catch (e) { console.error('Error reading recent searches:', e); }

            // Remove if already exists to push it to the top
            recent = recent.filter(q => q.toLowerCase() !== trimmedQuery.toLowerCase());
            recent.unshift(trimmedQuery);

            // Keep only the 5 most recent
            if (recent.length > 5) recent = recent.slice(0, 5);

            localStorage.setItem('recent_searches', JSON.stringify(recent));
        }

        return response.data;
    },

    getRecentQueries: () => {
        try {
            const stored = localStorage.getItem('recent_searches');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading recent searches:', e);
        }
        return [];
    }
};
