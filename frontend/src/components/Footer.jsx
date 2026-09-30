import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">B</span>
              <span className="logo-text">BlogSpace</span>
            </Link>
            <p className="footer-tagline">
              A modern platform for writers to share their stories with the world.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <Link to="/">Home</Link>
              <Link to="/register">Get Started</Link>
              <Link to="/login">Login</Link>
            </div>
            <div className="footer-column">
              <h4>Features</h4>
              <Link to="/create-blog">Write</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-blogs">Manage Blogs</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BlogSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
