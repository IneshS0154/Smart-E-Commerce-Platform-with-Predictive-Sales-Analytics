import { useState, useEffect } from "react";
import '../styles/Supplierdashboard.css';

const navItems = [
    { label: "Overview", icon: "📊" },
    { label: "Users", icon: "👤" },
    { label: "Suppliers", icon: "🏭" },
    { label: "Payments", icon: "💳" },
    { label: "Reviews", icon: "💬" },
];

// ← Accept activeNav and onNavChange as props so the parent (AdminOverview)
//   controls which tab is highlighted and handles navigation between pages.
export default function Supplierdashboard({ activeNav: activeNavProp, onNavChange }) {
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Suppliers");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSupplier, setNewSupplier] = useState({ username: "", email: "", regNo: "", bname: "" });

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/sellers/all");
                const data = await response.json();
                const formattedData = data.map((seller, index) => ({
                    id: seller.id,
                    sellerId: seller.id,
                    username: seller.username || "N/A",
                    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
                    email: seller.email,
                    phoneNumber: seller.phoneNumber || "N/A",
                    address: seller.address || "N/A",
                    storeName: seller.storeName,
                    status: seller.status === "ACTIVE" ? "Active" : (seller.status === "DEACTIVATED" ? "Deactivated" : (seller.status === "PENDING" ? "Pending" : (seller.status === "REJECTED" ? "Rejected" : seller.status)))
                }));
                setSuppliers(formattedData);
            } catch (error) {
                console.error("Error fetching sellers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSellers();
    }, []);

    // When a nav item is clicked, notify the parent so it can swap the rendered page.
    const handleNavClick = (label) => {
        setActiveNav(label);
        if (onNavChange) onNavChange(label);
    };

    const filtered = suppliers.filter(s =>
        s.storeName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase())
    );

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === "Active").length;
    const pendingSuppliers = suppliers.filter(s => s.status === "Pending").length;

    const handleAdd = () => {
        const next = `#SUP-${2659 + suppliers.length}`;
        const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "/");
        setSuppliers([{ id: next, date: today, status: "Pending", ...newSupplier }, ...suppliers]);
        setNewSupplier({ username: "", email: "", regNo: "", bname: "" });
        setShowModal(false);
    };

    const handleDeactivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/deactivate`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                // Refresh the supplier list
                const updatedSuppliers = suppliers.map(s =>
                    s.sellerId === sellerId ? { ...s, status: "Deactivated" } : s
                );
                setSuppliers(updatedSuppliers);
                alert("Seller deactivated successfully");
            } else {
                alert("Failed to deactivate seller");
            }
        } catch (error) {
            console.error("Error deactivating seller:", error);
            alert("Error deactivating seller");
        }
    };

    const handleActivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/activate`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                // Refresh the supplier list
                const updatedSuppliers = suppliers.map(s =>
                    s.sellerId === sellerId ? { ...s, status: "Active" } : s
                );
                setSuppliers(updatedSuppliers);
                alert("Seller activated successfully");
            } else {
                alert("Failed to activate seller");
            }
        } catch (error) {
            console.error("Error activating seller:", error);
            alert("Error activating seller");
        }
    };

    const handleApprove = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                // Refresh the supplier list
                const updatedSuppliers = suppliers.map(s =>
                    s.sellerId === sellerId ? { ...s, status: "Active" } : s
                );
                setSuppliers(updatedSuppliers);
                alert("Seller approved successfully");
            } else {
                alert("Failed to approve seller");
            }
        } catch (error) {
            console.error("Error approving seller:", error);
            alert("Error approving seller");
        }
    };

    const handleReject = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/reject`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                // Refresh the supplier list
                const updatedSuppliers = suppliers.map(s =>
                    s.sellerId === sellerId ? { ...s, status: "Rejected" } : s
                );
                setSuppliers(updatedSuppliers);
                alert("Seller rejected successfully");
            } else {
                alert("Failed to reject seller");
            }
        } catch (error) {
            console.error("Error rejecting seller:", error);
            alert("Error rejecting seller");
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">◫</span>
                    <span className="brand-name">ANYWEAR</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`nav-item ${activeNav === item.label ? "nav-item--active" : ""}`}
                            onClick={() => handleNavClick(item.label)}  // ← use handleNavClick
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <h1 className="topbar-title">Admin Dashboard</h1>
                    <div className="topbar-user">
                        <div className="user-avatar">I</div>
                        <div className="user-info">
                            <span className="user-name">sajan</span>
                            <span className="user-role">admin</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="admin-content">
                    <div className="section-header">
                        <h2 className="section-title">Supplier Management</h2>
                        <button className="btn-add" onClick={() => setShowModal(true)}>+ Add new</button>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <p className="stat-label">Total Suppliers</p>
                            <p className="stat-value">{totalSuppliers}</p>
                        </div>
                        <div className="stat-card stat-card--active">
                            <p className="stat-label stat-label--active">Active Suppliers</p>
                            <p className="stat-value">{activeSuppliers}</p>
                        </div>
                        <div className="stat-card stat-card--pending">
                            <p className="stat-label stat-label--pending">Pending Suppliers</p>
                            <p className="stat-value">{pendingSuppliers}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-section">
                        <h3 className="table-title">Registered Suppliers</h3>
                        <div className="table-card">
                            <div className="table-header">
                                <div>
                                    <p className="table-card-title">Supplier list</p>
                                    <p className="table-card-sub">A list of recent Registered Suppliers</p>
                                </div>
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        className="search-input"
                                        placeholder="Search"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <table className="supplier-table">
                                <thead>
                                <tr>
                                    <th>Supplier ID</th>
                                    <th>Store Name</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No suppliers found</td></tr>
                                ) : (
                                    filtered.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.id}</td>
                                            <td>{s.storeName}</td>
                                            <td>{s.email}</td>
                                            <td>{s.phoneNumber}</td>
                                            <td>{s.address}</td>
                                            <td>
                                    <span className={`status-badge status-badge--${s.status.toLowerCase()}`}>
                                      {s.status === "Active" && "✔ "}
                                        {s.status === "Deactivated" && "⊗ "}
                                        {s.status === "Rejected" && "✕ "}
                                        {s.status === "Pending" && "⏳ "}
                                        {s.status}
                                    </span>
                                            </td>
                                            <td>
                                                {s.status === "Pending" && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleApprove(s.sellerId)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(s.sellerId)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {s.status === "Active" && (
                                                    <button
                                                        onClick={() => handleDeactivate(s.sellerId)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                                {s.status === "Deactivated" && (
                                                    <button
                                                        onClick={() => handleActivate(s.sellerId)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Add New Supplier</h2>
                        {["username", "email", "regNo", "bname"].map(field => (
                            <div className="modal-field" key={field}>
                                <label className="modal-label">{field === "bname" ? "Business Name" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                <input
                                    className="modal-input"
                                    value={newSupplier[field]}
                                    onChange={e => setNewSupplier({ ...newSupplier, [field]: e.target.value })}
                                    placeholder={`Enter ${field}`}
                                />
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-add" onClick={handleAdd}>Add Supplier</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}