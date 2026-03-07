import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import StatCard from '../shared/StatCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const Instagram = () => {
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
            console.error("Failed to load IG stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [activeModelId]);

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '—';
        return Math.round(num).toLocaleString();
    };

    const ig = stats?.igStats;
    const remaining = ig?.remaining || 0;
    const avgPerDay = ig?.avgPerDay || 0;
    const daysLeft = avgPerDay > 0 ? Math.round(remaining / avgPerDay) : '∞';
    const accCount = settings?.igAccounts || 1;
    const perAccDay = avgPerDay > 0 ? Math.round(avgPerDay / accCount) : 0;

    // Subs per account
    const totalIgSubs = subs.reduce((s, e) => s + (e.igSubs || 0), 0);
    const igSubsPerAcc = accCount > 0 ? (totalIgSubs / accCount).toFixed(1) : '0.0';

    // Cost per sub
    const totalIgSpent = logs.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0);
    const costPerConvo = settings?.costIg || 0.07;
    const cps = totalIgSubs > 0 ? ((totalIgSpent * costPerConvo) / totalIgSubs).toFixed(2) : '—';

    // Budget progress
    const totalRefilled = remaining + (ig?.spentAllTime || 0);
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
    const igSpentByDay = chartDays.map(day => {
        const dayLogs = logs.filter(l => l.date && l.date.startsWith(day));
        return dayLogs.reduce((sum, l) => sum + (parseInt(l.igSpent) || 0), 0);
    });

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'IG Convos',
            data: igSpentByDay,
            backgroundColor: 'rgba(225,48,108,0.6)',
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

    // Log History — IG only, last 10
    const igLogs = logs.filter(l => parseInt(l.igSpent) > 0 || parseInt(l.igRemaining) > 0).slice(0, 10);

    return (
        <div className="page active" id="pg-instagram">
            <div className="page-hd">
                <div>
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Instagram <span className="pill pill-ig">◎</span></div>
                    <div className="page-sub">Convo consumption · balance tracking</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc ig">
                    <div className="sc-label">Current Balance</div>
                    <div className="sc-val">{isLoading ? '...' : formatNumber(remaining)}</div>
                    <div className="sc-delta">convos remaining</div>
                    <div className="prog-wrap">
                        <div className="prog-track">
                            <div className="prog-fill" style={{ width: `${budgetPct}%`, background: 'var(--ig)' }}></div>
                        </div>
                    </div>
                </div>
                <StatCard platform="ig" label="Avg Daily Spend" value={isLoading ? '...' : formatNumber(avgPerDay)} delta="per day · all-time avg" />
                <StatCard platform="ig" label="Est. Days Left" value={isLoading ? '...' : String(daysLeft)} delta="at current rate" />
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <StatCard platform="ig" label="Convos per Account / Day" value={isLoading ? '...' : formatNumber(perAccDay)} delta={<>across <span>{accCount}</span> accounts</>} />
                <StatCard platform="gn" label="Subs per Account / Total" value={isLoading ? '...' : igSubsPerAcc} delta="all-time avg" valueColor="var(--green)" />
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
                            {igLogs.length === 0 ? (
                                <tr><td colSpan="4" className="empty">No data yet</td></tr>
                            ) : (
                                igLogs.map(l => (
                                    <tr key={l.id}>
                                        <td style={{ fontSize: '11px', color: 'var(--sub)' }}>{l.date}</td>
                                        <td className="num">{formatNumber(l.igRemaining)}</td>
                                        <td className="num" style={{ color: 'var(--ig)' }}>{formatNumber(l.igSpent)}</td>
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

export default Instagram;
