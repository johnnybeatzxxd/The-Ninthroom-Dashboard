import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const RefillConvos = () => {
    const { activeModelId } = useContext(AppContext);
    const { showToast } = useToast();

    const [refills, setRefills] = useState([]);
    const [stats, setStats] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [platform, setPlatform] = useState('tw');
    const [amount, setAmount] = useState('');
    const [newBalance, setNewBalance] = useState('');

    const loadData = async () => {
        if (!activeModelId) {
            setRefills([]);
            return;
        }
        try {
            const [refillData, statsData] = await Promise.all([
                api.refills.getForModel(activeModelId),
                api.logs.getOverviewStats(activeModelId)
            ]);
            setRefills(refillData.reverse());
            setStats(statsData);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeModelId]);

    const handleSubmit = async () => {
        if (!activeModelId || !amount || !newBalance) return;
        setIsSubmitting(true);
        try {
            await api.refills.create(activeModelId, {
                date: new Date().toISOString().split('T')[0],
                platform,
                amount: parseInt(amount),
                newBalance: parseInt(newBalance)
            });
            setAmount('');
            setNewBalance('');
            await loadData();
            showToast('Refill logged ✓', (platform === 'tw' ? 'Twitter' : 'Instagram') + ': +' + amount + ' convos added', 'var(--of)');
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
        <div className="page active" id="pg-refill">
            <div className="page-hd">
                <div>
                    <div className="page-title">Refill Convos</div>
                    <div className="page-sub">Log when you purchase a new convo package</div>
                </div>
            </div>
            <div className="g2">
                <div className="card">
                    <div className="fsec-title">Add Refill</div>
                    <div className="form-row">
                        <div className="field">
                            <label>Platform</label>
                            <select className="inp" value={platform} onChange={e => setPlatform(e.target.value)} disabled={isSubmitting}>
                                <option value="tw">Twitter</option>
                                <option value="ig">Instagram</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Convos Purchased</label>
                            <input className="inp" type="number" placeholder="e.g. 1000" min="1" value={amount} onChange={e => {
                                setAmount(e.target.value);
                                const current = platform === 'tw' ? (stats?.convoBalance?.tw || 0) : (stats?.convoBalance?.ig || 0);
                                const amt = parseInt(e.target.value || 0);
                                setNewBalance(String(current + amt));
                            }} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>New Total Balance After Refill</label>
                            <input className="inp" type="number" placeholder="e.g. 1000" value={newBalance} onChange={e => setNewBalance(e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting || !amount || !newBalance}>Confirm Refill →</button>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title">Refill History</div>
                    {refills.length === 0 ? (
                        <div className="empty" style={{ margin: 'auto' }}>No refills logged</div>
                    ) : (
                        <table className="tbl" style={{ marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Platform</th>
                                    <th>Amount</th>
                                    <th>New Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refills.slice(0, 10).map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontSize: '11px', color: 'var(--sub)' }}>{r.date}</td>
                                        <td>{r.platform === 'tw' ? <span style={{ color: 'var(--tw)', fontSize: '12px' }}>𝕏 Twitter</span> : <span style={{ color: 'var(--ig)', fontSize: '12px' }}>◎ Instagram</span>}</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--green)' }}>+{r.amount}</td>
                                        <td>{r.newBalance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefillConvos;
