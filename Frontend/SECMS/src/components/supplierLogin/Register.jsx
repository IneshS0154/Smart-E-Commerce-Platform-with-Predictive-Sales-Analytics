import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import SellerRegisterImage from '../../assets/images/seller_auth/singup.jpg';
import '../supplierLogin/Auth.css';

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.acceptTerms) {
            setError('Please accept the Terms & Conditions to continue.');
            return;
        }

        setSubmitting(true);
        try {
            const { confirmPassword, acceptTerms, ...payload } = formData;
            await api.post('/sellers/register', { ...payload, status: 'PENDING' });
            setSuccess('Registration successful! Please login.');
            setTimeout(() => {
                navigate('/signin');
            }, 1500);
        } catch (error) {
            const backendMessage = error?.response?.data?.message || error?.response?.data;
            setError(typeof backendMessage === 'string' ? backendMessage : 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const goToLogin = () => {
        navigate('/signin');
    };

    return (
        <div className="supplier-auth-container">
            <div className="back-link-container">
                <button onClick={() => navigate('/')} className="back-to-home">← Back to Home</button>
            </div>

            <div className="supplier-auth-content">
                <div className="supplier-auth-form-wrapper">
                    <h1 className="supplier-auth-title">Create Account</h1>
                    <p className="supplier-auth-subtitle">Join ANYWEAR as a Supplier.</p>

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

                    <form onSubmit={handleSubmit} className="supplier-auth-form">
                        <div className="form-row">
                            <div className="form-group form-group-half">
                                <label htmlFor="storeName">Store / Brand name</label>
                                <input
                                    type="text"
                                    id="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    placeholder="e.g. Anywear Studio"
                                    name="storeName"
                                    required
                                />
                            </div>

                            <div className="form-group form-group-half">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    name="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                name="email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                name="phoneNumber"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                                name="address"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                name="password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                name="confirmPassword"
                                required
                            />
                        </div>

                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                                name="acceptTerms"
                                required
                            />
                            <label htmlFor="acceptTerms">I agree to the Terms & Conditions</label>
                        </div>

                        <button type="submit" className="supplier-auth-button" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    <div className="supplier-auth-toggle">
                        <p>Already have an account? <span className="toggle-link" onClick={goToLogin}>Sign In</span></p>
                    </div>
                </div>

                <div className="supplierS-auth-image-wrapper">
                    <div className="supplierS-auth-image-placeholder">
                        <img src={SellerRegisterImage} alt="Seller Sign Up" />
                    </div>
                </div>
            </div>
        </div>
    );
}