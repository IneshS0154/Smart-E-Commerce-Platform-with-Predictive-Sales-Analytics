import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear'          },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection'    },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active'      },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets'  },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening Wear' },
];

const fmtPrice = p => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN')}` : '—';
const statusMeta = status => {
  if (status === 'ACTIVE')      return { label: 'Active',      cls: 'prof-status--active'  };
  if (status === 'PENDING')     return { label: 'Pending',     cls: 'prof-status--pending' };
  if (status === 'DEACTIVATED') return { label: 'Deactivated', cls: 'prof-status--inactive'};
  return                               { label: 'Rejected',    cls: 'prof-status--inactive'};
};

export default function Profile() {
  const navigate  = useNavigate();
  const [seller,    setSeller]    = useState(null);
  const [products,  setProducts]  = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData,  setFormData]  = useState({});
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('seller');
    if (stored) {
      const s = JSON.parse(stored);
      setSeller(s);
      setFormData(s);
      fetchProducts(s.id);
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const fetchProducts = async (sellerId) => {
    try {
      const res = await fetch(`/api/products/supplier/${sellerId}`);
      if (res.ok) setProducts(await res.json());
    } catch { /* silent */ }
  };

  // ── Computed metrics ──────────────────────────────
  const metrics = useMemo(() => {
    const totalProducts  = products.length;
    const menProducts    = products.filter(p => p.gender === 'MALE').length;
    const womenProducts  = products.filter(p => p.gender === 'FEMALE').length;
    const totalUnits     = products.reduce((sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0);
    const prices         = products.filter(p => p.price).map(p => parseFloat(p.price));
    const avgPrice       = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const activeCategories = CATEGORIES.filter(cat => products.some(p => p.category === cat.key)).length;
    const outOfStock     = products.filter(p => !p.stocks || p.stocks.every(s => s.stockCount === 0)).length;

    const categoryBreakdown = CATEGORIES.map(cat => {
      const catProds = products.filter(p => p.category === cat.key);
      return {
        ...cat,
        total:  catProds.length,
        men:    catProds.filter(p => p.gender === 'MALE').length,
        women:  catProds.filter(p => p.gender === 'FEMALE').length,
        units:  catProds.reduce((sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0),
        pct:    totalProducts > 0 ? Math.round((catProds.length / totalProducts) * 100) : 0,
      };
    }).filter(c => c.total > 0);

    return { totalProducts, menProducts, womenProducts, totalUnits, avgPrice, activeCategories, outOfStock, categoryBreakdown };
  }, [products]);

  // ── Form handlers ─────────────────────────────────
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/sellers/${seller.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setSeller(updated);
        localStorage.setItem('seller', JSON.stringify(updated));
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch { setError('Error updating profile'); }
    finally   { setIsSaving(false); }
  };

  if (!seller) return null;

  const initials = (seller.storeName || seller.username || 'S').charAt(0).toUpperCase();
  const sm       = statusMeta(seller.status);
  const { totalProducts, menProducts, womenProducts, totalUnits, avgPrice, activeCategories, outOfStock, categoryBreakdown } = metrics;

  return (
    <div className="prof-page">

      {/* ── Hero Banner ── */}
      <div className="prof-hero">
        <div className="prof-hero__bg" />
        <div className="prof-hero__content">
          <div className="prof-hero__left">
            <div className="prof-avatar">{initials}</div>
            <div className="prof-hero__info">
              <h1 className="prof-hero__name">{seller.storeName}</h1>
              <p className="prof-hero__meta">
                @{seller.username}
                {seller.email && <><span className="prof-hero__dot">·</span>{seller.email}</>}
                {seller.phoneNumber && <><span className="prof-hero__dot">·</span>{seller.phoneNumber}</>}
              </p>
              <span className={`prof-status ${sm.cls}`}>{sm.label}</span>
            </div>
          </div>
          <button
            className="prof-edit-btn"
            onClick={() => { setIsEditing(true); setFormData(seller); setError(''); setSuccess(''); }}
          >
            ✎ Edit Profile
          </button>
        </div>
      </div>

      <div className="prof-body">

        {/* ── Alerts ── */}
        {error   && <div className="prof-alert prof-alert--error">{error}</div>}
        {success && <div className="prof-alert prof-alert--success">{success}</div>}

        {/* ── Metrics row ── */}
        <div className="prof-metrics">
          <div className="prof-metric">
            <span className="prof-metric__val">{totalProducts}</span>
            <span className="prof-metric__label">Total Products</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric__val">{activeCategories}</span>
            <span className="prof-metric__label">Active Categories</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric__val">{totalUnits.toLocaleString()}</span>
            <span className="prof-metric__label">Units in Stock</span>
          </div>
          <div className={`prof-metric ${outOfStock > 0 ? 'prof-metric--warn' : ''}`}>
            <span className="prof-metric__val">{outOfStock}</span>
            <span className="prof-metric__label">Out of Stock</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric__val prof-metric__val--sm">{avgPrice > 0 ? fmtPrice(avgPrice) : '—'}</span>
            <span className="prof-metric__label">Avg. Price</span>
          </div>
        </div>

        {/* ── Two-column section ── */}
        <div className="prof-grid">

          {/* Left column */}
          <div className="prof-left">

            <div className="prof-card">
              <h3 className="prof-card__title">Gender Split</h3>
              {totalProducts === 0 ? (
                <p className="prof-empty">No products added yet.</p>
              ) : (
                <div className="prof-gender-split">
                  <div className="prof-gender-track">
                    <div className="prof-gender-fill prof-gender-fill--men"
                      style={{ width: `${totalProducts > 0 ? (menProducts / totalProducts) * 100 : 0}%` }} />
                    <div className="prof-gender-fill prof-gender-fill--women"
                      style={{ width: `${totalProducts > 0 ? (womenProducts / totalProducts) * 100 : 0}%` }} />
                  </div>
                  <div className="prof-gender-legend">
                    <div className="prof-gender-item">
                      <span className="prof-gender-dot prof-gender-dot--men" />
                      <span>Men <strong>{menProducts}</strong></span>
                    </div>
                    <div className="prof-gender-item">
                      <span className="prof-gender-dot prof-gender-dot--women" />
                      <span>Women <strong>{womenProducts}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prof-card">
              <h3 className="prof-card__title">Category Breakdown</h3>
              {categoryBreakdown.length === 0 ? (
                <p className="prof-empty">No products added yet.</p>
              ) : (
                <div className="prof-cats">
                  {categoryBreakdown.map(cat => (
                    <div key={cat.key} className="prof-cat-row">
                      <div className="prof-cat-row__top">
                        <span className="prof-cat-row__name">{cat.label}</span>
                        <span className="prof-cat-row__count">{cat.total} product{cat.total !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="prof-cat-bar-track">
                        <div className="prof-cat-bar-fill" style={{ width: `${cat.pct}%` }} />
                      </div>
                      <div className="prof-cat-row__bottom">
                        {cat.men > 0 && <span className="prof-pill prof-pill--men">{cat.men} Men</span>}
                        {cat.women > 0 && <span className="prof-pill prof-pill--women">{cat.women} Women</span>}
                        <span className="prof-cat-units">{cat.units.toLocaleString()} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="prof-right">

            <div className="prof-card">
              <h3 className="prof-card__title">Account Information</h3>
              <div className="prof-info-list">
                {[
                  { label: 'Account ID',   value: `#${seller.id}` },
                  { label: 'Username',     value: `@${seller.username}` },
                  { label: 'Account Type', value: 'Supplier' },
                ].map(row => (
                  <div key={row.label} className="prof-info-row">
                    <span className="prof-info-label">{row.label}</span>
                    <span className="prof-info-value">{row.value}</span>
                  </div>
                ))}
                <div className="prof-info-row">
                  <span className="prof-info-label">Status</span>
                  <span className={`prof-status prof-status--inline ${sm.cls}`}>{sm.label}</span>
                </div>
              </div>
            </div>

            <div className="prof-card">
              <h3 className="prof-card__title">Contact Details</h3>
              <div className="prof-info-list">
                {[
                  { label: 'Store Name',   value: seller.storeName },
                  { label: 'Email',        value: seller.email },
                  { label: 'Phone Number', value: seller.phoneNumber || 'Not provided' },
                  { label: 'Address',      value: seller.address || 'Not provided' },
                ].map(row => (
                  <div key={row.label} className="prof-info-row">
                    <span className="prof-info-label">{row.label}</span>
                    <span className="prof-info-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div className="prof-modal-overlay" onClick={() => { setIsEditing(false); setFormData(seller); }}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal__header">
              <h3 className="prof-modal__title">Edit Profile</h3>
              <button className="prof-modal__close" onClick={() => { setIsEditing(false); setFormData(seller); }}>✕</button>
            </div>
            <div className="prof-modal__body">
              {error   && <div className="prof-alert prof-alert--error">{error}</div>}
              {success && <div className="prof-alert prof-alert--success">{success}</div>}
              <div className="prof-form">
                {[
                  { name: 'storeName',   label: 'Store Name',   type: 'text', placeholder: 'Enter store name' },
                  { name: 'phoneNumber', label: 'Phone Number', type: 'tel',  placeholder: 'Enter phone number' },
                  { name: 'address',     label: 'Address',      type: 'text', placeholder: 'Enter address' },
                ].map(f => (
                  <div key={f.name} className="prof-form__group">
                    <label className="prof-form__label">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name] || ''}
                      onChange={handleInputChange}
                      className="prof-form__input"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="prof-modal__footer">
              <button className="prof-btn prof-btn--ghost" onClick={() => { setIsEditing(false); setFormData(seller); }}>
                Cancel
              </button>
              <button className="prof-btn prof-btn--primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
