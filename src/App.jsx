import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import { AdminNavbar, Navbar } from "./components/Navbar";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { CartProvider, useCart } from "./Context/CartContext";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Store from "./pages/Store";
import Dashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Sales from "./pages/admin/Sales";
import { apiRequest } from "./utils/api";
import "./index.css";

function AppLayout() {
  const { user, logout, updateProfile, loading: authLoading, authError } = useAuth();
  const {
    cart,
    setCart,
    addToCart,
    cartLoading,
    cartSaving,
    cartError
  } = useCart();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const location = useLocation();

  const refreshProducts = useCallback(async () => {
    try {
      const result = await apiRequest("/api/products");
      setProducts(result.products);
      setDataError("");
      return result.products;
    } catch (error) {
      setDataError(error.message);
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest("/api/products")
      .then((result) => {
        if (active) {
          setProducts(result.products);
          setDataError("");
        }
      })
      .catch((error) => {
        if (active) setDataError(error.message);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") {
      return undefined;
    }

    let active = true;
    apiRequest("/api/admin/orders")
      .then((result) => {
        if (active) setOrders(result.orders);
      })
      .catch((error) => {
        if (active) setDataError(error.message);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout()
      .then(() => setOrders([]))
      .catch((error) => window.alert(error.message));
  };

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);
  const loadingMessage = (message) => (
    <p className="section" role="status">{message}</p>
  );
  const adminPage = (element) => authLoading
    ? loadingMessage("Restoring your account...")
    : user?.role === "admin"
      ? element
      : <Navigate to="/login" replace />;

  return (
    <div className={isAuthPage ? "site-layout site-layout-auth" : "site-layout"}>
      {!isAuthPage && (
        user?.role === "admin"
          ? <AdminNavbar logout={handleLogout} />
          : (
            <Navbar
              cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              user={user}
              logout={handleLogout}
            />
          )
      )}

      <div className="site-content">
        {(authError || dataError || cartError) && (
          <p className="profile-picture-error api-error-banner" role="alert">
            {authError || dataError || cartError}
          </p>
        )}
        <Routes>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/store" element={<Store products={products} addToCart={addToCart} />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={authLoading
              ? loadingMessage("Restoring your account...")
              : (
                <Profile
                  key={user?.id || "signed-out"}
                  user={user}
                  cart={cart}
                  updateProfile={updateProfile}
                />
              )}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                setCart={setCart}
                user={user}
                products={products}
                productsLoading={productsLoading}
                cartLoading={cartLoading}
                cartSaving={cartSaving}
                cartError={cartError}
                setOrders={setOrders}
                refreshProducts={refreshProducts}
              />
            }
          />
          <Route
            path="/login"
            element={authLoading
              ? loadingMessage("Restoring your account...")
              : user
                ? <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />
                : <Login />}
          />
          <Route
            path="/signup"
            element={authLoading
              ? loadingMessage("Restoring your account...")
              : user
                ? <Navigate to="/" replace />
                : <Signup />}
          />
          <Route path="/admin" element={adminPage(<Dashboard products={products} orders={orders} />)} />
          <Route
            path="/admin/products"
            element={adminPage(
              <Products products={products} setProducts={setProducts} />
            )}
          />
          <Route
            path="/admin/inventory"
            element={adminPage(
              <Inventory products={products} setProducts={setProducts} />
            )}
          />
          <Route
            path="/admin/orders"
            element={adminPage(
              <Orders
                orders={orders}
                setOrders={setOrders}
                refreshProducts={refreshProducts}
              />
            )}
          />
          <Route path="/admin/sales" element={adminPage(<Sales orders={orders} />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

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
