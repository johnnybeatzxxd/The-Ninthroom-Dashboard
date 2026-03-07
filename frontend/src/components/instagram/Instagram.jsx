import React from 'react';
import StatCard from '../shared/StatCard';

const Instagram = () => {
    return (
        <div className="page active" id="pg-instagram">
            <div className="page-hd">
                <div>
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Instagram <span className="pill pill-ig">◎</span></div>
                    <div className="page-sub">Convo consumption · balance tracking</div>
                </div>
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <div className="sc ig">
                    <div className="sc-label">Current Balance</div>
                    <div className="sc-val" id="ig-balance">—</div>
                    <div className="sc-delta">convos remaining</div>
                    <div id="ig-budget-bar" className="prog-wrap"></div>
                </div>
                <StatCard platform="ig" label="Avg Daily Spend" value="—" delta="per day · 7-day avg" valueId="ig-avg" />
                <StatCard platform="ig" label="Est. Days Left" value="—" delta="at current rate" valueId="ig-days-left" deltaId="ig-days-sub" />
            </div>

            <div className="g3" style={{ marginBottom: '14px' }}>
                <StatCard platform="ig" label="Convos per Account / Day" value="—" delta={<>across <span id="ig-acc-count">—</span> accounts</>} valueId="ig-per-acc-day" deltaId="ig-per-acc-day-sub" />
                <StatCard platform="gn" label="Subs per Account / Day" value="—" delta="7-day avg" valueColor="var(--green)" valueId="ig-subs-per-acc" />
                <StatCard platform="pu" label="Cost per Sub" value="—" delta="all-time avg" valueColor="var(--purple)" valueId="ig-cps-plat" />
            </div>

            <div className="g2">
                <div className="card">
                    <div className="card-title">Convos Spent Per Day</div>
                    <div className="chart-box" style={{ height: '190px' }}><canvas id="chartIg"></canvas></div>
                </div>
                <div className="card">
                    <div className="card-title">Log History</div>
                    <table className="tbl">
                        <thead><tr><th>Date</th><th>Remaining</th><th>Spent</th><th>Note</th></tr></thead>
                        <tbody id="igTable"><tr><td colSpan="4" className="empty">No data yet</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Instagram;
