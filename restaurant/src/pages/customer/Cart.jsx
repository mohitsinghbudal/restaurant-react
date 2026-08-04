import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const baseUrl = api();
  const { token, userId, sessionId: initialSessionId } = GetCurrUser();

  const [cartItems, setCartItems] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchCartAndMenu = async () => {
      try {
        setLoading(true);
        const authHeaders = { Authorization: `Bearer ${token}` };

        // 1. Fetch Menu details to resolve menuId -> { itemName, itemPrice, etc. }
        const menuRes = await axios.get(`${baseUrl}/Menu/get-all`, {
          headers: authHeaders,
        });
        const items = menuRes.data.items || menuRes.data || [];
        const map = {};
        items.forEach((item) => {
          map[item.menuId] = item;
        });
        setMenuMap(map);

        // 2. Fetch User Cart from backend API
        if (userId) {
          const cartRes = await axios.get(`${baseUrl}/Cart`, {
            params: { userId },
            headers: authHeaders,
          });

          // Standardize cart output whether API returns an array or single object
          const rawCart = Array.isArray(cartRes.data)
            ? cartRes.data
            : cartRes.data
            ? [cartRes.data]
            : [];

          setCartItems(rawCart);
          sessionStorage.setItem("cart", JSON.stringify(rawCart));
        } else {
          // Fallback to local session storage if userId isn't loaded yet
          const stored = JSON.parse(sessionStorage.getItem("cart")) || [];
          setCartItems(stored);
        }
      } catch (err) {
        console.error("Error fetching cart data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCartAndMenu();
    }
  }, [baseUrl, token, userId]);

  // Combine backend cart item with menu metadata
  const detailedCart = useMemo(() => {
    return cartItems.map((item) => {
      const menuDetail = menuMap[item.menuId] || {};
      return {
        ...item,
        itemName: menuDetail.itemName || `Menu Item #${item.menuId}`,
        itemDescription: menuDetail.itemDescription || "",
        price: menuDetail.itemPrice || menuDetail.price || 0,
      };
    });
  }, [cartItems, menuMap]);

  const updateQuantityOnBackend = async (cartItem, newQty) => {
    const updated = cartItems.map((i) =>
      i.menuId === cartItem.menuId ? { ...i, quantity: newQty } : i
    );
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));

    try {
      await axios.put(
        `${baseUrl}/Cart`,
        {
          id: cartItem.id || 0,
          userId: Number(userId),
          menuId: cartItem.menuId,
          quantity: newQty,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update cart item quantity:", err);
    }
  };

  const increaseQty = (item) => {
    updateQuantityOnBackend(item, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity <= 1) return;
    updateQuantityOnBackend(item, item.quantity - 1);
  };

  const removeItem = async (cartItem) => {
    const updated = cartItems.filter((i) => i.menuId !== cartItem.menuId);
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));

    try {
      await axios.delete(`${baseUrl}/Cart`, {
        params: { cartId: cartItem.id || cartItem.menuId, userId },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error deleting item from cart:", err);
    }
  };

  const clearCart = () => {
    sessionStorage.removeItem("cart");
    setCartItems([]);
  };

  const subtotal = useMemo(() => {
    return detailedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [detailedCart]);

  const totalItems = useMemo(() => {
    return detailedCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [detailedCart]);

  const placeOrder = async () => {
    if (detailedCart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    let currentSessionId =
      initialSessionId || sessionStorage.getItem("sessionId");

    if (!currentSessionId) {
      try {
        const res = await axios.get(`${baseUrl}/Dinning/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.sessionId) {
          currentSessionId = res.data.sessionId;
          sessionStorage.setItem("sessionId", currentSessionId);
        } else {
          throw new Error("No session ID returned");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        alert("Dining session not found.");
        return;
      }
    }

    try {
      setPlacingOrder(true);

      const payload = {
        items: detailedCart.map((item) => ({
          menuId: item.menuId,
          itemName: item.itemName,
          diningSessionId: currentSessionId,
          description: item.itemDescription,
          createdAt: new Date().toISOString(),
          createdBy: Number(userId),
          isActive: true,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await axios.post(`${baseUrl}/Order/place-order`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  if (detailedCart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>
          <p>Add some delicious food from our menu.</p>
          <button
            className="continue-btn"
            onClick={() => navigate("/customer-menu")}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Your Cart</h1>
        <button
          className="continue-btn"
          onClick={() => navigate("/customer-menu")}
        >
          Continue Shopping
        </button>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {detailedCart.map((item) => (
            <div className="cart-card" key={item.menuId}>
              <div className="cart-left">
                <h2>{item.itemName}</h2>
                <p>{item.itemDescription}</p>
                <span>Rs. {item.price}</span>
              </div>

              <div className="cart-right">
                <div className="quantity-box">
                  <button onClick={() => decreaseQty(item)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item)}>+</button>
                </div>

                <h3>Rs. {item.price * item.quantity}</h3>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {subtotal}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={placeOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>

          <button className="clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;