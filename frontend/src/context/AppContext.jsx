import React, { createContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [activeModelId, setActiveModelId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadModels = async () => {
        setIsLoading(true);
        const fetchedModels = await api.models.getAll();
        setModels(fetchedModels);

        // If there's no active model selected but we have models, pick the first one
        if (!activeModelId && fetchedModels.length > 0) {
            setActiveModelId(fetchedModels[0].id);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadModels();
    }, []);

    const value = {
        models,
        activeModelId,
        setActiveModelId,
        isLoading,
        reloadModels: loadModels
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
