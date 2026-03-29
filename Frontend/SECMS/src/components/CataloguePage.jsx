/**
 * CataloguePage — shared component for all 10 category pages.
 * Props:
 *   gender:   'MALE' | 'FEMALE'
 *   category: 'CASUAL_WEAR' | 'FORMAL_COLLECTION' | 'SPORTS_ACTIVE' | 'OUTERWEAR_JACKETS' | 'PARTY_EVENING_WEAR'
 *   title:    Human-readable category name  (e.g. "Casual Wear")
 *   subtitle: Short line underneath the heading
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './CataloguePage.css';

// ── Category metadata ────────────────────────────────────────────
const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear'        },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection'  },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active'    },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets'},
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening'    },
];

const CAT_ROUTES = {
  MALE: {
    CASUAL_WEAR:        '/mens-casual-wear',
    FORMAL_COLLECTION:  '/mens-formal-collection',
    SPORTS_ACTIVE:      '/mens-sports-active',
    OUTERWEAR_JACKETS:  '/mens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/mens-party-evening-wear',
  },
  FEMALE: {
    CASUAL_WEAR:        '/womens-casual-wear',
    FORMAL_COLLECTION:  '/womens-formal-collection',
    SPORTS_ACTIVE:      '/womens-sports-active',
    OUTERWEAR_JACKETS:  '/womens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/womens-party-evening-wear',
  },
};

// ── Helpers ─────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p != null ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';

const genderMeta = (g) => g === 'MALE'
  ? { label: "Men's",   bg: '#eef0ff', color: '#4f46e5', accent: '#6366f1' }
  : { label: "Women's", bg: '#fdf2f8', color: '#db2777', accent: '#ec4899' };

// ── Skeleton card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="cp-card cp-card--skeleton">
      <div className="cp-card__img-wrap cp-shimmer" />
      <div className="cp-card__body">
        <div className="cp-shimmer" style={{ height: 9,  width: '50%', borderRadius: 4 }} />
        <div className="cp-shimmer" style={{ height: 13, width: '85%', borderRadius: 4, marginTop: 7 }} />
        <div className="cp-shimmer" style={{ height: 9,  width: '35%', borderRadius: 4, marginTop: 6 }} />
        <div className="cp-shimmer" style={{ height: 32, width: '100%',borderRadius: 4, marginTop: 14 }} />
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────
function ProductCard({ product, gm }) {
  const colors = product.colors ?? product.availableColors ?? [];
  return (
    <Link to={`/product/${product.id}`} className="cp-card" style={{ textDecoration: 'none' }}>
      <div className="cp-card__img-wrap">
        {product.mainImagePath ? (
          <img
            className="cp-card__img"
            src={product.mainImagePath}
            alt={product.productName}
            loading="lazy"
          />
        ) : (
          <div className="cp-card__no-img">No Image</div>
        )}
        <span className="cp-card__gender-badge" style={{ background: gm.bg, color: gm.color }}>
          {gm.label}
        </span>
        <span className="cp-card__new-tag">NEW</span>
        <div className="cp-card__overlay">
          <button className="cp-card__quick-btn" onClick={e => e.preventDefault()}>
            Add to Bag
          </button>
        </div>
      </div>
      <div className="cp-card__body">
        <p className="cp-card__cat">{product.category?.replace(/_/g, ' ')}</p>
        <h3 className="cp-card__name">{product.productName}</h3>
        {colors.length > 0 && (
          <p className="cp-card__meta">{colors.length} colour{colors.length !== 1 ? 's' : ''}</p>
        )}
        <div className="cp-card__footer">
          <span className="cp-card__price">{fmtPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Main exported component ──────────────────────────────────────
export default function CataloguePage({ gender, category, title, subtitle }) {
  const navigate = useNavigate();
  const gm = genderMeta(gender);

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [sort,     setSort]     = useState('newest');
  const [search,   setSearch]   = useState('');
  const [maxPrice, setMaxPrice] = useState(99999);
  const [priceMax, setPriceMax] = useState(99999);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctrl = new AbortController();
    setLoading(true); setError('');

    fetch(`/api/products/catalogue/${gender}/${category}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(arr);
        if (arr.length > 0) {
          const top = Math.ceil(Math.max(...arr.map(p => parseFloat(p.price) || 0)));
          setMaxPrice(top || 99999);
          setPriceMax(top || 99999);
        }
        setLoading(false);
      })
      .catch(err => { if (err?.name !== 'AbortError') { setError('Failed to load products.'); setLoading(false); } });

    return () => ctrl.abort();
  }, [gender, category]);

  // filtering + sorting
  const displayed = [...products]
    .filter(p => {
      const price = parseFloat(p.price) || 0;
      const q     = search.trim().toLowerCase();
      return price <= priceMax && (!q || p.productName.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sort === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  // sibling categories for quick nav
  const siblings = CATEGORIES.filter(c => c.key !== category);

  return (
    <div className="cp-page">
      <Navbar />

      {/* ── Category hero ── */}
      <div className="cp-hero" style={{ '--cp-accent': gm.accent }}>
        {/* Ghost oversized text — decorative */}
        <span className="cp-hero__ghost" aria-hidden="true">{title.slice(0,2)}</span>

        <div className="cp-hero__content">
          <div className="cp-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <Link to={CAT_ROUTES[gender === 'MALE' ? 'MALE' : 'FEMALE'][category]}>{gm.label}</Link>
            <span>/</span>
            <span>{title}</span>
          </div>

          <div className="cp-hero__eyebrow-row">
            <span className="cp-hero__rule" />
            <p className="cp-hero__eyebrow">{gm.label}</p>
          </div>

          <h1 className="cp-hero__title">{title}</h1>
          <p className="cp-hero__sub">{subtitle}</p>

          <div className="cp-hero__stats">
            {!loading && <span className="cp-hero__badge">{products.length} products</span>}
          </div>
        </div>
      </div>

      {/* ── Quick category nav ── */}
      <nav className="cp-cat-nav">
        <span className="cp-cat-nav__label">Browse {gm.label}</span>
        <div className="cp-cat-nav__pills">
          {CATEGORIES.map(c => (
            <Link
              key={c.key}
              to={CAT_ROUTES[gender][c.key]}
              className={`cp-cat-nav__pill ${c.key === category ? 'cp-cat-nav__pill--active' : ''}`}
            >
              {c.label}
            </Link>
          ))}
        </div>
        {/* Switch gender */}
        <Link
          to={CAT_ROUTES[gender === 'MALE' ? 'FEMALE' : 'MALE'][category]}
          className="cp-cat-nav__switch"
          style={{ color: gm.color }}
        >
          View {gender === 'MALE' ? "Women's" : "Men's"} →
        </Link>
      </nav>

      {/* ── Toolbar + Grid ── */}
      <main className="cp-main">
        {/* Filter / sort bar */}
        <div className="cp-toolbar">
          <div className="cp-toolbar__left">
            <span className="cp-toolbar__count">
              {loading ? 'Loading…' : `${displayed.length} of ${products.length} products`}
            </span>

            {/* Price slider */}
            {!loading && maxPrice > 0 && (
              <label className="cp-toolbar__price-label">
                <span>Up to Rs.{priceMax.toLocaleString('en-IN')}</span>
                <input
                  type="range" min={0} max={maxPrice} step={100}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="cp-price-slider"
                  style={{ '--cp-accent': gm.accent }}
                />
              </label>
            )}
          </div>

          <div className="cp-toolbar__right">
            {/* Search */}
            <div className="cp-search">
              <span className="cp-search__icon">⌕</span>
              <input
                type="text"
                className="cp-search__input"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="cp-search__clear" onClick={() => setSearch('')}>✕</button>}
            </div>

            {/* Sort */}
            <select
              className="cp-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="cp-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : error
              ? <p className="cp-msg cp-msg--error">{error}</p>
              : displayed.length === 0
                ? (
                  <div className="cp-empty">
                    <p className="cp-empty__title">No products found</p>
                    <p className="cp-empty__sub">
                      {search ? `No results for "${search}"` : 'Check back soon — new stock on the way.'}
                    </p>
                    {search && (
                      <button className="cp-empty__btn" onClick={() => setSearch('')}>Clear search</button>
                    )}
                  </div>
                )
                : displayed.map(p => <ProductCard key={p.id} product={p} gm={gm} />)
          }
        </div>
      </main>

      <Footer />
    </div>
  );
}
