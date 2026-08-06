import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import getCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";
import { showToast } from "../../components/showToast";
import "./CustomerOrders.css";

export default function CustomerOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { token, userId } = getCurrUser();
  const baseUrl = api();

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

  // 2. Fetch Orders for Session
  const fetchOrders = async (activeSessionId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/Orders/my-orders`, {
        params: { sessionId: activeSessionId },
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("error", "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchSessionId();
    }
  }, [token, userId]);

  useEffect(() => {
    if (sessionId) {
      fetchOrders(sessionId);
    }
  }, [sessionId]);

  // Filter orders based on status tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter(
      (order) => order.status?.toUpperCase() === activeTab
    );
  }, [orders, activeTab]);

  // Compute total spending for the active session
  const totalSessionAmount = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || "PENDING";
    const badgeMap = {
      COMPLETED: "badge-success",
      PENDING: "badge-warning",
      PREPARING: "badge-info",
      CANCELLED: "badge-danger",
    };
    return `badge ${badgeMap[s] || "badge-secondary"}`;
  };

  return (
    <div className="orders-container">
      {/* Header Area */}
      <header className="orders-header">
        <div>
          <h1>My Dining Orders</h1>
          <p className="session-info">
            Session ID: <strong>{sessionId ? `#${sessionId}` : "N/A"}</strong>
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => sessionId && fetchOrders(sessionId)}
          disabled={loading || !sessionId}
        >
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </header>

      {/* Overview Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Amount Spent</span>
          <span className="stat-value">${totalSessionAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {["ALL", "PENDING", "PREPARING", "COMPLETED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading && orders.length === 0 ? (
        <div className="skeleton-loader">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No Orders Found</h3>
          <p>
            {activeTab === "ALL"
              ? "You haven't placed any orders in this session yet."
              : `No orders matching status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.orderId || order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">
                    Order #{order.orderId || order.id}
                  </span>
                  <span className="order-time">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </div>
                <span className={getStatusBadge(order.status)}>
                  {order.status || "Pending"}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="order-items-list">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.itemName || item.name}</span>
                    <span className="item-price">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span className="footer-label">Order Total</span>
                <span className="footer-total">
                  ${(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}