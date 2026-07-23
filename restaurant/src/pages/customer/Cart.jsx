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

  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      
        const storedCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        setCart(storedCart);
      
    };

    fetchData();
  }, [baseUrl, token]);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (menuId) => {
    const updated = cart.map((item) =>
      item.menuId === menuId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(updated);
  };

  const decreaseQty = (menuId) => {
    const updated = cart.map((item) => {
      if (item.menuId === menuId) {
        return {
          ...item,
          quantity: Math.max(1, item.quantity - 1),
        };
      }

      return item;
    });

    saveCart(updated);
  };

  const removeItem = (menuId) => {
    const updated = cart.filter((item) => item.menuId !== menuId);
    saveCart(updated);
  };

  const clearCart = () => {
    sessionStorage.removeItem("cart");
    setCart([]);
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.itemPrice || item.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Determine current active sessionId (from hook or cached in sessionStorage)
    let currentSessionId =
      initialSessionId || sessionStorage.getItem("sessionId");

    // Fetch session on-the-fly if missing
    if (!currentSessionId) {
      try {
        const res = await axios.get(`${baseUrl}/Dinning/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        items: cart.map((item) => ({
          menuId: item.menuId,
          itemName: item.itemName,
          diningSessionId: currentSessionId,
          description: item.itemDescription || item.description || "",
          createdAt: new Date().toISOString(),
          createdBy: Number(userId),
          isActive: true,
          quantity: item.quantity,
          price: item.itemPrice || item.price,
        })),
      };

      const activeToken =
        token ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token");

      await axios.post(`${baseUrl}/Order/place-order`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
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

  if (cart.length === 0) {
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
          {cart.map((item) => (
            <div className="cart-card" key={item.menuId}>
              <div className="cart-left">
                <h2>{item.itemName}</h2>
                <p>{item.itemDescription || item.description}</p>
                <span>Rs. {item.itemPrice || item.price}</span>
              </div>

              <div className="cart-right">
                <div className="quantity-box">
                  <button onClick={() => decreaseQty(item.menuId)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.menuId)}>+</button>
                </div>

                <h3>Rs. {(item.itemPrice || item.price) * item.quantity}</h3>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.menuId)}
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