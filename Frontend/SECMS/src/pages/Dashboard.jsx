import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);

    useEffect(() => {
        // Retrieve the logged-in user from local storage
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        } else {
            // Redirect to login if not authenticated
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/login');
    };

    if (!seller) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome to your Dashboard, {seller.storeName}!</h2>
            <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
                <h3>Store Profile</h3>
                <p><strong>Username:</strong> {seller.username}</p>
                <p><strong>Email:</strong> {seller.email}</p>
                <p><strong>Phone:</strong> {seller.phoneNumber}</p>
                <p><strong>Address:</strong> {seller.address}</p>
            </div>
            <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px' }}>
                Logout
            </button>
        </div>
    );
}