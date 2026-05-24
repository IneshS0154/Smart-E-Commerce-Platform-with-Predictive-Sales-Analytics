import { Link } from 'react-router-dom';
import './SupplierSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import supplierImg from '../../assets/images/homepage/supplier_studio.png';

const GrowthChart = () => {
    return (
        <div className="growth-card">
            <div className="growth-card__header">
                <span className="growth-card__title">Growth Blueprint</span>
                <span className="growth-card__stat">+240%</span>
            </div>
            <div className="growth-card__chart">
                <svg viewBox="0 0 200 100" className="growth-chart">
                    {/* Before path */}
                    <path
                        d="M0 80 Q 50 75, 100 80 T 200 85"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="path-before"
                    />
                    {/* After path */}
                    <path
                        d="M0 80 Q 50 70, 100 50 T 200 10"
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="path-after"
                    />
                </svg>
            </div>
            <div className="growth-card__footer">
                <div className="growth-card__legend">
                    <span className="legend-dot before"></span>
                    <span className="legend-label">Initial</span>
                </div>
                <div className="growth-card__legend">
                    <span className="legend-dot after"></span>
                    <span className="legend-label">ANYWEAR</span>
                </div>
            </div>
        </div>
    );
};

function SupplierSection() {
  const imageRef = useScrollAnimation('fadeInLeft');
  const contentRef = useScrollAnimation('fadeInRight');

  return (
    <section className="supplier-cta">
      <div className="supplier-cta__container">
        
        {/* Left Image: The Studio Aesthetic */}
        <div className="supplier-cta__image-wrap" ref={imageRef}>
          <img 
            src={supplierImg} 
            alt="Minimalist Design Studio" 
            className="supplier-cta__img" 
          />
          <div className="supplier-cta__image-label">STUDIO 2026</div>
          <GrowthChart />
        </div>

        {/* Right Content: The Value Prop */}
        <div className="supplier-cta__content" ref={contentRef}>
          <span className="supplier-cta__eyebrow">The Modern Marketplace</span>
          <h2 className="supplier-cta__title">
            Your brand, <br />
            Our global reach.
          </h2>
          <p className="supplier-cta__text">
            Join a curated community of artisans and suppliers. Scale your business 
            with our predictive sales analytics and a global audience that values quality craftsmanship.
          </p>
          <div className="supplier-cta__actions">
            <Link to="/signin" className="supplier-cta__btn">
              Become a Supplier <span>→</span>
            </Link>
            <Link to="/signup" className="supplier-cta__secondary">
              Learn More
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default SupplierSection;
