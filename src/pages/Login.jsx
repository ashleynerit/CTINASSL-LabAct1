
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const accounts = JSON.parse(
      localStorage.getItem("accounts") || "[]"
    );

    const account = accounts.find(
      a =>
        a.email === email &&
        a.password === password
    );

    if (!account) {
      alert("Invalid email or password.");
      return;
    }

    login(account);

    if (account.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign up"
    >

      <form onSubmit={handleLogin} className="auth-form">

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
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          LOG IN
        </button>

      </form>

    </AuthLayout>
  );
}

export default Login;
