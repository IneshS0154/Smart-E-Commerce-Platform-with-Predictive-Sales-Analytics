import './HeroSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import heroVideo from '../../assets/videos/hero.mp4';

function HeroSection() {
  const titleRef = useScrollAnimation('slideUp');
  const buttonRef = useScrollAnimation('fadeInUp');
  return (
    <section className="hero">
      <video
        className="hero__video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="hero__overlay">
        <h1 className="hero__title" ref={titleRef}>
          Wear it everywhere, anywhere
        </h1>
        <Link to="/shop" className="hero__cta" ref={buttonRef}>Shop Now</Link>
      </div>
    </section>
  );
}

export default HeroSection;

