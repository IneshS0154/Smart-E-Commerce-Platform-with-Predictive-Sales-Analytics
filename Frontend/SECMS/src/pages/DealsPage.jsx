const DealsPage = ({ discounts }) => {
  return (
    <>
      <h1>🔥 Deals & Seasonal Promotions</h1>

      <div className="deal-grid">
        {discounts.map((d, i) => (
          <div className="deal-card" key={i}>
            <h3>{d.code}</h3>
            <span className="badge">{d.discount_type}</span>
            <p>{d.category}</p>
            <strong>{d.value} OFF</strong>
          </div>
        ))}
      </div>
    </>
  );
};

export default DealsPage;
