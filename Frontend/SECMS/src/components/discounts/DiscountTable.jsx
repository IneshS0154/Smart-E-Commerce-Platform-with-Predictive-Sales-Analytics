const DiscountTable = ({ discounts }) => {
  return (
    <div className="card">
      <h2>Active Discounts</h2>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Category</th>
            <th>Period</th>
            <th>Limit</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {discounts.map((d, i) => (
            <tr key={i}>
              <td>{d.code}</td>
              <td><span className="badge">{d.discount_type}</span></td>
              <td>{d.value}</td>
              <td>{d.category}</td>
              <td>{d.start_date} → {d.end_date}</td>
              <td>{d.usage_limit}</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountTable;
