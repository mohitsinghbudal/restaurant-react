import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "../../util/api";
import "./CustomerMenu.css";
import {useNavigate} from "react-router-dom";

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});

  const navigate = useNavigate();

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

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.itemDescription.toLowerCase().includes(search.toLowerCase());

      const matchesAvailability = showAvailableOnly
        ? item.isAvailable
        : true;

      return matchesSearch && matchesAvailability;
    });
  }, [menuData, search, showAvailableOnly]);

  const increaseQty = (menuId) => {
    setQuantities((prev) => ({
      ...prev,
      [menuId]: (prev[menuId] || 1) + 1,
    }));
  };

  const decreaseQty = (menuId) => {
    setQuantities((prev) => ({
      ...prev,
      [menuId]: Math.max((prev[menuId] || 1) - 1, 1),
    }));
  };

  const addToCart = (item) => {
  const qty = quantities[item.menuId] || 1;

  let updatedCart = [...cart];

  const existingIndex = updatedCart.findIndex(
    (c) => c.menuId === item.menuId
  );

  if (existingIndex !== -1) {
    updatedCart[existingIndex].quantity += qty;
  } else {
    updatedCart.push({
      ...item,
      quantity: qty,
    });
  }

  setCart(updatedCart);

  sessionStorage.setItem("cart", JSON.stringify(updatedCart));
};

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

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
        <h1>🍽 Our Menu</h1>
        <p>Freshly prepared dishes made with quality ingredients.</p>
      </div>

      <div className="menu-toolbar">
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="available-filter">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={() => setShowAvailableOnly(!showAvailableOnly)}
          />
          Available Only
        </label>

        <div className="cart-summary">
          <span>🛒 {totalItems} Items</span>
          <span>Rs. {totalPrice}</span>
        </div>
      </div>

      {filteredMenu.length > 0 ? (
        <div className="menu-grid">
          {filteredMenu.map((item) => (
            <div
              key={item.menuId}
              className={`menu-card ${
                !item.isAvailable ? "menu-disabled" : ""
              }`}
            >
              <div className="menu-card-top">
                <h3>{item.itemName}</h3>

                
              </div>

              <p className="description">{item.itemDescription}</p>

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
                <span className="price">
                  Rs. {item.itemPrice}
                </span>
              </div>

              <div className="quantity-box">
                <button
                  onClick={() => decreaseQty(item.menuId)}
                  disabled={!item.isAvailable}
                >
                  -
                </button>

                <span>{quantities[item.menuId] || 1}</span>

                <button
                  onClick={() => increaseQty(item.menuId)}
                  disabled={!item.isAvailable}
                >
                  +
                </button>
              </div>

              <button
                className="add-cart-btn"
                disabled={!item.isAvailable}
                onClick={() => addToCart(item)}
              >
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-menu">
          <h2>No Menu Items Found</h2>
        </div>
      )}

      {cart.length > 0 && (
        <div className="floating-cart">
          <div>
            <h3>🛒 Cart</h3>
            <p>{totalItems} Items</p>
            <strong>Rs. {totalPrice}</strong>
          </div>

          <button onClick={()=>{navigate("/customer-cart")}}>View Cart</button>
        </div>
      )}
    </div>
  );
}

export default Menu;