import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EverydayWearSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function EverydayWearSection() {
  const headerRef = useScrollAnimation('fadeInUp');
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    // Fetch a batch of products so we can select some randomly
    fetch('/api/products/new-arrivals?limit=50')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = shuffleArray(data);
          // We need up to 8 products for the image edge cases
          setRandomProducts(shuffled.slice(0, 8));
        }
      })
      .catch(err => console.error("Could not fetch products for everyday grid", err));
  }, []);

  const renderCell = (index, cellType, productIndex) => {
    if (cellType === 'text') {
      return (
        <div key={index} className="everyday__cell everyday__cell--text">
          <p>Choose it</p>
          <p>Pair it</p>
          <p>Wear it</p>
        </div>
      );
    }
    if (cellType === 'placeholder-dark') {
      return <div key={index} className="everyday__cell everyday__cell--dark" />;
    }
    if (cellType === 'placeholder-light') {
      return <div key={index} className="everyday__cell everyday__cell--light" />;
    }

    // It's an image cell
    const p = randomProducts[productIndex];
    if (!p) {
      // Show skeleton loader while fetching
      return (
        <div key={index} className="everyday__cell everyday__cell--image">
          <div className="everyday__image-placeholder shimmer-bg" />
        </div>
      );
    }

    return (
      <Link key={index} to={`/product/${p.id}`} className="everyday__cell everyday__cell--image everyday__cell--link">
        {p.mainImagePath ? (
          <img className="everyday__image" src={p.mainImagePath} alt={p.productName} loading="lazy" />
        ) : (
          <div className="everyday__image-placeholder">No Image</div>
        )}
        <div className="everyday__cell-overlay">
          <span className="everyday__cell-overlay-text">View</span>
        </div>
      </Link>
    );
  };

  return (
    <section className="everyday">
      <div className="everyday__header" ref={headerRef}>
        <h2 className="everyday__title">For Your Everyday Wear</h2>
        <Link to="/shop" className="everyday__view-all">View All</Link>
      </div>

      <div className="everyday__grid">
        {/* We explicitly map the grid pattern instead of a flat list to keep the layout exact */}
        {renderCell(0, 'image', 0)}
        {renderCell(1, 'image', 1)}
        {renderCell(2, 'image', 2)}
        {renderCell(3, 'placeholder-dark', null)}
        {renderCell(4, 'placeholder-light', null)}
        {renderCell(5, 'image', 3)}
        {renderCell(6, 'image', 4)}
        {renderCell(7, 'image', 5)}
        {renderCell(8, 'text', null)}
        {renderCell(9, 'image', 6)}
        {renderCell(10, 'placeholder-light', null)}
        {renderCell(11, 'image', 7)}
      </div>
    </section>
  );
}

export default EverydayWearSection;
