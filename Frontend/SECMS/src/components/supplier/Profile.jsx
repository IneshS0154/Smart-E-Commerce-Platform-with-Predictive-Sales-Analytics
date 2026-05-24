import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css'; // Reusing layout classes
import './Profile.css';

const Icon = {
    Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
    Products: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Stocks: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Orders: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    Coupons: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    Reviews: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Insights: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Brand: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
    Verified: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    Phone: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    MapPin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Key: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
};

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [seller, setSeller] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const activeNav = location.pathname.includes('dashboard') ? 'Dashboard' : 'Profile';

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            const data = JSON.parse(storedSeller);
            setSeller(data);
            setFormData(data);
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/signin');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${seller.id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedSeller = await response.json();
                setSeller(updatedSeller);
                localStorage.setItem('seller', JSON.stringify(updatedSeller));
                setIsEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            alert('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords don't match or are empty!");
            return;
        }
        setIsPasswordSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/sellers/${seller.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: passwordData.newPassword })
            });

            if (response.ok) {
                alert('Password updated successfully');
                setIsPasswordEditing(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
            } else {
                alert('Failed to update password');
            }
        } catch (err) {
            alert('Error updating password');
        } finally {
            setIsPasswordSaving(false);
        }
    };

    if (!seller) return null;

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'A';
    const joinedYear = new Date().getFullYear();

    return (
        <div className="ds-layout">
            <aside className="ds-sidebar">
                <div className="ds-sidebar-brand">
                    <Icon.Brand /> ANYWEAR
                </div>
                
                <div className="ds-sidebar-section">MAIN</div>
                <button className={`ds-nav-btn ${activeNav === 'Dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                    <Icon.Dashboard /> Dashboard
                </button>

                <div className="ds-sidebar-section">STORE</div>
                <button className="ds-nav-btn"><Icon.Products /> Products</button>
                <button className="ds-nav-btn"><Icon.Stocks /> Stocks</button>
                <button className="ds-nav-btn"><Icon.Orders /> Orders</button>
                <button className="ds-nav-btn"><Icon.Coupons /> Coupons</button>

                <div className="ds-sidebar-section">ANALYTICS</div>
                <button className="ds-nav-btn"><Icon.Reviews /> Reviews</button>
                <button className="ds-nav-btn"><Icon.Insights /> All Insights</button>

                <div className="ds-sidebar-section">OTHER</div>
                <button className={`ds-nav-btn ${activeNav === 'Profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <Icon.Profile /> Profile
                </button>

                <div className="ds-sidebar-footer">
                    <button className="ds-nav-btn" onClick={handleLogout}>
                        <Icon.Logout /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="ds-main">
                <div className="pf-main-container">
                    
                    {/* Header Card */}
                    <div className="pf-header-card">
                        <div className="pf-header-left">
                            <div className="pf-avatar">{initials}</div>
                            <div className="pf-info">
                                <h1>{seller.storeName} <span className="pf-badge"><Icon.Verified /> VERIFIED STORE</span></h1>
                                <p className="pf-subtitle">@{seller.username || seller.storeName} · Member since {joinedYear}</p>
                            </div>
                        </div>
                        <button className="ds-btn-outline" onClick={() => setIsEditing(true)}>
                            <Icon.Edit /> Edit Profile
                        </button>
                    </div>

                    {/* Metrics */}
                    <div className="pf-metrics-row">
                        <div className="pf-metric-card">
                            <span className="pf-metric-label">PRODUCT CATALOG</span>
                            <span className="pf-metric-val">0</span>
                            <span className="pf-metric-sub">Live Listings</span>
                        </div>
                        <div className="pf-metric-card">
                            <span className="pf-metric-label">ACTIVE CATEGORIES</span>
                            <span className="pf-metric-val">0</span>
                            <span className="pf-metric-sub">Market Segments</span>
                        </div>
                        <div className="pf-metric-card">
                            <span className="pf-metric-label">INVENTORY VOLUME</span>
                            <span className="pf-metric-val">0</span>
                            <span className="pf-metric-sub">Units in Stock</span>
                        </div>
                        <div className="pf-metric-card">
                            <span className="pf-metric-label">AVERAGE PRICE POINT</span>
                            <span className="pf-metric-val">LKR 0.00</span>
                            <span className="pf-metric-sub">Catalog Mean</span>
                        </div>
                        <div className="pf-metric-card dark">
                            <span className="pf-metric-label">TRUST INDEX</span>
                            <span className="pf-metric-val">0%</span>
                            <span className="pf-metric-sub">Health Score</span>
                        </div>
                    </div>

                    {/* Main Body */}
                    <div className="pf-body-grid">
                        
                        {/* Left Col */}
                        <div>
                            <div className="pf-card">
                                <h2 className="pf-card-title">STORE INFORMATION</h2>
                                <div className="pf-info-list">
                                    <div className="pf-info-item">
                                        <div className="pf-info-icon"><Icon.Mail /></div>
                                        <div className="pf-info-content">
                                            <span className="pf-info-label">CONTACT EMAIL</span>
                                            <span className="pf-info-value">{seller.email}</span>
                                        </div>
                                    </div>
                                    <div className="pf-info-item">
                                        <div className="pf-info-icon"><Icon.Phone /></div>
                                        <div className="pf-info-content">
                                            <span className="pf-info-label">PHONE NUMBER</span>
                                            <span className="pf-info-value">{seller.phoneNumber || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div className="pf-info-item">
                                        <div className="pf-info-icon"><Icon.MapPin /></div>
                                        <div className="pf-info-content">
                                            <span className="pf-info-label">STORE ADDRESS</span>
                                            <span className="pf-info-value">{seller.address || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div className="pf-info-item">
                                        <div className="pf-info-icon"><Icon.Shield /></div>
                                        <div className="pf-info-content">
                                            <span className="pf-info-label">ACCOUNT STATUS</span>
                                            <span className="pf-info-value">Fully Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pf-card">
                                <h2 className="pf-card-title">AUDIENCE SPLIT</h2>
                                <div className="pf-progress-item">
                                    <div className="pf-progress-header"><span>Men's Apparel</span> <span>0%</span></div>
                                    <div className="pf-progress-bar-bg"><div className="pf-progress-bar-fill" style={{width: '0%'}}></div></div>
                                </div>
                                <div className="pf-progress-item">
                                    <div className="pf-progress-header"><span>Women's Apparel</span> <span>0%</span></div>
                                    <div className="pf-progress-bar-bg"><div className="pf-progress-bar-fill" style={{width: '0%'}}></div></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col */}
                        <div>
                            <div className="pf-card">
                                <h2 className="pf-card-title">COLLECTION DISTRIBUTION</h2>
                                <div className="pf-progress-item">
                                    <div className="pf-progress-header"><span>Outerwear & Jackets</span> <span>0%</span></div>
                                    <div className="pf-progress-bar-bg"><div className="pf-progress-bar-fill" style={{width: '0%'}}></div></div>
                                </div>
                                <div className="pf-progress-item">
                                    <div className="pf-progress-header"><span>Formal Collection</span> <span>0%</span></div>
                                    <div className="pf-progress-bar-bg"><div className="pf-progress-bar-fill" style={{width: '0%'}}></div></div>
                                </div>
                            </div>

                            <div className="pf-card">
                                <h2 className="pf-card-title">SECURITY & PRIVACY</h2>
                                <div className="pf-security-item">
                                    <div className="pf-security-left">
                                        <div className="pf-security-icon"><Icon.Lock /></div>
                                        <div className="pf-security-texts">
                                            <span className="pf-security-title">Account Password</span>
                                            <span className="pf-security-sub">Last updated recently</span>
                                        </div>
                                    </div>
                                    <button className="pf-btn-small" onClick={() => setIsPasswordEditing(true)}>Update</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal overlay */}
            {isEditing && (
                <div className="pf-modal-overlay" onClick={() => setIsEditing(false)}>
                    <div className="pf-modal" onClick={e => e.stopPropagation()}>
                        <div className="pf-modal-header">
                            <h2>Edit Store Profile</h2>
                            <button className="pf-modal-close" onClick={() => setIsEditing(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        
                        <div className="pf-modal-section">
                            <div className="pf-modal-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                STORE IDENTITY
                            </div>
                            <div className="pf-modal-grid">
                                <div className="pf-modal-form-group">
                                    <label>STORE NAME</label>
                                    <input className="pf-modal-input" value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                                </div>
                                <div className="pf-modal-form-group">
                                    <label>CONTACT EMAIL</label>
                                    <input className="pf-modal-input" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="pf-modal-section">
                            <div className="pf-modal-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                CONTACT & LOGISTICS
                            </div>
                            <div className="pf-modal-grid">
                                <div className="pf-modal-form-group">
                                    <label>PHONE NUMBER</label>
                                    <input className="pf-modal-input" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                                </div>
                                <div className="pf-modal-form-group">
                                    <label>STORE ADDRESS</label>
                                    <input className="pf-modal-input" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="pf-modal-actions">
                            <button className="pf-modal-btn cancel" onClick={() => setIsEditing(false)}>Discard</button>
                            <button className="pf-modal-btn save" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal overlay */}
            {isPasswordEditing && (
                <div className="pf-modal-overlay" onClick={() => setIsPasswordEditing(false)}>
                    <div className="pf-modal pf-modal--narrow" onClick={e => e.stopPropagation()}>
                        <div className="pf-modal-header">
                            <h2>Update Credentials</h2>
                            <button className="pf-modal-close" onClick={() => setIsPasswordEditing(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        
                        <div className="pf-modal-icon-header">
                            <Icon.Key />
                            <p>Change your account password to maintain security.<br/>Choose a strong one.</p>
                        </div>
                        
                        <div className="pf-modal-form-vertical">
                            <div className="pf-modal-form-group">
                                <label>NEW PASSWORD</label>
                                <input className="pf-modal-input" type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                            </div>
                            <div className="pf-modal-form-group">
                                <label>CONFIRM PASSWORD</label>
                                <input className="pf-modal-input" type="password" placeholder="••••••••" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                            </div>
                        </div>

                        <div className="pf-modal-actions">
                            <button className="pf-modal-btn cancel" onClick={() => setIsPasswordEditing(false)}>Discard</button>
                            <button className="pf-modal-btn save" onClick={handlePasswordSave} disabled={isPasswordSaving}>{isPasswordSaving ? 'Updating...' : 'Update Password'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
