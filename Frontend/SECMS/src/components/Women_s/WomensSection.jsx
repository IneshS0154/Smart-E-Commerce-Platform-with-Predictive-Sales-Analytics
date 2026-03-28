import './WomensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

import CasualWear from '../../assets/images/Cat/Women/Casual_Wear.webp';
import Formal from '../../assets/images/Cat/Women/Formal_Collection.webp';
import SportsActive from '../../assets/images/Cat/Women/Sports_Active.webp';
import Outerwear from '../../assets/images/Cat/Women/Outerwear_Jackets.webp';
import PartyEvening from '../../assets/images/Cat/Women/Party_Evening_Wear.webp';

const top3 = [
  { id: 1, label: 'Casual Wear', tag: 'Everyday Essentials', image: CasualWear, path: '/womens-casual-wear', pos: 'center top' },
  { id: 2, label: 'Formal Collection', tag: 'Elegant Styles', image: Formal, path: '/womens-formal-collection', pos: 'center top' },
  { id: 3, label: 'Sports & Active', tag: 'Athletic Performance', image: SportsActive, path: '/womens-sports-active', pos: 'center top' },
];

const bottom2 = [
  { id: 4, label: 'Outerwear & Jackets', tag: 'Versatile Layers', image: Outerwear, path: '/womens-outerwear-jackets', pos: 'center top' },
  { id: 5, label: 'Party & Evening Wear', tag: 'Special Occasions', image: PartyEvening, path: '/womens-party-evening-wear', pos: 'center center' },
];

function WCard({ item, size }) {
  return (
    <Link to={item.path} className={`ws__card ws__card--${size}`}>
      <img
        src={item.image}
        alt={item.label}
        className="ws__card-img"
        style={{ objectPosition: item.pos }}
      />
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

      {/* ── Top row: 3 equal cards ── */}
      <div className="ws__row ws__row--top">
        {top3.map(item => <WCard key={item.id} item={item} size="top" />)}
      </div>

      {/* ── Bottom row: 2 wide cards ── */}
      <div className="ws__row ws__row--bottom">
        {bottom2.map(item => <WCard key={item.id} item={item} size="bottom" />)}
      </div>

    </section>
  );
}
