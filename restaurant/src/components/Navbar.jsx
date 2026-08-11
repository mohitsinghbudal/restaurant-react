
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import Drawer from "./Drawer";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { token, roles } = GetCurrUser();

    console.log("Roles:", roles);

    setIsLoggedIn(!!token);
    setRoles(roles || []);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();

    setIsLoggedIn(false);
    setRoles([]);

    navigate("/login");
  };

  const guestLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" }
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Menu", path: "/admin-menu" },
    { name: "Tables", path: "/admin-table" },
    { name: "Reports", path: "/admin-reports" }
  ];

  const customerLinks = [
    { name: "Menu", path: "/customer-menu" },
    { name: "Orders", path: "/customer-orders" }
  ];

  const waiterLinks = [
    { name: "Dashboard", path: "/waiter-dashboard" }
  ];

  
  const isAdmin = roles.includes(5);
  const isWaiter = roles.includes(2);
  const isCustomer = roles.includes(1);

  
  let navLinks = guestLinks;

  if (isLoggedIn) {
    if (isAdmin) {
      navLinks = adminLinks;
    } else if (isWaiter) {
      navLinks = waiterLinks;
    } else if (isCustomer) {
      navLinks = customerLinks;
    } else {
      navLinks = [];
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          <button
            className="menu-btn"
            onClick={() => setIsDrawerOpen(true)}
          >
            ☰
          </button>

          <div
            className="navbar-logo"
            onClick={() => navigate("/")}
          >
            Gourmet Haven
          </div>

          <ul className="navbar-list">

            {navLinks.map((link) => (
              <li
                key={link.path}
                className="navbar-item navbar-desktop"
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? "navbar-link active"
                      : "navbar-link"
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
                    isActive
                      ? "navbar-link active"
                      : "navbar-link"
                  }
                >
                  Login
                </NavLink>
              )}
            </li>

          </ul>
        </div>
      </nav>

      <Drawer
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
      />
    </>
  );
}

export default Navbar;
