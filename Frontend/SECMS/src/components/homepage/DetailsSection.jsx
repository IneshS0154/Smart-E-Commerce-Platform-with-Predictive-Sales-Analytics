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
          Clothing is more than what you wear. It's the fabric chosen for how it drapes, the seam
          built to last, the finish that elevates the ordinary. On ANYWEAR, every piece is a study in
          detail.
        </p>
      </div>
    </section>
  );
}

export default DetailsSection;
