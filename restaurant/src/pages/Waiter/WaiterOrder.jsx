import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";
import { showToast } from "../../components/showToast";
import "./WaiterOrder.css";

function WaiterOrder() {
  const baseUrl = api();
  const navigate = useNavigate();

  // Get Logged-in User
  const { token, userId } = GetCurrUser();

  const [menuItems, setMenuItems] = useState([]);
  const [table, setTable] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selected Items
  const [selectedItems, setSelectedItems] = useState({});

  // Order Notes
  const [orderNotes, setOrderNotes] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    }),
    [token]
  );

  /* ==========================================
      FETCH ASSIGNED TABLE & ACTIVE SESSION
  =========================================== */

  const fetchSessionData = useCallback(async () => {
    if (!token) return;

    try {
      const tableRes = await axios.get(
        `${baseUrl}/Table/get-assigned-table`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignedTable =
        tableRes.data?.table || tableRes.data || null;

      setTable(assignedTable);

      if (assignedTable?.tableId) {
        const sessionRes = await axios.get(
          `${baseUrl}/Dinning/customer-waiter-id`,
          {
            params: {
              tableId: assignedTable.tableId,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const activeSession =
          sessionRes.data?.sessionId || sessionRes.data;

        if (activeSession) {
          setSessionId(activeSession);
        }
      }
    } catch (error) {
      console.error(error);

      showToast(
        "Could not load assigned table/session.",
        "error"
      );
    }
  }, [baseUrl, token]);

  /* ==========================================
      FETCH MENU
  =========================================== */

  const fetchMenu = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${baseUrl}/Menu/get-all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let items = [];

      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data?.data)) {
        items = response.data.data;
      }

      const availableItems = items.filter((item) => {
        if (item.isAvailable === false) return false;
        if (item.available === false) return false;

        if (
          item.status &&
          item.status.toLowerCase() !== "available"
        ) {
          return false;
        }

        return true;
      });

      setMenuItems(availableItems);
    } catch (error) {
      console.error(error);

      showToast(
        "Failed to load menu items.",
        "error"
      );
    }
  }, [baseUrl, token]);

  /* ==========================================
      INITIAL LOAD
  =========================================== */

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      await Promise.all([
        fetchSessionData(),
        fetchMenu(),
      ]);

      setLoading(false);
    };

    initialize();
  }, [fetchSessionData, fetchMenu]);

  /* ==========================================
      QUANTITY HANDLER
  =========================================== */

  const handleQuantityChange = (item, delta) => {
    const id = item.menuId;

    setSelectedItems((prev) => {
      const currentQty = prev[id]?.quantity || 0;

      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }

      return {
        ...prev,

        [id]: {
          menuId: item.menuId,
          itemName: item.itemName,
          quantity: newQty,
          unitPrice:
            item.itemPrice ||
            item.price ||
            0,
        },
      };
    });
  };

  /* ==========================================
      SEARCH FILTER
  =========================================== */

  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems;
    }

    return menuItems.filter((item) =>
      item.itemName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  /* ==========================================
      SELECTED LIST
  =========================================== */

  const selectedList = Object.values(selectedItems);

  const totalAmount = selectedList.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice,
    0
  );
    /* ==========================================
      PLACE ORDER
  =========================================== */

  const handlePlaceOrder = async () => {
    if (selectedList.length === 0) {
      showToast(
        "Please add at least one item to place an order.",
        "warning"
      );
      return;
    }

    if (!sessionId) {
      showToast(
        "No active dining session found.",
        "error"
      );
      return;
    }

    // Payload according to your API
    const payload = {
      items: selectedList.map((item) => ({
        menuId: Number(item.menuId),
        itemName: item.itemName,
        diningSessionId: Number(sessionId),
        description: orderNotes.trim(),
        createdAt: new Date().toISOString(),
        createdBy: Number(userId),
        isActive: true,
        quantity: Number(item.quantity),
        price: Number(item.unitPrice),
      })),
    };

    console.log("Order Payload:", payload);

    try {
      setSubmitting(true);

      await axios.post(
        `${baseUrl}/Order/place-order`,
        payload,
        {
          headers: authHeaders,
        }
      );

      showToast(
        "Order placed successfully!",
        "success"
      );

      // Clear selections
      setSelectedItems({});
      setOrderNotes("");

      navigate("/waiter-dashboard");
    } catch (error) {
      console.error("Place Order Error:", error);

      showToast(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to place order.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================
      PAGE LOADING
  =========================================== */

  if (loading) {
    return (
      <div className="page-loading">
        <p>Loading available menu items...</p>
      </div>
    );
  }

  /* ==========================================
      UI
  =========================================== */

  return (
    <div className="place-order-container">
      <div className="place-order-wrapper">

        {/* Header */}

        <header className="page-header">

          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div>
            <h1 className="page-title">
              Place New Order
            </h1>

            <p className="page-subtitle">
              {table?.tableNo
                ? `Table #${table.tableNo}`
                : "Assigned Table"}
              {" • "}
              Session #{sessionId || "N/A"}
            </p>
          </div>

        </header>

        <div className="place-order-grid">

          {/* LEFT SIDE */}

          <div className="menu-section">

            <div className="menu-header">

              <h2>Available Menu</h2>

              <input
                type="text"
                className="search-input"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />

            </div>
                        {filteredMenu.length > 0 ? (
              <div className="menu-grid">
                {filteredMenu.map((item) => {
                  const qty =
                    selectedItems[item.menuId]?.quantity || 0;

                  const imageUrl =
                    item.itemImage || item.imageUrl;

                  return (
                    <div
                      key={item.menuId}
                      className="menu-card"
                    >
                      <div className="menu-card-image-wrap">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.itemName}
                            className="menu-card-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="no-image-placeholder">
                            No Image
                          </div>
                        )}

                        <span className="availability-badge">
                          Available
                        </span>

                      </div>

                      <div className="menu-card-content">

                        <h3 className="menu-card-title">
                          {item.itemName}
                        </h3>

                        {item.itemDescription && (
                          <p className="menu-card-desc">
                            {item.itemDescription}
                          </p>
                        )}

                        <p className="menu-card-price">
                          Rs. {item.itemPrice || item.price || 0}
                        </p>

                        <div className="card-qty-controls">

                          {qty > 0 ? (
                            <div className="qty-picker">

                              <button
                                onClick={() =>
                                  handleQuantityChange(item, -1)
                                }
                              >
                                -
                              </button>

                              <span>{qty}</span>

                              <button
                                onClick={() =>
                                  handleQuantityChange(item, 1)
                                }
                              >
                                +
                              </button>

                            </div>
                          ) : (
                            <button
                              className="add-item-btn"
                              onClick={() =>
                                handleQuantityChange(item, 1)
                              }
                            >
                              + Add Item
                            </button>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-state">
                No available items found.
              </p>
            )}

          </div>

          {/* RIGHT SIDE */}

          <div className="summary-sidebar">

            <div className="summary-card">

              <h2>Order Summary</h2>

              {selectedList.length > 0 ? (
                <>

                  <div className="summary-items-list">

                    {selectedList.map((item) => (

                      <div
                        key={item.menuId}
                        className="summary-item-row"
                      >

                        <div className="summary-item-info">

                          <span className="item-name">
                            {item.itemName}
                          </span>

                          <span className="item-subtotal">
                            Rs.
                            {" "}
                            {(
                              item.quantity *
                              item.unitPrice
                            ).toFixed(2)}
                          </span>

                        </div>

                        <div className="summary-qty-picker">

                          <button
                            onClick={() =>
                              handleQuantityChange(item, -1)
                            }
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item, 1)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                  <div className="notes-group">

                    <label>
                      Special Instructions
                    </label>

                    <textarea
                      rows="3"
                      placeholder="Less spicy, no onions..."
                      value={orderNotes}
                      onChange={(e) =>
                        setOrderNotes(e.target.value)
                      }
                    />

                  </div>

                  <div className="summary-total-row">

                    <span>Total</span>

                    <strong>
                      Rs. {totalAmount.toFixed(2)}
                    </strong>

                  </div>

                  <button
                    className="submit-order-btn"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                  >
                    {submitting
                      ? "Placing Order..."
                      : "Confirm & Place Order"}
                  </button>

                </>
              ) : (

                <div className="empty-summary">

                  <p>
                    Your order is empty.
                  </p>

                  <span>
                    Select items from the menu.
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default WaiterOrder;