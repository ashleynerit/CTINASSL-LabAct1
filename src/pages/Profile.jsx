import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function Profile({ user, cart }) {
  if (!user) {
    return (
      <div className="section">
        <h2>Please log in to view your profile.</h2>
        <Link to="/login">Log In</Link>
      </div>
    );
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  return (
    <main className="section">
      <p className="accent">YOUR ACCOUNT</p>
      <h1>My Profile</h1>

      <div className="profile-card">
        <User size={40} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      <h2>My Purchase History</h2>
      {orders.filter((order) => order.email === user.email).map((order) => (
        <div className="order-row" key={order.id}>
          <span>Order #{order.id}</span>
          <span>₱{order.total.toFixed(2)}</span>
          <span>{order.status}</span>
        </div>
      ))}

      <p className="muted">
        Your shopping cart contains {cart.length} different products.
      </p>
    </main>
  );
}