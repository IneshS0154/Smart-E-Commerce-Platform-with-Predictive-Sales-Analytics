import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Supplierdashboard from './pages/Supplierdashboard.jsx';
import Admindashboard from './pages/Admindashboard.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admindashboard" element={<Admindashboard/>} />
                <Route path="/supplierdashboard" element={<Supplierdashboard />} />
            </Routes>
        </Router>
    );
}

export default App;