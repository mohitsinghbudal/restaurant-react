import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";

import "./AdminTable.css";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";
import DeleteTableModal from "./DeleteTableModal";
import QRModal from "./QRModal";

function AdminTable() {
  const baseApi = api();

  // Get user session data safely
  const { token, roles = [] } = GetCurrUser() || {};

  // Flexible role check (supports both string names and numeric IDs if needed)
  const userRoles = Array.isArray(roles) ? roles : [];
  const isAdmin = userRoles.includes("Admin") || userRoles.includes(5);
  const isManager = userRoles.includes("Manager") || userRoles.includes(3);
  const isWaiter = userRoles.includes("Waiter") || userRoles.includes(2);

  const canManageTables = isAdmin || isManager;

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedTable, setSelectedTable] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${baseApi}/Table/get-all-table`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setTables(res.data?.alltables?.result || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load tables."
      );
    } finally {
      setLoading(false);
    }
  }, [baseApi, token]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Optimized filtering logic
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const tableNoStr = table.tableNo ? table.tableNo.toString().toLowerCase() : "";
      const query = search.trim().toLowerCase();
      
      const matchesSearch = tableNoStr.includes(query);
      const matchesStatus =
        statusFilter === "All" ||
        table.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tables, search, statusFilter]);

  return (
    <div className="admin-table-page">
      <div className="table-header">
        <div>
          <h1>Restaurant Table Management</h1>
          <p>Manage restaurant tables and QR codes.</p>
        </div>

        <div className="header-buttons">
          <button className="refresh-btn" onClick={fetchTables}>
            Refresh
          </button>

          {canManageTables && (
            <button
              className="add-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Table
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="table-cards">
        <div className="table-card">
          <h3>Total Tables</h3>
          <span>{tables.length}</span>
        </div>

        <div className="table-card available">
          <h3>Available</h3>
          <span>
            {tables.filter((t) => t.status === "Available").length}
          </span>
        </div>

        <div className="table-card occupied">
          <h3>Occupied</h3>
          <span>
            {tables.filter((t) => t.status === "Occupied").length}
          </span>
        </div>

        <div className="table-card reserved">
          <h3>Booked</h3>
          <span>
            {tables.filter((t) => t.status === "Booked").length}
          </span>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search Table Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Booked">Booked</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Deleted">Deleted</option>
        </select>
      </div>

      {/* Table Data View */}
      <div className="table-wrapper">
        {loading ? (
          <div className="no-data">Loading tables...</div>
        ) : error ? (
          <div className="no-data">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Table No</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>QR</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Tables Found
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => (
                  <tr key={table.tableId}>
                    <td>{table.tableId}</td>
                    <td>T-{table.tableNo}</td>
                    <td>{table.capacity || 0} Person(s)</td>
                    <td>
                      <span
                        className={`status ${(table.status || "unknown").toLowerCase()}`}
                      >
                        {table.status || "N/A"}
                      </span>
                    </td>

                    <td>
                      {(canManageTables || isWaiter) && (
                        <button
                          className="qr-btn"
                          onClick={() => {
                            setSelectedTable(table);
                            setShowQRModal(true);
                          }}
                        >
                          QR
                        </button>
                      )}
                    </td>

                    <td>
                      {canManageTables && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setSelectedTable(table);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => {
                              setSelectedTable(table);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {canManageTables && (
        <>
          <AddTableModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            refresh={fetchTables}
          />

          <EditTableModal
            open={showEditModal}
            table={selectedTable}
            onClose={() => setShowEditModal(false)}
            refresh={fetchTables}
          />

          <DeleteTableModal
            open={showDeleteModal}
            table={selectedTable}
            onClose={() => setShowDeleteModal(false)}
            refresh={fetchTables}
          />
        </>
      )}

      {(canManageTables || isWaiter) && (
        <QRModal
          open={showQRModal}
          table={selectedTable}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}

export default AdminTable;