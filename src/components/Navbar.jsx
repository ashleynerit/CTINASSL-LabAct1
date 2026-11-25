import { Link, NavLink } from "react-router-dom";
import { LogOut, ShoppingBag } from "lucide-react";

export function Navbar({ cartCount, user, logout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo" aria-label="Garden of Daffodils home">
        <img
          className="navbar-logo-icon"
          src="/images/icon.png"
          alt="Garden of Daffodils"
        />
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/store">Store</NavLink>
        <NavLink to="/about">About</NavLink>
      </div>

      <div className="nav-actions">
        <Link to="/cart" className="cart-link">
          <ShoppingBag size={21} />
          <span>{cartCount}</span>
        </Link>

        {user && <NavLink to="/profile">My Purchases</NavLink>}

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
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/inventory">Inventory</NavLink>
        <NavLink to="/admin/sales">Sales</NavLink>
        <NavLink to="/store">View Store</NavLink>
      </div>
      <button onClick={logout} className="nav-button">Logout</button>
    </nav>
  );
}