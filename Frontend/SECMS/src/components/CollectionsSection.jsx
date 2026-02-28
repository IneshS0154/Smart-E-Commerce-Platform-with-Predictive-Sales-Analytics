import './CollectionsSection.css';

// Replace nulls with imports once you have the collection images
import menImg from '../assets/images/men-collection.png';
import womenImg from '../assets/images/women-collection.png';
const collections = [
  { key: 'men',   label: ['Men', 'Collection'],   image: menImg },
  { key: 'women', label: ['Women', 'Collection'], image: womenImg },
];

function CollectionsSection() {
  return (
    <section className="collections">
      {collections.map(({ key, label, image }) => (
        <div key={key} className="collections__card">
          {image ? (
            <img className="collections__image" src={image} alt={label.join(' ')} />
          ) : (
            <div className="collections__placeholder" />
          )}
          <div className="collections__overlay">
            <h2 className="collections__title">
              {label.map((line, i) => <span key={i}>{line}</span>)}
            </h2>
          </div>
        </div>
      ))}
    </section>
  );
}

export default CollectionsSection;
