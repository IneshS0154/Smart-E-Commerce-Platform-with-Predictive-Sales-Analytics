import { useState, useEffect, useMemo } from 'react';
import './SupplierProducts.css';

const CATEGORIES = [
  { key: 'CASUAL_WEAR',       label: 'Casual Wear'         },
  { key: 'FORMAL_COLLECTION', label: 'Formal Collection'   },
  { key: 'SPORTS_ACTIVE',     label: 'Sports & Active'     },
  { key: 'OUTERWEAR_JACKETS', label: 'Outerwear & Jackets' },
  { key: 'PARTY_EVENING_WEAR',label: 'Party & Evening Wear'},
];
const GENDERS = ['MALE', 'FEMALE'];

const fmtCat    = s => s.replace(/_/g, ' ');
const fmtGender = g => g === 'MALE' ? 'Men' : 'Women';

// ── Category table ──────────────────────────────────────────────
function CategoryTable({ category, products, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);

  if (products.length === 0) return null;

  return (
    <div className="sp-cat">
      {/* Category header */}
      <button className="sp-cat__header" onClick={() => setOpen(o => !o)}>
        <div className="sp-cat__header-left">
          <span className={`sp-cat__chevron ${open ? 'sp-cat__chevron--open' : ''}`}>▸</span>
          <h3 className="sp-cat__title">{category.label}</h3>
          <span className="sp-cat__badge">{products.length}</span>
        </div>
      </button>

      <div className={`sp-cat__body-wrap ${open ? 'sp-cat__body-wrap--open' : ''}`}>
        <div className="sp-cat__body-inner">
          <table className="sp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Gender</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product.id}>
                  <td className="sp-table__num">{idx + 1}</td>
                  <td className="sp-table__name">{product.productName}</td>
                  <td>
                    <span className={`sp-gender-badge sp-gender-badge--${product.gender.toLowerCase()}`}>
                      {fmtGender(product.gender)}
                    </span>
                  </td>
                  <td>
                    <span className="sp-table__color-count">
                      {product.colors?.length || 0} color{product.colors?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <div className="sp-table__actions">
                      <button className="sp-act sp-act--view"   onClick={() => onView(product)}>View</button>
                      <button className="sp-act sp-act--edit"   onClick={() => onEdit(product)}>Edit</button>
                      <button className="sp-act sp-act--delete" onClick={() => onDelete(product.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function SupplierProducts() {
  const [seller,   setSeller]   = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');

  // ── Add form ─────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [formData, setFormData] = useState({
    productName: '', category: 'CASUAL_WEAR', gender: 'MALE', description: '', availableColors: [],
  });
  const [mainImageFile,         setMainImageFile]         = useState(null);
  const [additionalImageFiles,  setAdditionalImageFiles]  = useState([null, null, null]);
  const [mainPreviewUrl,        setMainPreviewUrl]        = useState('');
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState(['', '', '']);
  const [colorInput, setColorInput] = useState('');

  // ── View modal ────────────────────────────────────
  const [viewProduct, setViewProduct] = useState(null);

  // ── Edit modal ────────────────────────────────────
  const [editProduct,    setEditProduct]    = useState(null);
  const [editForm,       setEditForm]       = useState({});
  const [editColorInput, setEditColorInput] = useState('');
  const [editSaving,     setEditSaving]     = useState(false);

  // ─────────────────────────────────────────────────
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

  // ── Search + grouping ─────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      fmtCat(p.category).toLowerCase().includes(q) ||
      fmtGender(p.gender).toLowerCase().includes(q)
    );
  }, [products, search]);

  const grouped = useMemo(() =>
    CATEGORIES.reduce((acc, cat) => {
      acc[cat.key] = filtered.filter(p => p.category === cat.key);
      return acc;
    }, {}),
  [filtered]);

  const totalVisible = filtered.length;

  // ── Add form helpers ──────────────────────────────
  const handleInputChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddColor    = () => { if (colorInput.trim() && formData.availableColors.length < 7) { setFormData(p => ({ ...p, availableColors: [...p.availableColors, colorInput.trim()] })); setColorInput(''); } };
  const handleRemoveColor = i  => setFormData(p => ({ ...p, availableColors: p.availableColors.filter((_, idx) => idx !== i) }));
  const handleMainPick    = e  => { const f = e.target.files[0]; if (f) { setMainImageFile(f); setMainPreviewUrl(URL.createObjectURL(f)); } };
  const handleAddlPick    = (e, i) => { const f = e.target.files[0]; if (!f) return; const nf=[...additionalImageFiles]; nf[i]=f; setAdditionalImageFiles(nf); const nu=[...additionalPreviewUrls]; nu[i]=URL.createObjectURL(f); setAdditionalPreviewUrls(nu); };
  const resetForm = () => { setFormData({ productName:'', category:'CASUAL_WEAR', gender:'MALE', description:'', availableColors:[] }); setMainImageFile(null); setAdditionalImageFiles([null,null,null]); setMainPreviewUrl(''); setAdditionalPreviewUrls(['','','']); setColorInput(''); setError(''); };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('gender',      formData.gender.toLowerCase());
    fd.append('category',    formData.category.toLowerCase());
    fd.append('sellerName',  seller?.storeName || 'seller');
    fd.append('productName', formData.productName.trim() || 'product');
    const token = localStorage.getItem('sellerToken');
    const res = await fetch('/api/upload/image', { method:'POST', headers: token ? { Authorization:`Bearer ${token}` } : {}, body:fd });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error || `Upload failed (${res.status})`); }
    return (await res.json()).url;
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.productName.trim()) { setError('Product name is required'); return; }
    if (!mainImageFile)               { setError('Main image is required');    return; }
    setSubmitting(true);
    try {
      const mainImagePath         = await uploadFile(mainImageFile);
      const additionalImagePaths  = [];
      for (const f of additionalImageFiles) { if (f) additionalImagePaths.push(await uploadFile(f)); }
      const token = localStorage.getItem('sellerToken');
      const res = await fetch(`/api/products/add?sellerId=${seller.id}`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ ...formData, mainImagePath, additionalImagePaths }),
      });
      if (res.ok) {
        setSuccess('Product added! It will now appear in the customer catalogue.');
        resetForm(); setShowAddForm(false); fetchProducts(seller.id);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        let msg = 'Failed to add product';
        try { const d = await res.json(); msg = d.message || msg; } catch { msg = res.status===403 ? 'Unauthorised – please log in again' : `Error (${res.status})`; }
        setError(msg);
      }
    } catch(err) { setError(err.message || 'Error adding product'); }
    finally       { setSubmitting(false); }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('sellerToken');
      const res = await fetch(`/api/products/${productId}`, { method:'DELETE', headers: token ? { Authorization:`Bearer ${token}` } : {} });
      if (res.ok) { setSuccess('Product deleted.'); fetchProducts(seller.id); setTimeout(()=>setSuccess(''),3000); }
      else          setError('Failed to delete product');
    } catch { setError('Error deleting product'); }
  };

  // ── Edit ──────────────────────────────────────────
  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({ productName: product.productName, category: product.category, gender: product.gender, description: product.description||'', availableColors: [...(product.colors||[])] });
    setEditColorInput('');
  };
  const closeEdit = () => { setEditProduct(null); setEditForm({}); };
  const handleEditInputChange  = e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditAddColor     = () => { if (editColorInput.trim() && editForm.availableColors?.length < 7) { setEditForm(p=>({...p, availableColors:[...p.availableColors, editColorInput.trim()]})); setEditColorInput(''); } };
  const handleEditRemoveColor  = i  => setEditForm(p=>({...p, availableColors:p.availableColors.filter((_,idx)=>idx!==i)}));

  const handleSaveEdit = async () => {
    setEditSaving(true); setError('');
    try {
      const token = localStorage.getItem('sellerToken');
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setSuccess('Product updated!'); closeEdit(); fetchProducts(seller.id); setTimeout(()=>setSuccess(''),3000); }
      else { const d = await res.json().catch(()=>({})); setError(d.message||'Failed to update product'); }
    } catch { setError('Error updating product'); }
    finally   { setEditSaving(false); }
  };

  if (!seller) return <div className="sp-loading">Loading…</div>;

  const safeStoreName = (seller?.storeName||'seller').toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  const hasAnyProducts = products.length > 0;

  return (
    <div className="sp">

      {/* ── Page header ── */}
      <div className="sp__header">
        <div>
          <h2 className="sp__title">Your Products</h2>
          <p className="sp__count">{products.length} product{products.length !== 1 ? 's' : ''} across {CATEGORIES.filter(c => products.some(p => p.category === c.key)).length} categories</p>
        </div>
        <button
          className={`sp-btn ${showAddForm ? 'sp-btn--cancel' : 'sp-btn--primary'}`}
          onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="sp-alert sp-alert--error">{error}</div>}
      {success && <div className="sp-alert sp-alert--success">{success}</div>}

      {/* ══ Add Product Form ══ */}
      {showAddForm && (
        <form className="sp-form" onSubmit={handleSubmitProduct}>
          <div className="sp-form__section">
            <h3 className="sp-form__section-title">Product Details</h3>
            <div className="sp-form__row">
              <div className="sp-form__group">
                <label>Product Name *</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="Enter product name" required />
              </div>
              <div className="sp-form__group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                  {GENDERS.map(g => <option key={g} value={g}>{fmtGender(g)}</option>)}
                </select>
              </div>
            </div>
            <div className="sp-form__row" style={{marginTop:14}}>
              <div className="sp-form__group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="sp-form__group" style={{marginTop:14}}>
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter product description" rows="3" />
            </div>
          </div>

          <div className="sp-form__section">
            <h3 className="sp-form__section-title">Colors ({formData.availableColors.length}/7)</h3>
            <div className="sp-color-row">
              <input type="text" value={colorInput} onChange={e=>setColorInput(e.target.value)} placeholder="e.g. Black, Red, Navy"
                onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),handleAddColor())} />
              <button type="button" className="sp-btn sp-btn--outline" onClick={handleAddColor}>Add</button>
            </div>
            <div className="sp-tags">
              {formData.availableColors.map((c,i) => (
                <span key={i} className="sp-tag">{c} <button type="button" onClick={()=>handleRemoveColor(i)}>✕</button></span>
              ))}
            </div>
          </div>

          <div className="sp-form__section">
            <h3 className="sp-form__section-title">Images</h3>
            <p className="sp-form__hint">
              Saved to: <code>assets/images/products/{formData.gender.toLowerCase()}/{formData.category.toLowerCase()}/{safeStoreName}/</code>
            </p>
            <div className="sp-form__group">
              <label>Main Display Image *</label>
              <input type="file" accept="image/*" onChange={handleMainPick} className="sp-file" />
              {mainPreviewUrl && <img src={mainPreviewUrl} alt="main preview" className="sp-preview" />}
            </div>
            <div className="sp-form__group" style={{marginTop:12}}>
              <label>Additional Images (max 3)</label>
              {[0,1,2].map(i => (
                <div key={i} className="sp-addl-upload">
                  <input type="file" accept="image/*" onChange={e=>handleAddlPick(e,i)} className="sp-file" />
                  {additionalPreviewUrls[i] && <img src={additionalPreviewUrls[i]} alt={`additional ${i+1}`} className="sp-preview sp-preview--sm" />}
                </div>
              ))}
            </div>
          </div>

          <div className="sp-form__actions">
            <button type="submit" className="sp-btn sp-btn--primary" disabled={submitting}>
              {submitting ? '⏳ Saving…' : 'Add Product'}
            </button>
            <button type="button" className="sp-btn sp-btn--ghost" onClick={()=>{setShowAddForm(false);resetForm();}} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ══ Search bar ══ */}
      {hasAnyProducts && (
        <div className="sp-search-bar">
          <span className="sp-search-bar__icon">⌕</span>
          <input
            type="text"
            className="sp-search-bar__input"
            placeholder="Search by name, category or gender…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sp-search-bar__clear" onClick={() => setSearch('')}>✕</button>
          )}
          {search && (
            <span className="sp-search-bar__result">
              {totalVisible} result{totalVisible !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ══ Category tables ══ */}
      {loading ? (
        <p className="sp__empty">Loading products…</p>
      ) : !hasAnyProducts ? (
        <div className="sp__empty-state">
          <p className="sp__empty-state__icon">📦</p>
          <p className="sp__empty-state__text">No products yet</p>
          <p className="sp__empty-state__sub">Click "+ Add Product" above to add your first product.</p>
        </div>
      ) : search && totalVisible === 0 ? (
        <div className="sp__empty-state">
          <p className="sp__empty-state__icon">🔍</p>
          <p className="sp__empty-state__text">No results for "{search}"</p>
          <p className="sp__empty-state__sub">Try a different search term.</p>
        </div>
      ) : (
        <div className="sp-cats">
          {CATEGORIES.map(cat => (
            <CategoryTable
              key={cat.key}
              category={cat}
              products={grouped[cat.key] || []}
              onView={p => setViewProduct(p)}
              onEdit={openEdit}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      {/* ══ VIEW Modal ══ */}
      {viewProduct && (
        <div className="sp-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Product Details</h3>
              <button className="sp-modal__close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="sp-modal__body">
              {viewProduct.mainImagePath && (
                <img src={viewProduct.mainImagePath} alt={viewProduct.productName} className="sp-modal__img" />
              )}
              <div className="sp-modal__grid">
                <div className="sp-modal__field"><span>Product Name</span><strong>{viewProduct.productName}</strong></div>
                <div className="sp-modal__field"><span>Category</span><strong>{fmtCat(viewProduct.category)}</strong></div>
                <div className="sp-modal__field"><span>Gender</span><strong>{fmtGender(viewProduct.gender)}</strong></div>
                <div className="sp-modal__field"><span>Colors</span><strong>{viewProduct.colors?.join(', ')||'—'}</strong></div>
                {viewProduct.description && (
                  <div className="sp-modal__field sp-modal__field--full"><span>Description</span><strong>{viewProduct.description}</strong></div>
                )}
              </div>
            </div>
            <div className="sp-modal__footer">
              <button className="sp-btn sp-btn--ghost" onClick={() => setViewProduct(null)}>Close</button>
              <button className="sp-btn sp-btn--primary" onClick={() => { setViewProduct(null); window.open(`/product/${viewProduct.id}`, '_blank'); }}>
                View Live Page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT Modal ══ */}
      {editProduct && (
        <div className="sp-modal-overlay" onClick={closeEdit}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Edit Product</h3>
              <button className="sp-modal__close" onClick={closeEdit}>✕</button>
            </div>
            <div className="sp-modal__body">
              <div className="sp-form__row">
                <div className="sp-form__group">
                  <label>Product Name *</label>
                  <input type="text" name="productName" value={editForm.productName} onChange={handleEditInputChange} />
                </div>
                <div className="sp-form__group">
                  <label>Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditInputChange}>
                    {GENDERS.map(g => <option key={g} value={g}>{fmtGender(g)}</option>)}
                  </select>
                </div>
              </div>
              <div className="sp-form__group" style={{marginTop:16}}>
                <label>Category</label>
                <select name="category" value={editForm.category} onChange={handleEditInputChange}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="sp-form__group" style={{marginTop:16}}>
                <label>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditInputChange} rows="3" />
              </div>
              <div className="sp-form__group" style={{marginTop:16}}>
                <label>Colors ({editForm.availableColors?.length||0}/7)</label>
                <div className="sp-color-row">
                  <input type="text" value={editColorInput} onChange={e=>setEditColorInput(e.target.value)}
                    placeholder="Add a color" onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),handleEditAddColor())} />
                  <button type="button" className="sp-btn sp-btn--outline" onClick={handleEditAddColor}>Add</button>
                </div>
                <div className="sp-tags" style={{marginTop:8}}>
                  {editForm.availableColors?.map((c,i) => (
                    <span key={i} className="sp-tag">{c} <button type="button" onClick={()=>handleEditRemoveColor(i)}>✕</button></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="sp-modal__footer">
              <button className="sp-btn sp-btn--ghost" onClick={closeEdit} disabled={editSaving}>Cancel</button>
              <button className="sp-btn sp-btn--primary" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
