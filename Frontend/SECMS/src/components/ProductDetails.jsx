import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ProductDetails.css';

const CATEGORY_LABELS = {
  CASUAL_WEAR:        'Casual Wear',
  FORMAL_COLLECTION:  'Formal Collection',
  SPORTS_ACTIVE:      'Sports & Active',
  OUTERWEAR_JACKETS:  'Outerwear & Jackets',
  PARTY_EVENING_WEAR: 'Party & Evening Wear',
};

const CATEGORY_ROUTES = {
  FEMALE: {
    CASUAL_WEAR:        '/womens-casual-wear',
    FORMAL_COLLECTION:  '/womens-formal-collection',
    SPORTS_ACTIVE:      '/womens-sports-active',
    OUTERWEAR_JACKETS:  '/womens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/womens-party-evening-wear',
  },
  MALE: {
    CASUAL_WEAR:        '/mens-casual-wear',
    FORMAL_COLLECTION:  '/mens-formal-collection',
    SPORTS_ACTIVE:      '/mens-sports-active',
    OUTERWEAR_JACKETS:  '/mens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/mens-party-evening-wear',
  },
};

// ── Accordion ───────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pd__accordion">
      <button className="pd__accordion-header" onClick={() => setOpen(o => !o)}>
        {title}
        <span className={`pd__accordion-icon${open ? ' open' : ''}`}>+</span>
      </button>
      {open && <div className="pd__accordion-body">{children}</div>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const touchStartX = useRef(null);

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize,  setSelectedSize]  = useState('');
  const [qty,           setQty]           = useState(1);
  const [addedMsg,      setAddedMsg]      = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctrl = new AbortController();
    setLoading(true); setError('');
    fetch(`/api/products/${productId}`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        setProduct(data);
        setActiveImg(0);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
        setLoading(false);
      })
      .catch(err => { if (err.name !== 'AbortError') { setError('Could not load product.'); setLoading(false); } });
    return () => ctrl.abort();
  }, [productId]);

  if (loading) return (
    <>
      <Navbar />
      <div className="pd">
        <div className="pd__loading"><div className="pd__spinner" /><span>Loading product…</span></div>
      </div>
    </>
  );

  if (error || !product) return (
    <>
      <Navbar />
      <div className="pd">
        <div className="pd__error">
          <span>{error || 'Product not found.'}</span>
          <button className="pd__error-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    </>
  );

  // Build image array
  const images = [
    product.mainImagePath,
    ...(product.additionalImagePaths || []),
  ].filter(Boolean);

  const prev = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg(i => (i + 1) % images.length);

  // Touch swipe on main image
  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  // Stock
  const stockMap = {};
  (product.stocks || []).forEach(s => { stockMap[s.size] = s.stockCount; });
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const selectedStockCount = selectedSize ? (stockMap[selectedSize] || 0) : null;
  const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    setAddedMsg(`Added ${qty}× ${product.productName} (${selectedSize}) to bag`);
    setTimeout(() => setAddedMsg(''), 3500);
  };

  const categoryLabel  = CATEGORY_LABELS[product.category] || product.category;
  const catalogueRoute = CATEGORY_ROUTES[product.gender]?.[product.category] || '/shop';
  const genderLabel    = product.gender === 'FEMALE' ? 'Women' : 'Men';

  return (
    <>
      <Navbar />
      <div className="pd">
        <div className="pd__body">

          {/* Breadcrumb */}
          <nav className="pd__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <Link to={catalogueRoute}>{genderLabel}</Link>
            <span>/</span>
            <Link to={catalogueRoute}>{categoryLabel}</Link>
            <span>/</span>
            <span>{product.productName}</span>
          </nav>

          <div className="pd__grid">

            {/* ══ Gallery ══ */}
            <div className="pd__gallery">

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="pd__thumbs">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      className={`pd__thumb${activeImg === i ? ' active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img src={src} alt={`${product.productName} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="pd__main-image"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images[activeImg] ? (
                  <img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={`${product.productName} — photo ${activeImg + 1}`}
                  />
                ) : (
                  <div className="pd__main-no-image">
                    <span>No image available</span>
                  </div>
                )}

                {/* Left / right arrows */}
                {images.length > 1 && (
                  <>
                    <button className="pd__img-arrow pd__img-arrow--prev" onClick={prev}>&#8249;</button>
                    <button className="pd__img-arrow pd__img-arrow--next" onClick={next}>&#8250;</button>
                    <span className="pd__img-counter">{activeImg + 1} / {images.length}</span>
                  </>
                )}
              </div>
            </div>

            {/* ══ Info Panel ══ */}
            <div className="pd__info">
              {/* Seller badge */}
              <div className="pd__seller-badge">By: {product.sellerName}</div>

              {/* Name */}
              <h1 className="pd__name">{product.productName}</h1>
              <p className="pd__sku">SKU #{String(product.id).padStart(9, '0')}</p>

              {/* Rating (static for now) */}
              <div className="pd__rating">
                <span className="pd__stars">★★★★☆</span>
                <span className="pd__rating-val">4.5</span>
                <span className="pd__rating-count">(32 reviews)</span>
              </div>

              {/* Price + Qty + CTA */}
              <div className="pd__price-row">
                <div className="pd__price">
                  <span className="pd__price-currency">Rs.</span>
                  {parseFloat(product.price).toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                </div>
                <div className="pd__buy-row">
                  <div className="pd__qty">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                    <span>{qty}</span>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      disabled={selectedStockCount !== null && qty >= selectedStockCount}
                    >+</button>
                  </div>
                  <button
                    className="pd__add-btn"
                    onClick={handleAddToCart}
                    disabled={totalStock === 0}
                  >
                    {totalStock === 0 ? 'Out of Stock' : 'Add to Bag'}
                  </button>
                </div>
              </div>

              {/* Success toast */}
              {addedMsg && <p className="pd__added-msg">{addedMsg}</p>}

              {/* Stock indicator */}
              {totalStock > 0 && (
                <span className="pd__stock-indicator">
                  <span className={`pd__stock-dot ${totalStock > 20 ? 'in' : totalStock > 0 ? 'low' : 'out'}`} />
                  {totalStock > 20 ? 'In Stock' : `Only ${totalStock} left`}
                </span>
              )}

              {/* Colors */}
              {product.colors?.length > 0 && (
                <>
                  <p className="pd__section-label">
                    Colour — <strong className="pd__section-value">{selectedColor}</strong>
                  </p>
                  <div className="pd__colors">
                    {product.colors.map(c => (
                      <button
                        key={c}
                        className={`pd__color-chip${selectedColor === c ? ' selected' : ''}`}
                        onClick={() => setSelectedColor(c)}
                      >{c}</button>
                    ))}
                  </div>
                </>
              )}

              {/* Sizes */}
              <p className="pd__section-label" style={{ marginTop: 22 }}>
                Size
                {selectedSize && selectedStockCount !== null && (
                  <strong className="pd__section-value"> — {selectedSize} ({selectedStockCount} left)</strong>
                )}
              </p>
              <div className="pd__sizes">
                {allSizes.map(size => {
                  const stock = stockMap[size] || 0;
                  return (
                    <button
                      key={size}
                      className={`pd__size-btn${selectedSize === size ? ' selected' : ''}`}
                      disabled={stock === 0}
                      onClick={() => { setSelectedSize(size); setQty(1); }}
                    >
                      {size}
                      {stock > 0 && <span className="stock">{stock}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Description */}
              {product.description && (
                <p className="pd__description">{product.description}</p>
              )}

              {/* Accordions */}
              <div className="pd__accordions">
                <Accordion title="Brand" defaultOpen={true}>
                  <strong>{product.sellerName}</strong><br />
                  {genderLabel}'s {categoryLabel}
                </Accordion>
                <Accordion title="About Item">
                  <ul style={{ paddingLeft: '18px', lineHeight: 2 }}>
                    <li>Category: {categoryLabel}</li>
                    <li>Gender: {genderLabel}</li>
                    {product.colors?.length > 0 && <li>Available colours: {product.colors.join(', ')}</li>}
                    <li>Available sizes: {allSizes.filter(s => (stockMap[s] || 0) > 0).join(', ') || 'Out of stock'}</li>
                  </ul>
                </Accordion>
                <Accordion title="Delivery & Returns">
                  <p>Free standard delivery on orders over Rs. 5,000.</p>
                  <p style={{ marginTop: 8 }}>Returns accepted within 14 days of delivery in original condition.</p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
