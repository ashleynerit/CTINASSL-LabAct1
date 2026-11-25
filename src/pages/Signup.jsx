
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    const accounts = JSON.parse(
      localStorage.getItem("accounts") || "[]"
    );

    const existingAccount = accounts.find(
      account => account.email === email
    );

    if (existingAccount) {
      alert("Email is already registered.");
      return;
    }

    const newAccount = {
      id: Date.now(),
      name,
      email,
      password,
      role: "user"
    };

    accounts.push(newAccount);

    localStorage.setItem(
      "accounts",
      JSON.stringify(accounts)
    );

    alert("Account created successfully!");

    navigate("/login");
  };

  return (
    <AuthLayout
      title="Create account"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
    >

      <form onSubmit={handleSignup} className="auth-form">

        <div className="form-group">
          <label>Display name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          SIGN UP
        </button>

      </form>

    </AuthLayout>
  );
}

export default Signup;
