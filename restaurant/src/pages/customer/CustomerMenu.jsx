import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";
import "./CustomerMenu.css";
import { useNavigate } from "react-router-dom";

function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null); // Tracks individual item submission state
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [quantities, setQuantities] = useState({});

  const { token, userId } = GetCurrUser();
  const navigate = useNavigate();
  const baseUrl = api();

  const fetchMenuAndCart = useCallback(async () => {
    try {
      const authHeaders = { Authorization: token ? `Bearer ${token}` : "" };

      // 1. Fetch Menu Items
      const res = await axios.get(`${baseUrl}/Menu/get-all`, {
        headers: authHeaders,
      });
      setMenuData(res.data.items || res.data || []);

      // 2. Fetch User Cart from Server on load / re-sync
      if (userId && token) {
        const cartRes = await axios.get(`${baseUrl}/Cart`, {
          params: { userId: Number(userId) },
          headers: authHeaders,
        });

        const fetchedCart = Array.isArray(cartRes.data)
          ? cartRes.data
          : cartRes.data
          ? [cartRes.data]
          : [];

        setCart(fetchedCart);
        sessionStorage.setItem("cart", JSON.stringify(fetchedCart));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, userId]);

  useEffect(() => {
    fetchMenuAndCart();
  }, [fetchMenuAndCart]);

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      const name = item.itemName || "";
      const description = item.itemDescription || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());

      const matchesAvailability = showAvailableOnly ? item.isAvailable : true;

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

  const addToCart = async (item) => {
    const selectedQty = quantities[item.menuId] || 1;
    const nowIso = new Date().toISOString();

    const payload = {
      userId: Number(userId) || 0,
      menuId: item.menuId,
      quantity: selectedQty,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      setAddingToCartId(item.menuId); // Only mark this specific item as submitting

      await axios.post(`${baseUrl}/Cart`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast("success", "Item added to cart successfully!");

      // Reset the selected item quantity selector back to 1
      setQuantities((prev) => ({ ...prev, [item.menuId]: 1 }));

      // Fetch fresh cart state without toggling main loading state
      await fetchMenuAndCart();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to add item to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(() => {
    const menuMap = {};
    menuData.forEach((m) => {
      menuMap[m.menuId] = m.itemPrice || m.price || 0;
    });

    return cart.reduce((sum, item) => {
      const price = menuMap[item.menuId] || item.itemPrice || item.price || 0;
      return sum + Number(price) * item.quantity;
    }, 0);
  }, [cart, menuData]);

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
              {item.itemImage && (
                <div className="menu-card-image">
                  <img src={item.itemImage} alt={item.itemName} />
                </div>
              )}

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
                <span className="price">Rs. {item.itemPrice || item.price}</span>
              </div>

              <div className="quantity-box">
                <button
                  onClick={() => decreaseQty(item.menuId)}
                  disabled={!item.isAvailable || addingToCartId === item.menuId}
                >
                  -
                </button>

                <span>{quantities[item.menuId] || 1}</span>

                <button
                  onClick={() => increaseQty(item.menuId)}
                  disabled={!item.isAvailable || addingToCartId === item.menuId}
                >
                  +
                </button>
              </div>

              <button
                className="add-cart-btn"
                disabled={!item.isAvailable || addingToCartId === item.menuId}
                onClick={() => addToCart(item)}
              >
                {addingToCartId === item.menuId ? "Adding..." : "Add To Cart"}
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

          <button onClick={() => navigate("/customer-cart")}>
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default Menu;