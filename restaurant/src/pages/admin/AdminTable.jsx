import React, { useState } from "react";
// import "./AdminTable.css";

function AdminTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Temporary Data (Replace with API later)
  const tables = [
    {
      id: 1,
      tableNumber: "T-01",
      capacity: 2,
      floor: "Ground Floor",
      status: "Available",
    },
    {
      id: 2,
      tableNumber: "T-02",
      capacity: 4,
      floor: "Ground Floor",
      status: "Occupied",
    },
    {
      id: 3,
      tableNumber: "T-03",
      capacity: 6,
      floor: "First Floor",
      status: "Reserved",
    },
    {
      id: 4,
      tableNumber: "VIP-01",
      capacity: 8,
      floor: "VIP Lounge",
      status: "Available",
    },
  ];

  return (
    <div className="admin-table-page">

      <div className="table-header">
        <h2>Restaurant Table Management</h2>

        <button className="add-table-btn">
          + Add New Table
        </button>
      </div>

      <div className="table-controls">

        <input
          type="text"
          placeholder="Search table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Available</option>
          <option>Occupied</option>
          <option>Reserved</option>
          <option>Maintenance</option>
        </select>

      </div>

      <div className="table-wrapper">
        <table className="table-management">

          <thead>
            <tr>
              <th>ID</th>
              <th>Table No.</th>
              <th>Capacity</th>
              <th>Floor</th>
              <th>Status</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {tables.map((table) => (
              <tr key={table.id}>
                <td>{table.id}</td>

                <td>{table.tableNumber}</td>

                <td>{table.capacity} Persons</td>

                <td>{table.floor}</td>

                <td>
                  <span
                    className={`status ${table.status.toLowerCase()}`}
                  >
                    {table.status}
                  </span>
                </td>

                <td>
                  <button className="qr-btn">
                    View QR
                  </button>
                </td>

                <td className="actions">

                  <button className="view-btn">
                    View
                  </button>

                  <button className="edit-btn">
                    Edit
                  </button>

                  <button className="delete-btn">
                    Delete
                  </button>

                </td>
              </tr>
            ))}

          </tbody>

        </table>
      </div>

      {/* Modal Placeholder */}

      {/* Add Table */}

      {/* Update Table */}

      {/* Delete Confirmation */}

      {/* View QR Code */}

    </div>
  );
}

export default AdminTable;