import { useState, useEffect } from 'react';
import orderAPI from '../../api/orderAPI';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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
            <div className="supplier-orders">
                <div className="supplier-section-header">
                    <h2>Orders</h2>
                    <p>View orders for your products</p>
                </div>
                <div className="supplier-loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="supplier-orders">
            <div className="supplier-section-header">
                <h2>Orders</h2>
                <p>View orders for your products</p>
            </div>

            {orders.length === 0 ? (
                <div className="supplier-empty">
                    <p>No orders yet for your products.</p>
                </div>
            ) : (
                <div className="supplier-orders-list">
                    {orders.map((item, idx) => (
                        <div key={idx} className="supplier-order-item">
                            <div className="supplier-order-image">
                                {item.product?.mainImagePath ? (
                                    <img src={item.product.mainImagePath} alt={item.product.productName} />
                                ) : (
                                    <div className="no-image">No Img</div>
                                )}
                            </div>
                            <div className="supplier-order-details">
                                <h4>{item.product?.productName}</h4>
                                <p>Size: {item.size} | Quantity: {item.quantity}</p>
                                <p className="customer">
                                    Customer: {item.order?.customer?.firstName} {item.order?.customer?.lastName}
                                </p>
                                <p className="date">
                                    {new Date(item.order?.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="supplier-order-price">
                                {fmtPrice(item.subtotal)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
