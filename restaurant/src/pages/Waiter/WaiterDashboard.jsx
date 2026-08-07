import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";
import "./WaiterDashboard.css";

function WaiterDashboard() {
  const navigate = useNavigate();
  const baseUrl = api();
  const { token } = GetCurrUser();

  const [table, setTable] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Modals & Selected Order State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Fetch Session ID
  const fetchSessionId = useCallback(
    async (tableId) => {
      if (!token || !tableId) return null;
      try {
        const res = await axios.get(`${baseUrl}/Dinning/customer-waiter-id`, {
          params: { tableId },
          headers: authHeaders,
        });

        const activeSessionId =
          typeof res.data === "object" ? res.data?.sessionId : res.data;

        if (activeSessionId) {
          setSessionId(activeSessionId);
          return activeSessionId;
        } else {
          showToast("error", "No active dining session found.");
        }
      } catch (error) {
        console.error("Error fetching session ID:", error);
        showToast("error", "Failed to fetch session ID.");
      }
      return null;
    },
    [baseUrl, token, authHeaders]
  );

  // Fetch Assigned Table
  const fetchTable = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await axios.get(`${baseUrl}/Table/get-assigned-table`, {
        headers: authHeaders,
      });

      const assignedTable = res.data?.table || res.data || null;
      setTable(assignedTable);
      return assignedTable;
    } catch (error) {
      console.error("Error fetching table data:", error);
      showToast("error", "Failed to fetch assigned table.");
      return null;
    }
  }, [baseUrl, token, authHeaders]);

  // Fetch Menu Items
  const fetchMenuItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${baseUrl}/Menu/get-all`, {
        headers: authHeaders,
      });

      const items =
        res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, [baseUrl, token, authHeaders]);

  // Fetch Active Orders
  const fetchOrders = useCallback(
    async (currentSessionId) => {
      const activeSession = currentSessionId || sessionId;
      if (!token || !activeSession) return;
      try {
        setOrdersLoading(true);
        const res = await axios.get(`${baseUrl}/Order/my-orders`, {
          params: { SessionId: activeSession, sessionId: activeSession },
          headers: authHeaders,
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.message || res.data?.items || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        showToast("error", "Failed to fetch orders.");
      } finally {
        setOrdersLoading(false);
      }
    },
    [baseUrl, token, sessionId, authHeaders]
  );

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        await fetchMenuItems();
        const loadedTable = await fetchTable();
        if (loadedTable?.tableId) {
          const loadedSessionId = await fetchSessionId(loadedTable.tableId);
          if (loadedSessionId) {
            await fetchOrders(loadedSessionId);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [token, fetchMenuItems, fetchTable, fetchSessionId, fetchOrders]);

  // Menu Lookup Map
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      if (item.menuId !== undefined) map[item.menuId] = item;
    });
    return map;
  }, [menuItems]);

  // Hydrate Orders
  const hydratedOrders = useMemo(() => {
    return orders.map((order) => {
      const matchedMenu = menuMap[order.menuId] || {};
      const unitPrice =
        order.unitPrice ?? matchedMenu.itemPrice ?? order.price ?? 0;
      const quantity = order.quantity || 1;

      return {
        ...order,
        orderId: order.orderId || order.id,
        menuId: order.menuId || matchedMenu.menuId,
        itemName:
          order.itemName || matchedMenu.itemName || `Item #${order.menuId}`,
        description: order.description || matchedMenu.itemDescription || "",
        quantity: quantity,
        unitPrice: unitPrice,
        totalAmount: order.totalAmount ?? unitPrice * quantity,
        status: order.orderStatus || order.status || "Pending",
      };
    });
  }, [orders, menuMap]);

  // Check if any order is pending/in progress
  const hasPendingOrders = useMemo(() => {
    return hydratedOrders.some((order) => {
      const status = (order.status || "").toLowerCase();
      return status === "pending" || status === "preparing" || status === "in progress";
    });
  }, [hydratedOrders]);

  // Bill Eligibility: Returns true ONLY IF all orders are either "completed", "served", "cancelled", or "rejected"
  const isBillEligible = useMemo(() => {
    if (hydratedOrders.length === 0) return false;
    return hydratedOrders.every((order) => {
      const status = (order.status || "").toLowerCase();
      return (
        status === "completed" ||
        status === "served" ||
        status === "cancelled" ||
        status === "rejected"
      );
    });
  }, [hydratedOrders]);

  // Clean Table Eligibility: All orders must be completed, served, cancelled, or rejected
  const isCleanTableEligible = useMemo(() => {
    if (hydratedOrders.length === 0) return false;
    return hydratedOrders.every((order) => {
      const status = (order.status || "").toLowerCase();
      return (
        status === "completed" ||
        status === "served" ||
        status === "cancelled" ||
        status === "rejected"
      );
    });
  }, [hydratedOrders]);

  // Handle Bill Calculation
  const handleGetBill = async () => {
    if (!sessionId || !isBillEligible) return;

    try {
      const res = await axios.get(
        `${baseUrl}/Bill/calculate-bill/${sessionId}`,
        { headers: authHeaders }
      );
      showToast("success", "Bill calculated successfully!");
      console.log("Bill Details:", res.data);
    } catch (error) {
      console.error("Error calculating bill:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to calculate bill."
      );
    }
  };

  // Handle Clean Table Call
  const handleCleanTable = async () => {
    if (!sessionId || !table?.tableId || !isCleanTableEligible) return;

    try {
      // TODO: Replace with your actual Clean Table endpoint URL
      await axios.post(
        `${baseUrl}/Table/clean-table`,
        { tableId: table.tableId, sessionId: sessionId },
        { headers: authHeaders }
      );

      showToast("success", "Table cleaned and session closed successfully!");
      
      // Refresh board/state
      setSessionId(null);
      setOrders([]);
      fetchTable();
    } catch (error) {
      console.error("Error cleaning table:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to clean table."
      );
    }
  };

  // Modal Handlers
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewQuantity(order.quantity);
    setShowUpdateModal(true);
  };

  // Confirm Order Cancellation
  const confirmCancel = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(
        `${baseUrl}/Order/cancel?OrderId=${selectedOrder.orderId}`,
        {},
        { headers: authHeaders }
      );

      showToast("success", "Order cancelled successfully.");
      setShowCancelModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to cancel order."
      );
    }
  };

  // Confirm Quantity Update
  const UpdateQuantity = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(
        `${baseUrl}/Order/updateQuantity?orderId=${selectedOrder.orderId}&menuId=${selectedOrder.menuId}&itemQuantity=${newQuantity}`,
        {},
        { headers: authHeaders }
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

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "served") return "status-badge completed";
    if (s === "cancelled" || s === "rejected") return "status-badge cancelled";
    if (s === "preparing" || s === "in progress") return "status-badge preparing";
    return "status-badge pending";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h1>Processing dashboard details...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Waiter Dashboard</h1>
            <p className="dashboard-subtitle">
              Real-time table and order tracking
            </p>
          </div>
          {sessionId && (
            <span className="session-badge">Session #{sessionId}</span>
          )}
        </header>

        {/* Assigned Table Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Assigned Table</h2>
          </div>
          {table ? (
            <div className="table-grid">
              <div className="table-card">
                <p className="table-card-label">Table ID</p>
                <p className="table-card-value">#{table.tableId}</p>
              </div>
              <div className="table-card">
                <p className="table-card-label">Table No</p>
                <p className="table-card-value">{table.tableNo || "N/A"}</p>
              </div>
              <div className="table-card">
                <p className="table-card-label">Capacity</p>
                <p className="table-card-value">{table.capacity || "N/A"}</p>
              </div>
              <div className="table-card">
                <p className="table-card-label">Status</p>
                <p className="table-card-value">{table.status || "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="empty-state">No table currently assigned.</p>
          )}
        </section>

        {/* Active Orders Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              Active Orders ({hydratedOrders.length})
            </h2>
            <div className="header-actions">
              <button
                className="new-order-btn"
                onClick={() => navigate("/place-order")}
                disabled={!sessionId}
              >
                + Place New Order
              </button>
              <button
                onClick={() => fetchOrders()}
                disabled={!sessionId || ordersLoading}
                className="refresh-btn"
              >
                {ordersLoading ? "Refreshing..." : "Refresh Orders"}
              </button>
            </div>
          </div>

          {ordersLoading && hydratedOrders.length === 0 ? (
            <p className="empty-state">Loading orders...</p>
          ) : hydratedOrders.length > 0 ? (
            <>
              <div className="order-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Item Details</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hydratedOrders.map((order, idx) => {
                      const isPending =
                        (order.status || "").toLowerCase() === "pending";

                      return (
                        <tr key={order.orderId || idx}>
                          <td className="order-id-cell">#{order.orderId}</td>
                          <td>
                            <div className="order-item-info">
                              <span className="order-item-name">
                                {order.itemName}
                              </span>
                              {order.description && (
                                <span className="order-item-desc">
                                  {order.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="order-qty-cell">{order.quantity}</td>
                          <td>Rs. {order.unitPrice}</td>
                          
                          <td>
                            <span className={getStatusClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <div className="action-buttons">
                                <button
                                  className="update-btn"
                                  onClick={() => openUpdateModal(order)}
                                >
                                  Update
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => openCancelModal(order)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span className="no-actions">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons Below Table */}
              <div className="bill-action-container">
                <button
                  onClick={handleGetBill}
                  disabled={!isBillEligible}
                  className={`get-bill-btn ${
                    hasPendingOrders ? "blurred" : ""
                  }`}
                  title={
                    hasPendingOrders
                      ? "All orders must be completed or cancelled to get the bill."
                      : "Click to generate customer bill"
                  }
                >
                  Get Bill
                </button>

                <button
                  onClick={handleCleanTable}
                  disabled={!isCleanTableEligible}
                  className={`clean-table-btn ${
                    hasPendingOrders ? "blurred" : ""
                  }`}
                  title={
                    hasPendingOrders
                      ? "All orders must be completed or cancelled to clean the table."
                      : "Click to clean table and reset session"
                  }
                >
                  Clean Table
                </button>
              </div>
            </>
          ) : (
            <p className="empty-state">
              No active orders found for this session.
            </p>
          )}
        </section>
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
              <button className="confirm-btn delete" onClick={confirmCancel}>
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
              <button className="confirm-btn" onClick={UpdateQuantity}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaiterDashboard;