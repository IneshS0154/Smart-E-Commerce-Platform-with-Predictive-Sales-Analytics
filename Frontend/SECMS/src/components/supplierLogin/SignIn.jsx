import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import SellerLoginImage from '../../assets/images/seller_auth/login.jpg';
import './Auth.css';
import DarkVeil from '../ui/DarkVeil';
import { 
    ShoppingBag, Eye, EyeOff, AlertCircle, ChevronLeft 
} from 'lucide-react';

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
            
            if (data.role === 'ADMIN') {
                setErrorMessage('Admin logins must use the Account login page.');
                return;
            }

            if (data.role !== 'SELLER' || !data.data) {
                setErrorMessage('Unexpected login response. Please try again.');
                return;
            }

            localStorage.setItem('seller', JSON.stringify(data.data));
            localStorage.setItem('sellerToken', data.token || '');
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('customer');
            localStorage.removeItem('customerToken');
            if (rememberMe) localStorage.setItem('rememberSellerLogin', 'true');
            else localStorage.removeItem('rememberSellerLogin');
            
            navigate('/dashboard', { replace: true });
        } catch (error) {
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                setErrorMessage(error.response.data?.message || 'Invalid email or password');
            } else {
                setErrorMessage('Unable to connect to server. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <button className="back-home-btn" onClick={() => navigate('/')}>
                <ChevronLeft size={18} />
                <span>Back to Home</span>
            </button>
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={1.5} 
                    noiseIntensity={0.02} 
                    scanlineIntensity={0.1} 
                    warpAmount={0.25}
                    grayscale={1.0}
                />
            </div>

            <div className="auth-card">
                <div className="auth-left">
                    <div className="auth-logo">
                        <ShoppingBag size={20} color="#000" />
                    </div>

                    <div className="auth-header">
                        <h1>Supplier Portal</h1>
                        <p>Welcome back to ANYWEAR (Supplier).</p>
                    </div>

                    {errorMessage && <div className="alert alert-error"><AlertCircle size={16} /> {errorMessage}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    autoComplete="username"
                                />
                            </div>
                            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <a href="#" className="forgot-password" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        New here?
                        <span className="toggle-link" onClick={() => navigate('/register')}>Join as Supplier</span>
                    </div>
                </div>

                <div className="auth-right">
                    <img src={SellerLoginImage} alt="Supplier Lifestyle" />
                </div>
            </div>
        </div>
    );
}