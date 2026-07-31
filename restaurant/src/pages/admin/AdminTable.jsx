import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";

import "./AdminTable.css";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";
import DeleteTableModal from "./DeleteTableModal";
import QRModal from "./QRModal";

function AdminTable() {
  const baseApi = api();
  const { token } = GetCurrUser();

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
      const res = await axios.get(
        `${baseApi}/Table/get-all-table`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      setTables(res.data.alltables.result || []);
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

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.tableNo
      ?.toString()
      .includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      table.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-table-page">
      <div className="table-header">
        <div>
          <h1>Restaurant Table Management</h1>
          <p>Manage restaurant tables and QR codes.</p>
        </div>

        <div className="header-buttons">
          <button
            className="refresh-btn"
            onClick={fetchTables}
          >
            Refresh
          </button>

          <button
            className="add-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Table
          </button>
        </div>
      </div>

      {/* Cards */}

      <div className="table-cards">
        <div className="table-card">
          <h3>Total Tables</h3>
          <span>{tables.length}</span>
        </div>

        <div className="table-card available">
          <h3>Available</h3>
          <span>
            {tables.filter(
              (t) => t.status === "Available"
            ).length}
          </span>
        </div>

        <div className="table-card occupied">
          <h3>Occupied</h3>
          <span>
            {tables.filter(
              (t) => t.status === "Occupied"
            ).length}
          </span>
        </div>

        <div className="table-card reserved">
          <h3>Booked</h3>
          <span>
            {tables.filter(
              (t) => t.status === "Booked"
            ).length}
          </span>
        </div>
      </div>

      {/* Toolbar */}

      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search Table Number..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option>All</option>
          <option>Available</option>
          <option>Occupied</option>
          <option>Booked</option>
          <option>Cleaning</option>
          <option>Deleted</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="no-data">
            Loading...
          </div>
        ) : error ? (
          <div className="no-data">
            {error}
          </div>
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
                  <td
                    colSpan="6"
                    className="no-data"
                  >
                    No Tables Found
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => (
                  <tr key={table.tableId}>
                    <td>{table.tableId}</td>

                    <td>T-{table.tableNo}</td>

                    <td>
                      {table.capacity} Person(s)
                    </td>

                    <td>
                      <span
                        className={`status ${table.status.toLowerCase()}`}
                      >
                        {table.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="qr-btn"
                        onClick={() => {
                          setSelectedTable(table);
                          setShowQRModal(true);
                        }}
                      >
                        QR
                      </button>
                    </td>

                    <td>
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

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

      <QRModal
        open={showQRModal}
        table={selectedTable}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}

export default AdminTable;