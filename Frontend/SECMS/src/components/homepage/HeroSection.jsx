import './HeroSection.css';
import hero1 from '../../assets/images/hero1.jpeg';
import hero2 from '../../assets/images/hero2.jpg';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__panel hero__panel--left">
          <img
          className="hero__image"
          src={hero2}
          alt="Man in dark shirt"
        />
      </div>

      <div className="hero__panel hero__panel--right">
          <img
          className="hero__image"
          src={hero1}
          alt="Woman in white outfit"
        />


      </div>

      <div className="hero__overlay">
        <h1 className="hero__title">
          Wear it everywhere, anywhere
        </h1>
        <button className="hero__cta">Shop Now</button>
      </div>
    </section>
  );
}

export default HeroSection;
