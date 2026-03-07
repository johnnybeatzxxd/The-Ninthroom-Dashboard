import React from 'react';

const RefillConvos = () => {
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
                            <select className="inp" id="refill-platform"><option value="twitter">Twitter</option><option value="instagram">Instagram</option></select>
                        </div>
                        <div className="field">
                            <label>Convos Purchased</label>
                            <input className="inp" type="number" id="refill-amount" placeholder="e.g. 1000" min="1" />
                        </div>
                    </div>
                    <div className="form-row full">
                        <div className="field">
                            <label>New Total Balance After Refill</label>
                            <input className="inp" type="number" id="refill-new-balance" placeholder="e.g. 1000" />
                        </div>
                    </div>
                    <button className="btn-primary">Confirm Refill →</button>
                </div>
                <div className="card">
                    <div className="card-title">Refill History</div>
                    <div id="refillHistory"><div className="empty">No refills logged</div></div>
                </div>
            </div>
        </div>
    );
};

export default RefillConvos;
