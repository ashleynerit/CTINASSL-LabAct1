import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../utils/api";

export default function Cart({
  cart,
  setCart,
  user,
  products,
  productsLoading,
  cartLoading,
  cartSaving,
  cartError,
  setOrders,
  refreshProducts
}) {
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (id, amount) => {
    setCart((previousCart) => previousCart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    ));
  };

  const checkout = async () => {
    if (!user) {
      alert("Please log in before checking out.");
      navigate("/login");
      return;
    }

    if (!cart.length || submitting || productsLoading ||
      cartLoading || cartSaving || cartError) return;
    setCheckoutError("");

    const unavailableItem = cart.find((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return !product || Number(product.stock) < Number(item.quantity);
    });

    if (unavailableItem) {
      setCheckoutError(
        `${unavailableItem.name} is no longer available in the requested quantity.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest("/api/orders", {
        method: "POST",
        body: {}
      });
      setOrders((previousOrders) => [result.order, ...previousOrders]);
      setCart([]);
      navigate("/profile");
      refreshProducts().catch((error) => {
        console.error("Order succeeded, but refreshing product stock failed.", error);
      });
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="section">
      <h1>My Cart</h1>

      {cartLoading ? (
        <p role="status">Loading your cart...</p>
      ) : cart.length === 0 ? (
        <p>Your cart is currently empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td data-label="Item">{item.name}</td>
                  <td data-label="Quantity">
                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => setCart((previousCart) =>
                          previousCart.filter((product) => product.id !== item.id)
                        )}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                  <td data-label="Price">₱{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="cart-total">Total: ₱{total.toFixed(2)}</h2>
          {checkoutError && (
            <p className="profile-picture-error" role="alert">{checkoutError}</p>
          )}
          <button
            className="primary-btn"
            onClick={checkout}
            disabled={
              submitting ||
              productsLoading ||
              cartLoading ||
              cartSaving ||
              Boolean(cartError)
            }
          >
            {submitting
              ? "PLACING ORDER..."
              : cartSaving
                ? "SAVING CART..."
                : "CHECKOUT"}
          </button>
        </>
      )}
    </main>
  );
}