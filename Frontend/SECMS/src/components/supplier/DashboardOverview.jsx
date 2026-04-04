import { useEffect, useState, useMemo } from 'react';
import orderAPI from '../../api/orderAPI';
import './DashboardOverview.css';

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Rs. 0.00';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const CATEGORIES = [
  { key: 'CASUAL_WEAR', label: 'Casual Wear', short: 'Casual', color: '#1e293b' },
  { key: 'FORMAL_COLLECTION', label: 'Formal Collection', short: 'Formal', color: '#4f5f77' },
  { key: 'SPORTS_ACTIVE', label: 'Sports & Active', short: 'Sports', color: '#64748b' },
  { key: 'OUTERWEAR_JACKETS', label: 'Outerwear & Jackets', short: 'Outer', color: '#94a3b8' },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening', short: 'Party', color: '#c3cfe0' },
];

const catMeta = key => CATEGORIES.find(c => c.key === key) || { label: key, color: '#aaa' };

// ── SVG Donut Chart ──────────────────────────────────────────────
function DonutChart({ data }) {
  const SIZE = 168, SW = 22;
  const r = (SIZE - SW) / 2;
  const cx = SIZE / 2, cy = SIZE / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);

  let angle = -90; // start from 12 o'clock
  const segments = total > 0
    ? data.filter(d => d.value > 0).map(d => {
      const pct = d.value / total;
      const dashLen = pct * C;
      const rot = angle;
      angle += pct * 360;
      return { ...d, dashLen, rot };
    })
    : [];

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="do-donut-svg">
      {/* grey track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={SW} />

      {/* coloured segments */}
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={SW}
          strokeDasharray={`${seg.dashLen} ${C - seg.dashLen}`}
          strokeDashoffset={0}
          style={{
            transform: `rotate(${seg.rot}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'stroke-dasharray 0.5s ease',
          }}
        />
      ))}

      {/* centre label */}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize="28" fontWeight="700"
        fill="#1a1a1a" fontFamily="Grift, sans-serif">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9"
        fill="#aaa" fontFamily="NORD, sans-serif" letterSpacing="1.2">PRODUCTS</text>
    </svg>
  );
}

// ── Multi-segment horizontal bar ─────────────────────────────────
function HealthBar({ okEntries, lowEntries, outEntries }) {
  const total = okEntries + lowEntries + outEntries;
  if (total === 0) return <div className="do-hbar do-hbar--empty" />;
  return (
    <div className="do-hbar">
      {okEntries > 0 && <div className="do-hbar__seg do-hbar__seg--ok" style={{ width: `${(okEntries / total) * 100}%` }} />}
      {lowEntries > 0 && <div className="do-hbar__seg do-hbar__seg--low" style={{ width: `${(lowEntries / total) * 100}%` }} />}
      {outEntries > 0 && <div className="do-hbar__seg do-hbar__seg--out" style={{ width: `${(outEntries / total) * 100}%` }} />}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DashboardOverview() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('seller');
    if (!stored) { setLoading(false); setOrdersLoading(false); return; }
    const { id } = JSON.parse(stored);
    
    // Fetch products
    fetch(`/api/products/supplier/${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
    
    // Fetch orders for this supplier
    orderAPI.getSellerOrders(id)
      .then(data => { setOrders(data || []); setOrdersLoading(false); })
      .catch(() => setOrdersLoading(false));
  }, []);

  // ── Computed metrics ─────────────────────────────────────────
  const m = useMemo(() => {
    const totalProducts = products.length;

    // Aggregate all stock entries
    const allEntries = products.flatMap(p => p.stocks || []);
    const totalUnits = allEntries.reduce((s, e) => s + e.stockCount, 0);

    // Per-product health
    const outOfStockProds = products.filter(p =>
      p.stocks?.length > 0 && p.stocks.every(s => s.stockCount === 0)
    ).length;
    const lowStockProds = products.filter(p =>
      p.stocks?.some(s => s.stockCount > 0 && s.stockCount <= 5)
    ).length;

    // Category breakdown
    const categoryData = CATEGORIES.map(cat => {
      const prods = products.filter(p => p.category === cat.key);
      const entries = prods.flatMap(p => p.stocks || []);
      return {
        ...cat,
        count: prods.length,
        totalUnits: entries.reduce((s, e) => s + e.stockCount, 0),
        okEntries: entries.filter(e => e.stockCount > 5).length,
        lowEntries: entries.filter(e => e.stockCount > 0 && e.stockCount <= 5).length,
        outEntries: entries.filter(e => e.stockCount === 0).length,
      };
    }).filter(c => c.count > 0);

    // Size distribution
    const sizeData = SIZES.map(size => ({
      size,
      total: products.reduce((sum, p) => {
        const e = p.stocks?.find(s => s.size === size);
        return sum + (e ? e.stockCount : 0);
      }, 0),
    }));
    const maxSizeUnits = Math.max(...sizeData.map(s => s.total), 1);

    // Alert products — sorted: out first, then by total stock ascending
    const alertProds = products
      .map(p => {
        const entries = p.stocks || [];
        const total = entries.reduce((s, e) => s + e.stockCount, 0);
        const isOut = entries.length > 0 && entries.every(e => e.stockCount === 0);
        const isLow = !isOut && entries.some(e => e.stockCount > 0 && e.stockCount <= 5);
        return { ...p, stockTotal: total, isOut, isLow };
      })
      .filter(p => p.isOut || p.isLow)
      .sort((a, b) => (b.isOut - a.isOut) || (a.stockTotal - b.stockTotal))
      .slice(0, 7);

    // Gender
    const menCount = products.filter(p => p.gender === 'MALE').length;
    const womenCount = products.filter(p => p.gender === 'FEMALE').length;

    // Order statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o?.subtotal) || 0), 0);
    const totalUnitsSold = orders.reduce((sum, o) => sum + (o?.quantity || 0), 0);
    const uniqueCustomers = new Set(orders.map(o => o?.order?.customer?.id)).size;

    return {
      totalProducts, totalUnits, outOfStockProds, lowStockProds,
      categoryData, sizeData, maxSizeUnits, alertProds, menCount, womenCount,
      totalOrders, totalRevenue, totalUnitsSold, uniqueCustomers
    };
  }, [products, orders]);

  if (loading) {
    return (
      <div className="do-loading">
        <div className="do-loading__ring" />
        <span>Loading your dashboard…</span>
      </div>
    );
  }

  return (
    <div className="do">

      {/* ── Page heading ── */}
      <div className="do-heading">
        <div>
          <h2 className="do-heading__title">Inventoy & Performance Overview</h2>
          <p className="do-heading__sub">Live data from your product catalogue · {m.totalProducts} products tracked</p>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="do-kpis">
        <div className="do-kpi">
          <div className="do-kpi__val">{m.totalProducts}</div>
          <div className="do-kpi__label">Total Products</div>
          <div className="do-kpi__hint">Across all categories</div>
        </div>
        <div className="do-kpi">
          <div className="do-kpi__val">{m.totalUnits.toLocaleString()}</div>
          <div className="do-kpi__label">Units in Stock</div>
          <div className="do-kpi__hint">All sizes combined</div>
        </div>
        <div className={`do-kpi ${m.outOfStockProds > 0 ? 'do-kpi--danger' : ''}`}>
          <div className="do-kpi__val">{m.outOfStockProds}</div>
          <div className="do-kpi__label">Out of Stock</div>
          <div className="do-kpi__hint">{m.outOfStockProds > 0 ? 'Needs restocking' : 'Everything stocked'}</div>
        </div>
        <div className={`do-kpi ${m.lowStockProds > 0 ? 'do-kpi--warn' : ''}`}>
          <div className="do-kpi__icon">{m.lowStockProds > 0 ? 'Warning' : 'Good'}</div>
          <div className="do-kpi__val">{m.lowStockProds}</div>
          <div className="do-kpi__label">Low Stock Alerts</div>
          <div className="do-kpi__hint">≤ 5 units in some sizes</div>
        </div>
        <div className="do-kpi">
          <div className="do-kpi__val">{m.categoryData.length}</div>
          <div className="do-kpi__label">Active Categories</div>
          <div className="do-kpi__hint">of 5 total</div>
        </div>
      </div>

      {/* ── Order Statistics ── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Sales Performance</h3>
        <div className="do-kpis">
          <div className="do-kpi">
            <div className="do-kpi__val">{ordersLoading ? '...' : m.totalOrders}</div>
            <div className="do-kpi__label">Total Orders</div>
            <div className="do-kpi__hint">From your products</div>
          </div>
          <div className="do-kpi">
            <div className="do-kpi__val">{ordersLoading ? '...' : fmtPrice(m.totalRevenue)}</div>
            <div className="do-kpi__label">Total Revenue</div>
            <div className="do-kpi__hint">From your sales</div>
          </div>
          <div className="do-kpi">
            <div className="do-kpi__val">{ordersLoading ? '...' : m.totalUnitsSold}</div>
            <div className="do-kpi__label">Units Sold</div>
            <div className="do-kpi__hint">Total quantity</div>
          </div>
          <div className="do-kpi">
            <div className="do-kpi__val">{ordersLoading ? '...' : m.uniqueCustomers}</div>
            <div className="do-kpi__label">Unique Customers</div>
            <div className="do-kpi__hint">Who bought your products</div>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="do-charts">

        {/* Donut — Category Breakdown */}
        <div className="do-card">
          <h3 className="do-card__title">Category Breakdown</h3>
          {m.categoryData.length === 0 ? (
            <p className="do-empty">No products added yet</p>
          ) : (
            <div className="do-donut-wrap">
              <DonutChart data={m.categoryData.map(c => ({ label: c.label, value: c.count, color: c.color }))} />
              <div className="do-donut-legend">
                {m.categoryData.map(cat => (
                  <div key={cat.key} className="do-legend-row">
                    <span className="do-legend-dot" style={{ background: cat.color }} />
                    <span className="do-legend-label">{cat.short}</span>
                    <div className="do-legend-bar-wrap">
                      <div className="do-legend-bar" style={{
                        width: `${m.totalProducts > 0 ? (cat.count / m.totalProducts) * 100 : 0}%`,
                        background: cat.color,
                      }} />
                    </div>
                    <span className="do-legend-count">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stock health per category */}
        <div className="do-card">
          <h3 className="do-card__title">Stock Health by Category</h3>
          <div className="do-hbar-legend">
            <span><span className="do-dot do-dot--ok" />Healthy (&gt;5)</span>
            <span><span className="do-dot do-dot--low" />Low (1–5)</span>
            <span><span className="do-dot do-dot--out" />Out (0)</span>
          </div>
          {m.categoryData.length === 0 ? (
            <p className="do-empty">No products added yet</p>
          ) : (
            <div className="do-health-list">
              {m.categoryData.map(cat => (
                <div key={cat.key} className="do-health-row">
                  <span className="do-health-name">{cat.short}</span>
                  <HealthBar
                    okEntries={cat.okEntries}
                    lowEntries={cat.lowEntries}
                    outEntries={cat.outEntries}
                  />
                  <div className="do-health-meta">
                    <span className="do-health-units">{cat.totalUnits}</span>
                    {cat.outEntries > 0 &&
                      <span className="do-health-out">{cat.outEntries} out</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Size distribution chart */}
        <div className="do-card">
          <h3 className="do-card__title">Stock by Size</h3>
          <p className="do-card__sub">Total units across all products per size</p>
          {m.sizeData.every(s => s.total === 0) ? (
            <p className="do-empty">No stock data</p>
          ) : (
            <div className="do-sizes">
              {m.sizeData.map(sd => {
                const pct = (sd.total / m.maxSizeUnits) * 100;
                const cls = sd.total === 0 ? 'do-sz-bar--out'
                  : sd.total <= 10 ? 'do-sz-bar--low'
                    : 'do-sz-bar--ok';
                return (
                  <div key={sd.size} className="do-sz-col">
                    <span className="do-sz-num">{sd.total}</span>
                    <div className="do-sz-bar-wrap">
                      <div className={`do-sz-bar ${cls}`} style={{ height: `${pct}%` }} />
                    </div>
                    <span className="do-sz-label">{sd.size}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Alerts + Gender row ── */}
      <div className="do-secondary">

        {/* Stock alerts */}
        <div className="do-card do-card--wide">
          <div className="do-alerts-header">
            <h3 className="do-card__title">
              Stock Alerts
              {m.alertProds.length > 0 &&
                <span className="do-alert-count">{m.alertProds.length}</span>
              }
            </h3>
          </div>
          {m.alertProds.length === 0 ? (
            <div className="do-all-good">
              <span className="do-all-good__check">✓</span>
              <div>
                <strong>All products are well stocked</strong>
                <p>No immediate restocking needed</p>
              </div>
            </div>
          ) : (
            <div className="do-alert-list">
              {m.alertProds.map(p => (
                <div key={p.id} className="do-alert-row">
                  <div className="do-alert-info">
                    <span className="do-alert-name">{p.productName}</span>
                    <span className="do-alert-cat"
                      style={{ background: catMeta(p.category).color + '22', color: catMeta(p.category).color }}>
                      {catMeta(p.category).short}
                    </span>
                    <span className="do-alert-gender">{p.gender === 'MALE' ? 'Men' : 'Women'}</span>
                  </div>
                  <div className="do-alert-right">
                    <span className={`do-alert-badge ${p.isOut ? 'do-alert-badge--out' : 'do-alert-badge--low'}`}>
                      {p.isOut ? 'Out of Stock' : `Low · ${p.stockTotal} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gender split */}
        <div className="do-card">
          <h3 className="do-card__title">Portfolio Split</h3>
          <div className="do-gender">
            <div className="do-gender-track">
              <div className="do-gender-fill do-gender-fill--men"
                style={{ width: `${m.totalProducts > 0 ? (m.menCount / m.totalProducts) * 100 : 50}%` }}
              />
              <div className="do-gender-fill do-gender-fill--women"
                style={{ width: `${m.totalProducts > 0 ? (m.womenCount / m.totalProducts) * 100 : 50}%` }}
              />
            </div>
            <div className="do-gender-labels">
              <div className="do-gender-item">
                <span className="do-gender-dot do-gender-dot--men" />
                <div>
                  <span className="do-gender-name">Men</span>
                  <span className="do-gender-pct">
                    {m.totalProducts > 0 ? Math.round((m.menCount / m.totalProducts) * 100) : 0}%
                  </span>
                </div>
                <span className="do-gender-num">{m.menCount}</span>
              </div>
              <div className="do-gender-item">
                <span className="do-gender-dot do-gender-dot--women" />
                <div>
                  <span className="do-gender-name">Women</span>
                  <span className="do-gender-pct">
                    {m.totalProducts > 0 ? Math.round((m.womenCount / m.totalProducts) * 100) : 0}%
                  </span>
                </div>
                <span className="do-gender-num">{m.womenCount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Purchase Orders (placeholder) ── */}
      <div className="do-card do-card--orders">
        <div className="do-orders-head">
          <div>
            <h3 className="do-card__title">Recent Purchase Orders</h3>
            <p className="do-card__sub">Order management module — coming soon</p>
          </div>
          <span className="do-coming-badge">Coming Soon</span>
        </div>

        <table className="do-table">
          <thead>
            <tr>
              <th>PO ID</th>
              <th>Retailer</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Items</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="do-table__mono">#PO-7842</td>
              <td>Urban Streetwear</td>
              <td>02 Mar 2026</td>
              <td>09 Mar 2026</td>
              <td>42</td>
              <td>LKR 185,900</td>
              <td><span className="do-status do-status--transit">In Transit</span></td>
            </tr>
            <tr>
              <td className="do-table__mono">#PO-7839</td>
              <td>Metro Fashion</td>
              <td>01 Mar 2026</td>
              <td>06 Mar 2026</td>
              <td>27</td>
              <td>LKR 92,450</td>
              <td><span className="do-status do-status--packed">Packed</span></td>
            </tr>
            <tr>
              <td className="do-table__mono">#PO-7833</td>
              <td>Anywear Flagship</td>
              <td>28 Feb 2026</td>
              <td>03 Mar 2026</td>
              <td>35</td>
              <td>LKR 124,300</td>
              <td><span className="do-status do-status--delivered">Delivered</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
