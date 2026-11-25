import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <h2>AGNIFIED.</h2>
      <p>Stories worth keeping.</p>
      <div>
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>
        <Link to="/about">About</Link>
      </div>
      <p>For inquiries, contact us through our official social media channels.</p>
      <small>© {new Date().getFullYear()} Agnified. All Rights Reserved.</small>
    </footer>
  );
}