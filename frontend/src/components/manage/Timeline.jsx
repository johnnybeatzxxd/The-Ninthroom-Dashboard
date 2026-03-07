import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, BarController, LineController, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, BarController, LineController, Title, Tooltip, Legend);

const Timeline = () => {
    const { activeModelId } = useContext(AppContext);
    const { showToast } = useToast();

    const [events, setEvents] = useState([]);
    const [logs, setLogs] = useState([]);
    const [subs, setSubs] = useState([]);
    const [frame, setFrame] = useState(30);
    const [showTw, setShowTw] = useState(true);
    const [showIg, setShowIg] = useState(true);
    const [showSubs, setShowSubs] = useState(true);
    const [showConv, setShowConv] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form
    const getToday = () => new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(getToday());
    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('strategy');
    const [platform, setPlatform] = useState('both');
    const [note, setNote] = useState('');

    const loadData = async () => {
        if (!activeModelId) {
            setEvents([]); setLogs([]); setSubs([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [evData, logsData, subsData] = await Promise.all([
                api.timeline.getForModel(activeModelId),
                api.logs.getForModel(activeModelId),
                api.subs.getForModel(activeModelId)
            ]);
            setEvents(evData.reverse());
            setLogs(logsData);
            setSubs(subsData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [activeModelId]);

    const handleAdd = async () => {
        if (!activeModelId || !label.trim()) return;
        setIsSubmitting(true);
        try {
            await api.timeline.create(activeModelId, { date, label: label.trim(), category, platform, note });
            showToast('Event added ✓', label, categoryColors[category] || 'var(--of)');
            setLabel(''); setNote('');
            await loadData();
        } catch (e) { console.error(e); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id, modelId) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await api.timeline.delete(id, modelId);
            await loadData();
            showToast('Cleared', 'Event deleted', 'var(--red)');
        }
        catch (e) { console.error(e); }
    };

    const categoryColors = { strategy: 'var(--of)', content: 'var(--green)', pricing: 'var(--yellow)', account: 'var(--tw)', other: 'var(--muted)' };

    // --- CHART DATA PREP ---
    const daysArr = [];
    const limit = frame === 0 ? 365 : frame; // 0 = All (max 365 for sanity)
    for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        daysArr.push(d.toISOString().split('T')[0]);
    }

    const labels = daysArr.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' }));

    const twData = daysArr.map(d => logs.filter(l => l.date && l.date.startsWith(d)).reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0));
    const igData = daysArr.map(d => logs.filter(l => l.date && l.date.startsWith(d)).reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0));
    const totalSpentData = daysArr.map((_, i) => twData[i] + igData[i]);
    const subsData = daysArr.map(d => subs.filter(s => s.date && s.date.startsWith(d)).reduce((sum, e) => sum + (e.total || 0), 0));
    const convData = daysArr.map((d, i) => {
        const convos = twData[i] + igData[i];
        return convos > 0 ? parseFloat(((subsData[i] / convos) * 100).toFixed(1)) : 0;
    });

    // We can add events as scatter points or just rely on the table below. Let's add them as points on the x-axis (y=0) for visual markers.
    const eventPoints = daysArr.map(d => {
        const evs = events.filter(e => e.date && e.date.startsWith(d));
        return evs.length > 0 ? 0 : null; // Plot a point at 0 if there's an event
    });

    const datasets = [];
    if (showTw) datasets.push({ type: 'bar', label: 'TW Convos', data: twData, backgroundColor: 'rgba(29,155,240,.4)', borderColor: '#1D9BF0', borderWidth: 1, borderRadius: 4, yAxisID: 'y' });
    if (showIg) datasets.push({ type: 'bar', label: 'IG Convos', data: igData, backgroundColor: 'rgba(225,48,108,.4)', borderColor: '#E1306C', borderWidth: 1, borderRadius: 4, yAxisID: 'y' });

    // Total Spent Line
    datasets.push({ type: 'line', label: 'Total Convos', data: totalSpentData, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 5], tension: 0.3, yAxisID: 'y', pointRadius: 0 });

    if (showSubs) datasets.push({ type: 'line', label: 'Subs', data: subsData, borderColor: '#0FD688', backgroundColor: 'rgba(15,214,136,.08)', fill: false, tension: 0.35, pointRadius: 3, pointBackgroundColor: '#0FD688', borderWidth: 2, yAxisID: 'y' });
    if (showConv) datasets.push({ type: 'line', label: 'Conv %', data: convData, borderColor: '#00C4FF', backgroundColor: 'rgba(0,196,255,.04)', fill: false, tension: 0.35, pointRadius: 3, pointBackgroundColor: '#00C4FF', borderWidth: 2, yAxisID: 'y2' });

    // Event markers dataset
    datasets.push({
        type: 'line',
        label: 'Events',
        data: eventPoints,
        borderColor: '#a371f7',
        backgroundColor: '#a371f7',
        pointRadius: ctx => ctx.raw !== null ? 6 : 0,
        pointStyle: 'triangle',
        showLine: false,
        yAxisID: 'y'
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { usePointStyle: true } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#8B91A8', font: { size: 9 }, maxTicksLimit: 15 } },
            y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Convos / Subs', color: '#454A62', font: { size: 10 } }, grid: { color: 'rgba(28,31,43,0.5)' }, ticks: { color: '#8B91A8', font: { size: 9 } } },
            y2: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Conv %', color: '#454A62', font: { size: 10 } }, grid: { drawOnChartArea: false }, ticks: { color: '#00C4FF', font: { size: 9 }, callback: v => v + '%' } }
        }
    };

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

    return (
        <div className="page active" id="pg-timeline">
            <div className="page-hd">
                <div>
                    <div className="page-title">Timeline</div>
                    <div className="page-sub">Performance over time with custom event annotations</div>
                </div>
            </div>

            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: '4px' }}>Timeframe</span>
                    {[7, 14, 30, 60, 90, 180, 0].map(val => (
                        <button key={val} className={`filter-btn ${frame === val ? 'active' : ''}`} onClick={() => setFrame(val)}>
                            {val === 0 ? '1Y' : val === 180 ? '6M' : val + 'D'}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: '4px' }}>Show</span>
                    <button className={`filter-btn ${showTw ? 'active' : ''}`} onClick={() => setShowTw(!showTw)}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tw)', marginRight: '4px' }}></span>TW Convos</button>
                    <button className={`filter-btn ${showIg ? 'active' : ''}`} onClick={() => setShowIg(!showIg)}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ig)', marginRight: '4px' }}></span>IG Convos</button>
                    <button className={`filter-btn ${showSubs ? 'active' : ''}`} onClick={() => setShowSubs(!showSubs)}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', marginRight: '4px' }}></span>Subs</button>
                    <button className={`filter-btn ${showConv ? 'active' : ''}`} onClick={() => setShowConv(!showConv)}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--of)', marginRight: '4px' }}></span>Conv %</button>
                </div>
            </div>

            {/* Main chart */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="chart-box" style={{ height: '320px' }}>
                    {isLoading ? <div className="empty">Loading...</div> : <Chart type="line" data={{ labels, datasets }} options={chartOptions} />}
                </div>
            </div>

            {/* Events list + add form */}
            <div className="g2">
                <div className="card">
                    <div className="fsec-title">Add Event Marker</div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Date</label>
                            <input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Label</label>
                            <input className="inp" type="text" placeholder="e.g. CTA Changed, New Script, Price Drop…" maxLength="60" value={label} onChange={e => setLabel(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="field">
                            <label>Category</label>
                            <select className="inp" value={category} onChange={e => setCategory(e.target.value)} disabled={isSubmitting}>
                                <option value="strategy">Strategy</option>
                                <option value="content">Content</option>
                                <option value="pricing">Pricing</option>
                                <option value="account">Account</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Platform</label>
                            <select className="inp" value={platform} onChange={e => setPlatform(e.target.value)} disabled={isSubmitting}>
                                <option value="both">Both</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" placeholder="More details…" value={note} onChange={e => setNote(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#1a0a40,var(--purple))' }} onClick={handleAdd} disabled={isSubmitting || !label.trim()}>Add Event →</button>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title">Events <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'none', letterSpacing: '0' }}>{events.length} total</span></div>
                    {isLoading ? (
                        <div className="empty" style={{ margin: 'auto' }}>Loading...</div>
                    ) : events.length === 0 ? (
                        <div className="empty" style={{ margin: 'auto' }}>No events yet — add your first marker</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            {events.slice(0, 15).map(ev => (
                                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--s2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: categoryColors[ev.category] || 'var(--muted)', flexShrink: 0 }}></div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{ev.label}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                                            {ev.date} · {ev.category} · {ev.platform}
                                            {ev.note ? ` · ${ev.note}` : ''}
                                        </div>
                                    </div>
                                    <button className="ev-del" onClick={() => handleDelete(ev.id, ev.modelId)} title="Delete event">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
