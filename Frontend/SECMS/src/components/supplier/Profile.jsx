import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const navItems = [
    { label: "Dashboard"},
    { label: "Profile"},
];

export default function Profile() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            const sellerData = JSON.parse(storedSeller);
            setSeller(sellerData);
            setFormData(sellerData);
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');
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
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating seller:', err);
            setError('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(seller);
        setIsEditing(false);
    };

    const handleNavClick = (label) => {
        if (label === 'Dashboard') {
            navigate('/dashboard');
        } else if (label === 'Profile') {
            navigate('/profile');
        }
    };

    if (!seller) {
        return null;
    }

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'S';
    const statusColor = seller.status === 'ACTIVE' ? '#22c55e' : (seller.status === 'PENDING' ? '#f59e0b' : '#ef4444');
    const statusText = seller.status === 'ACTIVE' ? 'Active' : (seller.status === 'PENDING' ? 'Pending' : (seller.status === 'DEACTIVATED' ? 'Deactivated' : 'Rejected'));

    return (
        <div className="profile-layout">
            {/* Sidebar */}
            <aside className="profile-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-name">ANYWEAR</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`nav-item ${item.label === 'Profile' ? 'nav-item--active' : ''}`}
                            onClick={() => handleNavClick(item.label)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button
                        className="nav-item"
                        onClick={() => {
                            localStorage.removeItem('seller');
                            navigate('/login');
                        }}
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="profile-main">
                <div className="profile-container">
                    {/* Header Section */}
                    <div className="profile-header">
                        <div className="profile-header-content">
                            <div className="profile-avatar-large">{initials}</div>
                            <div className="profile-header-info">
                                <h1 className="profile-store-name">{seller.storeName}</h1>
                                <p className="profile-email">{seller.email}</p>
                                <div className="profile-status-badge" style={{ backgroundColor: statusColor }}>
                                    {statusText}
                                </div>
                            </div>
                        </div>
                        <button
                            className="profile-edit-btn"
                            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                        >
                            {isEditing ? '✕ Cancel' : '✎ Edit Profile'}
                        </button>
                    </div>

                    {/* Messages */}
                    {error && <div className="profile-alert profile-alert--error">{error}</div>}
                    {success && <div className="profile-alert profile-alert--success">{success}</div>}

                    {/* Main Content */}
                    <div className="profile-main-content">
                        {/* Contact Details Card */}
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h2 className="profile-card-title">Contact Details</h2>
                            </div>
                            <div className="profile-card-content">
                                {isEditing ? (
                                    <div className="profile-form">
                                        <div className="profile-form-row">
                                            <div className="profile-form-group">
                                                <label className="profile-form-label">Store Name</label>
                                                <input
                                                    type="text"
                                                    name="storeName"
                                                    value={formData.storeName || ''}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter store name"
                                                />
                                            </div>
                                            <div className="profile-form-group">
                                                <label className="profile-form-label">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber || ''}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-form-row">
                                            <div className="profile-form-group profile-form-group--full">
                                                <label className="profile-form-label">Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address || ''}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter address"
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-form-actions">
                                            <button
                                                className="profile-btn profile-btn--primary"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                className="profile-btn profile-btn--secondary"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="profile-details">
                                        <div className="profile-detail-item">
                                            <span className="profile-detail-label">Store Name</span>
                                            <span className="profile-detail-value">{seller.storeName}</span>
                                        </div>
                                        <div className="profile-detail-item">
                                            <span className="profile-detail-label">Email</span>
                                            <span className="profile-detail-value">{seller.email}</span>
                                        </div>
                                        <div className="profile-detail-item">
                                            <span className="profile-detail-label">Phone Number</span>
                                            <span className="profile-detail-value">{seller.phoneNumber || 'Not provided'}</span>
                                        </div>
                                        <div className="profile-detail-item">
                                            <span className="profile-detail-label">Address</span>
                                            <span className="profile-detail-value">{seller.address || 'Not provided'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Info Card */}
                        <div className="profile-card profile-card--side">
                            <div className="profile-card-header">
                                <h2 className="profile-card-title">Account Information</h2>
                            </div>
                            <div className="profile-card-content">
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Account Type</span>
                                    <span className="profile-info-value">Supplier</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Status</span>
                                    <span className="profile-info-value" style={{ color: statusColor, fontWeight: '600' }}>
                                        {statusText}
                                    </span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Account ID</span>
                                    <span className="profile-info-value">#{seller.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
