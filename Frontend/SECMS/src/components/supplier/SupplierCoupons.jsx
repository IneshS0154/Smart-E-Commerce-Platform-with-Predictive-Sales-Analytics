import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, X, Search, Tag, Calendar, 
  Trash2, Power, AlertCircle, CheckCircle2, 
  BarChart2, Clock, Info, Layers
} from 'lucide-react';
import { couponAPI } from '../../api/orderAPI';
import './SupplierCoupons.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

function StatusBadge({ status }) {
    const map = {
        ACTIVE: { label: 'Active', icon: <CheckCircle2 size={12} />, className: 'active' },
        INACTIVE: { label: 'Inactive', icon: <Power size={12} />, className: 'inactive' },
        EXPIRED: { label: 'Expired', icon: <Clock size={12} />, className: 'expired' },
    };
    const s = map[status] || map.INACTIVE;
    return (
        <span className={`sc-badge sc-badge--${s.className}`}>
            {s.icon} {s.label}
        </span>
    );
}

export default function SupplierCoupons() {
    const [seller, setSeller] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const getLocalISOString = () => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
        return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    };
    const today = getLocalISOString();
    const [form, setForm] = useState({
        code: '', description: '', discountPercentage: '', minimumOrderAmount: '',
        maxUsages: '', validFrom: today, validUntil: ''
    });

    useEffect(() => {
        document.body.style.overflow = showForm ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [showForm]);

    useEffect(() => {
        const stored = localStorage.getItem('seller');
        if (stored) {
            const parsed = JSON.parse(stored);
            setSeller(parsed);
            fetchCoupons(parsed.id);
        }
    }, []);

    const fetchCoupons = async (sellerId) => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const data = await couponAPI.getSellerCoupons(sellerId);
            setCoupons(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccessMsg('');

        const { code, discountPercentage, minimumOrderAmount, validFrom, validUntil } = form;
        if (!code.trim()) return setFormError('Coupon code is required.');
        if (!discountPercentage || isNaN(discountPercentage)) return setFormError('Valid discount is required.');
        if (!validFrom || !validUntil) return setFormError('Dates are required.');

        setSubmitting(true);
        try {
            await couponAPI.create({
                ...form,
                code: code.trim().toUpperCase(),
                discountPercentage: parseFloat(discountPercentage),
                minimumOrderAmount: parseFloat(minimumOrderAmount || 0),
                maxUsages: form.maxUsages ? parseInt(form.maxUsages) : 100,
                sellerId: seller.id
            });
            setSuccessMsg('Coupon created successfully');
            setShowForm(false);
            setForm({ code: '', description: '', discountPercentage: '', minimumOrderAmount: '', maxUsages: '', validFrom: today, validUntil: '' });
            fetchCoupons(seller.id);
        } catch (err) {
            setFormError('Failed to create coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this coupon?')) return;
        try {
            await couponAPI.deactivate(id);
            fetchCoupons(seller.id);
        } catch { console.error('Deactivate failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon permanently?')) return;
        try {
            await couponAPI.deleteCoupon(id);
            fetchCoupons(seller.id);
        } catch (err) { alert('Delete failed. Coupon may be in use.'); }
    };

    const activeCount = coupons.filter(c => c.status === 'ACTIVE').length;
    const usageCount = coupons.reduce((sum, c) => sum + (c.currentUsageCount || 0), 0);

    if (loading && !seller) return <div className="sc-sync"><div className="loader" /></div>;

    return (
        <div className="sc-container">
            <header className="sc-header">
                <div>
                    <h1 className="sc-title">Coupon Management</h1>
                    <p className="sc-subtitle">Configure promotional codes and store-wide discounts</p>
                </div>
                <button className="sc-btn sc-btn--primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Create New Coupon
                </button>
            </header>

            {/* ── Stats ── */}
            <div className="sc-stats-grid">
                <div className="sc-stat-card">
                    <div className="sc-stat-icon"><Tag size={20} /></div>
                    <div className="sc-stat-info">
                        <span className="sc-stat-label">Active Campaigns</span>
                        <h2 className="sc-stat-value">{activeCount}</h2>
                    </div>
                </div>
                <div className="sc-stat-card">
                    <div className="sc-stat-icon"><BarChart2 size={20} /></div>
                    <div className="sc-stat-info">
                        <span className="sc-stat-label">Total Usages</span>
                        <h2 className="sc-stat-value">{usageCount}</h2>
                    </div>
                </div>
                <div className="sc-stat-card">
                    <div className="sc-stat-icon"><Clock size={20} /></div>
                    <div className="sc-stat-info">
                        <span className="sc-stat-label">Expiring Soon</span>
                        <h2 className="sc-stat-value">{coupons.filter(c => c.status === 'ACTIVE').length}</h2>
                    </div>
                </div>
            </div>

            {/* ── Form Modal ── */}
            {/* ── Form Modal (Portal) ── */}
            {showForm && createPortal(
                <div className="sc-overlay" onClick={() => setShowForm(false)}>
                    <div className="sc-modal" onClick={e => e.stopPropagation()}>
                        <header className="sc-modal-header">
                            <div>
                                <h3 className="sc-modal-title">New Promotional Campaign</h3>
                                <p className="sc-modal-subtitle">Define parameters for your store-wide discount</p>
                            </div>
                            <button className="sc-close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
                        </header>
                        
                        <form onSubmit={handleCreate}>
                            <div className="sc-modal-body">
                                {/* Section 1: Identity */}
                                <div className="sc-form-section">
                                    <div className="sc-section-head">
                                        <Tag size={14} />
                                        <h4>Campaign Identity</h4>
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Coupon Code</label>
                                        <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SUMMER25" required />
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Campaign Description</label>
                                        <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Store-wide summer seasonal discount" />
                                    </div>
                                </div>

                                {/* Section 2: Rules */}
                                <div className="sc-form-section" style={{ marginTop: '16px' }}>
                                    <div className="sc-section-head">
                                        <Layers size={14} />
                                        <h4>Discount Rules</h4>
                                    </div>
                                    <div className="sc-form-row">
                                        <div className="sc-input-group">
                                            <label>Discount (%)</label>
                                            <input name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} placeholder="15" required />
                                        </div>
                                        <div className="sc-input-group">
                                            <label>Min. Order Amount</label>
                                            <input name="minimumOrderAmount" type="number" value={form.minimumOrderAmount} onChange={handleChange} placeholder="5000" />
                                        </div>
                                    </div>
                                    <div className="sc-input-group">
                                        <label>Total Usage Limit</label>
                                        <input name="maxUsages" type="number" value={form.maxUsages} onChange={handleChange} placeholder="100" />
                                    </div>
                                </div>

                                {/* Section 3: Validity */}
                                <div className="sc-form-section" style={{ marginTop: '16px' }}>
                                    <div className="sc-section-head">
                                        <Calendar size={14} />
                                        <h4>Validity Period</h4>
                                    </div>
                                    <div className="sc-form-row">
                                        <div className="sc-input-group">
                                            <label>Active From</label>
                                            <input name="validFrom" type="datetime-local" value={form.validFrom} onChange={handleChange} required />
                                        </div>
                                        <div className="sc-input-group">
                                            <label>Active Until</label>
                                            <input name="validUntil" type="datetime-local" value={form.validUntil} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                {formError && <div className="sc-error-msg"><AlertCircle size={16} /> {formError}</div>}
                            </div>
                            <footer className="sc-modal-footer">
                                <button type="button" className="sc-btn sc-btn--ghost" onClick={() => setShowForm(false)}>Discard</button>
                                <button type="submit" className="sc-btn sc-btn--primary" disabled={submitting}>
                                    {submitting ? 'Creating Campaign...' : 'Publish Campaign'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Table ── */}
            <div className="sc-card">
                <div className="sc-table-wrapper">
                    <table className="sc-table">
                        <thead>
                            <tr>
                                <th>Coupon Details</th>
                                <th>Discount</th>
                                <th>Min. Order</th>
                                <th>Usage</th>
                                <th>Validity</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="sc-loading">Updating coupon registry...</td></tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="sc-empty">
                                            <Tag size={40} />
                                            <p>No coupons found. Launch your first campaign to boost sales.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="sc-code-info">
                                                <span className="sc-code-text">{c.code}</span>
                                                <span className="sc-code-desc">{c.description || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td className="sc-discount">{c.discountPercentage}% OFF</td>
                                        <td className="sc-min-order">{fmtPrice(c.minimumOrderAmount)}</td>
                                        <td>
                                            <div className="sc-usage">
                                                <span className="count">{c.currentUsageCount}</span>
                                                <span className="limit">/ {c.maxUsages}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="sc-date-info">
                                                <span>{fmtDate(c.validFrom)}</span>
                                                <span className="sep">&rarr;</span>
                                                <span>{fmtDate(c.validUntil)}</span>
                                            </div>
                                        </td>
                                        <td><StatusBadge status={c.status} /></td>
                                        <td>
                                            <div className="sc-actions">
                                                {c.status === 'ACTIVE' && (
                                                    <button className="sc-icon-btn" onClick={() => handleDeactivate(c.id)} title="Deactivate">
                                                        <Power size={16} />
                                                    </button>
                                                )}
                                                <button className="sc-icon-btn sc-icon-btn--danger" onClick={() => handleDelete(c.id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

