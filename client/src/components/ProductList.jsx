function ProductList({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <div className="card" key={product.id}>
          <img src={product.image} alt={product.name} className="product-image" />
          <h3>{product.name}</h3>
          <p>{product.category}</p>
          <p>{product.description}</p>
          <strong>${product.price}</strong>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
