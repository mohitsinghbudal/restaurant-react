import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function AddTableModal({ open, onClose, refresh }) {
  const baseApi = api();
  const { token } = GetCurrUser() || {};

  const initialForm = {
    tableNo: "",
    capacity: "",
    status: "Available",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Reset state whenever modal opens/closes
  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent full page reload on form submit
    if (loading) return;

    const parsedTableNo = Number(form.tableNo);
    const parsedCapacity = Number(form.capacity);

    // Validation
    if (!String(form.tableNo).trim() || parsedTableNo <= 0) {
      showToast("error", "Please enter a valid table number greater than 0.");
      return;
    }

    if (!form.capacity || parsedCapacity <= 0) {
      showToast("error", "Capacity must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${baseApi}/Table/CreateTable`,
        {
          tableNo: parsedTableNo,
          capacity: parsedCapacity,
          status: form.status,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      showToast("success", "Table created successfully.");

      refresh();
      setForm(initialForm);
      onClose();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to create table."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="table-modal" 
        onClick={(e) => e.stopPropagation()} /* Prevents closing when clicking inside content */
      >
        <h2>Add New Table</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tableNo">Table Number</label>
            <input
              id="tableNo"
              type="number"
              name="tableNo"
              placeholder="e.g. 100"
              value={form.tableNo}
              onChange={handleChange}
              disabled={loading}
              min="1"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              type="number"
              name="capacity"
              min="1"
              placeholder="e.g. 4"
              value={form.capacity}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Booked">Booked</option>
              <option value="Cleaning">Cleaning</option>
            </select>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="confirm-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTableModal;