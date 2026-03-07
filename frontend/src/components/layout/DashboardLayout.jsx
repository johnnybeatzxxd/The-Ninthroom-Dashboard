import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Overview from '../overview/Overview';
import Twitter from '../twitter/Twitter';
import Instagram from '../instagram/Instagram';
import DeepAnalytics from '../analytics/DeepAnalytics';
import LogToday from '../manage/LogToday';
import OFSubs from '../manage/OFSubs';
import Timeline from '../manage/Timeline';
import WeeklyReport from '../manage/WeeklyReport';
import Goals from '../manage/Goals';
import History from '../manage/History';
import RefillConvos from '../manage/RefillConvos';
import Settings from '../manage/Settings';
import Models from '../manage/Models';

const DashboardLayout = () => {
    const [activePage, setActivePage] = useState('overview');

    const renderPage = () => {
        switch (activePage) {
            case 'overview': return <Overview setActivePage={setActivePage} />;
            case 'twitter': return <Twitter />;
            case 'instagram': return <Instagram />;
            case 'analytics': return <DeepAnalytics />;
            case 'log': return <LogToday />;
            case 'subs': return <OFSubs />;
            case 'timeline': return <Timeline />;
            case 'report': return <WeeklyReport />;
            case 'goals': return <Goals />;
            case 'history': return <History />;
            case 'refill': return <RefillConvos />;
            case 'settings': return <Settings />;
            case 'models': return <Models />;
            default:
                return (
                    <div className="page active">
                        <div className="empty">Page "{activePage}" is under construction.</div>
                    </div>
                );
        }
    };

    return (
        <div className="app">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="main">
                {renderPage()}
            </div>
        </div>
    );
};

export default DashboardLayout;
