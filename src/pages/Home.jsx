import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function Home({ products, trendingProducts, user }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1 className="accent">Hello, {user?.name || "User"}!</h1>
          <p>
            Discover the world of Nouvaunde through books,
            exclusive merchandise, and meaningful collections.
          </p>
          <Link to="/store" className="primary-btn">
            EXPLORE THE STORE
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="accent">POPULAR WITH READERS</p>
            <h2>Trending Books</h2>
          </div>
          <Link to="/store" className="text-link">View All →</Link>
        </div>

        {trendingProducts.length > 0 ? (
          <div className="product-grid">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No books are currently available.</p>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="accent">NEWLY ADDED BOOKS!</p>
            <h2>Featured Collection</h2>
          </div>
          <Link to="/store" className="text-link">View All →</Link>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </main>
  );
}