import React, { useState, useEffect, useCallback } from "react";
import "./OrderMgmt.css";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";
import axios from "axios";
import { showToast } from "../../components/showToast";



function OrderMgmt() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Selected Order
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Quantity
  const [newQuantity, setNewQuantity] = useState("");

  const baseApi = api();
  const { token } = GetCurrUser();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
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
  }, [baseApi, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const itemName = order.itemName?.toLowerCase() || "";
    const orderIdStr = order.orderId?.toString() || "";
    const sessionIdStr = order.diningSessionId?.toString() || "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      itemName.includes(searchLower) ||
      orderIdStr.includes(searchLower) ||
      sessionIdStr.includes(searchLower);

    const matchesStatus =
      statusFilter === "All" ||
      order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";

    const date = new Date(isoString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewQuantity(order.quantity);
    setShowUpdateModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(
        `${baseApi}/Order/cancel?OrderId=${selectedOrder.orderId}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      showToast("success", "Order cancelled successfully.");

      setShowCancelModal(false);
      setSelectedOrder(null);

      fetchOrders();
    } catch (error) {
      showToast(
  "error",
  err.response?.data?.message || "Failed to cancel order."
);
     
    }
  };

  const UpdateQuantity = async () => {
    if (!selectedOrder) return;
    console.log(selectedOrder);
    try {
      const response = await axios.put(
  `${baseApi}/Order/updateQuantity?orderId=${selectedOrder.orderId}&menuId=${selectedOrder.menuId}&itemQuantity=${newQuantity}`,
  {},
  {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  }
);
      showToast("success", "Quantity updated successfully.");

      setShowUpdateModal(false);
      setSelectedOrder(null);
      setNewQuantity("");

      fetchOrders();
    } catch (error) {
      showToast(
  "error",
  error.response?.data?.message || "Failed to update quantity."
);
setShowUpdateModal(false);
 setSelectedOrder(null);
 setNewQuantity("");
    }
  };

  return (
    <div className="order-page">
      <div className="order-header">
        <div>
          <h1>Order Management</h1>
          <p>Monitor and manage all restaurant orders.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      <div className="order-cards">
        <div className="order-card">
          <h3>Total Orders</h3>
          <span>{orders.length}</span>
        </div>

        <div className="order-card pending">
          <h3>Pending</h3>
          <span>
            {
              orders.filter(
                (x) => x.orderStatus?.toLowerCase() === "pending"
              ).length
            }
          </span>
        </div>

        <div className="order-card preparing">
          <h3>Preparing</h3>
          <span>
            {
              orders.filter(
                (x) => x.orderStatus?.toLowerCase() === "preparing"
              ).length
            }
          </span>
        </div>

        <div className="order-card completed">
          <h3>Completed</h3>
          <span>
            {
              orders.filter(
                (x) => x.orderStatus?.toLowerCase() === "completed"
              ).length
            }
          </span>
        </div>
      </div>

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
                      <button
                        className="update-btn"
                        onClick={() => openUpdateModal(order)}
                      >
                        Update Quantity
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => openCancelModal(order)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
            {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Cancel Order</h2>

            <p>
              Are you sure you want to cancel Order #
              {selectedOrder?.orderId}?
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                }}
              >
                No
              </button>

              <button
                className="confirm-btn"
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Quantity Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Update Quantity</h2>

            <p>
              Update quantity for <strong>{selectedOrder?.itemName}</strong>
            </p>

            <input
              type="number"
              min="1"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="quantity-input"
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedOrder(null);
                  setNewQuantity("");
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={UpdateQuantity}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderMgmt;