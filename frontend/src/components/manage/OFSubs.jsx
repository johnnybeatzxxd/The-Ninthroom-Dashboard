import React from 'react';

const OFSubs = () => {
    return (
        <div className="page active" id="pg-subs">
            <div className="page-hd">
                <div>
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>OF Subs <span className="pill pill-of">OnlyFans</span></div>
                    <div className="page-sub">New subscribers + conversion rate from convos</div>
                </div>
            </div>

            <div className="g4" style={{ marginBottom: '14px' }}>
                <div className="sc gn">
                    <div className="sc-label"><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> New Subs Today</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }} id="subs-tw-today">—</div>
                    <div className="sc-delta">from Twitter</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label"><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> New Subs Today</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }} id="subs-ig-today">—</div>
                    <div className="sc-delta">from Instagram</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label">This Week</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }} id="subs-week-total">—</div>
                    <div className="sc-delta">last 7 days</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label">All-Time Total</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }} id="subs-alltime">—</div>
                    <div className="sc-delta">since tracking</div>
                </div>
            </div>

            <div className="g4" style={{ marginTop: '0', marginBottom: '14px' }}>
                <div className="sc of" style={{ position: 'relative' }}>
                    <div className="sc-label">Conversion Today</div>
                    <div className="sc-val" style={{ color: 'var(--of)' }} id="conv-today">—</div>
                    <div className="sc-delta">convos → subs</div>
                    <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '30px', opacity: '0.06', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '900' }}>%</div>
                </div>
                <div className="sc of">
                    <div className="sc-label">7-Day Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--of)' }} id="conv-avg7">—</div>
                    <div className="sc-delta" id="conv-avg7-sub">rolling average</div>
                </div>
                <div className="sc tw">
                    <div className="sc-label"><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--tw)' }} id="conv-tw-avg">—</div>
                    <div className="sc-delta">convos → subs</div>
                </div>
                <div className="sc ig">
                    <div className="sc-label"><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--ig)' }} id="conv-ig-avg">—</div>
                    <div className="sc-delta">convos → subs</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Today</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }} id="cps-today">—</div>
                    <div className="sc-delta" id="cps-today-sub">at $<span id="cps-rate">0.07</span>/convo</div>
                </div>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Twitter</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }} id="cps-tw">—</div>
                    <div className="sc-delta">all-time avg</div>
                </div>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Instagram</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }} id="cps-ig">—</div>
                    <div className="sc-delta">all-time avg</div>
                </div>
            </div>

            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">
                        Daily New Subs — 14 days
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--tw)', display: 'inline-block', borderRadius: '2px' }}></span>Twitter</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--ig)', display: 'inline-block', borderRadius: '2px' }}></span>Instagram</span>
                        </div>
                    </div>
                    <div className="chart-box" style={{ height: '210px' }}><canvas id="chartSubs"></canvas></div>
                </div>
                <div className="card">
                    <div className="card-title">
                        Conversion Rate % — 14 days
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--of)', display: 'inline-block', borderRadius: '2px' }}></span>Daily %</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--yellow)', display: 'inline-block', borderRadius: '2px', borderStyle: 'dashed' }}></span>Avg</span>
                        </div>
                    </div>
                    <div className="chart-box" style={{ height: '210px' }}><canvas id="chartConv"></canvas></div>
                </div>
            </div>

            <div className="g2">
                <div className="card">
                    <div className="fsec-title">Log New Subs</div>
                    <div className="form-row full" style={{ marginBottom: '14px' }}>
                        <div className="field"><label>Date</label><input className="inp" type="date" id="subs-input-date" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ marginBottom: '10px' }}><span className="pill pill-tw">𝕏 Twitter</span></div>
                            <div className="field"><label>New subs from Twitter</label><input className="inp" type="number" id="subs-tw-input" placeholder="0" min="0" /></div>
                        </div>
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ marginBottom: '10px' }}><span className="pill pill-ig">◎ Instagram</span></div>
                            <div className="field"><label>New subs from Instagram</label><input className="inp" type="number" id="subs-ig-input" placeholder="0" min="0" /></div>
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field"><label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label><input className="inp" type="text" id="subs-note-input" placeholder="Promo, discount, best content?" /></div>
                    </div>
                    <button className="btn-primary btn-gn">Save Subscriber Report →</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="card">
                        <div className="card-title">Conversion Breakdown — All Time</div>
                        <div id="convBreakdown"><div className="empty">No data yet</div></div>
                    </div>
                    <div className="card">
                        <div className="card-title">Recent Entries</div>
                        <div id="subsRecentLog"><div className="empty">No data yet</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OFSubs;
