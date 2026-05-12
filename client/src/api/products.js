const API_BASE_URL = "http://localhost:5000/api";

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
