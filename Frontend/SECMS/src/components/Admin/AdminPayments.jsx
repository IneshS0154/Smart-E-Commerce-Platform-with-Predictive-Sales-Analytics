import { useState, useEffect } from 'react';
import orderAPI from '../../api/orderAPI';
import AdminSidebar from './AdminSidebar';
import { 
    Search as SearchIcon, 
    Download, 
    Filter, 
    MoreHorizontal, 
    CreditCard, 
    ArrowUpRight, 
    ShieldCheck, 
    RefreshCcw 
} from 'lucide-react';
import './AdminPayments.css';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

export default function AdminPayments({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Payments");
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderAPI.getAllOrders();
            setAllOrders(data || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
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

    const filtered = allOrders.filter(o => {
        const matchesSearch = !search || 
            (o?.transactionId || '').toLowerCase().includes(search.toLowerCase()) ||
            (`${o?.customer?.firstName} ${o?.customer?.lastName}`).toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || true; // All are completed for now
        return matchesSearch && matchesStatus;
    });

    // Calculate Summary Stats
    const totalVolume = allOrders.reduce((acc, curr) => acc + (curr?.finalAmount || 0), 0);
    const successCount = allOrders.length; // Mocking as successful
    const avgOrder = successCount > 0 ? totalVolume / successCount : 0;

    const renderContent = () => (
        <div className="admin-payments-content">
            <div className="payments-header-row">
                <div>
                    <h2 className="payments-page-title">Payment Management</h2>
                    <p className="payments-page-subtitle">Monitor financial transactions, settlements, and revenue flow</p>
                </div>
                <button className="export-report-btn">
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="payments-stats-grid">
                <div className="pmnt-stat-card">
                    <div className="stat-icon-box green">
                        <ArrowUpRight size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">TOTAL VOLUME</p>
                        <h3 className="stat-value">{fmtPrice(totalVolume)}</h3>
                        <p className="stat-sub">Processed Volume</p>
                    </div>
                </div>
                <div className="pmnt-stat-card">
                    <div className="stat-icon-box blue">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">SUCCESSFUL</p>
                        <h3 className="stat-value">{successCount}</h3>
                        <p className="stat-sub">Transactions</p>
                    </div>
                </div>
                <div className="pmnt-stat-card">
                    <div className="stat-icon-box orange">
                        <CreditCard size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">AVG. TRANSACTION</p>
                        <h3 className="stat-value">{fmtPrice(avgOrder)}</h3>
                        <p className="stat-sub">Per Customer</p>
                    </div>
                </div>
                <div className="pmnt-stat-card">
                    <div className="stat-icon-box gray">
                        <RefreshCcw size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">SETTLEMENTS</p>
                        <h3 className="stat-value">PENDING</h3>
                        <p className="stat-sub">Next Payout: 24h</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="payments-filter-bar">
                <div className="payments-search-wrapper">
                    <SearchIcon size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Transaction ID, Customer, or Reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="payments-filter-actions">
                    <div className="filter-select-wrapper">
                        <Filter size={16} className="filter-icon" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All Status">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="payments-table-card">
                <div className="payments-table-container">
                    <table className="payments-mgmt-table">
                        <thead>
                            <tr>
                                <th>TRANSACTION ID</th>
                                <th>CUSTOMER</th>
                                <th>DATE</th>
                                <th>AMOUNT</th>
                                <th>METHOD</th>
                                <th>STATUS</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="table-loading">Loading transactions...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="table-empty">No transactions found.</td></tr>
                            ) : (
                                filtered.map((order) => (
                                    <tr key={order.id}>
                                        <td className="tx-id-cell">{order.transactionId || 'N/A'}</td>
                                        <td>
                                            <div className="pmnt-cust-cell">
                                                <span className="cust-name">{order.customer?.firstName} {order.customer?.lastName}</span>
                                                <span className="cust-email">{order.customer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="pmnt-date-cell">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
                                        </td>
                                        <td className="pmnt-amount-cell">{fmtPrice(order.finalAmount)}</td>
                                        <td>
                                            <div className="pmnt-method-cell">
                                                <CreditCard size={14} className="method-icon" />
                                                <span>{order.cardType || 'Visa'} •••• {order.cardLastFour || '4242'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="pmnt-status-badge success">SUCCESS</span>
                                        </td>
                                        <td>
                                            <button className="table-action-btn">
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
    );

    if (!showSidebar) return renderContent();

    return (
        <div className="admin-payments-dashboard">
            <AdminSidebar activeNav={activeNav} setActiveNav={handleNavClick} handleLogout={handleLogout} />
            <main className="admin-payments-main">
                {renderContent()}
            </main>
        </div>
    );
}
