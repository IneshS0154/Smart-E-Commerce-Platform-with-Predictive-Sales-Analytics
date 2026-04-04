import React, { useState } from 'react';
import './TopMarqueeBar.css';

function TopMarqueeBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = (
    <>
      <span className="marquee-item">Check out the new drop!</span>
      <span className="marquee-sep">—</span>
      <span className="marquee-item">15% on Your First Order</span>
      <span className="marquee-sep">—</span>
    </>
  );

  return (
    <div className="top-marquee-bar">
      <div className="marquee">
        <div className="marquee__inner">
          {/* Duplicate content to create a seamless infinite scroll loop */}
          <div className="marquee__content">
            {Array(8).fill(null).map((_, i) => <React.Fragment key={i}>{content}</React.Fragment>)}
          </div>
          <div className="marquee__content" aria-hidden="true">
            {Array(8).fill(null).map((_, i) => <React.Fragment key={`dup-${i}`}>{content}</React.Fragment>)}
          </div>
        </div>
      </div>
      <div className="top-marquee-bar__fade"></div>
      <button
        className="top-marquee-bar__close"
        onClick={() => setIsVisible(false)}
        aria-label="Close announcement"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default TopMarqueeBar;
