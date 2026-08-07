import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import "./Drawer.css";

function Drawer({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { token, roleId } = GetCurrUser();

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setIsOpen(false);
    navigate("/login");
  };

  const adminLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Inventory", path: "/admin-inventory", icon: "📦" },
    { name: "Menu", path: "/admin-menu", icon: "🍽️" },
    { name: "Orders", path: "/admin-orders", icon: "📋" },
    { name: "Dining", path: "/admin-dining", icon: "🍴" },
    { name: "Tables", path: "/admin-table", icon: "🪑" },
    { name: "Bills", path: "/admin-bill", icon: "🧾" },
    { name: "Payments", path: "/admin-payment", icon: "💳" },
    { name: "Users", path: "/admin-users", icon: "👥" },
    { name: "Reports", path: "/admin-reports", icon: "📊" }
  ];

  const customerLinks = [
    { name: "Menu", path: "/customer-menu", icon: "🍽️" },
    { name: "Cart", path: "/customer-cart", icon: "🛒" },
    { name: "Orders", path: "/customer-orders", icon: "📋" },
    { name: "Bill", path: "/customer-bill", icon: "🧾" },
    { name: "Table", path: "/customer-table", icon: "🪑" }
  ];

  const guestLinks = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Menu", path: "/menu", icon: "🍽️" },
    { name: "Table", path: "/guest-table", icon: "🪑" },
    { name: "Contact", path: "/contact", icon: "📞" },
    { name: "Login", path: "/login", icon: "🔑" },
    { name: "Signup", path: "/signup", icon: "📝" }
  ];

  const waiterLinks = [
    { name: "Dashboard", path: "/waiter-dashboard", icon: "🏠" },
  ];

  let links = guestLinks;

  if (token && Number(roleId) === 5) {
    links = adminLinks;
  } else if (token && Number(roleId) === 1) {
    links = customerLinks;
  }else if(token && Number(roleId) === 2){
    links = waiterLinks;
  }

  return (
    <>
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={closeDrawer}
        />
      )}

      <aside className={`drawer ${isOpen ? "open" : ""}`}>

        <div className="drawer-header">

          <h2>Gourmet Haven</h2>

          <button
            className="drawer-close"
            onClick={closeDrawer}
          >
            ✕
          </button>

        </div>

        <nav className="drawer-nav">

          {links.map((link) => (

            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                isActive
                  ? "drawer-link active"
                  : "drawer-link"
              }
            >
              <span className="drawer-icon">
                {link.icon}
              </span>

              {link.name}
            </NavLink>

          ))}

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "drawer-link active"
                : "drawer-link"
            }
            onClick={closeDrawer}
          >
            <span className="drawer-icon">
              📞
            </span>

            Contact
          </NavLink>

          {token && (

            <button
              className="drawer-logout"
              onClick={logout}
            >
              🚪 Logout
            </button>

          )}

        </nav>

      </aside>
    </>
  );
}

export default Drawer;