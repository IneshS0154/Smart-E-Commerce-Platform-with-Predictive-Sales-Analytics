import { useState, useEffect } from 'react';
import './WomensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

// Casual
import c1 from '../../assets/images/Cat/Women/casual/1.jpg';
import c2 from '../../assets/images/Cat/Women/casual/2.webp';
import c3 from '../../assets/images/Cat/Women/casual/3.webp';
import c4 from '../../assets/images/Cat/Women/casual/4.webp';
import c5 from '../../assets/images/Cat/Women/casual/5.webp';
import c6 from '../../assets/images/Cat/Women/casual/6.webp';

// Formal
import f1 from '../../assets/images/Cat/Women/formal/1.webp';
import f2 from '../../assets/images/Cat/Women/formal/2.webp';
import f3 from '../../assets/images/Cat/Women/formal/3.webp';
import f4 from '../../assets/images/Cat/Women/formal/4.webp';
import f5 from '../../assets/images/Cat/Women/formal/5.webp';

// Outerwear
import o1 from '../../assets/images/Cat/Women/outerwear and jackets/1.webp';
import o2 from '../../assets/images/Cat/Women/outerwear and jackets/2.webp';
import o3 from '../../assets/images/Cat/Women/outerwear and jackets/3.webp';
import o4 from '../../assets/images/Cat/Women/outerwear and jackets/4.webp';
import o5 from '../../assets/images/Cat/Women/outerwear and jackets/5.webp';

// Party
import p1 from '../../assets/images/Cat/Women/party/1.webp';
import p2 from '../../assets/images/Cat/Women/party/2.webp';
import p3 from '../../assets/images/Cat/Women/party/3.webp';
import p4 from '../../assets/images/Cat/Women/party/4.webp';
import p5 from '../../assets/images/Cat/Women/party/5.webp';

// Sports
import s1 from '../../assets/images/Cat/Women/sports/1.webp';
import s2 from '../../assets/images/Cat/Women/sports/2.webp';
import s3 from '../../assets/images/Cat/Women/sports/3.webp';
import s4 from '../../assets/images/Cat/Women/sports/4.webp';
import s5 from '../../assets/images/Cat/Women/sports/5.webp';

const collections = [
  { id: 1, label: 'Casual Wear', tag: 'Everyday Essentials', images: [c4, c2, c3, c1, c5, c6], path: '/womens-casual-wear', pos: 'center top', speed: 5000 },
  { id: 2, label: 'Formal Collection', tag: 'Elegant Styles', images: [f1, f2, f3, f4, f5], path: '/womens-formal-collection', pos: 'center top', speed: 10000 },
  { id: 3, label: 'Sports & Active', tag: 'Athletic Performance', images: [s1, s2, s3, s4, s5], path: '/womens-sports-active', pos: 'center top', speed: 9000 },
  { id: 4, label: 'Outerwear & Jackets', tag: 'Versatile Layers', images: [o1, o2, o3, o4, o5], path: '/womens-outerwear-jackets', pos: 'center top', speed: 7000 },
  { id: 5, label: 'Party & Evening Wear', tag: 'Special Occasions', images: [p1, p2, p3, p4, p5], path: '/womens-party-evening-wear', pos: 'center center', speed: 12000 },
];

function WCard({ item, isLarge }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Add a slight random delay so tiles cross-fade asynchronously
    const randomOffset = Math.random() * 2000;
    const speed = item.speed || 3500;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % item.images.length);
      }, speed);
      return () => clearInterval(interval);
    }, randomOffset);

    return () => clearTimeout(timeout);
  }, [item.images.length, item.speed]);

  return (
    <Link to={item.path} className={`ws__card ${isLarge ? 'ws__card--large' : 'ws__card--small'}`}>
      <div className="ws__card-slider">
        {item.images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${item.label} ${i + 1}`}
            className={`ws__card-img ${i === currentIndex ? 'active' : ''}`}
            style={{ objectPosition: item.pos }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="ws__card-body">
        <span className="ws__card-tag">{item.tag}</span>
        <h3 className="ws__card-label">Shop {item.label}</h3>
      </div>
    </Link>
  );
}

export default function WomensSection() {
  const headerRef = useScrollAnimation('fadeInUp');

  return (
    <section id="womens-section" className="ws">

      {/* ── Header ── */}
      <div className="ws__header" ref={headerRef}>
        <div className="ws__header-left">
          <span className="ws__eyebrow">Curated for her</span>
          <h2 className="ws__title">Women's Collection</h2>
        </div>
        <div className="ws__header-right">
          {/* <p className="ws__subtitle">
            Discover five worlds of style — effortlessly elevated,
            crafted for every chapter of your day.
          </p> */}
          <Link to="/womens-casual-wear" className="ws__view-all">
            Explore All <span className="ws__arrow">→</span>
          </Link>
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="ws__grid">
        {collections.map((item, index) => (
          <WCard key={item.id} item={item} isLarge={index === 0} />
        ))}
      </div>

    </section>
  );
}
