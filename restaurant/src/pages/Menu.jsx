import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../util/api";
import "./Menu.css";

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const[selected,setSelected] = useState([]);
  
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const baseUrl = api();
        const res = await axios.get(`${baseUrl}/Menu/get-all`);

        setMenuData(res.data.items || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="menu-loading">
        <h2>Loading Menu...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-error">
        <h2>{error}</h2>
      </div>
    );
  }


  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Freshly prepared dishes made with quality ingredients.</p>
        <p>Kindly select items to order</p>
      </div>

      {menuData.length > 0 ? (
        <div className="menu-grid">
          {menuData.map((item) => (
            <div className="menu-card" key={item.menuId} onClick = {()=>setSelected([...item])}>
              <div className="menu-card-top">
                <h3>{item.itemName}</h3>

                <span className="price">
                  Rs. {item.itemPrice}
                </span>
              </div>

              <p className="description">
                {item.itemDescription}
              </p>

              <div className="menu-footer">
                <span
                  className={
                    item.isAvailable
                      ? "status available"
                      : "status unavailable"
                  }
                >
                  {item.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-menu">
          <h2>No Menu Items Available</h2>
        </div>
      )}
      
    </div>
  );
}

export default Menu;