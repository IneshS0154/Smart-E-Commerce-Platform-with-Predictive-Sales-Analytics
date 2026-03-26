import './WomensSection.css';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';

// Placeholder images - replace with actual women's clothing images
// import img1 from '../../assets/images/women/1.webp';
// import img2 from '../../assets/images/women/2.webp';
// import img3 from '../../assets/images/women/3.webp';
// import img4 from '../../assets/images/women/4.webp';

const womensCollections = [
  {
    id: 1,
    title: 'Casual Wear',
    subtitle: 'Everyday comfort',
    image: null,
    featured: true,
    path: '/womens-casual-wear'
  },
  {
    id: 2,
    title: 'Formal Collection',
    subtitle: 'Elegant styles',
    image: null,
    featured: false,
    path: '/womens-formal-collection'
  },
  {
    id: 3,
    title: 'Sports & Active',
    subtitle: 'Athletic performance',
    image: null,
    featured: false,
    path: '/womens-sports-active'
  },
  {
    id: 4,
    title: 'Outerwear & Jackets',
    subtitle: 'Versatile layers',
    image: null,
    featured: true,
    path: '/womens-outerwear-jackets'
  },
  {
    id: 5,
    title: 'Party & Evening Wear',
    subtitle: 'Special occasions',
    image: null,
    featured: true,
    path: '/womens-party-evening-wear'
  },
];

function WomensSection() {
  const headerRef = useScrollAnimation('fadeInUp');
  return (
    <section id="womens-section" className="womens">
      <div className="womens__header" ref={headerRef}>
        <div className="womens__header-content">
          <h2 className="womens__title">Women's Collection</h2>
          <p className="womens__subtitle">Discover premium fashion tailored for you</p>
        </div>
        <a href="#" className="womens__view-all">Explore All →</a>
      </div>

      <div className="womens__grid">
        {womensCollections.map((collection, index) => {
          const cardContent = (
            <>
              <div className="womens__card-image-wrap">
                {collection.image ? (
                  <img
                    className="womens__card-image"
                    src={collection.image}
                    alt={collection.title}
                  />
                ) : (
                  <div className="womens__card-image-placeholder">
                    <span>Image</span>
                  </div>
                )}
              </div>
              <div className="womens__card-content">
                <h3 className="womens__card-title">{collection.title}</h3>
                <p className="womens__card-subtitle">{collection.subtitle}</p>
                <button className="womens__card-link">Shop Now →</button>
              </div>
            </>
          );

          return (
            <Link
              key={collection.id}
              to={collection.path}
              className={`womens__card ${collection.featured ? 'womens__card--featured' : ''}`}
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

export default WomensSection;
