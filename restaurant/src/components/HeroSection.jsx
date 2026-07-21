import React from "react";
import "./HeroSection.css";
import {useNavigate} from 'react-router-dom';
import GetCurrUser from "../util/GetcurrUser";

function HeroSection() {
  const {token,roleId} = GetCurrUser();
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">ESTABLISHED PRESTIGE</span>
        <h1 className="hero-title">Welcome to Gourmet Haven</h1>
        <p className="hero-subtitle">
          Discover the essence of hospitality at our hotel. 
          From fine dining to cozy stays, we bring you authentic flavors 
          and warm experiences crafted with passion.
        </p>
        <button className="hero-btn" onClick = {()=>navigate("/menu")}>Explore Menu</button>
        <button
              className="hero-btn  hero-btn-primary"
              onClick={() => navigate("/booktable")}
            >
              Book a Table
            </button>

            {Number(roleId) === 5 && (
              <button
                className="hero-btn"
                onClick={() => navigate("/inventory")}
              >
                Inventory
              </button>
            )}
      </div>
    </section>
  );
}

export default HeroSection;