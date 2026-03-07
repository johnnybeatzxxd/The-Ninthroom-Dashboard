import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip);

const OFSubs = () => {
    const { activeModelId } = useContext(AppContext);
    const { showToast } = useToast();

    const [stats, setStats] = useState(null);
    const [subsLogs, setSubsLogs] = useState([]);
    const [logsData, setLogsData] = useState([]);
    const [settingsData, setSettingsData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const getToday = () => new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(getToday());
    const [twSubs, setTwSubs] = useState('');
    const [igSubs, setIgSubs] = useState('');
    const [note, setNote] = useState('');

    const loadData = async () => {
        if (!activeModelId) {
            setStats(null);
            setSubsLogs([]);
            return;
        }

        try {
            const [overview, subsHistory, allLogs, st] = await Promise.all([
                api.logs.getOverviewStats(activeModelId),
                api.subs.getForModel(activeModelId),
                api.logs.getForModel(activeModelId),
                api.settings.getForModel(activeModelId)
            ]);
            setStats(overview);
            setSubsLogs(subsHistory.reverse());
            setLogsData(allLogs);
            setSettingsData(st);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeModelId]);

    const handleSubmit = async () => {
        if (!activeModelId) return;
        const totalTw = parseInt(twSubs || 0);
        const totalIg = parseInt(igSubs || 0);

        if (totalTw === 0 && totalIg === 0) {
            showToast('Error', 'Enter at least one number', 'var(--red)');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.subs.create(activeModelId, {
                date,
                twSubs: totalTw,
                igSubs: totalIg,
                total: totalTw + totalIg,
                note
            });

            // Reset & reload
            setTwSubs('');
            setIgSubs('');
            setNote('');
            await loadData();
            showToast('Logged ✓', `TW: +${totalTw} · IG: +${totalIg} · Total: +${totalTw + totalIg}`, 'var(--green)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate aggregated subs metrics using the history
    const totalLifetime = subsLogs.reduce((sum, s) => sum + (s.total || 0), 0);
    const twSubsAll = subsLogs.reduce((sum, s) => sum + (s.twSubs || 0), 0);
    const igSubsAll = subsLogs.reduce((sum, s) => sum + (s.igSubs || 0), 0);

    const todayLog = subsLogs.find(s => s.date && s.date.startsWith(getToday()));
    const todayTwSubs = todayLog ? todayLog.twSubs : 0;
    const todayIgSubs = todayLog ? todayLog.igSubs : 0;
    const todayTotalSubs = todayTwSubs + todayIgSubs;

    const weekLogs = subsLogs.slice(0, 7);
    const weekTotal = weekLogs.reduce((sum, s) => sum + (s.total || 0), 0);

    const formatRate = (rate) => {
        if (isNaN(rate) || !isFinite(rate)) return "0.0%";
        return (rate * 100).toFixed(1) + "%";
    };

    // Conversion metrics - align with Overview
    const todayStr = getToday();
    const todayLogs = logsData.filter(l => l.date && l.date.startsWith(todayStr));
    const twSpentToday = todayLogs.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0);
    const igSpentToday = todayLogs.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0);
    const totalSpentToday = twSpentToday + igSpentToday;

    const convToday = totalSpentToday > 0 ? ((todayTotalSubs / totalSpentToday) * 100).toFixed(1) + '%' : '0.0%';
    const twConvToday = twSpentToday > 0 ? ((todayTwSubs / twSpentToday) * 100).toFixed(1) + '%' : '0.0%';
    const igConvToday = igSpentToday > 0 ? ((todayIgSubs / igSpentToday) * 100).toFixed(1) + '%' : '0.0%';

    const last7Days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7Days.push(d.toISOString().split('T')[0]); }
    const wkConvos = logsData.filter(l => last7Days.includes(l.date.split('T')[0])).reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
    const wkSubsTotal = subsLogs.filter(s => last7Days.includes(s.date.split('T')[0])).reduce((s, e) => s + (e.total || 0), 0);
    const conv7 = wkConvos > 0 ? ((wkSubsTotal / wkConvos) * 100).toFixed(1) + '%' : '0.0%';

    const totalTwConvos = logsData.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0);
    const totalIgConvos = logsData.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0);
    const twConvAvg = totalTwConvos > 0 ? ((twSubsAll / totalTwConvos) * 100).toFixed(1) + '%' : '0.0%';
    const igConvAvg = totalIgConvos > 0 ? ((igSubsAll / totalIgConvos) * 100).toFixed(1) + '%' : '0.0%';

    // Cost per sub
    const costTw = settingsData?.costTw || 0.07;
    const costIg = settingsData?.costIg || 0.07;
    const cpsTodayVal = todayTotalSubs > 0 ? ((twSpentToday * costTw + igSpentToday * costIg) / todayTotalSubs).toFixed(2) : '—';
    const cpsTw = twSubsAll > 0 ? ((totalTwConvos * costTw) / twSubsAll).toFixed(2) : '—';
    const cpsIg = igSubsAll > 0 ? ((totalIgConvos * costIg) / igSubsAll).toFixed(2) : '—';

    // Chart data — last 14 days
    const last14 = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last14.push(d.toISOString().split('T')[0]); }
    const chartLabels = last14.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' }));

    const subsChartData = {
        labels: chartLabels,
        datasets: [
            { label: 'TW Subs', data: last14.map(day => subsLogs.filter(s => s.date && s.date.startsWith(day)).reduce((sum, s) => sum + (s.twSubs || 0), 0)), backgroundColor: 'rgba(29,155,240,0.6)', borderRadius: 3 },
            { label: 'IG Subs', data: last14.map(day => subsLogs.filter(s => s.date && s.date.startsWith(day)).reduce((sum, s) => sum + (s.igSubs || 0), 0)), backgroundColor: 'rgba(225,48,108,0.6)', borderRadius: 3 },
        ]
    };

    const convChartData = {
        labels: chartLabels,
        datasets: [{
            label: 'Conv %',
            data: last14.map(day => {
                const dc = logsData.filter(l => l.date && l.date.startsWith(day)).reduce((s, l) => s + (parseInt(l.twSpent) || 0) + (parseInt(l.igSpent) || 0), 0);
                const ds = subsLogs.filter(s => s.date && s.date.startsWith(day)).reduce((sum, e) => sum + (e.total || 0), 0);
                return dc > 0 ? parseFloat(((ds / dc) * 100).toFixed(2)) : 0;
            }),
            borderColor: '#00C4FF',
            backgroundColor: 'rgba(0,196,255,0.08)',
            fill: true, tension: 0.4, pointRadius: 2,
        }]
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#454A62', font: { size: 8 } } },
            y: { grid: { color: 'rgba(28,31,43,0.5)' }, ticks: { color: '#454A62', font: { size: 9 } } }
        }
    };

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

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
                    <div className="sc-val" style={{ color: 'var(--green)' }}>{todayTwSubs}</div>
                    <div className="sc-delta">from Twitter</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label"><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> New Subs Today</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }}>{todayIgSubs}</div>
                    <div className="sc-delta">from Instagram</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label">This Week</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }}>{weekTotal}</div>
                    <div className="sc-delta">last 7 days</div>
                </div>
                <div className="sc gn">
                    <div className="sc-label">All-Time Total</div>
                    <div className="sc-val" style={{ color: 'var(--green)' }}>{totalLifetime}</div>
                    <div className="sc-delta">since tracking</div>
                </div>
            </div>

            <div className="g4" style={{ marginTop: '0', marginBottom: '14px' }}>
                <div className="sc of" style={{ position: 'relative' }}>
                    <div className="sc-label">Conversion Today</div>
                    <div className="sc-val" style={{ color: 'var(--of)' }}>{convToday}</div>
                    <div className="sc-delta">convos → subs</div>
                    <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '30px', opacity: '0.06', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '900' }}>%</div>
                </div>
                <div className="sc of">
                    <div className="sc-label">7-Day Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--of)' }}>{conv7}</div>
                    <div className="sc-delta">rolling average</div>
                </div>
                <div className="sc tw">
                    <div className="sc-label"><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--tw)' }}>{twConvAvg}</div>
                    <div className="sc-delta">convos → subs</div>
                </div>
                <div className="sc ig">
                    <div className="sc-label"><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Avg Conversion</div>
                    <div className="sc-val" style={{ color: 'var(--ig)' }}>{igConvAvg}</div>
                    <div className="sc-delta">convos → subs</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Today</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }}>{cpsTodayVal === '—' ? '—' : `$${cpsTodayVal}`}</div>
                    <div className="sc-delta">at ${costTw}/convo</div>
                </div>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Twitter</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }}>{cpsTw === '—' ? '—' : `$${cpsTw}`}</div>
                    <div className="sc-delta">all-time avg</div>
                </div>
                <div className="sc pu">
                    <div className="sc-label">Cost per Sub — Instagram</div>
                    <div className="sc-val" style={{ color: 'var(--purple)' }}>{cpsIg === '—' ? '—' : `$${cpsIg}`}</div>
                    <div className="sc-delta">all-time avg</div>
                </div>
            </div>

            {/* Charts disabled for mockup presentation speed */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">
                        Daily New Subs — 14 days
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--tw)', display: 'inline-block', borderRadius: '2px' }}></span>Twitter</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--ig)', display: 'inline-block', borderRadius: '2px' }}></span>Instagram</span>
                        </div>
                    </div>
                    <div className="chart-box" style={{ height: '210px' }}><Bar data={subsChartData} options={chartOpts} /></div>
                </div>
                <div className="card">
                    <div className="card-title">
                        Conversion Rate % — 14 days
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--of)', display: 'inline-block', borderRadius: '2px' }}></span>Daily %</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--sub)' }}><span style={{ width: '10px', height: '3px', background: 'var(--yellow)', display: 'inline-block', borderRadius: '2px', borderStyle: 'dashed' }}></span>Avg</span>
                        </div>
                    </div>
                    <div className="chart-box" style={{ height: '210px' }}><Line data={convChartData} options={chartOpts} /></div>
                </div>
            </div>

            <div className="g2">
                <div className="card">
                    <div className="fsec-title">Log New Subs</div>
                    <div className="form-row full" style={{ marginBottom: '14px' }}>
                        <div className="field">
                            <label>Date</label>
                            <input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ marginBottom: '10px' }}><span className="pill pill-tw">𝕏 Twitter</span></div>
                            <div className="field">
                                <label>New subs from Twitter</label>
                                <input className="inp" type="number" placeholder="0" min="0" value={twSubs} onChange={e => setTwSubs(e.target.value)} disabled={isSubmitting} />
                            </div>
                        </div>
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ marginBottom: '10px' }}><span className="pill pill-ig">◎ Instagram</span></div>
                            <div className="field">
                                <label>New subs from Instagram</label>
                                <input className="inp" type="number" placeholder="0" min="0" value={igSubs} onChange={e => setIgSubs(e.target.value)} disabled={isSubmitting} />
                            </div>
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" placeholder="Promo, discount, best content?" value={note} onChange={e => setNote(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn-primary btn-gn" onClick={handleSubmit} disabled={isSubmitting}>Save Subscriber Report →</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="card-title">Recent Entries</div>
                        {subsLogs.length === 0 ? (
                            <div className="empty" style={{ margin: 'auto' }}>No data yet</div>
                        ) : (
                            <table className="tbl" style={{ marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Subs</th>
                                        <th>Platform Split</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subsLogs.slice(0, 5).map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontSize: '11px', color: 'var(--sub)' }}>{log.date}</td>
                                            <td style={{ fontWeight: 'bold' }}>+{log.total}</td>
                                            <td>
                                                <span style={{ color: 'var(--tw)', fontSize: '11px', marginRight: '8px' }}>𝕏 {log.twSubs}</span>
                                                <span style={{ color: 'var(--ig)', fontSize: '11px' }}>◎ {log.igSubs}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OFSubs;
