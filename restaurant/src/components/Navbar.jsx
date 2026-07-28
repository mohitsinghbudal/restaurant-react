import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import Drawer from "./Drawer";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { token, roleId } = GetCurrUser();
    setIsLoggedIn(!!token);
    setRoleId(Number(roleId));
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setIsLoggedIn(false);
    setRoleId(null);
    navigate("/login");
  };

  // Original links only
  const guestLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Menu", path: "/admin-menu" },
    { name: "Tables", path: "/admin-table" },
    { name: "Reports", path: "/admin-reports" },
  ];

  // Select link set based on user status
  const navLinks = isLoggedIn && roleId === 5 ? adminLinks : !isLoggedIn ? guestLinks : [];

  return (
    <>
      <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />

      <nav className="navbar">
        <div className="navbar-container">
          <button
            className="menu-btn"
            onClick={() => setIsDrawerOpen(true)}
          >
            ☰
          </button>

          <div className="navbar-logo" onClick={() => navigate("/")}>
            Gourmet Haven
          </div>

          <ul className="navbar-list">
            {navLinks.map((link) => (
              <li key={link.path} className="navbar-item navbar-desktop">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            <li className="navbar-item navbar-desktop">
              {isLoggedIn ? (
                <button
                  className="navbar-link logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                >
                  Login
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;