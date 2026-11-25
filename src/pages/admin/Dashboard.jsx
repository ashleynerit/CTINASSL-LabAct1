import { BookOpen, Package, ShoppingBag, ShoppingCart } from "lucide-react";

export default function AdminDashboard({ products }) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  const stock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <main className="section">
      <p className="accent">STORE MANAGEMENT</p>
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <ShoppingCart />
          <p>Total Orders</p>
          <h2>{orders.length}</h2>
        </div>
        <div className="stat-card">
          <ShoppingBag />
          <p>Total Sales</p>
          <h2>₱{sales.toFixed(2)}</h2>
        </div>
        <div className="stat-card">
          <Package />
          <p>Available Stock</p>
          <h2>{stock}</h2>
        </div>
        <div className="stat-card">
          <BookOpen />
          <p>Total Products</p>
          <h2>{products.length}</h2>
        </div>
      </div>

      <h2>Recent Orders</h2>
      {orders.slice(-5).reverse().map((order) => (
        <div className="order-row" key={order.id}>
          <span>#{order.id}</span>
          <span>{order.email}</span>
          <span>₱{order.total.toFixed(2)}</span>
          <span>{order.status}</span>
        </div>
      ))}
    </main>
  );
}