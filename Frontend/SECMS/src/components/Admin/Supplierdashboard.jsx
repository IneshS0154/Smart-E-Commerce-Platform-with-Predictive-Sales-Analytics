import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Supplierdashboard.css';

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
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Suppliers");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("seller");
        localStorage.removeItem("rememberSellerLogin");
        navigate("/");
    };
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewSupplier, setViewSupplier] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSupplier, setEditSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSupplier, setNewSupplier] = useState({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/sellers/all");
            const data = await response.json();
            const formattedData = data.map((seller) => ({
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

    useEffect(() => {
        fetchSellers();
    }, []);

    // When a nav item is clicked, notify the parent so it can swap the rendered page.
    const handleNavClick = (label) => {
        setActiveNav(label);
        if (onNavChange) onNavChange(label);
    };

    const filtered = suppliers.filter(s =>
        s.storeName.toLowerCase().includes(search.toLowerCase())
    );

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === "Active").length;
    const pendingSuppliers = suppliers.filter(s => s.status === "Pending").length;

    const handleAdd = async () => {
        const { storeName, username, email, phoneNumber, address, password } = newSupplier;

        if (!storeName || !username || !email || !phoneNumber || !address || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/sellers/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newSupplier, status: "PENDING" })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Failed to add supplier");
            }

            const savedSeller = await response.json();

            // Add new supplier to the list instantly, using the same format as fetched data.
            // Refresh list from server to ensure the supplier list is consistent
            await fetchSellers();
            setNewSupplier({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });
            setShowModal(false);
            alert("Supplier added successfully");
        } catch (error) {
            console.error("Error adding supplier:", error);
            alert(`Error adding supplier: ${error.message}`);
        }
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

    const handleViewSupplier = (supplier) => {
        setViewSupplier(supplier);
        setShowViewModal(true);
    };

    const handleEditSupplier = (supplier) => {
        setEditSupplier({ ...supplier });
        setShowEditModal(true);
    };

    const handleUpdateSupplier = async () => {
        if (!editSupplier) return;

        const { id, storeName, phoneNumber, address } = editSupplier;

        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${id}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeName, phoneNumber, address })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update supplier");
            }

            const updatedSeller = await response.json();
            setSuppliers(prev => prev.map(s => s.id === updatedSeller.id ? {
                ...s,
                storeName: updatedSeller.storeName,
                phoneNumber: updatedSeller.phoneNumber || "N/A",
                address: updatedSeller.address || "N/A"
            } : s));

            setShowEditModal(false);
            setEditSupplier(null);
            alert("Supplier updated successfully");
        } catch (error) {
            console.error("Error updating supplier:", error);
            alert(`Error updating supplier: ${error.message}`);
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
                    <div className="topbar-user" style={{ position: 'relative' }}>
                        <button
                            className="user-menu-button"
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
                            <div className="user-avatar">{(adminUsername || "A")[0].toUpperCase()}</div>
                            <div className="user-info">
                                <span className="user-name">{adminUsername}</span>
                                <span className="user-role">admin</span>
                            </div>
                        </button>
                        {showUserMenu && (
                            <div className="user-dropdown" style={{
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
                                    className="user-dropdown-item"
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
                                                <div className="action-group">
                                                    <button
                                                        onClick={() => handleViewSupplier(s)}
                                                        className="action-btn action-btn-view"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditSupplier(s)}
                                                        className="action-btn action-btn-edit"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <div className="action-group action-group-secondary">
                                                    {s.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(s.sellerId)}
                                                                className="action-btn action-btn-approve"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(s.sellerId)}
                                                                className="action-btn action-btn-reject"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {s.status === "Active" && (
                                                        <button
                                                            onClick={() => handleDeactivate(s.sellerId)}
                                                            className="action-btn action-btn-deactivate"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    )}
                                                    {s.status === "Deactivated" && (
                                                        <button
                                                            onClick={() => handleActivate(s.sellerId)}
                                                            className="action-btn action-btn-activate"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                </div>
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
                        {[
                            { key: "storeName", label: "Store Name", placeholder: "Enter store name" },
                            { key: "username", label: "Username", placeholder: "Enter username" },
                            { key: "email", label: "Email", placeholder: "Enter email" },
                            { key: "phoneNumber", label: "Phone Number", placeholder: "Enter phone number" },
                            { key: "address", label: "Address", placeholder: "Enter address" },
                            { key: "password", label: "Password", placeholder: "Enter password", type: "password" }
                        ].map(field => (
                            <div className="modal-field" key={field.key}>
                                <label className="modal-label">{field.label}</label>
                                <input
                                    className="modal-input"
                                    type={field.type || "text"}
                                    value={newSupplier[field.key]}
                                    onChange={e => setNewSupplier({ ...newSupplier, [field.key]: e.target.value })}
                                    placeholder={field.placeholder}
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

            {showViewModal && viewSupplier && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Supplier Details</h2>
                        <div className="view-grid">
                            <p><strong>ID:</strong> {viewSupplier.id}</p>
                            <p><strong>Store Name:</strong> {viewSupplier.storeName}</p>
                            <p><strong>Username:</strong> {viewSupplier.username}</p>
                            <p><strong>Email:</strong> {viewSupplier.email}</p>
                            <p><strong>Phone Number:</strong> {viewSupplier.phoneNumber}</p>
                            <p><strong>Address:</strong> {viewSupplier.address}</p>
                            <p><strong>Status:</strong> {viewSupplier.status}</p>
                            <p><strong>Date Registered:</strong> {viewSupplier.date}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editSupplier && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Supplier</h2>
                        {[
                            { key: "storeName", label: "Store Name" },
                            { key: "phoneNumber", label: "Phone Number" },
                            { key: "address", label: "Address" }
                        ].map(field => (
                            <div className="modal-field" key={field.key}>
                                <label className="modal-label">{field.label}</label>
                                <input
                                    className="modal-input"
                                    value={editSupplier[field.key] || ""}
                                    onChange={e => setEditSupplier({ ...editSupplier, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn-add" onClick={handleUpdateSupplier}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}