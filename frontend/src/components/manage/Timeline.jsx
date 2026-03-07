import React from 'react';

const Timeline = () => {
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
                {/* Timeframe selector */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: '4px' }}>Timeframe</span>
                    <button className="filter-btn active">7D</button>
                    <button className="filter-btn">14D</button>
                    <button className="filter-btn">30D</button>
                    <button className="filter-btn">60D</button>
                    <button className="filter-btn">90D</button>
                    <button className="filter-btn">6M</button>
                    <button className="filter-btn">1Y</button>
                </div>
                {/* Series toggles */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: '4px' }}>Show</span>
                    <button className="filter-btn active" id="tl-tog-tw"><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tw)', marginRight: '4px' }}></span>TW Convos</button>
                    <button className="filter-btn active" id="tl-tog-ig"><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ig)', marginRight: '4px' }}></span>IG Convos</button>
                    <button className="filter-btn active" id="tl-tog-subs"><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', marginRight: '4px' }}></span>Subs</button>
                    <button className="filter-btn active" id="tl-tog-conv"><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--of)', marginRight: '4px' }}></span>Conv %</button>
                </div>
            </div>

            {/* Main chart */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="chart-box" style={{ height: '320px' }}><canvas id="chartTimeline"></canvas></div>
            </div>

            {/* Events list + add form */}
            <div className="g2">
                {/* Add event form */}
                <div className="card">
                    <div className="fsec-title">Add Event Marker</div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Date</label>
                            <input className="inp" type="date" id="tl-event-date" />
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Label</label>
                            <input className="inp" type="text" id="tl-event-label" placeholder="e.g. CTA Changed, New Script, Price Drop…" maxLength="60" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="field">
                            <label>Category</label>
                            <select className="inp" id="tl-event-category">
                                <option value="strategy">Strategy</option>
                                <option value="content">Content</option>
                                <option value="pricing">Pricing</option>
                                <option value="account">Account</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Platform</label>
                            <select className="inp" id="tl-event-platform">
                                <option value="both">Both</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>Note <span style={{ color: 'var(--muted)', fontSize: '9px' }}>(optional)</span></label>
                            <input className="inp" type="text" id="tl-event-note" placeholder="More details…" />
                        </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#1a0a40,var(--purple))' }}>Add Event →</button>
                </div>

                {/* Events log */}
                <div className="card">
                    <div className="card-title">Events <span id="tl-event-count" style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'none', letterSpacing: '0' }}></span></div>
                    <div id="tlEventList"><div className="empty">No events yet — add your first marker</div></div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
