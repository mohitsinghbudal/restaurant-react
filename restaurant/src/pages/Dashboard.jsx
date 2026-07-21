import React from "react";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import "./Dashboard.css";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";

function Dashboard() {
  const { token, roleId } = GetCurrUser();
  const navigate = useNavigate();

  if (!token) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div className="dashboard">
      <HeroSection/>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">🍽</div>
          <h3>Explore Menu</h3>
          <p>
            Browse our delicious dishes prepared with fresh ingredients and
            authentic flavors.
          </p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🪑</div>
          <h3>Reserve Tables</h3>
          <p>
            Book your favorite table in advance and enjoy a hassle-free dining
            experience.
          </p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🧾</div>
          <h3>Track Orders</h3>
          <p>
            View your current orders and monitor their preparation status in
            real time.
          </p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⭐</div>
          <h3>Premium Service</h3>
          <p>
            Our dedicated staff ensures an exceptional dining experience from
            start to finish.
          </p>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h2>Why Choose Gourmet Haven?</h2>

          <ul>
            <li>Fresh and Hygienic Food</li>
            <li>Professional Chefs</li>
            <li>Fast QR Ordering</li>
            <li>Comfortable Dining Environment</li>
            <li>Excellent Customer Service</li>
          </ul>
        </div>

        
      </div>
      <Footer/>
    </div>
  );
}

export default Dashboard;