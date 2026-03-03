import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../styles/AuthLayout.css';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post('/login', credentials);
            localStorage.setItem('seller', JSON.stringify(response.data));
            if (rememberMe) {
                localStorage.setItem('rememberSellerLogin', 'true');
            } else {
                localStorage.removeItem('rememberSellerLogin');
            }
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <div className="auth-hero auth-hero--login" />
                <section className="auth-panel">
                    <header className="auth-brand-bar">ANYWEAR</header>

                    <div className="auth-heading-block">
                        <h1 className="auth-heading">
                            <span>WELCOME</span>
                            <span>BACK!</span>
                        </h1>
                        <p className="auth-subtitle">Sign in to continue to your account.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="email">Username or Email</label>
                            <div className="input-shell">
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={credentials.email}
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
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-utility-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <button type="button" className="text-button">
                                Forgot Password?
                            </button>
                        </div>

                        <div className="auth-submit">
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Signing in…' : 'SIGN IN'}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <span>New here?</span>
                        <button type="button" onClick={goToRegister}>
                            Sign Up
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}