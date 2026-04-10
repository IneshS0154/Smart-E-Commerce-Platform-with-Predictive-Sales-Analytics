import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import orderAPI, { couponAPI } from '../api/orderAPI';
import './CheckoutPage.css';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

const VisaLogo = () => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#FFFFFF" stroke="#E5E7EB"/>
        <text x="18" y="16" fill="#1434CB" fontSize="11" fontWeight="800" fontStyle="italic" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-0.5" textAnchor="middle">VISA</text>
    </svg>
);

const MastercardLogo = () => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#FFFFFF" stroke="#E5E7EB"/>
        <circle cx="13" cy="12" r="7" fill="#EA001B" />
        <circle cx="23" cy="12" r="7" fill="#FFA200" fillOpacity="0.8" />
    </svg>
);

const AmexLogo = () => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#007bc1"/>
        <text x="18" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle">AMEX</text>
    </svg>
);

const GenericCardIcon = () => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="24" rx="4" fill="#F3F4F6" stroke="#D1D5DB"/>
        <rect x="0" y="5" width="36" height="4" fill="#9CA3AF"/>
        <rect x="5" y="14" width="10" height="3" rx="1" fill="#D1D5DB"/>
    </svg>
);

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, fetchCart, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponData, setCouponData] = useState(null); // { discountPercentage, minimumOrderAmount }

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardType: 'VISA',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [shippingAddress, setShippingAddress] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

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
    
    const eligibleSubtotal = couponData && couponData.sellerId 
        ? cartItems.filter(item => item.product?.seller?.id === couponData.sellerId).reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
        : (couponData ? subtotal : 0);

    const discountPct = couponApplied && couponData ? parseFloat(couponData.discountPercentage) : 0;
    const discount = eligibleSubtotal * discountPct / 100;
    const total = subtotal - discount;

    const validateCardDetails = () => {
        const errors = {};

        const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        if (!cardNumber) {
            errors.cardNumber = 'Card number is required';
        } else if (cardNumber.length < 13 || cardNumber.length > 19) {
            errors.cardNumber = 'Invalid card number length';
        } else if (!/^\d+$/.test(cardNumber)) {
            errors.cardNumber = 'Card number must contain only digits';
        }

        if (!cardDetails.expiryDate) {
            errors.expiryDate = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
            errors.expiryDate = 'Invalid format (MM/YY)';
        } else {
            const [month, year] = cardDetails.expiryDate.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            if (expiry < new Date()) {
                errors.expiryDate = 'Card has expired';
            }
        }

        if (!cardDetails.cvv) {
            errors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
            errors.cvv = 'CVV must be 3 or 4 digits';
        }

        if (!cardDetails.cardHolderName.trim()) {
            errors.cardHolderName = 'Cardholder name is required';
        }

        if (!shippingAddress.trim()) {
            errors.shippingAddress = 'Shipping address is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        try {
            const data = await couponAPI.validate(couponCode.trim());
            
            const tempEligible = data.sellerId 
                ? cartItems.filter(item => item.product?.seller?.id === data.sellerId).reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
                : subtotal;

            if (tempEligible === 0) {
                setCouponError('No eligible items in cart for this coupon.');
                setCouponApplied(false);
                setCouponData(null);
                return;
            }

            // Check minimum order amount
            if (tempEligible < parseFloat(data.minimumOrderAmount)) {
                setCouponError(`Minimum eligible order of Rs. ${parseFloat(data.minimumOrderAmount).toLocaleString('en-IN')} required for this coupon.`);
                setCouponApplied(false);
                setCouponData(null);
                return;
            }

            setCouponData(data);
            setCouponApplied(true);
            setCouponError('');
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid or expired coupon code');
            setCouponApplied(false);
            setCouponData(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateCardDetails()) {
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');

            const order = await orderAPI.checkout({
                cardNumber: cardNumber,
                cardType: cardDetails.cardType,
                expiryDate: cardDetails.expiryDate,
                cvv: cardDetails.cvv,
                couponCode: couponApplied ? couponCode : '',
                shippingAddress: shippingAddress
            });

            await clearCart();
            navigate('/order-success', { state: { order } });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const detectCardType = (number) => {
        const str = number.replace(/\s+/g, '');
        if (/^4/.test(str)) return 'VISA';
        if (/^5[1-5]/.test(str) || /^2[2-7]/.test(str)) return 'MASTERCARD';
        if (/^3[47]/.test(str)) return 'AMEX';
        return ''; // Default/Unknown
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        const detectedType = detectCardType(formatted);
        setCardDetails({ 
            ...cardDetails, 
            cardNumber: formatted, 
            cardType: detectedType || 'VISA' // Fallback to VISA if unknown for backend payload
        });
    };

    if (isLoading) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div className="checkout-container">
                    <div className="checkout-loading">Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div className="checkout-container">
                    <div className="checkout-empty">
                        <p>Your cart is empty</p>
                        <button onClick={() => navigate('/shop')}>Continue Shopping</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Navbar />
            <div className="checkout-container">
                <h1 className="checkout-title">Checkout</h1>

                <div className="checkout-content">
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            <div className="checkout-section">
                                <h2 className="checkout-section-title">Shipping Address</h2>
                                <div className="checkout-field">
                                    <textarea
                                        placeholder="Enter your shipping address"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        className={validationErrors.shippingAddress ? 'error' : ''}
                                        rows={3}
                                    />
                                    {validationErrors.shippingAddress && (
                                        <span className="checkout-error">{validationErrors.shippingAddress}</span>
                                    )}
                                </div>
                            </div>

                            <div className="checkout-section">
                                <h2 className="checkout-section-title">Payment Details</h2>
                                <p className="checkout-section-subtitle">Card payment only</p>

                                <div className="checkout-field">
                                    <label>Cardholder Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name on card"
                                        value={cardDetails.cardHolderName}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
                                        className={validationErrors.cardHolderName ? 'error' : ''}
                                    />
                                    {validationErrors.cardHolderName && (
                                        <span className="checkout-error">{validationErrors.cardHolderName}</span>
                                    )}
                                </div>

                                <div className="checkout-field">
                                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Card Number
                                        <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                                            {detectCardType(cardDetails.cardNumber) === 'VISA' && <VisaLogo />}
                                            {detectCardType(cardDetails.cardNumber) === 'MASTERCARD' && <MastercardLogo />}
                                            {detectCardType(cardDetails.cardNumber) === 'AMEX' && <AmexLogo />}
                                            {!detectCardType(cardDetails.cardNumber) && <GenericCardIcon />}
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardDetails.cardNumber}
                                        onChange={handleCardNumberChange}
                                        maxLength={19}
                                        className={validationErrors.cardNumber ? 'error' : ''}
                                    />
                                    {validationErrors.cardNumber && (
                                        <span className="checkout-error">{validationErrors.cardNumber}</span>
                                    )}
                                </div>

                                <div className="checkout-field-row">
                                    <div className="checkout-field">
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiryDate}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 2) {
                                                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                }
                                                setCardDetails({ ...cardDetails, expiryDate: value });
                                            }}
                                            maxLength={5}
                                            className={validationErrors.expiryDate ? 'error' : ''}
                                        />
                                        {validationErrors.expiryDate && (
                                            <span className="checkout-error">{validationErrors.expiryDate}</span>
                                        )}
                                    </div>

                                    <div className="checkout-field">
                                        <label>CVV</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={cardDetails.cvv}
                                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                                            maxLength={4}
                                            className={validationErrors.cvv ? 'error' : ''}
                                        />
                                        {validationErrors.cvv && (
                                            <span className="checkout-error">{validationErrors.cvv}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-section">
                                <h2 className="checkout-section-title">Discount Coupon</h2>
                                <div className="checkout-coupon-row">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={couponApplied}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponApplied || !couponCode.trim()}
                                        className={couponApplied ? 'applied' : ''}
                                    >
                                        {couponApplied ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <span className="checkout-error">{couponError}</span>}
                                {couponApplied && couponData && (
                                    <span className="checkout-success">
                                        ✔ {parseFloat(couponData.discountPercentage).toFixed(1)}% discount applied! You save {fmtPrice(discount)}.
                                    </span>
                                )}
                            </div>

                            {error && <div className="checkout-global-error">{error}</div>}

                            <button
                                type="submit"
                                className="checkout-submit-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Pay ${fmtPrice(total)}`}
                            </button>
                        </form>
                    </div>

                    <div className="checkout-summary-section">
                        <div className="checkout-summary-card">
                            <h2 className="checkout-summary-title">Order Summary</h2>

                            <div className="checkout-items">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="checkout-item">
                                        <div className="checkout-item-image">
                                            {item.product?.mainImagePath ? (
                                                <img src={item.product.mainImagePath} alt={item.product.productName} />
                                            ) : (
                                                <div className="checkout-item-no-img">No Img</div>
                                            )}
                                            {/* <span className="checkout-item-qty">{item.quantity}</span> */}
                                        </div>
                                        <div className="checkout-item-details">
                                            <h2>{item.product?.productName}</h2>
                                            <h3>Buying: {item.quantity}</h3>
                                            <p>Size: {item.size}</p>
                                            <p className="checkout-item-price">{fmtPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-row">
                                <span>Subtotal</span>
                                <span>{fmtPrice(subtotal)}</span>
                            </div>

                            {couponApplied && couponData && (
                                <div className="checkout-summary-row discount">
                                    <span>Discount ({parseFloat(couponData.discountPercentage).toFixed(1)}%)</span>
                                    <span>-{fmtPrice(discount)}</span>
                                </div>
                            )}

                            <div className="checkout-summary-row">
                                <span>Shipping</span>
                                <span className="free">Free</span>
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-total">
                                <span>Total</span>
                                <span>{fmtPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
