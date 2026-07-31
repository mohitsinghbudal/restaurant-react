import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedin, setLoggedin] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [serviceStatus, setServiceStatus] = useState({ meal: "Closed", open: false });

  useEffect(() => {
    const existingToken = sessionStorage.getItem("token");
    setLoggedin(!!existingToken);
    if (existingToken) {
      const existingRoles = JSON.parse(sessionStorage.getItem("roles") || "[]");
      if (existingRoles.includes("Admin")) {
        setDashboardPath("/admin-dashboard");
      } else if (existingRoles.includes("Customer")) {
        setDashboardPath("/customer-table");
      } else {
        setDashboardPath("/dashboard");
      }
    } else {
      setDashboardPath("/dashboard");
    }
  }, [location]);

  useEffect(() => {
    const checkMealStatus = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 7 && currentHour < 11) {
        setServiceStatus({ meal: "Breakfast", open: true });
      } else if (currentHour >= 11 && currentHour < 16) {
        setServiceStatus({ meal: "Lunch", open: true });
      } else if (currentHour >= 17 && currentHour < 23) {
        setServiceStatus({ meal: "Dinner", open: true });
      } else {
        setServiceStatus({ meal: "Kitchen Closed", open: false });
      }
    };

    checkMealStatus();
    const interval = setInterval(checkMealStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setLoggedin(false);
    navigate("/login");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand-info">
          <h2 className="footer-brand">Gourmet Haven</h2>
          <div className="footer-mini-divider"></div>
          <p className="footer-text">
            Crafting memorable culinary journeys and pristine hospitality experiences with passion and elegance.
          </p>
        </div>

        <div className="footer-section links-info">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to={dashboardPath}>Dashboard</Link></li>
            {!loggedin ? (
              <li><Link to="/login">Login</Link></li>
            ) : (
              <li><span className="footer-logout-span" onClick={handleLogout}>Logout</span></li>
            )}
          </ul>
        </div>

        <div className="footer-section contact-info">
          <h4 className="footer-heading">Hours & Status</h4>
          <div className="status-container">
            <span className={`status-indicator ${serviceStatus.open ? 'open' : 'closed'}`}></span>
            <span className="status-text">
              {serviceStatus.open ? `Currently Serving: ${serviceStatus.meal}` : 'Kitchen Closed'}
            </span>
          </div>
          <p className="footer-text sub-hours">Breakfast: 7:00 AM – 11:00 AM</p>
          <p className="footer-text sub-hours">Lunch: 11:00 AM – 4:00 PM</p>
          <p className="footer-text sub-hours">Dinner: 5:00 PM – 11:00 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Gourmet Haven. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;