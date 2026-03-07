import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const LogToday = () => {
    const { activeModelId } = useContext(AppContext);
    const { showToast } = useToast();

    const [stats, setStats] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const getToday = () => new Date().toISOString().split('T')[0];
    const [twBalance, setTwBalance] = useState('');
    const [twDate, setTwDate] = useState(getToday());
    const [twNote, setTwNote] = useState('');

    const [igBalance, setIgBalance] = useState('');
    const [igDate, setIgDate] = useState(getToday());
    const [igNote, setIgNote] = useState('');

    useEffect(() => {
        if (activeModelId) {
            api.logs.getOverviewStats(activeModelId).then(setStats);
        } else {
            setStats(null);
        }
    }, [activeModelId]);

    const prevTw = stats?.convoBalance?.tw || 0;
    const prevIg = stats?.convoBalance?.ig || 0;

    const twSpent = twBalance !== '' ? Math.max(0, prevTw - parseInt(twBalance)) : '—';
    const igSpent = igBalance !== '' ? Math.max(0, prevIg - parseInt(igBalance)) : '—';

    const handleLogTw = async () => {
        if (!activeModelId || !twBalance) return;
        setIsSubmitting(true);
        try {
            await api.logs.create(activeModelId, {
                date: twDate,
                twSpent,
                twRemaining: parseInt(twBalance),
                note: twNote
            });
            // Reset & refresh
            setTwBalance('');
            setTwNote('');
            const newStats = await api.logs.getOverviewStats(activeModelId);
            setStats(newStats);
            showToast('Logged ✓', 'Twitter: ' + twBalance + ' remaining', 'var(--green)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogIg = async () => {
        if (!activeModelId || !igBalance) return;
        setIsSubmitting(true);
        try {
            await api.logs.create(activeModelId, {
                date: igDate,
                igSpent,
                igRemaining: parseInt(igBalance),
                note: igNote
            });
            // Reset & refresh
            setIgBalance('');
            setIgNote('');
            const newStats = await api.logs.getOverviewStats(activeModelId);
            setStats(newStats);
            showToast('Logged ✓', 'Instagram: ' + igBalance + ' remaining', 'var(--green)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

    return (
        <div className="page active" id="pg-log">
            <div className="page-hd">
                <div>
                    <div className="page-title">Log Today</div>
                    <div className="page-sub">Enter current convo balance — spend is calculated automatically</div>
                </div>
            </div>
            <div className="g2">
                <div className="card">
                    <div className="fsec-title"><span className="pill pill-tw">𝕏</span> Twitter Report</div>
                    <div className="form-row">
                        <div className="field">
                            <label>Current Convo Balance</label>
                            <input className="inp" type="number" placeholder="e.g. 860" min="0" value={twBalance} onChange={e => setTwBalance(e.target.value)} disabled={isSubmitting} />
                        </div>
                        <div className="field">
                            <label>Date</label>
                            <input className="inp" type="date" value={twDate} onChange={e => setTwDate(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="calc-prev">
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Last known balance</span><span>{prevTw}</span></div>
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Calculated spend</span><span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700' }}>{twSpent}</span></div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" placeholder="What worked? Any issues?" value={twNote} onChange={e => setTwNote(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn-primary btn-tw" onClick={handleLogTw} disabled={isSubmitting || !twBalance}>Save Twitter Report →</button>
                </div>

                <div className="card">
                    <div className="fsec-title"><span className="pill pill-ig">◎</span> Instagram Report</div>
                    <div className="form-row">
                        <div className="field">
                            <label>Current Convo Balance</label>
                            <input className="inp" type="number" placeholder="e.g. 720" min="0" value={igBalance} onChange={e => setIgBalance(e.target.value)} disabled={isSubmitting} />
                        </div>
                        <div className="field">
                            <label>Date</label>
                            <input className="inp" type="date" value={igDate} onChange={e => setIgDate(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="calc-prev">
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Last known balance</span><span>{prevIg}</span></div>
                        <div className="calc-line"><span style={{ color: 'var(--sub)' }}>Calculated spend</span><span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700' }}>{igSpent}</span></div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" placeholder="What worked? Any issues?" value={igNote} onChange={e => setIgNote(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn-primary btn-ig" onClick={handleLogIg} disabled={isSubmitting || !igBalance}>Save Instagram Report →</button>
                </div>
            </div>

            <div className="card">
                <div className="card-title">How to automate this</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '11.5px', color: 'var(--sub)', lineHeight: '1.75' }}>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>① Telegram Bot</div>
                        Bot messages each manager at 8PM: "How many convos left?" They reply with one number → bot updates the dashboard via webhook. Zero effort from you. <span style={{ color: 'var(--of)' }}>Free.</span>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>② Make.com Flow</div>
                        Managers fill a Google Form → Make.com parses and pushes data here automatically. Setup takes ~1 hour, then it runs itself. <span style={{ color: 'var(--of)' }}>$0–9/mo.</span>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>③ Direct API</div>
                        If your mass-DM software has an API, Make.com can pull the convo balance every few hours automatically. Full autopilot. <span style={{ color: 'var(--of)' }}>Tell me what software you use.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogToday;
