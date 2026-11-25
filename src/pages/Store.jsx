import { useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Store({ products, addToCart }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="section">
      <div className="page-heading">
        <p className="accent">THE AGNIFIED COLLECTION</p>
        <h1>Explore Our Store</h1>
        <p>Find your next favorite read and exclusive merchandise.</p>
      </div>

      <div className="store-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="category-buttons">
          {["All", "Books", "Merchandise"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? "active-category" : ""}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </main>
  );
}