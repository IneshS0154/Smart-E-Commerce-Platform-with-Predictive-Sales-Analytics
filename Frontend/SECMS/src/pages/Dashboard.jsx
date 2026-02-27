import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
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

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/login');
    };

    if (!seller) {
        return <div className="loading-shell">Loading your dashboard…</div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-shell">
                <header className="dashboard-header">
                    <div className="dashboard-store">
                        <h2>Welcome back, {seller.storeName}</h2>
                        <span>Here&apos;s a quick overview of your store and predictive insights.</span>
                    </div>
                    <div className="dashboard-actions">
                        <span className="badge-soft">Models · Healthy</span>
                        <button className="btn btn-ghost" type="button">
                            View analytics
                        </button>
                        <button className="btn btn-primary" type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <section className="dashboard-grid">
                    <div className="dashboard-panel">
                        <div className="panel-heading">
                            <h3>Store profile</h3>
                            <span>Core information used to tailor your predictions.</span>
                        </div>

                        <div className="profile-grid">
                            <div className="profile-item">
                                <strong>Store name</strong>
                                <span>{seller.storeName}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Username</strong>
                                <span>{seller.username}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Email</strong>
                                <span>{seller.email}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Phone</strong>
                                <span>{seller.phoneNumber}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Address</strong>
                                <span>{seller.address}</span>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </div>
    );
}