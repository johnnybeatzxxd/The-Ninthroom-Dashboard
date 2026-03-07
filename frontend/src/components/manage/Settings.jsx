import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const Settings = () => {
    const { activeModelId, reloadModels } = useContext(AppContext);
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [warnBelow, setWarnBelow] = useState('300');
    const [critBelow, setCritBelow] = useState('100');
    const [defaultPkg, setDefaultPkg] = useState('1000');
    const [costTw, setCostTw] = useState('0.07');
    const [costIg, setCostIg] = useState('0.07');
    const [twAccounts, setTwAccounts] = useState('1');
    const [igAccounts, setIgAccounts] = useState('1');
    const [timezone, setTimezone] = useState('America/New_York');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [resetDate, setResetDate] = useState('');
    const [resetWhat, setResetWhat] = useState('all');

    useEffect(() => {
        if (!activeModelId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        api.settings.getForModel(activeModelId).then(s => {
            if (s.warnBelow) setWarnBelow(String(s.warnBelow));
            if (s.critBelow) setCritBelow(String(s.critBelow));
            if (s.defaultPkg) setDefaultPkg(String(s.defaultPkg));
            if (s.costTw) setCostTw(String(s.costTw));
            if (s.costIg) setCostIg(String(s.costIg));
            if (s.twAccounts) setTwAccounts(String(s.twAccounts));
            if (s.igAccounts) setIgAccounts(String(s.igAccounts));
            if (s.timezone) setTimezone(s.timezone);
            setIsLoading(false);
        });
    }, [activeModelId]);

    const handleSaveSettings = async () => {
        if (!activeModelId) return;
        setIsSubmitting(true);
        try {
            await api.settings.save(activeModelId, {
                warnBelow: parseInt(warnBelow),
                critBelow: parseInt(critBelow),
                defaultPkg: parseInt(defaultPkg),
                costTw: parseFloat(costTw),
                costIg: parseFloat(costIg),
                twAccounts: parseInt(twAccounts),
                igAccounts: parseInt(igAccounts)
            });
            showToast('Settings saved', 'Configuration updated', 'var(--green)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveTimezone = async () => {
        if (!activeModelId) return;
        setIsSubmitting(true);
        try {
            const existing = await api.settings.getForModel(activeModelId);
            await api.settings.save(activeModelId, { ...existing, timezone });
            showToast('Timezone saved ✓', timezone.split('/').pop().replace('_', ' '), 'var(--tw)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePin = async () => {
        if (pin.length !== 4 || pin !== pinConfirm) {
            alert('PINs must match and be 4 digits');
            return;
        }
        setIsSubmitting(true);
        try {
            const existing = await api.settings.getForModel(activeModelId);
            await api.settings.save(activeModelId, { ...existing, pin });
            setPin('');
            setPinConfirm('');
            showToast('PIN updated ✓', 'New PIN saved successfully', 'var(--purple)');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAll = () => {
        if (!window.confirm('Are you sure? This will delete ALL data and cannot be undone.')) return;
        localStorage.removeItem('ninth_room_dashboard_data');
        reloadModels();
        alert('All data has been cleared. Please refresh the page.');
    };

    if (!activeModelId) {
        return <div className="page active" style={{ padding: '40px' }}><div className="empty">Select or add a model first.</div></div>;
    }

    return (
        <div className="page active" id="pg-settings">
            <div className="page-hd">
                <div>
                    <div className="page-title">Settings</div>
                    <div className="page-sub">Thresholds, costs &amp; account configuration</div>
                </div>
            </div>
            <div className="g3">
                <div className="form-row">
                    <div className="field"><label>Warning below (convos left)</label><input className="inp" type="number" placeholder="300" value={warnBelow} onChange={e => setWarnBelow(e.target.value)} disabled={isSubmitting} /></div>
                    <div className="field"><label>Critical below (convos left)</label><input className="inp" type="number" placeholder="100" value={critBelow} onChange={e => setCritBelow(e.target.value)} disabled={isSubmitting} /></div>
                </div>
                <div className="form-row full">
                    <div className="field"><label>Default Package Size</label><input className="inp" type="number" placeholder="1000" value={defaultPkg} onChange={e => setDefaultPkg(e.target.value)} disabled={isSubmitting} /></div>
                </div>

                <div className="divider"></div>
                <div className="fsec-title" style={{ marginBottom: '14px' }}>Cost per Convo ($)</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter</label>
                        <input className="inp" type="number" placeholder="0.07" step="0.001" min="0" value={costTw} onChange={e => setCostTw(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram</label>
                        <input className="inp" type="number" placeholder="0.07" step="0.001" min="0" value={costIg} onChange={e => setCostIg(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>

                <div className="divider"></div>
                <div className="fsec-title" style={{ marginBottom: '14px' }}>Active Accounts</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter accounts</label>
                        <input className="inp" type="number" placeholder="1" min="1" value={twAccounts} onChange={e => setTwAccounts(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram accounts</label>
                        <input className="inp" type="number" placeholder="1" min="1" value={igAccounts} onChange={e => setIgAccounts(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSaveSettings} disabled={isSubmitting}>Save Settings →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Timezone</div>
                <div className="form-row full">
                    <div className="field">
                        <label>Date calculation timezone <span style={{ color: 'var(--muted)', fontSize: '9px' }}>default: US Eastern</span></label>
                        <select className="inp" style={{ cursor: 'pointer' }} value={timezone} onChange={e => setTimezone(e.target.value)} disabled={isSubmitting}>
                            <option value="America/New_York">🇺🇸 Eastern (ET) — New York</option>
                            <option value="America/Chicago">🇺🇸 Central (CT) — Chicago</option>
                            <option value="America/Denver">🇺🇸 Mountain (MT) — Denver</option>
                            <option value="America/Los_Angeles">🇺🇸 Pacific (PT) — Los Angeles</option>
                            <option value="America/Phoenix">🇺🇸 Arizona (no DST)</option>
                            <option value="Europe/London">🇬🇧 London (GMT/BST)</option>
                            <option value="Europe/Paris">🇪🇺 Paris (CET)</option>
                            <option value="Europe/Moscow">🇷🇺 Moscow (MSK)</option>
                            <option value="Asia/Dubai">🇦🇪 Dubai (GST)</option>
                            <option value="UTC">🌐 UTC</option>
                        </select>
                    </div>
                </div>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#1a3a7a,var(--tw))' }} onClick={handleSaveTimezone} disabled={isSubmitting}>Save Timezone →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Security</div>
                <div className="form-row full">
                    <div className="field">
                        <label>PIN Code <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(4 digits)</span></label>
                        <input className="inp" type="password" placeholder="••••" maxLength="4" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>
                <div className="form-row full">
                    <div className="field">
                        <label>Confirm New PIN</label>
                        <input className="inp" type="password" placeholder="••••" maxLength="4" inputMode="numeric" value={pinConfirm} onChange={e => setPinConfirm(e.target.value)} disabled={isSubmitting} />
                    </div>
                </div>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#3a1a7a,var(--purple))' }} onClick={handleUpdatePin} disabled={isSubmitting}>Update PIN →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Reset a Day</div>
                <p style={{ fontSize: '11.5px', color: 'var(--sub)', marginBottom: '14px', lineHeight: '1.7' }}>Delete all logged data for a specific date — convo logs, subs, and refills. Use this to re-enter data if you made a mistake.</p>
                <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="field">
                        <label>Date to reset</label>
                        <input className="inp" type="date" value={resetDate} onChange={e => setResetDate(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div className="field">
                        <label>What to clear</label>
                        <select className="inp" style={{ cursor: 'pointer' }} value={resetWhat} onChange={e => setResetWhat(e.target.value)} disabled={isSubmitting}>
                            <option value="all">Everything (convos + subs + refills)</option>
                            <option value="logs">Convo logs only</option>
                            <option value="subs">Subs only</option>
                            <option value="refills">Refills only</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-sm" style={{ background: 'rgba(255,100,60,.12)', borderColor: 'rgba(255,100,60,.3)', color: '#ff7a5a' }} onClick={() => showToast('Day Reset', `Twitter data for ${resetDate} cleared`, 'var(--of)')}>Reset TW</button>
                    <button className="btn-sm" style={{ background: 'rgba(225,48,108,.12)', borderColor: 'rgba(225,48,108,.3)', color: '#E1306C' }} onClick={() => showToast('Day Reset', `Instagram data for ${resetDate} cleared`, 'var(--of)')}>Reset IG</button>
                    <button className="btn-sm danger" onClick={() => showToast('Full Day Reset', `All data for ${resetDate} cleared`, 'var(--red)')}>Reset Both</button>
                </div>
            </div>

            <div className="card">
                <div className="fsec-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
                <p style={{ fontSize: '11.5px', color: 'var(--sub)', marginBottom: '16px', lineHeight: '1.7' }}>This will permanently delete all logged data including convo reports, subscriber entries, and refill history. This cannot be undone.</p>
                <button className="btn-sm danger" onClick={handleDeleteAll}>Delete all data</button>
            </div>
        </div>
    );
};

export default Settings;
