import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../assets/icons/search.svg';
import './SearchOverlay.css';

// SVG icons for mic and close
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const fmtPrice = (p) => p ? `Rs. ${parseFloat(p).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'TBC';

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened and fetch product catalog cache
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);

      // Fetch some products into cache if empty
      if (allProducts.length === 0) {
        setLoading(true);
        fetch('/api/products/new-arrivals?limit=100')
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            setAllProducts(Array.isArray(data) ? data : []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    } else {
      setQuery(''); // Reset when closed
    }
  }, [isOpen, allProducts.length]);

  // Compute matched products
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allProducts.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 10); // Limit to 10 results for horizontal rail
  }, [query, allProducts]);

  // Compute "Related queries" via simple substring or combination extractions
  const relatedQueries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const related = new Set();
    results.forEach(p => {
      const name = p.productName.toLowerCase();
      // Generate some dummy related queries that wrap the main query
      if (name.includes('tank top') && q === 'tank top') {
        related.add('white tank top');
        related.add('scy tank top');
      } else if (name.includes(q)) {
        // Create a synthetic query by adding the next word from the product name
        const nextWordMatch = name.slice(name.indexOf(q) + q.length).trim().split(' ')[0];
        if (nextWordMatch && nextWordMatch.length > 2) {
          related.add(`${q} ${nextWordMatch}`);
        }
      }
    });

    // Fallbacks if logic finds none
    if (related.size === 0) {
      related.add(`${q} for women`);
      related.add(`new ${q}`);
    }

    return Array.from(related).slice(0, 4);
  }, [query, results]);

  const handleProductClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  const handleSeeAll = () => {
    onClose();
    // Assuming you have a shop page route that processes a ?search= query
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Utility to highlight match
  const highlightMatch = (text, match) => {
    if (!match) return text;
    const parts = text.split(new RegExp(`(${match})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === match.toLowerCase() ?
        <span key={i} className="so-highlight">{part}</span> : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay__backdrop" onClick={onClose} />

      <div className="search-overlay__panel">

        {/* Search Input Bar */}
        <div className="search-overlay__header">
          <div className="search-overlay__input-wrapper">
            <img src={searchIcon} alt="Search" className="search-overlay__icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-overlay__input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-overlay__actions">
              <button className="search-overlay__btn" onClick={onClose} aria-label="Close" title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {query.trim() && (
          <div className="search-overlay__body">

            {/* Related Queries */}
            {relatedQueries.length > 0 && (
              <div className="search-overlay__related">
                <h4 className="search-overlay__section-title">Related queries</h4>
                <div className="search-overlay__pills">
                  {relatedQueries.map((rq, idx) => (
                    <button
                      key={idx}
                      className="search-overlay__pill"
                      onClick={() => setQuery(rq)}
                    >
                      {highlightMatch(rq, query)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Rail */}
            <div className="search-overlay__results">
              <h4 className="search-overlay__section-title">Products</h4>

              {loading ? (
                <p className="search-overlay__msg">Searching...</p>
              ) : results.length > 0 ? (
                <div className="search-overlay__rail">
                  {results.map(product => {
                    const colors = product.colors ?? product.availableColors ?? [];
                    const totalStock = (product.stocks || []).reduce((sum, s) => sum + s.stockCount, 0);
                    const isSoldOut = totalStock === 0;

                    return (
                      <div key={product.id} className="so-card" onClick={() => handleProductClick(product.id)} style={isSoldOut ? { opacity: 0.6 } : {}}>
                        <div className="so-card__img-wrap">
                          {product.mainImagePath ? (
                            <img src={product.mainImagePath} alt={product.productName} className="so-card__img" />
                          ) : (
                            <div className="so-card__no-img">No Image</div>
                          )}
                          {isSoldOut ? (
                            <span className="so-card__sale-tag" style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', left: 'auto', right: '8px' }}>SOLD OUT</span>
                          ) : (
                            <span className="so-card__sale-tag">SALE</span>
                          )}
                          {!isSoldOut && <span className="so-card__discount-tag">NEW</span>}
                        </div>
                        <div className="so-card__info">
                          <h5 className="so-card__name">{product.productName}</h5>
                          <p className="so-card__price">{isSoldOut ? 'SOLD OUT' : fmtPrice(product.price)}</p>
                          {/* Mini circles mimicking color swatches if data exists */}
                          {colors.length > 0 && (
                            <div className="so-card__colors">
                              {colors.slice(0, 3).map((c, i) => (
                                <span key={i} className="so-card__color-dot" style={{ background: c.toLowerCase() }}></span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="search-overlay__msg">No products found matching "{query}"</p>
              )}
            </div>

            {/* See All Wrapper */}
            {results.length > 0 && (
              <div className="search-overlay__footer">
                <button className="search-overlay__see-all" onClick={handleSeeAll}>
                  See all Results
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
