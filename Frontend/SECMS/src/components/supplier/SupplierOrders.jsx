import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Download, MoreHorizontal, 
  Package, CheckCircle, DollarSign,
  ShoppingCart, Box, ChevronDown, ChevronUp
} from 'lucide-react';
import orderAPI from '../../api/orderAPI';
import './SupplierOrders.css';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const seller = JSON.parse(localStorage.getItem('seller') || '{}');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderAPI.getSellerOrders(seller.id);
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (txId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(txId)) {
            newExpanded.delete(txId);
        } else {
            newExpanded.add(txId);
        }
        setExpandedOrders(newExpanded);
    };

    const groupedOrders = useMemo(() => {
        const groups = orders.reduce((acc, item) => {
            const txId = item.order?.transactionId || `ORD-${item.orderId}`;
            if (!acc[txId]) {
                acc[txId] = {
                    transactionId: txId,
                    customer: item.order?.customer,
                    createdAt: item.order?.createdAt,
                    status: item.status || 'Completed',
                    items: [],
                    total: 0
                };
            }
            acc[txId].items.push(item);
            acc[txId].total += parseFloat(item.subtotal || 0);
            return acc;
        }, {});

        return Object.values(groups).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders]);

    const stats = useMemo(() => {
        const totalOrders = groupedOrders.length;
        const totalItems = orders.length;
        const completed = groupedOrders.filter(o => o.status === 'Completed').length;
        const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0);
        return { totalOrders, totalItems, completed, revenue };
    }, [orders, groupedOrders]);

    const filteredGroups = useMemo(() => {
        return groupedOrders.filter(g => {
            const customerName = `${g.customer?.firstName} ${g.customer?.lastName}`.toLowerCase();
            const matchesSearch = (g.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 customerName.includes(searchQuery.toLowerCase()) ||
                                 g.items.some(i => i.product?.productName?.toLowerCase().includes(searchQuery.toLowerCase())));
            const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [groupedOrders, searchQuery, statusFilter]);

    const handleExport = () => {
        const headers = ["Transaction ID", "Customer", "Date", "Items Count", "Status", "Total"];
        const rows = filteredGroups.map(g => [
            g.transactionId,
            `${g.customer?.firstName} ${g.customer?.lastName}`,
            new Date(g.createdAt).toLocaleDateString(),
            g.items.length,
            g.status,
            g.total
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "orders_summary_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="so-loading">
                <div className="so-loader" />
                <p>Syncing orders...</p>
            </div>
        );
    }

    return (
        <div className="so-container">
            <header className="so-header">
                <div>
                    <h1 className="so-title">Order Management</h1>
                    <p className="so-subtitle">Track and fulfill your incoming customer orders</p>
                </div>
                <div className="so-header-actions">
                    <button className="so-btn so-btn--primary" onClick={handleExport}>
                        <Download size={16} /> Export Summary
                    </button>
                </div>
            </header>

            {/* ── KPI Grid ── */}
            <div className="so-stats-grid">
                <div className="so-stat-card">
                    <div className="so-stat-header">
                        <div className="so-stat-icon so-stat-icon--black">
                            <ShoppingCart size={20} />
                        </div>
                        <span className="so-stat-label">Total Orders</span>
                    </div>
                    <div className="so-stat-body">
                        <div className="so-stat-value">{stats.totalOrders}</div>
                        <div className="so-stat-trend">Transactions</div>
                    </div>
                </div>

                <div className="so-stat-card">
                    <div className="so-stat-header">
                        <div className="so-stat-icon so-stat-icon--purple">
                            <Box size={20} />
                        </div>
                        <span className="so-stat-label">Total Items</span>
                    </div>
                    <div className="so-stat-body">
                        <div className="so-stat-value">{stats.totalItems}</div>
                        <div className="so-stat-trend">Product Units</div>
                    </div>
                </div>

                <div className="so-stat-card">
                    <div className="so-stat-header">
                        <div className="so-stat-icon so-stat-icon--green">
                            <CheckCircle size={20} />
                        </div>
                        <span className="so-stat-label">Completed</span>
                    </div>
                    <div className="so-stat-body">
                        <div className="so-stat-value">{stats.completed}</div>
                        <div className="so-stat-trend">Successfully Delivered</div>
                    </div>
                </div>

                <div className="so-stat-card">
                    <div className="so-stat-header">
                        <div className="so-stat-icon so-stat-icon--blue">
                            <DollarSign size={20} />
                        </div>
                        <span className="so-stat-label">Revenue</span>
                    </div>
                    <div className="so-stat-body">
                        <div className="so-stat-value">{fmtPrice(stats.revenue)}</div>
                        <div className="so-stat-trend">Total Earnings</div>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="so-filter-bar">
                <div className="so-search-wrapper">
                    <Search size={18} className="so-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Transaction ID, Product, or Customer..." 
                        className="so-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="so-filters">
                    <div className="so-select-group">
                        <Filter size={14} className="so-filter-label-icon" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="so-select"
                        >
                            <option value="All">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Orders Table ── */}
            <div className="so-table-card">
                <table className="so-table">
                    <thead>
                        <tr>
                            <th>Order Details</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.map((group) => {
                            const isExpanded = expandedOrders.has(group.transactionId);
                            return (
                                <React.Fragment key={group.transactionId}>
                                    <tr className={`so-group-header ${isExpanded ? 'so-group-header--active' : ''}`}>
                                        <td>
                                            <div className="so-order-id-cell">
                                                <span className="so-mono">{group.transactionId}</span>
                                                <span className="so-item-count">{group.items.length} {group.items.length === 1 ? 'item' : 'items'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="so-customer-cell">
                                                <span className="so-cust-name">{group.customer?.firstName} {group.customer?.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="so-date-cell">
                                            {new Date(group.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="so-price-cell">{fmtPrice(group.total)}</td>
                                        <td>
                                            <span className={`so-status-badge so-status--${group.status.toLowerCase()}`}>
                                                {group.status}
                                            </span>
                                        </td>
                                        <td className="so-action-cell">
                                            <button 
                                                className={`so-icon-btn ${isExpanded ? 'so-icon-btn--active' : ''}`}
                                                onClick={() => toggleOrder(group.transactionId)}
                                                title={isExpanded ? "Collapse Items" : "Expand Items"}
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <MoreHorizontal size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && group.items.map((item, idx) => (
                                        <tr key={`${group.transactionId}-${idx}`} className="so-item-row">
                                            <td colSpan="6">
                                                <div className="so-prod-cell">
                                                    <div className="so-prod-img-wrap">
                                                        {item.product?.mainImagePath ? (
                                                            <img src={item.product.mainImagePath} alt="" />
                                                        ) : (
                                                            <div className="so-no-img">N/A</div>
                                                        )}
                                                    </div>
                                                    <div className="so-prod-info">
                                                        <span className="so-prod-name">{item.product?.productName}</span>
                                                        <span className="so-prod-spec">Size: {item.size} • Qty: {item.quantity} • {fmtPrice(item.subtotal)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                        {filteredGroups.length === 0 && (
                            <tr>
                                <td colSpan="6" className="so-empty-row">
                                    <Package size={40} />
                                    <p>No orders found matching your criteria</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}



