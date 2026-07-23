import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./Inventory.css";

function Inventory() {
  const baseUrl = api();
  const { token } = GetCurrUser();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | LOW_STOCK | IN_STOCK

  // Map backend unit IDs to human-readable names
  const unitMap = {
    1: "kg",
    2: "grams",
    3: "Liters",
    4: "ml",
    5: "Cans",
    6: "Packs",
    7: "Bottles",
  };

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeToken =
        token || sessionStorage.getItem("token") || localStorage.getItem("token");

      const res = await axios.get(`${baseUrl}/Inventory`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      // Handle response structure { message: "Success", items: [...] }
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [baseUrl, token]);

  // Derived metrics
  const stats = useMemo(() => {
    const totalCount = inventoryItems.length;
    const lowStockCount = inventoryItems.filter(
      (item) => item.currentQuantity <= item.minimumQuantity
    ).length;
    const totalValuation = inventoryItems.reduce(
      (sum, item) => sum + item.currentQuantity * item.costPrice,
      0
    );

    return { totalCount, lowStockCount, totalValuation };
  }, [inventoryItems]);

  // Filtered inventory items based on search and status tabs
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const isLowStock = item.currentQuantity <= item.minimumQuantity;

      if (filterType === "LOW_STOCK") return matchesSearch && isLowStock;
      if (filterType === "IN_STOCK") return matchesSearch && !isLowStock;
      return matchesSearch;
    });
  }, [inventoryItems, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="inventory-loading">
        <h2>Loading Inventory...</h2>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1>Inventory Overview</h1>
          <p>Track stock levels, reorder limits, and unit costs.</p>
        </div>
        <button className="btn-refresh" onClick={loadInventory}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Unique Items</span>
          <span className="metric-value">{stats.totalCount}</span>
        </div>

        <div className={`metric-card ${stats.lowStockCount > 0 ? "alert" : ""}`}>
          <span className="metric-label">Low Stock Items</span>
          <span className="metric-value">{stats.lowStockCount}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Inventory Value</span>
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
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={filterType === "ALL" ? "active" : ""}
            onClick={() => setFilterType("ALL")}
          >
            All Items ({stats.totalCount})
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
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Min Stock Limit</th>
              <th>Cost Price</th>
              <th>Total Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No inventory items match your criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.currentQuantity <= item.minimumQuantity;
                const unitLabel = unitMap[item.unitId] || "units";
                const itemValuation = item.currentQuantity * item.costPrice;

                return (
                  <tr key={item.inventoryItemId} className={isLowStock ? "row-warning" : ""}>
                    <td>#{item.inventoryItemId}</td>
                    <td className="font-semibold">{item.itemName}</td>
                    <td>
                      <strong>{item.currentQuantity}</strong> {unitLabel}
                    </td>
                    <td>
                      {item.minimumQuantity} {unitLabel}
                    </td>
                    <td>Rs. {item.costPrice}</td>
                    <td>Rs. {itemValuation.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status-pill ${isLowStock ? "low" : "ok"}`}>
                        {isLowStock ? "⚠️ Low Stock" : "✓ Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;