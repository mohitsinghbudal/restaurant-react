import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const baseUrl = api();
  const { token, userId } = GetCurrUser();

  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // Tracks active backend requests

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
      console.error("Error fetching cart items:", error);
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
      map[item.menuId ] = item;
    });
    return map;
  }, [menuItems]);

  // Merge cart items with menu details
  const detailedCart = useMemo(() => {
    return cartItems.map((cartItem) => {
      const matchedMenu = menuMap[cartItem.menuId] || {};
      return {
        ...cartItem,
        itemName: matchedMenu.itemName  || `Item #${cartItem.menuId}`,
        price: matchedMenu.itemPrice || 0,
        description: matchedMenu.description || matchedMenu.itemDescription || "",
      };
    });
  }, [cartItems, menuMap]);

  // Calculate Subtotal
  const subtotal = useMemo(() => {
    return detailedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [detailedCart]);

  // 3. Backend Update Handler (PUT /api/Cart)
  const updateQuantityOnBackend = async (cartItem, newQty) => {
    if (newQty < 1) return;

    const previousState = [...cartItems];
    const itemId = cartItem.cartId || cartItem.menuId;
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
    } catch (err) {
      console.error("Failed to update quantity on backend:", err);
      // Rollback on server error
      setCartItems(previousState);
      alert("Failed to update item quantity. Rolling back changes.");
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

  // 4. Remove Item Handler (DELETE /api/Cart)
  const handleRemove = async (cartItem) => {
    const previousState = [...cartItems];
    const targetCartId = cartItem.cartId || cartItem.menuId;

    // Optimistically remove from state
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => (item.cartId || item.menuId) !== targetCartId
      )
    );

    try {
      await axios.delete(`${baseUrl}/Cart`, {
        params: { cartId: targetCartId },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error removing item:", err);
      setCartItems(previousState);
      alert("Could not remove item from cart.");
    }
  };

  if (loading) {
    return <h1>Loading cart details...</h1>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {detailedCart.length === 0 ? (
        <p>Your cart is empty.</p>
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
            <h3>Cart Total: Rs. {subtotal}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;