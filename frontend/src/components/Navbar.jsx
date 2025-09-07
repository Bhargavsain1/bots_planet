import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .navbar {
          width: 100%;
          background: linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .navbar-content {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .navbar-logo a {
          color: #fff;
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
          letter-spacing: 1px;
        }
        .navbar-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .navbar-links a {
          color: #fff;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.2s;
        }
        .navbar-links a:hover {
          color: #ffd700;
        }
        .navbar-btn {
          background: #fff;
          color: #2563eb;
          border: none;
          padding: 0.4rem 1.1rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          margin-left: 0.5rem;
          transition: background 0.2s, color 0.2s;
        }
        .navbar-btn:hover {
          background: #ffd700;
          color: #1e3a8a;
        }
      `}</style>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Link to="/">Bots Planet</Link>
          </div>
          <div className="navbar-links">
            <Link to="/pricing">Pricing</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/contact">Contact</Link>
            {user ? (
              <button className="navbar-btn" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 