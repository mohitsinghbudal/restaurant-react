import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./MenuMgmt.css";

function MenuMgmt() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Current logged in user context
  const baseUrl = api();
  const { token, userId } = GetCurrUser();

  // --- MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);

  // Form state for Menu Edit
  const [editFormData, setEditFormData] = useState({
    menuId: 0,
    itemName: "",
    itemDescription: "",
    categoryId: 0,
    subCategoryId: 0,
    itemImage: "",
    itemPrice: 0,
    unitId: 0,
    isAvailable: true,
    lastUpdatedBy: 0,
    lastUpdatedOn: new Date().toISOString(),
  });

  // Category Form State (Create + Edit)
  const [categoryForm, setCategoryForm] = useState({
    categoryId: 0,
    categoryName: "",
    description: "",
    isAvailable: true,
    isActive: true,
    displayOrder: 0,
    createdBy: 0,
    createdOn: new Date().toISOString(),
    updatedBy: 0,
    updatedOn: new Date().toISOString(),
  });
  const [editingCategory, setEditingCategory] = useState(false);

  // SubCategory Form State (Create + Edit)
  const [subCategoryForm, setSubCategoryForm] = useState({
    subCategoryId: 0,
    categoryId: 0,
    subCategoryName: "",
    description: "",
    isAvailable: true,
    isActive: true,
    displayOrder: 0,
    createdBy: 0,
    createdOn: new Date().toISOString(),
    updatedBy: 0,
    updatedOn: new Date().toISOString(),
  });
  const [editingSubCategory, setEditingSubCategory] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [currentPage]);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // 1. Fetch Categories, SubCategories, and Menu Items
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, subCatRes] = await Promise.all([
        axios.get(`${baseUrl}/Category/All`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/SubCategory/All`, getAuthHeaders()).catch(() => ({ data: [] })),
      ]);

      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.items || []);
      setSubCategories(Array.isArray(subCatRes.data) ? subCatRes.data : subCatRes.data.items || []);

      await fetchMenuData(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load page data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = async (pageNo) => {
    const response = await axios.get(
      `${baseUrl}/Menu/get-all?page=${pageNo}`,
      getAuthHeaders()
    );
    const data = response.data;
    if (data && data.items) {
      setMenuItems(data.items);
      if (data.totalPages) setTotalPages(data.totalPages);
    } else if (Array.isArray(data)) {
      setMenuItems(data);
    }
  };

  // Helper functions
  const getCategoryName = (id) => {
    const cat = categories.find((c) => (c.categoryId || c.id) === parseInt(id, 10));
    return cat ? cat.categoryName || cat.name : `Cat #${id}`;
  };

  const getSubCategoryName = (id) => {
    const subCat = subCategories.find((sc) => (sc.subCategoryId || sc.id) === parseInt(id, 10));
    return subCat ? subCat.subCategoryName || subCat.name : `SubCat #${id}`;
  };

  // --- CATEGORY ACTIONS ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const payload = {
        categoryId: parseInt(categoryForm.categoryId, 10),
        categoryName: categoryForm.categoryName,
        description: categoryForm.description || "",
        isAvailable: Boolean(categoryForm.isAvailable),
        isActive: Boolean(categoryForm.isActive),
        displayOrder: parseInt(categoryForm.displayOrder || 0, 10),
        createdBy: parseInt(categoryForm.createdBy || userId || 0, 10),
        createdOn: categoryForm.createdOn || now,
        updatedBy: parseInt(userId || 0, 10),
        updatedOn: now,
      };

      if (editingCategory) {
        // PUT or POST to /Category/Update
        await axios.put(`${baseUrl}/Category/Update`, payload, getAuthHeaders());
      } else {
        // Create endpoint
        await axios.post(`${baseUrl}/Category`, payload, getAuthHeaders());
      }

      resetCategoryForm();
      await fetchInitialData();
    } catch (err) {
      alert(`Category Operation Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(true);
    setCategoryForm({
      categoryId: cat.categoryId || cat.id || 0,
      categoryName: cat.categoryName || cat.name || "",
      description: cat.description || "",
      isAvailable: cat.isAvailable ?? true,
      isActive: cat.isActive ?? true,
      displayOrder: cat.displayOrder || 0,
      createdBy: cat.createdBy || userId || 0,
      createdOn: cat.createdOn || new Date().toISOString(),
      updatedBy: userId || 0,
      updatedOn: new Date().toISOString(),
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Category?")) return;
    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/Category/${id}`, getAuthHeaders());
      await fetchInitialData();
    } catch (err) {
      alert(`Failed to delete category: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(false);
    setCategoryForm({
      categoryId: 0,
      categoryName: "",
      description: "",
      isAvailable: true,
      isActive: true,
      displayOrder: 0,
      createdBy: userId || 0,
      createdOn: new Date().toISOString(),
      updatedBy: userId || 0,
      updatedOn: new Date().toISOString(),
    });
  };

  // --- SUB-CATEGORY ACTIONS ---
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const payload = {
        subCategoryId: parseInt(subCategoryForm.subCategoryId, 10),
        categoryId: parseInt(subCategoryForm.categoryId, 10),
        subCategoryName: subCategoryForm.subCategoryName,
        description: subCategoryForm.description || "",
        isAvailable: Boolean(subCategoryForm.isAvailable),
        isActive: Boolean(subCategoryForm.isActive),
        displayOrder: parseInt(subCategoryForm.displayOrder || 0, 10),
        createdBy: parseInt(subCategoryForm.createdBy || userId || 0, 10),
        createdOn: subCategoryForm.createdOn || now,
        updatedBy: parseInt(userId || 0, 10),
        updatedOn: now,
      };

      if (editingSubCategory) {
        // PUT or POST to /SubCategory/Update
        await axios.put(`${baseUrl}/SubCategory/Update`, payload, getAuthHeaders());
      } else {
        // Create endpoint
        await axios.post(`${baseUrl}/SubCategory`, payload, getAuthHeaders());
      }

      resetSubCategoryForm();
      await fetchInitialData();
    } catch (err) {
      alert(`SubCategory Operation Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubCategoryClick = (sc) => {
    setEditingSubCategory(true);
    setSubCategoryForm({
      subCategoryId: sc.subCategoryId || sc.id || 0,
      categoryId: sc.categoryId || 0,
      subCategoryName: sc.subCategoryName || sc.name || "",
      description: sc.description || "",
      isAvailable: sc.isAvailable ?? true,
      isActive: sc.isActive ?? true,
      displayOrder: sc.displayOrder || 0,
      createdBy: sc.createdBy || userId || 0,
      createdOn: sc.createdOn || new Date().toISOString(),
      updatedBy: userId || 0,
      updatedOn: new Date().toISOString(),
    });
  };

  const handleDeleteSubCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Sub-Category?")) return;
    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/SubCategory/${id}`, getAuthHeaders());
      await fetchInitialData();
    } catch (err) {
      alert(`Failed to delete sub-category: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetSubCategoryForm = () => {
    setEditingSubCategory(false);
    setSubCategoryForm({
      subCategoryId: 0,
      categoryId: 0,
      subCategoryName: "",
      description: "",
      isAvailable: true,
      isActive: true,
      displayOrder: 0,
      createdBy: userId || 0,
      createdOn: new Date().toISOString(),
      updatedBy: userId || 0,
      updatedOn: new Date().toISOString(),
    });
  };

  // --- MENU ITEM ACTIONS ---
  const handleEditClick = (item) => {
    setEditFormData({
      menuId: item.menuId || 0,
      itemName: item.itemName || "",
      itemDescription: item.itemDescription || "",
      categoryId: item.categoryId || 0,
      subCategoryId: item.subCategoryId || 0,
      itemImage: item.itemImage || "",
      itemPrice: item.itemPrice || 0,
      unitId: item.unitId || 0,
      isAvailable: item.isAvailable ?? true,
      lastUpdatedBy: userId || item.lastUpdatedBy || 0,
      lastUpdatedOn: new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        menuId: parseInt(editFormData.menuId, 10),
        itemName: editFormData.itemName,
        itemDescription: editFormData.itemDescription,
        categoryId: parseInt(editFormData.categoryId, 10),
        subCategoryId: parseInt(editFormData.subCategoryId, 10),
        itemImage: editFormData.itemImage,
        itemPrice: parseFloat(editFormData.itemPrice),
        unitId: parseInt(editFormData.unitId, 10),
        isAvailable: Boolean(editFormData.isAvailable),
        lastUpdatedBy: parseInt(userId || editFormData.lastUpdatedBy || 0, 10),
        lastUpdatedOn: new Date().toISOString(),
      };

      const response = await axios.put(
        `${baseUrl}/Menu/${payload.menuId}`,
        payload,
        getAuthHeaders()
      );

      if (response.status === 200 || response.status === 204) {
        setIsEditModalOpen(false);
        await fetchMenuData(currentPage);
      }
    } catch (err) {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    const payload = {
      menuId: parseInt(item.menuId, 10),
      itemName: item.itemName || "",
      itemDescription: item.itemDescription || "",
      categoryId: parseInt(item.categoryId || 0, 10),
      subCategoryId: parseInt(item.subCategoryId || 0, 10),
      itemImage: item.itemImage || "",
      itemPrice: parseFloat(item.itemPrice || 0),
      unitId: parseInt(item.unitId || 0, 10),
      isAvailable: !item.isAvailable,
      lastUpdatedBy: parseInt(userId || item.lastUpdatedBy || 0, 10),
      lastUpdatedOn: new Date().toISOString(),
    };

    try {
      await axios.put(`${baseUrl}/Menu/${item.menuId}`, payload, getAuthHeaders());
      await fetchMenuData(currentPage);
    } catch (err) {
      alert(`Toggle failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.itemName
      ? item.itemName.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchesCategory =
      selectedCategory === "All" ||
      item.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && !isEditModalOpen && menuItems.length === 0) {
    return (
      <div className="inventory-container">
        <div className="inventory-loading">
          <div className="spinner"></div>
          <p>Loading menu and categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      {/* --- HEADER --- */}
      <div className="inventory-header">
        <div>
          <h1>Menu Management</h1>
          <p>Monitor, edit, and organize restaurant categories and menu items.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
            + Manage Categories
          </button>
          <button className="btn-secondary" onClick={() => setIsSubCategoryModalOpen(true)}>
            + Manage Sub-Categories
          </button>
          <button className="btn-primary">+ Add Menu Item</button>
        </div>
      </div>

      {/* --- METRICS CARDS --- */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Items</span>
          <span className="metric-value">{menuItems.length}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Categories</span>
          <span className="metric-value gold-text">{categories.length}</span>
        </div>

        <div className="metric-card alert">
          <span className="metric-label">Unavailable Items</span>
          <span className="metric-value">
            {menuItems.filter((x) => !x.isAvailable).length}
          </span>
        </div>
      </div>

      {/* --- TOOLBAR & FILTERS --- */}
      <div className="inventory-toolbar">
        <input
          type="text"
          className="search-bar"
          placeholder="Search menu item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={selectedCategory === "All" ? "active" : ""}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => {
            const id = (cat.categoryId || cat.id).toString();
            return (
              <button
                key={id}
                className={selectedCategory === id ? "active" : ""}
                onClick={() => setSelectedCategory(id)}
              >
                {cat.categoryName || cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TABLE & DATA CONTAINER --- */}
      <div className="table-wrapper">
        {error ? (
          <p style={{ padding: "24px", color: "var(--danger)", textAlign: "center" }}>
            Failed to fetch menu: {error}
          </p>
        ) : (
          <>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food Name</th>
                  <th>Category</th>
                  <th>Sub-Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.menuId}
                      className={!item.isAvailable ? "row-warning" : ""}
                    >
                      <td className="id-col">#{item.menuId}</td>
                      <td className="font-medium">
                        <div>{item.itemName}</div>
                        {item.itemDescription && (
                          <small className="muted-text">{item.itemDescription}</small>
                        )}
                      </td>
                      <td className="muted-text">{getCategoryName(item.categoryId)}</td>
                      <td className="muted-text">{getSubCategoryName(item.subCategoryId)}</td>
                      <td className="gold-text">Rs. {item.itemPrice}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            item.isAvailable ? "ok" : "low"
                          }`}
                          onClick={() => handleToggleAvailability(item)}
                          style={{ cursor: "pointer" }}
                          title="Click to toggle availability"
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="action-cell text-right">
  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px",marginRight:"20px", paddingRight:"20px"}}>
    <button
      className="btn-text-primary"
      onClick={() => handleEditClick(item)}
    >
      Edit
    </button>
    <button className="btn-text-danger">Delete</button>
  </div>
</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px" }}>
                      <span className="muted-text">No menu items found.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* --- PAGINATION CONTROLS --- */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <button
                className="btn-secondary-pagination"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                &laquo; Previous
              </button>

              <span className="muted-text" style={{ fontSize: "13px" }}>
                Page{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {currentPage}
                </strong>{" "}
                {totalPages > 1 ? `of ${totalPages}` : ""}
              </span>

              <button
                className="btn-secondary-pagination"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={
                  (totalPages > 1 && currentPage >= totalPages) ||
                  menuItems.length === 0 ||
                  loading
                }
              >
                Next &raquo;
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- MENU EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Menu Item #{editFormData.menuId}</h2>
              <button
                className="modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  className="modal-input"
                  name="itemName"
                  value={editFormData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Item Description</label>
                <input
                  type="text"
                  className="modal-input"
                  name="itemDescription"
                  value={editFormData.itemDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="modal-input"
                    name="categoryId"
                    value={editFormData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Select Category</option>
                    {categories.map((c) => {
                      const id = c.categoryId || c.id;
                      return (
                        <option key={id} value={id}>
                          {c.categoryName || c.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sub-Category</label>
                  <select
                    className="modal-input"
                    name="subCategoryId"
                    value={editFormData.subCategoryId}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select Sub-Category</option>
                    {subCategories.map((sc) => {
                      const id = sc.subCategoryId || sc.id;
                      return (
                        <option key={id} value={id}>
                          {sc.subCategoryName || sc.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modal-input"
                    name="itemPrice"
                    value={editFormData.itemPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit ID</label>
                  <input
                    type="number"
                    className="modal-input"
                    name="unitId"
                    value={editFormData.unitId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  className="modal-input"
                  name="itemImage"
                  value={editFormData.itemImage}
                  onChange={handleInputChange}
                />
              </div>

              <div
                className="form-group"
                style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={editFormData.isAvailable}
                  onChange={handleInputChange}
                />
                <label htmlFor="isAvailable" style={{ cursor: "pointer", margin: 0 }}>
                  Is Available
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY MANAGEMENT MODAL --- */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? "Update Category" : "Add Category"}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  resetCategoryForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} style={{ marginBottom: "20px" }}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Category Name"
                  value={categoryForm.categoryName}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, categoryName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={categoryForm.displayOrder}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, displayOrder: e.target.value }))
                    }
                  />
                </div>
                <div
                  className="form-group"
                  style={{ flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "20px" }}
                >
                  <input
                    type="checkbox"
                    id="catIsAvailable"
                    checked={categoryForm.isAvailable}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, isAvailable: e.target.checked }))
                    }
                  />
                  <label htmlFor="catIsAvailable" style={{ cursor: "pointer", margin: 0 }}>
                    Available
                  </label>

                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={categoryForm.isActive}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <label htmlFor="catIsActive" style={{ cursor: "pointer", margin: 0 }}>
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                {editingCategory && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetCategoryForm}
                  >
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingCategory ? "Update Category" : "+ Save Category"}
                </button>
              </div>
            </form>

            <label className="metric-label" style={{ display: "block", marginBottom: "8px" }}>
              Existing Categories
            </label>
            <div style={{ maxHeight: "180px", overflowY: "auto" }}>
              {categories.map((cat) => {
                const id = cat.categoryId || cat.id;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span>{cat.categoryName || cat.name}</span>
                    <div>
                      <button
                        className="btn-text-primary"
                        type="button"
                        onClick={() => handleEditCategoryClick(cat)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-text-danger"
                        type="button"
                        onClick={() => handleDeleteCategory(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-CATEGORY MANAGEMENT MODAL --- */}
      {isSubCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSubCategory ? "Update Sub-Category" : "Add Sub-Category"}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setIsSubCategoryModalOpen(false);
                  resetSubCategoryForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubCategorySubmit} style={{ marginBottom: "20px" }}>
              <div className="form-group">
                <label>Parent Category</label>
                <select
                  className="modal-input"
                  value={subCategoryForm.categoryId}
                  onChange={(e) =>
                    setSubCategoryForm((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  required
                >
                  <option value={0}>Select Parent Category</option>
                  {categories.map((c) => {
                    const id = c.categoryId || c.id;
                    return (
                      <option key={id} value={id}>
                        {c.categoryName || c.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-Category Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Sub-Category Name"
                  value={subCategoryForm.subCategoryName}
                  onChange={(e) =>
                    setSubCategoryForm((p) => ({ ...p, subCategoryName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Description"
                  value={subCategoryForm.description}
                  onChange={(e) =>
                    setSubCategoryForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={subCategoryForm.displayOrder}
                    onChange={(e) =>
                      setSubCategoryForm((p) => ({ ...p, displayOrder: e.target.value }))
                    }
                  />
                </div>
                <div
                  className="form-group"
                  style={{ flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "20px" }}
                >
                  <input
                    type="checkbox"
                    id="subIsAvailable"
                    checked={subCategoryForm.isAvailable}
                    onChange={(e) =>
                      setSubCategoryForm((p) => ({ ...p, isAvailable: e.target.checked }))
                    }
                  />
                  <label htmlFor="subIsAvailable" style={{ cursor: "pointer", margin: 0 }}>
                    Available
                  </label>

                  <input
                    type="checkbox"
                    id="subIsActive"
                    checked={subCategoryForm.isActive}
                    onChange={(e) =>
                      setSubCategoryForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <label htmlFor="subIsActive" style={{ cursor: "pointer", margin: 0 }}>
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                {editingSubCategory && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetSubCategoryForm}
                  >
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingSubCategory ? "Update Sub-Category" : "+ Save Sub-Category"}
                </button>
              </div>
            </form>

            <label className="metric-label" style={{ display: "block", marginBottom: "8px" }}>
              Existing Sub-Categories
            </label>
            <div style={{ maxHeight: "180px", overflowY: "auto" }}>
              {subCategories.map((sc) => {
                const id = sc.subCategoryId || sc.id;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <div>{sc.subCategoryName || sc.name}</div>
                      <small className="muted-text">
                        Belongs to: {getCategoryName(sc.categoryId)}
                      </small>
                    </div>
                    <div>
                      <button
                        className="btn-text-primary"
                        type="button"
                        onClick={() => handleEditSubCategoryClick(sc)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-text-danger"
                        type="button"
                        onClick={() => handleDeleteSubCategory(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuMgmt;