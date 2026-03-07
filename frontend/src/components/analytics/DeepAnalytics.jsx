import React from 'react';

const DeepAnalytics = () => {
    return (
        <div className="page active" id="pg-analytics">
            <div className="page-hd">
                <div>
                    <div className="page-title">Deep Analytics</div>
                    <div className="page-sub" id="analytics-sub">Full statistical breakdown · all data from your logs</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="filter-btn active" id="an-30">30D</button>
                    <button className="filter-btn" id="an-60">60D</button>
                    <button className="filter-btn" id="an-90">90D</button>
                    <button className="filter-btn" id="an-all">All</button>
                </div>
            </div>

            {/* ── ROW 1: Top KPIs ── */}
            <div id="an-top-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '14px' }}></div>

            {/* ── ROW 2: Efficiency + Velocity ── */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Efficiency Metrics</div>
                    <div id="an-efficiency"></div>
                </div>
                <div className="card">
                    <div className="card-title">Velocity & Trends</div>
                    <div id="an-velocity"></div>
                </div>
            </div>

            {/* ── ROW 3: Platform comparison ── */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Platform Head-to-Head</div>
                <div id="an-h2h"></div>
            </div>

            {/* ── ROW 4: Charts ── */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Daily Subs Distribution</div>
                    <div className="chart-box" style={{ height: '200px' }}><canvas id="chartAnSubs"></canvas></div>
                </div>
                <div className="card">
                    <div className="card-title">Conversion Rate Over Time</div>
                    <div className="chart-box" style={{ height: '200px' }}><canvas id="chartAnConv"></canvas></div>
                </div>
            </div>

            {/* ── ROW 5: Day-of-week heatmap + best days ── */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Day-of-Week Performance</div>
                    <div id="an-dow"></div>
                </div>
                <div className="card">
                    <div className="card-title">Best & Worst Days</div>
                    <div id="an-bestworst"></div>
                </div>
            </div>

            {/* ── ROW 6: Refill + cost analysis ── */}
            <div className="g2" style={{ marginBottom: '14px' }}>
                <div className="card">
                    <div className="card-title">Refill History & Spend</div>
                    <div id="an-refills"></div>
                </div>
                <div className="card">
                    <div className="card-title">Cost Analysis</div>
                    <div id="an-costs"></div>
                </div>
            </div>

            {/* ── ROW 7: Streaks + consistency ── */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-title">Streaks & Consistency</div>
                <div id="an-streaks"></div>
            </div>
        </div>
    );
};

export default DeepAnalytics;
