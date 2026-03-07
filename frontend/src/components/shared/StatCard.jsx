import React from 'react';

const StatCard = ({ platform, label, value, delta, valueColor, valueId, deltaId }) => {
    return (
        <div className={`sc ${platform}`}>
            <div className="sc-label">{label}</div>
            <div className="sc-val" style={{ color: valueColor }} id={valueId}>{value}</div>
            <div className="sc-delta" id={deltaId}>{delta}</div>
            {/* ProgressBar could be added here if needed, like in Twitter/Instagram cards */}
        </div>
    );
};

export default StatCard;
