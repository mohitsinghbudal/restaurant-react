import React, { useState, useEffect } from "react";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";

function HeroSection() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ token: null, roles: [] });

  useEffect(() => {
    // Read current user session data on component mount
    const user = GetCurrUser();
    if (user) {
      setUserData({
        token: user.token,
        roles: user.roles || [],
      });
    }
  }, []);

  const { token, roles } = userData;

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">ESTABLISHED PRESTIGE</span>
        <h1 className="hero-title">Welcome to Gourmet Haven</h1>
        <p className="hero-subtitle">
          Discover the essence of hospitality at our hotel. From fine dining to
          cozy stays, we bring you authentic flavors and warm experiences crafted
          with passion.
        </p>

        <div className="hero-actions">
          {/* Always visible for guest/customer browsing */}
          <button className="hero-btn" onClick={() => navigate("/menu")}>
            Explore Menu
          </button>

{token && roles.includes("Customer") && (
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate("/customer-table")}
            >
              Book a Table
            </button>
          )}

          {!token && (
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate("/guest-table")}
            >
              Book a Table
            </button>
          )}

          {token && roles.includes("Admin") && (
            <button
              className="hero-btn"
              onClick={() => navigate("/admin-inventory")}
            >
              Inventory
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;