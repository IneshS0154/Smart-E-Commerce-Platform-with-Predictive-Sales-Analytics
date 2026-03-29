import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierProducts from './SupplierProducts';
import SupplierStocks from './SupplierStocks';
import SupplierProfile from './Profile';
import DashboardOverview from './DashboardOverview';
import './Dashboard.css';

const navItems = [
    { label: "Dashboard"},
    { label: "Products"},
    { label: "Stocks"},
    { label: "Profile"},
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [activeTab, setActiveTab] = useState('Dashboard');

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
        setActiveTab(label);
        if (label === 'Dashboard') {
            navigate('/dashboard');
        }
        // Products, Stocks, Profile all render as tabs — no route change
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
                            className={`nav-item ${item.label === activeTab ? 'nav-item--active' : ''}`}
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
                    <h1 className="topbar-title">{activeTab === 'Dashboard' ? 'Supplier Dashboard' : activeTab}</h1>
                    <div className="topbar-user">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <span className="user-name">{seller.username}</span>
                            <span className="user-role">supplier</span>
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div key={activeTab} className="dash-tab-content">
                        {activeTab === 'Dashboard' && <DashboardOverview />}
                        
                        {activeTab === 'Products' && <SupplierProducts />}
                        {activeTab === 'Stocks' && <SupplierStocks />}
                        {activeTab === 'Profile' && <SupplierProfile />}
                    </div>
                </main>
            </div>
        </div>
    );
}
