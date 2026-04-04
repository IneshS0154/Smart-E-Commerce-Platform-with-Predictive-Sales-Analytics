import { useState, useEffect } from 'react';
import './CookieConsent.css';

function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay to allow initial animations to settle
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    closeBanner();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    closeBanner();
  };

  const closeBanner = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
    }, 400); // match CSS animation duration
  };

  if (!isVisible && !isFadingOut) return null;

  return (
    <div className={`cookie-consent ${isFadingOut ? 'cookie-consent--fade-out' : 'cookie-consent--fade-in'}`}>
      <div className="cookie-consent__content">
        <h3 className="cookie-consent__title">We Value Your Privacy</h3>
        <p className="cookie-consent__text">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
        </p>
      </div>
      <div className="cookie-consent__actions">
        <button className="cookie-consent__btn cookie-consent__btn--decline" onClick={handleDecline}>
          Decline
        </button>
        <button className="cookie-consent__btn cookie-consent__btn--accept" onClick={handleAccept}>
          Accept All
        </button>
      </div>
      <button className="cookie-consent__close" onClick={handleDecline} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default CookieConsent;
