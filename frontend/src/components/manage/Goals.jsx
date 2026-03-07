import React from 'react';

const Goals = () => {
    return (
        <div className="page active" id="pg-goals">
            <div className="page-hd">
                <div>
                    <div className="page-title">Goals</div>
                    <div className="page-sub" id="goals-model-sub">Monthly subscriber target</div>
                </div>
            </div>

            {/* Big progress bars card */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div id="goals-main-bar"><div className="empty">Set a monthly target to see progress</div></div>
            </div>

            {/* Target inputs */}
            <div className="card" style={{ maxWidth: '520px' }}>
                <div className="fsec-title">Monthly Subs Targets</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Total target <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(TW + IG combined)</span></label>
                        <input className="inp" type="number" id="goal-month-subs" placeholder="e.g. 200" min="1" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter target</label>
                        <input className="inp" type="number" id="goal-month-subs-tw" placeholder="e.g. 120" min="1" />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram target</label>
                        <input className="inp" type="number" id="goal-month-subs-ig" placeholder="e.g. 80" min="1" />
                    </div>
                </div>
                <button className="btn-primary">Save Targets →</button>
            </div>
        </div>
    );
};

export default Goals;
