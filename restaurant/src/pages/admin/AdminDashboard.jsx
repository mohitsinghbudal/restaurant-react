import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaChair,
  FaShoppingCart,
  FaMoneyBillWave,
  FaBoxes,
  FaChartBar,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Today's Revenue",
      value: "Rs. 42,580",
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Today's Orders",
      value: "126",
      icon: <FaShoppingCart />,
    },
    {
      title: "Active Tables",
      value: "18 / 25",
      icon: <FaChair />,
    },
    {
      title: "Registered Users",
      value: "248",
      icon: <FaUsers />,
    },
    {
      title: "Menu Items",
      value: "85",
      icon: <FaUtensils />,
    },
    {
      title: "Inventory Items",
      value: "142",
      icon: <FaBoxes />,
    },
    {
      title: "Pending Bills",
      value: "9",
      icon: <FaClipboardList />,
    },
    {
      title: "Low Stock",
      value: "5 Items",
      icon: <FaExclamationTriangle />,
    },
  ];

  const actions = [
    {
      title: "Inventory",
      icon: <FaBoxes />,
      route: "/admin-inventory",
    },
    {
      title: "Menu",
      icon: <FaUtensils />,
      route: "/admin-menu",
    },
    {
      title: "Orders",
      icon: <FaShoppingCart />,
      route: "/admin-orders",
    },
    {
      title: "Tables",
      icon: <FaChair />,
      route: "/admin-table",
    },
    {
      title: "Bills",
      icon: <FaClipboardList />,
      route: "/admin-bill",
    },
    {
      title: "Payments",
      icon: <FaMoneyBillWave />,
      route: "/admin-payment",
    },
    {
      title: "Users",
      icon: <FaUsers />,
      route: "/admin-users",
    },
    {
      title: "Reports",
      icon: <FaChartBar />,
      route: "/admin-reports",
    },
  ];

  return (
    <div className="dashboard">

      <div className="dashboard-header">

        <div>
          <h1>Restaurant Dashboard</h1>
          <p>
            Welcome back, Admin. Here's an overview of today's restaurant
            activities.
          </p>
        </div>

        <div className="dashboard-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

      </div>

      <div className="stats-grid">

        {stats.map((card, index) => (
          <div key={index} className="stat-card">

            <div className="stat-icon">
              {card.icon}
            </div>

            <div>

              <h4>{card.title}</h4>

              <h2>{card.value}</h2>

            </div>

          </div>
        ))}

      </div>

      <div className="quick-section">

        <div className="section-title">
          Quick Actions
        </div>

        <div className="quick-grid">

          {actions.map((action, index) => (

            <div
              key={index}
              className="quick-card"
              onClick={() => navigate(action.route)}
            >

              <div className="quick-icon">
                {action.icon}
              </div>

              <h3>{action.title}</h3>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;