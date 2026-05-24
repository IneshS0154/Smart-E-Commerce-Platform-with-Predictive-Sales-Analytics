import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import storeBg from '../../assets/seller_auth/singup.jpg';
import './Dashboard.css';

const Icon = {
    Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
    Products: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Stocks: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Orders: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    Coupons: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    Reviews: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Insights: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Brand: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
    Revenue: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Customers: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Transactions: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    LiveProducts: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    ArrowUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    ArrowDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [seller, setSeller] = useState(null);
    const activeNav = location.pathname.includes('dashboard') ? 'Dashboard' : 'Profile';

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/signin');
    };

    if (!seller) {
        return <div style={{padding: 40}}>Loading...</div>;
    }

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'A';

    return (
        <div className="ds-layout">
            <aside className="ds-sidebar">
                <div className="ds-sidebar-brand">
                    <Icon.Brand /> ANYWEAR
                </div>
                
                <div className="ds-sidebar-section">MAIN</div>
                <button className={`ds-nav-btn ${activeNav === 'Dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                    <Icon.Dashboard /> Dashboard
                </button>

                <div className="ds-sidebar-section">STORE</div>
                <button className="ds-nav-btn"><Icon.Products /> Products</button>
                <button className="ds-nav-btn"><Icon.Stocks /> Stocks</button>
                <button className="ds-nav-btn"><Icon.Orders /> Orders</button>
                <button className="ds-nav-btn"><Icon.Coupons /> Coupons</button>

                <div className="ds-sidebar-section">ANALYTICS</div>
                <button className="ds-nav-btn"><Icon.Reviews /> Reviews</button>
                <button className="ds-nav-btn"><Icon.Insights /> All Insights</button>

                <div className="ds-sidebar-section">OTHER</div>
                <button className={`ds-nav-btn ${activeNav === 'Profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <Icon.Profile /> Profile
                </button>

                <div className="ds-sidebar-footer">
                    <button className="ds-nav-btn" onClick={handleLogout}>
                        <Icon.Logout /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="ds-main">
                <header className="ds-header">
                    <div>
                        <h1 className="ds-header-title">Business Overview</h1>
                        <p className="ds-header-subtitle">Real-time performance metrics and sales analysis</p>
                    </div>
                    <div className="ds-header-actions">
                        <button className="ds-btn-outline">View all orders</button>
                        <button className="ds-btn-primary"><Icon.Download /> Export report</button>
                    </div>
                </header>

                <div className="ds-kpi-row">
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-top">
                            <div className="ds-kpi-icon"><Icon.Revenue /></div>
                            <div className="ds-kpi-badge green"><Icon.ArrowUp /> 12.5%</div>
                        </div>
                        <div className="ds-kpi-label">Total Revenue</div>
                        <div className="ds-kpi-value">LKR 0.00</div>
                    </div>
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-top">
                            <div className="ds-kpi-icon"><Icon.Customers /></div>
                            <div className="ds-kpi-badge red"><Icon.ArrowDown /> 3.2%</div>
                        </div>
                        <div className="ds-kpi-label">Active Customers</div>
                        <div className="ds-kpi-value">0</div>
                    </div>
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-top">
                            <div className="ds-kpi-icon"><Icon.Transactions /></div>
                            <div className="ds-kpi-badge green"><Icon.ArrowUp /> 8.1%</div>
                        </div>
                        <div className="ds-kpi-label">Total Transactions</div>
                        <div className="ds-kpi-value">0</div>
                    </div>
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-top">
                            <div className="ds-kpi-icon"><Icon.LiveProducts /></div>
                            <div className="ds-kpi-badge green"><Icon.ArrowUp /> 15%</div>
                        </div>
                        <div className="ds-kpi-label">Live Products</div>
                        <div className="ds-kpi-value">0</div>
                    </div>
                </div>

                <div className="ds-chart-card">
                    <div className="ds-chart-header">
                        <h3 className="ds-chart-title">Sales Performance</h3>
                        <select className="ds-chart-dropdown">
                            <option>All Metrics</option>
                        </select>
                    </div>
                    <div className="ds-chart-placeholder">
                        <div className="ds-chart-y-axis">
                            <span>LKR 4</span>
                            <span>LKR 3</span>
                            <span>LKR 2</span>
                            <span>LKR 1</span>
                            <span>LKR 0</span>
                        </div>
                        <svg className="ds-chart-curve" viewBox="0 0 500 240" preserveAspectRatio="none">
                            <path d="M0,239 L500,239" strokeDasharray="5,5" />
                        </svg>
                    </div>
                    <div className="ds-chart-x-axis">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>
                </div>

                <div className="ds-bottom-row">
                    <div className="ds-table-card">
                        <div className="ds-table-header">
                            <h3>Recent Activity</h3>
                            <button>VIEW ALL +</button>
                        </div>
                        <table className="ds-table">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>

                    <div className="ds-top-perf">
                        <h3>Top Performing</h3>
                        {/* No items to display yet */}
                    </div>
                </div>
            </main>
        </div>
    );
}
