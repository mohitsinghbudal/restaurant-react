import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import GetCurrUser from "../../util/GetCurrUser";
import getApiUrl from "../../util/api";
import { showToast } from "../../components/showToast"; // Adjust path to match your folder structure
import "./UserMgmt.css";

// Axios Instance with Interceptors
const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const { token } = GetCurrUser() || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      showToast("error", "Session expired. Please log in again.");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      showToast("error", "Access Denied: Admin privileges required.");
    }
    return Promise.reject(error);
  }
);

// Form Default State matching backend API schema
const initialFormState = {
  userId: 0,
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phoneNo: "",
  roleId: 1, // Default to Customer (1)
  isActive: true,
  isEmailVerified: true,
  passwordHash: "",
  emailOtp: "",
  otpExpiry: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function UserMgmt() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  // Modal State ('add' | 'view' | 'edit' | null)
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  // Helper to format full name safely
  const formatFullName = (u) => {
    if (!u) return "N/A";
    const parts = [u.firstName, u.middleName, u.lastName].filter(Boolean);
    return parts.join(" ") || "N/A";
  };

  // Helper for role label mapping
  const getRoleLabel = (roleId) => {
    switch (Number(roleId)) {
      case 5:
        return "Admin (Role 5)";
      case 2:
        return "Waiter (Role 2)";
      case 1:
        return "Customer (Role 1)";
      default:
        return `Role ${roleId}`;
    }
  };

  useEffect(() => {
    setCurrentUser(GetCurrUser());
    fetchUsers();
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/User/all");
      const rawUsers = Array.isArray(data)
        ? data
        : data?.$values || data?.users || data?.data || [];

      setUsers(rawUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      const msg = err.response?.data?.message || err.response?.data || "Failed to load users.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      showToast("error", "Failed to fetch user list.");
    } finally {
      setLoading(false);
    }
  };

  // Modal Handlers
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSelectedUser(null);
    setModalType("add");
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setModalType("view");
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      userId: user.userId || 0,
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNo: user.phoneNo || "",
      roleId: user.roleId ?? 1,
      isActive: user.isActive ?? true,
      isEmailVerified: user.isEmailVerified ?? true,
      passwordHash: user.passwordHash || "",
      emailOtp: user.emailOtp || "",
      otpExpiry: user.otpExpiry || new Date().toISOString(),
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalType("edit");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setFormData(initialFormState);
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        roleId: Number(formData.roleId),
        updatedAt: new Date().toISOString(),
      };

      if (modalType === "add") {
        await apiClient.post("/User/create", payload);
        showToast("success", "User created successfully!");
      } else if (modalType === "edit") {
        await apiClient.put("/User/update", payload);
        showToast("success", "User profile updated successfully!");
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Save failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Operation failed.";
      showToast("error", typeof errorMsg === "string" ? errorMsg : "Operation failed.");
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ID #${userId}?`)) return;

    try {
      await apiClient.delete(`/User/${userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      showToast("success", `User #${userId} deleted successfully!`);
    } catch (err) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Failed to delete user.";
      showToast("error", typeof errorMsg === "string" ? errorMsg : "Failed to delete user.");
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = formatFullName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phoneNo || "").toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query);
      const roleMatch = roleFilter === "All Roles" || String(u.roleId) === String(roleFilter);

      return matchesSearch && roleMatch;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="user-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage registered accounts and roles.</p>
          {currentUser && (
            <span style={{ fontSize: "13px", color: "#b08b3e" }}>
              Logged in User ID: <strong>{currentUser.userId || currentUser.UserId}</strong> (Role ID: {currentUser.roleId || currentUser.RoleId})
            </span>
          )}
        </div>
        <button className="add-btn" onClick={handleOpenAdd}>+ Add User</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Dynamic Summary Cards */}
      <div className="stats">
        <div className="card">
          <h3>Total Users</h3>
          <span>{users.length}</span>
        </div>
        <div className="card">
          <h3>Admins (Role 5)</h3>
          <span>{users.filter((x) => x.roleId === 5).length}</span>
        </div>
        <div className="card">
          <h3>Waiters (Role 2)</h3>
          <span>{users.filter((x) => x.roleId === 2).length}</span>
        </div>
        <div className="card">
          <h3>Customers (Role 1)</h3>
          <span>{users.filter((x) => x.roleId === 1).length}</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="All Roles">All Roles</option>
          <option value="5">Admin (Role 5)</option>
          <option value="2">Waiter (Role 2)</option>
          <option value="1">Customer (Role 1)</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#777" }}>Loading users...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone No</th>
                <th>Role</th>
                <th>Email Verification</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>#{user.userId}</td>
                    <td><strong>{formatFullName(user)}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phoneNo || "N/A"}</td>
                    <td>{getRoleLabel(user.roleId)}</td>
                    <td>
                      <span className={user.isEmailVerified ? "verified" : "notverified"}>
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={user.isActive ? "active" : "inactive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="view" onClick={() => handleOpenView(user)}>View</button>
                      <button className="edit" onClick={() => handleOpenEdit(user)}>Edit</button>
                      <button className="delete" onClick={() => handleDeleteUser(user.userId)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {modalType && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* View Details Modal */}
            {modalType === "view" && selectedUser && (
              <div>
                <h2>User Profile Details</h2>
                <hr />
                <div className="user-details">
                  <p><strong>User ID:</strong> #{selectedUser.userId}</p>
                  <p><strong>First Name:</strong> {selectedUser.firstName || "N/A"}</p>
                  <p><strong>Middle Name:</strong> {selectedUser.middleName || "N/A"}</p>
                  <p><strong>Last Name:</strong> {selectedUser.lastName || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone Number:</strong> {selectedUser.phoneNo || "N/A"}</p>
                  <p><strong>Role:</strong> {getRoleLabel(selectedUser.roleId)}</p>
                  <p><strong>Verified Email:</strong> {selectedUser.isEmailVerified ? "Yes" : "No"}</p>
                  <p><strong>Account Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</p>
                  <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div className="modal-actions">
                  <button className="close-btn" onClick={handleCloseModal}>Close</button>
                </div>
              </div>
            )}

            {/* Add / Edit Form Modal */}
            {(modalType === "add" || modalType === "edit") && (
              <div>
                <h2>{modalType === "add" ? "Add New User" : "Edit User"}</h2>
                <hr />
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phoneNo}
                      onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                    >
                      <option value={1}>Customer (Role 1)</option>
                      <option value={2}>Waiter (Role 2)</option>
                      <option value={5}>Admin (Role 5)</option>
                    </select>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      Account Active
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isEmailVerified}
                        onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                      />
                      Mark Email as Verified
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="close-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      {modalType === "add" ? "Create User" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMgmt;