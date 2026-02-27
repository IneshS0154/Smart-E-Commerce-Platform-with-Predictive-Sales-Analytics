import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '', username: '', email: '',
        phoneNumber: '', address: '', password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data || 'Unknown error'));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Seller Registration</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input name="storeName" placeholder="Store Name" onChange={handleChange} required />
                <input name="username" placeholder="Username" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
                <input name="address" placeholder="Address" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}