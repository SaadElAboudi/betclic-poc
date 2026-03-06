const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const apiClient = {
    async get(path) {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async post(path, data) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
};

export const formatMarketType = (type) => {
    const labels = {
        match_winner: 'Match Winner',
        over_under: 'Over/Under',
        next_goal: 'Next Goal',
        corners: 'Corners',
        both_teams_score: 'Both Teams Score',
    };
    return labels[type] || type;
};

export const formatOdds = (odds) => {
    return Number(odds).toFixed(2);
};
