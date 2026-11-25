import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Package,
  ShoppingBag,
  ShoppingCart
} from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value || "—") : date.toLocaleDateString();
};

export default function AdminDashboard({ products, orders }) {
  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const completedOrders = orders.filter((order) => order.status === "Completed");
  const totalSales = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
  const stockCount = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );
  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD
  );
  const recentOrders = orders.slice(0, 5);

  return (
    <main className="section admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="accent">STORE MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Monitor orders, products, inventory, and completed sales.</p>
        </div>
        <Link className="primary-btn" to="/admin/orders">Review orders</Link>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <ShoppingCart aria-hidden="true" />
          <p>Total orders</p>
          <h2>{orders.length}</h2>
        </article>
        <article className="stat-card">
          <ShoppingBag aria-hidden="true" />
          <p>Completed sales</p>
          <h2>{formatCurrency(totalSales)}</h2>
        </article>
        <article className="stat-card">
          <Package aria-hidden="true" />
          <p>Units in stock</p>
          <h2>{stockCount}</h2>
        </article>
        <article className="stat-card">
          <BookOpen aria-hidden="true" />
          <p>Products</p>
          <h2>{products.length}</h2>
        </article>
        <article className="stat-card">
          <AlertTriangle aria-hidden="true" />
          <p>Pending / low stock</p>
          <h2>{pendingOrders.length} / {lowStockProducts.length}</h2>
        </article>
      </div>

      {lowStockProducts.length > 0 && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Low stock alerts</h2>
            <Link to="/admin/inventory">Update inventory</Link>
          </div>
          <ul className="admin-alert-list">
            {lowStockProducts.slice(0, 5).map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <strong>{product.stock} left</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Recent orders</h2>
          <Link to="/admin/orders">View all orders</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="admin-empty">No orders have been placed yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName || order.email}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><span className="admin-status">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
