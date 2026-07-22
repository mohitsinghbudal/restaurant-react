import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleId, setRoleId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { token, roleId } = GetCurrUser();

    console.log(roleId);

    setIsLoggedIn(!!token);
    setRoleId(Number(roleId));
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setRoleId(null);
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Home
            </NavLink>
          </li>

          

          <li className="navbar-item">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Contact
            </NavLink>
          </li>

          {isLoggedIn && (
            <li className="navbar-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Dashboard
              </NavLink>
            </li>
          )}

          {isLoggedIn && roleId === 1 && (
            <li className="navbar-item">
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Inventory
              </NavLink>
            </li>
            
          )}
          {(isLoggedIn && roleId === 1) ? ( 
            <li className="navbar-item">
              <NavLink
                to="/customer-menu"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Menu
              </NavLink>
            </li>
          ):<li className="navbar-item">
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Guest Menu
              </NavLink>
            </li>}

          {isLoggedIn && (
            <li className="navbar-item">
              <NavLink
                to="/table"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Table
              </NavLink>
            </li>
          )}

          {isLoggedIn ? (
            <li className="navbar-item">
              <button
                className="navbar-link logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="navbar-item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;