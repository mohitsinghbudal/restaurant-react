import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./CustomerOrders.css";
import { useNavigate } from "react-router-dom";

function CustomerOrders() {
  const baseUrl = api();
  const navigate= useNavigate();
  const { token, userId, sessionId: hookSessionId } = GetCurrUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track active session ID in state so updates trigger order fetches
  const [activeSessionId, setActiveSessionId] = useState(
    hookSessionId || sessionStorage.getItem("sessionId")
  );

  // Sync state if hook receives a new value
  useEffect(() => {
    if (hookSessionId) {
      setActiveSessionId(hookSessionId);
    }
  }, [hookSessionId]);

  // Fetch session ID if not initially present
  useEffect(() => {
    const fetchSessionId = async () => {
      if (activeSessionId) return;

      try {
        const res = await axios.get(`${baseUrl}/Dinning/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.sessionId) {
          sessionStorage.setItem("sessionId", res.data.sessionId);
          setActiveSessionId(res.data.sessionId);
        }
      } catch (error) {
        console.error("Failed to sync session on mount:", error);
      }
    };

    fetchSessionId();
  }, [baseUrl, token, activeSessionId]);

  // Load orders using useCallback to maintain a stable reference
  const loadOrders = useCallback(async () => {
    if (!activeSessionId) return;

    try {
      const res = await axios.get(
        `${baseUrl}/Order/sessionId/${activeSessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(res.data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, activeSessionId, token]);

  // Set up polling interval
  useEffect(() => {
    if (!activeSessionId) {
      setLoading(false);
      return;
    }

    loadOrders();
    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, [activeSessionId, loadOrders]);

  const total = useMemo(() => {
    return orders.reduce(
      (sum, item) => sum + (item.totalAmount ?? (item.unitPrice || item.price || 0) * item.quantity),
      0
    );
  }, [orders]);

  if (loading) {
    return (
      <div className="orders-loading">
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Dining Session #{activeSessionId || "N/A"}</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h2>No Orders Yet</h2>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((item, index) => (
              <div className="order-card" key={item.orderId || index}>
                <div className="order-left">
                  <h3>{item.itemName}</h3>
                  <p>Qty: {item.quantity}</p>
                  <p>Rs. {item.unitPrice || item.price}</p>
                </div>

                <div className="order-right">
                  <span
                    className={`status ${item.orderStatus?.toLowerCase() || "pending"}`}
                  >
                    {item.orderStatus || "Pending"}
                  </span>

                  <h3>
                    Rs. {item.totalAmount ?? (item.unitPrice || item.price) * item.quantity}
                  </h3>
                </div>
              </div>
            ))}
          </div>
            <div>
              
          <div className="order-summary">

  <div className="summary-top">
    <div className="bill-info">
      <h2>Total Bill</h2>
      <h1>Rs. {total}</h1>
    </div>

    <button className="getmybill" onClick={()=>navigate("/customer-bill")}>
      Get My Bill
    </button>
  </div>

</div>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerOrders;