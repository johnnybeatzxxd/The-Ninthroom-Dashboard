import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const WeeklyReport = () => {
    const { activeModelId } = useContext(AppContext);
    const { showToast } = useToast();
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState('plain');
    const [report, setReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copyText, setCopyText] = useState('Copy');

    // Quick weeks (last 4 Sundays)
    const getQuickWeeks = () => {
        const weeks = [];
        const today = new Date();
        const day = today.getDay();
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - day);
        for (let i = 0; i < 4; i++) {
            const d = new Date(lastSunday);
            d.setDate(lastSunday.getDate() - (i * 7));
            weeks.push(d.toISOString().split('T')[0]);
        }
        return weeks;
    };
    const quickWeeks = getQuickWeeks();

    useEffect(() => {
        if (!endDate) setEndDate(quickWeeks[0] || new Date().toISOString().split('T')[0]);
    }, []);

    const generateReport = async () => {
        if (!activeModelId || !endDate) return;
        setIsGenerating(true);
        try {
            const end = new Date(endDate + 'T23:59:59');
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            const startStr = start.toISOString().split('T')[0];
            const endStr = endDate;

            const [logs, subs, settings] = await Promise.all([
                api.logs.getForModel(activeModelId),
                api.subs.getForModel(activeModelId),
                api.settings.getForModel(activeModelId)
            ]);

            const wkLogs = logs.filter(l => l.date && l.date.split('T')[0] >= startStr && l.date.split('T')[0] <= endStr);
            const wkSubs = subs.filter(s => s.date && s.date.split('T')[0] >= startStr && s.date.split('T')[0] <= endStr);

            const twSpent = wkLogs.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0);
            const igSpent = wkLogs.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0);
            const totalConvos = twSpent + igSpent;
            const twSubs = wkSubs.reduce((s, e) => s + (e.twSubs || 0), 0);
            const igSubs = wkSubs.reduce((s, e) => s + (e.igSubs || 0), 0);
            const totalSubs = twSubs + igSubs;
            const convRate = totalConvos > 0 ? ((totalSubs / totalConvos) * 100).toFixed(1) : '0.0';
            const costTw = settings?.costTw || 0.07;
            const costIg = settings?.costIg || 0.07;
            const totalCost = (twSpent * costTw) + (igSpent * costIg);
            const cps = totalSubs > 0 ? (totalCost / totalSubs).toFixed(2) : 'N/A';
            const daysActive = new Set(wkLogs.map(l => l.date ? l.date.split('T')[0] : null).filter(Boolean)).size;

            // Find Top Day
            const dayMap = {};
            wkSubs.forEach(s => {
                const d = s.date.split('T')[0];
                dayMap[d] = (dayMap[d] || 0) + (s.total || 0);
            });
            let topDayStr = '—';
            let topSubs = 0;
            Object.entries(dayMap).forEach(([d, count]) => {
                if (count > topSubs) {
                    topSubs = count;
                    topDayStr = d.split('-').slice(1).join('/'); // MM/DD
                }
            });

            const kpis = [
                { label: 'TOTAL CONVOS', val: totalConvos.toLocaleString() },
                { label: 'TOTAL SUBS', val: `+${totalSubs}` },
                { label: 'CONV RATE', val: `${convRate}%` },
                { label: 'COST/SUB', val: cps === 'N/A' ? 'N/A' : `$${cps}` },
            ];

            let text = '';
            const sep = format === 'markdown' ? '---' : format === 'slack' ? '---' : '────────────────────────';

            if (format === 'markdown') {
                text = `# Weekly Report\n**${startStr} → ${endStr}**\n\n`;
                text += `## Summary\n`;
                text += `| Metric | Value |\n|--------|-------|\n`;
                text += `| Total Convos | ${totalConvos} |\n`;
                text += `| New Subs | +${totalSubs} |\n`;
                text += `| Conv Rate | ${convRate}% |\n`;
                text += `| Cost/Sub | ${cps === 'N/A' ? 'N/A' : '$' + cps} |\n`;
                text += `| Top Day | ${topSubs > 0 ? `${topDayStr} (+${topSubs})` : '—'} |\n`;
                text += `| Total Spend | $${totalCost.toFixed(2)} |\n`;
            } else if (format === 'slack') {
                text = `*Weekly Report: ${startStr} → ${endStr}*\n${sep}\n\n`;
                text += `📊 *Convos:* ${totalConvos} total\n`;
                text += `⭐ *New Subs:* +${totalSubs}\n`;
                text += `📈 *Conv Rate:* ${convRate}%\n`;
                text += `🔥 *Top Day:* ${topSubs > 0 ? `${topDayStr} (+${topSubs})` : '—'}\n`;
                text += `💰 *Cost/Sub:* ${cps === 'N/A' ? 'N/A' : '$' + cps}\n`;
                text += `💵 *Total Spend:* $${totalCost.toFixed(2)}`;
            } else {
                text = `WEEKLY REPORT: ${startStr} → ${endStr}\n${sep}\n\n`;
                text += `SUMMARY\n`;
                text += `  Total Convos:  ${totalConvos}\n`;
                text += `  New Subs:      +${totalSubs}\n`;
                text += `  Conv Rate:     ${convRate}%\n`;
                text += `  Cost/Sub:      ${cps === 'N/A' ? 'N/A' : '$' + cps}\n`;
                text += `  Top Day:       ${topSubs > 0 ? `${topDayStr} (+${topSubs})` : '—'}\n`;
                text += `  Total Spend:   $${totalCost.toFixed(2)}\n`;
            }

            setReport({ text, kpis, twSpent, igSpent, twSubs, igSubs, totalConvos, totalSubs, topDay: topSubs > 0 ? `${topDayStr} (+${topSubs})` : '—', totalCost: totalCost.toFixed(2), convRate });
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyReport = () => {
        if (!report) return;
        navigator.clipboard.writeText(report.text).then(() => {
            setCopyText('Copied!');
            showToast('Copied ✓', 'Report text copied to clipboard', 'var(--green)');
            setTimeout(() => setCopyText('Copy'), 2000);
        });
    };

    if (!activeModelId) return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;

    return (
        <div className="page active" id="pg-report">
            <div className="page-hd">
                <div>
                    <div className="page-title">Weekly Report</div>
                    <div className="page-sub">Auto-generated performance summary · ready to copy &amp; share</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="field" style={{ margin: '0' }}>
                        <input className="inp" type="date" style={{ width: '160px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn-sm" onClick={generateReport} disabled={isGenerating}>
                        {isGenerating ? 'Generating…' : 'Generate →'}
                    </button>
                </div>
            </div>

            {/* Quick week selector */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {quickWeeks.map(w => (
                    <button key={w} className={`filter-btn ${endDate === w ? 'active' : ''}`}
                        onClick={() => { setEndDate(w); }}>
                        Week ending {new Date(w + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </button>
                ))}
            </div>

            {!report ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px', opacity: '.3' }}>📋</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', fontSize: '16px', marginBottom: '6px', color: 'var(--sub)' }}>Select a week and generate</div>
                    <div>Pick an end date above or choose a quick week below</div>
                </div>
            ) : (
                <div>
                    {/* KPIs */}
                    <div className="g4" style={{ marginBottom: '14px' }}>
                        {report.kpis.map(k => (
                            <div key={k.label} className="an-kpi">
                                <div className="an-kpi-label">{k.label}</div>
                                <div className="an-kpi-val">{k.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Report text */}
                    <div className="card" style={{ marginBottom: '14px' }}>
                        <div className="card-title" style={{ marginBottom: '12px' }}>
                            Report Text
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button className="btn-sm" onClick={copyReport}>{copyText}</button>
                                <select className="inp" value={format} onChange={e => { setFormat(e.target.value); }} style={{ width: '110px', padding: '5px 10px', fontSize: '10.5px' }}>
                                    <option value="plain">Plain text</option>
                                    <option value="markdown">Markdown</option>
                                    <option value="slack">Slack</option>
                                </select>
                            </div>
                        </div>
                        <div style={{
                            background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px',
                            padding: '20px', fontSize: '12px', lineHeight: '1.9', color: 'var(--text)',
                            whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace",
                            maxHeight: '400px', overflowY: 'auto', marginBottom: '14px'
                        }}>{report.text}</div>

                        <div className="card-title" style={{ fontSize: '11px', marginBottom: '8px' }}>Performance Table</div>
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Twitter</th>
                                    <th>Instagram</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Convos Spent</td>
                                    <td>{report.twSpent}</td>
                                    <td>{report.igSpent}</td>
                                    <td style={{ fontWeight: 'bold' }}>{report.totalConvos}</td>
                                </tr>
                                <tr>
                                    <td>New Subs</td>
                                    <td>+{report.twSubs}</td>
                                    <td>+{report.igSubs}</td>
                                    <td style={{ color: 'var(--of)', fontWeight: 'bold' }}>+{report.totalSubs}</td>
                                </tr>
                                <tr>
                                    <td>Conversion</td>
                                    <td style={{ color: 'var(--tw)' }}>{report.twSpent > 0 ? ((report.twSubs / report.twSpent) * 100).toFixed(1) : '0.0'}%</td>
                                    <td style={{ color: 'var(--ig)' }}>{report.igSpent > 0 ? ((report.igSubs / report.igSpent) * 100).toFixed(1) : '0.0'}%</td>
                                    <td><span className="tbadge tbadge-sub">{report.convRate}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '11px', color: 'var(--sub)' }}>
                            <span style={{ color: 'var(--purple)', fontWeight: 'bold' }}>Weekly Efficiency:</span> Top performing day was <span style={{ color: 'var(--of)' }}>{report.topDay}</span> · Total Est. Cost: <span style={{ color: 'var(--green)' }}>${report.totalCost}</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="g2">
                        <div className="card">
                            <div className="card-title"><span className="pill pill-tw">𝕏</span> Twitter Breakdown</div>
                            {[
                                { label: 'Convos Spent', val: report.twSpent },
                                { label: 'New Subs', val: `+${report.twSubs}` },
                                { label: 'Conversion', val: report.twSpent > 0 ? `${((report.twSubs / report.twSpent) * 100).toFixed(2)}%` : '—' },
                            ].map(r => (
                                <div key={r.label} className="an-stat-row">
                                    <span className="an-stat-label">{r.label}</span>
                                    <span className="an-stat-val">{r.val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-title"><span className="pill pill-ig">◎</span> Instagram Breakdown</div>
                            {[
                                { label: 'Convos Spent', val: report.igSpent },
                                { label: 'New Subs', val: `+${report.igSubs}` },
                                { label: 'Conversion', val: report.igSpent > 0 ? `${((report.igSubs / report.igSpent) * 100).toFixed(2)}%` : '—' },
                            ].map(r => (
                                <div key={r.label} className="an-stat-row">
                                    <span className="an-stat-label">{r.label}</span>
                                    <span className="an-stat-val">{r.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyReport;
