import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import storeBg from '../../assets/seller_auth/login.jpg';
import './SignIn.css';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post('/login', credentials);
            const data = response.data;

            if (data.role === 'ADMIN') {
                localStorage.setItem('admin', JSON.stringify({
                    id: data.id,
                    username: data.username,
                }));
                navigate('/admindashboard');
                return;
            }

            localStorage.setItem('seller', JSON.stringify(data.data));
            if (rememberMe) {
                localStorage.setItem('rememberSellerLogin', 'true');
            } else {
                localStorage.removeItem('rememberSellerLogin');
            }
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.data && typeof error.response.data === 'string') {
                const errorMsg = error.response.data.toLowerCase();
                if (errorMsg.includes('pending')) {
                    alert("Your account is pending verification. Please wait until the admin approves your account.");
                } else if (errorMsg.includes('rejected')) {
                    alert("Your account has been rejected by the admin because you must register using valid and accurate information. Please sign up again with the correct details or contact the admin to reactivate your account.");
                } else {
                    alert(error.response.data);
                }
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="si-page">
            {/* Back to home */}
            <button className="si-back-btn" onClick={() => navigate('/')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Home
            </button>

            {/* Centered card */}
            <div className="si-card">
                {/* Left: form panel */}
                <div className="si-form-panel">
                    {/* Brand icon */}
                    <div className="si-brand-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                    </div>

                    <div className="si-heading-block">
                        <h1 className="si-title">Supplier Portal</h1>
                        <p className="si-subtitle">Welcome back to ANYWEAR (Supplier).</p>
                    </div>

                    <form className="si-form" onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div className="si-field">
                            <label htmlFor="si-email">Email Address</label>
                            <input
                                id="si-email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="si-field">
                            <label htmlFor="si-password">Password</label>
                            <div className="si-password-wrap">
                                <input
                                    id="si-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="si-eye-btn"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="si-forgot-row">
                                <button type="button" className="si-forgot-btn">Forgot password?</button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <label className="si-remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me for 30 days</span>
                        </label>

                        {/* Submit */}
                        <button className="si-submit-btn" type="submit" disabled={submitting}>
                            {submitting ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="si-register-link">
                        New here?{' '}
                        <button type="button" onClick={() => navigate('/register')}>
                            Join as Supplier
                        </button>
                    </p>
                </div>

                {/* Right: image panel */}
                <div
                    className="si-image-panel"
                    style={{ backgroundImage: `url(${storeBg})` }}
                    role="img"
                    aria-label="Fashion store interior"
                />
            </div>
        </div>
    );
}