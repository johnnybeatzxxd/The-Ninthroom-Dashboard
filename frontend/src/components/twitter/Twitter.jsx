import React from 'react';
import StatCard from '../shared/StatCard';

const Twitter = () => {
    return (
        <div className="page active" id="pg-twitter">
            <div className="page-hd">
                <div>
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Twitter <span className="pill pill-tw">𝕏</span></div>
                    <div className="page-sub">Convo consumption · balance tracking</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc tw">
                    <div className="sc-label">Current Balance</div>
                    <div className="sc-val" id="tw-balance">—</div>
                    <div className="sc-delta">convos remaining</div>
                    <div id="tw-budget-bar" className="prog-wrap"></div>
                </div>
                <StatCard platform="tw" label="Avg Daily Spend" value="—" delta="per day · 7-day avg" valueId="tw-avg" />
                <StatCard platform="tw" label="Est. Days Left" value="—" delta="at current rate" valueId="tw-days-left" deltaId="tw-days-sub" />
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <StatCard platform="tw" label="Convos per Account / Day" value="—" delta={<>across <span id="tw-acc-count">—</span> accounts</>} valueId="tw-per-acc-day" deltaId="tw-per-acc-day-sub" />
                <StatCard platform="gn" label="Subs per Account / Day" value="—" delta="7-day avg" valueColor="var(--green)" valueId="tw-subs-per-acc" />
                <StatCard platform="pu" label="Cost per Sub" value="—" delta="all-time avg" valueColor="var(--purple)" valueId="tw-cps-plat" />
            </div>

            <div className="g2">
                <div className="card">
                    <div className="card-title">Convos Spent Per Day</div>
                    <div className="chart-box" style={{ height: '190px' }}><canvas id="chartTw"></canvas></div>
                </div>
                <div className="card">
                    <div className="card-title">Log History</div>
                    <table className="tbl">
                        <thead><tr><th>Date</th><th>Remaining</th><th>Spent</th><th>Note</th></tr></thead>
                        <tbody id="twTable"><tr><td colSpan="4" className="empty">No data yet</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Twitter;
