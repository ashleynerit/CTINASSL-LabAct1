export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1>AGNIFIED.</h1>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
