import { BarChart3, PackageCheck, Receipt, TrendingUp } from "lucide-react";

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value || "—")
    : date.toLocaleDateString();
};

export default function Sales({ orders }) {
  const completedOrders = orders.filter((order) => order.status === "Completed");
  const revenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
  const unitsSold = completedOrders.reduce(
    (sum, order) =>
      sum + (order.items || []).reduce(
        (itemTotal, item) => itemTotal + Number(item.quantity || 0),
        0
      ),
    0
  );
  const averageOrderValue = completedOrders.length
    ? revenue / completedOrders.length
    : 0;

  const salesByProduct = completedOrders.reduce((totals, order) => {
    (order.items || []).forEach((item) => {
      const key = String(item.id ?? item.name);
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.price || 0);
      const existing = totals.get(key) || {
        id: key,
        name: item.name || "Product",
        quantity: 0,
        revenue: 0
      };

      totals.set(key, {
        name: existing.name,
        quantity: existing.quantity + quantity,
        revenue: existing.revenue + unitPrice * quantity
      });
    });
    return totals;
  }, new Map());

  const bestSellers = [...salesByProduct.values()]
    .sort((first, second) => second.quantity - first.quantity);
  const recentSales = completedOrders.slice(0, 10);

  return (
    <main className="section">
      <div className="admin-page-heading">
        <div>
          <p className="accent">REVENUE OVERVIEW</p>
          <h1>Sales</h1>
          <p>Sales totals include completed orders only.</p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <TrendingUp aria-hidden="true" />
          <p>Completed revenue</p>
          <h2>{formatCurrency(revenue)}</h2>
        </article>
        <article className="stat-card">
          <Receipt aria-hidden="true" />
          <p>Completed orders</p>
          <h2>{completedOrders.length}</h2>
        </article>
        <article className="stat-card">
          <PackageCheck aria-hidden="true" />
          <p>Units sold</p>
          <h2>{unitsSold}</h2>
        </article>
        <article className="stat-card">
          <BarChart3 aria-hidden="true" />
          <p>Average order value</p>
          <h2>{formatCurrency(averageOrderValue)}</h2>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Best sellers</h2>
        </div>
        {bestSellers.length === 0 ? (
          <p className="admin-empty">Completed orders will appear here.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Units sold</th>
                  <th scope="col">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Recent completed sales</h2>
        </div>
        {recentSales.length === 0 ? (
          <p className="admin-empty">No completed sales yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName || order.email}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{formatCurrency(order.total)}</td>
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