import { useNavigate } from "react-router-dom";

export default function Cart({ cart, setCart }) {
  const navigate = useNavigate();
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

  const checkout = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please log in before checking out.");
      navigate("/login");
      return;
    }

    if (!cart.length) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.push({
      id: Date.now(),
      email: user.email,
      items: cart,
      total,
      status: "Pending",
      date: new Date().toLocaleDateString()
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    setCart([]);
    alert("Demo order placed successfully!");
    navigate("/profile");
  };

  return (
    <main className="section">
      <h1>My Cart</h1>

      {cart.length === 0 ? (
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
          <button className="primary-btn" onClick={checkout}>
            CHECKOUT
          </button>
        </>
      )}
    </main>
  );
}