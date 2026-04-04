import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useCart } from '../../context/CartContext';
import './SupplierShopPage.css';

// ── helpers ──────────────────────────────────────────────────────
const fmtPrice = (p) =>
  p != null ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';

const CATS = [
  { key: 'ALL',                label: 'All' },
  { key: 'CASUAL_WEAR',        label: 'Casual Wear' },
  { key: 'FORMAL_COLLECTION',  label: 'Formal Collection' },
  { key: 'SPORTS_ACTIVE',      label: 'Sports & Active' },
  { key: 'OUTERWEAR_JACKETS',  label: 'Outerwear' },
  { key: 'PARTY_EVENING_WEAR', label: 'Party & Evening' },
];

const GENDERS = [
  { key: 'ALL',    label: 'All' },
  { key: 'MALE',   label: "Men's" },
  { key: 'FEMALE', label: "Women's" },
];

// ── Star display ─────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="ssp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`ssp-star ${i <= Math.round(rating) ? 'ssp-star--on' : ''}`}>★</span>
      ))}
      <span className="ssp-stars__val">{rating?.toFixed(1)}</span>
    </span>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="ssp-card ssp-card--skeleton">
      <div className="ssp-card__img ssp-shimmer" />
      <div className="ssp-card__body">
        <div className="ssp-shimmer" style={{ height: 8, width: '40%', borderRadius: 4 }} />
        <div className="ssp-shimmer" style={{ height: 14, width: '80%', borderRadius: 4, marginTop: 8 }} />
        <div className="ssp-shimmer" style={{ height: 8, width: '30%', borderRadius: 4, marginTop: 6 }} />
        <div className="ssp-shimmer" style={{ height: 36, width: '100%', borderRadius: 6, marginTop: 14 }} />
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────
function ProductCard({ product, idx }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // ── Correct field names from the backend ──
  const mainImg  = product.mainImagePath;
  const hoverImg = product.imagePaths?.[0] ?? product.additionalImagePaths?.[0] ?? null;

  const availableSizes = (product.stocks || [])
    .filter(s => s.stockCount > 0)
    .map(s => s.size);

  const totalStock = (product.stocks || []).reduce((sum, s) => sum + s.stockCount, 0);
  const isSoldOut  = totalStock === 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('customerToken');
    if (!token) { alert('Please login to add items to cart'); return; }
    if (!selectedSize) return;
    setIsAdding(true);
    const result = await addToCart(product.id, selectedSize, 1);
    if (result?.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } else {
      alert(result?.error || 'Failed to add to cart');
    }
    setIsAdding(false);
  };

  const genderBadge = product.gender === 'MALE'
    ? { label: "Men's", cls: 'ssp-badge--men' }
    : { label: "Women's", cls: 'ssp-badge--women' };

  return (
    <div
      className="ssp-card"
      style={{ animationDelay: `${(idx % 12) * 0.04}s` }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="ssp-card__img-wrap">
        {mainImg ? (
          <>
            <img src={mainImg}  alt={product.productName} className="ssp-card__img ssp-card__img--main" loading="lazy" />
            {hoverImg && <img src={hoverImg} alt="" className="ssp-card__img ssp-card__img--hover" loading="lazy" />}
          </>
        ) : (
          <div className="ssp-card__no-img">NO IMAGE</div>
        )}
        <span className={`ssp-card__badge ${genderBadge.cls}`}>{genderBadge.label}</span>
        {isSoldOut && <span className="ssp-card__sold-out">SOLD OUT</span>}
      </div>

      <div className="ssp-card__body">
        <p className="ssp-card__cat">{product.category?.replace(/_/g, ' ')}</p>
        <h3 className="ssp-card__name">{product.productName}</h3>
        <p className="ssp-card__price">{isSoldOut ? '—' : fmtPrice(product.price)}</p>

        {availableSizes.length > 0 && (
          <div className="ssp-card__sizes" onClick={e => e.stopPropagation()}>
            {availableSizes.map(s => (
              <button
                key={s}
                className={`ssp-size-btn ${selectedSize === s ? 'ssp-size-btn--active' : ''}`}
                onClick={() => setSelectedSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          className={`ssp-card__cta ${added ? 'ssp-card__cta--added' : ''}`}
          onClick={handleAdd}
          disabled={isSoldOut || !selectedSize || isAdding || added}
        >
          {isSoldOut ? 'Sold Out' : added ? '✓ Added' : isAdding ? 'Adding…' : selectedSize ? 'Add to Cart' : 'Select a Size'}
        </button>
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────
export default function SupplierShopPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller]           = useState(null);
  const [products, setProducts]       = useState([]);
  const [rating, setRating]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [catFilter, setCatFilter]     = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('DEFAULT');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    Promise.all([
      fetch(`/api/products/supplier/${sellerId}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/reviews/seller/${sellerId}/average`).then(r => r.ok ? r.json() : null),
    ])
      .then(([productData, avgRating]) => {
        const prods = productData || [];
        setProducts(prods);
        setRating(avgRating);
        // Derive seller info from the first product (all products share sellerId + sellerName)
        if (prods.length > 0) {
          setSeller({ id: prods[0].sellerId, storeName: prods[0].sellerName });
        } else {
          // No products → still show a shell page by fetching from /all and matching
          fetch('/api/sellers/all')
            .then(r => r.ok ? r.json() : [])
            .then(all => {
              const match = all.find(s => String(s.id) === String(sellerId));
              setSeller(match || null);
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sellerId]);

  // ── Filtered & sorted products ──────────────────────────────────
  const displayed = products
    .filter(p => catFilter    === 'ALL' || p.category === catFilter)
    .filter(p => genderFilter === 'ALL' || p.gender   === genderFilter)
    .filter(p => !search.trim() || p.productName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'PRICE_ASC')  return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'PRICE_DESC') return parseFloat(b.price) - parseFloat(a.price);
      if (sort === 'NAME_ASC')   return a.productName.localeCompare(b.productName);
      return 0; // DEFAULT
    });

  // ── Hero initials ────────────────────────────────────────────────
  const initials = (seller?.storeName || 'S').charAt(0).toUpperCase();
  const totalUnits = products.reduce(
    (sum, p) => sum + (p.stocks?.reduce((a, s) => a + s.stockCount, 0) || 0), 0
  );

  return (
    <>
      <Navbar />

      {loading ? (
        <div className="ssp-loading">
          <div className="ssp-spinner" />
        </div>
      ) : !seller ? (
        <div className="ssp-not-found">
          <h2>Shop not found.</h2>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      ) : (
        <main className="ssp">

          {/* ── Hero Banner ── */}
          <section className="ssp-hero">
            <div className="ssp-hero__bg" />
            <div className="ssp-hero__noise" />
            <div className="ssp-hero__content">
              <div className="ssp-hero__left">
                <div className="ssp-hero__avatar">{initials}</div>
                <div className="ssp-hero__info">
                  <p className="ssp-hero__eyebrow">Official Store</p>
                  <h1 className="ssp-hero__name">{seller.storeName}</h1>
                  <p className="ssp-hero__meta">
                    {products.length} Product{products.length !== 1 ? 's' : ''}
                    <span className="ssp-hero__dot">·</span>
                    {totalUnits.toLocaleString()} Units Available
                    {rating != null && (
                      <>
                        <span className="ssp-hero__dot">·</span>
                        <Stars rating={rating} />
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="ssp-hero__stats">
                <div className="ssp-hero__stat">
                  <span className="ssp-hero__stat-val">{products.length}</span>
                  <span className="ssp-hero__stat-label">Products</span>
                </div>
                <div className="ssp-hero__stat">
                  <span className="ssp-hero__stat-val">{rating != null ? rating.toFixed(1) : '—'}</span>
                  <span className="ssp-hero__stat-label">Rating</span>
                </div>
                <div className="ssp-hero__stat">
                  <span className="ssp-hero__stat-val">{new Set(products.map(p => p.category)).size}</span>
                  <span className="ssp-hero__stat-label">Categories</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Controls ── */}
          <div className="ssp-controls">
            <div className="ssp-search-wrap">
              <span className="ssp-search-icon">⌕</span>
              <input
                type="text"
                className="ssp-search"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="ssp-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <div className="ssp-filters">
              <div className="ssp-filter-group">
                {GENDERS.map(g => (
                  <button
                    key={g.key}
                    className={`ssp-filter-btn ${genderFilter === g.key ? 'ssp-filter-btn--active' : ''}`}
                    onClick={() => setGenderFilter(g.key)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="ssp-filter-group">
                {CATS.map(c => (
                  <button
                    key={c.key}
                    className={`ssp-filter-btn ${catFilter === c.key ? 'ssp-filter-btn--active' : ''}`}
                    onClick={() => setCatFilter(c.key)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <select
                className="ssp-sort"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="DEFAULT">Sort: Default</option>
                <option value="PRICE_ASC">Price: Low → High</option>
                <option value="PRICE_DESC">Price: High → Low</option>
                <option value="NAME_ASC">Name: A → Z</option>
              </select>
            </div>

            <p className="ssp-result-count">
              {displayed.length} item{displayed.length !== 1 ? 's' : ''}
              {(catFilter !== 'ALL' || genderFilter !== 'ALL' || search) ? ' found' : ''}
            </p>
          </div>

          {/* ── Product Grid ── */}
          <div className="ssp-grid-wrap">
            {displayed.length === 0 ? (
              <div className="ssp-empty">
                <span className="ssp-empty__icon">◎</span>
                <p>No products match your filters.</p>
                <button className="ssp-empty__reset" onClick={() => { setCatFilter('ALL'); setGenderFilter('ALL'); setSearch(''); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="ssp-grid">
                {displayed.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
              </div>
            )}
          </div>

        </main>
      )}

      <Footer />
    </>
  );
}
