import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import './Auth.css';
import LoginImage from '../../assets/images/login_signup/Login.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await api.post('/login', { email, password });
            const data = response.data;

            if (data.role === 'ADMIN') {
                localStorage.setItem('admin', JSON.stringify(data));
                navigate('/admindashboard');
            } else if (data.role === 'SELLER') {
                localStorage.setItem('seller', JSON.stringify(data.data));
                if (rememberMe) {
                    localStorage.setItem('rememberSellerLogin', 'true');
                } else {
                    localStorage.removeItem('rememberSellerLogin');
                }
                navigate('/dashboard');
            } else {
                alert('Unexpected login role.');
            }
        } catch (error) {
            const message = error?.response?.data || 'Login failed. Please check your credentials.';
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="auth-container">
            <div className="back-link-container">
                <button onClick={() => navigate('/')} className="back-to-home">← Back to Home</button>
            </div>
            <div className="auth-content">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Sign In</h1>
                    <p className="auth-subtitle">Welcome back to ANYWEAR</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            {/* Updated Label */}
                            <label htmlFor="email">Username or Email</label>
                            <input
                                type="text" /* CHANGED from "email" to "text" */
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your username or email" /* Updated Placeholder */
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="form-group remember-me">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                        </div>

                        <a href="#" className="forgot-password">Forgot Password?</a>

                        <button type="submit" className="auth-button" disabled={submitting}>
                            {submitting ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button className="social-button google-button">
                        <span>Sign in with Google</span>
                    </button>

                    <div className="auth-toggle">
                        <p>Don't have an account? <span className="toggle-link" onClick={handleSignUpClick}>Sign Up</span></p>
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

export default Login;