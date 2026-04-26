import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import orderAPI from '../../api/orderAPI';
import AdminSidebar from './AdminSidebar';
import {
    Search as SearchIcon,
    Download,
    Filter,
    MoreHorizontal,
    ShoppingBag,
    Package,
    CheckCircle2,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    TrendingUp,
    X,
    User,
    Calendar,
    Tag,
    Clock,
    Zap,
    ArrowRight,
    Activity
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';
import './AdminOrders.css';
import DarkVeil from '../ui/DarkVeil';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR 0.00';
const COLORS = ['#111111', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminTransactions({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Transactions");
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInsights, setShowInsights] = useState(false);
    const [insightsData, setInsightsData] = useState({ hourly: [], methods: [] });

    useEffect(() => {
        if (selectedOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedOrder]);

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderAPI.getAllOrders();
            setAllOrders(data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load data');
            setAllOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.location.href = "/";
    };

    const filteredOrders = allOrders.filter(o => {
        const matchesSearch = !search ||
            (o?.transactionId || '').toLowerCase().includes(search.toLowerCase()) ||
            (`${o?.customer?.firstName} ${o?.customer?.lastName}`).toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || o?.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // ── Insights Logic ──
    const insightsDataMemo = useMemo(() => {
        let hourlyData = {};
        let methodMap = {};
        let totalRevenue = 0;

        allOrders.forEach(o => {
            const amt = parseFloat(o.finalAmount) || 0;
            totalRevenue += amt;

            // Hourly Velocity
            const date = new Date(o.createdAt);
            const hour = date.getHours();
            const label = `${hour}:00`;
            hourlyData[label] = (hourlyData[label] || 0) + amt;

            // Method Distribution
            const method = o.cardType || 'Direct Transfer';
            methodMap[method] = (methodMap[method] || 0) + 1;
        });

        const hourly = Object.keys(hourlyData).map(k => ({ hour: k, revenue: hourlyData[k] })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        const methods = Object.keys(methodMap).map(k => ({ name: k, value: methodMap[k] }));

        return { hourly, methods, totalRevenue };
    }, [allOrders]);

    const totalVolume = allOrders.reduce((acc, curr) => acc + (curr?.finalAmount || 0), 0);
    const avgBasketValue = allOrders.length > 0 ? totalVolume / allOrders.length : 0;
    const successRate = 98.4;

    const getCardLogo = (type) => {
        const t = (type || 'visa').toLowerCase();
        if (t.includes('visa')) return "https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg";
        if (t.includes('mastercard')) return "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg";
        return null;
    };

    const renderContent = () => (
        <div className="admin-vault-content">
            <div className="orders-header-row">
                <div>
                    <h2 className="orders-page-title">Orders & Transactions</h2>
                    <p className="orders-page-subtitle">Unified ledger of sales, settlements, and customer fulfillment activity.</p>
                </div>
                <div className="header-action-group">
                    <button
                        className={`export-summary-btn secondary ${showInsights ? 'active' : ''}`}
                        onClick={() => setShowInsights(!showInsights)}
                    >
                        <TrendingUp size={18} />
                        <span>Insights</span>
                    </button>
                    <button
                        className="export-summary-btn"
                        onClick={() => exportToCSV(allOrders.map(o => ({
                            TransactionID: o.transactionId,
                            Customer: `${o.customer?.firstName} ${o.customer?.lastName}`,
                            Email: o.customer?.email,
                            Date: new Date(o.createdAt).toLocaleString(),
                            Items: o.orderItems?.length || 0,
                            Amount: o.finalAmount,
                            Method: `${o.cardType} ****${o.cardLastFour}`,
                            Status: "COMPLETED"
                        })), 'Anywear_Transactions_Ledger')}
                    >
                        <Download size={18} />
                        <span>Ledger Export</span>
                    </button>
                </div>
            </div>

            {/* Intelligence Grid */}
            <div className="orders-stats-grid">
                <div className="order-stat-card">
                    <div className="stat-icon-box blue">
                        <DollarSign size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">GROSS VOLUME</p>
                        <h3 className="stat-value">{fmtPrice(totalVolume)}</h3>
                        <p className="stat-sub">Total revenue processed</p>
                    </div>
                </div>
                <div className="order-stat-card">
                    <div className="stat-icon-box dark">
                        <ShoppingBag size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">TOTAL ORDERS</p>
                        <h3 className="stat-value">{allOrders.length}</h3>
                        <p className="stat-sub">Transactions ledgered</p>
                    </div>
                </div>
                <div className="order-stat-card">
                    <div className="stat-icon-box green">
                        <ArrowUpRight size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">AVG. BASKET</p>
                        <h3 className="stat-value">{fmtPrice(avgBasketValue)}</h3>
                        <p className="stat-sub">Customer LTV trend</p>
                    </div>
                </div>
                <div className="order-stat-card">
                    <div className="stat-icon-box indigo">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">SUCCESS RATE</p>
                        <h3 className="stat-value">{successRate}%</h3>
                        <p className="stat-sub">Fulfillment health</p>
                    </div>
                </div>
            </div>

            {/* Main Layout Row with Optional Insights Sidebar */}
            <div className="orders-main-layout">
                <div className={`orders-table-wrapper ${showInsights ? 'with-insights' : ''}`}>
                    <div className="orders-filter-bar">
                        <div className="orders-search-wrapper">
                            <SearchIcon size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search ledger by Transaction ID, Customer, or Reference..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="orders-filter-actions">
                            <div className="filter-select-wrapper">
                                <Filter size={16} className="filter-icon" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="All Status">All Ledger Entries</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="PENDING">Pending Settlement</option>
                                    <option value="CANCELLED">Failed/Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="orders-table-card">
                        <div className="orders-table-container">
                            <table className="orders-mgmt-table">
                                <thead>
                                    <tr>
                                        <th>REF ID / ITEMS</th>
                                        <th>CUSTOMER</th>
                                        <th>DATE</th>
                                        <th>TOTAL AMOUNT</th>
                                        <th>METHOD</th>
                                        <th>STATUS</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="table-loading">Syncing ledger...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="7" className="table-error">Ledger sync failed.</td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr><td colSpan="7" className="table-empty">No entries found.</td></tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <div className="order-detail-cell">
                                                        <span className="txn-id">{order.transactionId || 'N/A'}</span>
                                                        <span className="item-count">{order.orderItems?.length || 0} ITEMS</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="pmnt-cust-cell">
                                                        <span className="cust-name">{order.customer?.firstName} {order.customer?.lastName}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="order-date">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="order-amount">{fmtPrice(order.finalAmount)}</span>
                                                </td>
                                                <td>
                                                    <div className="pmnt-method-cell">
                                                        {getCardLogo(order.cardType) ? (
                                                            <img 
                                                                src={getCardLogo(order.cardType)} 
                                                                alt="" 
                                                                className={`brand-logo-img ${(order.cardType || 'visa').toLowerCase()}`} 
                                                            />
                                                        ) : (
                                                            <CreditCard size={18} className="method-icon-status" />
                                                        )}
                                                        <span className="pmnt-digits">•••• {order.cardLastFour || '4242'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="status-badge-modern completed">COMPLETED</span>
                                                </td>
                                                <td>
                                                    <button className="table-action-btn" onClick={() => setSelectedOrder(order)}>
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Real-time Insights Side Panel */}
                {showInsights && (
                    <aside className="orders-insights-panel">
                        <div className="insights-header">
                            <div className="title-group">
                                <Activity size={18} className="icon-pulse" />
                                <h3>Real-time Velocity</h3>
                            </div>
                            <button className="close-btn" onClick={() => setShowInsights(false)}><X size={18} /></button>
                        </div>

                        <div className="insights-scroll-area">
                            <div className="insight-card">
                                <h4>Sales Velocity (Hourly)</h4>
                                <div className="chart-wrapper-sm">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <AreaChart data={insightsDataMemo.hourly}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#111" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#111" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="revenue" stroke="#111" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="insight-desc">Peak transaction volume detected between 14:00 - 18:00.</p>
                            </div>

                            <div className="insight-card">
                                <h4>Method Distribution</h4>
                                <div className="chart-wrapper-sm">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie
                                                data={insightsDataMemo.methods}
                                                innerRadius={40}
                                                outerRadius={55}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {insightsDataMemo.methods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="method-legend">
                                    {insightsDataMemo.methods.map((m, i) => (
                                        <div key={i} className="legend-item">
                                            <span className="dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                                            <span className="name">{m.name}</span>
                                            <span className="val">{m.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="insight-card dark">
                                <div className="card-head">
                                    <Zap size={16} />
                                    <span>AI RECOMMENDATION</span>
                                </div>
                                <p className="ai-text">
                                    AOV is currently <strong>12% higher</strong> than last week. Consider increasing stock for high-value outerwears.
                                </p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* View Order Modal */}
            {selectedOrder && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-left">
                                <div className="txn-chip">
                                    <Tag size={12} />
                                    <span>{selectedOrder.transactionId}</span>
                                </div>
                                <h3 className="modal-title">Transaction Ledger Details</h3>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-info-grid">
                                <div className="info-section">
                                    <div className="section-label"><User size={14} /> CUSTOMER INFORMATION</div>
                                    <div className="info-card">
                                        <div className="avatar-circle">{selectedOrder.customer?.firstName?.[0]}</div>
                                        <div className="details">
                                            <p className="main-text">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                                            <p className="sub-text">{selectedOrder.customer?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-section">
                                    <div className="section-label"><Clock size={14} /> TRANSACTION METADATA</div>
                                    <div className="metadata-grid">
                                        <div className="meta-item">
                                            <span>Date</span>
                                            <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="meta-item">
                                            <span>Method</span>
                                            <div className="modal-pmnt-row">
                                                {getCardLogo(selectedOrder.cardType) ? (
                                                    <img src={getCardLogo(selectedOrder.cardType)} alt="" className="brand-logo-img" />
                                                ) : (
                                                    <CreditCard size={18} />
                                                )}
                                                <p>•••• {selectedOrder.cardLastFour}</p>
                                            </div>
                                        </div>
                                        <div className="meta-item">
                                            <span>Status</span>
                                            <p className="status-completed">✓ VERIFIED</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="items-ledger-section">
                                <div className="section-label"><Package size={14} /> PRODUCT LINE ITEMS</div>
                                <div className="items-list-container">
                                    {selectedOrder.orderItems?.map((item, idx) => (
                                        <div key={idx} className="ledger-item-row">
                                            <div className="item-img">
                                                {item.product?.mainImagePath ? (
                                                    <img src={item.product.mainImagePath} alt="" />
                                                ) : (
                                                    <div className="no-img">NA</div>
                                                )}
                                            </div>
                                            <div className="item-info">
                                                <p className="item-name">{item.product?.productName}</p>
                                                <p className="item-meta">SIZE: {item.size} | QTY: {item.quantity}</p>
                                                <p className="item-seller">SUPPLIER: {item.product?.seller?.storeName}</p>
                                            </div>
                                            <div className="item-price">
                                                <p>{fmtPrice(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-summary-box">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{fmtPrice(selectedOrder.totalAmount)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Discount Applied</span>
                                    <span className="discount-text">-{fmtPrice(selectedOrder.discountAmount)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount (LKR)</span>
                                    <span>{fmtPrice(selectedOrder.finalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="vault-btn-secondary" onClick={() => setSelectedOrder(null)}>Close Entry</button>
                            <button className="vault-btn-primary">
                                <Download size={18} />
                                Export Invoice
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );

    if (!showSidebar) return renderContent();

    return (
        <div className="admin-orders-dashboard">
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.6} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            <AdminSidebar activeNav={activeNav} setActiveNav={handleNavClick} handleLogout={handleLogout} />
            <main className="admin-orders-main">
                {renderContent()}
            </main>
        </div>
    );
}
