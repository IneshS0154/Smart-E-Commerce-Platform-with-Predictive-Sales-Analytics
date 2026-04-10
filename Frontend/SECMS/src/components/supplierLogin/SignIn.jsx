import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import SellerLoginImage from '../../assets/images/seller_auth/login.jpg';
import '../supplierLogin/Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!credentials.email.trim()) errors.email = 'Email is required';
        if (!credentials.password) errors.password = 'Password is required';
        return errors;
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setFieldErrors({});

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/sellers/login', credentials);
            const data = response.data;
            
            console.log('Login response:', data);  // Debug log

            if (data.role === 'ADMIN') {
                alert('Admin logins must use the Account login page. Please go to /login.');
                return;
            }

            if (data.role !== 'SELLER' || !data.data) {
                console.error('Invalid response format:', { role: data.role, hasData: !!data.data });
                setErrorMessage('Unexpected login response. Please try again.');
                return;
            }

            localStorage.setItem('seller', JSON.stringify(data.data));
            localStorage.setItem('sellerToken', data.token || '');
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('customer');
            localStorage.removeItem('customerToken');
            localStorage.removeItem('customerUsername');
            localStorage.removeItem('customerEmail');
            if (rememberMe) {
                localStorage.setItem('rememberSellerLogin', 'true');
            } else {
                localStorage.removeItem('rememberSellerLogin');
            }
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Login error caught:', error);
            console.error('Error response:', error?.response?.data);
            
            // Handle error responses with status codes
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                const errorData = error.response.data;
                const message = errorData?.message || errorData || 'Invalid email or password';
                setErrorMessage(typeof message === 'string' ? message : 'Login failed. Please try again.');
            } else if (error?.response?.data) {
                const backendMessage = error.response.data?.message || error.response.data;
                setErrorMessage(typeof backendMessage === 'string' ? backendMessage : 'Login failed. Please check your credentials.');
            } else {
                setErrorMessage('Unable to connect to server. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="supplier-auth-container">
            <div className="back-link-container">
                <button type="button" className="back-to-home" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
            </div>

            <div className="supplier-auth-content">
                <div className="supplier-auth-form-wrapper">
                    <h1 className="supplier-auth-title">Sign In</h1>
                    <p className="supplier-auth-subtitle">Welcome back to ANYWEAR (Supplier).</p>

                    {errorMessage ? (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
                            {errorMessage}
                        </div>
                    ) : null}

                    <div className="form-frame">
                        <form onSubmit={handleSubmit} className="supplier-auth-form" noValidate>
                            <div className="form-group">
                                <label htmlFor="login-username">Email</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    name="email"
                                    autoComplete="username"
                                    style={fieldErrors.email ? { borderColor: '#dc2626' } : {}}
                                />
                                {fieldErrors.email && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={credentials.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        name="password"
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
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>

                            <button type="submit" className="supplier-auth-button" disabled={submitting}>
                                {submitting ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="supplier-auth-toggle">
                            <p>
                                New here?{' '}
                                <span className="toggle-link" onClick={goToRegister}>
                                    Sign Up
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="supplier-auth-image-wrapper">
                    <div className="supplier-auth-image-placeholder">
                        <img src={SellerLoginImage} alt="Seller Login" />
                    </div>
                </div>
            </div>
        </div>
    );
}