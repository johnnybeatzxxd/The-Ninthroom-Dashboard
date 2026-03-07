import React from 'react';

const History = () => {
    return (
        <div className="page active" id="pg-history">
            <div className="page-hd">
                <div>
                    <div className="page-title">History</div>
                    <div className="page-sub">Full log — convos &amp; subscribers</div>
                </div>
                <div className="filter-bar">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Twitter</button>
                    <button className="filter-btn">Instagram</button>
                    <button className="filter-btn">OF Subs</button>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Avg Convos / Day</div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Twitter</div><div className="sc-val" id="hist-tw-avg" style={{ fontSize: '22px' }}>—</div></div>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Instagram</div><div className="sc-val" id="hist-ig-avg" style={{ fontSize: '22px' }}>—</div></div>
                    </div>
                </div>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Total OF Subs</div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Twitter</div><div className="sc-val" id="hist-tw-subs-total" style={{ fontSize: '22px', color: 'var(--green)' }}>—</div></div>
                        <div><div className="sc-delta" style={{ marginBottom: '4px' }}>Instagram</div><div className="sc-val" id="hist-ig-subs-total" style={{ fontSize: '22px', color: 'var(--green)' }}>—</div></div>
                    </div>
                </div>
                <div className="card" style={{ padding: '16px 20px' }}>
                    <div className="card-title">Best Day (Subs)</div>
                    <div id="hist-best-day" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '700', fontSize: '22px', marginTop: '4px', color: 'var(--green)' }}>—</div>
                    <div id="hist-best-day-sub" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>no data</div>
                </div>
            </div>

            <div className="card">
                <div className="hist-row hdr">
                    <span>Date</span><span>Type</span><span>Platform</span><span>Note</span>
                    <span style={{ textAlign: 'right' }}>Balance</span>
                    <span style={{ textAlign: 'right' }}>Spent</span>
                    <span style={{ textAlign: 'right' }}>OF Subs</span>
                </div>
                <div id="historyTableBody"></div>
            </div>
        </div>
    );
};

export default History;
