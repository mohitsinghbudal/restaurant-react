import React from "react";
import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">ESTABLISHED PRESTIGE</span>
        <h1 className="hero-title">Welcome to Gourmet Haven</h1>
        <div className="hero-divider"></div>
        <p className="hero-subtitle">
          Discover the essence of hospitality at our hotel. 
          From fine dining to cozy stays, we bring you authentic flavors 
          and warm experiences crafted with passion.
        </p>
        <button className="hero-btn">Explore Menu</button>
      </div>
    </section>
  );
}

export default HeroSection;