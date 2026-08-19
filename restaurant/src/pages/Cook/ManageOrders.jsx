import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import axios from "axios";

import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";

import {
  connection,
  startSignalR,
} from "../../util/signalrService";

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [error, setError] = useState(null);

  const { token } = GetCurrUser() || {};

  const baseURL = api();

  // ==================================================
  // AUTH
  // ==================================================

  const getAuthHeaders = useCallback(() => {
    return {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
    };
  }, [token]);

  // ==================================================
  // FETCH MENU
  // ==================================================

  const fetchMenuData = useCallback(
    async (pageNo = 1) => {
      try {
        const response = await axios.get(
          `${baseURL}/Menu/get-all?page=${pageNo}`,
          getAuthHeaders()
        );

        const data = response.data;

        if (Array.isArray(data?.items)) {
          setMenuItems(data.items);
        } else if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error(
          "❌ Failed to fetch menu items:",
          err
        );
      }
    },
    [baseURL, getAuthHeaders]
  );

  // ==================================================
  // FETCH ORDERS
  // ==================================================

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseURL}/Order/all`,
        getAuthHeaders()
      );

      const orderList =
        response.data?.orders;

      if (Array.isArray(orderList)) {
        setOrders(orderList);
      } else {
        setOrders([]);
      }

      console.log(
        "📦 Orders refreshed:",
        orderList
      );

      setError(null);
    } catch (err) {
      console.error(
        "❌ Failed to fetch orders:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  }, [baseURL, getAuthHeaders]);

  // ==================================================
  // SIGNALR
  // ==================================================

  useEffect(() => {
    let mounted = true;

    // ----------------------------------------------
    // SIGNALR HANDLER
    // ----------------------------------------------

    const handleReceiveAllOrders = (
      updatedOrders
    ) => {
      console.log(
        "🔔 SignalR ReceiveAllOrders received"
      );

      console.log(
        "📦 SignalR data:",
        updatedOrders
      );

      if (!mounted) return;

    
      fetchOrders();
    };

    // ----------------------------------------------
    // ALSO LISTEN TO NEW ORDER
    // ----------------------------------------------

    const handleNewOrder = (newOrder) => {
      console.log(
        "🔔 SignalR NewOrder received:",
        newOrder
      );

      if (!mounted) return;

      fetchOrders();
    };

    // ----------------------------------------------
    // CANCELLED
    // ----------------------------------------------

    const handleOrderCancelled = (
      orderId
    ) => {
      console.log(
        "🔔 SignalR OrderCancelled:",
        orderId
      );

      if (!mounted) return;

      fetchOrders();
    };

    // ----------------------------------------------
    // STATUS UPDATED
    // ----------------------------------------------

    const handleOrderStatusUpdated = (
      data
    ) => {
      console.log(
        "🔔 SignalR OrderStatusUpdated:",
        data
      );

      if (!mounted) return;

      fetchOrders();
    };

    // ==================================================
    // IMPORTANT
    // REGISTER LISTENERS FIRST
    // ==================================================

    connection.on(
      "ReceiveAllOrders",
      handleReceiveAllOrders
    );

    connection.on(
      "NewOrder",
      handleNewOrder
    );

    connection.on(
      "OrderCancelled",
      handleOrderCancelled
    );

    connection.on(
      "OrderStatusUpdated",
      handleOrderStatusUpdated
    );

    // ==================================================
    // INITIAL DATA + SIGNALR
    // ==================================================

    const initialize = async () => {
      try {
        // Fetch initial data
        await Promise.all([
          fetchMenuData(),
          fetchOrders(),
        ]);

        if (!mounted) return;

        // Start SignalR AFTER handlers are registered
        await startSignalR();

        console.log(
          "✅ ManageOrder SignalR initialized"
        );
      } catch (error) {
        console.error(
          "❌ Initialization failed:",
          error
        );
      }
    };

    initialize();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      mounted = false;

      connection.off(
        "ReceiveAllOrders",
        handleReceiveAllOrders
      );

      connection.off(
        "NewOrder",
        handleNewOrder
      );

      connection.off(
        "OrderCancelled",
        handleOrderCancelled
      );

      connection.off(
        "OrderStatusUpdated",
        handleOrderStatusUpdated
      );
    };
  }, [
    fetchMenuData,
    fetchOrders,
  ]);

  // ==================================================
  // MENU MAP
  // ==================================================

  const menuMap = useMemo(() => {
    const map = {};

    menuItems.forEach((item) => {
      const id =
        item.menuId ??
        item.id;

      if (id != null) {
        map[id] =
          item.itemName ??
          item.name ??
          item.title ??
          `Menu Item #${id}`;
      }
    });

    return map;
  }, [menuItems]);

  // ==================================================
  // RESOLVE MENU ITEM NAME
  // ==================================================

  const resolveItemName = useCallback(
    (order) => {
      if (order.itemName) {
        return order.itemName;
      }

      if (
        order.menuId != null &&
        menuMap[order.menuId]
      ) {
        return menuMap[order.menuId];
      }

      return order.menuId
        ? `Menu Item #${order.menuId}`
        : "Unknown Item";
    },
    [menuMap]
  );

  // ==================================================
  // UPDATE ORDER STATUS
  // ==================================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    setUpdatingOrderId(orderId);

    const previousOrders = [...orders];

    // Optimistic update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              orderStatus: newStatus,
            }
          : order
      )
    );

    try {
      if (
        newStatus === "Canceled" ||
        newStatus === "Cancelled"
      ) {
        await axios.put(
          `${baseURL}/Order/cancel?OrderId=${orderId}`,
          {},
          getAuthHeaders()
        );
      } else {
        await axios.put(
          `${baseURL}/Order/update-status?status=${encodeURIComponent(
            newStatus
          )}&OrderId=${orderId}`,
          {},
          getAuthHeaders()
        );
      }

      console.log(
        `✅ Order #${orderId} updated to ${newStatus}`
      );

      /*
       * Don't manually update again here.
       *
       * Backend will send SignalR event.
       *
       * SignalR -> ReceiveAllOrders
       *          -> fetchOrders()
       */

    } catch (err) {
      console.error(
        "❌ Failed to update order:",
        err
      );

      setOrders(previousOrders);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update order status.";

      alert(
        typeof errorMsg === "string"
          ? errorMsg
          : JSON.stringify(errorMsg)
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ==================================================
  // STATUS GROUPS
  // ==================================================

  const newOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus === "Pending" ||
          order.orderStatus === "New"
      ),
    [orders]
  );

  const preparingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus ===
            "Preparing" ||
          order.orderStatus ===
            "In Progress"
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus ===
          "Completed"
      ),
    [orders]
  );

  const canceledOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus ===
            "Cancelled" ||
          order.orderStatus ===
            "Canceled"
      ),
    [orders]
  );

  // ==================================================
  // ACTION BUTTONS
  // ==================================================

  const renderActionButtons = (
    order,
    type
  ) => {
    const isUpdating =
      updatingOrderId ===
      order.orderId;

    if (type === "new") {
      return (
        <div style={styles.actionGroup}>
          <button
            style={{
              ...styles.actionBtn,
              backgroundColor:
                "#3498db",
            }}
            onClick={() =>
              handleStatusChange(
                order.orderId,
                "Preparing"
              )
            }
            disabled={isUpdating}
          >
            {isUpdating
              ? "Updating..."
              : "👨‍🍳 Start Preparing"}
          </button>

          <button
            style={{
              ...styles.actionBtn,
              backgroundColor:
                "#e74c3c",
            }}
            onClick={() =>
              handleStatusChange(
                order.orderId,
                "Canceled"
              )
            }
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
            style={{
              ...styles.actionBtn,
              backgroundColor:
                "#2ecc71",
            }}
            onClick={() =>
              handleStatusChange(
                order.orderId,
                "Completed"
              )
            }
            disabled={isUpdating}
          >
            {isUpdating
              ? "Updating..."
              : "✅ Mark Completed"}
          </button>

          <button
            style={{
              ...styles.actionBtn,
              backgroundColor:
                "#e74c3c",
            }}
            onClick={() =>
              handleStatusChange(
                order.orderId,
                "Canceled"
              )
            }
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <span
        style={{
          color: "#7f8c8d",
          fontSize: "13px",
        }}
      >
        No action needed
      </span>
    );
  };

  // ==================================================
  // ORDER TABLE
  // ==================================================

  const OrderTable = ({
    title,
    data,
    badgeColor,
    type,
  }) => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2>{title}</h2>

        <span
          style={{
            ...styles.badge,
            backgroundColor:
              badgeColor,
          }}
        >
          {data.length}{" "}
          {data.length === 1
            ? "order"
            : "orders"}
        </span>
      </div>

      {data.length === 0 ? (
        <p style={styles.emptyText}>
          No orders in this status.
        </p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Session</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>
                  Notes / Description
                </th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((order) => (
                <tr
                  key={
                    order.orderId
                  }
                >
                  <td>
                    <strong>
                      #
                      {
                        order.orderId
                      }
                    </strong>
                  </td>

                  <td>
                    Session #
                    {
                      order.diningSessionId
                    }
                  </td>

                  <td>
                    <strong>
                      {resolveItemName(
                        order
                      )}
                    </strong>
                  </td>

                  <td>
                    {order.quantity}
                  </td>

                  <td
                    style={
                      styles.descCell
                    }
                  >
                    {order.description ||
                      (
                        <em
                          style={{
                            color:
                              "#aaa",
                          }}
                        >
                          None
                        </em>
                      )}
                  </td>

                  <td>
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )
                      : "N/A"}
                  </td>

                  <td>
                    {renderActionButtons(
                      order,
                      type
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        style={
          styles.loadingContainer
        }
      >
        Loading orders...
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>
          Kitchen Order Display
          (Cook)
        </h1>

        <button
          style={styles.refreshBtn}
          onClick={fetchOrders}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      <OrderTable
        title="📌 New Orders"
        data={newOrders}
        badgeColor="#f39c12"
        type="new"
      />

      <OrderTable
        title="👨‍🍳 Preparing"
        data={
          preparingOrders
        }
        badgeColor="#3498db"
        type="preparing"
      />

      <OrderTable
        title="✅ Completed"
        data={
          completedOrders
        }
        badgeColor="#2ecc71"
        type="completed"
      />

      <OrderTable
        title="❌ Canceled"
        data={
          canceledOrders
        }
        badgeColor="#e74c3c"
        type="canceled"
      />
    </div>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = {
  container: {
    padding: "20px",
    fontFamily:
      "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor:
      "#f8f9fa",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  refreshBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor:
      "#2c3e50",
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
    backgroundColor:
      "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "20px",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 4px rgba(0,0,0,0.05)",
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