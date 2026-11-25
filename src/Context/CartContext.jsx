import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../utils/api";

const CartContext = createContext(null);

const cartKey = (items) => JSON.stringify(
  items.map(({ id, quantity }) => ({ id, quantity }))
);

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCartState] = useState([]);
  const [cartLoadState, setCartLoadState] = useState({
    userKey: null,
    loading: true
  });
  const [cartSaving, setCartSaving] = useState(false);
  const [cartError, setCartError] = useState("");
  const currentUserKey = user?.id || "guest";
  const cartLoading = authLoading ||
    cartLoadState.userKey !== currentUserKey ||
    cartLoadState.loading;
  const activeUserKeyRef = useRef(null);
  const readyUserKeyRef = useRef(null);
  const persistedCartKeyRef = useRef("[]");
  const editVersionRef = useRef(0);
  const pendingWritesRef = useRef(0);
  const writeQueueRef = useRef(Promise.resolve());

  const setCart = useCallback((update) => {
    editVersionRef.current += 1;
    setCartSaving(true);
    setCartError("");
    setCartState((currentCart) => {
      const nextCart = typeof update === "function"
        ? update(currentCart)
        : update;
      return nextCart;
    });
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;

    let active = true;
    const userKey = currentUserKey;
    readyUserKeyRef.current = null;

    if (activeUserKeyRef.current !== userKey) {
      activeUserKeyRef.current = userKey;
      editVersionRef.current += 1;
    }

    apiRequest("/api/cart")
      .then((result) => {
        if (!active) return;
        const items = result.items || [];
        persistedCartKeyRef.current = cartKey(items);
        readyUserKeyRef.current = userKey;
        setCartState(items);
        setCartError("");
      })
      .catch((error) => {
        if (!active) return;
        setCartError(error.message);
      })
      .finally(() => {
        if (active) {
          setCartLoadState({ userKey, loading: false });
          setCartSaving(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authLoading, currentUserKey]);

  useEffect(() => {
    if (authLoading || cartLoading) return undefined;

    const userKey = user?.id || "guest";
    if (readyUserKeyRef.current !== userKey) return undefined;

    const nextCartKey = cartKey(cart);
    if (nextCartKey === persistedCartKeyRef.current &&
      pendingWritesRef.current === 0) {
      setCartSaving(false);
      return undefined;
    }

    const version = editVersionRef.current;
    const items = cart.map(({ id, quantity }) => ({ id, quantity }));
    setCartSaving(true);
    const timer = setTimeout(() => {
      pendingWritesRef.current += 1;
      const write = writeQueueRef.current
        .catch(() => {})
        .then(() => apiRequest("/api/cart", {
          method: "PUT",
          body: { items }
        }));
      writeQueueRef.current = write;

      write
        .then((result) => {
          persistedCartKeyRef.current = cartKey(result.items || []);
          if (version === editVersionRef.current) setCartError("");
        })
        .catch((error) => {
          if (version === editVersionRef.current) setCartError(error.message);
        })
        .finally(() => {
          pendingWritesRef.current -= 1;
          if (version === editVersionRef.current &&
            pendingWritesRef.current === 0) {
            setCartSaving(false);
          }
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [authLoading, cart, cartLoading, user?.id]);

  const addToCart = (product) => {
    if (cartLoading || cartError ||
      readyUserKeyRef.current !== (user?.id || "guest")) {
      alert(cartError || "Your cart is still loading. Please try again in a moment.");
      return;
    }

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

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      addToCart,
      cartLoading,
      cartSaving,
      cartError
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
