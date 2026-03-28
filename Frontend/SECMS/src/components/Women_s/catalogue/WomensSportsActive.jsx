import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import './WomensSportsActive.css';

function WomensSportsActive() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 99999]);

  // Fetch products from API
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products/catalogue/FEMALE/SPORTS_ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        if (data.length > 0) {
          const maxP = Math.ceil(Math.max(...data.map(p => parseFloat(p.price) || 0)));
          setPriceRange([0, maxP > 0 ? maxP : 99999]);
        }
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const productPrice = product.price ? parseInt(product.price) : 0;
    const inPriceRange = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    return inPriceRange;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.price ? parseInt(a.price) : 0;
    const priceB = b.price ? parseInt(b.price) : 0;

    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  return (
    <>
      <Navbar />
      <main className="catalogue">
        <div className="catalogue__header">
          <div className="catalogue__breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#women-section">Women</a>
            <span>/</span>
            <span>Sports & Active</span>
          </div>
          <h1 className="catalogue__title">Women's Sports & Active</h1>
          <p className="catalogue__subtitle">High-performance activewear for every workout</p>
        </div>

        <div className="catalogue__container">
          {/* Sidebar Filters */}
          <aside className="catalogue__sidebar">
            <div className="filter-group">
              <h3 className="filter-group__title">Filter</h3>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Price Range</h4>
              <div className="filter-group__content">
                <input
                  type="range"
                  min="0"
                  max={priceRange[1]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="price-slider"
                />
                <div className="price-display">
                  <span>Rs.{priceRange[0]}</span>
                  <span>Rs.{priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Rating</h4>
              <div className="filter-group__content">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="filter-checkbox">
                    <input type="checkbox" />
                    <span>★ {rating} Stars & Up</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="catalogue__main">
            {/* Sort Options */}
            <div className="catalogue__toolbar">
              <div className="sort-container">
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <div className="result-count">
                Showing {sortedProducts.length} products
              </div>
            </div>

            {/* Loading State */}
            {loading && <div className="loading-message">Loading products...</div>}

            {/* Error State */}
            {error && <div className="error-message">{error}</div>}

            {/* Product Grid */}
            {!loading && !error && (
              <div className="product-grid">
                {sortedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="product-card" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="product-card__image-wrap">
                      {product.mainImagePath ? (
                        <img
                          src={product.mainImagePath}
                          alt={product.productName}
                          className="product-card__image"
                        />
                      ) : (
                        <div className="product-card__image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="product-card__content">
                      <h3 className="product-card__name">{product.productName}</h3>
                      <div className="product-card__rating">
                        <span className="stars">★★★★☆</span>
                        <span className="rating-value">4.5</span>
                        <span className="reviews">(32)</span>
                      </div>
                      <div className="product-card__price">
                        <span className="price">Rs.{product.price}</span>
                      </div>
                      {product.sellerName && (
                        <p className="product-card__seller">By: {product.sellerName}</p>
                      )}
                      <button className="product-card__btn">Add to Cart</button>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !error && sortedProducts.length === 0 && (
              <div className="no-products">
                <p>No products found matching your filters.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default WomensSportsActive;
