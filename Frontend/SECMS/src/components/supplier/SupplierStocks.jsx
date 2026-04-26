import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, ChevronDown, ChevronRight, Package, 
  AlertTriangle, CheckCircle, BarChart3, 
  Plus, X, Edit3, DollarSign, Box, Layers
} from 'lucide-react';
import './SupplierStocks.css';

const SIZES      = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear'          },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection'    },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active'      },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets'  },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening Wear' },
];

const fmtGender = g => g === 'MALE' ? 'Men' : 'Women';
const fmtPrice  = p => p ? `LKR ${parseFloat(p).toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : 'LKR 0.00';
const getStock   = (product, size) => product.stocks?.find(s => s.size === size)?.stockCount ?? null;

const stockClass = count => {
  if (count === null) return 'ss-stock--none';
  if (count === 0)    return 'ss-stock--out';
  if (count <= 5)     return 'ss-stock--low';
  return 'ss-stock--ok';
};

// ── Category Section Component ───────────────────────────────────
function CategorySection({ category, products, onEdit }) {
  const [isOpen, setIsOpen] = useState(true);
  if (products.length === 0) return null;

  const totalStock = products.reduce((sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0);
  const outOfStock = products.filter(p => !p.stocks || p.stocks.every(s => s.stockCount === 0)).length;

  return (
    <div className="ss-section">
      <button className="ss-section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="ss-section-info">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h3 className="ss-section-title">{category.label}</h3>
          <span className="ss-section-count">{products.length} Products</span>
        </div>
        <div className="ss-section-meta">
           <span className="ss-meta-pill">{totalStock} Units Total</span>
           {outOfStock > 0 && <span className="ss-meta-pill ss-meta-pill--danger">{outOfStock} Out of Stock</span>}
        </div>
      </button>

      {isOpen && (
        <div className="ss-table-wrapper">
          <table className="ss-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Base Price</th>
                {SIZES.map(s => <th key={s} className="ss-th-size">{s}</th>)}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="ss-name-cell">
                      <span className="ss-pname">{p.productName}</span>
                    </div>
                  </td>
                  <td className="ss-price">{fmtPrice(p.price)}</td>
                  {SIZES.map(size => {
                    const count = getStock(p, size);
                    return (
                      <td key={size}>
                        <span className={`ss-stock-badge ${stockClass(count)}`}>
                          {count === null ? '—' : count}
                        </span>
                      </td>
                    );
                  })}
                  <td>
                    <div className="ss-actions">
                      <button className="ss-icon-btn" onClick={() => onEdit(p)} title="Update Stock">
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main SupplierStocks Component ────────────────────────────────
export default function SupplierStocks() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGender, setActiveGender] = useState('MALE');
  const [search, setSearch] = useState('');
  
  const [editProduct, setEditProduct] = useState(null);
  const [stockData, setStockData] = useState({ price: '', sizeStocks: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('seller');
    if (stored) {
      const s = JSON.parse(stored);
      setSeller(s);
      fetchProducts(s.id);
    }
  }, []);

  const fetchProducts = async (sellerId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/supplier/${sellerId}`);
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesGender = p.gender === activeGender;
      const matchesSearch = p.productName.toLowerCase().includes(search.toLowerCase());
      return matchesGender && matchesSearch;
    });
  }, [products, activeGender, search]);

  const grouped = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat.key] = filtered.filter(p => p.category === cat.key);
      return acc;
    }, {});
  }, [filtered]);

  // Stats for cards
  const totalItems = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0);
  const outOfStockCnt = products.filter(p => !p.stocks || p.stocks.every(s => s.stockCount === 0)).length;
  const lowStockCnt = products.filter(p => p.stocks?.some(s => s.stockCount > 0 && s.stockCount <= 5)).length;

  const openEdit = (product) => {
    const sizeStocks = {};
    product.stocks?.forEach(s => { sizeStocks[s.size] = s.stockCount; });
    setEditProduct(product);
    setStockData({ price: product.price || '', sizeStocks });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`/api/products/${editProduct.id}/stocks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          price: parseFloat(stockData.price),
          sizeStocks: stockData.sizeStocks
        })
      });

      if (response.ok) {
        setEditProduct(null);
        fetchProducts(seller.id);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to update stock'}`);
      }
    } catch (err) {
      console.error('Stock Update Error:', err);
      alert('Network error while updating stock.');
    } finally {
      setSaving(false);
    }
  };

  if (!seller) return <div className="ss-sync"><div className="loader" /></div>;

  return (
    <div className="ss-container">
      <header className="ss-header">
        <div>
          <h1 className="ss-title">Stock Management</h1>
          <p className="ss-subtitle">Monitor inventory levels and update product pricing</p>
        </div>
      </header>

      {/* ── Summary Grid ── */}
      <div className="ss-stats-grid">
        <div className="ss-stat-card">
          <div className="ss-stat-header">
            <div className="ss-stat-icon ss-stat-icon--black"><Box size={20} /></div>
            <span className="ss-stat-label">Total Products</span>
          </div>
          <div className="ss-stat-body">
            <div className="ss-stat-value">{totalItems}</div>
            <div className="ss-stat-trend">In Catalog</div>
          </div>
        </div>
        <div className="ss-stat-card">
          <div className="ss-stat-header">
            <div className="ss-stat-icon ss-stat-icon--purple"><Layers size={20} /></div>
            <span className="ss-stat-label">Total Units</span>
          </div>
          <div className="ss-stat-body">
            <div className="ss-stat-value">{totalUnits.toLocaleString()}</div>
            <div className="ss-stat-trend">Current Inventory</div>
          </div>
        </div>
        <div className="ss-stat-card">
          <div className="ss-stat-header">
            <div className="ss-stat-icon ss-stat-icon--red"><AlertTriangle size={20} /></div>
            <span className="ss-stat-label">Critical Stock</span>
          </div>
          <div className="ss-stat-body">
            <div className="ss-stat-value">{outOfStockCnt + lowStockCnt}</div>
            <div className="ss-stat-trend">Needs Restock</div>
          </div>
        </div>
        <div className="ss-stat-card">
          <div className="ss-stat-header">
            <div className="ss-stat-icon ss-stat-icon--green"><CheckCircle size={20} /></div>
            <span className="ss-stat-label">Inventory Health</span>
          </div>
          <div className="ss-stat-body">
            <div className="ss-stat-value">{Math.round(((totalItems - outOfStockCnt) / totalItems) * 100) || 0}%</div>
            <div className="ss-stat-trend">Availability Rate</div>
          </div>
        </div>
      </div>

      {/* ── Collection Tabs ── */}
      <div className="ss-tabs">
        <button className={`ss-tab ${activeGender === 'MALE' ? 'active' : ''}`} onClick={() => setActiveGender('MALE')}>
          Men's Collection
          <span className="ss-tab-badge">{products.filter(p => p.gender === 'MALE').length}</span>
        </button>
        <button className={`ss-tab ${activeGender === 'FEMALE' ? 'active' : ''}`} onClick={() => setActiveGender('FEMALE')}>
          Women's Collection
          <span className="ss-tab-badge">{products.filter(p => p.gender === 'FEMALE').length}</span>
        </button>
      </div>

      {/* ── Control Bar ── */}
      <div className="ss-controls">
        <div className="ss-search-wrap">
          <Search size={18} className="ss-search-icon" />
          <input 
            type="text" 
            placeholder="Search stocks by product name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="ss-sections">
        {loading ? (
          <div className="ss-empty">Updating inventory data...</div>
        ) : filtered.length === 0 ? (
          <div className="ss-empty">
            <Package size={48} />
            <h3>Inventory clear</h3>
            <p>No stock records match your search criteria.</p>
          </div>
        ) : (
          CATEGORIES.map(cat => (
            <CategorySection 
              key={cat.key}
              category={cat}
              products={grouped[cat.key] || []}
              onEdit={openEdit}
            />
          ))
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editProduct && createPortal(
        <div className="ss-overlay" onClick={() => setEditProduct(null)}>
          <div className="ss-modal" onClick={e => e.stopPropagation()}>
            <header className="ss-modal-header">
              <div>
                <h3 className="ss-modal-title">Update Stock & Pricing</h3>
                <p className="ss-modal-subtitle">{editProduct.productName}</p>
              </div>
              <button className="ss-close-btn" onClick={() => setEditProduct(null)}><X size={20} /></button>
            </header>
            
            <form onSubmit={handleSave}>
              <div className="ss-modal-body">
                 <div className="ss-input-group">
                    <label>Product Price (LKR)</label>
                    <div className="ss-price-field">
                       <span className="ss-currency">LKR</span>
                       <input 
                          type="number" 
                          step="0.01" 
                          required 
                          value={stockData.price}
                          onChange={e => setStockData({...stockData, price: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="ss-size-label">Stock by Size</div>
                 <div className="ss-size-grid">
                    {SIZES.map(size => (
                      <div key={size} className="ss-size-input-card">
                         <span className="ss-size-name">{size}</span>
                         <input 
                            type="number" 
                            min="0"
                            value={stockData.sizeStocks[size] ?? 0}
                            onChange={e => setStockData({
                              ...stockData, 
                              sizeStocks: { ...stockData.sizeStocks, [size]: parseInt(e.target.value) || 0 }
                            })}
                         />
                      </div>
                    ))}
                 </div>
              </div>

              <footer className="ss-modal-footer">
                 <button type="button" className="ss-btn ss-btn--ghost" onClick={() => setEditProduct(null)}>Cancel</button>
                 <button type="submit" className="ss-btn ss-btn--primary" disabled={saving}>
                   {saving ? 'Syncing...' : 'Update Inventory'}
                 </button>
              </footer>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

