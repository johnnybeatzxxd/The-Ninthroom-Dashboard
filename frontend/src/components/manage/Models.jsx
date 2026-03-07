import React from 'react';

const Models = () => {
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
                    <div className="form-row full">
                        <div className="field"><label>Model Name</label><input className="inp" type="text" id="new-model-name" placeholder="e.g. Mia, Luna, Model 2…" /></div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Accent Color</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }} id="color-picker">
                                <div className="color-swatch active" data-color="#00C4FF" style={{ background: '#00C4FF' }}></div>
                                <div className="color-swatch" data-color="#E1306C" style={{ background: '#E1306C' }}></div>
                                <div className="color-swatch" data-color="#0FD688" style={{ background: '#0FD688' }}></div>
                                <div className="color-swatch" data-color="#F5A623" style={{ background: '#F5A623' }}></div>
                                <div className="color-swatch" data-color="#9B6DFF" style={{ background: '#9B6DFF' }}></div>
                                <div className="color-swatch" data-color="#F04747" style={{ background: '#F04747' }}></div>
                                <div className="color-swatch" data-color="#1D9BF0" style={{ background: '#1D9BF0' }}></div>
                                <div className="color-swatch" data-color="#FFD700" style={{ background: '#FFD700' }}></div>
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ marginTop: '12px' }}>Add Model →</button>
                </div>
                <div className="card">
                    <div className="card-title">All Models</div>
                    <div id="models-list"></div>
                </div>
            </div>
        </div>
    );
};

export default Models;
