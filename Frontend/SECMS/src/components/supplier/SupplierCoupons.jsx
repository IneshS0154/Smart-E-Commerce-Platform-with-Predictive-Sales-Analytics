import { useState, useEffect } from 'react';
import { couponAPI } from '../../api/orderAPI';
import './SupplierCoupons.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
    const map = {
        ACTIVE: { label: '✔ Active', color: '#22c55e', bg: '#f0fdf4' },
        INACTIVE: { label: '⊗ Inactive', color: '#9a9a90', bg: '#f4f4f2' },
        EXPIRED: { label: '× Expired', color: '#ef4444', bg: '#fef2f2' },
    };
    const s = map[status] || map.INACTIVE;
    return (
        <span style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
            fontFamily: "'NORD', sans-serif", letterSpacing: '0.06em',
            fontWeight: 700, background: s.bg, color: s.color
        }}>{s.label}</span>
    );
}

export default function SupplierCoupons() {
    const seller = JSON.parse(localStorage.getItem('seller') || '{}');
    const sellerId = seller?.id;

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const today = new Date().toISOString().slice(0, 16);
    const [form, setForm] = useState({
        code: '', description: '', discountPercentage: '', minimumOrderAmount: '',
        maxUsages: '', validFrom: today, validUntil: ''
    });

    const fetchCoupons = async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const data = await couponAPI.getSellerCoupons(sellerId);
            setCoupons(data || []);
        } catch (e) {
            console.error('Failed to load coupons:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, [sellerId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccessMsg('');

        const { code, description, discountPercentage, minimumOrderAmount, maxUsages, validFrom, validUntil } = form;
        if (!code.trim()) return setFormError('Coupon code is required.');
        if (!discountPercentage || isNaN(discountPercentage) || +discountPercentage <= 0 || +discountPercentage > 100)
            return setFormError('Discount must be between 1 and 100%.');
        if (!minimumOrderAmount || isNaN(minimumOrderAmount) || +minimumOrderAmount < 0)
            return setFormError('Minimum order amount must be 0 or greater.');
        if (!validFrom || !validUntil) return setFormError('Please set start and expiry dates.');
        if (new Date(validUntil) <= new Date(validFrom)) return setFormError('Expiry must be after start date.');

        setSubmitting(true);
        try {
            await couponAPI.create({
                code: code.trim().toUpperCase(),
                description: description.trim(),
                discountPercentage: parseFloat(discountPercentage),
                minimumOrderAmount: parseFloat(minimumOrderAmount),
                maxUsages: maxUsages ? parseInt(maxUsages) : 100,
                validFrom: validFrom.length === 16 ? validFrom + ':00' : validFrom,
                validUntil: validUntil.length === 16 ? validUntil + ':00' : validUntil,
                sellerId
            });
            setSuccessMsg(`Coupon "${code.toUpperCase()}" created successfully!`);
            setForm({ code: '', description: '', discountPercentage: '', minimumOrderAmount: '', maxUsages: '', validFrom: today, validUntil: '' });
            setShowForm(false);
            fetchCoupons();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create coupon.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this coupon?')) return;
        try {
            await couponAPI.deactivate(id);
            fetchCoupons();
        } catch { alert('Failed to deactivate coupon.'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this coupon? This cannot be undone.')) return;
        try {
            await couponAPI.deleteCoupon(id);
            fetchCoupons();
        } catch { alert('Failed to delete coupon.'); }
    };

    const active = coupons.filter(c => c.status === 'ACTIVE').length;
    const inactive = coupons.filter(c => c.status !== 'ACTIVE').length;

    return (
        <div className="sc-page">
            {/* Header */}
            <div className="sc-header">
                <div>
                    <h2 className="sc-heading">Coupon Management</h2>
                    <p className="sc-sub">Create and manage discount coupons for your store</p>
                </div>
                <button className="sc-btn-create" onClick={() => { setShowForm(true); setFormError(''); setSuccessMsg(''); }}>
                    + Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="sc-stats">
                {[
                    { label: 'TOTAL COUPONS', value: coupons.length, accent: '#1a1a1a' },
                    { label: 'ACTIVE', value: active, accent: '#22c55e' },
                    { label: 'INACTIVE / EXPIRED', value: inactive, accent: '#9a9a90' },
                ].map(s => (
                    <div key={s.label} className="sc-stat-card">
                        <p className="sc-stat-label">{s.label}</p>
                        <p className="sc-stat-value" style={{ color: s.accent }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Success */}
            {successMsg && (
                <div className="sc-success">{successMsg}</div>
            )}

            {/* Create Form Panel */}
            {showForm && (
                <div className="sc-form-card">
                    <div className="sc-form-header">
                        <h3 className="sc-form-title">New Coupon</h3>
                        <button className="sc-btn-close" onClick={() => setShowForm(false)}>✕</button>
                    </div>
                    <form onSubmit={handleCreate} className="sc-form">
                        <div className="sc-form-grid">
                            <div className="sc-field">
                                <label>Coupon Code *</label>
                                <input name="code" value={form.code} onChange={handleChange}
                                    placeholder="e.g. SUMMER26" style={{ textTransform: 'uppercase' }} />
                                <span className="sc-hint">Customers enter this at checkout</span>
                            </div>
                            <div className="sc-field">
                                <label>Description</label>
                                <input name="description" value={form.description} onChange={handleChange}
                                    placeholder="e.g. Summer sale discount" />
                            </div>
                            <div className="sc-field">
                                <label>Discount % *</label>
                                <input name="discountPercentage" type="number" min="1" max="100" step="0.01"
                                    value={form.discountPercentage} onChange={handleChange} placeholder="e.g. 15" />
                                <span className="sc-hint">Percentage off the order total</span>
                            </div>
                            <div className="sc-field">
                                <label>Minimum Order Amount (Rs.) *</label>
                                <input name="minimumOrderAmount" type="number" min="0" step="0.01"
                                    value={form.minimumOrderAmount} onChange={handleChange} placeholder="e.g. 10000" />
                                <span className="sc-hint">Order must be at least this amount to apply coupon</span>
                            </div>
                            <div className="sc-field">
                                <label>Max Usages</label>
                                <input name="maxUsages" type="number" min="1"
                                    value={form.maxUsages} onChange={handleChange} placeholder="100" />
                                <span className="sc-hint">Leave blank for 100 uses</span>
                            </div>
                            <div className="sc-field sc-field--empty" />
                            <div className="sc-field">
                                <label>Valid From *</label>
                                <input name="validFrom" type="datetime-local" value={form.validFrom} onChange={handleChange} />
                            </div>
                            <div className="sc-field">
                                <label>Expires On *</label>
                                <input name="validUntil" type="datetime-local" value={form.validUntil} onChange={handleChange} />
                            </div>
                        </div>

                        {formError && <p className="sc-error">{formError}</p>}
                        <div className="sc-form-actions">
                            <button type="button" className="sc-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="sc-btn-submit" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons Table */}
            <div className="sc-table-card">
                <table className="sc-table">
                    <thead>
                        <tr>
                            <th>CODE</th>
                            <th>DESCRIPTION</th>
                            <th>DISCOUNT</th>
                            <th>MIN ORDER</th>
                            <th>USAGE</th>
                            <th>VALID FROM</th>
                            <th>EXPIRES</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="sc-empty">Loading...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan="9" className="sc-empty">No coupons yet. Create your first coupon above.</td></tr>
                        ) : (
                            coupons.map(c => (
                                <tr key={c.id}>
                                    <td><span className="sc-code">{c.code}</span></td>
                                    <td style={{ color: '#7a7a72', fontSize: '13px' }}>{c.description || '—'}</td>
                                    <td><strong>{parseFloat(c.discountPercentage).toFixed(1)}%</strong></td>
                                    <td>Rs. {parseFloat(c.minimumOrderAmount).toLocaleString('en-IN')}</td>
                                    <td>{c.currentUsageCount} / {c.maxUsages}</td>
                                    <td style={{ fontSize: '13px', color: '#7a7a72' }}>{fmtDate(c.validFrom)}</td>
                                    <td style={{ fontSize: '13px', color: '#7a7a72' }}>{fmtDate(c.validUntil)}</td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {c.status === 'ACTIVE' && (
                                                <button className="sc-action-btn sc-action-deactivate"
                                                    onClick={() => handleDeactivate(c.id)}>Deactivate</button>
                                            )}
                                            <button className="sc-action-btn sc-action-delete"
                                                onClick={() => handleDelete(c.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
