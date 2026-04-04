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

const BENTO_LAYOUT = [
  { type: 'product', cssClass: 'bento-hero' },
  { type: 'product', cssClass: 'bento-tall' },
  { type: 'product', cssClass: 'bento-std' },
  { type: 'product', cssClass: 'bento-std' },
  { type: 'text', cssClass: 'bento-wide' },
  { type: 'product', cssClass: 'bento-std' },
  { type: 'product', cssClass: 'bento-std' },
];

function EverydayWearSection() {
  const headerRef = useScrollAnimation('fadeInUp');
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products/new-arrivals?limit=50')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = shuffleArray(data);
          // We need exactly 6 products for this layout
          setRandomProducts(shuffled.slice(0, 6));
        }
      })
      .catch(err => console.error("Could not fetch products for everyday grid", err));
  }, []);

  let productIndex = 0;

  return (
    <section className="everyday">
      <div className="everyday__header" ref={headerRef}>
        <h2 className="everyday__title">For Your Everyday Wear</h2>
        <Link to="/shop" className="everyday__view-all">View Editorial Collection</Link>
      </div>

      <div className="bento-grid">
        {BENTO_LAYOUT.map((cell, index) => {
          if (cell.type === 'text') {
            return (
              <div key={`text-${index}`} className={`bento-item bento-text-card ${cell.cssClass}`}>
                <h3>
                  <span>Choose it.</span>
                  <span>Pair it.</span>
                  Wear it.
                </h3>
              </div>
            );
          }

          const p = randomProducts[productIndex++];

          if (!p) {
            return (
              <div key={`skel-${index}`} className={`bento-item shimmer-bg ${cell.cssClass}`} />
            );
          }

          return (
            <Link key={`prod-${p.id}`} to={`/product/${p.id}`} className={`bento-item bento-link ${cell.cssClass}`}>
              {p.mainImagePath ? (
                <img className="bento-image" src={p.mainImagePath} alt={p.productName} loading="lazy" />
              ) : (
                <div className="everyday__image-placeholder shimmer-bg"></div>
              )}

              {/* Sleek Glassmorphic Overlay */}
              <div className="bento__overlay">
                <div className="bento__glass-card">
                  <span className="bento__product-name">{p.productName || 'Editorial Piece'}</span>
                  <span className="bento__product-price">LKR {p.price}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default EverydayWearSection;
