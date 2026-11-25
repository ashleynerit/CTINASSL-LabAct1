
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    try {
      const account = await login({ email, password });
      navigate(account.role === "admin" ? "/admin" : "/");
    } catch (loginError) {
      setError(loginError.message);
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
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
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
      {(error || authError) && (
        <p className="profile-picture-error" role="alert">
          {error || authError}
        </p>
      )}

    </AuthLayout>
  );
}

export default Login;
