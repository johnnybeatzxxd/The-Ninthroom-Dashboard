import React from 'react';

const Settings = () => {
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
                    <div className="field"><label>Warning below (convos left)</label><input className="inp" type="number" id="set-warn" placeholder="300" /></div>
                    <div className="field"><label>Critical below (convos left)</label><input className="inp" type="number" id="set-crit" placeholder="100" /></div>
                </div>
                <div className="form-row full">
                    <div className="field"><label>Default Package Size</label><input className="inp" type="number" id="set-default-pkg" placeholder="1000" /></div>
                </div>

                <div className="divider"></div>
                <div className="fsec-title" style={{ marginBottom: '14px' }}>Cost per Convo ($)</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter</label>
                        <input className="inp" type="number" id="set-cost-tw" placeholder="0.07" step="0.001" min="0" />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram</label>
                        <input className="inp" type="number" id="set-cost-ig" placeholder="0.07" step="0.001" min="0" />
                    </div>
                </div>

                <div className="divider"></div>
                <div className="fsec-title" style={{ marginBottom: '14px' }}>Active Accounts</div>
                <div className="form-row">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-tw" style={{ fontSize: '9px' }}>TW</span> Twitter accounts</label>
                        <input className="inp" type="number" id="set-accounts-tw" placeholder="1" min="1" />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="pill pill-ig" style={{ fontSize: '9px' }}>IG</span> Instagram accounts</label>
                        <input className="inp" type="number" id="set-accounts-ig" placeholder="1" min="1" />
                    </div>
                </div>
                <button className="btn-primary">Save Settings →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Timezone</div>
                <div className="form-row full">
                    <div className="field">
                        <label>Date calculation timezone <span style={{ color: 'var(--muted)', fontSize: '9px' }}>default: US Eastern</span></label>
                        <select className="inp" id="set-timezone" style={{ cursor: 'pointer' }}>
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
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#1a3a7a,var(--tw))' }}>Save Timezone →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Security</div>
                <div className="form-row full">
                    <div className="field">
                        <label>PIN Code <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(4 digits)</span></label>
                        <input className="inp" type="password" id="set-pin" placeholder="••••" maxLength="4" inputMode="numeric" />
                    </div>
                </div>
                <div className="form-row full">
                    <div className="field">
                        <label>Confirm New PIN</label>
                        <input className="inp" type="password" id="set-pin-confirm" placeholder="••••" maxLength="4" inputMode="numeric" />
                    </div>
                </div>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#3a1a7a,var(--purple))' }}>Update PIN →</button>
            </div>

            <div className="card">
                <div className="fsec-title">Reset a Day</div>
                <p style={{ fontSize: '11.5px', color: 'var(--sub)', marginBottom: '14px', lineHeight: '1.7' }}>Delete all logged data for a specific date — convo logs, subs, and refills. Use this to re-enter data if you made a mistake.</p>
                <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="field">
                        <label>Date to reset</label>
                        <input className="inp" type="date" id="reset-day-date" />
                    </div>
                    <div className="field">
                        <label>What to clear</label>
                        <select className="inp" id="reset-day-what" style={{ cursor: 'pointer' }}>
                            <option value="all">Everything (convos + subs + refills)</option>
                            <option value="logs">Convo logs only</option>
                            <option value="subs">Subs only</option>
                            <option value="refills">Refills only</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-sm" style={{ background: 'rgba(255,100,60,.12)', borderColor: 'rgba(255,100,60,.3)', color: '#ff7a5a' }}>Reset TW</button>
                    <button className="btn-sm" style={{ background: 'rgba(225,48,108,.12)', borderColor: 'rgba(225,48,108,.3)', color: '#E1306C' }}>Reset IG</button>
                    <button className="btn-sm danger">Reset Both</button>
                </div>
            </div>

            <div className="card">
                <div className="fsec-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
                <p style={{ fontSize: '11.5px', color: 'var(--sub)', marginBottom: '16px', lineHeight: '1.7' }}>This will permanently delete all logged data including convo reports, subscriber entries, and refill history. This cannot be undone.</p>
                <button className="btn-sm danger">Delete all data</button>
            </div>
        </div>
    );
};

export default Settings;
