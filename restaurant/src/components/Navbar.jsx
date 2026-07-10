import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          Gourmet Haven
        </div>
        
        <ul className="navbar-list">
          <li className="navbar-item">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active navbar-link" : "navbar-link")}>
              Home
            </NavLink>
          </li>

          {isLoggedIn ? (
            <li className="navbar-item">
              <button className="navbar-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <li className="navbar-item">
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active navbar-link" : "navbar-link")}>
                Login
              </NavLink>
            </li>
          )}

          <li className="navbar-item">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active navbar-link" : "navbar-link")}>
              Dashboard
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active navbar-link" : "navbar-link")}>
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;