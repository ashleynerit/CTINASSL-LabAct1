import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = (event) => {
    event.preventDefault();

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const account = accounts.find(
      (item) => item.email === email && item.password === password
    );

    if (!account) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
    navigate(account.role === "admin" ? "/admin" : "/");
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your Agnified account">
      <form onSubmit={login}>
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="primary-btn full-btn">LOG IN</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </AuthLayout>
  );
}