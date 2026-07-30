import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function EditTableModal({ open, table, onClose, refresh }) {
  const baseApi = api();
  const { token } = GetCurrUser();

  const [form, setForm] = useState({
    tableNo: "",
    capacity: "",
    status: "Available",
  });

  const [loading, setLoading] = useState(false);

  // Sync form state when table changes or modal opens
  useEffect(() => {
    if (open && table) {
      setForm({
        tableNo: table.tableNo ?? "",
        capacity: table.capacity ?? "",
        status: table.status ?? "Available",
      });
    }
  }, [open, table]);

  // Close modal on Escape key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [loading, onClose]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open || !table) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!String(form.tableNo).trim()) {
      showToast("error", "Please enter a table number.");
      return;
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      showToast("error", "Capacity must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      // Endpoint aligned with PUT /api/Table
      await axios.put(
        `${baseApi}/Table`,
        {
          tableId: table.tableId,
          tableNo: Number(form.tableNo),
          capacity: Number(form.capacity),
          status: form.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/octet-stream",
            Authorization: token ? `Bearer ${token}` : "",
          },
          responseType: "arraybuffer", // Handles octet-stream response type from API spec
        }
      );

      showToast("success", "Table updated successfully.");
      refresh();
      onClose();
    } catch (error) {
      let errorMsg = "Failed to update table.";

      // Parse error response if octet-stream response comes back as an ArrayBuffer on error
      if (error.response?.data) {
        if (error.response.data instanceof ArrayBuffer) {
          try {
            const decodedText = new TextDecoder().decode(error.response.data);
            const parsedError = JSON.parse(decodedText);
            errorMsg = parsedError.message || decodedText;
          } catch {
            errorMsg = "An error occurred while updating the table.";
          }
        } else if (typeof error.response.data === "object") {
          errorMsg = error.response.data.message || errorMsg;
        }
      }

      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay") && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="table-modal">
        <h2>Edit Table</h2>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="tableNo">Table Number</label>
            <input
              id="tableNo"
              type="number"
              name="tableNo"
              value={form.tableNo}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              type="number"
              name="capacity"
              min="1"
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
              {loading ? "Updating..." : "Update Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTableModal;