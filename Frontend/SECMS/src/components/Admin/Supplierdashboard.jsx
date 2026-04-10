import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderAPI from "../../api/orderAPI";
import reviewAPI from "../../api/reviewAPI";
import './Supplierdashboard.css';

const navItems = [
    { label: "Overview" },
    { label: "Users" },
    { label: "Suppliers" },
    { label: "Orders" },
    { label: "Payments" },
    { label: "Reviews" },
];

export default function Supplierdashboard({ activeNav: activeNavProp, onNavChange }) {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Suppliers");
    const [search, setSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewSupplier, setViewSupplier] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSupplier, setEditSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });
    
    // Reviews state
    const [sellerReviews, setSellerReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState('');

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const seller = JSON.parse(localStorage.getItem("seller") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "Admin";

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
            const formattedData = data.map((s) => ({
                id: s.id,
                sellerId: s.id,
                username: s.username || "N/A",
                date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
                email: s.email,
                phoneNumber: s.phoneNumber || "N/A",
                address: s.address || "N/A",
                storeName: s.storeName,
                status: s.status === "ACTIVE" ? "Active" : (s.status === "DEACTIVATED" ? "Deactivated" : (s.status === "PENDING" ? "Pending" : (s.status === "REJECTED" ? "Rejected" : s.status)))
            }));
            setSuppliers(formattedData);
        } catch (error) {
            console.error("Error fetching sellers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSellerOrders = async () => {
        setOrdersLoading(true);
        try {
            const data = await orderAPI.getAllOrders();
            setSellerOrders(data || []);
        } catch (err) {
            console.error("Error fetching seller orders:", err);
            setSellerOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchSellerReviews = async (sellerId) => {
        if (!sellerId) return;
        setReviewsLoading(true);
        try {
            const data = await reviewAPI.getSellerReviews(sellerId);
            setSellerReviews(data || []);
        } catch (err) {
            console.error("Error fetching seller reviews:", err);
            setSellerReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
        fetchSellerOrders();
    }, []);

    useEffect(() => {
        if (activeNav === "Reviews" && selectedSellerId) {
            fetchSellerReviews(selectedSellerId);
        }
    }, [activeNav, selectedSellerId]);

    const handleNavClick = (label) => {
        setActiveNav(label);
        if (onNavChange) onNavChange(label);
    };

    const filtered = suppliers.filter(s =>
        s.storeName.toLowerCase().includes(search.toLowerCase())
    );

    const filteredOrders = sellerOrders.filter(o => {
        const txn = (o?.transactionId || "").toLowerCase();
        return txn.includes(orderSearch.toLowerCase());
    });

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
            await fetchSellers();
            setNewSupplier({ storeName: "", username: "", email: "", phoneNumber: "", address: "", password: "", status: "PENDING" });
            setShowModal(false);
            alert("Supplier added successfully");
        } catch (error) {
            alert(`Error adding supplier: ${error.message}`);
        }
    };

    const handleDeactivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/deactivate`, { method: "PUT", headers: { "Content-Type": "application/json" } });
            if (response.ok) setSuppliers(suppliers.map(s => s.sellerId === sellerId ? { ...s, status: "Deactivated" } : s));
            else alert("Failed to deactivate seller");
        } catch (error) { alert("Error deactivating seller"); }
    };

    const handleActivate = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/activate`, { method: "PUT", headers: { "Content-Type": "application/json" } });
            if (response.ok) setSuppliers(suppliers.map(s => s.sellerId === sellerId ? { ...s, status: "Active" } : s));
            else alert("Failed to activate seller");
        } catch (error) { alert("Error activating seller"); }
    };

    const handleApprove = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/approve`, { method: "PUT", headers: { "Content-Type": "application/json" } });
            if (response.ok) setSuppliers(suppliers.map(s => s.sellerId === sellerId ? { ...s, status: "Active" } : s));
            else alert("Failed to approve seller");
        } catch (error) { alert("Error approving seller"); }
    };

    const handleReject = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${sellerId}/reject`, { method: "PUT", headers: { "Content-Type": "application/json" } });
            if (response.ok) setSuppliers(suppliers.map(s => s.sellerId === sellerId ? { ...s, status: "Rejected" } : s));
            else alert("Failed to reject seller");
        } catch (error) { alert("Error rejecting seller"); }
    };

    const handleUpdateSupplier = async () => {
        if (!editSupplier) return;
        const { id, storeName, phoneNumber, address, username, email } = editSupplier;
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${id}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeName, phoneNumber, address, username, email })
            });
            if (!response.ok) throw new Error((await response.text()) || "Failed to update supplier");
            const updatedSeller = await response.json();
            setSuppliers(prev => prev.map(s => s.id === updatedSeller.id ? { ...s, storeName: updatedSeller.storeName, phoneNumber: updatedSeller.phoneNumber || "N/A", address: updatedSeller.address || "N/A", username: updatedSeller.username || "N/A", email: updatedSeller.email } : s));
            setShowEditModal(false);
            setEditSupplier(null);
            alert("Supplier updated successfully");
        } catch (error) { alert(`Error updating supplier: ${error.message}`); }
    };

    const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-brand">
                    <span className="brand-name" style={{ fontFamily: "'NORD', sans-serif", fontWeight: 700, letterSpacing: '0.12em' }}>ANYWEAR</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`nav-item ${activeNav === item.label ? "nav-item--active" : ""}`}
                            onClick={() => handleNavClick(item.label)}
                            style={{ fontFamily: "'Grift', sans-serif" }}
                        >
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div style={{ marginTop: 'auto', padding: '20px 16px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '12px 16px',
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: '8px', fontFamily: "'Grift', sans-serif",
                            fontSize: '14px', color: 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '10px', transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.borderColor = '#fca5a5';
                            e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <span>↪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <h1 className="topbar-title">Admin Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: '#1a1a1a', color: '#fff', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '15px', fontFamily: "'NORD', sans-serif", fontWeight: 700
                        }}>
                            {(adminUsername || "A")[0].toUpperCase()}
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>{adminUsername}</span>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>admin</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="admin-content">

                    {/* ── SUPPLIERS TAB ── */}
                    {activeNav === "Suppliers" && (
                        <>
                            {/* Hero Stats */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '22px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.04em', fontWeight: 700 }}>Supplier Management</h2>
                                    <button
                                        className="btn-add"
                                        onClick={() => setShowModal(true)}
                                        style={{ fontFamily: "'NORD', sans-serif", letterSpacing: '0.06em', fontSize: '12px' }}
                                    >+ ADD NEW</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                    {[
                                        { label: 'TOTAL SUPPLIERS', value: totalSuppliers, accent: '#1a1a1a' },
                                        { label: 'ACTIVE SUPPLIERS', value: activeSuppliers, accent: '#22c55e' },
                                        { label: 'PENDING APPROVAL', value: pendingSuppliers, accent: '#f59e0b' },
                                    ].map(card => (
                                        <div key={card.label} style={{
                                            background: '#fff', borderRadius: '14px',
                                            border: '1px solid var(--border)', padding: '28px 32px',
                                            display: 'flex', flexDirection: 'column', gap: '10px'
                                        }}>
                                            <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.1em', color: 'var(--text-secondary)', margin: 0 }}>{card.label}</p>
                                            <p style={{ fontSize: '44px', fontFamily: "'NORD', sans-serif", fontWeight: 700, margin: 0, color: card.accent, lineHeight: 1 }}>{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Table Card */}
                            <div className="table-card">
                                <div className="table-header">
                                    <div>
                                        <p className="table-card-title">Registered Suppliers</p>
                                        <p className="table-card-sub">A list of all platform suppliers</p>
                                    </div>
                                    <div className="search-box">
                                        <input
                                            className="search-input"
                                            placeholder="Search by store name..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <table className="supplier-table">
                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</td></tr>
                                        ) : filtered.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>No suppliers found</td></tr>
                                        ) : (
                                            filtered.map(s => (
                                                <tr key={s.id}>
                                                    <td style={{ fontWeight: 600 }}>{s.storeName}</td>
                                                    <td>{s.username}</td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                                                    <td>{s.phoneNumber}</td>
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
                                                            <button onClick={() => { setViewSupplier(s); setShowViewModal(true); }} className="action-btn action-btn-view">View</button>
                                                            <button onClick={() => { setEditSupplier({ ...s }); setShowEditModal(true); }} className="action-btn action-btn-edit">Edit</button>
                                                            {s.status === "Pending" && (<><button onClick={() => handleApprove(s.sellerId)} className="action-btn action-btn-approve">Approve</button><button onClick={() => handleReject(s.sellerId)} className="action-btn action-btn-reject">Reject</button></>)}
                                                            {s.status === "Active" && <button onClick={() => handleDeactivate(s.sellerId)} className="action-btn action-btn-deactivate">Deactivate</button>}
                                                            {s.status === "Deactivated" && <button onClick={() => handleActivate(s.sellerId)} className="action-btn action-btn-activate">Activate</button>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* ── ORDERS TAB ── */}
                    {activeNav === "Orders" && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '22px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.04em', fontWeight: 700 }}>All Orders</h2>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        value={orderSearch}
                                        onChange={e => setOrderSearch(e.target.value)}
                                        placeholder="Search by Transaction ID..."
                                        style={{
                                            padding: '10px 16px 10px 40px',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px', fontSize: '14px',
                                            background: '#fff', outline: 'none',
                                            width: '300px', fontFamily: "'Grift', sans-serif"
                                        }}
                                    />
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '15px' }}>⌕</span>
                                </div>
                            </div>

                            {ordersLoading ? (
                                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading orders...</div>
                            ) : filteredOrders.length === 0 ? (
                                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    {orderSearch ? `No orders matching "${orderSearch}"` : 'No orders found.'}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {filteredOrders.map(order => (
                                        <div key={order.id} style={{
                                            background: '#fff', borderRadius: '14px',
                                            border: '1px solid var(--border)', padding: '24px 32px'
                                        }}>
                                            {/* Order header row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                    {/* Transaction ID */}
                                                    <div>
                                                        <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>TRANSACTION ID</p>
                                                        <p style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'NORD', sans-serif", margin: 0 }}>{order?.transactionId || 'N/A'}</p>
                                                    </div>
                                                    {/* Order Date */}
                                                    <div>
                                                        <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>ORDER DATE</p>
                                                        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                                                            {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    {/* Customer */}
                                                    <div>
                                                        <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>CUSTOMER</p>
                                                        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                                                            {order?.customer?.firstName || ''} {order?.customer?.lastName || ''}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{order?.customer?.email || ''}</p>
                                                    </div>
                                                    {/* Items */}
                                                    <div>
                                                        <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>ITEMS</p>
                                                        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{order?.orderItems?.length || 0} item{order?.orderItems?.length !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                {/* Total */}
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '11px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>TOTAL</p>
                                                    <p style={{ fontSize: '20px', fontFamily: "'NORD', sans-serif", fontWeight: 700, margin: 0 }}>{fmtPrice(order?.finalAmount)}</p>
                                                </div>
                                            </div>

                                            {/* Order items */}
                                            {Array.isArray(order?.orderItems) && order.orderItems.length > 0 && (
                                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {order.orderItems.map((item, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={`/product/${item?.product?.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: '16px',
                                                                padding: '12px', borderRadius: '8px', background: '#f9f9f7',
                                                                border: '1px solid var(--border)', cursor: 'pointer',
                                                                transition: 'background 0.15s'
                                                            }}
                                                                onMouseEnter={e => e.currentTarget.style.background = '#f0f0ee'}
                                                                onMouseLeave={e => e.currentTarget.style.background = '#f9f9f7'}
                                                            >
                                                                <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', background: '#e8e8e4', flexShrink: 0 }}>
                                                                    {item?.product?.mainImagePath
                                                                        ? <img src={item.product.mainImagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa' }}>IMG</div>
                                                                    }
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{item?.product?.productName || 'N/A'}</p>
                                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                                                        Qty: {item?.quantity || 0} · {item?.product?.seller?.storeName || ''}
                                                                    </p>
                                                                </div>
                                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{fmtPrice(item?.subtotal)}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── REVIEWS TAB ── */}
                    {activeNav === "Reviews" && (
                        <div>
                            <h2 style={{ fontSize: '22px', fontFamily: "'NORD', sans-serif", letterSpacing: '0.04em', fontWeight: 700, marginBottom: '24px' }}>
                                Supplier Reviews
                            </h2>
                            
                            {/* Supplier Selector */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                                    Select Supplier:
                                </label>
                                <select 
                                    value={selectedSellerId} 
                                    onChange={(e) => setSelectedSellerId(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        minWidth: '250px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">-- Select a supplier --</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.storeName} ({supplier.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reviews Display */}
                            {selectedSellerId ? (
                                reviewsLoading ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <p style={{ color: '#6b7280' }}>Loading reviews...</p>
                                    </div>
                                ) : sellerReviews.length === 0 ? (
                                    <div style={{ padding: '32px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px' }}>
                                        <p style={{ color: '#6b7280' }}>No reviews found for this supplier.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {sellerReviews.map((review) => (
                                            <div 
                                                key={review.id} 
                                                style={{ 
                                                    background: '#fff', 
                                                    padding: '20px', 
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        {review.productImage && (
                                                            <img 
                                                                src={review.productImage} 
                                                                alt="" 
                                                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} 
                                                            />
                                                        )}
                                                        <div>
                                                            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px' }}>{review.productName}</p>
                                                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                                                By {review.customerName} · Transaction: {review.transactionId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ color: '#fbbf24', fontSize: '16px' }}>
                                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                        </span>
                                                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                                                            {new Date(review.createdAt).toLocaleDateString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {review.reviewText && (
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6', paddingLeft: '60px' }}>
                                                        "{review.reviewText}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div style={{ padding: '32px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px' }}>
                                    <p style={{ color: '#6b7280' }}>Please select a supplier to view their product reviews.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* ── MODALS ── */}
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
                            { key: "address", label: "Address" },
                            { key: "username", label: "Username" },
                            { key: "email", label: "Email" }
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