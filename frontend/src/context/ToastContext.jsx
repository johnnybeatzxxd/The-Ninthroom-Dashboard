import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, title: '', sub: '', color: 'var(--green)' });

    const showToast = useCallback((title, sub, color = 'var(--green)') => {
        setToast({ show: true, title, sub, color });

        // Auto-hide after 4 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={`toast ${toast.show ? 'show' : ''}`} style={{ borderLeftColor: toast.color }}>
                <div className="toast-title">{toast.title}</div>
                <div className="toast-sub">{toast.sub}</div>
            </div>
        </ToastContext.Provider>
    );
};
