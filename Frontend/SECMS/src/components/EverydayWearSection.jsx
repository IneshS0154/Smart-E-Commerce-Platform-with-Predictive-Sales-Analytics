import './EverydayWearSection.css';

// Replace nulls with image imports once you have the images
import img1 from '../assets/images/EverydayWear/1.webp';
import img2 from '../assets/images/EverydayWear/2.webp';
import img3 from '../assets/images/EverydayWear/3.webp';
import img4 from '../assets/images/EverydayWear/4.webp';
import img5 from '../assets/images/EverydayWear/5.webp';
import img6 from '../assets/images/EverydayWear/6.webp';
import img7 from '../assets/images/EverydayWear/7.webp';
import img8 from '../assets/images/EverydayWear/8.avif';

const gridItems = [
  { type: 'image', image: img1, alt: 'Everyday wear 1' },
  { type: 'image', image: img2, alt: 'Everyday wear 2' },
  { type: 'image', image: img3, alt: 'Everyday wear 3' },
  { type: 'placeholder-dark' },
  { type: 'placeholder-light' },
  { type: 'image', image: img4, alt: 'Everyday wear 4' },
  { type: 'image', image: img5, alt: 'Everyday wear 5' },
  { type: 'image', image: img6, alt: 'Everyday wear 6' },
  { type: 'text' },
  { type: 'image', image: img7, alt: 'Everyday wear 7' },
  { type: 'placeholder-light' },
  { type: 'image', image: img8, alt: 'Everyday wear 8' },
];

function EverydayWearSection() {
  return (
    <section className="everyday">
      <div className="everyday__header">
        <h2 className="everyday__title">For Your Everyday Wear</h2>
        <a href="#" className="everyday__view-all">View All</a>
      </div>

      <div className="everyday__grid">
        {gridItems.map((item, i) => {
          if (item.type === 'text') {
            return (
              <div key={i} className="everyday__cell everyday__cell--text">
                <p>Choose it</p>
                <p>Pair it</p>
                <p>Wear it</p>
              </div>
            );
          }
          if (item.type === 'placeholder-dark') {
            return <div key={i} className="everyday__cell everyday__cell--dark" />;
          }
          if (item.type === 'placeholder-light') {
            return <div key={i} className="everyday__cell everyday__cell--light" />;
          }
          return (
            <div key={i} className="everyday__cell everyday__cell--image">
              {item.image ? (
                <img
                  className="everyday__image"
                  src={item.image}
                  alt={item.alt}
                />
              ) : (
                <div className="everyday__image-placeholder" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default EverydayWearSection;
