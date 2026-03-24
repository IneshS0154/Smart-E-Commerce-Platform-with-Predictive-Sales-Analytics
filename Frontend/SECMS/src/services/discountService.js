const API_URL = "http://localhost:5000/api/discounts";

// CREATE
export const createDiscount = async (discount) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discount),
  });
  return res.json();
};

// READ
export const getDiscounts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

// DELETE
export const deleteDiscount = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};
