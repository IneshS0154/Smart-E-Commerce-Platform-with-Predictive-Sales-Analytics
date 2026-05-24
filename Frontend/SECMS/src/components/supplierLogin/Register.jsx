import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import storeBg from '../../assets/seller_auth/singup.jpg';
import './Register.css';

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
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        if (name === 'phoneNumber') {
            newValue = newValue.replace(/\D/g, '').slice(0, 10);
        }

        setFormData({ ...formData, [name]: newValue });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.storeName) newErrors.storeName = 'Store name is required';
        if (!formData.email) newErrors.email = 'Email address is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.address) newErrors.address = 'Address is required';

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Must include at least 1 capital letter';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.acceptTerms) newErrors.acceptTerms = 'Please accept Terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const { confirmPassword, acceptTerms, ...payload } = formData;
            await api.post('/register', payload);
            alert('Registration successful! Please login.');
            navigate('/signin');
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rg-page">
            <button className="rg-back-btn" onClick={() => navigate('/')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Home
            </button>

            <div className="rg-card">
                <div className="rg-form-panel">
                    <div className="rg-brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>

                    <div className="rg-heading-block">
                        <h1 className="rg-title">Join ANYWEAR</h1>
                        <p className="rg-subtitle">Register as a Supplier to start selling.</p>
                    </div>

                    <form className="rg-form" onSubmit={handleSubmit} noValidate>
                        <div className="rg-form-row">
                            <div className="rg-form-group">
                                <label>Store / Brand Name</label>
                                <input name="storeName" className="rg-input" placeholder="e.g. Anywear Studio" value={formData.storeName} onChange={handleChange} />
                                <span className="rg-error">{errors.storeName}</span>
                            </div>
                            <div className="rg-form-group">
                                <label>Username</label>
                                <input name="username" className="rg-input rg-input--blue" placeholder="Alterre" value={formData.username} onChange={handleChange} />
                                <span className="rg-error">{errors.username}</span>
                            </div>
                        </div>

                        <div className="rg-form-row">
                            <div className="rg-form-group">
                                <label>Email Address</label>
                                <input name="email" type="email" className="rg-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                                <span className="rg-error">{errors.email}</span>
                            </div>
                        </div>

                        <div className="rg-form-row">
                            <div className="rg-form-group">
                                <label>Phone Number</label>
                                <input name="phoneNumber" className="rg-input" placeholder="10 digit number" value={formData.phoneNumber} onChange={handleChange} />
                                <span className="rg-error">{errors.phoneNumber}</span>
                            </div>
                            <div className="rg-form-group">
                                <label>Address</label>
                                <input name="address" className="rg-input" placeholder="City, Country" value={formData.address} onChange={handleChange} />
                                <span className="rg-error">{errors.address}</span>
                            </div>
                        </div>

                        <div className="rg-form-row">
                            <div className="rg-form-group">
                                <label>Password</label>
                                <input name="password" type="password" className="rg-input rg-input--blue" placeholder="••••••••••" value={formData.password} onChange={handleChange} />
                                <span className="rg-error">{errors.password}</span>
                            </div>
                            <div className="rg-form-group">
                                <label>Confirm Password</label>
                                <input name="confirmPassword" type="password" className="rg-input" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
                                <span className="rg-error">{errors.confirmPassword}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="rg-remember">
                                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
                                I agree to the Terms & Conditions
                            </label>
                            <span className="rg-error">{errors.acceptTerms}</span>
                        </div>

                        <button className="rg-submit-btn" type="submit" disabled={submitting}>
                            {submitting ? 'Creating account…' : 'Create Account'}
                        </button>

                        <p className="rg-register-link">
                            Already have an account? <button type="button" onClick={() => navigate('/signin')}>Sign In</button>
                        </p>
                    </form>
                </div>

                <div className="rg-image-panel" style={{ backgroundImage: `url(${storeBg})` }} />
            </div>
        </div>
    );
}