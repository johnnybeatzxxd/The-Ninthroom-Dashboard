// src/lib/api.js
// Connects to the FastAPI backend. Translates camelCase <-> snake_case so no component changes are needed.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Casing Helpers ---

const toSnake = (key) => key.replace(/([A-Z])/g, '_$1').toLowerCase();

const toCamel = (key) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const snakifyObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [toSnake(k), v])
    );
};

const camelifyObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [toCamel(k), v])
    );
};

const camelifyArray = (arr) => arr.map(camelifyObject);

// --- Core Fetch Helper ---

const request = async (method, path, body = null) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
};

// --- API ---

export const api = {
    models: {
        getAll: async () => {
            const data = await request('GET', '/models');
            return camelifyArray(data);
        },
        create: async (name, color = '#00C4FF') => {
            const data = await request('POST', '/models', { name, color, status: 'active' });
            return camelifyObject(data);
        },
        update: async (id, updates) => {
            const data = await request('PATCH', `/models/${id}`, snakifyObject(updates));
            return camelifyObject(data);
        },
        delete: async (id) => {
            return request('DELETE', `/models/${id}`);
        },
    },

    logs: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/logs`);
            return camelifyArray(data);
        },
        create: async (modelId, logData) => {
            // logData from components uses camelCase: { date, twSpent, igSpent, twRemaining, igRemaining, note }
            const data = await request('POST', `/models/${modelId}/logs`, snakifyObject(logData));
            return camelifyObject(data);
        },
        getOverviewStats: async (modelId) => {
            // Returns the same shape the components expect (already camelCase from the backend stats endpoint)
            return request('GET', `/models/${modelId}/stats`);
        },
    },

    subs: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/subs`);
            return camelifyArray(data);
        },
        create: async (modelId, subData) => {
            // subData: { date, twSubs, igSubs, total }
            const data = await request('POST', `/models/${modelId}/subs`, snakifyObject(subData));
            return camelifyObject(data);
        },
    },

    timeline: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/timeline`);
            // Normalize: map `text` from backend to `label` for component compatibility
            return camelifyArray(data).map(ev => ({ ...ev, label: ev.text ?? ev.label }));
        },
        create: async (modelId, evData) => {
            // Components send `label`; backend expects `text`. Map here.
            const { label, ...rest } = evData;
            const payload = { ...rest, text: label ?? evData.text };
            const data = await request('POST', `/models/${modelId}/timeline`, snakifyObject(payload));
            const camelized = camelifyObject(data);
            return { ...camelized, label: camelized.text };
        },
        delete: async (id, modelId) => {
            // modelId is required by the backend route
            return request('DELETE', `/models/${modelId}/timeline/${id}`);
        },
    },

    refills: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/refills`);
            return camelifyArray(data);
        },
        create: async (modelId, refillData) => {
            // refillData: { platform, amount, newBalance (UI only — ignored by backend), date? }
            // Strip frontend-only fields before sending
            const { newBalance, ...rest } = refillData;
            const data = await request('POST', `/models/${modelId}/refills`, snakifyObject(rest));
            return camelifyObject(data);
        },
    },

    goals: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/goals`);
            return camelifyObject(data);
        },
        save: async (modelId, goalsData) => {
            // goalsData: { targetSubs, twTarget, igTarget }
            const data = await request('PUT', `/models/${modelId}/goals`, snakifyObject(goalsData));
            return camelifyObject(data);
        },
    },

    settings: {
        getForModel: async (modelId) => {
            const data = await request('GET', `/models/${modelId}/settings`);
            return camelifyObject(data);
        },
        save: async (modelId, settingsData) => {
            // settingsData: { twAccounts, igAccounts, costTw, costIg }
            const data = await request('PUT', `/models/${modelId}/settings`, snakifyObject(settingsData));
            return camelifyObject(data);
        },
    },
};
