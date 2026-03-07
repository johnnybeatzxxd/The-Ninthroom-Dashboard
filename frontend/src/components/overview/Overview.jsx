import React from 'react';
import StatCard from '../shared/StatCard';

const Overview = ({ setActivePage }) => {
    return (
        <div className="page active" id="pg-overview">
            <div className="page-hd">
                <div>
                    <div className="page-title">Overview</div>
                    <div className="page-sub">All platforms · Convo balance &amp; subscriber snapshot</div>
                </div>
                <button className="btn-sm" onClick={() => setActivePage('log')}>+ Log Today</button>
            </div>

            {/* Compact goal bars */}
            <div id="ov-goal-bar" style={{ display: 'none', marginBottom: '14px', padding: '16px 20px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '1.5px', background: 'linear-gradient(90deg,var(--of)44,var(--tw)44,var(--ig)44,transparent)' }}></div>
                <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }} id="ov-goal-month-label">Month Goal</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="ov-goal-rows"></div>
                <button
                    onClick={() => setActivePage('goals')}
                    style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', padding: '0', transition: 'color .15s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted)'}
                >
                    View full Goals →
                </button>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Convo Balance <span id="overview-updated" style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: '400', letterSpacing: '0', textTransform: 'none' }}></span></div>
                <div id="meterContainer"><div className="empty">No data yet — log a report to see balances</div></div>
            </div>

            <div className="g2" style={{ marginBottom: '14px' }}>
                {/* ── TWITTER COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--tw)', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '0 2px' }}>𝕏 Twitter</div>

                    <StatCard platform="tw" label="TW Convos Spent Today" value="—" delta="convos used" valueId="ov-tw-spent" deltaId="ov-tw-spent-d" />
                    <StatCard platform="tw" label="TW Remaining" value="—" delta="of budget" valueId="ov-tw-rem" deltaId="ov-tw-pct" />
                    <StatCard platform="tw" label="TW Avg Convos / Day" value="—" delta="7-day average" valueId="ov-tw-per-acc" deltaId="ov-tw-per-acc-sub" />
                    <StatCard platform="of" label="TW Conv Rate" value="—" delta="subs ÷ convos today" valueColor="var(--of)" valueId="ov-tw-conv" deltaId="ov-tw-conv-wow" />
                    <StatCard platform="gn" label={<><span className="pill pill-tw">TW</span> New Subs Today</>} value="—" delta="— all time" valueColor="var(--green)" valueId="ov-tw-subs" deltaId="ov-tw-subs-wow" />
                    <StatCard platform="gn" label="TW Subs / Account" value="—" delta="7-day avg" valueColor="var(--green)" valueId="ov-tw-subs-per-acc" deltaId="ov-tw-subs-per-acc-wow" />
                </div>

                {/* ── INSTAGRAM COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--ig)', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '0 2px' }}>◎ Instagram</div>

                    <StatCard platform="ig" label="IG Convos Spent Today" value="—" delta="convos used" valueId="ov-ig-spent" deltaId="ov-ig-spent-d" />
                    <StatCard platform="ig" label="IG Remaining" value="—" delta="of budget" valueId="ov-ig-rem" deltaId="ov-ig-pct" />
                    <StatCard platform="ig" label="IG Avg Convos / Day" value="—" delta="7-day average" valueId="ov-ig-per-acc" deltaId="ov-ig-per-acc-sub" />
                    <StatCard platform="of" label="IG Conv Rate" value="—" delta="subs ÷ convos today" valueColor="var(--of)" valueId="ov-ig-conv" deltaId="ov-ig-conv-wow" />
                    <StatCard platform="gn" label={<><span className="pill pill-ig">IG</span> New Subs Today</>} value="—" delta="— all time" valueColor="var(--green)" valueId="ov-ig-subs" deltaId="ov-ig-subs-wow" />
                    <StatCard platform="gn" label="IG Subs / Account" value="—" delta="7-day avg" valueColor="var(--green)" valueId="ov-ig-subs-per-acc" deltaId="ov-ig-subs-per-acc-wow" />
                </div>
            </div>

            {/* Totals row */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <StatCard platform="gn" label="Total Subs Today" value="—" delta="both platforms" valueColor="var(--green)" valueId="ov-total-subs-today" deltaId="ov-total-subs-today-wow" />
                <StatCard platform="gn" label="All-Time Subs" value="—" delta="since tracking began" valueColor="var(--green)" valueId="ov-total-subs-all" />
            </div>

            <div className="g2">
                <div className="card">
                    <div className="card-title">Daily Convo Spend — 14 days</div>
                    <div className="chart-box" style={{ height: '200px' }}><canvas id="chartOverview"></canvas></div>
                </div>
                <div className="card">
                    <div className="card-title">Recent Activity</div>
                    <div id="recentLog"><div className="empty">Nothing logged yet</div></div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
