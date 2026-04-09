import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import cartAPI from '../api/cartAPI';
import shoppingBagIcon from '../assets/icons/shopping_bag.svg';
import './CartPage.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, fetchCart, updateCartItem, removeCartItem, loading } = useCart();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        if (!token) {
            navigate('/login');
            return;
        }
        const loadCart = async () => {
            await fetchCart();
            setIsLoading(false);
        };
        loadCart();
    }, [fetchCart, navigate]);

    const cartItems = cart?.cartItems || [];
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeCartItem(cartItemId);
        } else {
            await updateCartItem(cartItemId, newQuantity);
        }
    };

    const handleSizeChange = async (cartItemId, newSize) => {
        try {
            await cartAPI.updateCartItemSize(cartItemId, newSize);
            await fetchCart();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update size');
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        await removeCartItem(cartItemId);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (isLoading || loading) {
        return (
            <div className="cart-page">
                <Navbar />
                <div className="cart-container">
                    <div className="cart-loading">Loading cart...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Navbar />
            <div className="cart-container">
                <h1 className="cart-title">Shopping Bag</h1>
                
                {cartItems.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">
                            <img src={shoppingBagIcon} alt="Cart" className="cart-empty-icon" width="30" height="30"/>
                        </div>
                        <p className="cart-empty-text">Your bag is empty</p>
                        <button className="cart-empty-btn" onClick={() => navigate('/shop')}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items-section">
                            <div className="cart-items-header">
                                <span>Product</span>
                                <span>Size</span>
                                <span>Quantity</span>
                                <span>Price</span>
                            </div>
                            
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-product">
                                        <div className="cart-item-image">
                                            {item.product?.mainImagePath ? (
                                                <img 
                                                    src={item.product.mainImagePath} 
                                                    alt={item.product.productName}
                                                />
                                            ) : (
                                                <div className="cart-item-no-image">No Image</div>
                                            )}
                                        </div>
                                        <div className="cart-item-details">
                                            <h3 className="cart-item-name">{item.product?.productName}</h3>
                                            <p className="cart-item-supplier">
                                                {item.product?.seller?.storeName || 'Unknown Supplier'}
                                            </p>
                                            <button 
                                                className="cart-item-remove"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="cart-item-size">
                                        <span className="cart-item-size-label">Size:</span>
                                        <select 
                                            className="cart-size-select"
                                            value={item.size}
                                            onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                        >
                                            {SIZES.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="cart-item-quantity">
                                        <button 
                                            className="cart-qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className="cart-qty-value">{item.quantity}</span>
                                        <button 
                                            className="cart-qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <div className="cart-item-price">
                                        {fmtPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="cart-summary-section">
                            <div className="cart-summary-card">
                                <h2 className="cart-summary-title">Order Summary</h2>
                                
                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <span>{fmtPrice(subtotal)}</span>
                                </div>
                                
                                <div className="cart-summary-row">
                                    <span>Shipping</span>
                                    <span className="cart-shipping">Free</span>
                                </div>
                                
                                <div className="cart-summary-divider"></div>
                                
                                <div className="cart-summary-row cart-summary-total">
                                    <span>Total</span>
                                    <span>{fmtPrice(subtotal)}</span>
                                </div>
                                
                                <button 
                                    className="cart-checkout-btn"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </button>
                                
                                <button 
                                    className="cart-continue-btn"
                                    onClick={() => navigate('/shop')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
