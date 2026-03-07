import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../lib/api';

const History = () => {
    const { activeModelId } = useContext(AppContext);

    const [logs, setLogs] = useState([]);
    const [subs, setSubs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!activeModelId) {
            setLogs([]);
            setSubs([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        Promise.all([
            api.logs.getForModel(activeModelId),
            api.subs.getForModel(activeModelId)
        ]).then(([logsData, subsData]) => {
            setLogs(logsData);
            setSubs(subsData);
            setIsLoading(false);
        });
    }, [activeModelId]);

    // Merge into a unified list
    const allEntries = [
        ...logs.map(l => ({ ...l, type: 'convo', sortDate: l.date })),
        ...subs.map(s => ({ ...s, type: 'subs', sortDate: s.date }))
    ].sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || ''));

    const filtered = filter === 'all' ? allEntries :
        filter === 'twitter' ? allEntries.filter(e => e.type === 'convo' && e.twSpent) :
            filter === 'instagram' ? allEntries.filter(e => e.type === 'convo' && e.igSpent) :
                filter === 'subs' ? allEntries.filter(e => e.type === 'subs') : allEntries;

    // Stats
    const twAvg = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (parseInt(l.twSpent) || 0), 0) / logs.length) : 0;
    const igAvg = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (parseInt(l.igSpent) || 0), 0) / logs.length) : 0;
    const twSubsTotal = subs.reduce((s, e) => s + (e.twSubs || 0), 0);
    const igSubsTotal = subs.reduce((s, e) => s + (e.igSubs || 0), 0);

    // Best day
    let bestDay = '—';
    let bestDaySub = 'no data';
    if (subs.length > 0) {
        const best = subs.reduce((max, s) => (s.total || 0) > (max.total || 0) ? s : max, subs[0]);
        bestDay = `+${best.total}`;
        bestDaySub = best.date || 'unknown';
    }

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

    return (
        <div className="page active" id="pg-history">
            <div className="page-hd">
                <div>
                    <div className="page-title">History</div>
                    <div className="page-sub">Full log — convos &amp; subscribers</div>
                </div>
                <div className="filter-bar">
                    {['all', 'twitter', 'instagram', 'subs'].map(f => (
                        <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'All' : f === 'twitter' ? 'Twitter' : f === 'instagram' ? 'Instagram' : 'OF Subs'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Avg Convos / Day</div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Twitter</div><div className="sc-val" style={{ fontSize: '22px' }}>{twAvg}</div></div>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Instagram</div><div className="sc-val" style={{ fontSize: '22px' }}>{igAvg}</div></div>
                    </div>
                </div>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Total OF Subs</div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Twitter</div><div className="sc-val" style={{ fontSize: '22px', color: 'var(--green)' }}>{twSubsTotal}</div></div>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Instagram</div><div className="sc-val" style={{ fontSize: '22px', color: 'var(--green)' }}>{igSubsTotal}</div></div>
                    </div>
                </div>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Best Day (Subs)</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', fontSize: '22px', marginTop: '4px', color: 'var(--green)' }}>{bestDay}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{bestDaySub}</div>
                </div>
            </div>

            <div className="card">
                <div className="hist-row hdr">
                    <span>Date</span><span>Type</span><span>Platform</span><span>Note</span>
                    <span style={{ textAlign: 'right' }}>Balance</span>
                    <span style={{ textAlign: 'right' }}>Spent</span>
                    <span style={{ textAlign: 'right' }}>OF Subs</span>
                </div>
                {isLoading ? (
                    <div className="empty" style={{ padding: '20px' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty" style={{ padding: '20px' }}>No entries yet</div>
                ) : (
                    filtered.slice(0, 30).map(entry => (
                        <div key={entry.id} className="hist-row">
                            <span style={{ fontSize: '11px', color: 'var(--sub)' }}>{entry.sortDate || '—'}</span>
                            <span>
                                {entry.type === 'convo' ? (
                                    <span className="tbadge tbadge-sub">Convo</span>
                                ) : (
                                    <span className="tbadge" style={{ background: 'rgba(0,200,100,.1)', color: 'var(--green)' }}>Subs</span>
                                )}
                            </span>
                            <span style={{ fontSize: '11px' }}>
                                {entry.type === 'convo' ? (
                                    <>
                                        {entry.twSpent ? <span style={{ color: 'var(--tw)', marginRight: '6px' }}>𝕏</span> : null}
                                        {entry.igSpent ? <span style={{ color: 'var(--ig)' }}>◎</span> : null}
                                    </>
                                ) : 'Both'}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{entry.note || '—'}</span>
                            <span style={{ textAlign: 'right', fontSize: '12px' }}>
                                {entry.type === 'convo' ? (entry.twRemaining || entry.igRemaining || '—') : '—'}
                            </span>
                            <span style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                                {entry.type === 'convo' ? (entry.twSpent || entry.igSpent || '—') : '—'}
                            </span>
                            <span style={{ textAlign: 'right', fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>
                                {entry.type === 'subs' ? `+${entry.total}` : '—'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
