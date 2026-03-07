import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const Goals = () => {
    const { activeModelId, models } = useContext(AppContext);
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalTarget, setTotalTarget] = useState('');
    const [twTarget, setTwTarget] = useState('');
    const [igTarget, setIgTarget] = useState('');

    // Subs progress
    const [subsData, setSubsData] = useState({ total: 0, tw: 0, ig: 0 });

    useEffect(() => {
        if (!activeModelId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);

        Promise.all([
            api.goals.getForModel(activeModelId),
            api.subs.getForModel(activeModelId)
        ]).then(([goals, subs]) => {
            setTotalTarget(goals.targetSubs || '');
            setTwTarget(goals.twTarget || '');
            setIgTarget(goals.igTarget || '');

            // Aggregate current month subs
            const now = new Date();
            const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const monthSubs = subs.filter(s => s.date && s.date.startsWith(monthStr));
            setSubsData({
                total: monthSubs.reduce((sum, s) => sum + (s.total || 0), 0),
                tw: monthSubs.reduce((sum, s) => sum + (s.twSubs || 0), 0),
                ig: monthSubs.reduce((sum, s) => sum + (s.igSubs || 0), 0)
            });
            setIsLoading(false);
        });
    }, [activeModelId]);

    const handleSave = async () => {
        if (!activeModelId) return;
        setIsSubmitting(true);
        try {
            await api.goals.save(activeModelId, {
                targetSubs: parseInt(totalTarget || 0),
                twTarget: parseInt(twTarget || 0),
                igTarget: parseInt(igTarget || 0)
            });
            const modelName = models.find(m => m.id === activeModelId)?.name || 'model';
            showToast('Goals saved ✓', 'Targets updated for ' + modelName, 'var(--green)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pct = (current, target) => {
        if (!target || target === 0) return 0;
        return Math.min(100, Math.round((current / target) * 100));
    };

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

    // Auto-calculate total target from TW + IG when total is not manually set
    const parsedTw = parseInt(twTarget || 0);
    const parsedIg = parseInt(igTarget || 0);
    const parsedTotal = parseInt(totalTarget || 0);
    const effectiveTotalTarget = parsedTotal > 0 ? parsedTotal : (parsedTw + parsedIg);

    const totalPct = pct(subsData.total, effectiveTotalTarget);
    const twPct = pct(subsData.tw, parsedTw);
    const igPct = pct(subsData.ig, parsedIg);

    // Daily required calculation
    const getDailyRequired = (current, target) => {
        const t = parseInt(target || 0);
        if (t <= current) return 0;
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const remaining = lastDay - now.getDate() + 1; // including today
        return ((t - current) / Math.max(1, remaining)).toFixed(1);
    };

    const totalDaily = getDailyRequired(subsData.total, effectiveTotalTarget);
    const twDaily = getDailyRequired(subsData.tw, twTarget);
    const igDaily = getDailyRequired(subsData.ig, igTarget);

    return (
        <div className="page active" id="pg-goals">
            <div className="page-hd">
                <div>
                    <div className="page-title">Goals</div>
                    <div className="page-sub">Monthly subscriber target</div>
                </div>
            </div>

            {/* Progress bars */}
            <div className="card" style={{ marginBottom: '14px' }}>
                {isLoading ? (
                    <div className="empty">Loading...</div>
                ) : !effectiveTotalTarget ? (
                    <div className="empty">Set a monthly target to see progress</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Total progress */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text)' }}>Total Subs</span>
                                <span style={{ color: 'var(--green)' }}>{subsData.total} / {effectiveTotalTarget} ({totalPct}%)</span>
                            </div>
                            <div style={{ background: 'var(--s2)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${totalPct}%`, height: '100%', background: 'var(--green)', borderRadius: '6px', transition: 'width 0.3s' }}></div>
                            </div>
                            {totalPct < 100 && (
                                <div style={{ fontSize: '10px', color: 'var(--sub)', marginTop: '8px', textAlign: 'right' }}>
                                    Need <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>{totalDaily}/day</span> to hit target
                                </div>
                            )}
                        </div>
                        {/* TW progress */}
                        {twTarget && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--tw)' }}>𝕏 Twitter</span>
                                    <span style={{ color: 'var(--tw)' }}>{subsData.tw} / {twTarget} ({twPct}%)</span>
                                </div>
                                <div style={{ background: 'var(--s2)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${twPct}%`, height: '100%', background: 'var(--tw)', borderRadius: '6px', transition: 'width 0.3s' }}></div>
                                </div>
                                {twPct < 100 && (
                                    <div style={{ fontSize: '10px', color: 'var(--sub)', marginTop: '6px', textAlign: 'right' }}>
                                        Need <span style={{ color: 'var(--tw)', fontWeight: 'bold' }}>{twDaily}/day</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* IG progress */}
                        {igTarget && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--ig)' }}>◎ Instagram</span>
                                    <span style={{ color: 'var(--ig)' }}>{subsData.ig} / {igTarget} ({igPct}%)</span>
                                </div>
                                <div style={{ background: 'var(--s2)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${igPct}%`, height: '100%', background: 'var(--ig)', borderRadius: '6px', transition: 'width 0.3s' }}></div>
                                </div>
                                {igPct < 100 && (
                                    <div style={{ fontSize: '10px', color: 'var(--sub)', marginTop: '6px', textAlign: 'right' }}>
                                        Need <span style={{ color: 'var(--ig)', fontWeight: 'bold' }}>{igDaily}/day</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Target inputs */}
            <div className="card" style={{ maxWidth: '520px' }}>
                <div className="fsec-title">Monthly Subs Targets</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Total target <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(TW + IG combined)</span></label>
                        <input className="inp" type="number" placeholder="e.g. 200" min="1" value={totalTarget} onChange={e => setTotalTarget(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter target</label>
                        <input className="inp" type="number" placeholder="e.g. 120" min="1" value={twTarget} onChange={e => setTwTarget(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram target</label>
                        <input className="inp" type="number" placeholder="e.g. 80" min="1" value={igTarget} onChange={e => setIgTarget(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>Save Targets →</button>
            </div>
        </div>
    );
};

export default Goals;
