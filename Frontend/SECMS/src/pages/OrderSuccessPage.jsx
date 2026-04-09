import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './OrderSuccessPage.css';
import orderConfirm from '../assets/icons/done-order.svg';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

export default function OrderSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="order-success-page">
                <Navbar />
                <div className="order-success-container">
                    <p>No order information available.</p>
                    <button onClick={() => navigate('/shop')}>Continue Shopping</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="order-success-page">
            <Navbar />
            <div className="order-success-container">
                <div className="order-success-card">
                    <img src={orderConfirm} alt="Cart" className="order-success-icon" width="30" height="30" />
                    <h1 className="order-success-title">Order Placed Successfully!</h1>
                    <p className="order-success-message">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>

                    <div className="order-success-details">
                        <div className="order-success-row">
                            <span>Transaction ID</span>
                            <span className="order-success-value">{order.transactionId}</span>
                        </div>
                        <div className="order-success-row">
                            <span>Order Status</span>
                            <span className="order-success-status">{order.orderStatus}</span>
                        </div>
                        <div className="order-success-row">
                            <span>Payment Status</span>
                            <span className="order-success-status success">{order.paymentStatus}</span>
                        </div>
                        <div className="order-success-row">
                            <span>Total Amount</span>
                            <span className="order-success-value">{fmtPrice(order.finalAmount)}</span>
                        </div>
                        {order.cardType && (
                            <div className="order-success-row">
                                <span>Card</span>
                                <span className="order-success-value">{order.cardType} **** {order.cardLastFour}</span>
                            </div>
                        )}
                    </div>

                    <div className="order-success-actions">
                        <button
                            className="order-success-btn primary"
                            onClick={() => navigate('/customer-dashboard')}
                        >
                            View My Orders
                        </button>
                        <button
                            className="order-success-btn secondary"
                            onClick={() => navigate('/shop')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
