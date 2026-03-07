import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import StatCard from '../shared/StatCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const Twitter = () => {
    const { activeModelId } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [subs, setSubs] = useState([]);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!activeModelId) { setStats(null); setLogs([]); setSubs([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const [data, logsData, subsData, settingsData] = await Promise.all([
                api.logs.getOverviewStats(activeModelId),
                api.logs.getForModel(activeModelId),
                api.subs.getForModel(activeModelId),
                api.settings.getForModel(activeModelId)
            ]);
            setStats(data);
            setLogs(logsData);
            setSubs(subsData);
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to load TW stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [activeModelId]);

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '—';
        return Math.round(num).toLocaleString();
    };

    const tw = stats?.twStats;
    const remaining = tw?.remaining || 0;
    const avgPerDay = tw?.avgPerDay || 0;
    const daysLeft = avgPerDay > 0 ? Math.round(remaining / avgPerDay) : '∞';
    const accCount = settings?.twAccounts || 1;
    const perAccDay = avgPerDay > 0 ? Math.round(avgPerDay / accCount) : 0;

    // Subs per account
    const totalTwSubs = subs.reduce((s, e) => s + (e.twSubs || 0), 0);
    const twSubsPerAcc = accCount > 0 ? (totalTwSubs / accCount).toFixed(1) : '0.0';

    // Cost per sub
    const totalTwSpent = logs.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0);
    const costPerConvo = settings?.costTw || 0.07;
    const cps = totalTwSubs > 0 ? ((totalTwSpent * costPerConvo) / totalTwSubs).toFixed(2) : '—';

    // Budget progress
    const totalRefilled = remaining + (tw?.spentAllTime || 0);
    const budgetPct = totalRefilled > 0 ? Math.round((remaining / totalRefilled) * 100) : 0;

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

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'TW Convos',
            data: twSpentByDay,
            backgroundColor: 'rgba(29,155,240,0.6)',
            borderRadius: 3,
            barPercentage: 0.7,
        }]
    };
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { tooltip: { mode: 'index' }, legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#454A62', font: { size: 9, family: "'JetBrains Mono'" } } },
            y: { grid: { color: 'rgba(28,31,43,0.5)' }, ticks: { color: '#454A62', font: { size: 9 } } }
        }
    };

    // Log History — TW only, last 10
    const twLogs = logs.filter(l => parseInt(l.twSpent) > 0 || parseInt(l.twRemaining) > 0).slice(0, 10);

    return (
        <div className="page active" id="pg-twitter">
            <div className="page-hd">
                <div>
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Twitter <span className="pill pill-tw">𝕏</span></div>
                    <div className="page-sub">Convo consumption · balance tracking</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc tw">
                    <div className="sc-label">Current Balance</div>
                    <div className="sc-val">{isLoading ? '...' : formatNumber(remaining)}</div>
                    <div className="sc-delta">convos remaining</div>
                    <div className="prog-wrap">
                        <div className="prog-track">
                            <div className="prog-fill" style={{ width: `${budgetPct}%`, background: 'var(--tw)' }}></div>
                        </div>
                    </div>
                </div>
                <StatCard platform="tw" label="Avg Daily Spend" value={isLoading ? '...' : formatNumber(avgPerDay)} delta="per day · all-time avg" />
                <StatCard platform="tw" label="Est. Days Left" value={isLoading ? '...' : String(daysLeft)} delta="at current rate" />
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <StatCard platform="tw" label="Convos per Account / Day" value={isLoading ? '...' : formatNumber(perAccDay)} delta={<>across <span>{accCount}</span> accounts</>} />
                <StatCard platform="gn" label="Subs per Account / Total" value={isLoading ? '...' : twSubsPerAcc} delta="all-time avg" valueColor="var(--green)" />
                <StatCard platform="pu" label="Cost per Sub" value={isLoading ? '...' : (cps === '—' ? '—' : `$${cps}`)} delta="all-time avg" valueColor="var(--purple)" />
            </div>

            <div className="g2">
                <div className="card">
                    <div className="card-title">Convos Spent Per Day</div>
                    <div className="chart-box" style={{ height: '190px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Log History</div>
                    <table className="tbl">
                        <thead><tr><th>Date</th><th>Remaining</th><th>Spent</th><th>Note</th></tr></thead>
                        <tbody>
                            {twLogs.length === 0 ? (
                                <tr><td colSpan="4" className="empty">No data yet</td></tr>
                            ) : (
                                twLogs.map(l => (
                                    <tr key={l.id}>
                                        <td style={{ fontSize: '11px', color: 'var(--sub)' }}>{l.date}</td>
                                        <td className="num">{formatNumber(l.twRemaining)}</td>
                                        <td className="num" style={{ color: 'var(--tw)' }}>{formatNumber(l.twSpent)}</td>
                                        <td style={{ fontSize: '10px', color: 'var(--muted)' }}>{l.note || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Twitter;
