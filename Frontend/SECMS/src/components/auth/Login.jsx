import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Check, Eye, EyeOff, AlertCircle,
    ShoppingBag, Lock, ChevronLeft
} from 'lucide-react';
import './Auth.css';
<<<<<<< Updated upstream
import LoginImage from '../../assets/images/login_signup/login.png';
=======
import DarkVeil from '../ui/DarkVeil';
import LoginImage from '../../assets/images/login_signup/Login.png';
>>>>>>> Stashed changes

const API_BASE = 'http://localhost:8080/api';

export default function Login() {
    const navigate = useNavigate();
    const [usernameVal, setUsernameVal] = useState('');
    const [passwordVal, setPasswordVal] = useState('');
    const [rememberVal, setRememberVal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
        } catch (err) { }
        return false;
    };

    const doLogin = async (e) => {
        if (e) e.preventDefault();
        if (!usernameVal || !passwordVal) {
            setErrorMsg('Username and password are required');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Try Customer Login First
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
                navigate('/');
                return;
            }
        } catch (err) {
            // 2. If Customer Login fails, try Admin Login as a fallback
            const adminOk = await doAdminLogin();
            if (adminOk) {
                setLoading(false);
                return;
            }
            
            // If both fail, show the original customer login error
            setErrorMsg(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
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
                {/* Left: Form Side */}
                <div className="auth-left">
                    <div className="auth-logo">
                        <ShoppingBag size={20} color="#000" />
                    </div>

                    <div className="auth-header">
                        <h1>Welcome back</h1>
                        <p>Sign in to your ANYWEAR account.</p>
                    </div>

                    {errorMsg && <div className="alert alert-error"><AlertCircle size={16} /> {errorMsg}</div>}

                    <form onSubmit={doLogin} className="auth-form">
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={usernameVal}
                                    onChange={(e) => setUsernameVal(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    value={passwordVal}
                                    onChange={(e) => setPasswordVal(e.target.value)}
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
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <a href="#" className="forgot-password" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberVal}
                                onChange={(e) => setRememberVal(e.target.checked)}
                            />
                            <label htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?
                        <span className="toggle-link" onClick={() => navigate('/signup')}>Create account</span>
                    </div>
                </div>

                <div className="auth-right">
                    <img src={LoginImage} alt="Lifestyle" />
                </div>
            </div>
        </div>
    );
}
