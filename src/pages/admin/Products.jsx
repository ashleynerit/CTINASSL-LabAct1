import { useState } from "react";

export default function AdminProducts({ products, setProducts }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Books");

  const addProduct = (event) => {
    event.preventDefault();

    const newProduct = {
      id: Date.now(),
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      image: "https://placehold.co/400x500/F5EED8/497510?text=AGNIFIED"
    };

    setProducts((previousProducts) => [...previousProducts, newProduct]);
    setName("");
    setPrice("");
    setStock("");
  };

  return (
    <main className="section">
      <h1>Product Management</h1>

      <form className="admin-form" onSubmit={addProduct}>
        <input
          placeholder="Product Name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          required
          min="0"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <input
          type="number"
          placeholder="Stock"
          required
          min="0"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Books</option>
          <option>Merchandise</option>
        </select>
        <button className="primary-btn">ADD PRODUCT</button>
      </form>

      <h2>All Products</h2>

      {products.map((product) => (
        <div className="order-row" key={product.id}>
          <span>{product.name}</span>
          <span>{product.category}</span>
          <span>₱{product.price}</span>
          <span>Stock: {product.stock}</span>
          <button onClick={() =>
            setProducts((previousProducts) =>
              previousProducts.filter((item) => item.id !== product.id)
            )
          }>
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}