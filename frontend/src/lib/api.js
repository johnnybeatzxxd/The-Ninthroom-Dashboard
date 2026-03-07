// src/lib/api.js

const STORAGE_KEY = 'ninth_room_dashboard_data';

// Helper to simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const initializeStorage = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultData = {
            models: [
                { id: 'm1', name: 'Model Alice', status: 'active' },
                { id: 'm2', name: 'Model Bob', status: 'paused' }
            ],
            logs: [], // { id, modelId, date, twSpent, igSpent, subCount, ... }
            subs: [],
            timeline: [], // { id, modelId, date, category, text }
            goals: {}, // modelId -> { targetSubs, currentSubs }
            settings: {},
            refills: [] // { id, modelId, date, platform, amount, cost }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
};

const getDb = () => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

const saveDb = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const api = {
    models: {
        getAll: async () => {
            await delay();
            return getDb().models;
        },
        create: async (name, color = '#00C4FF') => {
            await delay();
            const db = getDb();
            const newModel = { id: generateId(), name, color, status: 'active' };
            db.models.push(newModel);
            saveDb(db);
            return newModel;
        },
        update: async (id, updates) => {
            await delay();
            const db = getDb();
            db.models = db.models.map(m => m.id === id ? { ...m, ...updates } : m);
            saveDb(db);
            return { success: true };
        },
        delete: async (id) => {
            await delay();
            const db = getDb();
            db.models = db.models.filter(m => m.id !== id);
            saveDb(db);
            return { success: true };
        }
    },

    logs: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.logs.filter(log => log.modelId === modelId);
        },
        create: async (modelId, logData) => {
            await delay();
            const db = getDb();
            const newLog = {
                id: generateId(),
                modelId,
                date: new Date().toISOString(),
                ...logData
            };
            db.logs.push(newLog);
            saveDb(db);
            return newLog;
        },
        getOverviewStats: async (modelId) => {
            await delay();
            const db = getDb();
            const modelLogs = db.logs.filter(l => l.modelId === modelId);
            const modelRefills = db.refills.filter(r => r.modelId === modelId);
            const today = new Date().toISOString().split('T')[0];

            // Corrected platform strings: 'tw' and 'ig' based on form values
            const twTotalRefilled = modelRefills.filter(r => r.platform === 'tw').reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
            const igTotalRefilled = modelRefills.filter(r => r.platform === 'ig').reduce((sum, r) => sum + parseInt(r.amount || 0), 0);

            const twTotalSpent = modelLogs.reduce((sum, l) => sum + parseInt(l.twSpent || 0), 0);
            const igTotalSpent = modelLogs.reduce((sum, l) => sum + parseInt(l.igSpent || 0), 0);

            const twRemaining = twTotalRefilled - twTotalSpent;
            const igRemaining = igTotalRefilled - igTotalSpent;

            // Spent today: sum all logs for current date
            const todayLogs = modelLogs.filter(l => l.date && l.date.startsWith(today));
            const twSpentToday = todayLogs.reduce((sum, l) => sum + parseInt(l.twSpent || 0), 0);
            const igSpentToday = todayLogs.reduce((sum, l) => sum + parseInt(l.igSpent || 0), 0);

            // Avg per day: based on unique days logged
            const uniqueDays = new Set(modelLogs.map(l => l.date ? l.date.split('T')[0] : null).filter(Boolean)).size;

            return {
                convoBalance: {
                    tw: Math.max(0, twRemaining),
                    ig: Math.max(0, igRemaining),
                    total: Math.max(0, twRemaining) + Math.max(0, igRemaining)
                },
                twStats: {
                    spentToday: twSpentToday,
                    remaining: twRemaining,
                    avgPerDay: twTotalSpent / Math.max(uniqueDays, 1),
                    convRate: 0
                },
                igStats: {
                    spentToday: igSpentToday,
                    remaining: igRemaining,
                    avgPerDay: igTotalSpent / Math.max(uniqueDays, 1),
                    convRate: 0
                }
            };
        }
    },

    subs: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.subs.filter(sub => sub.modelId === modelId);
        },
        create: async (modelId, subData) => {
            await delay();
            const db = getDb();
            const newSub = {
                id: generateId(),
                modelId,
                date: new Date().toISOString(),
                ...subData
            };
            db.subs.push(newSub);
            saveDb(db);
            return newSub;
        }
    },

    timeline: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.timeline.filter(ev => ev.modelId === modelId);
        },
        create: async (modelId, evData) => {
            await delay();
            const db = getDb();
            const newEvent = {
                id: generateId(),
                modelId,
                date: new Date().toISOString(),
                ...evData
            };
            db.timeline.push(newEvent);
            saveDb(db);
            return newEvent;
        },
        delete: async (id) => {
            await delay();
            const db = getDb();
            db.timeline = db.timeline.filter(e => e.id !== id);
            saveDb(db);
            return { success: true };
        }
    },

    refills: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.refills.filter(r => r.modelId === modelId);
        },
        create: async (modelId, refillData) => {
            await delay();
            const db = getDb();
            const newRefill = {
                id: generateId(),
                modelId,
                ...refillData
            };
            db.refills.push(newRefill);
            saveDb(db);
            return newRefill;
        }
    },

    goals: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.goals[modelId] || { targetSubs: 0, twTarget: 0, igTarget: 0 };
        },
        save: async (modelId, goalsData) => {
            await delay();
            const db = getDb();
            db.goals[modelId] = goalsData;
            saveDb(db);
            return db.goals[modelId];
        }
    },

    settings: {
        getForModel: async (modelId) => {
            await delay();
            const db = getDb();
            return db.settings[modelId] || {};
        },
        save: async (modelId, settingsData) => {
            await delay();
            const db = getDb();
            db.settings[modelId] = settingsData;
            saveDb(db);
            return db.settings[modelId];
        }
    }
};
