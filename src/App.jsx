import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import { initialProducts } from "./Data/products";
import Footer from "./components/Footer";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Store from "./pages/Store";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import { AdminNavbar, Navbar } from "./components/Navbar";
import "./index.css";

function AppContent() {
  const [products, setProducts] = useState(() =>
    JSON.parse(localStorage.getItem("products")) || initialProducts
  );
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find((item) => item.id === product.id);

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });

    alert("Product added to cart!");
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user && user.role === "admin" ? (
        <AdminNavbar logout={logout} />
      ) : (
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          user={user}
          logout={logout}
        />
      )}

      <Routes>
        <Route path="/" element={<Home products={products} />} />
        <Route
          path="/store"
          element={<Store products={products} addToCart={addToCart} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile user={user} cart={cart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard products={products} />} />
        <Route
          path="/admin/products"
          element={<AdminProducts products={products} setProducts={setProducts} />}
        />
        <Route
          path="/admin/inventory"
          element={<AdminProducts products={products} setProducts={setProducts} />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
