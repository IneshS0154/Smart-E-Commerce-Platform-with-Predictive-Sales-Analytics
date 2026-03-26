import { useState, useEffect } from 'react';
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import './MensCasualWear.css';

// Dummy product data - replace with API call
const casualWearProducts = [
  {
    id: 1,
    name: 'Classic Crew Neck T-Shirt',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviews: 128,
    image: null,
    category: 'T-Shirts'
  },
  {
    id: 2,
    name: 'Premium Cotton Polo',
    price: 59.99,
    originalPrice: 89.99,
    rating: 4.8,
    reviews: 95,
    image: null,
    category: 'Polos'
  },
  {
    id: 3,
    name: 'Slim Fit Jeans',
    price: 79.99,
    originalPrice: 129.99,
    rating: 4.6,
    reviews: 156,
    image: null,
    category: 'Bottoms'
  },
  {
    id: 4,
    name: 'Casual Chino Shorts',
    price: 44.99,
    originalPrice: 69.99,
    rating: 4.4,
    reviews: 87,
    image: null,
    category: 'Shorts'
  },
  {
    id: 5,
    name: 'Striped Henley Shirt',
    price: 54.99,
    originalPrice: 84.99,
    rating: 4.7,
    reviews: 112,
    image: null,
    category: 'T-Shirts'
  },
  {
    id: 6,
    name: 'Oxford Button-Down',
    price: 69.99,
    originalPrice: 109.99,
    rating: 4.5,
    reviews: 98,
    image: null,
    category: 'Shirts'
  },
  {
    id: 7,
    name: 'Comfortable Sweatpants',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviews: 134,
    image: null,
    category: 'Bottoms'
  },
  {
    id: 8,
    name: 'V-Neck Casual Tee',
    price: 44.99,
    originalPrice: 74.99,
    rating: 4.3,
    reviews: 76,
    image: null,
    category: 'T-Shirts'
  },
];

function MensCasualWear() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['T-Shirts', 'Polos', 'Shirts', 'Bottoms', 'Shorts'];

  const filteredProducts = casualWearProducts.filter(product => {
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
            <a href="/#mens-section">Men</a>
            <span>/</span>
            <span>Casual Wear</span>
          </div>
          <h1 className="catalogue__title">Men's Casual Wear</h1>
          <p className="catalogue__subtitle">Comfortable and stylish everyday essentials</p>
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
                  max="200"
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

            {/* Category Filter */}
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

            {/* Product Grid */}
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

export default MensCasualWear;
