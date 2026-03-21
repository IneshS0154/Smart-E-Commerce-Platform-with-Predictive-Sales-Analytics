import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Admindashboard.css';
import Supplierdashboard from './Supplierdashboard'; // ← import the supplier dashboard

const transactionsData = [
    { id: "#TRX-2659", customerId: "#C569", date: "2/03/26", productId: "#PID-569", supplierId: "#SUP-25", amount: "LKR 1,599", status: "Completed" },
    { id: "#TRX-2658", customerId: "#C785", date: "2/03/26", productId: "#PID-785", supplierId: "#SUP-89", amount: "LKR 8,599", status: "Pending" },
    { id: "#TRX-2657", customerId: "#C152", date: "2/03/26", productId: "#PID-145", supplierId: "#SUP-74", amount: "LKR 599", status: "Failed" },
    { id: "#TRX-2656", customerId: "#C310", date: "1/03/26", productId: "#PID-210", supplierId: "#SUP-12", amount: "LKR 3,200", status: "Completed" },
    { id: "#TRX-2655", customerId: "#C441", date: "1/03/26", productId: "#PID-330", supplierId: "#SUP-55", amount: "LKR 7,450", status: "Completed" },
    { id: "#TRX-2654", customerId: "#C098", date: "28/02/26", productId: "#PID-098", supplierId: "#SUP-31", amount: "LKR 2,100", status: "Pending" },
];

const navItems = [
    { label: "Overview", icon: "📊" },
    { label: "Users", icon: "👤" },
    { label: "Suppliers", icon: "🏭" },
    { label: "Payments", icon: "💳" },
    { label: "Reviews", icon: "💬" },
];

const sortOptions = ["Most Recent", "Oldest First", "Highest Amount", "Lowest Amount"];

export default function AdminOverview() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("Overview");
    const [sortBy, setSortBy] = useState("Most Recent");
    const [showSort, setShowSort] = useState(false);
    const [search, setSearch] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("seller");
        localStorage.removeItem("rememberSellerLogin");
        navigate("/");
    };

    // ← If Suppliers tab is active, render Supplierdashboard and pass setActiveNav so
    //   its sidebar clicks can also update the parent's activeNav state.
    if (activeNav === "Suppliers") {
        return <Supplierdashboard activeNav={activeNav} onNavChange={setActiveNav} />;
    }

    const filtered = transactionsData.filter(t =>
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.customerId.toLowerCase().includes(search.toLowerCase()) ||
        t.supplierId.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "Oldest First") return a.id.localeCompare(b.id);
        if (sortBy === "Highest Amount") return parseFloat(b.amount.replace(/[^0-9.]/g, "")) - parseFloat(a.amount.replace(/[^0-9.]/g, ""));
        if (sortBy === "Lowest Amount") return parseFloat(a.amount.replace(/[^0-9.]/g, "")) - parseFloat(b.amount.replace(/[^0-9.]/g, ""));
        return b.id.localeCompare(a.id);
    });

    return (
        <div className="ov-layout">
            {/* Sidebar */}
            <aside className="ov-sidebar">
                <div className="ov-brand">
                    <span className="ov-brand-icon">◫</span>
                    <span className="ov-brand-name">ANYWEAR</span>
                </div>
                <nav className="ov-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`ov-nav-item ${activeNav === item.label ? "ov-nav-item--active" : ""}`}
                            onClick={() => setActiveNav(item.label)}
                        >
                            <span className="ov-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="ov-sidebar-footer">
                    <button className="ov-nav-item">
                        <span className="ov-nav-icon">⚙️</span>
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="ov-main">
                {/* Topbar */}
                <header className="ov-topbar">
                    <h1 className="ov-topbar-title">Admin Dashboard</h1>
                    <div className="ov-topbar-user" style={{ position: 'relative' }}>
                        <button
                            className="ov-user-menu-button"
                            onClick={() => setShowUserMenu(prev => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <div className="ov-user-avatar">{(adminUsername || "A")[0].toUpperCase()}</div>
                            <div className="ov-user-info">
                                <span className="ov-user-name">{adminUsername}</span>
                                <span className="ov-user-role">admin</span>
                            </div>
                        </button>
                        {showUserMenu && (
                            <div className="ov-user-dropdown" style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 8px)',
                                background: '#fff',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                borderRadius: '8px',
                                zIndex: 20,
                                minWidth: '150px',
                                border: '1px solid #e5e5e5'
                            }}>
                                <button
                                    className="ov-user-dropdown-item"
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '10px 14px',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="ov-content">
                    <h2 className="ov-section-title">Sales and Payment History</h2>

                    {/* Stats */}
                    <div className="ov-stats-grid">
                        <div className="ov-stat-card ov-stat-card--wide">
                            <p className="ov-stat-label">Total Revenue</p>
                            <p className="ov-stat-value">LKR 962,032</p>
                            <p className="ov-stat-growth">+30% from last month</p>
                        </div>
                        <div className="ov-stat-card">
                            <p className="ov-stat-label">Total Orders</p>
                            <p className="ov-stat-value">452</p>
                        </div>
                        <div className="ov-stat-card">
                            <p className="ov-stat-label">New Users(M)</p>
                            <p className="ov-stat-value">458</p>
                        </div>
                        <div className="ov-stat-card">
                            <p className="ov-stat-label">New Sellers(M)</p>
                            <p className="ov-stat-value">120</p>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="ov-table-card">
                        <div className="ov-table-header">
                            <div>
                                <p className="ov-table-title">Payment Transactions</p>
                                <p className="ov-table-sub">A list of recent payments and sales</p>
                            </div>
                            <div className="ov-table-actions">
                                <div className="ov-search-box">
                                    <span>🔍</span>
                                    <input
                                        className="ov-search-input"
                                        placeholder="Search"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="ov-sort-wrapper">
                                    <button className="ov-sort-btn" onClick={() => setShowSort(!showSort)}>
                                        {sortBy} <span className="ov-sort-chevron">⌄</span>
                                    </button>
                                    {showSort && (
                                        <div className="ov-sort-dropdown">
                                            {sortOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    className={`ov-sort-option ${sortBy === opt ? "ov-sort-option--active" : ""}`}
                                                    onClick={() => { setSortBy(opt); setShowSort(false); }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <table className="ov-table">
                            <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Customer ID</th>
                                <th>Date</th>
                                <th>Product ID</th>
                                <th>Supplier ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sorted.map(t => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.customerId}</td>
                                    <td>{t.date}</td>
                                    <td>{t.productId}</td>
                                    <td>{t.supplierId}</td>
                                    <td className="ov-amount">{t.amount}</td>
                                    <td>
                      <span className={`ov-status-badge ov-status--${t.status.toLowerCase()}`}>
                        {t.status === "Completed" && "✔ "}
                          {t.status === "Failed" && "⊗ "}
                          {t.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}