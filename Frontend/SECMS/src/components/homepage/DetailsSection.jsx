import './DetailsSection.css';
import detailsImg from '../../assets/images/details.png';

function DetailsSection() {
  return (
    <section className="details">
      <div className="details__image-wrap">
        <img
          className="details__image"
          src={detailsImg}
          alt="Fabric detail"
        />
      </div>

      <div className="details__footer">
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
