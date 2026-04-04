import { useState, useEffect } from 'react';
import './MensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

// Casual
import c1 from '../../assets/images/Cat/Men/casual/TVSm0554.webp';
import c2 from '../../assets/images/Cat/Men/casual/2.webp';
import c3 from '../../assets/images/Cat/Men/casual/3.webp';
import c4 from '../../assets/images/Cat/Men/casual/4.webp';
import c5 from '../../assets/images/Cat/Men/casual/5.webp';

// Formal
import f1 from '../../assets/images/Cat/Men/formal/1.webp';
import f2 from '../../assets/images/Cat/Men/formal/2.webp';
import f3 from '../../assets/images/Cat/Men/formal/3.webp';
import f4 from '../../assets/images/Cat/Men/formal/4.webp';
import f5 from '../../assets/images/Cat/Men/formal/5.webp';

// Outerwear
import o1 from '../../assets/images/Cat/Men/outerwear and jackets/1.avif';
import o2 from '../../assets/images/Cat/Men/outerwear and jackets/2.webp';
import o3 from '../../assets/images/Cat/Men/outerwear and jackets/3.avif';
import o4 from '../../assets/images/Cat/Men/outerwear and jackets/4.webp';
import o5 from '../../assets/images/Cat/Men/outerwear and jackets/5.webp';

// Party
import p1 from '../../assets/images/Cat/Men/party/1.webp';
import p2 from '../../assets/images/Cat/Men/party/2.webp';
import p3 from '../../assets/images/Cat/Men/party/3.webp';
import p4 from '../../assets/images/Cat/Men/party/4.webp';
import p5 from '../../assets/images/Cat/Men/party/5.webp';

// Sports
import s1 from '../../assets/images/Cat/Men/sports/1.webp';
import s2 from '../../assets/images/Cat/Men/sports/2.webp';
import s3 from '../../assets/images/Cat/Men/sports/3.webp';
import s4 from '../../assets/images/Cat/Men/sports/4.webp';
import s5 from '../../assets/images/Cat/Men/sports/5.webp';

const collections = [
  { id: 1, label: 'Casual Wear', tag: 'Everyday Essentials', images: [c1, c2, c3, c4, c5], path: '/mens-casual-wear', pos: 'center top', speed: 5000 },
  { id: 2, label: 'Formal Collection', tag: 'Professional Styles', images: [f1, f2, f3, f4, f5], path: '/mens-formal-collection', pos: 'center top', speed: 10000 },
  { id: 3, label: 'Sports & Active', tag: 'Performance Gear', images: [s1, s2, s3, s4, s5], path: '/mens-sports-active', pos: 'center top', speed: 9000 },
  { id: 4, label: 'Outerwear & Jackets', tag: 'Premium Layers', images: [o1, o2, o3, o4, o5], path: '/mens-outerwear-jackets', pos: 'center top', speed: 7000 },
  { id: 5, label: 'Party & Evening Wear', tag: 'Statement Pieces', images: [p1, p2, p3, p4, p5], path: '/mens-party-evening-wear', pos: 'center top', speed: 12000 },
];

function MCard({ item, isLarge }) {
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
    <Link to={item.path} className={`ms__card ${isLarge ? 'ms__card--large' : 'ms__card--small'}`}>
      <div className="ms__card-slider">
        {item.images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${item.label} ${i + 1}`}
            className={`ms__card-img ${i === currentIndex ? 'active' : ''}`}
            style={{ objectPosition: item.pos }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="ms__card-body">
        <span className="ms__card-tag">{item.tag}</span>
        <h3 className="ms__card-label">Shop {item.label}</h3>
      </div>
    </Link>
  );
}

export default function MensSection() {
  const headerRef = useScrollAnimation('fadeInUp');

  return (
    <section id="mens-section" className="ms">

      {/* ── Header ── */}
      <div className="ms__header" ref={headerRef}>
        <div className="ms__header-left">
          <span className="ms__eyebrow">Crafted for him</span>
          <h2 className="ms__title">Men's Collection</h2>
        </div>
        <div className="ms__header-right">
          {/* <p className="ms__subtitle">
            Five distinct styles for every moment — from the boardroom
            to the weekend and every occasion in between.
          </p> */}
          <Link to="/mens-casual-wear" className="ms__view-all">
            Explore All <span className="ms__arrow">→</span>
          </Link>
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="ms__grid">
        {collections.map((item, index) => (
          <MCard key={item.id} item={item} isLarge={index === 0} />
        ))}
      </div>

    </section>
  );
}
