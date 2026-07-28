import React, { useState } from "react";
import "./OrderMgmt.css";

function OrderMgmt() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Dummy Data (Replace with API)
  const orders = [
    {
      id: 101,
      customer: "John Smith",
      table: "T-01",
      waiter: "Ram",
      total: 1250,
      items: 4,
      status: "Pending",
      time: "10:15 AM",
    },
    {
      id: 102,
      customer: "Alice",
      table: "T-03",
      waiter: "Hari",
      total: 890,
      items: 3,
      status: "Preparing",
      time: "10:32 AM",
    },
    {
      id: 103,
      customer: "David",
      table: "T-05",
      waiter: "Sita",
      total: 650,
      items: 2,
      status: "Ready",
      time: "10:40 AM",
    },
    {
      id: 104,
      customer: "Emily",
      table: "T-02",
      waiter: "Ram",
      total: 1720,
      items: 6,
      status: "Completed",
      time: "09:55 AM",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.table.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="order-page">

      {/* Header */}

      <div className="order-header">

        <div>
          <h1>Order Management</h1>
          <p>Monitor and manage all restaurant orders.</p>
        </div>

        <button className="refresh-btn">
          Refresh Orders
        </button>

      </div>

      {/* Statistics */}

      <div className="order-cards">

        <div className="order-card">
          <h3>Total Orders</h3>
          <span>{orders.length}</span>
        </div>

        <div className="order-card pending">
          <h3>Pending</h3>
          <span>{orders.filter(x => x.status === "Pending").length}</span>
        </div>

        <div className="order-card preparing">
          <h3>Preparing</h3>
          <span>{orders.filter(x => x.status === "Preparing").length}</span>
        </div>

        <div className="order-card completed">
          <h3>Completed</h3>
          <span>{orders.filter(x => x.status === "Completed").length}</span>
        </div>

      </div>

      {/* Toolbar */}

      <div className="order-toolbar">

        <input
          type="text"
          placeholder="Search customer or table..."
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

      {/* Table */}

      <div className="order-table-container">

        <table>

          <thead>

            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Waiter</th>
              <th>Items</th>
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

                <tr key={order.id}>

                  <td>#{order.id}</td>

                  <td>{order.customer}</td>

                  <td>{order.table}</td>

                  <td>{order.waiter}</td>

                  <td>{order.items}</td>

                  <td>Rs. {order.total}</td>

                  <td>{order.time}</td>

                  <td>

                    <span
                      className={`status ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>

                  </td>

                  <td>

                    <button className="view-btn">
                      View
                    </button>

                    <button className="update-btn">
                      Update
                    </button>

                    <button className="delete-btn">
                      Cancel
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default OrderMgmt;