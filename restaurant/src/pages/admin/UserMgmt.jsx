import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import GetCurrUser from "../../util/GetCurrUser";
import getApiUrl from "../../util/api";
import { showToast } from "../../components/showToast";
import "./UserMgmt.css";

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

// Dynamic Interceptor: Fetches fresh token per request from sessionStorage
apiClient.interceptors.request.use((config) => {
  const { token } = GetCurrUser();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("roles");
      showToast("error", "Session expired. Please log in again.");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      showToast("error", "Access Denied: Admin privileges required.");
    }
    return Promise.reject(error);
  }
);

// Numeric IDs matching backend database Role IDs
const AVAILABLE_ROLES = [
  { id: 1, label: "Customer" },
  { id: 2, label: "Waiter" },
  { id: 3, label: "Chef" },
  { id: 4, label: "Cashier" },
  { id: 5, label: "Admin" },
];

const initialFormState = {
  userId: 0,
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phoneNo: "",
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

  // Modal State ('add' | 'view' | 'edit' | 'roles' | null)
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Stores full item: { user: {...}, roles: [...] }
  const [formData, setFormData] = useState(initialFormState);

  // Array of numeric Role IDs selected in Role Modal (e.g. [1, 5])
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Helper to format user full name
  const formatFullName = (u) => {
    if (!u) return "N/A";
    const parts = [u.firstName, u.middleName, u.lastName].filter(Boolean);
    return parts.join(" ") || "N/A";
  };

  // Helper to format roles list for display table
  const getRoleLabel = (rolesData) => {
    if (!rolesData || !Array.isArray(rolesData) || rolesData.length === 0) {
      return "N/A";
    }
    return rolesData
      .map((r) => {
        const idVal = typeof r === "object" ? r.roleId || r.id : r;
        const matched = AVAILABLE_ROLES.find((ar) => Number(ar.id) === Number(idVal));
        if (matched) return matched.label;
        return typeof r === "object" ? r.roleName || r.name : String(r);
      })
      .join(", ");
  };

  // Helper to check if item has a specific role by numeric ID or Name
  const userHasRole = (item, roleTarget) => {
    if (!item?.roles || !Array.isArray(item.roles)) return false;
    return item.roles.some((r) => {
      const roleStr = typeof r === "object" ? r.roleName || r.name || "" : String(r);
      const roleIdStr = typeof r === "object" ? String(r.roleId || r.id || "") : String(r);

      return (
        roleStr.toLowerCase() === String(roleTarget).toLowerCase() ||
        roleIdStr === String(roleTarget)
      );
    });
  };

  useEffect(() => {
    setCurrentUser(GetCurrUser());
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/User/all");
      const rawData = Array.isArray(data)
        ? data
        : data?.$values || data?.users || data?.data || [];
      setUsers(rawData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      const msg = err.response?.data?.message || err.response?.data || "Failed to load users.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      showToast("error", "Failed to fetch user list.");
    } finally {
      setLoading(false);
    }
  };

  // Modal Open Handlers
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSelectedItem(null);
    setModalType("add");
  };

  const handleOpenView = (item) => {
    setSelectedItem(item);
    setModalType("view");
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    const u = item.user || {};
    setFormData({
      userId: u.userId || 0,
      firstName: u.firstName || "",
      middleName: u.middleName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      phoneNo: u.phoneNo || "",
      isActive: u.isActive ?? true,
      isEmailVerified: u.isEmailVerified ?? true,
      passwordHash: u.passwordHash || "",
      emailOtp: u.emailOtp || "",
      otpExpiry: u.otpExpiry || new Date().toISOString(),
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalType("edit");
  };

  const handleOpenRoleModal = (item) => {
    setSelectedItem(item);

    // Map existing user roles to their corresponding numeric IDs
    const userRoleIds = Array.isArray(item.roles)
      ? item.roles
          .map((r) => {
            if (typeof r === "object") return Number(r.roleId || r.id);
            const match = AVAILABLE_ROLES.find(
              (ar) => ar.label.toLowerCase() === String(r).toLowerCase() || String(ar.id) === String(r)
            );
            return match ? match.id : Number(r) || null;
          })
          .filter(Boolean)
      : [];

    setSelectedRoleIds(userRoleIds);
    setModalType("roles");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setSelectedRoleIds([]);
    setFormData(initialFormState);
  };

  // Toggle role selection in Role Modal using numeric ID
  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // Profile Form Submit (Add / Edit Profile)
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
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

  // Dedicated Roles Form Submit matching AssignRolesDto (userId, roleIds)
  const handleSaveRoles = async (e) => {
    e.preventDefault();
    if (!selectedItem?.user) return;

    try {
      await apiClient.put(`/User/update-roles`, {
        userId: selectedItem.user.userId,
        roleIds: selectedRoleIds, 
      });

      showToast("success", `Roles updated for ${selectedItem.user.firstName || "user"}!`);
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Role update failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Failed to update roles.";
      showToast("error", typeof errorMsg === "string" ? errorMsg : "Failed to update roles.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const u = item.user || {};
      const fullName = formatFullName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phoneNo || "").toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query);
      const roleMatch = roleFilter === "All Roles" || userHasRole(item, roleFilter);

      return matchesSearch && roleMatch;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="user-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage registered accounts and assign roles.</p>
          {currentUser && currentUser.userId && (
            <span style={{ fontSize: "13px", color: "#b08b3e" }}>
              Logged in User ID: <strong>{currentUser.userId}</strong> (Roles: {Array.isArray(currentUser.roles) ? currentUser.roles.join(", ") : "N/A"})
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
          <h3>Admins</h3>
          <span>{users.filter((item) => userHasRole(item, "5") || userHasRole(item, "Admin")).length}</span>
        </div>
        <div className="card">
          <h3>Waiters</h3>
          <span>{users.filter((item) => userHasRole(item, "2") || userHasRole(item, "Waiter")).length}</span>
        </div>
        <div className="card">
          <h3>Customers</h3>
          <span>{users.filter((item) => userHasRole(item, "1") || userHasRole(item, "Customer")).length}</span>
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
          <option value="5">Admin</option>
          <option value="2">Waiter</option>
          <option value="3">Chef</option>
          <option value="4">Cashier</option>
          <option value="1">Customer</option>
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
                <th>Roles</th>
                <th>Email Verification</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((item) => {
                  const u = item.user || {};
                  return (
                    <tr key={u.userId}>
                      <td>#{u.userId}</td>
                      <td><strong>{formatFullName(u)}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phoneNo || "N/A"}</td>
                      <td>
                        <span className="role-badge">
                          {getRoleLabel(item.roles)}
                        </span>
                      </td>
                      <td>
                        <span className={u.isEmailVerified ? "verified" : "notverified"}>
                          {u.isEmailVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span className={u.isActive ? "active" : "inactive"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button className="view" onClick={() => handleOpenView(item)}>View</button>
                        <button className="edit" onClick={() => handleOpenEdit(item)}>Edit</button>
                        <button className="roles-btn" onClick={() => handleOpenRoleModal(item)}>Roles</button>
                      </td>
                    </tr>
                  );
                })
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

      {/* Modal Overlay */}
      {modalType && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* 1. View Details Modal */}
            {modalType === "view" && selectedItem && (
              <div>
                <h2>User Profile Details</h2>
                <hr />
                <div className="user-details">
                  <p><strong>User ID:</strong> #{selectedItem.user?.userId}</p>
                  <p><strong>First Name:</strong> {selectedItem.user?.firstName || "N/A"}</p>
                  <p><strong>Middle Name:</strong> {selectedItem.user?.middleName || "N/A"}</p>
                  <p><strong>Last Name:</strong> {selectedItem.user?.lastName || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedItem.user?.email}</p>
                  <p><strong>Phone Number:</strong> {selectedItem.user?.phoneNo || "N/A"}</p>
                  <p><strong>Assigned Roles:</strong> {getRoleLabel(selectedItem.roles)}</p>
                  <p><strong>Verified Email:</strong> {selectedItem.user?.isEmailVerified ? "Yes" : "No"}</p>
                  <p><strong>Account Status:</strong> {selectedItem.user?.isActive ? "Active" : "Inactive"}</p>
                  <p><strong>Created At:</strong> {selectedItem.user?.createdAt ? new Date(selectedItem.user.createdAt).toLocaleString() : "N/A"}</p>
                </div>
                <div className="modal-actions">
                  <button className="close-btn" onClick={handleCloseModal}>Close</button>
                </div>
              </div>
            )}

            {/* 2. Add / Edit Profile Modal */}
            {(modalType === "add" || modalType === "edit") && (
              <div>
                <h2>{modalType === "add" ? "Add New User" : "Edit User Profile"}</h2>
                <hr />
                <form onSubmit={handleSubmitProfile}>
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
                      {modalType === "add" ? "Create User" : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. Manage Roles Modal */}
            {modalType === "roles" && selectedItem && (
              <div>
                <h2>Manage Roles</h2>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                  Select permissions/roles for <strong>{formatFullName(selectedItem.user)}</strong> (#{selectedItem.user?.userId})
                </p>
                <hr />
                <form onSubmit={handleSaveRoles}>
                  <div className="roles-selection-container" style={{ margin: "20px 0" }}>
                    {AVAILABLE_ROLES.map((role) => {
                      const isChecked = selectedRoleIds.includes(role.id);

                      return (
                        <div key={role.id} className="form-group checkbox-group" style={{ marginBottom: "12px" }}>
                          <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleRoleToggle(role.id)}
                            />
                            <span>{role.label}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="close-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Update Roles
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