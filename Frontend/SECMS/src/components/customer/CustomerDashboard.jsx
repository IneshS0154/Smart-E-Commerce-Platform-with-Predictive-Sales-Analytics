import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerAPI from '../../api/customerAPI';
import '../Admin/Admindashboard.css';

const navItems = [
    { label: 'Info'},
    { label: 'My Orders'},
];

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);

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
            <aside className="ov-sidebar">
                <div className="ov-brand">
                    <span className="ov-brand-name">ANYWEAR</span>
                </div>
                <nav className="ov-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`ov-nav-item ${activeNav === item.label ? 'ov-nav-item--active' : ''}`}
                            onClick={() => setActiveNav(item.label)}
                        >
                            <span className="ov-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="ov-sidebar-footer">
                    <button className="ov-nav-item" onClick={() => setShowChangePasswordModal(true)}>
                        <span className="ov-nav-icon">🔒</span>
                        <span>Change Password</span>
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
                        {showUserMenu && (
                            <div className="ov-user-dropdown">
                                <button
                                    className="ov-user-dropdown-item"
                                    onClick={() => { setShowEditProfileModal(true); setShowUserMenu(false); }}
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="ov-user-dropdown-item"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="ov-content">
                    {activeNav === 'Info' && (
                        <div>
                            <h2 className="ov-section-title">Welcome back, {displayName}!</h2>
                            
                            {/* Dashboard Stats */}
                            <div className="ov-stats-grid">
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">Account Status</p>
                                    <p className="ov-stat-value" style={{ fontSize: '28px', color: profile?.status === 'ACTIVE' ? 'var(--ov-green)' : 'var(--ov-red)' }}>
                                        {profile?.status || 'N/A'}
                                    </p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">Email</p>
                                    <p className="ov-stat-value" style={{ fontSize: '18px' }}>{profile?.email || 'N/A'}</p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">Phone</p>
                                    <p className="ov-stat-value" style={{ fontSize: '18px' }}>{profile?.phoneNumber || 'Not set'}</p>
                                </div>
                                <div className="ov-stat-card">
                                    <p className="ov-stat-label">Address</p>
                                    <p className="ov-stat-value" style={{ fontSize: '18px' }}>{profile?.address || 'Not set'}</p>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="ov-table-card" style={{ marginTop: '32px' }}>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                        <div className="ov-user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                                            {(displayName || 'C')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{displayName}</h3>
                                            <p style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', marginBottom: '6px' }}>Customer</p>
                                            <span className={`ov-status-badge ${profile?.status === 'ACTIVE' ? 'ov-status--completed' : 'ov-status--failed'}`}>
                                                {profile?.status || 'N/A'}
                                            </span>
                                        </div>
                                        <button
                                            style={{
                                                marginLeft: 'auto', padding: '10px 20px',
                                                background: 'var(--ov-accent)', color: '#fff',
                                                border: 'none', borderRadius: 'var(--ov-radius-sm)',
                                                fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowEditProfileModal(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                                        {[
                                            { label: 'First Name', value: profile?.firstName || 'N/A' },
                                            { label: 'Last Name', value: profile?.lastName || 'N/A' },
                                            { label: 'Username', value: profile?.username || 'N/A' },
                                            { label: 'Email', value: profile?.email || 'N/A' },
                                            { label: 'Phone Number', value: profile?.phoneNumber || 'Not set' },
                                            { label: 'Address', value: profile?.address || 'Not set' },
                                            {
                                                label: 'Member Since',
                                                value: profile?.createdAt
                                                    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                                                    : 'N/A'
                                            },
                                        ].map(row => (
                                            <div key={row.label} style={{
                                                padding: '14px 0',
                                                borderTop: '1px solid var(--ov-border)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <span style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', fontWeight: 500 }}>{row.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 600 }}>{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeNav === 'My Orders' && (
                        <div>
                            <h2 className="ov-section-title">My Orders</h2>
                            <div className="ov-table-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--ov-text-secondary)', fontSize: '14px' }}>No orders yet. Start shopping to see your orders here.</p>
                            </div>
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
                        <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h2>
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
                                        fontSize: '14px', fontFamily: 'DM Sans', background: 'var(--ov-bg)',
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
                                    fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditProfile}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-accent)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
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
                        <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Change Password</h2>
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
                                        fontSize: '14px', fontFamily: 'DM Sans', background: 'var(--ov-bg)',
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
                                    fontFamily: 'DM Sans', fontWeight: 500, cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                style={{
                                    padding: '10px 20px', background: 'var(--ov-accent)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--ov-radius-sm)',
                                    fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
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
