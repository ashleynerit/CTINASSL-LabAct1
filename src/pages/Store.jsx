import { useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { bookSeries, UNASSIGNED_SERIES } from "../Data/products";

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
  const bookGroups = [...bookSeries, UNASSIGNED_SERIES]
    .map((series) => ({
      series,
      products: filteredProducts.filter((product) =>
        product.category === "Books" &&
        (product.series || UNASSIGNED_SERIES) === series
      )
    }))
    .filter((group) => !search || group.products.length > 0);

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

      {category === "Books" ? (
        bookGroups.length > 0 ? (
          <div className="series-groups">
            {bookGroups.map((group) => (
              <section className="series-group" key={group.series}>
                <h2>{group.series}</h2>
                {group.products.length > 0 ? (
                  <div className="product-grid">
                    {group.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        addToCart={addToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="series-empty">No books in this series yet.</p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p>No books found.</p>
        )
      ) : (
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
      )}
    </main>
  );
}