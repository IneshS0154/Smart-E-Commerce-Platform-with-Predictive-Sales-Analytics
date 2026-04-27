import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  User, Mail, Phone, MapPin, 
  Package, Layers, ShoppingBag, 
  TrendingUp, Edit3, Save, X,
  Shield, CheckCircle, Clock, AlertCircle,
  Store, Globe, Key, Lock
} from 'lucide-react';
import './Profile.css';
import DarkVeil from '../ui/DarkVeil';

const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear'          },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection'    },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active'      },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets'  },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening Wear' },
];

const fmtPrice = p => p ? `LKR ${parseFloat(p).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

const statusMeta = status => {
  if (status === 'ACTIVE')      return { label: 'Verified Store', icon: <CheckCircle size={14} />, cls: 'pr-status--active' };
  if (status === 'PENDING')     return { label: 'Pending Review', icon: <Clock size={14} />,       cls: 'pr-status--pending' };
  return                        { label: 'Deactivated',   icon: <AlertCircle size={14} />, cls: 'pr-status--inactive' };
};

export default function Profile() {
  const navigate  = useNavigate();
  const [seller,    setSeller]    = useState(null);
  const [products,  setProducts]  = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData,  setFormData]  = useState({});
  const [isSaving,  setIsSaving]  = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const isLocked = isEditing || isChangingPassword;
    document.body.style.overflow = isLocked ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isEditing, isChangingPassword]);

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

  const metrics = useMemo(() => {
    const totalProducts  = products.length;
    const menProducts    = products.filter(p => p.gender === 'MALE').length;
    const womenProducts  = products.filter(p => p.gender === 'FEMALE').length;
    const totalUnits     = products.reduce((sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0);
    const prices         = products.filter(p => p.price).map(p => parseFloat(p.price));
    const avgPrice       = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const activeCategories = CATEGORIES.filter(cat => products.some(p => p.category === cat.key)).length;

    const categoryBreakdown = CATEGORIES.map(cat => {
      const catProds = products.filter(p => p.category === cat.key);
      return {
        ...cat,
        total:  catProds.length,
        pct:    totalProducts > 0 ? Math.round((catProds.length / totalProducts) * 100) : 0,
      };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    return { totalProducts, menProducts, womenProducts, totalUnits, avgPrice, activeCategories, categoryBreakdown };
  }, [products]);

  const handleSave = async () => {
    setIsSaving(true);
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
      }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return alert("Passwords do not match");
    }
    if (passwordFormData.newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/sellers/${seller.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordFormData.newPassword }),
      });
      if (res.ok) {
        alert("Password updated successfully");
        setIsChangingPassword(false);
        setPasswordFormData({ newPassword: '', confirmPassword: '' });
      } else {
        alert("Failed to update password");
      }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  if (!seller) return <div className="pr-sync"><div className="loader" /></div>;

  const initials = (seller.storeName || seller.username || 'S').charAt(0).toUpperCase();
  const sm = statusMeta(seller.status);

  return (
    <div className="profile-vault-frame">
      <div className="auth-bg-wrapper">
        <DarkVeil 
            speed={0.6} 
            noiseIntensity={0.01} 
            scanlineIntensity={0.05} 
            warpAmount={0.1}
            grayscale={1.0}
        />
      </div>
      <div className="pr-container">
        {/* ── Brand Identity ── */}
      <div className="pr-header">
        <div className="pr-brand">
           <div className="pr-avatar">{initials}</div>
           <div className="pr-brand-info">
              <div className="pr-brand-top">
                <h1 className="pr-store-name">{seller.storeName}</h1>
                <span className={`pr-badge ${sm.cls}`}>{sm.icon} {sm.label}</span>
              </div>
              <p className="pr-brand-sub">@{seller.username} · Member since 2024</p>
           </div>
        </div>
        <button className="pr-btn pr-btn--outline" onClick={() => setIsEditing(true)}>
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      {/* ── Metric Snapshot ── */}
      <div className="pr-stats-row">
         <div className="pr-stat-card">
            <span className="pr-stat-label">Product Catalog</span>
            <div className="pr-stat-value">{metrics.totalProducts}</div>
            <span className="pr-stat-desc">Live Listings</span>
         </div>
         <div className="pr-stat-card">
            <span className="pr-stat-label">Active Categories</span>
            <div className="pr-stat-value">{metrics.activeCategories}</div>
            <span className="pr-stat-desc">Market Segments</span>
         </div>
         <div className="pr-stat-card">
            <span className="pr-stat-label">Inventory Volume</span>
            <div className="pr-stat-value">{metrics.totalUnits.toLocaleString()}</div>
            <span className="pr-stat-desc">Units in Stock</span>
         </div>
         <div className="pr-stat-card">
            <span className="pr-stat-label">Average Price Point</span>
            <div className="pr-stat-value">{fmtPrice(metrics.avgPrice)}</div>
            <span className="pr-stat-desc">Catalog Mean</span>
         </div>
         <div className="pr-stat-card pr-stat-card--dark">
            <span className="pr-stat-label">Trust Index</span>
            <div className="pr-stat-value">98%</div>
            <span className="pr-stat-desc">Health Score</span>
         </div>
      </div>

      <div className="pr-grid">
         {/* ── Profile Information ── */}
         <div className="pr-col">
            <div className="pr-section">
               <h3 className="pr-section-title">Store Information</h3>
               <div className="pr-info-list">
                  <div className="pr-info-item">
                     <Mail size={16} />
                     <div className="pr-info-content">
                        <span className="label">Contact Email</span>
                        <span className="val">{seller.email}</span>
                     </div>
                  </div>
                  <div className="pr-info-item">
                     <Phone size={16} />
                     <div className="pr-info-content">
                        <span className="label">Phone Number</span>
                        <span className="val">{seller.phoneNumber || 'Not provided'}</span>
                     </div>
                  </div>
                  <div className="pr-info-item">
                     <MapPin size={16} />
                     <div className="pr-info-content">
                        <span className="label">Store Address</span>
                        <span className="val">{seller.address || 'Not provided'}</span>
                     </div>
                  </div>
                  <div className="pr-info-item">
                     <Shield size={16} />
                     <div className="pr-info-content">
                        <span className="label">Account Status</span>
                        <span className="val">Fully Verified</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pr-section">
               <h3 className="pr-section-title">Audience Split</h3>
               <div className="pr-gender-split">
                  <div className="pr-gender-row">
                     <span>Men's Apparel</span>
                     <span>{Math.round((metrics.menProducts / metrics.totalProducts) * 100) || 0}%</span>
                  </div>
                  <div className="pr-progress-track">
                     <div className="pr-progress-fill" style={{ width: `${(metrics.menProducts / metrics.totalProducts) * 100}%` }} />
                  </div>
                  <div className="pr-gender-row" style={{ marginTop: '16px' }}>
                     <span>Women's Apparel</span>
                     <span>{Math.round((metrics.womenProducts / metrics.totalProducts) * 100) || 0}%</span>
                  </div>
                  <div className="pr-progress-track">
                     <div className="pr-progress-fill" style={{ width: `${(metrics.womenProducts / metrics.totalProducts) * 100}%` }} />
                  </div>
               </div>
            </div>
         </div>

          {/* ── Category Breakdown ── */}
          <div className="pr-col">
             <div className="pr-section">
                <h3 className="pr-section-title">Collection Distribution</h3>
                <div className="pr-cat-list">
                   {metrics.categoryBreakdown.map((cat, i) => (
                     <div key={i} className="pr-cat-item">
                        <div className="pr-cat-header">
                           <span className="pr-cat-name">{cat.label}</span>
                           <span className="pr-cat-pct">{cat.pct}%</span>
                        </div>
                        <div className="pr-progress-track pr-progress-track--thin">
                           <div className="pr-progress-fill" style={{ width: `${cat.pct}%` }} />
                        </div>
                     </div>
                   ))}
                   {metrics.categoryBreakdown.length === 0 && (
                     <div className="pr-empty">No products classified yet.</div>
                   )}
                </div>
             </div>

             <div className="pr-section">
                <h3 className="pr-section-title">Security & Privacy</h3>
                <div className="pr-security-card">
                   <div className="pr-security-info">
                      <Lock size={20} />
                      <div>
                         <p className="pr-security-name">Account Password</p>
                         <p className="pr-security-desc">Last updated recently</p>
                      </div>
                   </div>
                   <button className="pr-btn pr-btn--outline" onClick={() => setIsChangingPassword(true)}>Update</button>
                </div>
             </div>
          </div>
       </div>

      {/* ── Change Password Modal (Portal) ── */}
      {isChangingPassword && createPortal(
        <div className="pr-overlay" onClick={() => setIsChangingPassword(false)}>
           <div className="pr-modal pr-modal--small" onClick={e => e.stopPropagation()}>
              <header className="pr-modal-header">
                 <h3 className="pr-modal-title">Update Credentials</h3>
                 <button className="pr-close-btn" onClick={() => setIsChangingPassword(false)}><X size={18} /></button>
              </header>
              <form onSubmit={handlePasswordChange}>
                 <div className="pr-modal-body">
                    <div className="pr-password-info">
                       <Key size={32} />
                       <p>Change your account password to maintain security. Choose a strong one.</p>
                    </div>
                    <div className="pr-field" style={{ marginBottom: '16px' }}>
                       <label>New Password</label>
                       <input 
                         type="password" 
                         required 
                         placeholder="••••••••"
                         value={passwordFormData.newPassword} 
                         onChange={e => setPasswordFormData({...passwordFormData, newPassword: e.target.value})} 
                       />
                    </div>
                    <div className="pr-field">
                       <label>Confirm Password</label>
                       <input 
                         type="password" 
                         required 
                         placeholder="••••••••"
                         value={passwordFormData.confirmPassword} 
                         onChange={e => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})} 
                       />
                    </div>
                 </div>
                 <footer className="pr-modal-footer">
                    <button type="button" className="pr-btn pr-btn--ghost" onClick={() => setIsChangingPassword(false)}>Discard</button>
                    <button type="submit" className="pr-btn pr-btn--primary" disabled={isSaving}>
                      {isSaving ? 'Syncing...' : 'Update Password'}
                    </button>
                 </footer>
              </form>
           </div>
        </div>,
        document.body
      )}

      {/* ── Edit Profile Modal (Portal) ── */}
      {isEditing && createPortal(
        <div className="pr-overlay" onClick={() => setIsEditing(false)}>
           <div className="pr-modal" onClick={e => e.stopPropagation()}>
              <header className="pr-modal-header">
                 <h3 className="pr-modal-title">Edit Store Profile</h3>
                 <button className="pr-close-btn" onClick={() => setIsEditing(false)}><X size={18} /></button>
              </header>
              <div className="pr-modal-body">
                 <div className="pr-form-section-group">
                    <div className="pr-section-header-row">
                       <Store size={16} />
                       <h4>Store Identity</h4>
                    </div>
                    <div className="pr-form-grid">
                       <div className="pr-field">
                          <label>Store Name</label>
                          <input value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                       </div>
                       <div className="pr-field">
                          <label>Contact Email</label>
                          <input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <div className="pr-form-section-group" style={{ marginTop: '24px' }}>
                    <div className="pr-section-header-row">
                       <Globe size={16} />
                       <h4>Contact & Logistics</h4>
                    </div>
                    <div className="pr-form-grid">
                       <div className="pr-field">
                          <label>Phone Number</label>
                          <input value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                       </div>
                       <div className="pr-field">
                          <label>Store Address</label>
                          <input value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                       </div>
                    </div>
                 </div>
              </div>
              <footer className="pr-modal-footer">
                 <button className="pr-btn pr-btn--ghost" onClick={() => setIsEditing(false)}>Discard</button>
                 <button className="pr-btn pr-btn--primary" onClick={handleSave} disabled={isSaving}>
                   {isSaving ? 'Updating...' : 'Save Changes'}
                 </button>
              </footer>
           </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}
