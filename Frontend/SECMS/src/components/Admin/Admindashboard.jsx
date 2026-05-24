import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import './Admindashboard.css';
import Supplierdashboard from './Supplierdashboard';

/* ── Tiny SVG icons ────────────────────────────────────────── */
const Icon = {
    menu: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    overview: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    users: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    suppliers: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    transactions: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    reports: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    reviews: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    signout: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    dollar: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    check: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    cart: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    partners: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    spark: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    trophy: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="8 21 12 21 16 21" /><line x1="12" y1="17" x2="12" y2="21" />
            <path d="M5 3H3v6a9 9 0 0 0 18 0V3h-2" /><path d="M21 3H3" />
        </svg>
    ),
    tag: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    intel: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    arrow: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    supplier_icon: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
};

/* ── Sidebar nav config ────────────────────────────────────── */
const NAV = [
    { section: "MAIN", items: [{ id: "Overview", icon: "overview" }] },
    {
        section: "MANAGEMENT", items: [
            { id: "Users", icon: "users" },
            { id: "Suppliers", icon: "suppliers" },
        ]
    },
    {
        section: "STORE", items: [
            { id: "Transactions", icon: "transactions" },
            { id: "Reports", icon: "reports" },
            { id: "Reviews", icon: "reviews" },
        ]
    },
];

/* ── Mini SVG line chart ───────────────────────────────────── */
function RevenueChart() {
    const points = [
        { x: 0, y: 90 }, { x: 16, y: 88 }, { x: 30, y: 85 },
        { x: 50, y: 80 }, { x: 70, y: 70 }, { x: 90, y: 55 },
        { x: 110, y: 42 }, { x: 130, y: 35 }, { x: 150, y: 20 },
        { x: 170, y: 15 }, { x: 185, y: 8 }, { x: 200, y: 5 },
    ];
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const fillD = `${pathD} L200,100 L0,100 Z`;

    return (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="ad-chart-svg">
            <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill="url(#chartFill)" />
            <path d={pathD} fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Product avatar placeholder ────────────────────────────── */
function ProductAvatar({ name, color }) {
    return (
        <div className="ad-prod-avatar" style={{ background: color }}>
            {name[0]}
        </div>
    );
}

const PRODUCTS = [
    { name: "Man High Neck Fitted Top", units: "3 units moved", price: "LKR 15,000.00", color: "#e8e0d5" },
    { name: "Sculpt Bodysuit", units: "2 units moved", price: "LKR 19,998.00", color: "#d5dfe8" },
    { name: "Unchained Tee", units: "2 units moved", price: "LKR 6,378.00", color: "#dde8d5" },
    { name: "Fusion Basketball Tank", units: "2 units moved", price: "LKR 9,998.00", color: "#e8d5d5" },
];

const SUPPLIERS = [
    { name: "Venom", sub: "15 Units, 75tpcs", revenue: "LKR 62,884.00", badge: "WINNER", badgeClass: "ad-badge--winner" },
    { name: "Atairu", sub: "4 units shipped", revenue: "LKR 27,993.00", badge: "1ST PLACE", badgeClass: "ad-badge--first" },
];

/* ── Main Component ────────────────────────────────────────── */
export default function AdminOverview() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("Overview");

    const admin = JSON.parse(localStorage.getItem("admin") || "{}") || {};
    const adminUsername = admin?.username || admin?.name || "admin";

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("seller");
        localStorage.removeItem("rememberSellerLogin");
        navigate("/");
    };

    return (
        <div className="ad-layout">
            {/* ── Sidebar ── */}
            <aside className="ad-sidebar">
                {/* Brand */}
                <div className="ad-brand">
                    <button className="ad-menu-btn"><Icon.menu /></button>
                    <span className="ad-brand-name">ANYWEAR</span>
                </div>

                {/* Nav sections */}
                <div className="ad-nav-scroll">
                    {NAV.map(section => (
                        <div key={section.section} className="ad-nav-section">
                            <p className="ad-nav-section-label">{section.section}</p>
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    className={`ad-nav-item ${activeNav === item.id ? "ad-nav-item--active" : ""}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className="ad-nav-icon">{Icon[item.icon]()}</span>
                                    <span>{item.id}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer — user + sign out */}
                <div className="ad-sidebar-footer">
                    <div className="ad-user-row">
                        <div className="ad-user-avatar">{adminUsername[0]?.toUpperCase()}</div>
                        <div className="ad-user-info">
                            <span className="ad-user-name">{adminUsername}</span>
                            <span className="ad-user-role">admin</span>
                        </div>
                    </div>
                    <button className="ad-signout-btn" onClick={handleLogout}>
                        <Icon.signout />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="ad-main">
                {activeNav === "Suppliers" ? (
                    <Supplierdashboard activeNav={activeNav} onNavChange={setActiveNav} />
                ) : (
                    <>
                        {/* Page header */}
                        <div className="ad-page-header">
                            <h1 className="ad-page-title">Platform Intelligence</h1>
                            <p className="ad-page-subtitle">Real-time performance analytics for Anywear Vault.</p>
                        </div>

                        {/* ── Stat Cards ── */}
                        <div className="ad-stats-row">
                            {/* Card 1 — Total Gross Revenue */}
                            <div className="ad-stat-card">
                                <div className="ad-stat-top">
                                    <div className="ad-stat-icon ad-stat-icon--green"><Icon.dollar /></div>
                                    <span className="ad-stat-badge ad-stat-badge--green">+13%</span>
                                </div>
                                <p className="ad-stat-label">TOTAL GROSS REVENUE</p>
                                <p className="ad-stat-value">LKR 88,884.40</p>
                            </div>

                            {/* Card 2 — Settled Transactions (dark) */}
                            <div className="ad-stat-card ad-stat-card--dark">
                                <div className="ad-stat-top">
                                    <div className="ad-stat-icon ad-stat-icon--dark-inner"><Icon.check /></div>
                                    <span className="ad-stat-badge ad-stat-badge--dark">+RANK</span>
                                </div>
                                <p className="ad-stat-label">SETTLED TRANSACTIONS</p>
                                <p className="ad-stat-value">8</p>
                            </div>

                            {/* Card 3 — Avg Order Value */}
                            <div className="ad-stat-card">
                                <div className="ad-stat-top">
                                    <div className="ad-stat-icon ad-stat-icon--orange"><Icon.cart /></div>
                                    <span className="ad-stat-badge ad-stat-badge--green">+5.2%</span>
                                </div>
                                <p className="ad-stat-label">AVG. ORDER VALUE</p>
                                <p className="ad-stat-value">LKR 11,110.55</p>
                            </div>

                            {/* Card 4 — Active Partners */}
                            <div className="ad-stat-card">
                                <div className="ad-stat-top">
                                    <div className="ad-stat-icon ad-stat-icon--purple"><Icon.partners /></div>
                                    <span className="ad-stat-badge ad-stat-badge--purple">+2.1%</span>
                                </div>
                                <p className="ad-stat-label">ACTIVE PARTNERS</p>
                                <p className="ad-stat-value">2</p>
                            </div>
                        </div>

                        {/* ── Middle Row: Revenue Chart + Top Suppliers ── */}
                        <div className="ad-mid-row">
                            {/* Revenue Velocity Chart */}
                            <div className="ad-card ad-chart-card">
                                <div className="ad-card-header">
                                    <div>
                                        <p className="ad-card-title">Revenue Velocity</p>
                                        <p className="ad-card-subtitle">7-day gross volume tracking</p>
                                    </div>
                                    <button className="ad-card-icon-btn"><Icon.spark /></button>
                                </div>

                                {/* Y-axis labels + chart */}
                                <div className="ad-chart-wrap">
                                    <div className="ad-chart-ylabels">
                                        <span>LKR 100</span>
                                        <span>LKR 50</span>
                                        <span>LKR 0</span>
                                    </div>
                                    <div className="ad-chart-area">
                                        <RevenueChart />
                                    </div>
                                </div>

                                {/* X-axis labels */}
                                <div className="ad-chart-xlabels">
                                    <span>May 6</span>
                                    <span>Apr 7</span>
                                    <span>Nov 21</span>
                                </div>
                            </div>

                            {/* Top Suppliers */}
                            <div className="ad-card ad-suppliers-card">
                                <div className="ad-card-header">
                                    <div>
                                        <p className="ad-card-title">Top Suppliers</p>
                                        <p className="ad-card-subtitle">Revenue leaderboard</p>
                                    </div>
                                    <button className="ad-card-icon-btn"><Icon.trophy /></button>
                                </div>

                                <div className="ad-supplier-list">
                                    {SUPPLIERS.map((s, i) => (
                                        <div key={s.name} className="ad-supplier-row">
                                            <div className="ad-supplier-avatar">
                                                <Icon.supplier_icon />
                                            </div>
                                            <div className="ad-supplier-info">
                                                <span className="ad-supplier-name">{s.name}</span>
                                                <span className="ad-supplier-sub">{s.sub}</span>
                                            </div>
                                            <div className="ad-supplier-right">
                                                <span className="ad-supplier-revenue">{s.revenue}</span>
                                                <span className={`ad-supplier-badge ${s.badgeClass}`}>{s.badge}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Bottom Row: Trending Catalog + Intelligence ── */}
                        <div className="ad-bot-row">
                            {/* Trending Catalog */}
                            <div className="ad-card ad-catalog-card">
                                <div className="ad-card-header">
                                    <div>
                                        <p className="ad-card-title">Trending Catalog</p>
                                        <p className="ad-card-subtitle">Highest movement products</p>
                                    </div>
                                    <button className="ad-card-icon-btn"><Icon.tag /></button>
                                </div>

                                <div className="ad-product-grid">
                                    {PRODUCTS.map(p => (
                                        <div key={p.name} className="ad-product-row">
                                            <ProductAvatar name={p.name} color={p.color} />
                                            <div className="ad-product-info">
                                                <span className="ad-product-name">{p.name}</span>
                                                <span className="ad-product-units">{p.units}</span>
                                            </div>
                                            <span className="ad-product-price">{p.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Intelligence Widget */}
                            <div className="ad-card ad-intel-card">
                                <div className="ad-intel-header">
                                    <span className="ad-intel-icon"><Icon.intel /></span>
                                    <span className="ad-intel-label">Intelligence</span>
                                </div>

                                <div className="ad-intel-metrics">
                                    <div className="ad-intel-metric">
                                        <p className="ad-intel-metric-label">REVENUE AMOUNT</p>
                                        <p className="ad-intel-metric-value">LKR 11,110.55</p>
                                    </div>
                                    <div className="ad-intel-metric">
                                        <p className="ad-intel-metric-label">ACTIVE LOANS</p>
                                        <p className="ad-intel-metric-value">1.2k</p>
                                    </div>
                                </div>

                                <p className="ad-intel-body">
                                    Platform growth is tracking <strong>14.2%</strong> above forecast for this quarter.
                                </p>

                                <button className="ad-intel-cta">
                                    View Ledger Metrics <Icon.arrow />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}