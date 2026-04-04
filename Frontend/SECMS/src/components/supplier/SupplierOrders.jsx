import { useState, useEffect } from 'react';
import orderAPI from '../../api/orderAPI';
import './SupplierOrders.css';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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

    if (loading) {
        return (
            <div className="so">
                <div className="so-heading">
                    <h2 className="so-heading__title">Orders</h2>
                    <p className="so-heading__sub">View orders for your products</p>
                </div>
                <div className="so-empty">Loading your orders...</div>
            </div>
        );
    }

    const groupedOrders = orders.reduce((acc, item) => {
        const txId = item.order?.transactionId || 'Unknown Order';
        if (!acc[txId]) {
            acc[txId] = {
                transactionId: txId,
                customer: item.order?.customer,
                createdAt: item.order?.createdAt,
                items: []
            };
        }
        acc[txId].items.push(item);
        return acc;
    }, {});

    const sortedGroups = Object.values(groupedOrders).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const filteredGroups = sortedGroups.filter(group => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        if (group.transactionId.toLowerCase().includes(q)) return true;
        const customerName = `${group.customer?.firstName || ''} ${group.customer?.lastName || ''}`.toLowerCase();
        if (customerName.includes(q)) return true;
        return group.items.some(item => (item.product?.productName || '').toLowerCase().includes(q));
    });

    return (
        <div className="so">
            <div className="so-heading">
                <h2 className="so-heading__title">Orders</h2>
                <p className="so-heading__sub">View orders for your products</p>
            </div>

            {orders.length > 0 && (
                <div className="so-search-bar">
                    <span className="so-search-bar__icon">⌕</span>
                    <input
                        type="text"
                        className="so-search-bar__input"
                        placeholder="Search by Order ID, Customer, or Product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="so-search-bar__clear" onClick={() => setSearch('')}>✕</button>
                    )}
                    {search && (
                        <span className="so-search-bar__result">
                            {filteredGroups.length} result{filteredGroups.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {filteredGroups.length === 0 ? (
                <div className="so-empty">
                    {search ? `No orders found for "${search}".` : "No orders yet for your products."}
                </div>
            ) : (
                <div className="so-list">
                    {filteredGroups.map((group, idx) => (
                        <div key={idx} className="so-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <div className="so-card__header">
                                <div className="so-card__id-wrap">
                                    <div className="so-card__id">
                                        ORDER <span className="so-card__id-val">{group.transactionId}</span>
                                    </div>
                                    <div className="so-card__customer">
                                        {group.customer?.firstName} {group.customer?.lastName}
                                    </div>
                                </div>
                                <div className="so-card__meta">
                                    <div className="so-card__date">
                                        {new Date(group.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="so-card__body">
                                {group.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="so-item">
                                        <div className="so-item__left">
                                            <div className="so-item__img-wrap">
                                                {item.product?.mainImagePath ? (
                                                    <img src={item.product.mainImagePath} alt={item.product.productName} className="so-item__img" />
                                                ) : (
                                                    <div className="so-item__no-img">NO IMG</div>
                                                )}
                                            </div>
                                            <div className="so-item__details">
                                                <h4 className="so-item__title">{item.product?.productName}</h4>
                                                <div className="so-item__specs">
                                                    <span>SIZE: <strong>{item.size}</strong></span>
                                                    <span>QTY: <strong>{item.quantity}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="so-item__right">
                                            <div className="so-item__price">
                                                {fmtPrice(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
