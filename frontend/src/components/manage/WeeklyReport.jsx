import React from 'react';

const WeeklyReport = () => {
    return (
        <div className="page active" id="pg-report">
            <div className="page-hd">
                <div>
                    <div className="page-title">Weekly Report</div>
                    <div className="page-sub">Auto-generated performance summary · ready to copy &amp; share</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="field" style={{ margin: '0' }}>
                        <input className="inp" type="date" id="report-week-end" style={{ width: '160px' }} />
                    </div>
                    <button className="btn-sm">Generate →</button>
                </div>
            </div>

            {/* Week selector strip */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }} id="report-quick-weeks"></div>

            {/* Report output */}
            <div id="report-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', opacity: '.3' }}>📋</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', fontSize: '16px', marginBottom: '6px', color: 'var(--sub)' }}>Select a week and generate</div>
                <div>Pick an end date above or choose a quick week below</div>
            </div>

            <div id="report-output" style={{ display: 'none' }}>
                {/* KPI summary row */}
                <div className="g4" id="report-kpis" style={{ marginBottom: '14px' }}></div>

                {/* Report text card */}
                <div className="card" style={{ marginBottom: '14px' }}>
                    <div className="card-title" style={{ marginBottom: '12px' }}>
                        Report Text
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-sm" id="copy-btn">Copy</button>
                            <button className="btn-sm" id="pdf-btn" style={{ color: 'var(--of)', borderColor: 'rgba(0,196,255,.3)' }}>↓ PDF</button>
                            <select className="inp" id="report-format" style={{ width: '110px', padding: '5px 10px', fontSize: '10.5px' }}>
                                <option value="plain">Plain text</option>
                                <option value="markdown">Markdown</option>
                                <option value="slack">Slack</option>
                            </select>
                        </div>
                    </div>
                    <div id="report-text-box" style={{
                        background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px',
                        padding: '20px', fontSize: '12px', lineHeight: '1.9', color: 'var(--text)',
                        whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace",
                        maxHeight: '520px', overflowY: 'auto'
                    }}></div>
                </div>

                {/* Breakdown cards */}
                <div className="g2" id="report-breakdown"></div>
            </div>
        </div>
    );
};

export default WeeklyReport;
