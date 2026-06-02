import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const createPlaceholderImage = (label = "Product") => {
  const safeLabel = String(label).slice(0, 24);

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
        ${safeLabel}
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

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(items);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Products load failed:", err);
        setProducts([]);
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const preparedProducts = useMemo(() => {
    return products.map((product, index) => {
      const category =
        product.category?.trim() ||
        product.type?.trim() ||
        product.collection?.trim() ||
        "General";

      const productName =
        product.name ||
        product.title ||
        `Item ${index + 1}`;

      const image =
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        product.photo ||
        createPlaceholderImage(productName);

      return {
        ...product,
        id: product.id ?? index + 1,
        name: productName,
        description:
          product.description || "No description available.",
        price: Number(product.price || 0),
        category,
        image,
      };
    });
  }, [products]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(preparedProducts.map((product) => product.category)),
    ];
  }, [preparedProducts]);

  const visibleProducts = useMemo(() => {
    const filtered = preparedProducts.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();

      const matchesSearch = haystack.includes(
        searchTerm.toLowerCase()
      );

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
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
      ? preparedProducts.reduce(
          (sum, item) => sum + item.price,
          0
        ) / preparedProducts.length
      : 0;

  const featuredCount = Math.min(
    preparedProducts.length,
    3
  );

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Premium Catalog</span>
          <h1>Select products with images and smart filters</h1>
          <p>
            Search, filter by category, sort results,
            and favorite products in a polished storefront.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Products</span>
            <strong>{preparedProducts.length}</strong>
          </div>
          <div className="stat-card">
            <span>Categories</span>
            <strong>
              {Math.max(categories.length - 1, 0)}
            </strong>
          </div>
          <div className="stat-card">
            <span>Avg. Price</span>
            <strong>
              {currency.format(averagePrice)}
            </strong>
          </div>
          <div className="stat-card">
            <span>Favorites</span>
            <strong>{favorites.length}</strong>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="name">Name</option>
          <option value="price-low">Price Low → High</option>
          <option value="price-high">Price High → Low</option>
        </select>
      </section>

      <section className="category-strip">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-chip ${
              selectedCategory === category
                ? "active"
                : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      {loading && (
        <div className="status-message">
          Loading products...
        </div>
      )}

      {!loading &&
        !error &&
        visibleProducts.length > 0 && (
          <section className="product-grid">
            {visibleProducts.map((product, index) => (
              <article
                key={`${product.id}-${index}`}
                className="product-card"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />

                <div className="product-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="product-footer">
                    <strong>
                      {currency.format(product.price)}
                    </strong>

                    <button
                      onClick={() =>
                        toggleFavorite(product.id)
                      }
                    >
                      {favorites.includes(product.id)
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
    </div>
  );
}

export default App;