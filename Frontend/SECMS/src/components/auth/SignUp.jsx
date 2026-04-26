import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import {
    Check, Eye, EyeOff, AlertCircle,
    ArrowLeft, ShoppingBag, ChevronLeft
} from 'lucide-react';
import './Auth.css';
<<<<<<< Updated upstream
import SignupImage from '../../assets/images/login_signup/signup.png';
=======
import DarkVeil from '../ui/DarkVeil';
import SignupImage from '../../assets/images/login_signup/Signup.png';
>>>>>>> Stashed changes

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
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        if (!firstName.trim()) errors.firstName = 'Required';
        if (!lastName.trim()) errors.lastName = 'Required';
        if (username.length < 3) errors.username = 'Too short';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) errors.email = 'Required';
        else if (!emailRegex.test(email)) errors.email = 'Invalid email';

        if (!password) errors.password = 'Required';
        else if (password.length < 8) errors.password = 'Min 8 characters';

        if (!agreeTerms) errors.agreeTerms = 'You must agree to continue';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
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
            setSuccess(response.message || 'Account created successfully!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed.');
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
                {/* Left: Form Side */}
                <div className="auth-left">
                    <div className="auth-logo">
                        <ShoppingBag size={20} color="#000" />
                    </div>

                    <div className="auth-header">
                        <h1>Create account</h1>
                        <p>Join the ANYWEAR community today.</p>
                    </div>

                    {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
                    {success && <div className="alert alert-success"><Check size={16} /> {success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={fieldErrors.firstName ? 'error' : ''}
                                    />
                                </div>
                                {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {username.length >= 3 && (
                                        <div className="input-icon-right">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone number</label>
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    placeholder="+94 000 000 000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="password-hint">At least 8 characters</p>
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                            />
                            <label htmlFor="terms">
                                I agree to <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.
                            </label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Continue'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?
                        <span className="toggle-link" onClick={() => navigate('/login')}>Log in</span>
                    </div>
                </div>

                <div className="auth-right">
                    <img src={SignupImage} alt="Lifestyle" />
                </div>
            </div>
        </div>
    );
}

export default SignUp;