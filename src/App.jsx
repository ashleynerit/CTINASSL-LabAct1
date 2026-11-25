
import { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

// =====================================
// COMPONENTS
// =====================================

import { AdminNavbar, Navbar } from "./components/Navbar";

// =====================================
// CUSTOMER PAGES
// =====================================

import Home from "./pages/Home";
import Store from "./pages/Store";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// =====================================
// ADMIN PAGES
// =====================================

import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";

// =====================================
// CONTEXT
// =====================================

import {
  AuthProvider,
  useAuth
} from "./Context/AuthContext";

import {
  CartProvider,
  useCart
} from "./Context/CartContext";

// =====================================
// DATA
// =====================================

import { initialProducts } from "./Data/products.js";

// =====================================
// GLOBAL CSS
// =====================================

import "./index.css";

// =====================================
// APPLICATION LAYOUT
// =====================================

function AppLayout() {

  const { user, logout, updateProfile } = useAuth();
  const { cart, setCart, addToCart } = useCart();

  const location = useLocation();

  // Product management
  const [products, setProducts] = useState(() => {

    const savedProducts = localStorage.getItem("products");

    return savedProducts
      ? JSON.parse(savedProducts)
      : initialProducts;

  });

  // Save products whenever they change
  useEffect(() => {

    localStorage.setItem(
      "products",
      JSON.stringify(products)
    );

  }, [products]);

  // Hide the navbar on authentication pages
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className={isAuthPage ? "site-layout site-layout-auth" : "site-layout"}>

      {/* =================================
          NAVIGATION BAR
      ================================= */}

      {!isAuthPage && (

        user?.role === "admin" ? (
          <AdminNavbar logout={logout} />
        ) : (
          <Navbar
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            user={user}
            logout={logout}
          />
        )

      )}

      <div className="site-content">
      {/* =================================
          APPLICATION ROUTES
      ================================= */}

      <Routes>

        {/* =================================
            CUSTOMER PAGES
        ================================= */}

        <Route
          path="/"
          element={
            <Home products={products} />
          }
        />

        <Route
          path="/store"
          element={
            <Store products={products} addToCart={addToCart} />
          }
        />

        <Route
          path="/about"
          element={
            <About />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile user={user} cart={cart} updateProfile={updateProfile} />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart cart={cart} setCart={setCart} />
          }
        />

        {/* =================================
            AUTHENTICATION PAGES
        ================================= */}

        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* =================================
            ADMIN PAGES
        ================================= */}

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <Dashboard products={products} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/products"
          element={
            user?.role === "admin" ? (
              <Products
                products={products}
                setProducts={setProducts}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/inventory"
          element={
            user?.role === "admin" ? (
              <Products
                products={products}
                setProducts={setProducts}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =================================
            PAGE NOT FOUND
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>

      </div>
    </div>
  );

}

// =====================================
// MAIN APP COMPONENT
// =====================================

function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <CartProvider>

          <AppLayout />

        </CartProvider>

      </AuthProvider>

    </BrowserRouter>

  );

}

export default App;
