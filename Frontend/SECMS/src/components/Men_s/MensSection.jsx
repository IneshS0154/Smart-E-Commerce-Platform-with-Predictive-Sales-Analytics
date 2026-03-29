import './MensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

import CasualWear from '../../assets/images/Cat/Men/Casual_Wear.webp';
import Formal from '../../assets/images/Cat/Men/Formal_Collection.webp';
import SportsActive from '../../assets/images/Cat/Men/Sports_Active.webp';
import Outerwear from '../../assets/images/Cat/Men/Outerwear_Jackets.webp';
import PartyEvening from '../../assets/images/Cat/Men/Party_Evening_Wear.webp';

const top2 = [
  { id: 1, label: 'Casual Wear', tag: 'Everyday Essentials', image: CasualWear, path: '/mens-casual-wear', pos: 'center top' },
  { id: 2, label: 'Formal Collection', tag: 'Professional Styles', image: Formal, path: '/mens-formal-collection', pos: 'center top' },
];

const bottom3 = [
  { id: 3, label: 'Sports & Active', tag: 'Performance Gear', image: SportsActive, path: '/mens-sports-active', pos: 'center top' },
  { id: 4, label: 'Outerwear & Jackets', tag: 'Premium Layers', image: Outerwear, path: '/mens-outerwear-jackets', pos: 'center top' },
  { id: 5, label: 'Party & Evening Wear', tag: 'Statement Pieces', image: PartyEvening, path: '/mens-party-evening-wear', pos: 'center top' },
];

function MCard({ item, size }) {
  return (
    <Link to={item.path} className={`ms__card ms__card--${size}`}>
      <img
        src={item.image}
        alt={item.label}
        className="ms__card-img"
        style={{ objectPosition: item.pos }}
      />
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

      {/* ── Top row: 2 wide cards ── */}
      <div className="ms__row ms__row--top">
        {top2.map(item => <MCard key={item.id} item={item} size="top" />)}
      </div>

      {/* ── Bottom row: 3 equal cards ── */}
      <div className="ms__row ms__row--bottom">
        {bottom3.map(item => <MCard key={item.id} item={item} size="bottom" />)}
      </div>

    </section>
  );
}
