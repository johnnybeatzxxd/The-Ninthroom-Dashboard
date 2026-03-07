import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const Models = () => {
    const { models, activeModelId, setActiveModelId, reloadModels } = useContext(AppContext);
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [color, setColor] = useState('#00C4FF');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const colors = [
        '#00C4FF', '#E1306C', '#0FD688', '#F5A623',
        '#9B6DFF', '#F04747', '#1D9BF0', '#FFD700'
    ];

    const handleAddModel = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            const newModel = await api.models.create(name, color);
            await reloadModels();
            if (!activeModelId) {
                setActiveModelId(newModel.id);
            }
            showToast('Model added ✓', name + ' profile created', color);
            setName('');
        } catch (error) {
            console.error("Failed to add model", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (model) => {
        setIsSubmitting(true);
        try {
            const newStatus = model.status === 'active' ? 'paused' : 'active';
            await api.models.update(model.id, { status: newStatus });
            await reloadModels();
            showToast('Status Updated', `${model.name} is now ${newStatus}`, newStatus === 'active' ? 'var(--green)' : 'var(--yellow)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this model?')) return;
        setIsSubmitting(true);
        try {
            await api.models.delete(id);
            const modelName = models.find(m => m.id === id)?.name || 'Model';
            await reloadModels();
            if (activeModelId === id) {
                setActiveModelId(null);
            }
            showToast('Cleared', modelName + ' data deleted', 'var(--red)');
        } catch (error) {
            console.error("Failed to delete model", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page active" id="pg-models">
            <div className="page-hd">
                <div>
                    <div className="page-title">Models</div>
                    <div className="page-sub">Manage your OF model profiles — each has separate data &amp; settings</div>
                </div>
            </div>
            <div className="g2">
                <div className="card">
                    <div className="fsec-title">Add New Model</div>
                    <form onSubmit={handleAddModel}>
                        <div className="form-row full">
                            <div className="field">
                                <label>Model Name</label>
                                <input
                                    className="inp"
                                    type="text"
                                    placeholder="e.g. Mia, Luna, Model 2…"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="form-row full">
                            <div className="field">
                                <label>Accent Color</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                                    {colors.map(c => (
                                        <div
                                            key={c}
                                            className={`color-swatch ${color === c ? 'active' : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setColor(c)}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: '12px' }} disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? 'Adding...' : 'Add Model →'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-title">All Models</div>
                    {models.length === 0 ? (
                        <div className="empty">No models found. Add one to get started.</div>
                    ) : (
                        models.map(model => (
                            <div key={model.id} className="model-row" style={{ borderLeft: `2px solid ${model.color || 'transparent'}`, paddingLeft: '12px' }}>
                                <div
                                    className="model-row-dot"
                                    style={{
                                        background: model.status === 'active' ? 'var(--green)' : 'var(--yellow)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleToggleStatus(model)}
                                    title={`Click to ${model.status === 'active' ? 'pause' : 'activate'}`}
                                ></div>
                                <div className="model-row-name" style={{ flex: 1 }}>{model.name}</div>
                                {activeModelId === model.id && <div className="tbadge tbadge-sub">Current</div>}
                                <button
                                    className="ev-del"
                                    onClick={() => handleDelete(model.id)}
                                    disabled={isSubmitting}
                                    title="Delete Model"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Models;
