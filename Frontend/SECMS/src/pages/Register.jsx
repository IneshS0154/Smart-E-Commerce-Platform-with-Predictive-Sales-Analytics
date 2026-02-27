import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        username: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <section className="auth-card">
                    <div className="auth-card-inner">
                        <header className="auth-header">
                            <div className="auth-brand">
                                <div className="brand-mark">S</div>
                                <div>
                                    <div className="brand-text-main">Smart E‑Commerce Console</div>
                                    <div className="brand-text-sub">Seller onboarding · 2‑3 minutes</div>
                                </div>
                            </div>
                            <div className="auth-pill">Step 1 · Store details</div>
                        </header>

                        <div className="auth-title-block">
                            <h1>Create your seller account</h1>
                            <p>
                                Connect your store to unlock predictive sales analytics, smarter inventory, and
                                real‑time performance tracking.
                            </p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="field">
                                <label htmlFor="storeName">Store name</label>
                                <div className="input-shell">
                                    <span className="input-prefix">🏬</span>
                                    <input
                                        id="storeName"
                                        name="storeName"
                                        placeholder="e.g. Aurora Streetwear"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="field">
                                    <label htmlFor="username">Username</label>
                                    <div className="input-shell">
                                        <span className="input-prefix">@</span>
                                        <input
                                            id="username"
                                            name="username"
                                            placeholder="Your operator handle"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label htmlFor="email">Work email</label>
                                    <div className="input-shell">
                                        <span className="input-prefix">@</span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@store.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="field">
                                    <label htmlFor="phoneNumber">Phone number</label>
                                    <div className="input-shell">
                                        <span className="input-prefix">+</span>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            placeholder="+1 555 0123 456"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label htmlFor="address">Store address</label>
                                    <div className="input-shell">
                                        <span className="input-prefix">📍</span>
                                        <input
                                            id="address"
                                            name="address"
                                            placeholder="Street, city, country"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <div className="input-shell">
                                    <span className="input-prefix">••</span>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="helper-text">
                                    At least 8 characters with a mix of numbers and symbols is recommended.
                                </div>
                            </div>

                            <div className="auth-actions">
                                <div className="auth-links">
                                    <span>Already registered? </span>
                                    <button type="button" onClick={goToLogin}>
                                        Sign in instead
                                    </button>
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Creating account…' : 'Create seller account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <aside className="auth-side">
                    <div className="auth-side-inner">
                        <div className="side-kpi-row">
                            <div className="kpi-pill">
                                <span className="kpi-label">Average revenue lift</span>
                                <span className="kpi-value">+21.3%</span>
                                <span className="kpi-badge">Sellers after 90 days</span>
                            </div>
                            <div className="kpi-pill">
                                <span className="kpi-label">Stock‑out reduction</span>
                                <span className="kpi-value">‑36%</span>
                                <span className="kpi-badge">With predictive inventory</span>
                            </div>
                        </div>
                        <p className="side-note">
                            We don’t share your data with third parties. Your models are trained exclusively on
                            your store performance.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}