import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import LoginImage from '../../assets/images/login_signup/login.png';

const API_BASE = 'http://localhost:8080/api';

export default function Login() {
    const navigate = useNavigate();
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [rememberVal, setRememberVal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!usernameVal.trim()) errors.username = 'Username is required';
        if (!passwordVal) errors.password = 'Password is required';
        return errors;
    };

    const doAdminLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE}/auth/admin/login`, {
                username: usernameVal,
                password: passwordVal
            });
            if (res.data?.role === 'ADMIN') {
                localStorage.setItem('admin', JSON.stringify(res.data));
                localStorage.setItem('adminToken', res.data.token || '');
                localStorage.removeItem('customer');
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerUsername');
                localStorage.removeItem('seller');
                localStorage.removeItem('sellerToken');
                navigate('/admindashboard');
                return true;
            }
        } catch (err) {
            console.log('Admin login failed:', err.response?.data);
        }
        return false;
    };

    const doLogin = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        setFieldErrors({});

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        setErrorMsg('');

        const adminOk = await doAdminLogin();
        if (adminOk) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${API_BASE}/auth/login`, {
                username: usernameVal,
                password: passwordVal
            });
            const data = res.data;

            if (data.role === 'CUSTOMER') {
                localStorage.setItem('customer', JSON.stringify(data));
                localStorage.setItem('customerToken', data.token || '');
                localStorage.setItem('customerUsername', data.username || usernameVal);
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('seller');
                localStorage.removeItem('sellerToken');
                if (rememberVal) localStorage.setItem('rememberCustomerLogin', 'true');
                else localStorage.removeItem('rememberCustomerLogin');
                setLoading(false);
                // Redirect to homepage so the customer can browse products.
                navigate('/');
                return;
            }

            if (data.role === 'SELLER') {
                localStorage.setItem('seller', JSON.stringify(data));
                localStorage.setItem('sellerToken', data.token || '');
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('customer');
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerUsername');
                setLoading(false);
                navigate('/dashboard');
                return;
            }

            setErrorMsg('Unknown user role. Contact support.');
        } catch (err) {
            if (err.response && err.response.data) {
                const msg = err.response.data.message || err.response.data;
                setErrorMsg(typeof msg === 'string' ? msg : 'Login failed.');
            } else if (err.request) {
                setErrorMsg('Cannot connect to server. Is the backend running?');
            } else {
                setErrorMsg('Login failed. Please try again.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="back-link-container">
                <button type="button" className="back-to-home" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
            </div>
            <div className="auth-content">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Sign In</h1>
                    <p className="auth-subtitle">Welcome back to ANYWEAR</p>

                    {errorMsg ? (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
                            {errorMsg}
                        </div>
                    ) : null}

                    <div className="form-frame">
                        <form onSubmit={doLogin} className="auth-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="login-username">Username</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={usernameVal}
                                    onChange={(e) => setUsernameVal(e.target.value)}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    style={fieldErrors.username ? { borderColor: '#dc2626' } : {}}
                                />
                                {fieldErrors.username && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordVal}
                                        onChange={(e) => setPasswordVal(e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        style={{ paddingRight: '44px', width: '100%', ...(fieldErrors.password ? { borderColor: '#dc2626' } : {}) }}
                                    />
                                    {fieldErrors.password && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.password}</span>}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%',
                                            transform: 'translateY(-50%)', background: 'none',
                                            border: 'none', cursor: 'pointer', padding: '4px',
                                            color: '#9ca3af', display: 'flex', alignItems: 'center'
                                        }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="remember-forgot-wrapper">
                                <label className="remember-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberVal}
                                        onChange={(e) => setRememberVal(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>

                            <button type="submit" className="auth-button" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-toggle">
                            <p>
                                Don't have an account?{' '}
                                <span className="toggle-link" onClick={() => navigate('/signup')}>
                                    Sign Up
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="auth-image-wrapper">
                    <div className="auth-image-placeholder">
                        <img src={LoginImage} alt="Login" />
                    </div>
                </div>
            </div>
        </div>
    );
}
