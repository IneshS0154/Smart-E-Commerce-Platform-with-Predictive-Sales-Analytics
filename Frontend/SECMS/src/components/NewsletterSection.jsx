import { useState } from 'react';
import './NewsletterSection.css';

// Replace null with import once you have the image
import promoImg from '../assets/images/newsletter-promo.png';
const promoImage = promoImg;

function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: wire up to backend
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="newsletter__image-side">
        {promoImage ? (
          <img className="newsletter__image" src={promoImage} alt="Promo" />
        ) : (
          <div className="newsletter__image-placeholder" />
        )}
      </div>

      <div className="newsletter__content">
        <h2 className="newsletter__title">The First Round is on US!</h2>
        <p className="newsletter__body">
          Be the first to experience new collections, exclusive offers and the
          stories behind our products. Because ANYWEAR, every new step begins
          with you.
        </p>
        <form className="newsletter__form" onSubmit={handleSubscribe}>
          <input
            className="newsletter__input"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="newsletter__btn" type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
