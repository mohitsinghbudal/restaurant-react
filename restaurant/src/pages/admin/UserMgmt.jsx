import React, { useState } from "react";
import "./UserMgmt.css";

function UserMgmt() {
  const [search, setSearch] = useState("");

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john@gmail.com",
      role: "Admin",
      verified: true,
      status: "Active",
    },
    {
      id: 2,
      name: "Alice Johnson",
      email: "alice@gmail.com",
      role: "Customer",
      verified: true,
      status: "Active",
    },
    {
      id: 3,
      name: "David Lee",
      email: "david@gmail.com",
      role: "Waiter",
      verified: false,
      status: "Inactive",
    },
    {
      id: 4,
      name: "Emily Brown",
      email: "emily@gmail.com",
      role: "Chef",
      verified: true,
      status: "Active",
    },
  ];

  return (
    <div className="user-page">

      <div className="page-header">

        <div>
          <h1>User Management</h1>
          <p>Manage all registered users.</p>
        </div>

        <button className="add-btn">
          + Add User
        </button>

      </div>

      <div className="stats">

        <div className="card">
          <h3>Total Users</h3>
          <span>{users.length}</span>
        </div>

        <div className="card">
          <h3>Admins</h3>
          <span>{users.filter(x=>x.role==="Admin").length}</span>
        </div>

        <div className="card">
          <h3>Customers</h3>
          <span>{users.filter(x=>x.role==="Customer").length}</span>
        </div>

        <div className="card">
          <h3>Waiters</h3>
          <span>{users.filter(x=>x.role==="Waiter").length}</span>
        </div>

      </div>

      <div className="toolbar">

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select>
          <option>All Roles</option>
          <option>Admin</option>
          <option>Customer</option>
          <option>Waiter</option>
          <option>Chef</option>
        </select>

      </div>

      <div className="table-container">

        <table>

          <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

          </thead>

          <tbody>

          {users
          .filter(u=>u.name.toLowerCase().includes(search.toLowerCase()))
          .map(user=>(

            <tr key={user.id}>

              <td>{user.id}</td>

              <td>{user.name}</td>

              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>
                <span className={user.verified ? "verified":"notverified"}>
                  {user.verified ? "Verified":"Pending"}
                </span>
              </td>

              <td>
                <span className={user.status==="Active" ? "active":"inactive"}>
                  {user.status}
                </span>
              </td>

              <td>

                <button className="view">
                  View
                </button>

                <button className="edit">
                  Edit
                </button>

                <button className="delete">
                  Delete
                </button>

              </td>

            </tr>

          ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default UserMgmt;