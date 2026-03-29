import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import './Auth.css';
import SignupImage from '../../assets/images/login_signup/signup.png';

function SignUp() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!agreeTerms) {
            setError('You must agree to the Terms & Conditions');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setSubmitting(true);

        try {
            const response = await authService.register({
                firstName,
                lastName,
                username,
                email,
                password,
                phoneNumber,
                address,
            });

            setSuccess(response.message || 'Registration successful!');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const message = err?.response?.data?.message || err?.response?.data || 'Registration failed. Please try again.';
            setError(typeof message === 'string' ? message : JSON.stringify(message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignInClick = () => {
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="back-link-container">
                <button onClick={() => navigate('/')} className="back-to-home">← Back to Home</button>
            </div>
            <div className="auth-content">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join ANYWEAR today</p>

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group form-group-half">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name"
                                    required
                                />
                            </div>

                            <div className="form-group form-group-half">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username (min 3 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password (min 6 characters)"
                                required
                            />
                        </div>

                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                required
                            />
                            <label htmlFor="agreeTerms">I agree to the Terms & Conditions</label>
                        </div>

                        <button type="submit" className="auth-button" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        <p>Already have an account? <span className="toggle-link" onClick={handleSignInClick}>Sign In</span></p>
                    </div>
                </div>

                <div className="signup-image-wrapper">
                    <div className="signup-image-placeholder">
                        <img 
                            src={SignupImage} 
                            alt="Sign Up" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;