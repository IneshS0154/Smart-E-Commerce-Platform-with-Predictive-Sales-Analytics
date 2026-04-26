import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import Userdashboard from './Userdashboard';
import Supplierdashboard from './Supplierdashboard';
import AdminOrders from './AdminOrders';
import AdminReviews from './AdminReviews';
import AdminReports from './AdminReports';
import orderAPI from '../../api/orderAPI';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
    ArrowUpRight, DollarSign, ShoppingBag, Zap, Activity, 
    Users as UsersIcon, Briefcase, Store
} from 'lucide-react';
import './Admindashboard.css';
import './AdminCommon.css';
import DarkVeil from '../ui/DarkVeil';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

export default function Admindashboard() {
    const [activeNav, setActiveNav] = useState("Overview");
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.location.href = "/";
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await orderAPI.getAllOrders();
                setAllOrders(data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const analytics = useMemo(() => {
        let totalRevenue = 0;
        let supplierMap = {};
        let productMap = {};
        let timeMap = {};

        allOrders.forEach(o => {
            totalRevenue += (parseFloat(o.finalAmount) || 0);
            
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            timeMap[dateStr] = (timeMap[dateStr] || 0) + (parseFloat(o.finalAmount) || 0);

            o.orderItems?.forEach(item => {
                const sId = item.product?.seller?.id;
                const sName = item.product?.seller?.storeName;
                if (sId) {
                    if (!supplierMap[sId]) supplierMap[sId] = { name: sName, volume: 0, revenue: 0 };
                    supplierMap[sId].volume += item.quantity;
                    supplierMap[sId].revenue += parseFloat(item.subtotal) || 0;
                }

                const pId = item.product?.id;
                const pName = item.product?.productName;
                if (pId) {
                    if (!productMap[pId]) productMap[pId] = { name: pName, volume: 0, revenue: 0, img: item.product?.mainImagePath };
                    productMap[pId].volume += item.quantity;
                    productMap[pId].revenue += parseFloat(item.subtotal) || 0;
                }
            });
        });

        const sortedSuppliers = Object.values(supplierMap).sort((a,b) => b.revenue - a.revenue).slice(0, 3);
        const sortedProducts = Object.values(productMap).sort((a,b) => b.volume - a.volume).slice(0, 4);
        const aov = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
        const formattedChartData = Object.keys(timeMap).map(date => ({ date, revenue: timeMap[date] }));
        const totalUnits = Object.values(productMap).reduce((s, p) => s + p.volume, 0);

        return { 
            topSuppliers: sortedSuppliers, 
            topProducts: sortedProducts, 
            avgOrderValue: aov,
            totalRevenue: totalRevenue,
            chartData: formattedChartData,
            supplierCount: Object.keys(supplierMap).length,
            unitMovement: totalUnits
        };
    }, [allOrders]);

    const renderMainContent = () => {
        if (activeNav === "Users") return <Userdashboard activeNav={activeNav} onNavChange={setActiveNav} showSidebar={false} />;
        if (activeNav === "Suppliers") return <Supplierdashboard activeNav={activeNav} onNavChange={setActiveNav} showSidebar={false} />;
        if (activeNav === "Transactions") return <AdminOrders activeNav={activeNav} onNavChange={setActiveNav} showSidebar={false} />;
        if (activeNav === "Reports") return <AdminReports activeNav={activeNav} onNavChange={setActiveNav} showSidebar={false} />;
        if (activeNav === "Reviews") return <AdminReviews activeNav={activeNav} onNavChange={setActiveNav} showSidebar={false} />;

        return (
            <div className="admin-vault-content">
                <div className="ov-header-bar">
                    <div className="ov-welcome-text">
                        <h1 className="ov-title">Platform Intelligence</h1>
                        <p className="ov-subtitle">Real-time performance analytics for Anywear Vault.</p>
                    </div>
                </div>

                <div className="ov-stats-row">
                    <div className="ov-stat-card-premium">
                        <div className="ov-card-inner">
                            <div className="ov-card-head">
                                <div className="ov-icon-box blue"><DollarSign size={20} /></div>
                                <div className="ov-trend-tag up"><ArrowUpRight size={12} /> 12.5%</div>
                            </div>
                            <div className="ov-card-body">
                                <span className="ov-label">TOTAL GROSS REVENUE</span>
                                <h2 className="ov-value">{loading ? '...' : fmtPrice(analytics.totalRevenue)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="ov-stat-card-premium dark">
                        <div className="ov-card-inner">
                            <div className="ov-card-head">
                                <div className="ov-icon-box white"><ShoppingBag size={20} /></div>
                                <div className="ov-trend-tag up"><ArrowUpRight size={12} /> 8.4%</div>
                            </div>
                            <div className="ov-card-body">
                                <span className="ov-label">SETTLED TRANSACTIONS</span>
                                <h2 className="ov-value">{loading ? '...' : allOrders.length}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="ov-stat-card-premium">
                        <div className="ov-card-inner">
                            <div className="ov-card-head">
                                <div className="ov-icon-box green"><Zap size={20} /></div>
                                <div className="ov-trend-tag up"><ArrowUpRight size={12} /> 5.2%</div>
                            </div>
                            <div className="ov-card-body">
                                <span className="ov-label">AVG. ORDER VALUE</span>
                                <h2 className="ov-value">{loading ? '...' : fmtPrice(analytics.avgOrderValue)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="ov-stat-card-premium">
                        <div className="ov-card-inner">
                            <div className="ov-card-head">
                                <div className="ov-icon-box purple"><Briefcase size={20} /></div>
                                <div className="ov-trend-tag up"><ArrowUpRight size={12} /> 2.1%</div>
                            </div>
                            <div className="ov-card-body">
                                <span className="ov-label">ACTIVE PARTNERS</span>
                                <h2 className="ov-value">{loading ? '...' : analytics.supplierCount}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ov-analytics-grid">
                    <div className="ov-chart-container main-revenue">
                        <div className="ov-chart-header">
                            <div>
                                <h3 className="ov-chart-title">Revenue Velocity</h3>
                                <p className="ov-chart-desc">7-day gross volume tracking</p>
                            </div>
                            <Activity size={18} className="ov-chart-icon" />
                        </div>
                        <div className="ov-chart-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={analytics.chartData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#111" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#111" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} tickFormatter={(v) => `LKR ${v/1000}k`} />
                                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                                    <Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="ov-leaders-container side-leaders">
                        <div className="ov-leaders-header">
                            <div>
                                <h3 className="ov-chart-title">Top Suppliers</h3>
                                <p className="ov-chart-desc">Revenue leaderboard</p>
                            </div>
                            <Briefcase size={18} />
                        </div>
                            <div className="ov-supplier-list">
                                {analytics.topSuppliers.map((s, idx) => (
                                    <div key={idx} className="ov-supplier-item">
                                        <div className="sup-avatar">
                                            <Store size={18} />
                                        </div>
                                        <div className="sup-info">
                                            <span className="sup-name">{s.name}</span>
                                            <span className="sup-meta">{s.volume} Units Shipped</span>
                                        </div>
                                        <div className="sup-revenue">
                                            <span className="sup-val">{fmtPrice(s.revenue)}</span>
                                            <span className="sup-label">Revenue</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    </div>
                </div>

                <div className="ov-bottom-grid">
                    <div className="ov-trending-container">
                        <div className="ov-leaders-header">
                            <div>
                                <h3 className="ov-chart-title">Trending Catalog</h3>
                                <p className="ov-chart-desc">Highest movement products</p>
                            </div>
                            <Zap size={18} className="ov-tag-icon" />
                        </div>
                        <div className="ov-trending-list">
                            {analytics.topProducts.map((prod) => (
                                <div key={prod.name} className="ov-trending-item">
                                    <div className="ov-prod-img">
                                        {prod.img ? <img src={prod.img} alt="" /> : <Zap size={16} />}
                                    </div>
                                    <div className="ov-prod-info">
                                        <p className="name">{prod.name}</p>
                                        <p className="meta">{prod.volume} units moved</p>
                                    </div>
                                    <p className="price">{fmtPrice(prod.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ov-intel-container">
                        <div className="ov-intel-inner">
                            <div className="ov-intel-header">
                                <div className="ov-intel-icon"><Zap size={18} /></div>
                                <h3 className="ov-intel-title">Intelligence</h3>
                            </div>
                            <div className="ov-intel-stats">
                                <div className="ov-i-stat">
                                    <span>Average Basket</span>
                                    <h4>{fmtPrice(analytics.avgOrderValue)}</h4>
                                </div>
                                <div className="ov-i-stat">
                                    <span>Active Users</span>
                                    <h4>{loading ? '...' : '1.2k'}</h4>
                                </div>
                            </div>
                            <div className="ov-intel-insight">
                                <p>Platform growth is tracking <strong>14.2%</strong> above forecast for this quarter.</p>
                            </div>
                            <button className="ov-action-btn-black" onClick={() => setActiveNav("Transactions")}>
                                View Ledger Metrics <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`admin-vault-frame ${isSidebarCollapsed ? 'admin-vault--collapsed' : ''}`}>
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.6} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            <AdminSidebar 
                activeNav={activeNav} 
                setActiveNav={setActiveNav} 
                handleLogout={handleLogout} 
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <main className="admin-vault-main">
                <div key={activeNav} className="vault-page-transition">
                    {renderMainContent()}
                </div>
            </main>
        </div>
    );
}