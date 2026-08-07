import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const baseUrl = api();
  const { token, userId } = GetCurrUser();

  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // Tracks active backend requests
  const[sessionId, setSessionId] = useState(null);
  const TAX_RATE = 0.13; // 13% Tax / VAT


  // 1. Fetch Session ID
  const fetchSessionId = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/Dinning/my-id`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const id = typeof res.data === "object" ? res.data?.sessionId : res.data;

      if (id) {
        setSessionId(id);
      } else {
        showToast("error", "No active dining session found.");
      }
    } catch (error) {
      console.error("Error fetching session ID:", error);
      showToast("error", "Failed to fetch session ID.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
      if (token && userId) {
        fetchSessionId();
      }
    }, [token, userId]);

  // 1. Fetch Cart Items
  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`${baseUrl}/Cart`, {
        params: { userId },
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const data = Array.isArray(res.data) ? res.data : [res.data];
      setCartItems(data);
    } catch (error) {
      showToast("error", "Failed to fetch cart items.");
    }
  };

  // 2. Fetch Menu Items
  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${baseUrl}/Menu/get-all`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCartItems(), fetchMenuItems()]);
      setLoading(false);
    };

    if (token) {
      loadData();
    }
  }, [token, userId]);

  // Lookup map for fast menu detail resolution
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.menuId] = item;
    });
    return map;
  }, [menuItems]);

  // Merge cart items with menu details
  const detailedCart = useMemo(() => {
    return cartItems.map((cartItem) => {
      const matchedMenu = menuMap[cartItem.menuId] || {};
      return {
        ...cartItem,
        itemName: matchedMenu.itemName || `Item #${cartItem.menuId}`,
        price: matchedMenu.itemPrice || 0,
        description: matchedMenu.description || matchedMenu.itemDescription || "",
      };
    });
  }, [cartItems, menuMap]);

  // Calculate Financial Totals
  const subtotal = useMemo(() => {
    return detailedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [detailedCart]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // 3. Backend Update Handler (PUT /api/Cart)
  const updateQuantityOnBackend = async (cartItem, newQty) => {
    if (newQty < 1) return;

    const previousState = [...cartItems];
    const itemId = cartItem.cartId;
    setUpdatingId(itemId);

    // Optimistically update frontend state
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.cartId && item.cartId === cartItem.cartId) || item.menuId === cartItem.menuId
          ? { ...item, quantity: newQty }
          : item
      )
    );

    // Payload formatted for PUT /api/Cart endpoint schema
    const payload = {
      cartId: Number(cartItem.cartId || cartItem.id || 0),
      userId: Number(userId || cartItem.userId || 0),
      menuId: Number(cartItem.menuId),
      quantity: Number(newQty),
      createdAt: cartItem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await axios.put(`${baseUrl}/Cart`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      showToast("success", "Item quantity updated successfully.");
    } catch (err) {
      showToast("error", "Failed to update item quantity. Rolling back changes.");
      setCartItems(previousState);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleIncrease = (item) => {
    updateQuantityOnBackend(item, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantityOnBackend(item, item.quantity - 1);
    }
  };

  // 4. Remove Single Item Handler (DELETE /api/Cart)
  const handleRemove = async (cartItem) => {
    const previousState = [...cartItems];
    const targetCartId = cartItem.cartId;

    // Optimistically remove from state
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => (item.cartId || item.menuId) !== targetCartId
      )
    );

    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/Cart`, {
        params: { cartId: targetCartId },
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Item removed from cart successfully.");
    } catch (err) {
      showToast("error", "Failed to remove item from cart.");
      setCartItems(previousState);
    } finally {
      setLoading(false);
    }
  };

  // 5. Place Order & Clear Cart Handler
  const handlePlaceOrder = async () => {
    if (detailedCart.length === 0) {
      showToast("error", "Your cart is empty.");
      return;
    }

    setLoading(true);

    const payload = {
      items: detailedCart.map((item) => ({
        menuId: Number(item.menuId),
        itemName: item.itemName,
        diningSessionId: Number(sessionId || 0),
        description: item.description || "",
        createdAt: new Date().toISOString(),
        createdBy: Number(userId || 0),
        isActive: true,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    };

    try {
      // Step A: Submit Order
      await axios.post(`${baseUrl}/Order/place-order`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      // Step B: Clear Cart Items from Backend DB
      try {
        await axios.delete(`${baseUrl}/Cart/clear`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Fallback: Delete each item individually if bulk clear endpoint doesn't exist
        const deleteRequests = detailedCart.map((item) =>
          axios.delete(`${baseUrl}/Cart`, {
            params: { cartId: item.cartId },
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        await Promise.all(deleteRequests);
      }

      // Step C: Update Local UI State
      showToast("success", "Order placed and cart cleared successfully!");
      setCartItems([]);
    } catch (error) {
      console.error("Order placement error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <h1>Processing cart details...</h1>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {detailedCart.length === 0 ? (
        <p className="empty-cart-msg">Your cart is empty.</p>
      ) : (
        <div className="cart-wrapper">
          <ul className="cart-list">
            {detailedCart.map((item) => {
              const currentId = item.cartId || item.menuId;
              const isUpdating = updatingId === currentId;

              return (
                <li key={currentId} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.itemName}</h3>
                    <p>{item.description}</p>
                    <p>Unit Price: Rs. {item.price}</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={isUpdating}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <h4 className="item-total">
                      Total: Rs. {item.price * item.quantity}
                    </h4>

                    <button
                      onClick={() => handleRemove(item)}
                      className="remove-btn"
                      disabled={isUpdating}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax / VAT (13%):</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>

            <button
              className="order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;