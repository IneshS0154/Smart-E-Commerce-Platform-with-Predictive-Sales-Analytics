import './DetailsSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import detailsVideo from '../../assets/videos/anywear.mp4';

function DetailsSection() {
  const imageRef = useScrollAnimation('fadeInLeft');
  const textRef = useScrollAnimation('fadeInRight');
  return (
    <section className="details">
      <div className="details__image-wrap" ref={imageRef}>
        <video
          className="details__image"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={detailsVideo} type="video/mp4" />
        </video>
      </div>

      <div className="details__footer" ref={textRef}>
        <span className="details__label">Details that Speak</span>
        <p className="details__text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim venim,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        </p>
      </div>
    </section>
  );
}

export default DetailsSection;
