
import { Link } from "react-router-dom";

function AuthLayout({
  title,
  children,
  footerText,
  footerLink,
  footerLinkText
}) {
  return (
    <div className="auth-page">

      <div className="auth-brand">
        <div className="auth-logo">
          <img src="/images/logo.png" alt="Garden of Daffodils" />
          <p className="auth-brand-tagline">
            Agnified Stories Official Book <br /> and Merchandise Store
          </p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-form-card">

          <h2>{title}</h2>

          {children}

          <p className="auth-footer">
            {footerText}{" "}
            <Link to={footerLink}>
              {footerLinkText}
            </Link>
          </p>

        </div>
      </div>

      <div className="auth-decoration" aria-hidden="true">
        <img
          className="auth-daffodil"
          src="/images/daffodil.png"
          alt=""
        />
      </div>
    </div>
  );
}

export default AuthLayout;
