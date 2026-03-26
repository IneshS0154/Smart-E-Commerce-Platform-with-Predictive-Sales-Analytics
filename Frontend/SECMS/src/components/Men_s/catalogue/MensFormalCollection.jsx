import { useState, useEffect } from 'react';
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import './MensFormalCollection.css';

const formalCollectionProducts = [
  {
    id: 1,
    name: 'Classic Dark Suit',
    price: 299.99,
    originalPrice: 499.99,
    rating: 4.9,
    reviews: 156,
    image: null,
    category: 'Suits'
  },
  {
    id: 2,
    name: 'Premium Dress Shirt',
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviews: 98,
    image: null,
    category: 'Shirts'
  },
  {
    id: 3,
    name: 'Silk Tie Collection',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviews: 124,
    image: null,
    category: 'Accessories'
  },
  {
    id: 4,
    name: 'Formal Trousers',
    price: 119.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviews: 87,
    image: null,
    category: 'Trousers'
  },
  {
    id: 5,
    name: 'Oxford Dress Shoes',
    price: 159.99,
    originalPrice: 259.99,
    rating: 4.7,
    reviews: 112,
    image: null,
    category: 'Shoes'
  },
  {
    id: 6,
    name: 'Blazer Jacket',
    price: 199.99,
    originalPrice: 329.99,
    rating: 4.5,
    reviews: 98,
    image: null,
    category: 'Jackets'
  },
  {
    id: 7,
    name: 'Formal Cufflinks Set',
    price: 79.99,
    originalPrice: 129.99,
    rating: 4.6,
    reviews: 67,
    image: null,
    category: 'Accessories'
  },
  {
    id: 8,
    name: 'Charcoal Grey Suit',
    price: 319.99,
    originalPrice: 529.99,
    rating: 4.8,
    reviews: 143,
    image: null,
    category: 'Suits'
  },
];

function MensFormalCollection() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['Suits', 'Shirts', 'Trousers', 'Jackets', 'Shoes', 'Accessories'];

  const filteredProducts = formalCollectionProducts.filter(product => {
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
            <span>Formal Collection</span>
          </div>
          <h1 className="catalogue__title">Men's Formal Collection</h1>
          <p className="catalogue__subtitle">Professional elegance for every occasion</p>
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
                  max="600"
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

export default MensFormalCollection;
