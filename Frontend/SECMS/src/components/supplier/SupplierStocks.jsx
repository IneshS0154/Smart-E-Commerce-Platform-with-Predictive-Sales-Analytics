import { useState, useEffect, useMemo } from 'react';
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
const fmtPrice  = p => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN')}` : '—';

/** Returns stock count for a given size from the product's stocks array */
const getStock = (product, size) => {
  if (!product.stocks) return null;
  const entry = product.stocks.find(s => s.size === size);
  return entry ? entry.stockCount : null;
};

/** Color class for a stock count */
const stockClass = (count) => {
  if (count === null) return 'ss-stock--none';
  if (count === 0)    return 'ss-stock--out';
  if (count <= 5)     return 'ss-stock--low';
  return 'ss-stock--ok';
};

// ── Category section ─────────────────────────────────────────────
function CategorySection({ category, products, onEdit }) {
  const [open, setOpen] = useState(true);
  if (products.length === 0) return null;

  const totalStock  = products.reduce((sum, p) => {
    const s = p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0;
    return sum + s;
  }, 0);
  const outOfStock  = products.filter(p => !p.stocks || p.stocks.every(s => s.stockCount === 0)).length;
  const lowStock    = products.filter(p => p.stocks && p.stocks.some(s => s.stockCount > 0 && s.stockCount <= 5)).length;

  return (
    <div className="ss-cat">
      <button className="ss-cat__header" onClick={() => setOpen(o => !o)}>
        <div className="ss-cat__header-left">
          <span className={`ss-cat__chevron ${open ? 'ss-cat__chevron--open' : ''}`}>▸</span>
          <h3 className="ss-cat__title">{category.label}</h3>
          <span className="ss-cat__count">{products.length} products</span>
        </div>
        <div className="ss-cat__header-right">
          {outOfStock > 0 && <span className="ss-cat__pill ss-cat__pill--danger">⚠ {outOfStock} out of stock</span>}
          {lowStock   > 0 && <span className="ss-cat__pill ss-cat__pill--warn">↓ {lowStock} low stock</span>}
          <span className="ss-cat__pill ss-cat__pill--info">{totalStock} total units</span>
        </div>
      </button>

      <div className={`ss-cat__body-wrap ${open ? 'ss-cat__body-wrap--open' : ''}`}>
        <div className="ss-cat__body-inner">
          <div className="ss-table-wrap">
            <table className="ss-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Gender</th>
                  <th>Price</th>
                  {SIZES.map(s => <th key={s} className="ss-th-size">{s}</th>)}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={product.id}>
                    <td className="ss-td-num">{idx + 1}</td>
                    <td className="ss-td-name">{product.productName}</td>
                    <td>
                      <span className={`ss-gender ss-gender--${product.gender.toLowerCase()}`}>
                        {fmtGender(product.gender)}
                      </span>
                    </td>
                    <td className="ss-td-price">{fmtPrice(product.price)}</td>
                    {SIZES.map(size => {
                      const count = getStock(product, size);
                      return (
                        <td key={size} className="ss-td-stock">
                          <span className={`ss-stock ${stockClass(count)}`}>
                            {count === null ? '—' : count}
                          </span>
                        </td>
                      );
                    })}
                    <td>
                      <button className="ss-edit-btn" onClick={() => onEdit(product)}>
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function SupplierStocks() {
  const [seller,   setSeller]   = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');

  // ── Edit modal ─────────────────────────────────────────────────
  const [editProduct, setEditProduct] = useState(null);
  const [stockData,   setStockData]   = useState({ price: '', sizeStocks: {} });
  const [saving,      setSaving]      = useState(false);

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
      else setError('Failed to fetch products');
    } catch { setError('Error fetching products'); }
    finally   { setLoading(false); }
  };

  // ── Search + group ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.category.replace(/_/g,' ').toLowerCase().includes(q) ||
      fmtGender(p.gender).toLowerCase().includes(q)
    );
  }, [products, search]);

  const grouped = useMemo(() =>
    CATEGORIES.reduce((acc, cat) => {
      acc[cat.key] = filtered.filter(p => p.category === cat.key);
      return acc;
    }, {}),
  [filtered]);

  // ── Summary stats ──────────────────────────────────────────────
  const totalProducts  = products.length;
  const totalUnits     = products.reduce((sum, p) => sum + (p.stocks?.reduce((a,s)=>a+s.stockCount,0)||0), 0);
  const outOfStockCnt  = products.filter(p => !p.stocks || p.stocks.every(s=>s.stockCount===0)).length;

  // ── Edit handlers ──────────────────────────────────────────────
  const openEdit = (product) => {
    const sizeStocks = {};
    product.stocks?.forEach(s => { sizeStocks[s.size] = s.stockCount; });
    setEditProduct(product);
    setStockData({ price: product.price || '', sizeStocks });
  };
  const closeEdit = () => { setEditProduct(null); setStockData({ price:'', sizeStocks:{} }); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!stockData.price || parseFloat(stockData.price) <= 0) { setError('Price must be greater than 0'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('sellerToken');
      const res = await fetch(`/api/products/${editProduct.id}/stocks`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ price: parseFloat(stockData.price), sizeStocks: stockData.sizeStocks }),
      });
      if (res.ok) {
        setSuccess(`Stock updated for "${editProduct.productName}"`);
        closeEdit(); fetchProducts(seller.id);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const d = await res.json().catch(()=>({}));
        setError(d.message || 'Failed to update stock');
      }
    } catch { setError('Error updating stock'); }
    finally   { setSaving(false); }
  };

  if (!seller) return <div className="ss-loading">Loading…</div>;

  const hasProducts = products.length > 0;
  const totalVisible = filtered.length;

  return (
    <div className="ss">

      {/* ── Page header ── */}
      <div className="ss__header">
        <div>
          <h2 className="ss__title">Stock & Pricing</h2>
          <p className="ss__sub">Manage inventory levels and prices for all your products</p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {hasProducts && (
        <div className="ss-stats">
          <div className="ss-stat">
            <span className="ss-stat__val">{totalProducts}</span>
            <span className="ss-stat__label">Products</span>
          </div>
          <div className="ss-stat">
            <span className="ss-stat__val">{totalUnits.toLocaleString()}</span>
            <span className="ss-stat__label">Total Units</span>
          </div>
          <div className={`ss-stat ${outOfStockCnt > 0 ? 'ss-stat--danger' : ''}`}>
            <span className="ss-stat__val">{outOfStockCnt}</span>
            <span className="ss-stat__label">Out of Stock</span>
          </div>
          <div className="ss-stat ss-stat--legend">
            <div className="ss-legend">
              <span className="ss-stock ss-stock--ok">12</span><span>In stock (≥6)</span>
              <span className="ss-stock ss-stock--low">3</span><span>Low (1–5)</span>
              <span className="ss-stock ss-stock--out">0</span><span>Out of stock</span>
              <span className="ss-stock ss-stock--none">—</span><span>Not set</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {error   && <div className="ss-alert ss-alert--error">{error}</div>}
      {success && <div className="ss-alert ss-alert--success">{success}</div>}

      {/* ── Search ── */}
      {hasProducts && (
        <div className="ss-search">
          <span className="ss-search__icon">⌕</span>
          <input
            type="text"
            className="ss-search__input"
            placeholder="Search by product name, category or gender…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="ss-search__clear" onClick={() => setSearch('')}>✕</button>}
          {search && <span className="ss-search__count">{totalVisible} result{totalVisible !== 1 ? 's' : ''}</span>}
        </div>
      )}

      {/* ── Category sections ── */}
      {loading ? (
        <p className="ss-empty">Loading products…</p>
      ) : !hasProducts ? (
        <div className="ss-empty-state">
          <p className="ss-empty-state__icon">📦</p>
          <p className="ss-empty-state__text">No products yet</p>
          <p className="ss-empty-state__sub">Add products in the Products tab first.</p>
        </div>
      ) : search && totalVisible === 0 ? (
        <div className="ss-empty-state">
          <p className="ss-empty-state__icon">🔍</p>
          <p className="ss-empty-state__text">No results for "{search}"</p>
        </div>
      ) : (
        <div className="ss-cats">
          {CATEGORIES.map(cat => (
            <CategorySection
              key={cat.key}
              category={cat}
              products={grouped[cat.key] || []}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* ══ Edit Modal ══ */}
      {editProduct && (
        <div className="ss-modal-overlay" onClick={closeEdit}>
          <div className="ss-modal" onClick={e => e.stopPropagation()}>
            <div className="ss-modal__header">
              <div>
                <h3 className="ss-modal__title">{editProduct.productName}</h3>
                <p className="ss-modal__sub">{editProduct.category.replace(/_/g,' ')} · {fmtGender(editProduct.gender)}</p>
              </div>
              <button className="ss-modal__close" onClick={closeEdit}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="ss-modal__body">

                {/* Price */}
                <div className="ss-field-group">
                  <label className="ss-field-label">Price (Rs.)</label>
                  <div className="ss-price-wrap">
                    <span className="ss-price-prefix">Rs.</span>
                    <input
                      type="number" step="0.01" min="0" required
                      className="ss-price-input"
                      value={stockData.price}
                      onChange={e => setStockData(p => ({ ...p, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Size stocks */}
                <div className="ss-field-group">
                  <label className="ss-field-label">Stock by Size</label>
                  <div className="ss-size-grid">
                    {SIZES.map(size => (
                      <div key={size} className="ss-size-cell">
                        <span className="ss-size-cell__label">{size}</span>
                        <input
                          type="number" min="0"
                          className="ss-size-cell__input"
                          value={stockData.sizeStocks[size] ?? 0}
                          onChange={e => setStockData(p => ({ ...p, sizeStocks: { ...p.sizeStocks, [size]: parseInt(e.target.value)||0 } }))}
                        />
                        <span className="ss-size-cell__unit">units</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current stock summary strip */}
                {editProduct.stocks && editProduct.stocks.length > 0 && (
                  <div className="ss-current-summary">
                    <p className="ss-current-summary__label">Current stock (before save)</p>
                    <div className="ss-current-summary__row">
                      {editProduct.stocks.map(s => (
                        <div key={s.size} className="ss-current-summary__chip">
                          <span className="ss-current-summary__size">{s.size}</span>
                          <span className={`ss-stock ${stockClass(s.stockCount)}`}>{s.stockCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ss-modal__footer">
                <button type="button" className="ss-btn ss-btn--ghost" onClick={closeEdit} disabled={saving}>Cancel</button>
                <button type="submit" className="ss-btn ss-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Stock & Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
