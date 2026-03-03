import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!seller) {
        return null;
    }

    const initials = seller.username ? seller.username.charAt(0).toUpperCase() : 'S';

    return (
        <div className="profile-page">
            <div className="profile-shell">
                <aside className="profile-sidebar">
                    <div className="profile-sidebar-header">
                        <div className="profile-avatar-large">{initials}</div>
                        <div>
                            <h1 className="profile-name">{seller.storeName}</h1>
                            <p className="profile-role">Supplier</p>
                            <p className="profile-status">Status · Active</p>
                        </div>
                    </div>

                    <button type="button" className="profile-edit-button">
                        Edit Profile
                    </button>

                    <nav className="profile-nav">
                        <button type="button" className="profile-nav-item profile-nav-item--active">
                            Profile Overview
                        </button>
                        <button type="button" className="profile-nav-item" disabled>
                            Orders
                        </button>
                        <button type="button" className="profile-nav-item" disabled>
                            Payout History
                        </button>
                        <button type="button" className="profile-nav-item" disabled>
                            Settings
                        </button>
                    </nav>

                    <button
                        type="button"
                        className="profile-logout"
                        onClick={() => {
                            localStorage.removeItem('seller');
                            navigate('/login');
                        }}
                    >
                        Logout
                    </button>
                </aside>

                <main className="profile-main">
                    <header className="profile-tabs">
                        <button type="button" className="profile-tab profile-tab--active">
                            Personal Info
                        </button>
                        <button type="button" className="profile-tab" disabled>
                            Store Details
                        </button>
                        <button type="button" className="profile-tab" disabled>
                            Bank Details
                        </button>
                        <button type="button" className="profile-tab" disabled>
                            Documents
                        </button>
                    </header>

                    <section className="profile-section-grid">
                        <div className="profile-section-card">
                            <h2 className="profile-section-title">Contact Details</h2>
                            <div className="profile-details-grid">
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Store name</span>
                                    <span className="profile-detail-value">{seller.storeName}</span>
                                </div>
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Username</span>
                                    <span className="profile-detail-value">{seller.username}</span>
                                </div>
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Email</span>
                                    <span className="profile-detail-value">{seller.email}</span>
                                </div>
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Phone number</span>
                                    <span className="profile-detail-value">{seller.phoneNumber}</span>
                                </div>
                                <div className="profile-detail profile-detail--full">
                                    <span className="profile-detail-label">Address</span>
                                    <span className="profile-detail-value">{seller.address}</span>
                                </div>
                            </div>
                        </div>

                        <aside className="profile-section-card profile-section-card--side">
                            <h2 className="profile-section-title">Account Summary</h2>
                            <div className="profile-summary-item">
                                <span className="profile-summary-label">Account type</span>
                                <span className="profile-summary-value">Supplier</span>
                            </div>
                            <div className="profile-summary-item">
                                <span className="profile-summary-label">Status</span>
                                <span className="profile-summary-value profile-summary-value--accent">
                                    Active
                                </span>
                            </div>
                            <div className="profile-summary-item">
                                <span className="profile-summary-label">Joined</span>
                                <span className="profile-summary-value">2026</span>
                            </div>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
}
