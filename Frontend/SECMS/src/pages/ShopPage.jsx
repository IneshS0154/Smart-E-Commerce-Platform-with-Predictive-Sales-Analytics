import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import './ShopPage.css';

// ─────────────────────────────────────────────
//  Images for category tiles
// ─────────────────────────────────────────────
import m_c1 from '../assets/images/Cat/Men/casual/TVSm0554.webp';
import m_c2 from '../assets/images/Cat/Men/casual/2.webp';
import w_c1 from '../assets/images/Cat/Women/casual/4.webp';

import m_f1 from '../assets/images/Cat/Men/formal/1.webp';
import w_f1 from '../assets/images/Cat/Women/formal/2.webp';
import w_f2 from '../assets/images/Cat/Women/formal/3.webp';

import m_s1 from '../assets/images/Cat/Men/sports/1.webp';
import w_s1 from '../assets/images/Cat/Women/sports/1.webp';
import m_s2 from '../assets/images/Cat/Men/sports/2.webp';

import m_o1 from '../assets/images/Cat/Men/outerwear and jackets/1.avif';
import w_o1 from '../assets/images/Cat/Women/outerwear and jackets/1.webp';
import w_o2 from '../assets/images/Cat/Women/outerwear and jackets/2.webp';

import m_p1 from '../assets/images/Cat/Men/party/1.webp';
import w_p1 from '../assets/images/Cat/Women/party/1.webp';
import m_p2 from '../assets/images/Cat/Men/party/2.webp';

// ─────────────────────────────────────────────
//  Slideshow Images
// ─────────────────────────────────────────────
import slide1 from '../assets/images/Shop_slideshow/1.webp';
import slide2 from '../assets/images/Shop_slideshow/2.webp';
import slide3 from '../assets/images/Shop_slideshow/3.webp';

const SLIDES = [slide1, slide2, slide3];


// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const CATEGORIES = [
  { key: 'CASUAL_WEAR', label: 'Casual Wear', images: [w_c1, m_c1, m_c2] },
  { key: 'FORMAL_COLLECTION', label: 'Formal Collection', images: [m_f1, w_f1, w_f2] },
  { key: 'SPORTS_ACTIVE', label: 'Sports & Active', images: [w_s1, m_s1, m_s2] },
  { key: 'OUTERWEAR_JACKETS', label: 'Outerwear & Jackets', images: [m_o1, w_o1, w_o2] },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening', images: [w_p1, m_p1, m_p2] },
];

const CATEGORY_ROUTES = {
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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';
const fmtCat = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
const genderMeta = (g) => g === 'MALE'
  ? { label: "M", bg: '#eef0ff', color: '#4f46e5' }
  : { label: "F", bg: '#fdf2f8', color: '#db2777' };

// ─────────────────────────────────────────────
//  Shared helpers
// ─────────────────────────────────────────────
function sortProducts(products, sort) {
  const arr = [...products];
  if (sort === 'price-asc') return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
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
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);

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
    setIsAdding(true);
    setShowSizeError(false);

    const result = await addToCart(product.id, selectedSize, 1);

    if (result.success) {
      alert('Added to cart successfully!');
    } else {
      setShowSizeError(true);
      alert(result.error || 'Failed to add to cart');
    }
    setIsAdding(false);
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
        {!isSoldOut && <span className="shop-card__new-tag">NEW</span>}
        {isSoldOut && (
          <span className="shop-card__sold-out-tag" style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(255, 0, 0, 0.8)', color: '#fff', padding: '4px 10px',
            borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', zIndex: 2
          }}>
            SOLD OUT
          </span>
        )}
        <div className="shop-card__overlay">
          {!isSoldOut && availableSizes.length > 0 && (
            <div className="shop-card__sizes">
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`shop-card__size-btn ${selectedSize === size ? 'active' : ''}`}
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
            className="shop-card__quick-btn"
            onClick={handleAddToCart}
            disabled={isAdding || isSoldOut || !selectedSize}
          >
            {isSoldOut ? 'Sold Out' : (isAdding ? 'Adding...' : 'Add to Bag')}
          </button>
        </div>
      </div>
      <div className={`shop-card__body ${isSoldOut ? 'shop-card__body--sold-out' : ''}`} style={isSoldOut ? { opacity: 0.6 } : {}}>
        <p className="shop-card__cat">{fmtCat(product.category)}</p>
        <h3 className="shop-card__name">{product.productName}</h3>
        {colors.length > 0 && (
          <p className="shop-card__meta">{colors.length} colour{colors.length !== 1 ? 's' : ''}</p>
        )}
        <div className="shop-card__footer">
          <span className="shop-card__price">{isSoldOut ? 'SOLD OUT' : fmtPrice(product.price)}</span>
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
function TileSlideshow({ images, altText }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    let timerId;
    const initialDelay = Math.random() * 800;

    const startInterval = () => {
      timerId = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 4000); // 4 seconds per slide
    };

    const initialTimer = setTimeout(() => {
      setIdx((prev) => (prev + 1) % images.length);
      startInterval();
    }, 4000 + initialDelay);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(timerId);
    };
  }, [images]);

  return (
    <>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${altText} ${i + 1}`}
          className={`shop-cats__bg ${i === idx ? 'shop-cats__bg--active' : ''}`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
    </>
  );
}

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
            <TileSlideshow images={cat.images} altText={cat.label} />
            <div className="shop-cats__overlay">
              <h3 className="shop-cats__col-label">{cat.label}</h3>
              <div className="shop-cats__links">
                <Link to={CATEGORY_ROUTES.MALE[cat.key]} className="shop-cats__link">Men's</Link>
                <Link to={CATEGORY_ROUTES.FEMALE[cat.key]} className="shop-cats__link">Women's</Link>
              </div>
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
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

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
      const gOk = gender === 'ALL' || p.gender === gender;
      const cOk = category === 'ALL' || p.category === category;
      const sOk = !search || p.productName.toLowerCase().includes(search.toLowerCase());
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
              { v: 'ALL', l: 'All' },
              { v: 'MALE', l: "Men's" },
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

  const [newArrivals, setNewArrivals] = useState([]);
  const [mensProducts, setMensProducts] = useState([]);
  const [womensProducts, setWomensProducts] = useState([]);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [loadingMens, setLoadingMens] = useState(true);
  const [loadingWomens, setLoadingWomens] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

      {/* ── Slideshow Hero ── */}
      <div className="shop-slider">
        {SLIDES.map((src, i) => (
          <div
            key={i}
            className={`shop-slide ${i === currentSlide ? 'is-active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="shop-slider__overlay">
          <div className="shop-slider__content">
            <a href="#browse" className="shop-slider__cta">Browse All</a>
          </div>
          <div className="shop-slider__nav-container">
            <div className="shop-slider__nav">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`shop-slider__dot ${i === currentSlide ? 'is-active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
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
