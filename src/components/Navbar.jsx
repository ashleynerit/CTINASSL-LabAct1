import { Link } from "react-router-dom";
import { LogOut, ShoppingBag } from "lucide-react";

export function Navbar({ cartCount, user, logout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">Garden of Daffodils</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>
        <Link to="/about">About</Link>
        {user && <Link to="/profile">My Profile</Link>}
      </div>

      <div className="nav-actions">
        <Link to="/cart" className="cart-link">
          <ShoppingBag size={21} />
          <span>{cartCount}</span>
        </Link>

        {user ? (
          <button onClick={logout} className="nav-button">
            <LogOut size={18} /> Logout
          </button>
        ) : (
          <Link to="/login" className="login-link">Log In</Link>
        )}
      </div>
    </nav>
  );
}

export function AdminNavbar({ logout }) {
  return (
    <nav className="navbar admin-nav">
      <Link to="/admin" className="logo">AGNIFIED. ADMIN</Link>
      <div className="nav-links">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/inventory">Inventory</Link>
        <Link to="/store">View Store</Link>
      </div>
      <button onClick={logout} className="nav-button">Logout</button>
    </nav>
  );
}