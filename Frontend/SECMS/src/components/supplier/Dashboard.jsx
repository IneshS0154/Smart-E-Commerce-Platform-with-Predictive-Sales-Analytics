import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierProducts from './SupplierProducts';
import SupplierStocks from './SupplierStocks';
import SupplierProfile from './Profile';
import DashboardOverview from './DashboardOverview';
import SupplierOrders from './SupplierOrders';
import SupplierCoupons from './SupplierCoupons';
import SupplierReviews from './SupplierReviews';
import SupplierAIInsights from './SupplierAIInsights';
import { 
  LayoutDashboard, ShoppingBag, Package, 
  ShoppingCart, Ticket, Star, 
  Sparkles, User, LogOut, Menu
} from 'lucide-react';
import './Dashboard.css';
import DarkVeil from '../ui/DarkVeil';

const navItems = [
    { section: "MAIN", items: [
        { label: "Dashboard", icon: <LayoutDashboard size={18} /> }
    ]},
    { section: "STORE", items: [
        { label: "Products", icon: <ShoppingBag size={18} /> },
        { label: "Stocks", icon: <Package size={18} /> },
        { label: "Orders", icon: <ShoppingCart size={18} /> },
        { label: "Coupons", icon: <Ticket size={18} /> }
    ]},
    { section: "ANALYTICS", items: [
        { label: "Reviews", icon: <Star size={18} /> },
        { label: "AI Insights", icon: <Sparkles size={18} /> }
    ]},
    { section: "OTHER", items: [
        { label: "Profile", icon: <User size={18} /> }
    ]}
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('seller');
        navigate('/');
    };

    const handleNavClick = (label) => {
        setActiveTab(label);
    };

    if (!seller) return <div className="loading-shell">Initialising Anywear Dashboard…</div>;

    return (
        <div className={`li-dash-layout ${isSidebarCollapsed ? 'li-dash--collapsed' : ''}`}>
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.8} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            {/* Sidebar */}
            <aside className="li-dash-sidebar">
                <div className="li-dash-brand">
                    <button 
                        className="li-sidebar-toggle" 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <Menu size={20} />
                    </button>
                    <span className="li-brand-name">ANYWEAR</span>
                </div>
                <nav className="li-side-nav">
                    {navItems.map(section => (
                        <div key={section.section} className="li-nav-section">
                            <div className="li-section-title">{section.section}</div>
                            <div className="li-nav-group">
                                {section.items.map(item => (
                                    <button
                                        key={item.label}
                                        className={`li-nav-item ${item.label === activeTab ? 'li-nav-item--active' : ''} ${item.label === 'AI Insights' ? 'li-nav-ai' : ''}`}
                                        onClick={() => handleNavClick(item.label)}
                                        title={isSidebarCollapsed ? item.label : ''}
                                    >
                                        <span className="li-nav-icon">{item.icon}</span>
                                        <span className="li-nav-label">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="li-side-footer">
                    <button onClick={handleLogout} className="li-logout-btn">
                        <LogOut size={18} />
                        <span className="li-logout-label">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="li-dash-main">
                <main className="li-dash-content">
                    <div key={activeTab} className="li-tab-content">
                        {activeTab === 'Dashboard' && <DashboardOverview onNavChange={setActiveTab} />}
                        {activeTab === 'Products' && <SupplierProducts />}
                        {activeTab === 'Stocks' && <SupplierStocks />}
                        {activeTab === 'Orders' && <SupplierOrders />}
                        {activeTab === 'Coupons' && <SupplierCoupons />}
                        {activeTab === 'Reviews' && <SupplierReviews />}
                        {activeTab === 'AI Insights' && <SupplierAIInsights />}
                        {activeTab === 'Profile' && <SupplierProfile />}
                    </div>
                </main>
            </div>
        </div>
    );
}

