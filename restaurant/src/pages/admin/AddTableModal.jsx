import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function AddTableModal({ open, onClose, refresh }) {
  const baseApi = api();
  const { token } = GetCurrUser();

  const initialForm = {
    tableNo: "",
    capacity: "",
    status: "Available",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.tableNo.trim()) {
      showToast("error", "Please enter a table number.");
      return;
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      showToast("error", "Capacity must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${baseApi}/Table/CreateTable`,
        {
          tableNo: Number(form.tableNo),
          capacity: Number(form.capacity),
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
    <div className="modal-overlay">
      <div className="table-modal">
        <h2>Add New Table</h2>

        <div className="form-group">
          <label>Table Number</label>

          <input
            type="number"
            name="tableNo"
            placeholder="100"
            value={form.tableNo}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Capacity</label>

          <input
            type="number"
            name="capacity"
            min="1"
            placeholder="4"
            value={form.capacity}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
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
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Table"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTableModal;