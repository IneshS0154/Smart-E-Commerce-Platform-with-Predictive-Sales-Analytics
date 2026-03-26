import { useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './NewArrivalsSection.css';

import prod1 from '../../assets/images/NewArrivals/1.webp';
import prod2 from '../../assets/images/NewArrivals/2.webp';
import prod3 from '../../assets/images/NewArrivals/3.webp';

const newArrivalProducts = [
  {
    id: 1,
    name: 'GridForm Relaxed Textured T-Shirt',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.7,
    reviews: 124,
    colors: 7,
    image: prod1,
    category: 'Men',
    type: 'Casual Wear'
  },
  {
    id: 2,
    name: 'OpenForm Top',
    price: 59.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviews: 89,
    colors: 2,
    image: prod2,
    category: 'Men',
    type: 'Casual Tops'
  },
  {
    id: 3,
    name: 'Cortéz Textured Knit Polo',
    price: 64.99,
    originalPrice: 109.99,
    rating: 4.6,
    reviews: 156,
    colors: 7,
    image: prod3,
    category: 'Women',
    type: 'Casual Wear'
  },
  {
    id: 4,
    name: 'Premium Cotton Blend Shirt',
    price: 69.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviews: 203,
    colors: 5,
    image: prod1,
    category: 'Men',
    type: 'Formal'
  },
  {
    id: 5,
    name: 'Modern Athleisure Jacket',
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviews: 178,
    colors: 4,
    image: prod2,
    category: 'Women',
    type: 'Active Wear'
  },
  {
    id: 6,
    name: 'Classic Comfort Hoodie',
    price: 59.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviews: 267,
    colors: 6,
    image: prod3,
    category: 'Men',
    type: 'Casual Wear'
  },
];

function NewArrivalsSection() {
  const headerRef = useScrollAnimation('fadeInUp');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['Men', 'Women'];

  const filteredProducts = newArrivalProducts.filter(product => {
    return !selectedCategory || product.category === selectedCategory;
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
      default:
        return b.id - a.id;
    }
  });

  return (
    <section className="arrivals">
      <div className="arrivals__header" ref={headerRef}>
        <h2 className="arrivals__title">NEW ARRIVALS, NEW JOURNEYS.</h2>
        <a href="#" className="arrivals__view-all">View All</a>
      </div>

      <div className="arrivals__controls">
        <div className="arrivals__filters">
          <label className="arrivals__filter-label">
            <input
              type="checkbox"
              checked={!selectedCategory}
              onChange={() => setSelectedCategory(null)}
            />
            <span>All</span>
          </label>
          {categories.map((cat) => (
            <label key={cat} className="arrivals__filter-label">
              <input
                type="checkbox"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <div className="arrivals__sort">
          <label htmlFor="sort-select">Sort:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="arrivals__sort-select"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="arrivals__grid">
        {sortedProducts.map((product) => (
          <div key={product.id} className="arrivals__product-card product-card">
            <div className="product-card__image-wrap">
              {product.image ? (
                <img
                  className="product-card__image"
                  src={product.image}
                  alt={product.name}
                />
              ) : (
                <div className="product-card__image-placeholder">
                  <span>Image</span>
                </div>
              )}
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
              <div className="product-card__meta">
                <span className="product-card__colors">{product.colors} Colors Available</span>
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
        <div className="arrivals__no-products">
          <p>No products found</p>
        </div>
      )}
    </section>
  );
}

export default NewArrivalsSection;
