import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./Inventory.css";

function InventoryMgmt() {
  const baseUrl = api();
  const { token } = GetCurrUser();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitMap, setUnitMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state (Added DELETED option)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | LOW_STOCK | IN_STOCK | DELETED

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    itemName: "",
    currentQuantity: "",
    minimumQuantity: "",
    costPrice: "",
    unitId: "",
    isActive: true,
  });

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  const fetchUnits = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/Units`, authHeaders);
      const unitsData = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setUnits(unitsData);

      const mappedUnits = {};
      unitsData.forEach((u) => {
        const id = u.unitId || u.id;
        const name = u.unitName || u.name;
        if (id && name) mappedUnits[id] = name;
      });
      setUnitMap(mappedUnits);
    } catch (err) {
      console.error("Failed to load units:", err);
    }
  }, [baseUrl, authHeaders]);

  const fetchInventory = useCallback(async () => {
    try {
      // Changed endpoint to fetch ALL inventory (including soft-deleted if route supports it)
      const res = await axios.get(`${baseUrl}/Inventory/admin`, authHeaders);
      console.log(res.data);
      if (res.data && Array.isArray(res.data.items)) {
        setInventoryItems(res.data.items);
      } else if (Array.isArray(res.data)) {
        setInventoryItems(res.data);
      } else {
        setInventoryItems([]);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError("Unable to fetch inventory items. Please try again.");
    }
  }, [baseUrl, authHeaders]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchInventory(), fetchUnits()]);
    setLoading(false);
  }, [fetchInventory, fetchUnits]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleEditClick = (item) => {
    setEditingId(item.inventoryItemId);
    setEditFormData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveUpdate = async (id) => {
    try {
      await axios.put(`${baseUrl}/Inventory/${id}`, editFormData, authHeaders);
      setEditingId(null);
      await fetchInventory();
    } catch (err) {
      console.error("Failed to update item:", err);
      alert("Failed to update the item. Please check your inputs.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await axios.delete(`${baseUrl}/Inventory/${id}`, authHeaders);
      await fetchInventory();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete the item.");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseUrl}/Inventory`, newItemData, authHeaders);
      await fetchInventory();
      setShowAddModal(false);
      setNewItemData({
        itemName: "",
        currentQuantity: "",
        minimumQuantity: "",
        costPrice: "",
        unitId: "",
        isActive: true,
      });
    } catch (err) {
      console.error("Failed to create item:", err);
      alert("Failed to create new inventory item.");
    }
  };

  // Metrics (Separating active items vs soft-deleted items)
  const stats = useMemo(() => {
    const activeItems = inventoryItems.filter((i) => !i.isDeleted);
    const deletedItems = inventoryItems.filter((i) => i.isDeleted);

    const totalCount = activeItems.length;
    const deletedCount = deletedItems.length;

    const lowStockCount = activeItems.filter(
      (item) => item.currentQuantity <= item.minimumQuantity
    ).length;

    const totalValuation = activeItems.reduce(
      (sum, item) => sum + (Number(item.currentQuantity) || 0) * (Number(item.costPrice) || 0),
      0
    );

    return { totalCount, lowStockCount, deletedCount, totalValuation };
  }, [inventoryItems]);

  // Filtered Items Logic (Includes support for `DELETED` filter)
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = (item.itemName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const isDeletedItem = Boolean(item.isDeleted);
      const isLowStock = item.currentQuantity <= item.minimumQuantity;

      // Handle DELETED filter explicitly
      if (filterType === "DELETED") {
        return matchesSearch && isDeletedItem;
      }

      // Ignore deleted items for active filters
      if (isDeletedItem) return false;

      if (filterType === "LOW_STOCK") return matchesSearch && isLowStock;
      if (filterType === "IN_STOCK") return matchesSearch && !isLowStock;

      return matchesSearch; // ALL (active)
    });
  }, [inventoryItems, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="spinner"></div>
        <p>Loading Inventory</p>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor stock levels, values, and updates.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Item
          </button>
          <button className="btn-secondary" onClick={loadData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Active Items</span>
          <span className="metric-value">{stats.totalCount}</span>
        </div>

        <div className={`metric-card ${stats.lowStockCount > 0 ? "alert" : ""}`}>
          <span className="metric-label">Low Stock Items</span>
          <span className="metric-value">{stats.lowStockCount}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Deleted Items</span>
          <span className="metric-value">{stats.deletedCount}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Valuation</span>
          <span className="metric-value">
            Rs. {stats.totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="inventory-toolbar">
        <input
          type="text"
          className="search-bar"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={filterType === "ALL" ? "active" : ""}
            onClick={() => setFilterType("ALL")}
          >
            All ({stats.totalCount})
          </button>
          <button
            className={filterType === "IN_STOCK" ? "active" : ""}
            onClick={() => setFilterType("IN_STOCK")}
          >
            In Stock
          </button>
          <button
            className={filterType === "LOW_STOCK" ? "active" : ""}
            onClick={() => setFilterType("LOW_STOCK")}
          >
            Low Stock ({stats.lowStockCount})
          </button>
          <button
            className={filterType === "DELETED" ? "active" : ""}
            onClick={() => setFilterType("DELETED")}
          >
            Deleted ({stats.deletedCount})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Min Limit</th>
              <th>Cost</th>
              <th>Total Value</th>
              <th>Unit</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isEditing = editingId === item.inventoryItemId;
                const isDeleted = Boolean(item.isDeleted);
                const isLowStock = item.currentQuantity <= item.minimumQuantity;
                const unitLabel = unitMap[item.unitId] || "units";
                const itemValuation = (item.currentQuantity || 0) * (item.costPrice || 0);

                if (isEditing) {
                  return (
                    <tr key={item.inventoryItemId} className="editing-row">
                      <td className="id-col">#{item.inventoryItemId}</td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={editFormData.itemName || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, itemName: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input"
                          value={editFormData.currentQuantity ?? ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              currentQuantity: e.target.value === "" ? "" : Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input"
                          value={editFormData.minimumQuantity ?? ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              minimumQuantity: e.target.value === "" ? "" : Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input"
                          value={editFormData.costPrice ?? ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              costPrice: e.target.value === "" ? "" : Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="gold-text font-medium">
                        Rs. {((editFormData.currentQuantity || 0) * (editFormData.costPrice || 0)).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <select
                          className="table-input"
                          value={editFormData.unitId || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              unitId: e.target.value ? Number(e.target.value) : "",
                            })
                          }
                        >
                          <option value="">Unit</option>
                          {units.map((u) => {
                            const uId = u.unitId || u.id;
                            const uName = u.unitName || u.name;
                            return (
                              <option key={uId} value={uId}>
                                {uName}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td>--</td>
                      <td className="action-cell text-right">
                        <button
                          className="btn-text-primary"
                          onClick={() => handleSaveUpdate(item.inventoryItemId)}
                        >
                          Save
                        </button>
                        <button className="btn-text-muted" onClick={handleCancelEdit}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={item.inventoryItemId}
                    className={`${isDeleted ? "row-deleted" : isLowStock ? "row-warning" : ""}`}
                  >
                    <td className="id-col">#{item.inventoryItemId}</td>
                    <td className="font-medium" style={{ textDecoration: isDeleted ? "line-through" : "none" }}>
                      {item.itemName}
                    </td>
                    <td>
                      <strong>{item.currentQuantity}</strong>{" "}
                      <span className="unit-label">{unitLabel}</span>
                    </td>
                    <td className="muted-text">
                      {item.minimumQuantity} {unitLabel}
                    </td>
                    <td>Rs. {item.costPrice}</td>
                    <td className="gold-text font-medium">
                      Rs. {itemValuation.toLocaleString("en-IN")}
                    </td>
                    <td className="muted-text">{unitLabel}</td>
                    <td>
                      <span className={`status-pill ${isDeleted ? "deleted" : isLowStock ? "low" : "ok"}`}>
                        {isDeleted ? "Deleted" : isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="action-cell text-right">
                      {!isDeleted ? (
                        <>
                          <button
                            className="btn-text-primary"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-text-danger"
                            onClick={() => handleDeleteItem(item.inventoryItemId)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="muted-text">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Minimalist Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateItem}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  className="modal-input"
                  required
                  value={newItemData.itemName}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, itemName: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="modal-input"
                    required
                    value={newItemData.currentQuantity}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        currentQuantity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Min Limit</label>
                  <input
                    type="number"
                    className="modal-input"
                    required
                    value={newItemData.minimumQuantity}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        minimumQuantity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price (Rs.)</label>
                  <input
                    type="number"
                    className="modal-input"
                    required
                    value={newItemData.costPrice}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        costPrice: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    className="modal-input"
                    required
                    value={newItemData.unitId}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        unitId: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => {
                      const uId = u.unitId || u.id;
                      const uName = u.unitName || u.name;
                      return (
                        <option key={uId} value={uId}>
                          {uName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryMgmt;