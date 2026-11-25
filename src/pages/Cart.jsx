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
      <h1>Shopping Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is currently empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="order-row" key={item.id}>
              <span>{item.name}</span>
              <div>
                <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                {" "}{item.quantity}{" "}
                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => setCart((previousCart) =>
                previousCart.filter((product) => product.id !== item.id)
              )}>
                Remove
              </button>
            </div>
          ))}

          <h2>Total: ₱{total.toFixed(2)}</h2>
          <button className="primary-btn" onClick={checkout}>
            CHECKOUT
          </button>
        </>
      )}
    </main>
  );
}