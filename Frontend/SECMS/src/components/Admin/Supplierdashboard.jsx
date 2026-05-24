import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Supplierdashboard.css';

/* ── Icons ───────────────────────────────────────────────── */
const Icon = {
    menu: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    overview: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    users: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    suppliers: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    transactions: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    reports: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    reviews: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    signout: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    search: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    chevron: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    ),
    store: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <path d="M9 21V9" />
        </svg>
    ),
    eye: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    userCheck: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
        </svg>
    ),
    edit: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    trash: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    )
};

const NAV = [
    { section: "MAIN", items: [{ id: "Overview", icon: "overview" }] },
    {
        section: "MANAGEMENT", items: [
            { id: "Users", icon: "users" },
            { id: "Suppliers", icon: "suppliers" },
        ]
    },
    {
        section: "STORE", items: [
            { id: "Transactions", icon: "transactions" },
            { id: "Reports", icon: "reports" },
            { id: "Reviews", icon: "reviews" },
        ]
    },
];

export default function Supplierdashboard({ activeNav: activeNavProp, onNavChange }) {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Suppliers");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewSupplier, setViewSupplier] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSupplier, setEditSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSupplier, setNewSupplier] = useState({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "admin";

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("seller");
        localStorage.removeItem("rememberSellerLogin");
        navigate("/");
    };

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/sellers/all");
            const data = await response.json();
            const formattedData = data.map((seller) => ({
                id: seller.id,
                sellerId: seller.id,
                username: seller.username || "N/A",
                date: "Jan 2024", // Hardcoded to match design, ideally format seller.createdAt
                email: seller.email,
                phoneNumber: seller.phoneNumber || "N/A",
                address: seller.address || "N/A",
                storeName: seller.storeName,
                status: seller.status === "ACTIVE" ? "Active" : (seller.status === "DEACTIVATED" ? "Deactivated" : (seller.status === "PENDING" ? "Pending" : (seller.status === "REJECTED" ? "Rejected" : seller.status))),
                revenue: "LKR 0.00" // Placeholder for design
            }));
            setSuppliers(formattedData);
        } catch (error) {
            console.error("Error fetching sellers:", error);
            // Fallback for UI if API fails
            setSuppliers([
                { id: 1, storeName: "sample", email: "supplier@anywear.com", username: "sample", date: "Jan 2024", revenue: "LKR 0.00", status: "Active" },
                { id: 2, storeName: "store2", email: "supplier2@anywear.com", username: "supplier2", date: "Jan 2024", revenue: "LKR 0.00", status: "Active" },
                { id: 3, storeName: "Aiterre", email: "Aiterre@mail.com", username: "Aiterre", date: "Jan 2024", revenue: "LKR 27,995.00", status: "Active" },
                { id: 4, storeName: "Velora", email: "Velora@mail.com", username: "Velora", date: "Jan 2024", revenue: "LKR 62,889.00", status: "Active" },
                { id: 5, storeName: "Solren", email: "Solren@mail.com", username: "Solren", date: "Jan 2024", revenue: "LKR 0.00", status: "Active" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleNavClick = (label) => {
        setActiveNav(label);
        if (onNavChange) onNavChange(label);
    };

    const filtered = suppliers.filter(s =>
        s.storeName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.username?.toLowerCase().includes(search.toLowerCase())
    );

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
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Failed to add supplier");
            }
            await fetchSellers();
            setNewSupplier({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });
            setShowModal(false);
            alert("Supplier added successfully");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDeactivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/deactivate`, { method: "PUT" });
            if (response.ok) fetchSellers();
        } catch (error) { console.error(error); }
    };

    const handleActivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/activate`, { method: "PUT" });
            if (response.ok) fetchSellers();
        } catch (error) { console.error(error); }
    };

    const handleApprove = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/approve`, { method: "PUT" });
            if (response.ok) fetchSellers();
        } catch (error) { console.error(error); }
    };

    const handleReject = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/reject`, { method: "PUT" });
            if (response.ok) fetchSellers();
        } catch (error) { console.error(error); }
    };

    const handleUpdateSupplier = async () => {
        if (!editSupplier) return;
        try {
            const id = editSupplier.sellerId || editSupplier.id;
            const response = await fetch(`http://localhost:8080/api/sellers/${id}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeName: editSupplier.storeName,
                    phoneNumber: editSupplier.phoneNumber,
                    address: editSupplier.address,
                    email: editSupplier.email,
                    username: editSupplier.username
                })
            });
            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Failed to update supplier");
            }
            setShowEditModal(false);
            setEditSupplier(null);
            fetchSellers();
        } catch (error) {
            alert(`Error updating: ${error.message}`);
        }
    };

    const handleDelete = async (sellerId) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}`, { method: "DELETE" });
                if (response.ok) {
                    fetchSellers();
                } else {
                    throw new Error("Failed to delete");
                }
            } catch (error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="sd-layout-inner">
            <main className="sd-main">
                {/* Header */}
                <div className="sd-header-row">
                    <div>
                        <h1 className="sd-page-title">Suppliers</h1>
                        <p className="sd-page-subtitle">Manage platform partners, approval workflows, and operational status.</p>
                    </div>
                    <button className="sd-add-btn" onClick={() => setShowModal(true)}>
                        + Add Partner
                    </button>
                </div>

                {/* Filters */}
                <div className="sd-filters">
                    <div className="sd-search">
                        <Icon.search />
                        <input
                            type="text"
                            placeholder="Search by store name, email or handle..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="sd-status-filter">
                        All Statuses <Icon.chevron />
                    </div>
                </div>

                {/* Table */}
                <div className="sd-table-container">
                    <table className="sd-table">
                        <thead>
                            <tr>
                                <th>PARTNER</th>
                                <th>HANDLE</th>
                                <th>JOINED</th>
                                <th>REVENUE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && suppliers.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No suppliers found</td></tr>
                            ) : (
                                filtered.map(s => (
                                    <tr key={s.id || s.storeName}>
                                        <td>
                                            <div className="sd-partner-cell">
                                                <div className="sd-partner-icon"><Icon.store /></div>
                                                <div className="sd-partner-info">
                                                    <span className="sd-partner-name">{s.storeName}</span>
                                                    <span className="sd-partner-email">{s.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="sd-handle-badge">@{s.username || s.storeName?.toLowerCase()}</span></td>
                                        <td><span className="sd-text-sm">{s.date}</span></td>
                                        <td><span className="sd-revenue-text">{s.revenue || "LKR 0.00"}</span></td>
                                        <td>
                                            <span className={`sd-status-badge sd-status--${s.status?.toLowerCase()}`}>
                                                <span className="sd-status-dot"></span>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sd-actions-row">
                                                <button className="sd-action-btn" onClick={() => { setViewSupplier(s); setShowViewModal(true); }}><Icon.eye /></button>
                                                {s.status !== 'Pending' && (
                                                    <>
                                                        {s.status !== 'Rejected' && (
                                                            <button className="sd-action-btn" onClick={() => {
                                                                if (s.status === 'Active') handleDeactivate(s.sellerId || s.id);
                                                                else if (s.status === 'Deactivated') handleActivate(s.sellerId || s.id);
                                                            }}>
                                                                <Icon.userCheck />
                                                            </button>
                                                        )}
                                                        <button className="sd-action-btn" onClick={() => { setEditSupplier(s); setShowEditModal(true); }}><Icon.edit /></button>
                                                        <button className="sd-action-btn" onClick={() => handleDelete(s.sellerId || s.id)}><Icon.trash /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modals */}
            {showModal && (
                <div className="sd-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="sd-modal" onClick={e => e.stopPropagation()}>
                        <div className="sd-modal-header">
                            <div>
                                <h2 className="sd-modal-title">Register Partner</h2>
                                <div className="sd-modal-title-underline"></div>
                            </div>
                            <button className="sd-modal-close" onClick={() => setShowModal(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="sd-modal-body">
                            <div className="sd-form-row">
                                <div className="sd-form-group">
                                    <label>STORE NAME</label>
                                    <input className="sd-input" type="text" onChange={e => setNewSupplier({ ...newSupplier, storeName: e.target.value })} />
                                </div>
                                <div className="sd-form-group">
                                    <label>USERNAME</label>
                                    <input className="sd-input" type="text" onChange={e => setNewSupplier({ ...newSupplier, username: e.target.value })} />
                                </div>
                            </div>

                            <div className="sd-form-row">
                                <div className="sd-form-group">
                                    <label>EMAIL</label>
                                    <input className="sd-input" type="email" onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                                </div>
                                <div className="sd-form-group">
                                    <label>PHONE</label>
                                    <input className="sd-input" type="text" placeholder="10 digits" value={newSupplier.phoneNumber} onChange={e => setNewSupplier({ ...newSupplier, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                                </div>
                            </div>

                            <div className="sd-form-group">
                                <label>BUSINESS ADDRESS</label>
                                <input className="sd-input" type="text" onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} />
                            </div>

                            <div className="sd-form-group">
                                <label>PASSWORD</label>
                                <input className="sd-input sd-input--password" type="password" placeholder="••••••••••" onChange={e => setNewSupplier({ ...newSupplier, password: e.target.value })} />
                                <span className="sd-input-hint">Requires at least 6 characters, 1 uppercase letter, and 1 number.</span>
                            </div>
                        </div>

                        <div className="sd-modal-actions">
                            <button className="sd-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="sd-btn-primary" onClick={handleAdd}>Register Supplier</button>
                        </div>
                    </div>
                </div>
            )}

            {showViewModal && viewSupplier && (
                <div className="sd-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="sd-modal" onClick={e => e.stopPropagation()}>
                        <div className="sd-modal-header">
                            <div>
                                <h2 className="sd-modal-title">Partner Profile</h2>
                                <div className="sd-modal-title-underline"></div>
                            </div>
                            <button className="sd-modal-close" onClick={() => setShowViewModal(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="sd-profile-card">
                            <div className="sd-profile-icon"><Icon.store /></div>
                            <div className="sd-profile-info">
                                <h3 className="sd-profile-name">{viewSupplier.storeName}</h3>
                                <p className="sd-profile-handle">@{viewSupplier.username || viewSupplier.storeName?.toLowerCase()}</p>
                                <span className={`sd-profile-badge ${viewSupplier.status === 'Pending' ? 'sd-profile-badge-pending' : (viewSupplier.status === 'Rejected' ? 'sd-profile-badge-rejected' : '')}`}>
                                    {viewSupplier.status === 'Pending' ? 'Pending' : (viewSupplier.status === 'Rejected' ? 'Rejected' : 'OFFICIAL PARTNER')}
                                </span>
                            </div>
                        </div>

                        <div className="sd-profile-details">
                            <div className="sd-profile-item">
                                <span className="sd-profile-item-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </span>
                                <div className="sd-profile-item-text">
                                    <label>BUSINESS EMAIL</label>
                                    <p>{viewSupplier.email}</p>
                                </div>
                            </div>
                            <div className="sd-profile-item">
                                <span className="sd-profile-item-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </span>
                                <div className="sd-profile-item-text">
                                    <label>SUPPORT CONTACT</label>
                                    <p>{viewSupplier.phoneNumber || "N/A"}</p>
                                </div>
                            </div>
                            <div className="sd-profile-item">
                                <span className="sd-profile-item-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </span>
                                <div className="sd-profile-item-text">
                                    <label>HEADQUARTERS</label>
                                    <p>{viewSupplier.address || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="sd-modal-footer-full">
                            {viewSupplier.status === 'Pending' ? (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="sd-btn-cancel" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => { handleReject(viewSupplier.sellerId || viewSupplier.id); setShowViewModal(false); }}>Reject</button>
                                    <button className="sd-btn-primary" onClick={() => { handleApprove(viewSupplier.sellerId || viewSupplier.id); setShowViewModal(false); }}>Approve</button>
                                </div>
                            ) : (
                                <button className="sd-btn-outline-full" onClick={() => setShowViewModal(false)}>Close Profile</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editSupplier && (
                <div className="sd-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="sd-modal" onClick={e => e.stopPropagation()}>
                        <div className="sd-modal-header">
                            <div>
                                <h2 className="sd-modal-title">Modify Partner</h2>
                                <div className="sd-modal-title-underline"></div>
                            </div>
                            <button className="sd-modal-close" onClick={() => setShowEditModal(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="sd-modal-body">
                            <div className="sd-form-row">
                                <div className="sd-form-group">
                                    <label>STORE NAME</label>
                                    <input className="sd-input" type="text" value={editSupplier.storeName || ""} onChange={e => setEditSupplier({ ...editSupplier, storeName: e.target.value })} />
                                </div>
                                <div className="sd-form-group">
                                    <label>USERNAME</label>
                                    <input className="sd-input" type="text" value={editSupplier.username || ""} onChange={e => setEditSupplier({ ...editSupplier, username: e.target.value })} />
                                </div>
                            </div>

                            <div className="sd-form-row">
                                <div className="sd-form-group">
                                    <label>EMAIL</label>
                                    <input className="sd-input" type="email" value={editSupplier.email || ""} onChange={e => setEditSupplier({ ...editSupplier, email: e.target.value })} />
                                </div>
                                <div className="sd-form-group">
                                    <label>PHONE</label>
                                    <input className="sd-input" type="text" value={editSupplier.phoneNumber || ""} onChange={e => setEditSupplier({ ...editSupplier, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                                </div>
                            </div>

                            <div className="sd-form-group">
                                <label>BUSINESS ADDRESS</label>
                                <input className="sd-input" type="text" value={editSupplier.address || ""} onChange={e => setEditSupplier({ ...editSupplier, address: e.target.value })} />
                            </div>
                        </div>

                        <div className="sd-modal-actions">
                            <button className="sd-btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <div style={{ display: 'flex', gap: '12px', flex: 2 }}>
                                {editSupplier.status === 'Rejected' && (
                                    <button className="sd-btn-primary" style={{ background: '#10b981', flex: 1 }} onClick={() => {
                                        const id = editSupplier.sellerId || editSupplier.id;
                                        fetch(`http://localhost:8080/api/sellers/${id}/activate`, { method: "PUT" })
                                            .then(() => handleUpdateSupplier())
                                            .catch(console.error);
                                    }}>Save & Reactivate</button>
                                )}
                                {editSupplier.status !== 'Rejected' && (
                                    <button className="sd-btn-primary" style={{ flex: 1 }} onClick={handleUpdateSupplier}>Save Changes</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}