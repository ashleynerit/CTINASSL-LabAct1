import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = (event) => {
    event.preventDefault();

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    if (accounts.some((account) => account.email === email)) {
      alert("Email is already registered.");
      return;
    }

    accounts.push({ name, email, password, role: "user" });
    localStorage.setItem("accounts", JSON.stringify(accounts));

    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Join the Agnified community">
      <form onSubmit={signup}>
        <input
          placeholder="Full Name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          minLength={8}
        />
        <button className="primary-btn full-btn">CREATE ACCOUNT</button>
      </form>
      <p>Already have an account? <Link to="/login">Log In</Link></p>
    </AuthLayout>
  );
}