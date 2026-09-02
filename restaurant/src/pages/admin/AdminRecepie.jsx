import React, { useState, useEffect, useCallback } from "react";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";
import axios from "axios";
import "./AdminRecepie.css"; // Import the CSS file below

function AdminRecepie() {
  const baseUrl = api();
  const { token, userId } = GetCurrUser();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [validItem, setValidItem] = useState([]);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const [formData, setFormData] = useState({
    menuId: "",
    inventoryItemId: "",
    quantityRequired: "",
    unitId: "",
    isActive: true,
  });

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }),
    [token]
  );

  const extractArray = (data) => {
    if (data && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  };

  const constructFinalList = (recipeList, menuList, inventoryList, unitList) => {
    const combined = recipeList.map((recipe) => {
      const matchedMenu = menuList.find(
        (m) => Number(m.menuId ?? m.id ?? m.foodId) === Number(recipe.menuId)
      );

      const matchedInventory = inventoryList.find(
        (i) => Number(i.inventoryItemId ?? i.id) === Number(recipe.inventoryItemId)
      );

      const targetUnitId = recipe.unitId ?? matchedInventory?.unitId;
      const matchedUnit = unitList.find(
        (u) => Number(u.unitId ?? u.id) === Number(targetUnitId)
      );

      return {
        recipeId: recipe.recipeId,
        menuId: recipe.menuId,
        inventoryItemId: recipe.inventoryItemId,
        unitId: targetUnitId,
        foodName:
          matchedMenu?.foodName ||
          matchedMenu?.name ||
          matchedMenu?.itemName ||
          `Menu #${recipe.menuId}`,
        quantityRequired: recipe.quantityRequired,
        inventoryItem:
          matchedInventory?.itemName ||
          matchedInventory?.name ||
          `Item #${recipe.inventoryItemId}`,
        unit:
          matchedUnit?.shortName ||
          matchedUnit?.unitName ||
          matchedUnit?.name ||
          `Unit #${targetUnitId}`,
        isActive: recipe.isActive ?? true,
        createdBy: recipe.createdBy,
        createdOn: recipe.createdOn,
      };
    });

    setValidItem(combined);
  };

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [menuRes, inventoryRes, unitRes, recipeRes] = await Promise.all([
        axios.get(`${baseUrl}/Menu/get-all`, getAuthHeaders()),
        axios.get(`${baseUrl}/Inventory`, getAuthHeaders()),
        axios.get(`${baseUrl}/Units`, getAuthHeaders()),
        axios.get(`${baseUrl}/Recipe`, getAuthHeaders()),
      ]);

      const fetchedMenus = extractArray(menuRes.data);
      const fetchedInventory = extractArray(inventoryRes.data);
      const fetchedUnits = extractArray(unitRes.data);
      const fetchedRecipes = extractArray(recipeRes.data);

      setMenuItems(fetchedMenus);
      setInventoryItems(fetchedInventory);
      setUnits(fetchedUnits);
      setRecipes(fetchedRecipes);

      constructFinalList(
        fetchedRecipes,
        fetchedMenus,
        fetchedInventory,
        fetchedUnits
      );
    } catch (error) {
      console.error("Error loading admin recipe data:", error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, getAuthHeaders]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "inventoryItemId" && value) {
        const inv = inventoryItems.find(
          (i) => Number(i.inventoryItemId ?? i.id) === Number(value)
        );
        if (inv && inv.unitId) {
          updated.unitId = String(inv.unitId);
        }
      }

      return updated;
    });
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingRecipeId(null);
    setFormData({
      menuId: "",
      inventoryItemId: "",
      quantityRequired: "",
      unitId: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setEditingRecipeId(item.recipeId);
    setFormData({
      menuId: String(item.menuId || ""),
      inventoryItemId: String(item.inventoryItemId || ""),
      quantityRequired: String(item.quantityRequired || ""),
      unitId: String(item.unitId || ""),
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.menuId || !formData.inventoryItemId || !formData.quantityRequired) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      const now = new Date().toISOString();

      if (isEditing) {
        const existingRecipe = recipes.find(
          (r) => Number(r.recipeId) === Number(editingRecipeId)
        );

        const putPayload = {
          recipeId: Number(editingRecipeId),
          menuId: Number(formData.menuId),
          inventoryItemId: Number(formData.inventoryItemId),
          quantityRequired: Number(formData.quantityRequired),
          unitId: Number(formData.unitId) || 0,
          isActive: Boolean(formData.isActive),
          createdBy: Number(existingRecipe?.createdBy || userId || 0),
          updatedBy: Number(userId || 0),
          createdOn: existingRecipe?.createdOn || now,
          updatedOn: now,
        };

        await axios.put(`${baseUrl}/Recipe`, putPayload, getAuthHeaders());
        alert("Recipe updated successfully!");
      } else {
        const postPayload = {
          recipeId: 0,
          menuId: Number(formData.menuId),
          inventoryItemId: Number(formData.inventoryItemId),
          quantityRequired: Number(formData.quantityRequired),
          unitId: Number(formData.unitId) || 0,
          isActive: Boolean(formData.isActive),
          createdBy: Number(userId || 0),
          updatedBy: 0,
          createdOn: now,
          updatedOn: now,
        };

        await axios.post(`${baseUrl}/Recipe`, postPayload, getAuthHeaders());
        alert("Recipe item added successfully!");
      }

      setShowModal(false);
      await loadAllData();
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert(error.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm(`Are you sure you want to delete Recipe #${recipeId}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/Recipe/${recipeId}`, getAuthHeaders());
      alert("Recipe deleted successfully!");
      await loadAllData();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert(error.response?.data?.message || "Failed to delete recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-recipe-page">
      {/* Header Section */}
      <div className="recipe-header">
        <div>
          <h1>Recipe Management</h1>
          <p>Configure ingredients, standard quantities, and units for your menu items.</p>
        </div>
        <div className="header-buttons">
          <button className="add-btn" onClick={handleOpenAddModal}>
            + Add Recipe Item
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="loading-state">Loading recipe records...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Recipe ID</th>
                <th>Food Name</th>
                <th>Quantity Required</th>
                <th>Inventory Item</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {validItem.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No recipe items found.
                  </td>
                </tr>
              ) : (
                validItem.map((item) => (
                  <tr key={item.recipeId}>
                    <td className="recipe-number">#{item.recipeId}</td>
                    <td className="food-name">{item.foodName}</td>
                    <td>{item.quantityRequired}</td>
                    <td>{item.inventoryItem}</td>
                    <td>{item.unit}</td>
                    <td>
                      <span className={`status ${item.isActive ? "active" : "inactive"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => handleOpenEditModal(item)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(item.recipeId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="recipe-modal">
            <h2>{isEditing ? "Edit Recipe Item" : "Add Recipe Item"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Food Item (Menu)</label>
                <select
                  name="menuId"
                  value={formData.menuId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Food</option>
                  {menuItems.map((menu) => (
                    <option key={menu.menuId || menu.id} value={menu.menuId || menu.id}>
                      {menu.foodName || menu.itemName || menu.name || `Menu #${menu.menuId || menu.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Inventory Item</label>
                <select
                  name="inventoryItemId"
                  value={formData.inventoryItemId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Inventory Item</option>
                  {inventoryItems.map((item) => (
                    <option key={item.inventoryItemId || item.id} value={item.inventoryItemId || item.id}>
                      {item.itemName || item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit</label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.unitId || unit.id} value={unit.unitId || unit.id}>
                      {unit.unitName || unit.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity Required</label>
                <input
                  type="number"
                  step="0.001"
                  name="quantityRequired"
                  value={formData.quantityRequired}
                  onChange={handleInputChange}
                  placeholder="e.g. 0.15"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isActive" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active Status
                </label>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn" disabled={saving}>
                  {saving ? "Saving..." : isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRecepie;