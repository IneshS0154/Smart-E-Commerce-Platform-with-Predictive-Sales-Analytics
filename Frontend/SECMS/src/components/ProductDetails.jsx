import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../context/CartContext';
import reviewAPI from '../api/reviewAPI';
import './ProductDetails.css';

import sizeChartImg from '../assets/images/size_chart.webp';

const CATEGORY_LABELS = {
  CASUAL_WEAR: 'Casual Wear',
  FORMAL_COLLECTION: 'Formal Collection',
  SPORTS_ACTIVE: 'Sports & Active',
  OUTERWEAR_JACKETS: 'Outerwear & Jackets',
  PARTY_EVENING_WEAR: 'Party & Evening Wear',
};

const CATEGORY_ROUTES = {
  FEMALE: {
    CASUAL_WEAR: '/womens-casual-wear',
    FORMAL_COLLECTION: '/womens-formal-collection',
    SPORTS_ACTIVE: '/womens-sports-active',
    OUTERWEAR_JACKETS: '/womens-outerwear-jackets',
    PARTY_EVENING_WEAR: '/womens-party-evening-wear',
  },
  MALE: {
    CASUAL_WEAR: '/mens-casual-wear',
    FORMAL_COLLECTION: '/mens-formal-collection',
    SPORTS_ACTIVE: '/mens-sports-active',
    OUTERWEAR_JACKETS: '/mens-outerwear-jackets',
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

// ── FAQ Accordion ────────────────────────────────────────────────
const SHOP_FAQS = [
  {
    question: "WHEN WILL MY ORDER SHIP?",
    answer: "Orders are typically processed within 1-2 business days. Delivery times vary based on the destination."
  },
  {
    question: "DO YOU SHIP INTERNATIONALLY?",
    answer: "Yes, we ship to most countries worldwide. International shipping rates apply at checkout."
  },
  {
    question: "HOW DO POSTERS SHIP?",
    answer: "All posters are rolled in kraft paper and shipped in heavy-duty protective cardboard tubes."
  },
  {
    question: "DO YOU ACCEPT RETURNS OR EXCHANGES?",
    answer: "Yes, returns are accepted within 14 days of delivery in their original unworn condition."
  },
  {
    question: "WHERE'S MY REFUND?",
    answer: "Refunds typically process within 3-5 business days after we receive your returned item."
  },
  {
    question: "WHAT'S THE DEAL WITH MYSTERY ITEMS?",
    answer: "Mystery items are randomly selected products from our archive, sold at a heavy discount."
  }
];

function FaqAccordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pd__faq-item">
      <button className="pd__faq-header" onClick={() => setOpen(o => !o)}>
        {title}
        <svg className={`pd__faq-icon${open ? ' open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pd__faq-body">{children}</div>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const touchStartX = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filterRating, setFilterRating] = useState(null);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeUnits, setSizeUnits] = useState('INCHES');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Recommended products
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

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
        // Fetch reviews after product is loaded
        fetchReviews(data.id);

        // Fetch recommended similar products
        setRecommendedLoading(true);
        fetch(`/api/products/catalogue/${data.gender}/${data.category}`, { signal: ctrl.signal })
          .then(r => r.ok ? r.json() : Promise.reject(r.status))
          .then(catData => {
            const arr = Array.isArray(catData) ? catData : [];
            let filtered = arr.filter(p => String(p.id) !== String(data.id));

            // Shuffle filtered array to randomize recommendations
            for (let i = filtered.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
            }

            setRecommended(filtered.slice(0, 10)); // Up to 10 products
            setRecommendedLoading(false);
          })
          .catch(() => setRecommendedLoading(false));
      })
      .catch(err => { if (err.name !== 'AbortError') { setError('Could not load product.'); setLoading(false); } });
    return () => ctrl.abort();
  }, [productId]);

  const fetchReviews = async (pid) => {
    setReviewsLoading(true);
    try {
      const [reviewsData, avgData, countData] = await Promise.all([
        reviewAPI.getProductReviews(pid),
        reviewAPI.getProductAverageRating(pid),
        reviewAPI.getProductReviewCount(pid)
      ]);
      setReviews(reviewsData || []);
      setAverageRating(avgData || 0);
      setReviewCount(countData || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Star rating component
  const StarDisplay = ({ rating, size = 16 }) => {
    return (
      <span style={{ color: '#fbbf24', fontSize: size }}>
        {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      </span>
    );
  };

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
  const handleTouchEnd = e => {
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

  const handleAddToCart = async () => {
    if (!selectedSize) { alert('Please select a size'); return; }

    const token = localStorage.getItem('customerToken');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    const result = await addToCart(product.id, selectedSize, qty);

    if (result.success) {
      setAddedMsg(`Added ${qty}× ${product.productName} (${selectedSize}) to bag`);
      setTimeout(() => setAddedMsg(''), 3500);
    } else {
      alert(result.error || 'Failed to add to cart');
    }
    setIsAdding(false);
  };

  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const catalogueRoute = CATEGORY_ROUTES[product.gender]?.[product.category] || '/shop';
  const genderLabel = product.gender === 'FEMALE' ? 'Women' : 'Men';

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
              <Link to={`/shop/${product.sellerId}`} className="pd__seller-badge">By: {product.sellerName}</Link>

              {/* Name */}
              <h1 className="pd__name">{product.productName}</h1>
              <p className="pd__sku">SKU #{String(product.id).padStart(9, '0')}</p>

              {/* Rating - real data */}
              <div className="pd__rating">
                <StarDisplay rating={averageRating} size={18} />
                <span className="pd__rating-val">{averageRating.toFixed(1)}</span>
                <span className="pd__rating-count">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
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
                    disabled={totalStock === 0 || isAdding}
                  >
                    {isAdding ? 'Adding...' : totalStock === 0 ? 'Out of Stock' : 'Add to Bag'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
                <p className="pd__section-label" style={{ margin: 0 }}>
                  Size
                  {selectedSize && selectedStockCount !== null && (
                    <strong className="pd__section-value"> — {selectedSize} ({selectedStockCount} left)</strong>
                  )}
                </p>
                <button
                  className="pd__size-guide-btn"
                  onClick={() => setShowSizeChart(true)}
                >
                  SIZE CHART
                </button>
              </div>
              <div className="pd__sizes" style={{ marginTop: 12 }}>
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

        {/* ══ Reviews Section ══ */}
        <div className="pd__reviews-wrapper">
          <div className="pd__reviews-container">
            <h2 className="pd__reviews-title pd__text-left">CUSTOMER REVIEWS</h2>

            <div className="pd__reviews-grid">
              {/* Left Column */}
              <div className="pd__reviews-sidebar">
                <div className="pd__reviews-summary pd__flex-start">
                  <span className="pd__reviews-avg">{averageRating.toFixed(1)}</span>
                  <div className="pd__reviews-stars-wrap">
                    <StarDisplay rating={averageRating} size={24} />
                    <p className="pd__reviews-count">
                      BASED ON {reviewCount} {reviewCount === 1 ? 'REVIEW' : 'REVIEWS'}
                    </p>
                  </div>
                </div>

                <div className="pd__filter-section">
                  <h4 className="pd__filter-title">FILTER BY RATING</h4>
                  <div className="pd__filter-options">
                    <button
                      className={`pd__filter-btn ${filterRating === null ? 'active' : ''}`}
                      onClick={() => setFilterRating(null)}
                    >
                      <span className="pd__filter-label">All Reviews</span>
                    </button>
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                      return (
                        <button
                          key={stars}
                          className={`pd__filter-btn ${filterRating === stars ? 'active' : ''}`}
                          onClick={() => setFilterRating(stars)}
                          disabled={count === 0}
                        >
                          <div className="pd__filter-stars">
                            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                          </div>
                          <span className="pd__filter-count">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="pd__reviews-list-col">
                {reviewsLoading ? (
                  <div className="pd__reviews-loading">
                    <p>LOADING REVIEWS...</p>
                  </div>
                ) : (() => {
                  const filteredReviews = filterRating
                    ? reviews.filter(r => Math.round(r.rating) === filterRating)
                    : reviews;
                  const displayReviews = filteredReviews.slice(0, 5);

                  if (displayReviews.length === 0) {
                    return (
                      <div className="pd__reviews-empty">
                        <p>{filterRating ? 'NO REVIEWS MATCH THIS RATING.' : 'NO REVIEWS YET. BE THE FIRST TO REVIEW THIS PRODUCT!'}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="pd__reviews-list">
                      {displayReviews.map((review) => (
                        <div key={review.id} className="pd__review-card">
                          <div className="pd__review-header">
                            <div>
                              <p className="pd__review-author">{review.customerName}</p>
                              <div className="pd__review-stars">
                                <StarDisplay rating={review.rating} size={13} />
                              </div>
                            </div>
                            <span className="pd__review-date">
                              {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          {review.reviewText && (
                            <p className="pd__review-text">"{review.reviewText.toUpperCase()}"</p>
                          )}
                        </div>
                      ))}
                      {filteredReviews.length > 5 && (
                        <p className="pd__reviews-note">SHOWING {displayReviews.length} MOST RECENT REVIEWS</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <hr className="pd__divider" /> */}

      {/* ══ You May Also Like Section ══ */}
      {!recommendedLoading && recommended.length > 0 && (
        <>
          <div className="pd__recommended-wrapper">
            <div className="pd__recommended-container">
              <h2 className="pd__recommended-title">You May also like</h2>
              <div className="pd__recommended-list">
                {recommended.map(item => (
                  <div key={item.id} className="pd__rec-card" onClick={() => { navigate(`/product/${item.id}`); window.scrollTo(0, 0); }}>
                    <div className="pd__rec-img-wrap">
                      {item.mainImagePath ? (
                        <img src={item.mainImagePath} alt={item.productName} className="pd__rec-img" loading="lazy" />
                      ) : (
                        <div className="pd__rec-no-img">No Image</div>
                      )}
                      {item.stocks && item.stocks.reduce((acc, s) => acc + s.stockCount, 0) === 0 && (
                        <span className="pd__rec-sale-tag sold-out">SOLD OUT</span>
                      )}
                    </div>
                    <div className="pd__rec-body">
                      <div className="pd__rec-title-row">
                        <h4 className="pd__rec-name">{item.productName}</h4>
                        <span className="pd__rec-price">
                          {item.price != null ? `Rs. ${parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC'}
                        </span>
                      </div>
                      {item.category && <p className="pd__rec-category">{item.category.replace(/_/g, ' ')}</p>}
                      <div className="pd__rec-colors">
                        {(item.colors || item.availableColors || []).map((c, i) => (
                          <div key={i} className="pd__rec-color-dot" title={c} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* <hr className="pd__divider" /> */}
        </>
      )}

      {/* ══ Shop FAQs Section ══ */}
      <div className="pd__faqs-wrapper">
        <div className="pd__faqs-container">
          <h2 className="pd__faqs-title">SHOP FAQS</h2>
          <p className="pd__faqs-subtitle">
            Find answers to our most frequently asked questions below. If you can't find what
            you're looking for please contact us and we'll get in touch with 24 hours.
          </p>
          <div className="pd__faqs-list">
            {SHOP_FAQS.map((faq, index) => (
              <FaqAccordion key={index} title={faq.question}>
                <p>{faq.answer}</p>
              </FaqAccordion>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Size Chart Sidebar ── */}
      {showSizeChart && (
        <>
          <div className="pd__sc-backdrop" onClick={() => setShowSizeChart(false)} />
          <div className="pd__sc-sidebar">
            <div className="pd__sc-header">
              <button className="pd__sc-close" onClick={() => setShowSizeChart(false)}>✕</button>
              <h3 className="pd__sc-title">SIZE CHART</h3>
              <div style={{ width: 24 }} />
            </div>

            <div className="pd__sc-body">
              <div className="pd__sc-toggle-container">
                <span className={`pd__sc-unit ${sizeUnits === 'INCHES' ? 'active' : ''}`}>INCHES</span>
                <button
                  className={`pd__sc-switch ${sizeUnits === 'CM' ? 'on' : 'off'}`}
                  onClick={() => setSizeUnits(u => u === 'INCHES' ? 'CM' : 'INCHES')}
                >
                  <div className="pd__sc-switch-knob" />
                </button>
                <span className={`pd__sc-unit ${sizeUnits === 'CM' ? 'active' : ''}`}>CM</span>
              </div>

              <table className="pd__sc-table">
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>BUST ({sizeUnits === 'INCHES' ? 'IN' : 'CM'})</th>
                    <th>WAIST ({sizeUnits === 'INCHES' ? 'IN' : 'CM'})</th>
                    <th>HIP ({sizeUnits === 'INCHES' ? 'IN' : 'CM'})</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { s: 'XS', b: 32, w: 24, h: 34 },
                    { s: 'S', b: 34, w: 26, h: 36 },
                    { s: 'M', b: 36, w: 28, h: 38 },
                    { s: 'L', b: 38, w: 30, h: 40 },
                    { s: 'XL', b: 40, w: 32, h: 42 },
                    { s: 'XXL', b: 42, w: 34, h: 44 },
                  ].map(row => {
                    const mult = sizeUnits === 'CM' ? 2.54 : 1;
                    return (
                      <tr key={row.s}>
                        <td><strong>{row.s}</strong></td>
                        <td>{Math.round(row.b * mult)}</td>
                        <td>{Math.round(row.w * mult)}</td>
                        <td>{Math.round(row.h * mult)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <h4 className="pd__sc-how-title">HOW TO MEASURE</h4>
              <img src={sizeChartImg} alt="How to measure instructions" className="pd__sc-img" />

              <ul className="pd__sc-instructions">
                <li><strong>CHEST</strong> - MEASURE AROUND THE FULLEST PART, PLACE THE TAPE CLOSE UNDER THE ARMS AND MAKE SURE THE TAPE IS FLAT ACROSS THE BACK.</li>
                <li><strong>WAIST</strong> - MEASURE THE AROUND THE NATURAL WAIST LINE, USUALLY THE SHORTEST WIDTH OF THE TORSO</li>
                <li><strong>HIP</strong> - MEASURE 20CM BELOW THE NATURAL WAIST LINE AROUND THE WIDEST PART.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
