import React, { useState, useEffect, useCallback } from "react";
import "./OrderMgmt.css";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";
import axios from "axios";


function OrderMgmt() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const baseApi = api();
  const{token } = GetCurrUser();

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    console.log(token);
    
    const response = await axios.get(`${baseApi}/Order/all`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
       
      },
    });

    setOrders(response.data.orders || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred."
    );
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter logic based on search and status
  const filteredOrders = orders.filter((order) => {
    const itemName = order.itemName ? order.itemName.toLowerCase() : "";
    const orderIdStr = order.orderId ? order.orderId.toString() : "";
    const sessionIdStr = order.diningSessionId ? order.diningSessionId.toString() : "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      itemName.includes(searchLower) ||
      orderIdStr.includes(searchLower) ||
      sessionIdStr.includes(searchLower);

    const matchesStatus =
      statusFilter === "All" ||
      (order.orderStatus &&
        order.orderStatus.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Helper function to format ISO date to readable time/date
  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="order-page">
      {/* Header */}
      <div className="order-header">
        <div>
          <h1>Order Management</h1>
          <p>Monitor and manage all restaurant orders.</p>
        </div>

        <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* Statistics */}
      <div className="order-cards">
        <div className="order-card">
          <h3>Total Orders</h3>
          <span>{orders.length}</span>
        </div>

        <div className="order-card pending">
          <h3>Pending</h3>
          <span>
            {orders.filter((x) => x.orderStatus?.toLowerCase() === "pending").length}
          </span>
        </div>

        <div className="order-card preparing">
          <h3>Preparing</h3>
          <span>
            {orders.filter((x) => x.orderStatus?.toLowerCase() === "preparing").length}
          </span>
        </div>

        <div className="order-card completed">
          <h3>Completed</h3>
          <span>
            {orders.filter((x) => x.orderStatus?.toLowerCase() === "completed").length}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="order-toolbar">
        <input
          type="text"
          placeholder="Search by Item, Order ID, or Session ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Preparing</option>
          <option>Ready</option>
          <option>Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="order-table-container">
        {loading ? (
          <div className="no-data">Loading orders...</div>
        ) : error ? (
          <div className="no-data" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item Name</th>
                <th>Session ID</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No Orders Found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.itemName || "Unspecified"}</td>
                    <td>Session #{order.diningSessionId}</td>
                    <td>{order.quantity}</td>
                    <td>Rs. {order.unitPrice}</td>
                    <td>Rs. {order.totalAmount}</td>
                    <td>{formatTime(order.createdAt)}</td>
                    <td>
                      <span
                        className={`status ${(
                          order.orderStatus || "pending"
                        ).toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn">View</button>
                      <button className="update-btn">Update</button>
                      <button className="delete-btn">Cancel</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrderMgmt;