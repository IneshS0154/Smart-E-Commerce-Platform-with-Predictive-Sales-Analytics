import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerAPI from '../../api/customerAPI';
import orderAPI from '../../api/orderAPI';
import './CustomerDashboard.css';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';

const navItems = [
    { label: 'MyInfo' },
    { label: 'My Orders' },
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
    }, []);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const data = await orderAPI.getMyOrders();
            console.log('Customer orders response:', data);
            setOrders(data || []);
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
            const data = await customerAPI.getCurrentCustomer(customerUsername);
            setProfile(data);
            setEditForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
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
        if (!profile) return;
        try {
            const updated = await customerAPI.updateCustomer(profile.id, editForm);
            setProfile(updated);
            const storedCustomer = JSON.parse(localStorage.getItem('customer') || '{}');
            storedCustomer.firstName = updated.firstName;
            storedCustomer.lastName = updated.lastName;
            storedCustomer.email = updated.email;
            storedCustomer.phoneNumber = updated.phoneNumber;
            storedCustomer.address = updated.address;
            localStorage.setItem('customer', JSON.stringify(storedCustomer));
            setShowEditProfileModal(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            alert(err?.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (!profile) return;
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }
        try {
            await customerAPI.changePassword(profile.id, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowChangePasswordModal(false);
            alert('Password changed successfully!');
        } catch (err) {
            console.error('Error changing password:', err);
            alert(err?.response?.data?.message || 'Failed to change password.');
        }
    };

    const displayName = profile
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : customer.firstName || 'Customer';

    if (loading) {
        return (
            <div className="ov-layout">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh' }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ov-layout">
            <aside className="ov-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="ov-brand">
                    <span className="ov-brand-name">ANYWEAR</span>
                </div>
                <nav className="ov-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`ov-nav-item ${activeNav === item.label ? 'ov-nav-item--active' : ''}`}
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
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: '1px solid var(--ov-border)',
                            borderRadius: '8px',
                            fontFamily: "'Grift', sans-serif",
                            fontSize: '14px',
                            color: 'var(--ov-text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease'
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
                    <h1 className="ov-topbar-title">My Account</h1>
                    <div className="ov-topbar-user" style={{ position: 'relative' }}>
                        <button
                            className="ov-user-menu-button"
                            onClick={() => setShowUserMenu(prev => !prev)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                border: 'none', background: 'transparent', cursor: 'pointer', padding: 0
                            }}
                        >
                            <div className="ov-user-avatar">{(displayName || 'C')[0].toUpperCase()}</div>
                            <div className="ov-user-info">
                                <span className="ov-user-name">{displayName}</span>
                                <span className="ov-user-role">customer</span>
                            </div>
                        </button>
                    </div>
                </header>

                <div className="ov-content">
                    {activeNav === 'MyInfo' && (() => {
                        const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o?.finalAmount) || 0), 0);
                        const totalOrders = orders.length;
                        const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
                        const totalItems = orders.reduce((sum, o) => sum + (o?.orderItems?.length || 0), 0);
                        const memberSince = profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                            : 'N/A';

                        return (
                            <div>
                                {/* Hero Profile Banner */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                    borderRadius: '16px',
                                    padding: '36px 40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '28px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative subtle orb */}
                                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                                    <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.12)',
                                            border: '2px solid rgba(255,255,255,0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '32px', fontWeight: 700, color: '#fff',
                                            fontFamily: 'NORD, sans-serif', flexShrink: 0
                                        }}>
                                            {(displayName || 'C')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', margin: '0 0 8px', fontFamily: 'NORD, sans-serif' }}>CUSTOMER</p>
                                            <h2 style={{ fontSize: '28px', fontFamily: 'NORD, sans-serif', color: '#fff', margin: '0 0 8px', fontWeight: 700, letterSpacing: '0.02em' }}>{displayName}</h2>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>@{profile?.username || 'N/A'}</span>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                                                    background: profile?.status === 'ACTIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                                    color: profile?.status === 'ACTIVE' ? '#4ade80' : '#f87171',
                                                    fontFamily: 'NORD, sans-serif', letterSpacing: '0.06em'
                                                }}>{profile?.status || 'ACTIVE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => setShowChangePasswordModal(true)}
                                            style={{
                                                padding: '11px 22px', background: 'transparent',
                                                color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)',
                                                borderRadius: '8px', fontFamily: 'NORD, sans-serif', fontSize: '12px',
                                                letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                                        >CHANGE PASSWORD</button>
                                        <button
                                            onClick={() => setShowEditProfileModal(true)}
                                            style={{
                                                padding: '11px 22px', background: '#fff', color: '#1a1a1a',
                                                border: 'none', borderRadius: '8px', fontFamily: 'NORD, sans-serif',
                                                fontSize: '12px', letterSpacing: '0.06em', cursor: 'pointer',
                                                fontWeight: 700, transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = 0.88}
                                            onMouseLeave={e => e.currentTarget.style.opacity = 1}
                                        >EDIT PROFILE</button>
                                    </div>
                                </div>

                                {/* Activity Metrics */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '16px',
                                    marginBottom: '28px'
                                }}>
                                    {[
                                        { label: 'TOTAL SPENT', value: fmtPrice(totalSpent), sub: 'All-time purchases' },
                                        { label: 'TOTAL ORDERS', value: totalOrders, sub: 'Completed checkouts' },
                                        { label: 'AVG ORDER VALUE', value: fmtPrice(avgOrder), sub: 'Per transaction' },
                                        { label: 'MEMBER SINCE', value: memberSince, sub: 'Welcome to ANYWEAR' },
                                    ].map(card => (
                                        <div key={card.label} style={{
                                            background: '#fff', borderRadius: '12px',
                                            border: '1px solid var(--ov-border)',
                                            padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px'
                                        }}>
                                            <p style={{ fontSize: '10px', fontFamily: 'NORD, sans-serif', letterSpacing: '0.1em', color: 'var(--ov-text-secondary)', margin: 0 }}>{card.label}</p>
                                            <p style={{ fontSize: '22px', fontFamily: 'NORD, sans-serif', fontWeight: 700, margin: 0, lineHeight: 1.1, color: 'var(--ov-text-primary)' }}>{card.value}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--ov-text-secondary)', margin: 0 }}>{card.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Personal Details Card */}
                                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--ov-border)', overflow: 'hidden' }}>
                                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--ov-border)' }}>
                                        <h3 style={{ fontSize: '13px', fontFamily: 'NORD, sans-serif', letterSpacing: '0.08em', color: 'var(--ov-text-secondary)', margin: 0 }}>PERSONAL DETAILS</h3>
                                    </div>
                                    <div style={{ padding: '0 32px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '64px' }}>
                                        {[
                                            { label: 'First Name', value: profile?.firstName || 'N/A' },
                                            { label: 'Last Name', value: profile?.lastName || 'N/A' },
                                            { label: 'Username', value: profile?.username || 'N/A' },
                                            { label: 'Email Address', value: profile?.email || 'N/A' },
                                            { label: 'Phone Number', value: profile?.phoneNumber || 'Not set' },
                                            { label: 'Delivery Address', value: profile?.address || 'Not set' },
                                        ].map(row => (
                                            <div key={row.label} style={{
                                                padding: '18px 0',
                                                borderBottom: '1px solid var(--ov-border)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <span style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', fontWeight: 500 }}>{row.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 600, maxWidth: '55%', textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {activeNav === 'My Orders' && (
                        <div>
                            <h2 className="ov-section-title">My Orders</h2>
                            {ordersLoading ? (
                                <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--ov-text-secondary)', fontSize: '14px' }}>Loading orders...</p>
                                </div>
                            ) : ordersError ? (
                                <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                    <p style={{ color: '#dc2626', fontSize: '14px' }}>Error: {ordersError}</p>
                                    <button
                                        onClick={fetchOrders}
                                        style={{ marginTop: '16px', padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : !orders || orders.length === 0 ? (
                                <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--ov-text-secondary)', fontSize: '14px' }}>No orders yet. Start shopping to see your orders here.</p>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {Array.isArray(orders) && orders.map((order) => (
                                        <div key={order?.id || Math.random()} className="order-card">
                                            <div
                                                className="order-header"
                                                onClick={() => toggleOrder(order?.id)}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--ov-border)', marginBottom: expandedOrders[order?.id] ? '20px' : '0', cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                                    <div className="order-id">
                                                        <span className="order-label" style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Transaction ID</span>
                                                        <span className="order-value" style={{ fontSize: '15px', fontWeight: 600 }}>{order?.transactionId || 'N/A'}</span>
                                                    </div>
                                                    <div className="order-date">
                                                        <span className="order-label" style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Date</span>
                                                        <span className="order-value" style={{ fontSize: '15px', fontWeight: 500 }}>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className={`order-status ${order?.orderStatus?.toLowerCase() || 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                                                            <span style={{ fontSize: '14px' }}>✓</span> PAID
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span className="order-label" style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Total Amount</span>
                                                    <span className="total-amount" style={{ fontSize: '18px', fontWeight: 700 }}>{fmtPrice(order?.finalAmount)}</span>
                                                </div>
                                            </div>

                                            {expandedOrders[order?.id] && (
                                                <>
                                                    <div className="order-items">
                                                        {Array.isArray(order?.orderItems) && order.orderItems.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="order-item"
                                                                onClick={() => window.open(`/product/${item?.product?.id}`, '_blank')}
                                                                style={{ display: 'flex', gap: '20px', padding: '16px 0', borderBottom: '1px dashed var(--ov-border)', alignItems: 'center', cursor: 'pointer' }}
                                                            >
                                                                <div className="order-item-image" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f4f4f4', flexShrink: 0 }}>
                                                                    {item?.product?.mainImagePath ? (
                                                                        <img src={item.product.mainImagePath} alt={item.product.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <div className="no-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: '#999' }}>No Img</div>
                                                                    )}
                                                                </div>
                                                                <div className="order-item-details" style={{ flexGrow: 1 }}>
                                                                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#666'} onMouseOut={(e) => e.target.style.color = 'var(--ov-text-primary)'}>{item?.product?.productName || 'Unknown Product'}</h4>
                                                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--ov-text-secondary)' }}>Size: <strong style={{ color: 'var(--ov-text-primary)' }}>{item?.size || 'N/A'}</strong> | Qty: <strong style={{ color: 'var(--ov-text-primary)' }}>{item?.quantity || 0}</strong></p>
                                                                    <p className="seller" style={{ margin: 0, fontSize: '12px', color: '#666' }}>Seller: {item?.product?.seller?.storeName || 'Unknown'}</p>
                                                                </div>
                                                                <div className="order-item-price" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ov-text-primary)' }}>
                                                                    {fmtPrice(item?.subtotal)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="order-footer" style={{ marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                                        <div className="order-payment" style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <rect width="24" height="16" rx="2" fill="#1A1A1A" />
                                                                <circle cx="15.5" cy="8" r="4.5" fill="#EB001B" />
                                                                <circle cx="8.5" cy="8" r="4.5" fill="#F79E1B" />
                                                            </svg>
                                                            <span>Paid with {order?.cardType || 'Card'} ending in <strong>{order?.cardLastFour || '****'}</strong></span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {showEditProfileModal && (
                <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--ov-card-bg)', borderRadius: 'var(--ov-radius)',
                        padding: '28px', width: '480px', maxWidth: '90vw', maxHeight: '90vh',
                        overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }}>
                        <h2 style={{ fontFamily: 'Grift, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h2>
                        {[
                            { key: 'firstName', label: 'First Name', type: 'text' },
                            { key: 'lastName', label: 'Last Name', type: 'text' },
                            { key: 'email', label: 'Email', type: 'email' },
                            { key: 'phoneNumber', label: 'Phone Number', type: 'tel' },
                            { key: 'address', label: 'Address', type: 'text' },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ov-text-primary)' }}>
                                    {field.label}
                                </label>
                                <input
                                    style={{
                                        width: '100%', padding: '10px 12px',
                                        border: '1px solid var(--ov-border)', borderRadius: 'var(--ov-radius-sm)',
                                        fontSize: '14px', fontFamily: 'NORD, sans-serif', background: 'var(--ov-bg)',
                                        color: 'var(--ov-text-primary)', boxSizing: 'border-box', outline: 'none'
                                    }}
                                    type={field.type}
                                    value={editForm[field.key]}
                                    onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setShowEditProfileModal(false)}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-bg)', color: 'var(--ov-text-primary)',
                                    border: '1px solid var(--ov-border)', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'NORD, sans-serif', fontWeight: 500, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditProfile}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-accent)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'NORD, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showChangePasswordModal && (
                <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--ov-card-bg)', borderRadius: 'var(--ov-radius)',
                        padding: '28px', width: '480px', maxWidth: '90vw', maxHeight: '90vh',
                        overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }}>
                        <h2 style={{ fontFamily: 'Grift, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Change Password</h2>
                        {[
                            { key: 'currentPassword', label: 'Current Password', type: 'password' },
                            { key: 'newPassword', label: 'New Password', type: 'password' },
                            { key: 'confirmPassword', label: 'Confirm New Password', type: 'password' },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--ov-text-primary)' }}>
                                    {field.label}
                                </label>
                                <input
                                    style={{
                                        width: '100%', padding: '10px 12px',
                                        border: '1px solid var(--ov-border)', borderRadius: 'var(--ov-radius-sm)',
                                        fontSize: '14px', fontFamily: 'NORD, sans-serif', background: 'var(--ov-bg)',
                                        color: 'var(--ov-text-primary)', boxSizing: 'border-box', outline: 'none'
                                    }}
                                    type={field.type}
                                    value={passwordForm[field.key]}
                                    onChange={e => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setShowChangePasswordModal(false)}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-bg)', color: 'var(--ov-text-primary)',
                                    border: '1px solid var(--ov-border)', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'NORD, sans-serif', fontWeight: 500, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-accent)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'NORD, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
