import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/login');
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    if (!seller) {
        return <div className="loading-shell">Loading your dashboard…</div>;
    }

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'A';

    return (
        <div className="dashboard-root">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">ANYWEAR</div>
                <nav className="sidebar-nav">
                    <button type="button" className="sidebar-link sidebar-link--active">
                        <span>Overview</span>
                    </button>
                    <button type="button" className="sidebar-link" onClick={goToProfile}>
                        <span>Profile</span>
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button type="button" className="sidebar-link" onClick={handleLogout}>
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            <div className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-title">Supplier Dashboard</div>
                    <button type="button" className="topbar-user" onClick={goToProfile}>
                        <div className="topbar-user-avatar" />
                        <div>
                            <div className="topbar-user-name">{seller.username}</div>
                            <div className="topbar-user-role">supplier</div>
                        </div>
                    </button>
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