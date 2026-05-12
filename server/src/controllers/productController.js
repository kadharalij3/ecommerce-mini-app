import { products } from "../data/products.js";

export const getAllProducts = (req, res) => {
  res.status(200).json(products);
};

export const getProductById = (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
};
