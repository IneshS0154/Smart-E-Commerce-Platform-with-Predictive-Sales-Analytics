import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './components/supplierLogin/Register';
import SignIn from './components/supplierLogin/SignIn';
import Dashboard from './components/supplier/Dashboard';
import Profile from './components/supplier/Profile';
import Supplierdashboard from './components/Admin/Supplierdashboard.jsx';
import Admindashboard from './components/Admin/Admindashboard.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SignIn />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admindashboard" element={<Admindashboard/>} />
                <Route path="/supplierdashboard" element={<Supplierdashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;