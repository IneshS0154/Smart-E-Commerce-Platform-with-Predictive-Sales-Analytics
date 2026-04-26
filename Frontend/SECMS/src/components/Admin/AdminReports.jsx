import { useState, useEffect, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    Download, TrendingUp, TrendingDown, Users, 
    Briefcase, Package, ShoppingCart, Filter,
    ChevronRight, AlertCircle, CheckCircle2, Zap
} from 'lucide-react';
import orderAPI from '../../api/orderAPI';
import customerAPI from '../../api/customerAPI';
import sellerAPI from '../../api/sellerAPI';
import { exportToCSV } from '../../utils/exportUtils';
import AdminSidebar from './AdminSidebar';
import './AdminReports.css';
import DarkVeil from '../ui/DarkVeil';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR 0.00';
const COLORS = ['#111111', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminReports({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Reports");
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await orderAPI.getAllOrders();
                setAllOrders(data || []);
            } catch (err) {
                console.error('Error fetching report data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Export Handlers ──
    const handleExportUsers = async () => {
        try {
            const users = await customerAPI.getAllCustomers();
            const data = users.map(u => ({
                ID: u.id,
                FirstName: u.firstName,
                LastName: u.lastName,
                Username: u.username,
                Email: u.email,
                Phone: u.phoneNumber,
                Status: u.status,
                JoinedDate: new Date(u.createdAt).toLocaleDateString()
            }));
            exportToCSV(data, 'Anywear_Users_Report');
        } catch (err) {
            alert('Failed to export users data');
        }
    };

    const handleExportSuppliers = async () => {
        try {
            const sellers = await sellerAPI.getAllSellers();
            const data = sellers.map(s => ({
                ID: s.id,
                StoreName: s.storeName,
                Owner: `${s.firstName} ${s.lastName}`,
                Email: s.email,
                Phone: s.phoneNumber,
                Status: s.status,
                JoinedDate: new Date(s.createdAt).toLocaleDateString()
            }));
            exportToCSV(data, 'Anywear_Suppliers_Report');
        } catch (err) {
            alert('Failed to export suppliers data');
        }
    };

    const handleExportFullLedger = () => {
        const data = allOrders.map(o => ({
            TransactionID: o.transactionId,
            Date: new Date(o.createdAt).toLocaleString(),
            Customer: `${o.customer?.firstName} ${o.customer?.lastName}`,
            CustomerEmail: o.customer?.email,
            TotalAmount: o.totalAmount,
            Discount: o.discountAmount,
            FinalAmount: o.finalAmount,
            PaymentMethod: `${o.cardType} ****${o.cardLastFour}`,
            ItemsCount: o.orderItems?.length || 0,
            Status: "COMPLETED"
        }));
        exportToCSV(data, 'Anywear_Full_Sales_Ledger');
    };

    // ── Analytics Logic ──
    const analytics = useMemo(() => {
        let sellerMap = {};
        let categoryMap = {};
        let productMap = {};
        let totalRevenue = 0;

        allOrders.forEach(o => {
            totalRevenue += (parseFloat(o.finalAmount) || 0);
            o.orderItems?.forEach(item => {
                const sellerId = item.product?.seller?.id || 'Unknown';
                const sellerName = item.product?.seller?.storeName || 'Unknown Seller';
                const cat = item.product?.category || 'Uncategorized';
                const prodId = item.product?.id;
                const prodName = item.product?.productName;
                const subtotal = parseFloat(item.subtotal) || 0;
                const qty = parseInt(item.quantity) || 0;

                if (!sellerMap[sellerId]) sellerMap[sellerId] = { name: sellerName, revenue: 0, sales: 0, products: new Set() };
                sellerMap[sellerId].revenue += subtotal;
                sellerMap[sellerId].sales += qty;
                sellerMap[sellerId].products.add(prodId);

                categoryMap[cat] = (categoryMap[cat] || 0) + subtotal;

                if (!productMap[prodId]) productMap[prodId] = { name: prodName, revenue: 0, sales: 0, img: item.product?.mainImagePath };
                productMap[prodId].revenue += subtotal;
                productMap[prodId].sales += qty;
            });
        });

        const sellers = Object.values(sellerMap).sort((a, b) => b.revenue - a.revenue);
        const topSellers = sellers.slice(0, 5);
        const worstSellers = sellers.slice(-3).reverse();
        const topProducts = Object.values(productMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
        const categoryData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

        return { topSellers, worstSellers, categoryData, topProducts, totalRevenue };
    }, [allOrders]);

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.location.href = "/";
    };

    const renderContent = () => (
        <div className="admin-vault-content">
            <header className="rpt-header">
                <div>
                    <h1 className="rpt-title">Platform Intelligence</h1>
                    <p className="rpt-subtitle">Executive decision support dashboard for Anywear Vault operations.</p>
                </div>
                <div className="rpt-export-suite">
                    <button className="rpt-export-btn" onClick={handleExportUsers}><Download size={14} /> Users</button>
                    <button className="rpt-export-btn" onClick={handleExportSuppliers}><Download size={14} /> Suppliers</button>
                    <button className="rpt-export-btn primary" onClick={handleExportFullLedger}><Download size={14} /> Full Ledger</button>
                </div>
            </header>

            {/* ── Metric Highlights ── */}
            <div className="rpt-metrics-grid">
                <div className="rpt-metric-card">
                    <div className="inner">
                        <span className="label">TOP CATEGORY</span>
                        <h2 className="value">{analytics.categoryData[0]?.name || 'N/A'}</h2>
                        <div className="trend up"><TrendingUp size={12} /> Leading Market</div>
                    </div>
                </div>
                <div className="rpt-metric-card highlight">
                    <div className="inner">
                        <span className="label">REVENUE LEADER</span>
                        <h2 className="value">{analytics.topSellers[0]?.name || 'N/A'}</h2>
                        <div className="trend"><Zap size={12} /> Top Performer</div>
                    </div>
                </div>
                <div className="rpt-metric-card warning">
                    <div className="inner">
                        <span className="label">UNDERPERFORMING</span>
                        <h2 className="value">{analytics.worstSellers.length} SELLERS</h2>
                        <div className="trend down"><TrendingDown size={12} /> Needs Attention</div>
                    </div>
                </div>
                <div className="rpt-metric-card">
                    <div className="inner">
                        <span className="label">TOTAL EQUITY</span>
                        <h2 className="value">{fmtPrice(analytics.totalRevenue)}</h2>
                        <div className="trend up"><CheckCircle2 size={12} /> Sync Healthy</div>
                    </div>
                </div>
            </div>

            {/* ── Charts Section ── */}
            <div className="rpt-charts-row">
                <div className="rpt-chart-container main-chart">
                    <div className="chart-header">
                        <h3 className="chart-title">Seller Revenue Leaderboard</h3>
                        <p className="chart-subtitle">Gross volume performance across top 5 partners</p>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.topSellers}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#999'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#999'}} tickFormatter={(v) => `LKR ${v/1000}k`} />
                                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                                <Bar dataKey="revenue" fill="#111" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rpt-chart-container side-chart">
                    <div className="chart-header">
                        <h3 className="chart-title">Category Distribution</h3>
                        <p className="chart-subtitle">Market share by product category</p>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.categoryData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Decision Data Tables ── */}
            <div className="rpt-tables-row">
                <div className="rpt-table-box">
                    <div className="box-header">
                        <h3 className="box-title">Underperforming Partners</h3>
                        <p className="box-subtitle">Sellers with the lowest revenue volume</p>
                    </div>
                    <div className="box-body">
                        {analytics.worstSellers.map((s, idx) => (
                            <div key={idx} className="rpt-row-item warning">
                                <div className="info">
                                    <p className="name">{s.name}</p>
                                    <p className="meta">{s.sales} sales total</p>
                                </div>
                                <div className="value">
                                    <p className="price">{fmtPrice(s.revenue)}</p>
                                    <span className="badge">REVIEW NEEDED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rpt-table-box">
                    <div className="box-header">
                        <h3 className="box-title">Top Moving Products</h3>
                        <p className="box-subtitle">Highest volume product sales</p>
                    </div>
                    <div className="box-body">
                        {analytics.topProducts.map((p, idx) => (
                            <div key={idx} className="rpt-row-item">
                                <div className="prod-img">
                                    {p.img ? <img src={p.img} alt="" /> : <Package size={16} />}
                                </div>
                                <div className="info">
                                    <p className="name">{p.name}</p>
                                    <p className="meta">{p.sales} units moved</p>
                                </div>
                                <div className="value">
                                    <p className="price">{fmtPrice(p.revenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (!showSidebar) return renderContent();

    return (
        <div className="admin-reports-dashboard">
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.6} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            <AdminSidebar activeNav={activeNav} setActiveNav={handleNavClick} handleLogout={handleLogout} />
            <main className="admin-reports-main">
                {renderContent()}
            </main>
        </div>
    );
}
