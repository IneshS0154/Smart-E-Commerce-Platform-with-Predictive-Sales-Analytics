import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Eye, Edit3, Trash2, X, 
  ChevronRight, ChevronDown, Package, Layers,
  ExternalLink, UploadCloud, Check, AlertCircle,
  Users, Palette, AlignLeft
} from 'lucide-react';
import './SupplierProducts.css';

const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear'          },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection'    },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active'      },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets'  },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening Wear' },
];
const GENDERS = ['MALE', 'FEMALE'];
const fmtCat    = s => s.replace(/_/g, ' ');
const fmtGender = g => g === 'MALE' ? 'Men' : 'Women';

// ── Category Table Component ─────────────────────────────────────
function CategoryTable({ category, products, onView, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(true);
  if (products.length === 0) return null;

  return (
    <div className="sp-section">
      <button className="sp-section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="sp-section-info">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h3 className="sp-section-title">{category.label}</h3>
          <span className="sp-section-count">{products.length} Items</span>
        </div>
      </button>

      {isOpen && (
        <div className="sp-table-wrapper">
          <table className="sp-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Product</th>
                <th>Colors</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id}>
                  <td className="sp-mono">#{(idx + 1).toString().padStart(2, '0')}</td>
                  <td>
                    <div className="sp-name-cell">
                      <span className="sp-pname">{p.productName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="sp-color-list">
                      {(p.availableColors || p.colors || []).slice(0, 3).map((c, i) => (
                        <span key={i} className="sp-color-tag">{c}</span>
                      ))}
                      {(p.availableColors || p.colors || []).length > 3 && (
                        <span className="sp-color-more">+{(p.availableColors || p.colors || []).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="sp-date">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td>
                    <div className="sp-actions">
                      <button className="sp-icon-btn" onClick={() => onView(p)} title="View Detail"><Eye size={16} /></button>
                      <button className="sp-icon-btn" onClick={() => onEdit(p)} title="Edit"><Edit3 size={16} /></button>
                      <button className="sp-icon-btn sp-icon-btn--red" onClick={() => onDelete(p.id)} title="Delete"><Trash2 size={16} /></button>
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

// ── View Modal ──────────────────────────────────────────────────
function ViewModal({ product, onClose }) {
  // Get all unique images (main + additionals)
  const images = useMemo(() => {
    const all = [product.mainImagePath, ...(product.images || []).map(img => img.imagePath)].filter(Boolean);
    return [...new Set(all)];
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);

  return createPortal(
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal sp-modal--view" onClick={e => e.stopPropagation()}>
        <div className="sp-view-grid">
          <div className="sp-view-media">
             <div className="sp-view-main-img">
                {images[activeImg] ? (
                  <img src={images[activeImg]} alt="Product" className="sp-fade-in" key={activeImg} />
                ) : (
                  <div className="sp-no-img">No Image Available</div>
                )}
             </div>
             {images.length > 1 && (
               <div className="sp-view-thumbs">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      className={`sp-view-thumb ${i === activeImg ? 'active' : ''}`} 
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
               </div>
             )}
          </div>
          <div className="sp-view-content">
            <header className="sp-view-header">
              <h2 className="sp-view-title">{product.productName}</h2>
              <button className="sp-close-btn" onClick={onClose}><X size={20} /></button>
            </header>
            
            <div className="sp-view-body">
              <div className="sp-view-meta">
                <div className="sp-view-meta-item">
                  <span className="label">Category</span>
                  <span className="value">{fmtCat(product.category)}</span>
                </div>
                <div className="sp-view-meta-item">
                  <span className="label">Gender</span>
                  <span className="value">{fmtGender(product.gender)}</span>
                </div>
              </div>

              <div className="sp-view-section">
                <h4 className="section-title">Description</h4>
                <p className="section-text">{product.description || "No description provided."}</p>
              </div>

              <div className="sp-view-section">
                <h4 className="section-title">Colors</h4>
                <div className="sp-color-chips">
                  {(product.availableColors || product.colors || []).map((c, i) => (
                    <span key={i} className="chip">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <footer className="sp-view-footer">
              <button className="sp-btn sp-btn--outline" onClick={onClose}>Close</button>
              <button className="sp-btn sp-btn--primary" onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                View Live <ExternalLink size={14} />
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main SupplierProducts ────────────────────────────────────────
export default function SupplierProducts() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGender, setActiveGender] = useState('MALE');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  
  const [formData, setFormData] = useState({ 
    productName: '', 
    category: 'CASUAL_WEAR', 
    gender: 'MALE', 
    description: '', 
    availableColors: [],
    additionalImagePaths: [null, null, null]
  });
  const [colorInput, setColorInput] = useState('');
  const [mainImagePath, setMainImagePath] = useState('');
  const [previews, setPreviews] = useState({ main: null, subs: [null, null, null] });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const isModalOpen = showAdd || editProduct || viewProduct;
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showAdd, editProduct, viewProduct]);

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
      const matchesSearch = p.productName.toLowerCase().includes(search.toLowerCase()) || fmtCat(p.category).toLowerCase().includes(search.toLowerCase());
      return matchesGender && matchesSearch;
    });
  }, [products, activeGender, search]);

  const grouped = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat.key] = filtered.filter(p => p.category === cat.key);
      return acc;
    }, {});
  }, [filtered]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete this product?")) return;
    try {
      const token = localStorage.getItem('sellerToken');
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) fetchProducts(seller.id);
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = async (e, index = -1) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    if (index === -1) {
      setPreviews(prev => ({ ...prev, main: localUrl }));
    } else {
      const newSubs = [...previews.subs];
      newSubs[index] = localUrl;
      setPreviews(prev => ({ ...prev, subs: newSubs }));
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('gender', formData.gender);
    data.append('category', formData.category);
    data.append('sellerName', seller.storeName || seller.username || 'unknown');
    data.append('productName', formData.productName || 'product');

    try {
      const res = await fetch('/api/upload/image', { method: 'POST', body: data });
      if (res.ok) {
        const result = await res.json();
        if (index === -1) {
          setMainImagePath(result.url);
        } else {
          const newPaths = [...formData.additionalImagePaths];
          newPaths[index] = result.url;
          setFormData({ ...formData, additionalImagePaths: newPaths });
        }
      }
    } catch (err) { console.error('Upload Error:', err); }
    finally { setUploading(false); }
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    if (formData.availableColors.includes(colorInput.trim())) return;
    setFormData({ ...formData, availableColors: [...formData.availableColors, colorInput.trim()] });
    setColorInput('');
  };

  const removeColor = (color) => {
    setFormData({ ...formData, availableColors: formData.availableColors.filter(c => c !== color) });
  };

  const removeImage = (index = -1) => {
    if (index === -1) {
      setMainImagePath('');
      setPreviews(prev => ({ ...prev, main: null }));
    } else {
      const newPaths = [...formData.additionalImagePaths];
      newPaths[index] = null;
      setFormData({ ...formData, additionalImagePaths: newPaths });
      
      const newPreviews = [...previews.subs];
      newPreviews[index] = null;
      setPreviews(prev => ({ ...prev, subs: newPreviews }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainImagePath) return alert("Please upload a product image.");
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`/api/products/add?sellerId=${seller.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...formData,
          mainImagePath,
          additionalImagePaths: formData.additionalImagePaths.filter(p => p !== null)
        })
      });

      if (response.ok) {
        setShowAdd(false);
        setFormData({ 
          productName: '', 
          category: 'CASUAL_WEAR', 
          gender: 'MALE', 
          description: '', 
          availableColors: [],
          additionalImagePaths: [null, null, null]
        });
        setMainImagePath('');
        setPreviews({ main: null, subs: [null, null, null] });
        fetchProducts(seller.id);
      } else {
        const err = await response.json();
        alert(err.message || "Failed to add product");
      }
    } catch (err) { console.error('Create Error:', err); }
    finally { setSubmitting(false); }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    const additionals = [null, null, null];
    if (p.additionalImagePaths) {
      p.additionalImagePaths.forEach((path, i) => { if (i < 3) additionals[i] = path; });
    }
    setFormData({
      productName: p.productName,
      category: p.category,
      gender: p.gender,
      description: p.description,
      availableColors: p.availableColors || [],
      additionalImagePaths: additionals
    });
    setMainImagePath(p.mainImagePath);
    setPreviews({ main: p.mainImagePath, subs: additionals });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await fetch(`/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...formData,
          mainImagePath,
          additionalImagePaths: formData.additionalImagePaths.filter(p => p !== null)
        })
      });

      if (response.ok) {
        setEditProduct(null);
        setFormData({ 
          productName: '', 
          category: 'CASUAL_WEAR', 
          gender: 'MALE', 
          description: '', 
          availableColors: [],
          additionalImagePaths: [null, null, null]
        });
        setMainImagePath('');
        setPreviews({ main: null, subs: [null, null, null] });
        fetchProducts(seller.id);
      } else {
        const err = await response.json();
        alert(err.message || "Failed to update product");
      }
    } catch (err) { console.error('Update Error:', err); }
    finally { setEditing(false); }
  };

  if (!seller) return <div className="sp-sync"><div className="loader" /></div>;

  return (
    <div className="sp-container">
      <header className="sp-header">
        <div>
          <h1 className="sp-title">Product Catalog</h1>
          <p className="sp-subtitle">Manage your collections and showcase your items</p>
        </div>
        <button className="sp-btn sp-btn--primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Cancel' : 'Add New Product'}
        </button>
      </header>

      {/* ── Collection Tabs ── */}
      <div className="sp-tabs">
        <button className={`sp-tab ${activeGender === 'MALE' ? 'active' : ''}`} onClick={() => setActiveGender('MALE')}>
          Men's Collection
          <span className="sp-tab-badge">{products.filter(p => p.gender === 'MALE').length}</span>
        </button>
        <button className={`sp-tab ${activeGender === 'FEMALE' ? 'active' : ''}`} onClick={() => setActiveGender('FEMALE')}>
          Women's Collection
          <span className="sp-tab-badge">{products.filter(p => p.gender === 'FEMALE').length}</span>
        </button>
      </div>

      {/* ── Control Bar ── */}
      <div className="sp-controls">
        <div className="sp-search-wrap">
          <Search size={18} className="sp-search-icon" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Add Form (Simplified Redesign UI) ── */}
      {showAdd && (
        <form className="sp-add-form" onSubmit={handleSubmit}>
           <div className="sp-form-grid">
              <div className="sp-form-section">
                 <h4 className="sp-form-label">General Information</h4>
                 <div className="sp-input-group">
                    <label>Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Classic Linen Shirt" 
                      required 
                      value={formData.productName}
                      onChange={e => setFormData({...formData, productName: e.target.value})}
                    />
                 </div>
                 <div className="sp-input-row">
                    <div className="sp-input-group">
                       <label>Category</label>
                       <select 
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                       >
                          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                       </select>
                    </div>
                    <div className="sp-input-group">
                       <label>Gender</label>
                       <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                          {GENDERS.map(g => <option key={g} value={g}>{fmtGender(g)}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="sp-input-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Tell your customers more about this product..." 
                      rows="3" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>
                 <div className="sp-input-group" style={{ marginTop: '10px' }}>
                    <label>Available Colors</label>
                    <div className="sp-color-input-wrap">
                       <input 
                         type="text" 
                         placeholder="e.g. Black, White" 
                         value={colorInput}
                         onChange={e => setColorInput(e.target.value)}
                         onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                       />
                       <button type="button" className="sp-btn sp-btn--outline" onClick={addColor}>Add</button>
                    </div>
                    <div className="sp-color-chips" style={{ marginTop: '10px' }}>
                      {formData.availableColors.map(c => (
                        <span key={c} className="chip">
                          {c}
                          <X size={12} onClick={() => removeColor(c)} style={{ cursor: 'pointer', marginLeft: '4px' }} />
                        </span>
                      ))}
                    </div>
                 </div>
              </div>
              <div className="sp-form-section">
                 <h4 className="sp-form-label">Media & Aesthetics</h4>
                 <div className="sp-media-grid">
                    <div className={`sp-upload-area sp-upload-area--main ${previews.main ? 'has-img' : ''}`}>
                       {previews.main ? (
                         <>
                           <img src={previews.main} alt="Preview" className="sp-upload-preview" />
                           <button type="button" className="sp-remove-img" onClick={() => removeImage(-1)}><X size={14} /></button>
                         </>
                       ) : (
                         <>
                           <UploadCloud size={24} />
                           <p>{uploading ? '...' : 'Main Image*'}</p>
                         </>
                       )}
                       <input type="file" hidden id="main-up" onChange={e => handleImageUpload(e, -1)} accept="image/*" />
                       <label htmlFor="main-up" className="sp-upload-overlay">
                         {previews.main ? 'Change' : 'Upload'}
                       </label>
                    </div>

                    <div className="sp-additional-grid">
                       {[0, 1, 2].map(idx => (
                         <div key={idx} className={`sp-upload-area sp-upload-area--sub ${previews.subs[idx] ? 'has-img' : ''}`}>
                            {previews.subs[idx] ? (
                              <>
                                <img src={previews.subs[idx]} alt="" className="sp-upload-preview" />
                                <button type="button" className="sp-remove-img" onClick={() => removeImage(idx)}><X size={12} /></button>
                              </>
                            ) : (
                              <Plus size={16} />
                            )}
                            <input type="file" hidden id={`sub-up-${idx}`} onChange={e => handleImageUpload(e, idx)} accept="image/*" />
                            <label htmlFor={`sub-up-${idx}`} className="sp-upload-overlay">
                              {previews.subs[idx] ? 'Edit' : 'Add'}
                            </label>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           <div className="sp-form-footer">
              <button type="button" className="sp-btn sp-btn--ghost" onClick={() => setShowAdd(false)}>Discard</button>
              <button type="submit" className="sp-btn sp-btn--primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Publish Product'}
              </button>
           </div>
        </form>
      )}

      {/* ── Tables ── */}
      <div className="sp-sections">
        {loading ? (
          <div className="sp-empty">Syncing catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="sp-empty">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Your search or category didn't match any items in your collection.</p>
          </div>
        ) : (
          CATEGORIES.map(cat => (
            <CategoryTable 
              key={cat.key}
              category={cat}
              products={grouped[cat.key] || []}
              onView={setViewProduct}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* ── Modals (Portal to Body) ── */}
      {viewProduct && createPortal(
        <ViewModal product={viewProduct} onClose={() => setViewProduct(null)} />,
        document.body
      )}
      
      {editProduct && createPortal(
        <div className="sp-overlay" onClick={() => setEditProduct(null)}>
          <div className="sp-modal sp-modal--edit" onClick={e => e.stopPropagation()}>
            <header className="sp-modal-header">
              <h3 className="sp-modal-title">Edit Product Details</h3>
              <button className="sp-close-btn" onClick={() => setEditProduct(null)}><X size={20} /></button>
            </header>
            <form onSubmit={handleSaveEdit}>
              <div className="sp-modal-body">
                <div className="sp-form-grid">
                  <div className="sp-form-section">
                    <h4 className="sp-form-label">Product Identity</h4>
                    <div className="sp-input-group">
                      <label>Product Name</label>
                      <input 
                        value={formData.productName} 
                        onChange={e => setFormData({...formData, productName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="sp-input-row">
                      <div className="sp-input-group">
                        <label>Category</label>
                        <select 
                          value={formData.category} 
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="sp-input-group">
                        <label>Gender</label>
                        <select 
                          value={formData.gender} 
                          onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                          {GENDERS.map(g => <option key={g} value={g}>{fmtGender(g)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="sp-input-group">
                      <label>Description</label>
                      <textarea 
                        value={formData.description || ''} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        rows="4"
                      />
                    </div>
                    <div className="sp-input-group" style={{ marginTop: '10px' }}>
                      <label>Colors</label>
                      <div className="sp-color-input-wrap">
                         <input 
                           type="text" 
                           placeholder="Add color" 
                           value={colorInput}
                           onChange={e => setColorInput(e.target.value)}
                           onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                         />
                         <button type="button" className="sp-btn sp-btn--outline" onClick={addColor}>Add</button>
                      </div>
                      <div className="sp-color-chips" style={{ marginTop: '10px' }}>
                        {formData.availableColors.map(c => (
                          <span key={c} className="chip">
                            {c}
                            <X size={12} onClick={() => removeColor(c)} style={{ cursor: 'pointer', marginLeft: '4px' }} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sp-form-section">
                    <h4 className="sp-form-label">Visuals & Meta</h4>
                    <div className="sp-media-grid" style={{ marginBottom: '20px' }}>
                      <div className={`sp-upload-area sp-upload-area--main ${previews.main ? 'has-img' : ''}`}>
                        {previews.main ? (
                          <>
                            <img src={previews.main} alt="" className="sp-upload-preview" />
                            <button type="button" className="sp-remove-img" onClick={() => removeImage(-1)}><X size={14} /></button>
                          </>
                        ) : (
                          <UploadCloud size={24} />
                        )}
                        <input type="file" hidden id="edit-main" onChange={e => handleImageUpload(e, -1)} accept="image/*" />
                        <label htmlFor="edit-main" className="sp-upload-overlay">Main</label>
                      </div>
                      <div className="sp-additional-grid">
                        {[0, 1, 2].map(idx => (
                          <div key={idx} className={`sp-upload-area sp-upload-area--sub ${previews.subs[idx] ? 'has-img' : ''}`}>
                            {previews.subs[idx] ? (
                              <>
                                <img src={previews.subs[idx]} alt="" className="sp-upload-preview" />
                                <button type="button" className="sp-remove-img" onClick={() => removeImage(idx)}><X size={12} /></button>
                              </>
                            ) : (
                              <Plus size={16} />
                            )}
                            <input type="file" hidden id={`edit-sub-${idx}`} onChange={e => handleImageUpload(e, idx)} accept="image/*" />
                            <label htmlFor={`edit-sub-${idx}`} className="sp-upload-overlay">+{idx+1}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="sp-modal-footer">
                <button type="button" className="sp-btn sp-btn--ghost" onClick={() => setEditProduct(null)}>Discard Changes</button>
                <button type="submit" className="sp-btn sp-btn--primary" disabled={editing}>
                  {editing ? 'Syncing...' : 'Save Changes'}
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

