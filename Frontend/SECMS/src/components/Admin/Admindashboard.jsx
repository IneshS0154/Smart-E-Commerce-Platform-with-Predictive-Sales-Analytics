import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import './Admindashboard.css';
import Supplierdashboard from './Supplierdashboard';
import Userdashboard from './Userdashboard';
import orderAPI from '../../api/orderAPI';
import reviewAPI from '../../api/reviewAPI';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

const navItems = [
    { label: "Overview"},
    { label: "Users"},
    { label: "Suppliers"},
    { label: "Orders"},
    { label: "Payments"},
    { label: "Reviews"},
];

const sortOptions = ["Most Recent", "Oldest First", "Highest Amount", "Lowest Amount"];

export default function AdminOverview() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("Overview");
    const [sortBy, setSortBy] = useState("Most Recent");
    const [showSort, setShowSort] = useState(false);
    const [search, setSearch] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [orderSearch, setOrderSearch] = useState("");
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    // Reviews state
    const [allReviews, setAllReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [ratingFilter, setRatingFilter] = useState('all');

    const toggleOrderExpand = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) newSet.delete(orderId);
            else newSet.add(orderId);
            return newSet;
        });
    };

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("seller");
        localStorage.removeItem("rememberSellerLogin");
        navigate("/");
    };

    const fetchAllOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const data = await orderAPI.getAllOrders();
            console.log('Admin orders response:', data);
            setAllOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrdersError(err?.response?.data?.message || err?.message || 'Failed to load orders');
            setAllOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchAllReviews = async () => {
        setReviewsLoading(true);
        try {
            const data = await reviewAPI.getAllReviews();
            setAllReviews(data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setAllReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewAPI.deleteReviewAsAdmin(reviewId);
            alert('Review deleted successfully');
            fetchAllReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err?.response?.data?.message || 'Failed to delete review');
        }
    };

    useEffect(() => {
        if (activeNav === "Orders" || activeNav === "Overview") {
            fetchAllOrders();
        }
        if (activeNav === "Reviews") {
            fetchAllReviews();
        }
    }, [activeNav]);

    // ---- All hooks and derived state must be above early-returns ----

    const filtered = allOrders.filter(o => {
        const trId = (o?.transactionId || "").toLowerCase();
        const fName = (o?.customer?.firstName || "").toLowerCase();
        const lName = (o?.customer?.lastName || "").toLowerCase();
        const s = search.toLowerCase();
        return trId.includes(s) || fName.includes(s) || lName.includes(s);
    });

    const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime();
        const dateB = new Date(b?.createdAt || 0).getTime();
        const amtA = parseFloat(a?.finalAmount) || 0;
        const amtB = parseFloat(b?.finalAmount) || 0;

        if (sortBy === "Oldest First") return dateA - dateB;
        if (sortBy === "Highest Amount") return amtB - amtA;
        if (sortBy === "Lowest Amount") return amtA - amtB;
        return dateB - dateA;
    });

    // Core Computations for Overview Widgets
    const { topSuppliers, topProducts, avgOrderValue } = useMemo(() => {
        let supplierMap = {};
        let productMap = {};
        let totalRev = 0;

        allOrders.forEach(o => {
            const amt = parseFloat(o?.finalAmount) || 0;
            totalRev += amt;

            if (Array.isArray(o?.orderItems)) {
                o.orderItems.forEach(item => {
                    const supId = item?.product?.seller?.id || 'unknown';
                    const supName = item?.product?.seller?.storeName || 'Unknown Supplier';
                    const subT = parseFloat(item?.subtotal) || 0;

                    if (!supplierMap[supId]) supplierMap[supId] = { id: supId, name: supName, revenue: 0, sales: 0 };
                    supplierMap[supId].revenue += subT;
                    supplierMap[supId].sales += 1;

                    const prodId = item?.product?.id || 'unknown';
                    const prodName = item?.product?.productName || 'Unknown Product';
                    const qty = parseInt(item?.quantity) || 0;

                    if (!productMap[prodId]) productMap[prodId] = { id: prodId, name: prodName, volume: 0, revenue: 0, img: item?.product?.mainImagePath };
                    productMap[prodId].volume += qty;
                    productMap[prodId].revenue += subT;
                });
            }
        });

        const sortedSuppliers = Object.values(supplierMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const sortedProducts = Object.values(productMap).sort((a, b) => b.volume - a.volume).slice(0, 5);
        const aov = allOrders.length > 0 ? (totalRev / allOrders.length) : 0;

        return { topSuppliers: sortedSuppliers, topProducts: sortedProducts, avgOrderValue: aov };
    }, [allOrders]);

    if (activeNav === "Users") {
        return <Userdashboard activeNav={activeNav} onNavChange={setActiveNav} />;
    }

    if (activeNav === "Suppliers") {
        return <Supplierdashboard activeNav={activeNav} onNavChange={setActiveNav} />;
    }

    if (activeNav === "Orders") {
        return (
            <div className="ov-layout">
                <aside className="ov-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ov-brand">
                        <span className="ov-brand-name" style={{ fontFamily: "'NORD', sans-serif", fontWeight: 700, letterSpacing: '0.12em' }}>ANYWEAR</span>
                    </div>
                    <nav className="ov-nav">
                        {navItems.map(item => (
                            <button
                                key={item.label}
                                className={`ov-nav-item ${activeNav === item.label ? "ov-nav-item--active" : ""}`}
                                onClick={() => setActiveNav(item.label)}
                                style={{ fontFamily: "'Grift', sans-serif" }}
                            >
                                <span className="ov-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div style={{ marginTop: 'auto', padding: '20px 16px' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%', padding: '12px 16px',
                                background: 'transparent', border: '1px solid var(--ov-border)',
                                borderRadius: '8px', fontFamily: "'Grift', sans-serif",
                                fontSize: '14px', color: 'var(--ov-text-secondary)',
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
                                e.currentTarget.style.borderColor = 'var(--ov-border)';
                                e.currentTarget.style.color = 'var(--ov-text-secondary)';
                            }}
                        >
                            <span>↪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                <main className="ov-main">
                    <header className="ov-topbar">
                        <h1 className="ov-topbar-title">All Orders</h1>
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

                    <div className="ov-content">
                        <h2 className="ov-section-title">Customer Orders</h2>
                        
                        {ordersLoading ? (
                            <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--ov-text-secondary)', fontSize: '14px' }}>Loading orders...</p>
                            </div>
                        ) : ordersError ? (
                            <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <p style={{ color: '#dc2626', fontSize: '14px' }}>Error: {ordersError}</p>
                                <button 
                                    onClick={fetchAllOrders}
                                    style={{ marginTop: '16px', padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : allOrders.length === 0 ? (
                            <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--ov-text-secondary)', fontSize: '14px' }}>No orders yet.</p>
                            </div>
                        ) : (
                            <div className="orders-list-container">
                                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ position: 'relative', width: '320px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Search by Transaction ID..."
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '8px', 
                                                border: '1px solid var(--border)', 
                                                width: '100%', 
                                                fontSize: '13px', 
                                                fontFamily: '"NORD", sans-serif',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="orders-list">
                                    {Array.isArray(allOrders) && allOrders.filter(o => 
                                        !orderSearch || (o?.transactionId || '').toLowerCase().includes(orderSearch.toLowerCase())
                                    ).map((order) => (
                                        <div key={order?.id || Math.random()} className="order-card" style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid var(--ov-border)',
                                        marginBottom: '20px',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="order-header" 
                                            onClick={() => order?.id && toggleOrderExpand(order.id)}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '16px 20px',
                                                background: expandedOrders.has(order?.id) ? '#fff' : '#f8f8f6',
                                                borderBottom: expandedOrders.has(order?.id) ? '1px solid var(--border)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s ease'
                                            }}>
                                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction ID</p>
                                                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{order?.transactionId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</p>
                                                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                                                        {order?.customer?.firstName || ''} {order?.customer?.lastName || ''}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{order?.customer?.username || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
                                                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                                                        {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '100px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    background: '#dcfce7',
                                                    color: '#16a34a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <span style={{ fontSize: '14px' }}>✓</span> PAID
                                                </span>
                                                <span style={{ fontSize: '16px', fontWeight: 700 }}>{fmtPrice(order?.finalAmount)}</span>
                                                <span style={{ 
                                                    marginLeft: '8px', 
                                                    fontSize: '14px', 
                                                    color: '#888',
                                                    transform: expandedOrders.has(order?.id) ? 'rotate(180deg)' : 'rotate(0deg)', 
                                                    transition: 'transform 0.3s ease' 
                                                }}>▼</span>
                                            </div>
                                        </div>
                                        {expandedOrders.has(order?.id) && (
                                            <>
                                                <div className="order-items" style={{ padding: '0 20px' }}>
                                                    {Array.isArray(order?.orderItems) && order.orderItems.map((item, idx) => (
                                                        <a href={`/product/${item?.product?.id}`} target="_blank" rel="noopener noreferrer" key={idx} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '16px',
                                                            padding: '20px 0',
                                                            borderBottom: idx < (order?.orderItems?.length || 0) - 1 ? '1px solid #f0f0ee' : 'none',
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s ease'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <div style={{
                                                                width: '60px',
                                                                height: '75px',
                                                                borderRadius: '6px',
                                                                overflow: 'hidden',
                                                                background: '#f0f0ee',
                                                                flexShrink: 0
                                                            }}>
                                                                {item?.product?.mainImagePath ? (
                                                                    <img src={item.product.mainImagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa' }}>No Img</div>
                                                                )}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>{item?.product?.productName || 'Unknown Product'}</p>
                                                                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Size: {item?.size || 'N/A'} | Qty: {item?.quantity || 0}</p>
                                                                <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Supplier: {item?.product?.seller?.storeName || 'Unknown'}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{fmtPrice(item?.subtotal)}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                                <div className="order-footer" style={{
                                                    padding: '12px 20px',
                                                    background: '#fafaf8',
                                                    borderTop: '1px solid var(--border)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }}>
                                                    <span>Payment: {order?.cardType || 'Card'} **** {order?.cardLastFour || '****'}</span>
                                                    <span>Discount: {fmtPrice(order?.discountAmount)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="ov-layout">
            {/* Sidebar */}
            <aside className="ov-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="ov-brand">
                    <span className="ov-brand-name" style={{ fontFamily: "'NORD', sans-serif", fontWeight: 700, letterSpacing: '0.12em' }}>ANYWEAR</span>
                </div>
                <nav className="ov-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`ov-nav-item ${activeNav === item.label ? "ov-nav-item--active" : ""}`}
                            onClick={() => setActiveNav(item.label)}
                            style={{ fontFamily: "'Grift', sans-serif" }}
                        >
                            <span className="ov-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div style={{ marginTop: 'auto', padding: '20px 16px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '12px 16px',
                            background: 'transparent', border: '1px solid var(--ov-border)',
                            borderRadius: '8px', fontFamily: "'Grift', sans-serif",
                            fontSize: '14px', color: 'var(--ov-text-secondary)',
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
                            e.currentTarget.style.borderColor = 'var(--ov-border)';
                            e.currentTarget.style.color = 'var(--ov-text-secondary)';
                        }}
                    >
                        <span>↪</span>
                        <span>Logout</span>
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
                    {/* Show Sales and Payment History for all tabs except Reviews */}
                    {activeNav !== "Reviews" && (
                        <>
                            <h2 className="ov-section-title">Sales and Payment History</h2>

                            {/* Stats */}
                            <div className="ov-stats-grid">
                                <div className="ov-stat-card ov-stat-card--wide">
                                    <p className="ov-stat-label">Total Revenue</p>
                                    <p className="ov-stat-value">{ordersLoading ? '...' : fmtPrice(allOrders.reduce((sum, o) => sum + (parseFloat(o?.finalAmount) || 0), 0))}</p>
                                    <p className="ov-stat-growth">+{allOrders.length > 0 ? Math.round((allOrders.filter(o => new Date(o?.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length / allOrders.length) * 100) : 0}% from last month</p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">Total Orders</p>
                                    <p className="ov-stat-value">{ordersLoading ? '...' : allOrders.length}</p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">New Users(M)</p>
                                    <p className="ov-stat-value">{ordersLoading ? '...' : new Set(allOrders.map(o => o?.customer?.id)).size}</p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">New Sellers(M)</p>
                                    <p className="ov-stat-value">{ordersLoading ? '...' : new Set(allOrders.flatMap(o => o?.orderItems?.map(i => i?.product?.seller?.id) || [])).size}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Component Rendering by Nav */}
                    {activeNav === "Payments" && (
                        <div className="ov-table-card">
                        <div className="ov-table-header">
                            <div>
                                <p className="ov-table-title">Payment Transactions</p>
                                <p className="ov-table-sub">A list of recent payments and sales</p>
                            </div>
                            <div className="ov-table-actions">
                                <div className="ov-search-box">
                                    <input
                                        className="ov-search-input"
                                        placeholder="Search"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="ov-sort-wrapper">
                                    <button className="ov-sort-btn" onClick={() => setShowSort(!showSort)}>
                                        {sortBy} <span className="ov-sort-chevron">&#8964;</span>
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
                                <th>Customer Name</th>
                                <th>Date</th>
                                <th>Payment Method</th>
                                <th>Items Count</th>
                                <th>Total Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sorted.map(o => (
                                <tr key={o.id}>
                                    <td>{o?.transactionId || 'N/A'}</td>
                                    <td>{o?.customer?.firstName || ''} {o?.customer?.lastName || ''}</td>
                                    <td>{o?.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : 'N/A'}</td>
                                    <td>{o?.cardType || 'Card'} **** {o?.cardLastFour || '****'}</td>
                                    <td>{o?.orderItems?.length || 0}</td>
                                    <td className="ov-amount" style={{ fontWeight: 600 }}>{fmtPrice(o?.finalAmount)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    )}

                    {activeNav === "Reviews" && (
                        <div>
                            <h2 className="ov-section-title">Customer Reviews Management</h2>
                            
                            {/* Rating Filter */}
                            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter by Rating:</span>
                                <select 
                                    value={ratingFilter} 
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            {/* Reviews Table */}
                            <div className="ov-table-card">
                                {reviewsLoading ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <p style={{ color: '#6b7280' }}>Loading reviews...</p>
                                    </div>
                                ) : allReviews.filter(r => ratingFilter === 'all' || r.rating === parseInt(ratingFilter)).length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <p style={{ color: '#6b7280' }}>No reviews found.</p>
                                    </div>
                                ) : (
                                    <table className="ov-table">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Product</th>
                                                <th>Seller</th>
                                                <th>Rating</th>
                                                <th>Review</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allReviews
                                                .filter(r => ratingFilter === 'all' || r.rating === parseInt(ratingFilter))
                                                .map(review => (
                                                <tr key={review.id}>
                                                    <td>{review.customerName}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {review.productImage && (
                                                                <img 
                                                                    src={review.productImage} 
                                                                    alt="" 
                                                                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} 
                                                                />
                                                            )}
                                                            <span style={{ fontSize: '13px' }}>{review.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td>{review.sellerName}</td>
                                                    <td>
                                                        <span style={{ color: '#fbbf24' }}>
                                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                        </span>
                                                    </td>
                                                    <td style={{ maxWidth: '200px' }}>
                                                        <p style={{ margin: 0, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {review.reviewText || 'No written review'}
                                                        </p>
                                                    </td>
                                                    <td>{new Date(review.createdAt).toLocaleDateString('en-GB')}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                border: '1px solid #fca5a5',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeNav === "Overview" && (
                        <div className="ov-widgets-container" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px',
                            marginTop: '24px'
                        }}>
                            {/* Highest Earning Suppliers */}
                            <div className="ov-widget-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                                <h3 style={{ fontSize: '14px', margin: '0 0 20px', fontFamily: '"NORD", sans-serif', letterSpacing: '0.05em' }}>HIGHEST EARNING SUPPLIERS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {topSuppliers.length === 0 && <p style={{ fontSize: '13px', color: '#888' }}>No supplier data available.</p>}
                                    {topSuppliers.map((sup, idx) => (
                                        <div key={sup.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontFamily: '"NORD", sans-serif' }}>{idx + 1}</div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{sup.name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{sup.sales} Sales Generated</p>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{fmtPrice(sup.revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Most Popular Products */}
                            <div className="ov-widget-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                                <h3 style={{ fontSize: '14px', margin: '0 0 20px', fontFamily: '"NORD", sans-serif', letterSpacing: '0.05em' }}>MOST POPULAR PRODUCTS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {topProducts.length === 0 && <p style={{ fontSize: '13px', color: '#888' }}>No product data available.</p>}
                                    {topProducts.map((prod) => (
                                        <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#f8f8f6', flexShrink: 0 }}>
                                                    {prod.img ? <img src={prod.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa' }}>No Img</div>}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '140px' }}>{prod.name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Volume: {prod.volume}</p>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{fmtPrice(prod.revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Insights */}
                            <div className="ov-widget-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '14px', margin: '0 0 20px', fontFamily: '"NORD", sans-serif', letterSpacing: '0.05em' }}>PERFORMANCE INSIGHTS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Order Value (AOV)</p>
                                        <p style={{ fontSize: '28px', fontFamily: '"NORD", sans-serif', margin: 0, fontWeight: 700 }}>{fmtPrice(avgOrderValue)}</p>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Health</p>
                                        <div style={{ padding: '16px', background: '#f8f8f6', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, margin: 0 }}>
                                                {topSuppliers.length > 0 
                                                    ? `Your top supplier, ${topSuppliers[0].name}, is driving significant revenue volume. Ensure stock health to maintain AOV trajectory.` 
                                                    : `Collect more order data to unlock advanced platform insights.`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}