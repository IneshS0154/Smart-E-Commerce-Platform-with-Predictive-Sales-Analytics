import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ShopPage.css';

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const CATEGORIES = [
  { key: 'CASUAL_WEAR',        label: 'Casual Wear',        icon: '○' },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection',  icon: '◇' },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active',    icon: '△' },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear & Jackets',icon: '▭' },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening',    icon: '✦' },
];

const CATEGORY_ROUTES = {
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

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

const fmtPrice   = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';
const fmtCat     = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
const genderMeta = (g) => g === 'MALE'
  ? { label: "Men's", bg: '#eef0ff', color: '#4f46e5' }
  : { label: "Women's", bg: '#fdf2f8', color: '#db2777' };

// ─────────────────────────────────────────────
//  Shared helpers
// ─────────────────────────────────────────────
function sortProducts(products, sort) {
  const arr = [...products];
  if (sort === 'price-asc')  return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === 'price-desc') return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─────────────────────────────────────────────
//  Skeleton card
// ─────────────────────────────────────────────
function SkeletonCard({ tall = false }) {
  return (
    <div className={`shop-card shop-card--skeleton ${tall ? 'shop-card--tall' : ''}`}>
      <div className="shop-card__img-wrap shop-shimmer" />
      <div className="shop-card__body">
        <div className="shop-shimmer" style={{ height: 9, width: '55%', borderRadius: 4 }} />
        <div className="shop-shimmer" style={{ height: 13, width: '85%', borderRadius: 4, marginTop: 7 }} />
        <div className="shop-shimmer" style={{ height: 9, width: '40%', borderRadius: 4, marginTop: 6 }} />
        <div className="shop-shimmer" style={{ height: 30, width: '100%', borderRadius: 4, marginTop: 14 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Product card
// ─────────────────────────────────────────────
function ProductCard({ product, tall = false, navigate }) {
  const gm = genderMeta(product.gender);
  const colors = product.colors ?? product.availableColors ?? [];

  const handleClick = () => {
    if (product.id) navigate(`/product/${product.id}`);
  };

  return (
    <div className={`shop-card ${tall ? 'shop-card--tall' : ''}`} onClick={handleClick}>
      <div className="shop-card__img-wrap">
        {product.mainImagePath ? (
          <img
            className="shop-card__img"
            src={product.mainImagePath}
            alt={product.productName}
            loading="lazy"
          />
        ) : (
          <div className="shop-card__no-img">No Image</div>
        )}
        <span className="shop-card__gender-badge" style={{ background: gm.bg, color: gm.color }}>
          {gm.label}
        </span>
        <span className="shop-card__new-tag">NEW</span>
        <div className="shop-card__overlay">
          <button className="shop-card__quick-btn" onClick={e => { e.stopPropagation(); }}>
            Add to Bag
          </button>
        </div>
      </div>
      <div className="shop-card__body">
        <p className="shop-card__cat">{fmtCat(product.category)}</p>
        <h3 className="shop-card__name">{product.productName}</h3>
        {colors.length > 0 && (
          <p className="shop-card__meta">{colors.length} colour{colors.length !== 1 ? 's' : ''}</p>
        )}
        <div className="shop-card__footer">
          <span className="shop-card__price">{fmtPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Section: horizontal scroll rail
// ─────────────────────────────────────────────
function ProductRail({ title, subtitle, products, loading, viewAllHref, navigate }) {
  const railRef = useRef(null);

  const scroll = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="shop-rail">
      <div className="shop-section-head">
        <div>
          <h2 className="shop-section-title">{title}</h2>
          {subtitle && <p className="shop-section-sub">{subtitle}</p>}
        </div>
        <div className="shop-section-head__right">
          {viewAllHref && (
            <Link to={viewAllHref} className="shop-view-all">View All</Link>
          )}
          <button className="shop-rail__arrow" onClick={() => scroll(-1)}>&#8249;</button>
          <button className="shop-rail__arrow" onClick={() => scroll(1)}>&#8250;</button>
        </div>
      </div>

      <div className="shop-rail__track" ref={railRef}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : products.length === 0
            ? <p className="shop-empty">No products yet.</p>
            : products.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)
        }
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Section: Shop by Category grid
// ─────────────────────────────────────────────
function CategoryGrid() {
  return (
    <section className="shop-cats">
      <div className="shop-section-head">
        <div>
          <h2 className="shop-section-title">Shop by Category</h2>
          <p className="shop-section-sub">Five worlds, endless combinations</p>
        </div>
      </div>
      <div className="shop-cats__grid">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="shop-cats__col">
            <p className="shop-cats__col-icon">{cat.icon}</p>
            <p className="shop-cats__col-label">{cat.label}</p>
            <div className="shop-cats__links">
              <Link to={CATEGORY_ROUTES.MALE[cat.key]}   className="shop-cats__link shop-cats__link--men">Men's</Link>
              <Link to={CATEGORY_ROUTES.FEMALE[cat.key]} className="shop-cats__link shop-cats__link--women">Women's</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Section: Full browse with filters
// ─────────────────────────────────────────────
function BrowseAll({ navigate }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [gender,   setGender]   = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [sort,     setSort]     = useState('newest');
  const [search,   setSearch]   = useState('');

  // Fetch all products via new-arrivals (limit high) or per-gender catalogue
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);

    fetch('/api/products/new-arrivals?limit=50', { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') setLoading(false); });

    return () => ctrl.abort();
  }, []);

  const displayed = sortProducts(
    products.filter(p => {
      const gOk  = gender   === 'ALL' || p.gender   === gender;
      const cOk  = category === 'ALL' || p.category === category;
      const sOk  = !search  || p.productName.toLowerCase().includes(search.toLowerCase());
      return gOk && cOk && sOk;
    }),
    sort
  );

  return (
    <section className="shop-browse">
      <div className="shop-section-head">
        <div>
          <h2 className="shop-section-title">Browse Everything</h2>
          <p className="shop-section-sub">{loading ? 'Loading…' : `${displayed.length} products`}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="shop-filters">
        <div className="shop-filters__group">
          {/* Gender */}
          <div className="shop-filters__pills">
            {[
              { v: 'ALL',    l: 'All' },
              { v: 'MALE',   l: "Men's" },
              { v: 'FEMALE', l: "Women's" },
            ].map(({ v, l }) => (
              <button
                key={v}
                className={`shop-pill ${gender === v ? 'shop-pill--active' : ''}`}
                onClick={() => setGender(v)}
              >{l}</button>
            ))}
          </div>

          {/* Category select */}
          <select
            className="shop-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="shop-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="shop-search">
          <span className="shop-search__icon">⌕</span>
          <input
            type="text"
            className="shop-search__input"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="shop-search__clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="shop-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : displayed.length === 0
            ? <p className="shop-empty shop-empty--full">No products match your filters.</p>
            : displayed.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)
        }
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────
export default function ShopPage() {
  const navigate = useNavigate();

  const [newArrivals,   setNewArrivals]   = useState([]);
  const [mensProducts,  setMensProducts]  = useState([]);
  const [womensProducts,setWomensProducts]= useState([]);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [loadingMens,     setLoadingMens]     = useState(true);
  const [loadingWomens,   setLoadingWomens]   = useState(true);

  // New arrivals (combined)
  useEffect(() => {
    fetch('/api/products/new-arrivals?limit=6')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setNewArrivals(Array.isArray(data) ? data : []); setLoadingArrivals(false); })
      .catch(() => setLoadingArrivals(false));
  }, []);

  // Men's newest
  useEffect(() => {
    fetch('/api/products/new-arrivals?limit=10')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const men = Array.isArray(data) ? data.filter(p => p.gender === 'MALE') : [];
        setMensProducts(men);
        setLoadingMens(false);
      })
      .catch(() => setLoadingMens(false));
  }, []);

  // Women's newest
  useEffect(() => {
    fetch('/api/products/new-arrivals?limit=10')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const women = Array.isArray(data) ? data.filter(p => p.gender === 'FEMALE') : [];
        setWomensProducts(women);
        setLoadingWomens(false);
      })
      .catch(() => setLoadingWomens(false));
  }, []);

  return (
    <div className="shop-page">
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="shop-hero">
        <div className="shop-hero__content">
          <p className="shop-hero__eyebrow">The Edit — Spring 2026</p>
          <h1 className="shop-hero__title">Everything.<br />All at once.</h1>
          <p className="shop-hero__sub">
            Curated collections across every occasion, every gender, every vibe.
          </p>
          <a href="#browse" className="shop-hero__cta">Browse All</a>
        </div>
        <div className="shop-hero__deco">
          <div className="shop-hero__deco-ring shop-hero__deco-ring--1" />
          <div className="shop-hero__deco-ring shop-hero__deco-ring--2" />
          <div className="shop-hero__deco-ring shop-hero__deco-ring--3" />
        </div>
      </div>

      {/* ── New Arrivals rail ── */}
      <ProductRail
        title="New Arrivals, New Journeys."
        subtitle="The freshest drops across Men's & Women's"
        products={newArrivals}
        loading={loadingArrivals}
        navigate={navigate}
      />

      {/* ── Category grid ── */}
      <CategoryGrid />

      {/* ── Men's rail ── */}
      <ProductRail
        title="Men's Collection"
        subtitle="Newest arrivals for him"
        products={mensProducts}
        loading={loadingMens}
        viewAllHref="/mens-casual-wear"
        navigate={navigate}
      />

      {/* ── Women's rail ── */}
      <ProductRail
        title="Women's Collection"
        subtitle="Newest arrivals for her"
        products={womensProducts}
        loading={loadingWomens}
        viewAllHref="/womens-casual-wear"
        navigate={navigate}
      />

      {/* ── Full browse ── */}
      <div id="browse">
        <BrowseAll navigate={navigate} />
      </div>

      <Footer />
    </div>
  );
}
