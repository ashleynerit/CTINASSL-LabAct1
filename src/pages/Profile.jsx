import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { apiRequest } from "../utils/api";

export default function Profile({ user, cart, updateProfile }) {
  const [uploadError, setUploadError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(Boolean(user));
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    apiRequest("/api/orders/mine")
      .then((result) => {
        if (active) {
          setOrders(result.orders);
          setOrdersError("");
        }
      })
      .catch((error) => {
        if (active) setOrdersError(error.message);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="section">
        <h2>Please log in to view your profile.</h2>
        <Link to="/login">Log In</Link>
      </div>
    );
  }

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Choose a valid image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setUploadError("Choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        setUploadError("Unable to read the selected image.");
        return;
      }

      try {
        await updateProfile({ profilePicture: reader.result });
      } catch (error) {
        setUploadError(error.message);
      }
    };
    reader.onerror = () => {
      setUploadError("Unable to read the selected image.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <main className="section">
      <p className="accent">YOUR ACCOUNT</p>
      <h1>My Profile</h1>

      <div className="profile-card profile-card-user">
        <div className="profile-avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={`${user.name}'s profile`} />
          ) : (
            <User size={40} />
          )}
        </div>

        <div className="profile-details">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>

        <div className="profile-picture-actions">
          <label className="profile-picture-upload">
            {user.profilePicture ? "Change profile picture" : "Add profile picture"}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </label>
          <p className="profile-picture-hint">Choose an image up to 1 MB.</p>
          {uploadError && (
            <p className="profile-picture-error" role="alert">{uploadError}</p>
          )}
        </div>
      </div>

      <h2>My Purchase History</h2>
      {ordersLoading && <p role="status">Loading your orders...</p>}
      {ordersError && (
        <p className="profile-picture-error" role="alert">{ordersError}</p>
      )}
      {!ordersLoading && !ordersError && orders.length === 0 && (
        <p>You have not placed any orders yet.</p>
      )}
      {orders.map((order) => (
        <div className="order-row" key={order.id}>
          <span>Order #{order.id}</span>
          <span>₱{Number(order.total).toFixed(2)}</span>
          <span>{order.status}</span>
        </div>
      ))}

      <p className="muted">
        Your shopping cart contains {cart.length} different products.
      </p>
    </main>
  );
}