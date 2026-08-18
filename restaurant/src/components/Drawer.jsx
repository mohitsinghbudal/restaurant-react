
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import "./Drawer.css";

function Drawer({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { token, roles = [] } = GetCurrUser();

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setIsOpen(false);
    navigate("/login");
  };

  const cookLinks = [
    { name: "Dashboard", path: "/cook-dashboard", icon: "🏠"},
  ];
  const adminLinks = [
    { name: "Dashboard", path: "/admin-dashboard", icon: "🏠" },
    { name: "Inventory", path: "/admin-inventory", icon: "📦" },
    { name: "Menu", path: "/admin-menu", icon: "🍽️" },
    { name: "Orders", path: "/admin-orders", icon: "📋" },
    {name:"Recepie",path:"/admin-recepie",icon:"🍽️"},
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

  const waiterLinks = [
    { name: "Dashboard", path: "/waiter-dashboard", icon: "🏠" }
  ];

  const guestLinks = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Menu", path: "/menu", icon: "🍽️" },
    { name: "Table", path: "/guest-table", icon: "🪑" },
    { name: "Contact", path: "/contact", icon: "📞" },
    { name: "Login", path: "/login", icon: "🔑" },
    { name: "Signup", path: "/signup", icon: "📝" }
  ];

  let links = guestLinks;

  // Admin
  if (token && roles.includes(5)) {
    links = adminLinks;
  }
  // Waiter
  else if (token && roles.includes(2)) {
    links = waiterLinks;
  }
  // Customer
  else if (token && roles.includes(1)) {
    links = customerLinks;
  }
  else if(token&& roles.includes(4)){
    links = cookLinks;
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

