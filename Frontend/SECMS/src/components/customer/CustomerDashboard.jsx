import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import customerAPI from '../../api/customerAPI';
import orderAPI from '../../api/orderAPI';
import reviewAPI from '../../api/reviewAPI';
import {
    User, ShoppingBag, Star, LogOut,
    Settings, ChevronRight, Package, MapPin,
    Phone, Mail, Calendar, Edit3, Trash2, X, Menu, Home,
    CheckCircle, AlertCircle
} from 'lucide-react';
import './CustomerDashboard.css';
import DarkVeil from '../ui/DarkVeil';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

const navItems = [
    { id: 'MyInfo', label: 'My Profile', icon: User },
    { id: 'My Orders', label: 'Order History', icon: ShoppingBag },
    { id: 'My Reviews', label: 'My Reviews', icon: Star },
];

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('MyInfo');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState({});

    // Review states
    const [myReviews, setMyReviews] = useState([]);
    const [myReviewsLoading, setMyReviewsLoading] = useState(false);
    const [recentOrderItems, setRecentOrderItems] = useState([]);
    const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);
    const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
    const [showEditReviewModal, setShowEditReviewModal] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const notify = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const toggleOrder = (orderId) => {
        if (!orderId) return;
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const customer = JSON.parse(localStorage.getItem('customer') || '{}');
    const customerUsername = localStorage.getItem('customerUsername') || customer.username || '';

    useEffect(() => {
        fetchProfile();
        fetchOrders();
        fetchMyReviews();
        fetchRecentOrderItems();
    }, []);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const data = await orderAPI.getMyOrders();
            console.log('Customer orders response:', data);
            setOrders(data || []);
            
            // BACKUP ID RECOVERY: If we still don't have a reliable ID, 
            // check the orders. The backend often includes the customer object or ID in order data.
            if (data && data.length > 0 && !profile?.id) {
                const firstOrder = data[0];
                const recoveredId = firstOrder.customerId || firstOrder.customer?.id || firstOrder.customer?._id || firstOrder.userId;
                if (recoveredId) {
                    console.log('Recovered Customer ID from order history:', recoveredId);
                    setProfile(prev => ({ ...prev, id: recoveredId }));
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrdersError(err?.response?.data?.message || err?.message || 'Failed to load orders');
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // RELY ON LOCAL STORAGE: Since the /me endpoint is restricted (403),
            // we use the data already provided by the login process.
            const local = JSON.parse(localStorage.getItem('customer') || '{}');
            
            if (local && (local.email || local.username)) {
                // EXTREMELY IMPORTANT: Normalize ID for updates
                const uId = local.id || local._id || local.userId || local.customerId;
                const normalizedProfile = { ...local, id: uId };

                setProfile(normalizedProfile);
                setEditForm({
                    firstName: normalizedProfile.firstName || normalizedProfile.first_name || '',
                    lastName: normalizedProfile.lastName || normalizedProfile.last_name || '',
                    email: normalizedProfile.email || '',
                    phoneNumber: normalizedProfile.phoneNumber || normalizedProfile.phone_number || normalizedProfile.phone || '',
                    address: normalizedProfile.address || normalizedProfile.location || '',
                });
            }
        } catch (err) {
            console.error('Session resolution error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUsername');
        localStorage.removeItem('rememberCustomerLogin');
        window.location.reload();
    };

    const handleEditProfile = async () => {
        // EXHAUSTIVE ID DISCOVERY
        const uId = profile?.id || profile?._id || profile?.userId || profile?.customerId || localStorage.getItem('customerUsername');
        const token = localStorage.getItem('customerToken');
        
        console.log('--- CRITICAL UPDATE PROBE ---');
        console.log('Resolved ID for update:', uId);
        console.log('Payload:', editForm);

        const tryPattern = async (url, method = 'PUT') => {
            try {
                console.log(`Testing ${method} ${url}...`);
                const res = await fetch(`http://localhost:8080/api${url}`, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
                    },
                    body: JSON.stringify({ ...editForm, id: uId, role: 'CUSTOMER' })
                });
                if (res.ok) return await res.json();
                const err = await res.json().catch(() => ({}));
                console.warn(`Pattern ${url} failed (${res.status}):`, err);
                return null;
            } catch (e) { return null; }
        };

        try {
            let updated = null;
            
            // Primary choice: Use the /me endpoint which is most robust
            updated = await tryPattern('/customers/me');
            
            // Fallbacks
            if (!updated) updated = await tryPattern(`/customers/${uId}/update`);
            if (!updated && uId && !isNaN(uId)) updated = await tryPattern(`/customers/${uId}`);
            
            if (!updated) {
                // Last ditch: try Axios one more time with simple pattern
                const res = await api.put('/customers/me', { ...editForm, role: 'CUSTOMER' });
                updated = res.data;
            }

            if (!updated) throw new Error('No valid update path found');

            console.log('Update success!', updated);
            const final = updated?.customer || updated;
            const normalized = { ...final, id: final.id || final._id || uId };
            
            setProfile(normalized);
            localStorage.setItem('customer', JSON.stringify({ ...JSON.parse(localStorage.getItem('customer') || '{}'), ...normalized }));
            setShowEditProfileModal(false);
            notify('Profile updated successfully!');
        } catch (err) {
            console.error('All profile update attempts were rejected by the server.');
            notify(err?.response?.data?.message || 'Update failed: Backend permission restricted.', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            notify('Passwords do not match.', 'error');
            return;
        }
        
        const uId = profile?.id || profile?._id;
        if (!uId) {
            notify('User ID not found. Please refresh.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('customerToken');
            const payload = {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            };

            let success = false;
            
            // Try /me endpoint first
            try {
                const res = await fetch(`http://localhost:8080/api/customers/me/change-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
                    },
                    body: JSON.stringify(payload)
                });
                if (res.ok) success = true;
            } catch (e) {}

            // Fallback to ID-based
            if (!success) {
                await customerAPI.changePassword(uId, payload);
            }

            setShowChangePasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            notify('Password updated successfully!');
        } catch (err) {
            console.error('Error changing password:', err);
            notify(err?.response?.data?.message || 'Failed to change password. Access restricted.', 'error');
        }
    };

    // Review functions
    const fetchMyReviews = async () => {
        setMyReviewsLoading(true);
        try {
            const data = await reviewAPI.getMyReviews();
            setMyReviews(data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setMyReviewsLoading(false);
        }
    };

    const fetchRecentOrderItems = async () => {
        setRecentOrdersLoading(true);
        try {
            const data = await reviewAPI.getRecentOrdersForReview();
            setRecentOrderItems(data || []);
        } catch (err) {
            console.error('Error fetching recent orders:', err);
        } finally {
            setRecentOrdersLoading(false);
        }
    };

    const handleWriteReview = (orderItem) => {
        setSelectedOrderItem(orderItem);
        setReviewForm({ rating: 5, reviewText: '' });
        setShowWriteReviewModal(true);
    };

    const handleEditReview = (review) => {
        setSelectedReview(review);
        setReviewForm({ rating: review.rating, reviewText: review.reviewText || '' });
        setShowEditReviewModal(true);
    };

    const saveReview = async () => {
        if (!selectedOrderItem && !selectedReview) return;
        setSubmittingReview(true);
        try {
            if (selectedReview) {
                const rId = selectedReview.id || selectedReview._id;
                await reviewAPI.updateReview(rId, {
                    rating: reviewForm.rating,
                    reviewText: reviewForm.reviewText
                });
                notify('Review updated successfully!');
            } else {
                const pId = selectedOrderItem.productId || selectedOrderItem.product?._id || selectedOrderItem.product?.id || selectedOrderItem.productID;
                const oId = selectedOrderItem.orderId || selectedOrderItem.transactionId || selectedOrderItem.id;
                const oiId = selectedOrderItem.id || selectedOrderItem._id || selectedOrderItem.orderItemId;

                if (!pId) throw new Error('Product identification failed.');

                await reviewAPI.createReview({
                    productId: pId,
                    orderId: oId,
                    orderItemId: oiId,
                    order_item_id: oiId, // Some backends use this variation
                    rating: reviewForm.rating,
                    reviewText: reviewForm.reviewText
                });
                notify('Review submitted successfully!');
            }

            setShowWriteReviewModal(false);
            setShowEditReviewModal(false);

            // Small delay to allow DB processing before refresh
            setTimeout(() => {
                fetchMyReviews();
                fetchRecentOrderItems();
            }, 1500);

        } catch (err) {
            console.error('Error handling review:', err);
            const msg = err?.response?.data?.message || err.message || 'Submission failed. Please try again.';
            notify(msg, 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewAPI.deleteReview(reviewId);
            notify('Review deleted.');
            fetchMyReviews();
            fetchRecentOrderItems();
        } catch (err) {
            console.error('Error deleting review:', err);
            notify('Failed to delete review.', 'error');
        }
    };

    const StarRating = ({ rating, onRatingChange, readonly = false }) => {
        return (
            <div className="cd-star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                        className={`cd-star-btn ${star <= rating ? 'active' : ''}`}
                        disabled={readonly}
                        type="button"
                    >
                        <Star size={16} fill={star <= rating ? "#fbbf24" : "transparent"} stroke={star <= rating ? "#fbbf24" : "#d1d5db"} />
                    </button>
                ))}
            </div>
        );
    };

    const displayName = profile
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : customer.firstName || 'Customer';

    const getCardLogo = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('visa')) return "https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg";
        if (t.includes('master')) return "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg";
        return null;
    };

    if (loading) {
        return (
            <div className="cd-loading">
                <div className="cd-spinner-box">
                    <div className="cd-spinner"></div>
                    <p>Authenticating vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cd-dashboard">
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.6} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            {/* ── Sidebar ── */}
            <aside className={`cd-sidebar ${!sidebarOpen ? 'cd-sidebar--collapsed' : ''}`}>
                <div className="cd-sidebar-logo">
                    <button className="cd-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={20} />
                    </button>
                    <span className="cd-brand-name">ANYWEAR</span>
                </div>

                <nav className="cd-nav">
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`cd-nav-item ${activeNav === item.id ? 'active' : ''}`}
                            onClick={() => setActiveNav(item.id)}
                            title={!sidebarOpen ? item.label : ''}
                        >
                            <span className="cd-nav-icon"><item.icon size={20} /></span>
                            <span className="cd-nav-label">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="cd-sidebar-footer">
                    <div className="cd-nav-item" onClick={() => navigate('/')} title={!sidebarOpen ? "Return Home" : ""}>
                        <span className="cd-nav-icon"><Home size={20} /></span>
                        <span className="cd-nav-label">Return Home</span>
                    </div>
                    <div className="cd-nav-item logout" onClick={handleLogout}>
                        <span className="cd-nav-icon"><LogOut size={20} /></span>
                        <span className="cd-nav-label">Sign Out</span>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className={`cd-main ${!sidebarOpen ? 'cd-main--expanded' : ''}`}>
                <header className="cd-header">
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{navItems.find(n => n.id === activeNav)?.label || 'Overview'}</h2>
                        <div className="cd-user-profile">
                            <div className="cd-avatar-sm">
                                {(displayName || 'C')[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{displayName}</span>
                        </div>
                    </div>
                </header>

                {toast.show && (
                    <div className={`cd-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} className="cd-notification-icon" /> : <AlertCircle size={20} className="cd-notification-icon" />}
                        <span>{toast.message}</span>
                    </div>
                )}

                <div className="cd-content cd-tab-content" key={activeNav}>
                    {activeNav === 'MyInfo' && (() => {
                        const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o?.finalAmount) || 0), 0);
                        const totalOrders = orders.length;

                        const now = new Date();
                        const thisMonthOrders = orders.filter(o => {
                            const d = new Date(o.createdAt);
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        });
                        const thisMonthSpend = thisMonthOrders.reduce((sum, o) => sum + (parseFloat(o.finalAmount) || 0), 0);

                        const allItems = orders.flatMap(o => o.orderItems || []);
                        const uniqueProds = new Set(allItems.map(i => i.productId || i.product?._id)).size;
                        const totalQty = allItems.reduce((s, i) => s + (i.quantity || 0), 0);
                        const uniqueSellers = new Set(orders.map(o => o.sellerId).filter(Boolean)).size;

                        const memberSince = (profile?.createdAt || profile?.created_at)
                            ? new Date(profile.createdAt || profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                            : 'Active Partner'; // Graceful fallback if date is missing

                        return (
                            <div className="cd-grid">
                                <div className="cd-col">
                                    <div className="cd-card">
                                        <div className="cd-profile-summary">
                                            <div className="cd-avatar-lg">{(displayName || 'C')[0].toUpperCase()}</div>
                                            <h4>{displayName}</h4>
                                            <span>Member since {memberSince}</span>
                                        </div>

                                        <div className="cd-info-list">
                                            <div className="cd-info-item">
                                                <span className="cd-info-label">Full Name</span>
                                                <span className="cd-info-val">{displayName}</span>
                                            </div>
                                            <div className="cd-info-item">
                                                <span className="cd-info-label">Email Address</span>
                                                <span className="cd-info-val">{profile?.email || 'N/A'}</span>
                                            </div>
                                            <div className="cd-info-item">
                                                <span className="cd-info-label">Phone Number</span>
                                                <span className="cd-info-val">{profile?.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="cd-info-item">
                                                <span className="cd-info-label">Default Address</span>
                                                <span className="cd-info-val" style={{ maxWidth: '200px', textAlign: 'right' }}>{profile?.address || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="cd-actions">
                                            <button onClick={() => setShowEditProfileModal(true)} className="cd-btn cd-btn-outline">
                                                <Edit3 size={16} />
                                                Edit Profile
                                            </button>
                                            <button onClick={() => setShowChangePasswordModal(true)} className="cd-btn cd-btn-outline">
                                                <Settings size={16} />
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="cd-col">
                                    <div className="cd-card" style={{ height: '100%' }}>
                                        <div className="cd-card-header">
                                            <h3>Account Insights</h3>
                                        </div>
                                        <div className="cd-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="cd-stat-box" style={{ padding: '24px', background: '#f9fafb', borderRadius: '20px' }}>
                                                <span className="cd-info-label">Monthly Spend</span>
                                                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{fmtPrice(thisMonthSpend).replace('Rs. ', 'LKR ')}</div>
                                            </div>
                                            <div className="cd-stat-box" style={{ padding: '24px', background: '#f9fafb', borderRadius: '20px' }}>
                                                <span className="cd-info-label">Total Volume</span>
                                                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}>{totalOrders} Orders</div>
                                            </div>
                                        </div>

                                        <div className="cd-insight-group" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div className="cd-insight-card" style={{ padding: '20px', background: '#111', color: '#fff', borderRadius: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <Package size={18} color="#4ade80" />
                                                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Bought Items Summary</span>
                                                </div>
                                                <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>
                                                    You've acquired <strong>{totalQty} items</strong> across <strong>{uniqueProds} unique products</strong> from our collection.
                                                </p>
                                            </div>

                                            <div className="cd-insight-card" style={{ padding: '20px', background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <ShoppingBag size={18} color="#6366f1" />
                                                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#111' }}>Shop Summary</span>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#52525b', margin: 0 }}>
                                                    Your shopping network includes <strong>{uniqueSellers} verified sellers</strong>. You are a valued customer in our ecosystem.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {activeNav === 'My Orders' && (
                        <div className="cd-orders">
                            {ordersLoading ? (
                                <div className="cd-empty">
                                    <p>Retrieving transaction history...</p>
                                </div>
                            ) : ordersError ? (
                                <div className="cd-empty">
                                    <p style={{ color: '#ef4444' }}>{ordersError}</p>
                                </div>
                            ) : !orders || orders.length === 0 ? (
                                <div className="cd-empty">
                                    <ShoppingBag size={48} className="cd-empty-icon" />
                                    <h4>No Orders Found</h4>
                                    <p>You haven't placed any orders yet. Start shopping to build your vault.</p>
                                </div>
                            ) : (
                                <div className="cd-orders-list">
                                    {orders.map(order => {
                                        const orderIdDisplay = order.id ? String(order.id).slice(-8) : (order.transactionId || 'N/A');
                                        const orderDate = order.createdAt
                                            ? new Date(order.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            }) : 'N/A';

                                        const displayStatus = (order.orderStatus === 'PROCESSING') ? 'PAID & PROCESSING' : (order.orderStatus || 'PAID');
                                        const cardLogo = getCardLogo(order.cardType);

                                        return (
                                            <div key={order.id || order.transactionId} className="cd-order-card">
                                                <div className="cd-order-header" onClick={() => order.id && toggleOrder(order.id)} style={{ cursor: 'pointer' }}>
                                                    <div className="cd-order-id">#{orderIdDisplay}</div>
                                                    <div className="cd-order-meta">
                                                        <div className="cd-meta-item">
                                                            <span className="cd-meta-label">Date & Time</span>
                                                            <span className="cd-meta-val">{orderDate}</span>
                                                        </div>
                                                        {order.cardType && (
                                                            <div className="cd-meta-item">
                                                                <span className="cd-meta-label">Method</span>
                                                                <div className="cd-meta-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {cardLogo ? <img src={cardLogo} alt={order.cardType} style={{ height: '14px' }} /> : <span style={{ fontSize: '10px' }}>{order.cardType}</span>}
                                                                    <span>•••• {order.cardLastFour}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="cd-meta-item">
                                                            <span className="cd-meta-label">Total</span>
                                                            <span className="cd-meta-val" style={{ fontWeight: 800 }}>{fmtPrice(order.finalAmount)}</span>
                                                        </div>
                                                        <span className={`cd-status-badge cd-status-${order.orderStatus?.toLowerCase() || 'processing'}`}>
                                                            {displayStatus}
                                                        </span>
                                                        <ChevronRight size={18} style={{ transform: order.id && expandedOrders[order.id] ? 'rotate(90deg)' : 'none', transition: 'all 0.3s' }} />
                                                    </div>
                                                </div>

                                                {expandedOrders[order.id] && (
                                                    <div className="cd-order-body">
                                                        <div className="cd-order-items">
                                                            {order.orderItems?.map((item, idx) => {
                                                                const pName = item.product?.productName || item.productName || 'Unknown Product';
                                                                const pImg = item.product?.mainImagePath || item.productImage;
                                                                const pId = item.productId || item.product?._id || item.product?.id;

                                                                return (
                                                                    <div key={idx} className="cd-item-row" onClick={() => pId && window.open(`/product/${pId}`, '_blank')} style={{ cursor: 'pointer' }}>
                                                                        <div className="cd-item-img">
                                                                            {pImg ? (
                                                                                <img src={pImg} alt={pName} />
                                                                            ) : (
                                                                                <Package size={20} />
                                                                            )}
                                                                        </div>
                                                                        <div className="cd-item-info">
                                                                            <div className="cd-item-name">{pName}</div>
                                                                            <div className="cd-item-meta">Size: {item.size} | Qty: {item.quantity}</div>
                                                                        </div>
                                                                        <div className="cd-item-price" style={{ fontWeight: 700 }}>
                                                                            {fmtPrice(item.price)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="cd-order-footer">
                                                            <div className="cd-summary-stack">
                                                                <div className="cd-summary-row">
                                                                    <span>Subtotal</span>
                                                                    <span>{fmtPrice(order.totalAmount)}</span>
                                                                </div>
                                                                <div className="cd-summary-row" style={{ color: '#dc2626' }}>
                                                                    <span>Discount</span>
                                                                    <span>-{fmtPrice(parseFloat(order.totalAmount || 0) - parseFloat(order.finalAmount || 0))}</span>
                                                                </div>
                                                                <div className="cd-summary-row total">
                                                                    <span>Total Amount</span>
                                                                    <span>{fmtPrice(order.finalAmount)}</span>
                                                                </div>
                                                                {order.cardLastFour && (
                                                                    <div className="cd-summary-row" style={{ marginTop: '12px', fontSize: '11px', opacity: 0.6 }}>
                                                                        <span>Paid via {order.cardType || 'Card'} (*{order.cardLastFour})</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeNav === 'My Reviews' && (
                        <div className="cd-reviews">
                            <div className="cd-card" style={{ marginBottom: '32px' }}>
                                <div className="cd-card-header">
                                    <h3>Awaiting Your Feedback</h3>
                                </div>
                                {recentOrdersLoading ? (
                                    <div className="cd-loading-inline"><p>Loading recent purchases...</p></div>
                                ) : (() => {
                                    const unreviewedItems = recentOrderItems.filter(item => item.canReview && !item.hasReview);
                                    if (unreviewedItems.length === 0) {
                                        return <div className="cd-empty-small"><p>No items pending review. All caught up!</p></div>;
                                    }
                                    return (
                                        <div className="cd-items-stack">
                                            {unreviewedItems.map(item => {
                                                const pName = item.product?.productName || item.productName || 'Unknown Product';
                                                const pImg = item.product?.mainImagePath || item.productImage;
                                                const pId = item.productId || item.product?._id || item.product?.id;
                                                return (
                                                    <div key={item.id} className="cd-item-action-row">
                                                        <div className="cd-item-img" style={{ cursor: 'pointer' }} onClick={() => pId && window.open(`/product/${pId}`, '_blank')}>
                                                            {pImg ? <img src={pImg} alt={pName} /> : <Package size={18} />}
                                                        </div>
                                                        <div className="cd-item-info">
                                                            <div className="cd-item-name">{pName}</div>
                                                            <div className="cd-item-meta">Order: {item.transactionId}</div>
                                                        </div>
                                                        <button onClick={() => handleWriteReview(item)} className="cd-btn cd-btn-outline" style={{ padding: '8px 16px' }}>
                                                            <Edit3 size={14} /> Write Review
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="cd-card">
                                <div className="cd-card-header">
                                    <h3>My Reviews</h3>
                                </div>
                                {myReviewsLoading ? (
                                    <div className="cd-loading-inline"><p>Loading your history...</p></div>
                                ) : myReviews.length === 0 ? (
                                    <div className="cd-empty">
                                        <Star size={48} className="cd-empty-icon" />
                                        <h4>No Reviews Yet</h4>
                                        <p>Share your thoughts on your purchases to help others in the community.</p>
                                    </div>
                                ) : (
                                    <div className="cd-reviews-list">
                                        {myReviews.map(review => {
                                            const pName = review.product?.productName || review.productName || 'Unknown Product';
                                            const pImg = review.product?.mainImagePath || review.productImage;
                                            const pId = review.productId || review.product?._id || review.product?.id;
                                            return (
                                                <div key={review.id} className="cd-review-card">
                                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                                                        <div className="cd-item-img" style={{ width: '64px', height: '64px', cursor: 'pointer' }} onClick={() => pId && window.open(`/product/${pId}`, '_blank')}>
                                                            {pImg ? <img src={pImg} alt={pName} /> : <Package size={20} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{pName}</div>
                                                            <StarRating rating={review.rating} readonly />
                                                        </div>
                                                        <div className="cd-review-actions">
                                                            {review.canEdit && (
                                                                <button onClick={() => handleEditReview(review)} className="cd-btn cd-btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }}>Edit</button>
                                                            )}
                                                            <button onClick={() => deleteReview(review.id)} className="cd-btn cd-btn-outline" style={{ padding: '6px 12px', fontSize: '11px', color: '#ef4444', borderColor: '#fee2e2', marginTop: '5px' }}>Delete</button>
                                                        </div>
                                                    </div>
                                                    {
                                                        review.reviewText && (
                                                            <div style={{
                                                                padding: '16px 20px',
                                                                background: '#f9fafb',
                                                                borderRadius: '12px',
                                                                fontSize: '14px',
                                                                lineHeight: '1.6',
                                                                color: '#444',
                                                                marginBottom: '12px',
                                                                position: 'relative'
                                                            }}>
                                                                <span style={{ position: 'absolute', top: '10px', left: '8px', fontSize: '24px', opacity: 0.1, fontFamily: 'serif' }}>"</span>
                                                                {review.reviewText}
                                                            </div>
                                                        )
                                                    }
                                                    <div style={{ fontSize: '11px', color: '#999', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Calendar size={12} />
                                                        Posted {new Date(review.createdAt).toLocaleDateString('en-GB')}
                                                        {review.updatedAt && review.updatedAt !== review.createdAt && <span style={{ color: '#10b981' }}>• Edited</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main >

            {/* ── MODALS ── */}
            {
                (showEditProfileModal || showChangePasswordModal || showWriteReviewModal || showEditReviewModal) && (
                    <div className="cd-modal-overlay" onClick={() => {
                        setShowEditProfileModal(false);
                        setShowChangePasswordModal(false);
                        setShowWriteReviewModal(false);
                        setShowEditReviewModal(false);
                    }}>
                        <div className="cd-modal" onClick={e => e.stopPropagation()}>

                            {/* Edit Profile */}
                            {showEditProfileModal && (
                                <>
                                    <h2>Edit Profile</h2>
                                    {[
                                        { key: 'firstName', label: 'First Name', type: 'text' },
                                        { key: 'lastName', label: 'Last Name', type: 'text' },
                                        { key: 'email', label: 'Email', type: 'email' },
                                        { key: 'phoneNumber', label: 'Phone Number', type: 'tel' },
                                        { key: 'address', label: 'Address', type: 'text' },
                                    ].map(field => (
                                        <div key={field.key} className="cd-form-group">
                                            <label>{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={editForm[field.key]}
                                                onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                    <div className="cd-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                        <button onClick={() => setShowEditProfileModal(false)} className="cd-btn cd-btn-outline">Cancel</button>
                                        <button onClick={handleEditProfile} className="cd-btn" style={{ background: '#111', color: '#fff' }}>Save Changes</button>
                                    </div>
                                </>
                            )}

                            {/* Change Password */}
                            {showChangePasswordModal && (
                                <>
                                    <h2>Change Password</h2>
                                    {[
                                        { key: 'currentPassword', label: 'Current Password', type: 'password' },
                                        { key: 'newPassword', label: 'New Password', type: 'password' },
                                        { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
                                    ].map(field => (
                                        <div key={field.key} className="cd-form-group">
                                            <label>{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={passwordForm[field.key]}
                                                onChange={e => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                    <div className="cd-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                        <button onClick={() => setShowChangePasswordModal(false)} className="cd-btn cd-btn-outline">Cancel</button>
                                        <button onClick={handleChangePassword} className="cd-btn" style={{ background: '#111', color: '#fff' }}>Update Password</button>
                                    </div>
                                </>
                            )}

                            {/* Write Review */}
                            {showWriteReviewModal && (
                                <>
                                    <h2>Write a Review</h2>
                                    <div className="cd-form-group">
                                        <label>Rating</label>
                                        <StarRating rating={reviewForm.rating} onRatingChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                                    </div>
                                    <div className="cd-form-group">
                                        <label>Your Experience</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Tell us what you liked about this product..."
                                            value={reviewForm.reviewText}
                                            onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                        />
                                    </div>
                                    <div className="cd-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                        <button onClick={() => setShowWriteReviewModal(false)} className="cd-btn cd-btn-outline">Cancel</button>
                                        <button onClick={saveReview} className="cd-btn" disabled={submittingReview} style={{ background: '#111', color: '#fff' }}>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Edit Review */}
                            {showEditReviewModal && (
                                <>
                                    <h2>Edit Review</h2>
                                    <div className="cd-form-group">
                                        <label>Rating</label>
                                        <StarRating rating={reviewForm.rating} onRatingChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                                    </div>
                                    <div className="cd-form-group">
                                        <label>Your Experience</label>
                                        <textarea
                                            rows="4"
                                            value={reviewForm.reviewText}
                                            onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                        />
                                    </div>
                                    <div className="cd-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                        <button onClick={() => setShowEditReviewModal(false)} className="cd-btn cd-btn-outline">Cancel</button>
                                        <button onClick={saveReview} className="cd-btn" disabled={submittingReview} style={{ background: '#111', color: '#fff' }}>
                                            {submittingReview ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )
            }
        </div >
    );
}
