import './NewArrivalsSection.css';

import prod1 from '../../assets/images/NewArrivals/1.webp';
import prod2 from '../../assets/images/NewArrivals/2.webp';
import prod3 from '../../assets/images/NewArrivals/3.webp';
const products = [
  {
    id: 1,
    name: 'GridForm Relaxed Textured T-Shirt',
    colors: 7,
    image: prod1,
  },
  {
    id: 2,
    name: 'OpenForm Top',
    colors: 2,
    image: prod2,
  },
  {
    id: 3,
    name: 'Cortéz Textured Knit Polo',
    colors: 7,
    image: prod3,
  },
];

function NewArrivalsSection() {
  return (
    <section className="arrivals">
      <div className="arrivals__header">
        <h2 className="arrivals__title">NEW ARRIVALS, NEW JOURNEYS.</h2>
        <a href="#" className="arrivals__view-all">View All</a>
      </div>

      <div className="arrivals__grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card__image-wrap">
              {product.image ? (
                <img
                  className="product-card__image"
                  src={product.image}
                  alt={product.name}
                />
              ) : (
                <div className="product-card__image-placeholder" />
              )}
            </div>
            <div className="product-card__info">
              <div className="product-card__name-row">
                <span className="product-card__name">{product.name}</span>
                <a href="#" className="product-card__view-all">View All</a>
              </div>
              <span className="product-card__colors">
                {product.colors} Colors Available
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NewArrivalsSection;
