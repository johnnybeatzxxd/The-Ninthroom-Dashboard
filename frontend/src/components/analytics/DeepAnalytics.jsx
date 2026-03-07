import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip);

const DeepAnalytics = () => {
    const { activeModelId } = useContext(AppContext);
    const [logs, setLogs] = useState([]);
    const [subs, setSubs] = useState([]);
    const [refills, setRefills] = useState([]);
    const [settings, setSettings] = useState({});
    const [frame, setFrame] = useState(30);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!activeModelId) { setLogs([]); setSubs([]); setRefills([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const [l, s, r, st] = await Promise.all([
                api.logs.getForModel(activeModelId),
                api.subs.getForModel(activeModelId),
                api.refills.getForModel(activeModelId),
                api.settings.getForModel(activeModelId)
            ]);
            setLogs(l); setSubs(s); setRefills(r); setSettings(st);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { loadData(); }, [activeModelId]);

    // Filter by frame
    const cutoff = frame > 0 ? new Date(Date.now() - frame * 86400000).toISOString().split('T')[0] : '0000';
    const fLogs = logs.filter(l => (l.date || '') >= cutoff);
    const fSubs = subs.filter(s => (s.date || '') >= cutoff);
    const fRefills = refills.filter(r => (r.date || '') >= cutoff);

    // KPIs
    const totalTwSpent = fLogs.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0);
    const totalIgSpent = fLogs.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0);
    const totalConvos = totalTwSpent + totalIgSpent;
    const totalTwSubs = fSubs.reduce((s, e) => s + (e.twSubs || 0), 0);
    const totalIgSubs = fSubs.reduce((s, e) => s + (e.igSubs || 0), 0);
    const totalSubs = totalTwSubs + totalIgSubs;
    const convRate = totalConvos > 0 ? ((totalSubs / totalConvos) * 100).toFixed(2) : '0';
    const costTw = settings?.costTw || 0.07;
    const costIg = settings?.costIg || 0.07;
    const totalCost = (totalTwSpent * costTw) + (totalIgSpent * costIg);
    const cps = totalSubs > 0 ? (totalCost / totalSubs).toFixed(2) : '—';

    const kpis = [
        { label: 'Total Convos', val: totalConvos.toLocaleString(), color: 'var(--of)' },
        { label: 'TW Convos', val: totalTwSpent.toLocaleString(), color: 'var(--tw)' },
        { label: 'IG Convos', val: totalIgSpent.toLocaleString(), color: 'var(--ig)' },
        { label: 'Total Subs', val: totalSubs.toLocaleString(), color: 'var(--green)' },
        { label: 'Conv. Rate', val: `${convRate}%`, color: 'var(--of)' },
        { label: 'Cost / Sub', val: cps === '—' ? '—' : `$${cps}`, color: 'var(--purple)' },
    ];

    // Efficiency
    const daysActive = new Set(fLogs.map(l => l.date ? l.date.split('T')[0] : null).filter(Boolean)).size || 1;
    const avgConvos = Math.round(totalConvos / daysActive);
    const avgSubs = (totalSubs / daysActive).toFixed(1);
    const twConv = totalTwSpent > 0 ? ((totalTwSubs / totalTwSpent) * 100).toFixed(1) + '%' : '0.0%';
    const igConv = totalIgSpent > 0 ? ((totalIgSubs / totalIgSpent) * 100).toFixed(1) + '%' : '0.0%';

    // Velocity
    const last7 = fLogs.filter(l => l.date >= new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
    const prev7 = fLogs.filter(l => {
        const d = l.date || '';
        const c7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const c14 = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
        return d >= c14 && d < c7;
    });
    const last7Convos = last7.reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
    const prev7Convos = prev7.reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
    const velDelta = prev7Convos > 0 ? (((last7Convos - prev7Convos) / prev7Convos) * 100).toFixed(0) : '—';

    // Head-to-Head
    const h2h = [
        { metric: 'Total Convos', tw: totalTwSpent, ig: totalIgSpent },
        { metric: 'Total Subs', tw: totalTwSubs, ig: totalIgSubs },
        { metric: 'Conv Rate', tw: totalTwSpent > 0 ? ((totalTwSubs / totalTwSpent) * 100).toFixed(1) : 0, ig: totalIgSpent > 0 ? ((totalIgSubs / totalIgSpent) * 100).toFixed(1) : 0 },
        { metric: 'Cost/Sub', tw: totalTwSubs > 0 ? ((totalTwSpent * costTw) / totalTwSubs).toFixed(2) : '—', ig: totalIgSubs > 0 ? ((totalIgSpent * costIg) / totalIgSubs).toFixed(2) : '—' },
    ];

    // Day-of-Week
    const dowNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowData = dowNames.map((_, i) => {
        const dayLogs = fLogs.filter(l => l.date && new Date(l.date).getDay() === i);
        return dayLogs.reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
    });
    const maxDow = Math.max(...dowData, 1);

    // Best/Worst
    const byDate = {};
    fSubs.forEach(s => {
        const d = s.date ? s.date.split('T')[0] : null;
        if (d) byDate[d] = (byDate[d] || 0) + (s.total || 0);
    });
    const sortedDays = Object.entries(byDate).sort((a, b) => b[1] - a[1]);
    const bestDays = sortedDays.slice(0, 3);
    const worstDays = sortedDays.slice(-3).reverse();

    // Chart data for subs
    const last14 = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last14.push(d.toISOString().split('T')[0]); }
    const subsChartData = {
        labels: last14.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [
            { label: 'TW Subs', data: last14.map(day => fSubs.filter(s => s.date && s.date.startsWith(day)).reduce((sum, s) => sum + (s.twSubs || 0), 0)), backgroundColor: 'rgba(29,155,240,0.6)', borderRadius: 3 },
            { label: 'IG Subs', data: last14.map(day => fSubs.filter(s => s.date && s.date.startsWith(day)).reduce((sum, s) => sum + (s.igSubs || 0), 0)), backgroundColor: 'rgba(225,48,108,0.6)', borderRadius: 3 },
        ]
    };

    // Streaks
    const logDates = new Set(fLogs.map(l => l.date ? l.date.split('T')[0] : null).filter(Boolean));
    let currentStreak = 0; let maxStreak = 0; let streak = 0;
    for (let i = 0; i < 90; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (logDates.has(d.toISOString().split('T')[0])) { streak++; if (i === 0) currentStreak = 0; }
        else { maxStreak = Math.max(maxStreak, streak); streak = 0; }
    }
    maxStreak = Math.max(maxStreak, streak);
    // Current streak count back from today
    currentStreak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (logDates.has(d.toISOString().split('T')[0])) { currentStreak++; }
        else break;
    }

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#454A62', font: { size: 8 } } },
            y: { grid: { color: 'rgba(28,31,43,0.5)' }, ticks: { color: '#454A62', font: { size: 9 } } }
        }
    };

    const frameButtons = [
        { val: 30, label: '30D' }, { val: 60, label: '60D' }, { val: 90, label: '90D' }, { val: 0, label: 'All' }
    ];

    if (!activeModelId) return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;

    return (
        <div className="page active" id="pg-analytics">
            <div className="page-hd">
                <div>
                    <div className="page-title">Deep Analytics</div>
                    <div className="page-sub">{frame > 0 ? `Last ${frame} days` : 'All time'} · {daysActive} active days</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {frameButtons.map(f => (
                        <button key={f.val} className={`filter-btn ${frame === f.val ? 'active' : ''}`} onClick={() => setFrame(f.val)}>{f.label}</button>
                    ))}
                </div>
            </div>

            {/* Row 1: KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '14px' }}>
                {kpis.map(k => (
                    <div key={k.label} className="an-kpi">
                        <div className="an-kpi-accent" style={{ background: `linear-gradient(90deg,${k.color},transparent)` }}></div>
                        <div className="an-kpi-label">{k.label}</div>
                        <div className="an-kpi-val" style={{ color: k.color }}>{isLoading ? '...' : k.val}</div>
                    </div>
                ))}
            </div>

            {/* Row 2: Efficiency + Velocity */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Efficiency Metrics</div>
                    {[
                        { label: 'Avg Convos / Day', val: avgConvos },
                        { label: 'Avg Subs / Day', val: avgSubs },
                        { label: 'TW Conversion', val: twConv },
                        { label: 'IG Conversion', val: igConv },
                        { label: 'Days Active', val: daysActive },
                    ].map(r => (
                        <div key={r.label} className="an-stat-row">
                            <span className="an-stat-label">{r.label}</span>
                            <span className="an-stat-val">{r.val}</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <div className="card-title">Velocity & Trends</div>
                    {[
                        { label: 'Last 7 days convos', val: last7Convos },
                        { label: 'Prior 7 days convos', val: prev7Convos },
                        { label: 'WoW Change', val: velDelta === '—' ? '—' : `${velDelta > 0 ? '+' : ''}${velDelta}%` },
                        { label: 'Total Refills', val: fRefills.length },
                        { label: 'Convos Refilled', val: fRefills.reduce((s, r) => s + (parseInt(r.amount) || 0), 0) },
                    ].map(r => (
                        <div key={r.label} className="an-stat-row">
                            <span className="an-stat-label">{r.label}</span>
                            <span className="an-stat-val">{r.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 3: Head-to-Head */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Platform Head-to-Head</div>
                {h2h.map(r => {
                    const max = Math.max(parseFloat(r.tw) || 0, parseFloat(r.ig) || 0, 1);
                    const twPct = ((parseFloat(r.tw) || 0) / max) * 100;
                    const igPct = ((parseFloat(r.ig) || 0) / max) * 100;
                    return (
                        <div key={r.metric} className="h2h-row">
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tw)' }}>{r.tw}</span>
                                <div className="h2h-bar-l" style={{ width: `${twPct}%` }}></div>
                            </div>
                            <div className="h2h-metric">{r.metric}</div>
                            <div>
                                <div className="h2h-bar-r" style={{ width: `${igPct}%` }}></div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ig)' }}>{r.ig}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Row 4: Charts */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Daily Subs Distribution</div>
                    <div className="chart-box" style={{ height: '200px' }}>
                        <Bar data={subsChartData} options={chartOpts} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Conversion Rate Over Time</div>
                    <div className="chart-box" style={{ height: '200px' }}>
                        <Line data={{
                            labels: last14.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })),
                            datasets: [{
                                label: 'Conv %',
                                data: last14.map(day => {
                                    const dayConvos = fLogs.filter(l => l.date && l.date.startsWith(day)).reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
                                    const daySubs = fSubs.filter(s => s.date && s.date.startsWith(day)).reduce((s, e) => s + (e.total || 0), 0);
                                    return dayConvos > 0 ? parseFloat(((daySubs / dayConvos) * 100).toFixed(2)) : 0;
                                }),
                                borderColor: '#00C4FF',
                                backgroundColor: 'rgba(0,196,255,0.08)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 2,
                            }]
                        }} options={chartOpts} />
                    </div>
                </div>
            </div>

            {/* Row 5: Day-of-Week + Best/Worst */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Day-of-Week Performance</div>
                    {dowNames.map((name, i) => (
                        <div key={name} className="dow-row">
                            <div className="dow-label">{name}</div>
                            <div className="dow-bar-wrap">
                                <div className="dow-bar" style={{ width: `${(dowData[i] / maxDow) * 100}%`, background: 'linear-gradient(90deg,var(--tw),var(--of))' }}></div>
                            </div>
                            <div className="dow-val">{dowData[i]}</div>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <div className="card-title">Best & Worst Days</div>
                    {bestDays.length === 0 ? <div className="empty">No sub data yet</div> : (
                        <>
                            <div style={{ fontSize: '9px', color: 'var(--green)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Best</div>
                            {bestDays.map(([date, count]) => (
                                <div key={'b' + date} className="an-stat-row">
                                    <span className="an-stat-label">{date}</span>
                                    <span className="an-stat-val" style={{ color: 'var(--green)' }}>+{count}</span>
                                </div>
                            ))}
                            <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '12px 0 8px' }}>Worst</div>
                            {worstDays.map(([date, count]) => (
                                <div key={'w' + date} className="an-stat-row">
                                    <span className="an-stat-label">{date}</span>
                                    <span className="an-stat-val" style={{ color: 'var(--red)' }}>+{count}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Row 6: Refill + Cost */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Refill History & Spend</div>
                    {fRefills.length === 0 ? <div className="empty">No refills in this period</div> : (
                        fRefills.slice(0, 8).map(r => (
                            <div key={r.id} className="an-stat-row">
                                <span className="an-stat-label">{(r.date || '').split('T')[0] || '—'} · <span style={{ color: r.platform === 'tw' ? 'var(--tw)' : 'var(--ig)' }}>{r.platform === 'tw' ? '𝕏' : '◎'}</span></span>
                                <span className="an-stat-val">+{r.amount}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="card">
                    <div className="card-title">Cost Analysis</div>
                    {[
                        { label: 'Total Spend', val: `$${totalCost.toFixed(2)}` },
                        { label: 'TW Spend', val: `$${(totalTwSpent * costTw).toFixed(2)}` },
                        { label: 'IG Spend', val: `$${(totalIgSpent * costIg).toFixed(2)}` },
                        { label: 'Cost per Sub (avg)', val: cps === '—' ? '—' : `$${cps}` },
                        { label: 'TW Cost/Sub', val: totalTwSubs > 0 ? `$${((totalTwSpent * costTw) / totalTwSubs).toFixed(2)}` : '—' },
                        { label: 'IG Cost/Sub', val: totalIgSubs > 0 ? `$${((totalIgSpent * costIg) / totalIgSubs).toFixed(2)}` : '—' },
                    ].map(r => (
                        <div key={r.label} className="an-stat-row">
                            <span className="an-stat-label">{r.label}</span>
                            <span className="an-stat-val" style={{ color: 'var(--purple)' }}>{r.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 7: Streaks */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Streaks & Consistency</div>
                {[
                    { label: 'Current Logging Streak', val: `${currentStreak} days` },
                    { label: 'Longest Streak', val: `${maxStreak} days` },
                    { label: 'Total Days Logged', val: logDates.size },
                    { label: 'Consistency', val: `${logDates.size > 0 ? Math.round((logDates.size / daysActive) * 100) : 0}%` },
                ].map(r => (
                    <div key={r.label} className="an-stat-row">
                        <span className="an-stat-label">{r.label}</span>
                        <span className="an-stat-val">{r.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeepAnalytics;
