import { useState } from "react";
import { apiRequest } from "../../utils/api";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Completed",
  "Cancelled"
];

const STATUS_RANK = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Completed: 3
};

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value || "—")
    : date.toLocaleString();
};

export default function Orders({ orders, setOrders, refreshProducts }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const filteredOrders = [...orders]
    .filter((order) => statusFilter === "All" || order.status === statusFilter)
    .filter((order) => {
      const itemNames = (order.items || []).map((item) => item.name).join(" ");
      const searchableText = [
        order.id,
        order.customerName,
        order.email,
        itemNames
      ].join(" ").toLowerCase();
      return searchableText.includes(query.toLowerCase());
    });

  const updateOrderStatus = async (order, nextStatus) => {
    if (order.status === "Cancelled" || order.status === nextStatus ||
      updatingOrderId !== null) return;

    setUpdatingOrderId(order.id);
    setMessage("");
    try {
      const result = await apiRequest(
        `/api/admin/orders/${encodeURIComponent(order.id)}/status`,
        { method: "PATCH", body: { status: nextStatus } }
      );
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id ? result.order : currentOrder
        )
      );
      if (nextStatus === "Cancelled") {
        refreshProducts().catch((error) => {
          console.error("Order status changed, but refreshing stock failed.", error);
        });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusOptions = (status) => {
    if (status === "Cancelled") return [status];
    if (!(status in STATUS_RANK)) return ORDER_STATUSES;

    return ORDER_STATUSES.filter((candidate) =>
      candidate === "Cancelled" ||
      candidate === status ||
      STATUS_RANK[candidate] > STATUS_RANK[status]
    );
  };

  return (
    <main className="section">
      <div className="admin-page-heading">
        <div>
          <p className="accent">FULFILLMENT</p>
          <h1>Orders</h1>
          <p>Review customer purchases and update fulfillment status.</p>
        </div>
        <div className="admin-summary-chip">
          Total orders: <strong>{orders.length}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="sr-only">Search orders</span>
          <input
            type="search"
            placeholder="Search order, customer, or item"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter">
          <span className="sr-only">Filter by order status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option>All</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      {message && <p className="profile-picture-error" role="alert">{message}</p>}
      {filteredOrders.length === 0 ? (
        <p className="admin-empty">
          {orders.length ? "No orders match your filters." : "No orders have been placed yet."}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-orders-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Placed</th>
                <th scope="col">Items</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <strong>{order.customerName || "Customer"}</strong>
                    <span className="admin-cell-secondary">{order.email}</span>
                  </td>
                  <td>{formatDate(order.date)}</td>
                  <td>
                    <details className="admin-order-details">
                      <summary>{(order.items || []).length} item(s)</summary>
                      <ul>
                        {(order.items || []).map((item) => (
                          <li key={`${order.id}-${item.id}`}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <select
                      className={`admin-status-select status-${String(order.status).toLowerCase()}`}
                      aria-label={`Update status for order ${order.id}`}
                      value={order.status}
                      disabled={order.status === "Cancelled" || updatingOrderId !== null}
                      onChange={(event) =>
                        updateOrderStatus(order, event.target.value)
                      }
                    >
                      {getStatusOptions(order.status).map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}