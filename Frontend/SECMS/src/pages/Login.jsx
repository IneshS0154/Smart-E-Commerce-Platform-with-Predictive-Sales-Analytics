import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
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
                <section className="auth-card">
                    <div className="auth-card-inner">
                        <header className="auth-header">
                            <div className="auth-brand">
                                <div className="brand-mark">S</div>
                                <div>
                                    <div className="brand-text-main">Smart E‑Commerce Console</div>
                                    <div className="brand-text-sub">Seller login · Secure access</div>
                                </div>
                            </div>
                            <div className="auth-pill">Predictive sales active</div>
                        </header>

                        <div className="auth-title-block">
                            <h1>Welcome back, seller</h1>
                            <p>Sign in to view your store performance and manage your catalogue.</p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="field">
                                <label htmlFor="email">Work email</label>
                                <div className="input-shell">
                                    <span className="input-prefix">@</span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@store.com"
                                        value={credentials.email}
                                        onChange={handleChange}
                                        required
                                    />
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
                                        placeholder="Enter your password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="helper-text">
                                    Use the same credentials you registered with your store.
                                </div>
                            </div>

                            <div className="auth-actions">
                                <div className="auth-links">
                                    <span>New here? </span>
                                    <button type="button" onClick={goToRegister}>
                                        Create a seller account
                                    </button>
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Signing in…' : 'Sign in'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

            </div>
        </div>
    );
}