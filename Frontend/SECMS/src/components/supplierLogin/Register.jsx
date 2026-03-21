import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import './AuthLayout.css';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        username: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (!formData.acceptTerms) {
            alert('Please accept the Terms & Conditions to continue.');
            return;
        }

        setSubmitting(true);
        try {
            const { confirmPassword, acceptTerms, ...payload } = formData;
            await api.post('/register', payload);
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
            <div className="auth-shell auth-shell--reverse">
                <section className="auth-panel">
                    <header className="auth-brand-bar">ANYWEAR</header>

                    <div className="auth-heading-block">
                        <h1 className="auth-heading">
                            <span>JOIN WITH</span>
                            <span>US!</span>
                        </h1>
                        <p className="auth-subtitle">
                            Create your account to start exploring personalized looks and smart recommendations.
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="storeName">Store / Brand name</label>
                            <div className="input-shell">
                                <input
                                    id="storeName"
                                    name="storeName"
                                    placeholder="e.g. Anywear Studio"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="username">Username</label>
                            <div className="input-shell">
                                <input
                                    id="username"
                                    name="username"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <div className="input-shell">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="phoneNumber">Phone number</label>
                            <div className="input-shell">
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
                            <label htmlFor="address">Address</label>
                            <div className="input-shell">
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

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <div className="input-shell">
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
                        </div>

                        <div className="field">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-shell">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re‑enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-utility-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                />
                                I agree to the Terms &amp; Conditions
                            </label>
                        </div>

                        <div className="auth-submit">
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Creating account…' : 'SIGN UP'}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <span>Fan member?</span>
                        <button type="button" onClick={goToLogin}>
                            Sign In
                        </button>
                    </div>
                </section>

                <div className="auth-hero auth-hero--register" />
            </div>
        </div>
    );
}