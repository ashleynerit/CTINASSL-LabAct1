
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiRequest } from "../utils/api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: { name, email, password }
      });
      alert("Account created successfully!");
      navigate("/login");
    } catch (signupError) {
      setError(signupError.message);
    }
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
          <label htmlFor="signup-name">Display name</label>

          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email</label>

          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">Password</label>

          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          SIGN UP
        </button>

      </form>
      {error && (
        <p className="profile-picture-error" role="alert">{error}</p>
      )}

    </AuthLayout>
  );
}

export default Signup;
