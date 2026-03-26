import './MensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

// Placeholder images - replace with actual men's clothing images
// import img1 from '../../assets/images/men/1.webp';
// import img2 from '../../assets/images/men/2.webp';
// import img3 from '../../assets/images/men/3.webp';
// import img4 from '../../assets/images/men/4.webp';

const mensCollections = [
  {
    id: 1,
    title: 'Casual Wear',
    subtitle: 'Everyday essentials',
    image: null,
    featured: true,
    path: '/mens-casual-wear'
  },
  {
    id: 2,
    title: 'Formal Collection',
    subtitle: 'Professional styles',
    image: null,
    featured: false,
    path: '/mens-formal-collection'
  },
  {
    id: 3,
    title: 'Sports & Active',
    subtitle: 'Performance gear',
    image: null,
    featured: false,
    path: '/mens-sports-active'
  },
  {
    id: 4,
    title: 'Outerwear & Jackets',
    subtitle: 'Premium layers',
    image: null,
    featured: true,
    path: '/mens-outerwear-jackets'
  },
  {
    id: 5,
    title: 'Party & Evening Wear',
    subtitle: 'Statement pieces',
    image: null,
    featured: true,
    path: '/mens-party-evening-wear'
  },
];

function MensSection() {
  const headerRef = useScrollAnimation('fadeInUp');
  return (
    <section id="mens-section" className="mens">
      <div className="mens__header" ref={headerRef}>
        <div className="mens__header-content">
          <h2 className="mens__title">Men's Collection</h2>
          <p className="mens__subtitle">Discover premium fashion crafted for you</p>
        </div>
        <a href="#" className="mens__view-all">Explore All →</a>
      </div>

      <div className="mens__grid">
        {mensCollections.map((collection, index) => {
          const cardContent = (
            <>
              <div className="mens__card-image-wrap">
                {collection.image ? (
                  <img
                    className="mens__card-image"
                    src={collection.image}
                    alt={collection.title}
                  />
                ) : (
                  <div className="mens__card-image-placeholder">
                    <span>Image</span>
                  </div>
                )}
              </div>
              <div className="mens__card-content">
                <h3 className="mens__card-title">{collection.title}</h3>
                <p className="mens__card-subtitle">{collection.subtitle}</p>
                <button className="mens__card-link">Shop Now →</button>
              </div>
            </>
          );

          return (
            <Link
              key={collection.id}
              to={collection.path}
              className={`mens__card ${collection.featured ? 'mens__card--featured' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default MensSection;
