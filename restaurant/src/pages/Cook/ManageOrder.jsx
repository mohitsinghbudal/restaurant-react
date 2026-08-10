import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState(null);

  // Get dynamic token and API base URL
  const { token } = GetCurrUser() || {};
  const baseURL = api();

  // Helper for Auth Headers
  const getAuthHeaders = useCallback(() => {
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  }, [token]);

  // 1. Fetch Menu Items to map item names when itemName is null
  const fetchMenuData = useCallback(async (pageNo = 1) => {
    try {
      const response = await axios.get(
        `${baseURL}/Menu/get-all?page=${pageNo}`,
        getAuthHeaders()
      );
      const data = response.data;
      if (data && data.items) {
        setMenuItems(data.items);
      } else if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch menu items for mapping:", err);
    }
  }, [baseURL, getAuthHeaders]);

  // 2. Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}/Order/all`, getAuthHeaders());
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred while fetching orders."
      );
    } finally {
      setLoading(false);
    }
  }, [baseURL, getAuthHeaders]);

  // Initial load
  useEffect(() => {
    Promise.all([fetchMenuData(), fetchOrders()]);
  }, [fetchMenuData, fetchOrders]);

  // Quick lookup dictionary for Menu Items by menuId
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      const id = item.menuId || item.id;
      if (id) {
        map[id] = item.itemName || item.name || item.title;
      }
    });
    return map;
  }, [menuItems]);

  // Helper function to resolve item name
  const resolveItemName = (order) => {
    if (order.itemName) return order.itemName;
    if (order.menuId && menuMap[order.menuId]) return menuMap[order.menuId];
    return `Menu Item #${order.menuId}`;
  };

  // 3. Status Update & Cancel Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      if (newStatus === "Canceled" || newStatus === "Cancelled") {
        // Call [HttpPut("cancel")] Endpoint
        await axios.put(
          `${baseURL}/Order/cancel?OrderId=${orderId}`,
          {},
          getAuthHeaders()
        );
      } else {
        // Call [HttpPut("update-status")] Endpoint
        await axios.put(
          `${baseURL}/Order/update-status?status=${encodeURIComponent(newStatus)}&OrderId=${orderId}`,
          {},
          getAuthHeaders()
        );
      }

      // Update state locally upon success
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update order status.";
      alert(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Group orders into four categories based on orderStatus
  const newOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "Pending" || o.orderStatus === "New"),
    [orders]
  );

  const preparingOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "Preparing" || o.orderStatus === "In Progress"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "Completed"),
    [orders]
  );

  const canceledOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "Cancelled" || o.orderStatus === "Canceled"),
    [orders]
  );

  // Render Action Buttons based on order table type
  const renderActionButtons = (order, type) => {
    const isUpdating = updatingOrderId === order.orderId;

    if (type === "new") {
      return (
        <div style={styles.actionGroup}>
          <button
            style={{ ...styles.actionBtn, backgroundColor: "#3498db" }}
            onClick={() => handleStatusChange(order.orderId, "Preparing")}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "👨‍🍳 Start Preparing"}
          </button>
          <button
            style={{ ...styles.actionBtn, backgroundColor: "#e74c3c" }}
            onClick={() => handleStatusChange(order.orderId, "Canceled")}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      );
    }

    if (type === "preparing") {
      return (
        <div style={styles.actionGroup}>
          <button
            style={{ ...styles.actionBtn, backgroundColor: "#2ecc71" }}
            onClick={() => handleStatusChange(order.orderId, "Completed")}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "✅ Mark Completed"}
          </button>
          <button
            style={{ ...styles.actionBtn, backgroundColor: "#e74c3c" }}
            onClick={() => handleStatusChange(order.orderId, "Canceled")}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      );
    }

    return <span style={{ color: "#7f8c8d", fontSize: "13px" }}>No action needed</span>;
  };

  // Reusable Table Component
  const OrderTable = ({ title, data, badgeColor, type }) => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2>{title}</h2>
        <span style={{ ...styles.badge, backgroundColor: badgeColor }}>
          {data.length} {data.length === 1 ? "order" : "orders"}
        </span>
      </div>

      {data.length === 0 ? (
        <p style={styles.emptyText}>No orders in this status.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Session</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Notes / Description</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.orderId}>
                  <td><strong>#{order.orderId}</strong></td>
                  <td>Session #{order.diningSessionId}</td>
                  <td><strong>{resolveItemName(order)}</strong></td>
                  <td>{order.quantity}</td>
                  <td style={styles.descCell}>
                    {order.description || <em style={{ color: "#aaa" }}>None</em>}
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td>{renderActionButtons(order, type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div style={styles.loadingContainer}>Loading orders...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Kitchen Order Display (Cook)</h1>
        <button style={styles.refreshBtn} onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 1. New Orders Table */}
      <OrderTable title="📌 New Orders" data={newOrders} badgeColor="#f39c12" type="new" />

      {/* 2. Preparing Table */}
      <OrderTable title="👨‍🍳 Preparing" data={preparingOrders} badgeColor="#3498db" type="preparing" />

      {/* 3. Completed Table */}
      <OrderTable title="✅ Completed" data={completedOrders} badgeColor="#2ecc71" type="completed" />

      {/* 4. Canceled Table */}
      <OrderTable title="❌ Canceled" data={canceledOrders} badgeColor="#e74c3c" type="canceled" />
    </div>
  );
}

// Inline Styles
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  refreshBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#2c3e50",
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: "40px",
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  errorBox: {
    padding: "12px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  badge: {
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  descCell: {
    maxWidth: "200px",
    fontSize: "13px",
    color: "#555",
  },
  actionGroup: {
    display: "flex",
    gap: "6px",
  },
  actionBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default ManageOrder;