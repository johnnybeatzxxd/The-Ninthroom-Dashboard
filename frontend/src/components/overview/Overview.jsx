import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import StatCard from '../shared/StatCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip);

const Overview = ({ setActivePage }) => {
    const { activeModelId } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [subs, setSubs] = useState([]);
    const [goals, setGoals] = useState(null);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!activeModelId) {
            setStats(null); setLogs([]); setSubs([]); setGoals(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [data, logsData, subsData, goalsData, settingsData] = await Promise.all([
                api.logs.getOverviewStats(activeModelId),
                api.logs.getForModel(activeModelId),
                api.subs.getForModel(activeModelId),
                api.goals.getForModel(activeModelId),
                api.settings.getForModel(activeModelId)
            ]);
            setStats(data);
            setLogs(logsData);
            setSubs(subsData);
            setGoals(goalsData);
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to load overview stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [activeModelId]);

    const formatNumber = (num, isCurrency = false) => {
        if (num === null || num === undefined || isNaN(num)) return '—';
        if (isCurrency) return `$${num.toFixed(2)}`;
        return Math.round(num).toLocaleString();
    };

    // Chart data — last 14 days
    const getLast14Days = () => {
        const days = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const chartDays = getLast14Days();
    const chartLabels = chartDays.map(d => { const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' }); });

    const twSpentByDay = chartDays.map(day => {
        const dayLogs = logs.filter(l => l.date && l.date.startsWith(day));
        return dayLogs.reduce((sum, l) => sum + (parseInt(l.twSpent) || 0), 0);
    });
    const igSpentByDay = chartDays.map(day => {
        const dayLogs = logs.filter(l => l.date && l.date.startsWith(day));
        return dayLogs.reduce((sum, l) => sum + (parseInt(l.igSpent) || 0), 0);
    });

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Twitter',
                data: twSpentByDay,
                backgroundColor: 'rgba(29,155,240,0.6)',
                borderRadius: 3,
                barPercentage: 0.6,
            },
            {
                label: 'Instagram',
                data: igSpentByDay,
                backgroundColor: 'rgba(225,48,108,0.6)',
                borderRadius: 3,
                barPercentage: 0.6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { tooltip: { mode: 'index', intersect: false }, legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#454A62', font: { size: 9, family: "'JetBrains Mono'" } } },
            y: { grid: { color: 'rgba(28,31,43,0.5)' }, ticks: { color: '#454A62', font: { size: 9 } } }
        }
    };

    // Recent activity (last 5 entries merged)
    const recentEntries = [
        ...logs.map(l => ({ ...l, type: 'convo', sortDate: l.date })),
        ...subs.map(s => ({ ...s, type: 'subs', sortDate: s.date }))
    ].sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || '')).slice(0, 5);

    // Subs stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySubs = subs.filter(s => s.date && s.date.startsWith(todayStr));
    const todayTwSubs = todaySubs.reduce((s, e) => s + (e.twSubs || 0), 0);
    const todayIgSubs = todaySubs.reduce((s, e) => s + (e.igSubs || 0), 0);
    const totalSubsAll = subs.reduce((s, e) => s + (e.total || 0), 0);
    const twSubsAll = subs.reduce((s, e) => s + (e.twSubs || 0), 0);
    const igSubsAll = subs.reduce((s, e) => s + (e.igSubs || 0), 0);

    // Goal progress
    const goalTarget = goals?.targetSubs || 0;
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthSubs = subs.filter(s => s.date && s.date.startsWith(monthStr));
    const monthTotal = monthSubs.reduce((sum, s) => sum + (s.total || 0), 0);
    const goalPct = goalTarget > 0 ? Math.min(100, Math.round((monthTotal / goalTarget) * 100)) : 0;

    // Derived Metrics
    const twSpentToday = stats?.twStats?.spentToday || 0;
    const igSpentToday = stats?.igStats?.spentToday || 0;
    const twConvRate = twSpentToday > 0 ? ((todayTwSubs / twSpentToday) * 100).toFixed(1) + '%' : '0.0%';
    const igConvRate = igSpentToday > 0 ? ((todayIgSubs / igSpentToday) * 100).toFixed(1) + '%' : '0.0%';

    const twAccs = parseInt(settings?.twAccounts || 1);
    const igAccs = parseInt(settings?.igAccounts || 1);
    const twSubsPerAcc = (twSubsAll / twAccs).toFixed(1);
    const igSubsPerAcc = (igSubsAll / igAccs).toFixed(1);

    // Convo balance meter
    const twBal = stats?.convoBalance?.tw || 0;
    const igBal = stats?.convoBalance?.ig || 0;
    const totalBal = twBal + igBal;
    const maxBal = Math.max(totalBal, 1);

    return (
        <div className="page active" id="pg-overview">
            <div className="page-hd">
                <div>
                    <div className="page-title">Overview</div>
                    <div className="page-sub">All platforms · Convo balance &amp; subscriber snapshot</div>
                </div>
                <button className="btn-sm" onClick={() => setActivePage('log')}>+ Log Today</button>
            </div>

            {/* Compact Goal Bar */}
            {goalTarget > 0 && (
                <div style={{ marginBottom: '14px', padding: '16px 20px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg,var(--of),var(--tw),var(--ig),transparent)' }}></div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Month Goal</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text)' }}>Total Subs</span>
                        <span style={{ color: 'var(--green)' }}>{monthTotal} / {goalTarget} ({goalPct}%)</span>
                    </div>
                    <div style={{ background: 'var(--s3)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${goalPct}%`, height: '100%', borderRadius: '4px', background: 'var(--green)', transition: 'width 0.9s cubic-bezier(.16,1,.3,1)' }}></div>
                    </div>
                    <button onClick={() => setActivePage('goals')} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', padding: 0 }}>View full Goals →</button>
                </div>
            )}

            {/* Convo Balance */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Convo Balance</div>
                <div>
                    {isLoading ? (
                        <div className="empty">Loading...</div>
                    ) : totalBal === 0 ? (
                        <div className="empty">No data yet — log a report to see balances</div>
                    ) : (
                        <div>
                            {/* Twitter meter */}
                            <div className="meter-row">
                                <div className="meter-plat"><span className="pill pill-tw">𝕏 Twitter</span></div>
                                <div className="meter-bar-wrap">
                                    <div className="meter-bar-lbl">
                                        <span>{formatNumber(twBal)} remaining</span>
                                        <span>{totalBal > 0 ? Math.round((twBal / maxBal) * 100) : 0}%</span>
                                    </div>
                                    <div className="meter-bar-track">
                                        <div className="meter-bar-fill" style={{ width: `${totalBal > 0 ? Math.round((twBal / maxBal) * 100) : 0}%`, background: 'var(--tw)' }}></div>
                                    </div>
                                </div>
                                <div className="meter-stat">
                                    <div className="meter-num" style={{ color: 'var(--tw)' }}>{formatNumber(twBal)}</div>
                                    <div className="meter-cap">convos left</div>
                                </div>
                            </div>
                            {/* Instagram meter */}
                            <div className="meter-row">
                                <div className="meter-plat"><span className="pill pill-ig">◎ Instagram</span></div>
                                <div className="meter-bar-wrap">
                                    <div className="meter-bar-lbl">
                                        <span>{formatNumber(igBal)} remaining</span>
                                        <span>{totalBal > 0 ? Math.round((igBal / maxBal) * 100) : 0}%</span>
                                    </div>
                                    <div className="meter-bar-track">
                                        <div className="meter-bar-fill" style={{ width: `${totalBal > 0 ? Math.round((igBal / maxBal) * 100) : 0}%`, background: 'var(--ig)' }}></div>
                                    </div>
                                </div>
                                <div className="meter-stat">
                                    <div className="meter-num" style={{ color: 'var(--ig)' }}>{formatNumber(igBal)}</div>
                                    <div className="meter-cap">convos left</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TW + IG Stat Columns */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--tw)', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '0 2px' }}>𝕏 Twitter</div>
                    <StatCard platform="tw" label="TW Convos Spent Today" value={isLoading ? '...' : formatNumber(stats?.twStats?.spentToday)} delta="convos used" />
                    <StatCard platform="tw" label="TW Remaining" value={isLoading ? '...' : formatNumber(stats?.twStats?.remaining)} delta="of total refilled budget" />
                    <StatCard platform="tw" label="TW Avg Convos / Day" value={isLoading ? '...' : formatNumber(stats?.twStats?.avgPerDay)} delta="all-time average" />
                    <StatCard platform="of" label="TW Conv Rate" value={twConvRate} delta="subs ÷ convos today" valueColor="var(--of)" />
                    <StatCard platform="gn" label={<><span className="pill pill-tw">TW</span> New Subs Today</>} value={formatNumber(todayTwSubs)} delta={`${formatNumber(twSubsAll)} all time`} valueColor="var(--green)" />
                    <StatCard platform="gn" label="TW Subs / Account" value={twSubsPerAcc} delta={`${twAccs} active accounts`} valueColor="var(--green)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--ig)', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '0 2px' }}>◎ Instagram</div>
                    <StatCard platform="ig" label="IG Convos Spent Today" value={isLoading ? '...' : formatNumber(stats?.igStats?.spentToday)} delta="convos used" />
                    <StatCard platform="ig" label="IG Remaining" value={isLoading ? '...' : formatNumber(stats?.igStats?.remaining)} delta="of total refilled budget" />
                    <StatCard platform="ig" label="IG Avg Convos / Day" value={isLoading ? '...' : formatNumber(stats?.igStats?.avgPerDay)} delta="all-time average" />
                    <StatCard platform="of" label="IG Conv Rate" value={igConvRate} delta="subs ÷ convos today" valueColor="var(--of)" />
                    <StatCard platform="gn" label={<><span className="pill pill-ig">IG</span> New Subs Today</>} value={formatNumber(todayIgSubs)} delta={`${formatNumber(igSubsAll)} all time`} valueColor="var(--green)" />
                    <StatCard platform="gn" label="IG Subs / Account" value={igSubsPerAcc} delta={`${igAccs} active accounts`} valueColor="var(--green)" />
                </div>
            </div>

            {/* Totals row */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <StatCard platform="gn" label="Total Subs Today" value={formatNumber(todayTwSubs + todayIgSubs)} delta="both platforms" valueColor="var(--green)" />
                <StatCard platform="gn" label="All-Time Subs" value={formatNumber(totalSubsAll)} delta="since tracking began" valueColor="var(--green)" />
            </div>

            {/* Chart + Recent Activity */}
            <div className="g2">
                <div className="card">
                    <div className="card-title">Daily Convo Spend — 14 days</div>
                    <div className="chart-box" style={{ height: '200px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Recent Activity</div>
                    {recentEntries.length === 0 ? (
                        <div className="empty">Nothing logged yet</div>
                    ) : (
                        <div>
                            {recentEntries.map(entry => (
                                <div key={entry.id} className="sub-row">
                                    <div style={{ fontSize: '10px', color: 'var(--muted)', width: '80px' }}>{entry.sortDate}</div>
                                    {entry.type === 'convo' ? (
                                        <>
                                            <span className="tbadge tbadge-dlg">Convo</span>
                                            <span style={{ flex: 1, fontSize: '11px', color: 'var(--sub)' }}>
                                                {entry.twSpent ? <span style={{ color: 'var(--tw)', marginRight: 8 }}>𝕏 -{entry.twSpent}</span> : null}
                                                {entry.igSpent ? <span style={{ color: 'var(--ig)' }}>◎ -{entry.igSpent}</span> : null}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="tbadge tbadge-sub">+Subs</span>
                                            <div className="sub-big">+{entry.total}</div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
