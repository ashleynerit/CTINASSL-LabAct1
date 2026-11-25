export default function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <p className="accent">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="price">₱{product.price.toFixed(2)}</p>
        {addToCart && (
          <button
            className="primary-btn full-btn"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product)}
          >
            {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        )}
      </div>
    </div>
  );
}