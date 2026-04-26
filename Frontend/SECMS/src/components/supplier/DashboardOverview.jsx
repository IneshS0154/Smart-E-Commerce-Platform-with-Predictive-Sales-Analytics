import { useEffect, useState, useMemo } from 'react';
import { 
  Search, Bell, Mail, MoreHorizontal, 
  TrendingUp, TrendingDown, Filter, Download,
  Package, ShoppingCart, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, CreditCard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import orderAPI from '../../api/orderAPI';
import './DashboardOverview.css';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

const CATEGORIES = [
  { key: 'CASUAL_WEAR', label: 'Casual Wear', short: 'Casual', color: '#111827' },
  { key: 'FORMAL_COLLECTION', label: 'Formal Collection', short: 'Formal', color: '#374151' },
  { key: 'SPORTS_ACTIVE', label: 'Sports & Active', short: 'Sports', color: '#4b5563' },
  { key: 'OUTERWEAR_JACKETS', label: 'Outerwear & Jackets', short: 'Outer', color: '#6b7280' },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening', short: 'Party', color: '#9ca3af' },
];

// ── Data Processing Helpers ─────────────────────────────────────
const getChartData = (orders) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = days.map(day => ({ name: day, sales: 0, orders: 0 }));

  orders.forEach(o => {
    const dateStr = o.order?.createdAt || o.createdAt;
    if (!dateStr) return;
    
    const d = new Date(dateStr);
    const dayName = days[d.getDay()];
    const entry = data.find(x => x.name === dayName);
    if (entry) {
      entry.sales += parseFloat(o.subtotal) || 0;
      entry.orders += o.quantity || 1;
    }
  });

  return data;
};

export default function DashboardOverview({ onNavChange }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('All');
  const [chartMetric, setChartMetric] = useState('All');

  useEffect(() => {
    const stored = localStorage.getItem('seller');
    if (!stored) { setLoading(false); return; }
    const { id } = JSON.parse(stored);
    
    Promise.all([
      fetch(`/api/products/supplier/${id}`).then(r => r.ok ? r.json() : []),
      orderAPI.getSellerOrders(id)
    ]).then(([prodData, ordData]) => {
      setProducts(prodData);
      setOrders(ordData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const m = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o?.subtotal) || 0), 0);
    const uniqueCustomers = new Set(orders.map(o => o?.order?.customer?.id)).size;

    let filteredOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.order?.createdAt || a.createdAt);
      const dateB = new Date(b.order?.createdAt || b.createdAt);
      return dateB - dateA;
    });

    if (orderFilter !== 'All') {
      filteredOrders = filteredOrders.filter(o => (o.status || 'Completed') === orderFilter);
    }
    const recentOrders = filteredOrders.slice(0, 5);

    const productSales = orders.reduce((acc, order) => {
      const pid = order?.product?.id;
      if (!pid) return acc;
      if (!acc[pid]) {
        // Match with full product details to get real-time stock
        const fullProd = products.find(p => p.id === pid);
        acc[pid] = { 
          name: order.product.productName, 
          sales: 0, 
          img: order.product.mainImagePath,
          stock: fullProd?.stocks?.reduce((s, st) => s + st.stockCount, 0) || 0
        };
      }
      acc[pid].sales += order.quantity || 1;
      return acc;
    }, {});
    const topSelling = Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5);
    const chartData = getChartData(orders);

    return {
      totalProducts, totalOrders, totalRevenue, uniqueCustomers,
      recentOrders, topSelling, chartData
    };
  }, [products, orders, orderFilter]);

  if (loading) return <div className="do-sync"><div className="loader" /></div>;

  return (
    <div className="do-container">
      <header className="do-header">
        <div>
          <h1 className="do-title">Business Overview</h1>
          <p className="do-subtitle">Real-time performance metrics and sales analysis</p>
        </div>
        <div className="do-actions">
           <button className="do-btn do-btn--outline" onClick={() => onNavChange('Orders')}>View All Orders</button>
           <button className="do-btn do-btn--primary"><Download size={16} /> Export Report</button>
        </div>
      </header>

      {/* ── KPI Grid ── */}
      <div className="do-kpi-grid">
        <div className="do-kpi-card">
          <div className="do-kpi-header">
            <div className="do-kpi-icon"><Activity size={20} /></div>
            <div className="do-kpi-trend up"><ArrowUpRight size={14} /> 12.5%</div>
          </div>
          <div className="do-kpi-content">
            <span className="do-kpi-label">Total Revenue</span>
            <h2 className="do-kpi-value">{fmtPrice(m.totalRevenue)}</h2>
          </div>
        </div>

        <div className="do-kpi-card">
          <div className="do-kpi-header">
            <div className="do-kpi-icon"><Users size={20} /></div>
            <div className="do-kpi-trend down"><ArrowDownRight size={14} /> 3.2%</div>
          </div>
          <div className="do-kpi-content">
            <span className="do-kpi-label">Active Customers</span>
            <h2 className="do-kpi-value">{m.uniqueCustomers.toLocaleString()}</h2>
          </div>
        </div>

        <div className="do-kpi-card">
          <div className="do-kpi-header">
            <div className="do-kpi-icon"><CreditCard size={20} /></div>
            <div className="do-kpi-trend up"><ArrowUpRight size={14} /> 8.1%</div>
          </div>
          <div className="do-kpi-content">
            <span className="do-kpi-label">Total Transactions</span>
            <h2 className="do-kpi-value">{m.totalOrders.toLocaleString()}</h2>
          </div>
        </div>

        <div className="do-kpi-card">
          <div className="do-kpi-header">
            <div className="do-kpi-icon"><Package size={20} /></div>
            <div className="do-kpi-trend up"><ArrowUpRight size={14} /> 15%</div>
          </div>
          <div className="do-kpi-content">
            <span className="do-kpi-label">Live Products</span>
            <h2 className="do-kpi-value">{m.totalProducts.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* ── Main Chart Section ── */}
      <div className="do-chart-card">
        <div className="do-card-header">
          <h3 className="do-card-title">Sales Performance</h3>
          <div className="do-card-actions">
            <select className="do-select" value={chartMetric} onChange={e => setChartMetric(e.target.value)}>
              <option value="All">All Metrics</option>
              <option value="Sales">Revenue Only</option>
              <option value="Purchase">Volume Only</option>
            </select>
          </div>
        </div>
        <div className="do-chart-body">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={m.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `LKR ${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e4e9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                formatter={(val, name) => [name === 'sales' ? fmtPrice(val) : val, name === 'sales' ? 'Revenue' : 'Orders']}
              />
              {(chartMetric === 'All' || chartMetric === 'Sales') && (
                <Area type="monotone" dataKey="sales" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
              )}
              {(chartMetric === 'All' || chartMetric === 'Purchase') && (
                <Area type="monotone" dataKey="orders" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="do-bottom-grid">
        <div className="do-table-card">
          <div className="do-card-header">
            <h3 className="do-card-title">Recent Activity</h3>
            <button className="do-btn-text" onClick={() => onNavChange('Orders')}>View All &rarr;</button>
          </div>
          <div className="do-table-wrapper">
            <table className="do-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {m.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div className="do-order-info">
                        <span className="do-order-id">#ORD-{order.id.toString().slice(-6)}</span>
                        <span className="do-order-prod">{order.product?.productName}</span>
                      </div>
                    </td>
                    <td className="do-date">{new Date(order.order?.createdAt || order.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="do-amount">{fmtPrice(order.subtotal)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`do-badge do-badge--${order.status?.toLowerCase() || 'completed'}`}>
                        {order.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="do-top-products">
          <div className="do-card-header">
            <h3 className="do-card-title">Top Performing</h3>
          </div>
          <div className="do-product-list">
            {m.topSelling.map((p, i) => (
              <div key={i} className="do-product-item">
                <div className="do-prod-rank">0{i+1}</div>
                <img src={p.img} alt="" className="do-prod-thumb" />
                <div className="do-prod-details">
                  <span className="do-prod-name">{p.name}</span>
                  <span className="do-prod-meta">{p.stock} units in stock</span>
                </div>
                <div className="do-prod-sales">
                  <span className="val">{p.sales}</span>
                  <span className="label">Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
