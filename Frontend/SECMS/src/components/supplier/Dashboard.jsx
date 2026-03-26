import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const navItems = [
    { label: "Dashboard"},
    { label: "Profile"},
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);

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
        navigate('/');
    };

    const handleNavClick = (label) => {
        if (label === 'Dashboard') {
            navigate('/dashboard');
        } else if (label === 'Profile') {
            navigate('/profile');
        }
    };

    if (!seller) {
        return <div className="loading-shell">Loading your dashboard…</div>;
    }

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'A';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-name">ANYWEAR</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`nav-item ${item.label === 'Dashboard' ? 'nav-item--active' : ''}`}
                            onClick={() => handleNavClick(item.label)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button
                        className="nav-item"
                        onClick={handleLogout}
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <h1 className="topbar-title">Supplier Dashboard</h1>
                    <div className="topbar-user">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <span className="user-name">{seller.username}</span>
                            <span className="user-role">supplier</span>
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="content-heading">
                        <h2>Inventory and Order Overview</h2>
                    </div>

                    <section className="kpi-row">
                        <div className="kpi-card">
                            <div className="kpi-label">Active SKUs</div>
                            <div className="kpi-value">128</div>
                            <div className="kpi-sub">+12 new this month</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Open Purchase Orders</div>
                            <div className="kpi-value">18</div>
                            <div className="kpi-sub">5 due this week</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">On‑time Delivery Rate</div>
                            <div className="kpi-value">96%</div>
                            <div className="kpi-sub">Last 30 days</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Low‑stock Alerts</div>
                            <div className="kpi-value">9</div>
                            <div className="kpi-sub">Reorder today</div>
                        </div>
                    </section>

                    <section className="transactions-card">
                        <div className="transactions-header">
                            <div>
                                <h3>Recent Purchase Orders</h3>
                                <span>Latest orders from your retail partners</span>
                            </div>
                            <div className="transactions-filter">Most Recent</div>
                        </div>

                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>PO ID</th>
                                    <th>Retailer</th>
                                    <th>Order Date</th>
                                    <th>Expected Delivery</th>
                                    <th>Items</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#PO-7842</td>
                                    <td>Urban Streetwear</td>
                                    <td>02/03/26</td>
                                    <td>09/03/26</td>
                                    <td>42</td>
                                    <td>LKR 185,900</td>
                                    <td>In transit</td>
                                </tr>
                                <tr>
                                    <td>#PO-7839</td>
                                    <td>Metro Fashion</td>
                                    <td>01/03/26</td>
                                    <td>06/03/26</td>
                                    <td>27</td>
                                    <td>LKR 92,450</td>
                                    <td>Packed</td>
                                </tr>
                                <tr>
                                    <td>#PO-7833</td>
                                    <td>Anywear Flagship</td>
                                    <td>28/02/26</td>
                                    <td>03/03/26</td>
                                    <td>35</td>
                                    <td>LKR 124,300</td>
                                    <td>Delivered</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
}
