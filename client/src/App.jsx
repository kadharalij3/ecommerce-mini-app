import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const createPlaceholderImage = (label = "Product") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill="url(#g)" />
      <circle cx="160" cy="120" r="56" fill="#7c3aed" opacity="0.35" />
      <circle cx="650" cy="390" r="84" fill="#2563eb" opacity="0.25" />
      <rect x="220" y="170" rx="18" ry="18" width="360" height="180" fill="#0f172a" opacity="0.85" />
      <text x="400" y="275" text-anchor="middle" font-size="38" font-family="Arial, sans-serif" fill="#e2e8f0">
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";




useEffect(() => {
  fetch("/api/products")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then((data) => {
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
}, []);


  const preparedProducts = useMemo(() => {
    return products.map((product, index) => {
      const category =
        product.category?.trim() ||
        product.type?.trim() ||
        product.collection?.trim() ||
        "General";

      const image =
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        product.photo ||
        createPlaceholderImage(product.name || `Item ${index + 1}`);

      return {
        ...product,
        category,
        image,
      };
    });
  }, [products]);

  const categories = useMemo(() => {
    return ["All", ...new Set(preparedProducts.map((product) => product.category))];
  }, [preparedProducts]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const visibleProducts = useMemo(() => {
    const filtered = preparedProducts.filter((product) => {
      const matchesSearch = `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => Number(a.id) - Number(b.id));
    }

    return sorted;
  }, [preparedProducts, searchTerm, selectedCategory, sortBy]);

  const averagePrice =
    preparedProducts.length > 0
      ? preparedProducts.reduce((sum, item) => sum + Number(item.price || 0), 0) /
        preparedProducts.length
      : 0;

  const featuredCount = Math.min(preparedProducts.length, 3);

  return (
    <div className="app-shell">
      <div className="orb orb-one"></div>
      <div className="orb orb-two"></div>

      <main className="container">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">Premium Catalog</span>
            <h1>Browse products with images and smart filters</h1>
            <p>
              Search, filter by category, sort results, and favorite products in
              a more polished storefront.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Products</span>
              <strong>{preparedProducts.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Categories</span>
              <strong>{Math.max(categories.length - 1, 0)}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg. Price</span>
              <strong>{currency.format(averagePrice || 0)}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Favorites</span>
              <strong>{favorites.length}</strong>
            </div>
          </div>
        </section>

        <section className="toolbar">
          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search products, descriptions, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-wrap">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="name">Sort: Name</option>
              <option value="price-low">Sort: Price Low to High</option>
              <option value="price-high">Sort: Price High to Low</option>
            </select>
          </div>
        </section>

        {!loading && !error && categories.length > 1 && (
          <section className="filter-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-chip ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </section>
        )}

        {loading && <p className="status">Loading products...</p>}
        {error && <p className="status error">{error}</p>}

        {!loading && !error && visibleProducts.length === 0 && (
          <div className="empty-state">
            <h3>No matching products</h3>
            <p>Try another search term or switch categories.</p>
          </div>
        )}

        {!loading && !error && visibleProducts.length > 0 && (
          <section className="product-grid">
            {visibleProducts.map((product, index) => {
              const isFavorite = favorites.includes(product.id);
              const isFeatured = index < featuredCount;
              const price = Number(product.price || 0);

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    <img
                      className="product-image"
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = createPlaceholderImage(product.name);
                      }}
                    />

                    <div className="image-overlay">
                      {isFeatured && <span className="badge featured">Featured</span>}
                      <span className="badge category">{product.category}</span>
                    </div>

                    <button
                      className={`favorite-btn ${isFavorite ? "active" : ""}`}
                      onClick={() => toggleFavorite(product.id)}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="card-body">
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                  </div>

                  <div className="card-footer">
                    <div>
                      <span className="price-label">Price</span>
                      <div className="price">{currency.format(price)}</div>
                    </div>

                    <button className="action-btn">View Details</button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
