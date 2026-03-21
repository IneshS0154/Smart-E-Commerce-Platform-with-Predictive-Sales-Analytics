import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import SignupImage from '../../assets/images/login_signup/Signup.png';

function SignUp() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        // TODO: Add signup logic here
        console.log('SignUp:', { firstName, lastName, email, password });
        navigate('/');
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
                    <p className="auth-subtitle">Join with us today</p>

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
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
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

                        <button type="submit" className="auth-button">Create Account</button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button className="social-button google-button">
                        <span>Sign up with Google</span>
                    </button>

                    <div className="auth-toggle">
                        <p>Already have an account? <span className="toggle-link" onClick={handleSignInClick}>Sign In</span></p>
                    </div>
                </div>

                <div className="auth-image-wrapper">
                    <div className="auth-image-placeholder">
                        <img src={SignupImage} alt="Sign Up" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;