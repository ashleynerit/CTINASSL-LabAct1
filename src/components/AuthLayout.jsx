
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

    </div>
  );
}

export default AuthLayout;
