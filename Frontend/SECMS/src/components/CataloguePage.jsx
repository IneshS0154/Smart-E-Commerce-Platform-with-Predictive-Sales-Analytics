/**
 * CataloguePage — shared component for all 10 category pages.
 * Props:
 *   gender:   'MALE' | 'FEMALE'
 *   category: 'CASUAL_WEAR' | 'FORMAL_COLLECTION' | 'SPORTS_ACTIVE' | 'OUTERWEAR_JACKETS' | 'PARTY_EVENING_WEAR'
 *   title:    Human-readable category name  (e.g. "Casual Wear")
 *   subtitle: Short line underneath the heading
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../context/CartContext';
import './CataloguePage.css';

import m_c from '../assets/images/Cat/Men/casual/TVSm0554.webp';
import w_c from '../assets/images/Cat/Women/casual/1.jpg';
import m_f from '../assets/images/Cat/Men/formal/3.webp';
import w_f from '../assets/images/Cat/Women/formal/3.webp';
import m_s from '../assets/images/Cat/Men/sports/1.webp';
import w_s from '../assets/images/Cat/Women/sports/1.webp';
import m_o from '../assets/images/Cat/Men/outerwear and jackets/1.avif';
import w_o from '../assets/images/Cat/Women/outerwear and jackets/1.webp';
import m_p from '../assets/images/Cat/Men/party/1.webp';
import w_p from '../assets/images/Cat/Women/party/1.webp';

const HERO_BG = {
  MALE: {
    CASUAL_WEAR: m_c,
    FORMAL_COLLECTION: m_f,
    SPORTS_ACTIVE: m_s,
    OUTERWEAR_JACKETS: m_o,
    PARTY_EVENING_WEAR: m_p,
  },
  FEMALE: {
    CASUAL_WEAR: w_c,
    FORMAL_COLLECTION: w_f,
    SPORTS_ACTIVE: w_s,
    OUTERWEAR_JACKETS: w_o,
    PARTY_EVENING_WEAR: w_p,
  }
};

// ── Category metadata ────────────────────────────────────────────
const CATEGORIES = [
  { key: 'CASUAL_WEAR', label: 'Casual Wear' },
  { key: 'FORMAL_COLLECTION', label: 'Formal Collection' },
  { key: 'SPORTS_ACTIVE', label: 'Sports & Active' },
  { key: 'OUTERWEAR_JACKETS', label: 'Outerwear & Jackets' },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening' },
];

const CAT_ROUTES = {
  MALE: {
    CASUAL_WEAR: '/mens-casual-wear',
    FORMAL_COLLECTION: '/mens-formal-collection',
    SPORTS_ACTIVE: '/mens-sports-active',
    OUTERWEAR_JACKETS: '/mens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/mens-party-evening-wear',
  },
  FEMALE: {
    CASUAL_WEAR: '/womens-casual-wear',
    FORMAL_COLLECTION: '/womens-formal-collection',
    SPORTS_ACTIVE: '/womens-sports-active',
    OUTERWEAR_JACKETS: '/womens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/womens-party-evening-wear',
  },
};

// ── Helpers ─────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p != null ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';

const genderMeta = (g) => g === 'MALE'
  ? { label: "M", bg: '#eef0ff', color: '#4f46e5', accent: '#6366f1' }
  : { label: "W", bg: '#fdf2f8', color: '#db2777', accent: '#ec4899' };

const fmtCat = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ── Skeleton card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="cat-card cat-card--skeleton">
      <div className="cat-card__img-wrap cat-shimmer" />
      <div className="cat-card__body">
        <div className="cat-shimmer" style={{ height: 9, width: '55%', borderRadius: 4 }} />
        <div className="cat-shimmer" style={{ height: 13, width: '85%', borderRadius: 4, marginTop: 7 }} />
        <div className="cat-shimmer" style={{ height: 9, width: '40%', borderRadius: 4, marginTop: 6 }} />
        <div className="cat-shimmer" style={{ height: 30, width: '100%', borderRadius: 4, marginTop: 14 }} />
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────
function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const gm = genderMeta(product.gender);
  const colors = product.colors ?? product.availableColors ?? [];

  const totalStock = (product.stocks || []).reduce((sum, s) => sum + s.stockCount, 0);
  const isSoldOut = totalStock === 0;

  const availableSizes = (product.stocks || [])
    .filter(s => s.stockCount > 0)
    .map(s => s.size);

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const handleClick = () => {
    if (product.id) navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem('customerToken');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    const result = await addToCart(product.id, selectedSize, 1);

    if (result.success) {
      alert(`Added to cart: ${product.productName} (Size: ${selectedSize})`);
    } else {
      alert(result.error || 'Failed to add to cart');
    }
    setIsAdding(false);
  };

  return (
    <div className="cat-card" onClick={handleClick}>
      <div className="cat-card__img-wrap">
        {product.mainImagePath ? (
          <img
            className="cat-card__img"
            src={product.mainImagePath}
            alt={product.productName}
            loading="lazy"
          />
        ) : (
          <div className="cat-card__no-img">No Image</div>
        )}
        <span className="cat-card__gender-badge" style={{ background: gm.bg, color: gm.color }}>
          {gm.label}
        </span>
        {!isSoldOut && <span className="cat-card__new-tag">NEW</span>}
        {isSoldOut && (
          <span className="cat-card__new-tag" style={{ background: 'rgba(255, 0, 0, 0.8)', color: '#fff' }}>
            SOLD OUT
          </span>
        )}
        <div className="cat-card__overlay">
          {!isSoldOut && availableSizes.length > 0 && (
            <div className="cat-card__sizes">
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`cat-card__size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
          <button
            className="cat-card__quick-btn"
            onClick={handleAddToCart}
            disabled={isAdding || isSoldOut || !selectedSize}
          >
            {isSoldOut ? 'Sold Out' : (isAdding ? 'Adding...' : 'Add to Bag')}
          </button>
        </div>
      </div>
      <div className={`cat-card__body ${isSoldOut ? 'cat-card__body--sold-out' : ''}`} style={isSoldOut ? { opacity: 0.6 } : {}}>
        <p className="cat-card__cat">{fmtCat(product.category)}</p>
        <h3 className="cat-card__name">{product.productName}</h3>
        {colors.length > 0 && (
          <p className="cat-card__meta">{colors.length} colour{colors.length !== 1 ? 's' : ''}</p>
        )}
        <div className="cat-card__footer">
          <span className="cat-card__price">{isSoldOut ? 'SOLD OUT' : fmtPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────
export default function CataloguePage({ gender, category, title, subtitle }) {
  const navigate = useNavigate();
  const gm = genderMeta(gender);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctrl = new AbortController();
    setLoading(true); setError('');

    fetch(`/api/products/catalogue/${gender}/${category}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(arr);
        setLoading(false);
      })
      .catch(err => { if (err?.name !== 'AbortError') { setError('Failed to load products.'); setLoading(false); } });

    return () => ctrl.abort();
  }, [gender, category]);

  // filtering + sorting
  const displayed = [...products]
    .filter(p => {
      const q = search.trim().toLowerCase();
      return !q || p.productName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
      if (sort === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const collectionTitle = gender === 'MALE' ? "Men's Collection" : "Women's Collection";
  const collectionSubtitle = gender === 'MALE' ? "Newest Arrivals For Him" : "Newest Arrivals For Her";

  const heroImage = HERO_BG[gender]?.[category];

  return (
    <div className="cat-page">
      <Navbar />

      {/* ── Hero Section ── */}
      <div className="cat-hero">
        <div className="cat-hero__content">
          <h1 className="cat-hero__title">{title}</h1>
          <p className="cat-hero__sub">{subtitle}</p>
        </div>

        {/* Circular Sub-Nav */}
        <div className="cat-hero__nav">
          {CATEGORIES.map(c => {
            const isActive = c.key === category;
            const img = HERO_BG[gender]?.[c.key];
            return (
              <button
                key={c.key}
                className={`cat-hero__nav-item ${isActive ? 'cat-hero__nav-item--active' : ''}`}
                onClick={() => navigate(CAT_ROUTES[gender][c.key])}
              >
                <div className="cat-hero__nav-circle">
                  {img && <img src={img} alt={c.label} className="cat-hero__nav-img" />}
                </div>
                <span className="cat-hero__nav-label">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Collection ── */}
      <section className="cat-collection">
        {/* Collection Toolbar */}
        <div className="cat-toolbar">
          {/* Left: Product Count */}
          <div className="cat-toolbar__left">
            <span className="cat-count">{products.length} PRODUCTS</span>
          </div>

          {/* Right: Search & Sort */}
          <div className="cat-toolbar__right">
            {/* Search */}
            <div className="cat-search">
              <span className="cat-search__icon">⌕</span>
              <input
                type="text"
                className="cat-search__input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="cat-search__clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            {/* Sort */}
            <select className="cat-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="cat-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : error
              ? <p className="cat-msg cat-msg--error">{error}</p>
              : displayed.length === 0
                ? (
                  <div className="cat-empty">
                    <p className="cat-empty__title">No products found</p>
                    <p className="cat-empty__sub">
                      {search ? `No results for "${search}"` : 'Check back soon — new stock on the way.'}
                    </p>
                    {search && (
                      <button className="cat-empty__btn" onClick={() => setSearch('')}>Clear search</button>
                    )}
                  </div>
                )
                : displayed.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      <Footer />
    </div>
  );
}
