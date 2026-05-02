import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import SellerRegisterImage from '../../assets/images/seller_auth/singup.jpg';
import './Auth.css';
import DarkVeil from '../ui/DarkVeil';
import { 
    ShoppingBag, AlertCircle, ChevronLeft, CheckCircle2 
} from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        username: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formData.storeName.trim()) errors.storeName = 'Store name is required';
        if (formData.username.length < 3) errors.username = 'Username too short';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) errors.email = 'Invalid email address';
        if (formData.password.length < 6) errors.password = 'Min 6 characters';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!formData.acceptTerms) errors.acceptTerms = 'Required';
        return errors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            const { confirmPassword, acceptTerms, ...payload } = formData;
            await api.post('/sellers/register', { ...payload, status: 'PENDING' });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/signin'), 2000);
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
                <div className="auth-left">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <ShoppingBag size={18} color="#000" />
                        </div>
                        <div className="header-text">
                            <h1>Join ANYWEAR</h1>
                            <p>Register as a Supplier to start selling.</p>
                        </div>
                    </div>

                    {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
                    {success && <div className="alert alert-success"><CheckCircle2 size={16} /> {success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Store / Brand Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="storeName"
                                        placeholder="e.g. Anywear Studio"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.storeName && <span className="field-error">{fieldErrors.storeName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <div className="input-wrapper">
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="+94 000 000 000"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="City, Country"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="terms"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                            />
                            <label htmlFor="terms">I agree to the <a href="#">Terms & Conditions</a></label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?
                        <span className="toggle-link" onClick={() => navigate('/signin')}>Sign In</span>
                    </div>
                </div>

                <div className="auth-right">
                    <img src={SellerRegisterImage} alt="Supplier Join" />
                </div>
            </div>
        </div>
    );
}