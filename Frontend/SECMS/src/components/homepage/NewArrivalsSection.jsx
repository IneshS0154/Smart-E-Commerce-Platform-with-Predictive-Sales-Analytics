import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './NewArrivalsSection.css';

// ── Helpers ─────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

const fmtCategory = (s) =>
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '';

// Gender badge colours
const genderStyle = (g) =>
  g === 'MALE'
    ? { bg: '#eef0ff', color: '#4f46e5', label: "Men's" }
    : { bg: '#fdf2f8', color: '#db2777', label: "Women's" };

// ── Skeleton card placeholder ──────────────────────────────────
function SkeletonCard() {
  return (
    <div className="na-card na-card--skeleton">
      <div className="na-card__img-wrap na-skeleton" />
      <div className="na-card__body">
        <div className="na-skeleton na-skeleton--line" style={{ width: '60%', height: 10 }} />
        <div className="na-skeleton na-skeleton--line" style={{ width: '90%', height: 14, marginTop: 8 }} />
        <div className="na-skeleton na-skeleton--line" style={{ width: '40%', height: 10, marginTop: 8 }} />
        <div className="na-skeleton na-skeleton--line" style={{ width: '55%', height: 12, marginTop: 16 }} />
        <div className="na-skeleton na-skeleton--btn" />
      </div>
    </div>
  );
}

// ── Product card ───────────────────────────────────────────────
function ProductCard({ product }) {
  const gs = genderStyle(product.gender);
  const colorsCount = product.colors?.length ?? 0;

  return (
    <Link to={`/product/${product.id}`} className="na-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Image */}
      <div className="na-card__img-wrap">
        {product.mainImagePath ? (
          <img
            className="na-card__img"
            src={product.mainImagePath}
            alt={product.productName}
            loading="lazy"
          />
        ) : (
          <div className="na-card__img-placeholder">No Image</div>
        )}
        {/* Gender badge */}
        <span
          className="na-card__gender-badge"
          style={{ background: gs.bg, color: gs.color }}
        >
          {gs.label}
        </span>
        {/* "New" tag */}
        <span className="na-card__new-tag">NEW</span>
      </div>

      {/* Info */}
      <div className="na-card__body">
        <p className="na-card__category">{fmtCategory(product.category)}</p>
        <h3 className="na-card__name">{product.productName}</h3>

        {colorsCount > 0 && (
          <p className="na-card__meta">{colorsCount} colour{colorsCount !== 1 ? 's' : ''} available</p>
        )}

        <div className="na-card__bottom">
          <span className="na-card__price">
            {product.price ? fmtPrice(product.price) : 'SOLD OUT'}
          </span>
          <button className="na-card__btn" onClick={e => e.preventDefault()}>Add to Bag</button>
        </div>
      </div>
    </Link>
  );
}

// ── Main section ───────────────────────────────────────────────
function NewArrivalsSection() {
  const headerRef = useScrollAnimation('fadeInUp');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeGender, setActiveGender] = useState('ALL'); // ALL | MALE | FEMALE

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch('/api/products/new-arrivals?limit=3', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Could not load arrivals.');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const displayed = products.filter(
    (p) => activeGender === 'ALL' || p.gender === activeGender
  );

  const menCount = products.filter((p) => p.gender === 'MALE').length;
  const womenCount = products.filter((p) => p.gender === 'FEMALE').length;

  return (
    <section className="arrivals">
      {/* ── Header ── */}
      <div className="arrivals__header" ref={headerRef}>
        <h2 className="arrivals__title">NEW ARRIVALS, NEW JOURNEYS.</h2>
        <a href="/shop" className="arrivals__view-all">View All</a>
      </div>

      {/* ── Gender filter tabs ── */}
      {!loading && !error && products.length > 0 && (
        <div className="na-tabs">
          {[
            { key: 'ALL', label: 'All', count: products.length },
            { key: 'MALE', label: "Men's", count: menCount },
            { key: 'FEMALE', label: "Women's", count: womenCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              className={`na-tab ${activeGender === key ? 'na-tab--active' : ''}`}
              onClick={() => setActiveGender(key)}
            >
              {label}
              <span className="na-tab__count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="arrivals__grid">
        {loading ? (
          // Skeleton placeholders — 6 total
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <p className="na-error">{error}</p>
        ) : displayed.length === 0 ? (
          <p className="na-empty">No products found.</p>
        ) : (
          displayed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}

export default NewArrivalsSection;
