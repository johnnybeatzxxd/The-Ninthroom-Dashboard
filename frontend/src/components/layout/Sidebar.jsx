import React from 'react';

const Sidebar = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'overview', icon: '⬡', label: 'Overview', section: 'Analytics' },
        { id: 'twitter', icon: '𝕏', label: 'Twitter', section: 'Analytics' },
        { id: 'instagram', icon: '◎', label: 'Instagram', section: 'Analytics' },
        { id: 'analytics', icon: '◈', label: 'Deep Analytics', section: 'Analytics' },
        { id: 'log', icon: '＋', label: 'Log Today', section: 'Manage' },
        { id: 'subs', icon: '★', label: 'OF Subs', section: 'Manage' },
        { id: 'timeline', icon: '⌇', label: 'Timeline', section: 'Manage' },
        { id: 'report', icon: '📋', label: 'Weekly Report', section: 'Manage' },
        { id: 'goals', icon: '◎', label: 'Goals', section: 'Manage' },
        { id: 'history', icon: '◷', label: 'History', section: 'Manage' },
        { id: 'refill', icon: '↺', label: 'Refill Convos', section: 'Manage' },
        { id: 'settings', icon: '⚙', label: 'Settings', section: 'Manage' },
    ];

    return (
        <div className="sidebar">
            <div className="logo">
                <div className="logo-mark">
                    <div className="logo-icon">IX</div>
                    <div className="logo-name">The Ninth Room</div>
                </div>
                <div className="logo-sub">OF Traffic Ops</div>
            </div>

            {/* Model Switcher */}
            <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Active Model</div>
                <div id="model-switcher" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}></div>
                <button
                    onClick={() => setActivePage('models')}
                    style={{
                        width: '100%', marginTop: '6px', padding: '6px 8px', background: 'transparent',
                        border: '1px dashed var(--border)', color: 'var(--muted)', borderRadius: '7px',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', cursor: 'pointer',
                        transition: 'all .15s', textAlign: 'left'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--sub)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                >
                    + Manage Models
                </button>
            </div>

            <div className="nav-section">
                <div className="nav-label">Analytics</div>
                {navItems.filter(item => item.section === 'Analytics').map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span> {item.label}
                    </div>
                ))}

                <div className="nav-label" style={{ marginTop: '20px' }}>Manage</div>
                {navItems.filter(item => item.section === 'Manage').map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span> {item.label}
                    </div>
                ))}
            </div>

            <div className="sidebar-foot">
                <div className="foot-date" id="sideDate"></div>
                <div className="foot-time" id="sideTime"></div>
                <div className="live-pill"><div className="live-dot"></div>LIVE</div>
            </div>
        </div>
    );
};

export default Sidebar;
