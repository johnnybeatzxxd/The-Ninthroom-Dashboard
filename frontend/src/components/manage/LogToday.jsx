import React from 'react';

const LogToday = () => {
    return (
        <div className="page active" id="pg-log">
            <div className="page-hd">
                <div>
                    <div className="page-title">Log Today</div>
                    <div className="page-sub">Enter current convo balance — spend is calculated automatically</div>
                </div>
            </div>
            <div className="g2">
                <div className="card">
                    <div className="fsec-title"><span className="pill pill-tw">𝕏</span> Twitter Report</div>
                    <div className="form-row">
                        <div className="field">
                            <label>Current Convo Balance</label>
                            <input className="inp" type="number" id="tw-input-balance" placeholder="e.g. 860" min="0" />
                        </div>
                        <div className="field">
                            <label>Date <span style={{ color: 'var(--muted)', fontSize: '9px' }} id="tw-tz-label"></span></label>
                            <input className="inp" type="date" id="tw-input-date" />
                        </div>
                    </div>
                    <div className="calc-prev" id="tw-calc-preview">
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Previous balance</span><span id="tw-prev-val">—</span></div>
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Convos spent today</span><span id="tw-spent-val" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700' }}>—</span></div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" id="tw-input-note" placeholder="What worked? Any issues?" />
                        </div>
                    </div>
                    <button className="btn-primary btn-tw">Save Twitter Report →</button>
                </div>

                <div className="card">
                    <div className="fsec-title"><span className="pill pill-ig">◎</span> Instagram Report</div>
                    <div className="form-row">
                        <div className="field">
                            <label>Current Convo Balance</label>
                            <input className="inp" type="number" id="ig-input-balance" placeholder="e.g. 720" min="0" />
                        </div>
                        <div className="field">
                            <label>Date <span style={{ color: 'var(--muted)', fontSize: '9px' }} id="ig-tz-label"></span></label>
                            <input className="inp" type="date" id="ig-input-date" />
                        </div>
                    </div>
                    <div className="calc-prev" id="ig-calc-preview">
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Previous balance</span><span id="ig-prev-val">—</span></div>
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Convos spent today</span><span id="ig-spent-val" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700' }}>—</span></div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" id="ig-input-note" placeholder="What worked? Any issues?" />
                        </div>
                    </div>
                    <button className="btn-primary btn-ig">Save Instagram Report →</button>
                </div>
            </div>

            <div className="card">
                <div className="card-title">How to automate this</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '11.5px', color: 'var(--sub)', lineHeight: '1.75' }}>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>① Telegram Bot</div>
                        Bot messages each manager at 8PM: "How many convos left?" They reply with one number → bot updates the dashboard via webhook. Zero effort from you. <span style={{ color: 'var(--of)' }}>Free.</span>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>② Make.com Flow</div>
                        Managers fill a Google Form → Make.com parses and pushes data here automatically. Setup takes ~1 hour, then it runs itself. <span style={{ color: 'var(--of)' }}>$0–9/mo.</span>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>③ Direct API</div>
                        If your mass-DM software has an API, Make.com can pull the convo balance every few hours automatically. Full autopilot. <span style={{ color: 'var(--of)' }}>Tell me what software you use.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogToday;
