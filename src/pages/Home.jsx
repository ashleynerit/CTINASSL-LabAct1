import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Home({ products }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="accent">WELCOME TO THE OFFICIAL STORE</p>
          <h1>Stories worth<br />keeping.</h1>
          <p>
            Discover the world of Agnified through books,
            exclusive merchandise, and meaningful collections.
          </p>
          <Link to="/store" className="primary-btn">
            EXPLORE THE STORE
          </Link>
        </div>

        <div className="hero-decoration">
          <BookOpen size={110} strokeWidth={1} />
          <p>READ. COLLECT. EXPERIENCE.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="accent">HANDPICKED FOR YOU</p>
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

      <section className="about-banner">
        <p className="accent">MORE THAN JUST A BOOKSTORE</p>
        <h2>A world created by Agnified.</h2>
        <p>
          Explore the stories, creativity, and collections
          behind the author.
        </p>
        <Link to="/about" className="primary-btn">GET TO KNOW US</Link>
      </section>
    </main>
  );
}