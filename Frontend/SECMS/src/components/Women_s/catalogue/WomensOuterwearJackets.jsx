import { useState, useEffect } from 'react';
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import './WomensOuterwearJackets.css';

const outerwearProducts = [
  {
    id: 1,
    name: 'Winter Parka',
    price: 189.99,
    originalPrice: 329.99,
    rating: 4.8,
    reviews: 245,
    image: null,
    category: 'Jackets'
  },
  {
    id: 2,
    name: 'Denim Trucker Jacket',
    price: 99.99,
    originalPrice: 159.99,
    rating: 4.6,
    reviews: 178,
    image: null,
    category: 'Jackets'
  },
  {
    id: 3,
    name: 'Leather Biker Jacket',
    price: 249.99,
    originalPrice: 429.99,
    rating: 4.9,
    reviews: 156,
    image: null,
    category: 'Jackets'
  },
  {
    id: 4,
    name: 'Lightweight Windbreaker',
    price: 74.99,
    originalPrice: 129.99,
    rating: 4.5,
    reviews: 134,
    image: null,
    category: 'Shells'
  },
  {
    id: 5,
    name: 'Wool Blend Coat',
    price: 179.99,
    originalPrice: 299.99,
    rating: 4.7,
    reviews: 167,
    image: null,
    category: 'Coats'
  },
  {
    id: 6,
    name: 'Quilted Puffer Vest',
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.6,
    reviews: 98,
    image: null,
    category: 'Vests'
  },
  {
    id: 7,
    name: 'Raincoat',
    price: 119.99,
    originalPrice: 199.99,
    rating: 4.4,
    reviews: 112,
    image: null,
    category: 'Coats'
  },
  {
    id: 8,
    name: 'Fleece Cardigan',
    price: 64.99,
    originalPrice: 109.99,
    rating: 4.7,
    reviews: 203,
    image: null,
    category: 'Shells'
  },
];

function WomensOuterwearJackets() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['Jackets', 'Coats', 'Shells', 'Vests'];

  const filteredProducts = outerwearProducts.filter(product => {
    const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    const inCategory = !selectedCategory || product.category === selectedCategory;
    return inPriceRange && inCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
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
            <a href="/#womens-section">Women</a>
            <span>/</span>
            <span>Outerwear & Jackets</span>
          </div>
          <h1 className="catalogue__title">Women's Outerwear & Jackets</h1>
          <p className="catalogue__subtitle">Stylish layers for every season</p>
        </div>

        <div className="catalogue__container">
          <aside className="catalogue__sidebar">
            <div className="filter-group">
              <h3 className="filter-group__title">Filter</h3>
            </div>

            <div className="filter-group">
              <h4 className="filter-group__title">Price Range</h4>
              <div className="filter-group__content">
                <input
                  type="range"
                  min="0"
                  max="500"
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

            <div className="filter-group">
              <h4 className="filter-group__title">Category</h4>
              <div className="filter-group__content">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={!selectedCategory}
                    onChange={() => setSelectedCategory(null)}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

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

          <section className="catalogue__main">
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

            <div className="product-grid">
              {sortedProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card__image-wrap">
                    <div className="product-card__image-placeholder">
                      <span>Image</span>
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="product-card__badge">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__name">{product.name}</h3>
                    <div className="product-card__rating">
                      <span className="stars">★★★★☆</span>
                      <span className="rating-value">{product.rating}</span>
                      <span className="reviews">({product.reviews})</span>
                    </div>
                    <div className="product-card__price">
                      <span className="price">Rs.{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">Rs.{product.originalPrice}</span>
                      )}
                    </div>
                    <button className="product-card__btn">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
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

export default WomensOuterwearJackets;
