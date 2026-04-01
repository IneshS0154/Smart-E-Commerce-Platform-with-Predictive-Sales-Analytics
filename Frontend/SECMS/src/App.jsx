import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Register from './components/supplierLogin/Register';
import SignIn from './components/supplierLogin/SignIn';
import Dashboard from './components/supplier/Dashboard';
import Profile from './components/supplier/Profile';
import Supplierdashboard from './components/Admin/Supplierdashboard.jsx';
import Admindashboard from './components/Admin/Admindashboard.jsx';
import CustomerDashboard from './components/customer/CustomerDashboard.jsx';
import PageTransition from './components/PageTransition';
import MensCasualWear from './components/Men_s/catalogue/MensCasualWear';
import MensFormalCollection from './components/Men_s/catalogue/MensFormalCollection';
import MensSportsActive from './components/Men_s/catalogue/MensSportsActive';
import MensOuterwearJackets from './components/Men_s/catalogue/MensOuterwearJackets';
import MensPartyEveningWear from './components/Men_s/catalogue/MensPartyEveningWear';
import WomensCasualWear from './components/Women_s/catalogue/WomensCasualWear';
import WomensFormalCollection from './components/Women_s/catalogue/WomensFormalCollection';
import WomensSportsActive from './components/Women_s/catalogue/WomensSportsActive';
import WomensOuterwearJackets from './components/Women_s/catalogue/WomensOuterwearJackets';
import WomensPartyEveningWear from './components/Women_s/catalogue/WomensPartyEveningWear';
import ProductDetails from './components/ProductDetails';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function ProtectedRoute({ children, allowedRoles }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const admin = localStorage.getItem('admin');
        const seller = localStorage.getItem('seller');
        const customer = localStorage.getItem('customer');
        const customerToken = localStorage.getItem('customerToken');

        if (admin) {
            setIsAuthenticated(true);
            setUserRole('ADMIN');
        } else if (seller) {
            setIsAuthenticated(true);
            setUserRole('SELLER');
        } else if (customer && customerToken) {
            setIsAuthenticated(true);
            setUserRole('CUSTOMER');
        } else {
            setIsAuthenticated(false);
            setUserRole(null);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'ADMIN') return <Navigate to="/admindashboard" replace />;
        if (userRole === 'SELLER') return <Navigate to="/dashboard" replace />;
        if (userRole === 'CUSTOMER') return <Navigate to="/customer-dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <PageTransition />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mens-casual-wear" element={<MensCasualWear />} />
                <Route path="/mens-formal-collection" element={<MensFormalCollection />} />
                <Route path="/mens-sports-active" element={<MensSportsActive />} />
                <Route path="/mens-outerwear-jackets" element={<MensOuterwearJackets />} />
                <Route path="/mens-party-evening-wear" element={<MensPartyEveningWear />} />
                <Route path="/womens-casual-wear" element={<WomensCasualWear />} />
                <Route path="/womens-formal-collection" element={<WomensFormalCollection />} />
                <Route path="/womens-sports-active" element={<WomensSportsActive />} />
                <Route path="/womens-outerwear-jackets" element={<WomensOuterwearJackets />} />
                <Route path="/womens-party-evening-wear" element={<WomensPartyEveningWear />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['SELLER']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={['SELLER', 'CUSTOMER']}>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admindashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Admindashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/supplierdashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Supplierdashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customer-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
