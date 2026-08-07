import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";
import "./CustomerOrders.css";

function CustomerOrders() {
  const navigate = useNavigate();
  const baseUrl = api();
  const { token, userId } = GetCurrUser();

  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const TAX_RATE = 0.13; // 13% Tax / VAT

  const authHeaders = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token]
  );

  // 1. Fetch Dining Session ID
  const fetchSessionId = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/Dinning/my-id`, {
        headers: authHeaders,
      });

      const id = typeof res.data === "object" ? res.data?.sessionId : res.data;
      if (id) {
        setSessionId(id);
      }
    } catch (error) {
      console.error("Error fetching dining session ID:", error);
    }
  }, [baseUrl, authHeaders]);

  // 2. Fetch Customer Orders (Only triggered when sessionId is valid)
  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;

    try {
      const res = await axios.get(`${baseUrl}/Order/my-orders`, {
        params: { userId, sessionId },
        headers: authHeaders,
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.message || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("error", "Failed to fetch active orders.");
    }
  }, [baseUrl, userId, sessionId, authHeaders]);

  // 3. Fetch Menu Items (fallback for images and details)
  const fetchMenuItems = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/Menu/get-all`, {
        headers: authHeaders,
      });

      let items = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res.data?.items)) {
        items = res.data.items;
      } else if (Array.isArray(res.data?.data)) {
        items = res.data.data;
      }

      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, [baseUrl, authHeaders]);

  // Initial load: Fetch session ID first
  useEffect(() => {
    if (token && userId) {
      fetchSessionId();
    }
  }, [token, userId, fetchSessionId]);

  // Secondary load: Fetch orders & menu once sessionId is set
  useEffect(() => {
    const loadAllData = async () => {
      if (!sessionId) return;

      setLoading(true);
      await Promise.all([fetchOrders(), fetchMenuItems()]);
      setLoading(false);
    };

    if (token && sessionId) {
      loadAllData();
    }
  }, [token, sessionId, fetchOrders, fetchMenuItems]);

  // Fast menu lookup map
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      if (item.menuId !== undefined) {
        map[item.menuId] = item;
      }
    });
    return map;
  }, [menuItems]);

  // Map and hydrate order details
  const hydratedOrders = useMemo(() => {
    return orders.map((order) => {
      const matchedMenu = menuMap[order.menuId] || {};

      const unitPrice =
        order.unitPrice ??
        order.itemPrice ??
        order.price ??
        matchedMenu.itemPrice ??
        0;

      const quantity = order.quantity || 1;
      const totalAmount = order.totalAmount ?? unitPrice * quantity;

      const imageUrl =
        order.itemImage ||
        order.ItemImage ||
        matchedMenu.itemImage ||
        null;

      const rawStatus = order.orderStatus || order.status || "Placed";

      return {
        ...order,
        orderId: order.orderId || order.id,
        itemName:
          order.itemName || matchedMenu.itemName || `Item #${order.menuId}`,
        description:
          order.itemDescription ||
          order.description ||
          matchedMenu.itemDescription ||
          "",
        imageUrl,
        unitPrice,
        quantity,
        totalAmount,
        status: rawStatus,
        isCancellable: ["placed", "pending"].includes(rawStatus.toLowerCase()),
      };
    });
  }, [orders, menuMap]);

  // Financial Calculations (excludes cancelled items)
  const activeOrders = useMemo(
    () => hydratedOrders.filter((o) => o.status.toLowerCase() !== "cancelled"),
    [hydratedOrders]
  );

  const subtotal = useMemo(() => {
    return activeOrders.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [activeOrders]);

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  // Handle Order Cancellation via Query Param: PUT /api/Order/cancel?OrderId={id}
  const handleCancelOrder = async (orderItem) => {
    const targetOrderId = orderItem.orderId;
    if (!targetOrderId) return;

    setCancellingId(targetOrderId);

    try {
      await axios.put(
        `${baseUrl}/Order/cancel`,
        {}, // Empty body
        {
          params: { OrderId: targetOrderId }, // Passes OrderId as query param
          headers: authHeaders,
        }
      );

      // Optimistically update status in local state
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          (ord.orderId || ord.id) === targetOrderId
            ? { ...ord, orderStatus: "Cancelled", status: "Cancelled" }
            : ord
        )
      );

      showToast("success", "Order cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to cancel order. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Status Badge Helper
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "served":
      case "completed":
        return "status-badge status-served";
      case "preparing":
      case "in progress":
        return "status-badge status-preparing";
      case "cancelled":
        return "status-badge status-cancelled";
      default:
        return "status-badge status-placed";
    }
  };

  const handleNavigateToBill = () => {
    navigate("/bills", { state: { sessionId } });
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <h2>Loading your order details...</h2>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>My Placed Orders</h2>
        {sessionId && <span className="session-tag">Session ID: #{sessionId}</span>}
      </div>

      {hydratedOrders.length === 0 ? (
        <div className="empty-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-wrapper">
          <div className="orders-list">
            {hydratedOrders.map((item) => {
              const currentId = item.orderId;
              const isCancelling = cancellingId === currentId;

              return (
                <div key={currentId || `${item.menuId}-${item.createdOn}`} className="order-card">
                  <div className="order-card-image-wrapper">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="order-card-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="order-card-placeholder">🍽️</div>
                    )}
                  </div>

                  <div className="order-card-details">
                    <div className="order-card-top">
                      <h3>{item.itemName}</h3>
                      <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                    </div>

                    {item.description && <p className="order-card-desc">{item.description}</p>}

                    <div className="order-card-bottom">
                      <div className="order-card-pricing">
                        <span>
                          Rs. {item.unitPrice} × {item.quantity}
                        </span>
                        <strong className="order-item-total">
                          Rs. {item.totalAmount.toFixed(2)}
                        </strong>
                      </div>

                      {item.isCancellable ? (
                        <button
                          className="cancel-order-btn"
                          onClick={() => handleCancelOrder(item)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                      ) : (
                        item.status.toLowerCase() !== "cancelled" && (
                          <span className="non-cancellable-text">Order in progress</span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="orders-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax / VAT (13%):</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>

            <button className="bill-btn" onClick={handleNavigateToBill}>
              View Bill / Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;