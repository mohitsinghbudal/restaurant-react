import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function EditTableModal({ open, table, onClose, refresh }) {
  const baseApi = api();
  const { token } = GetCurrUser() || {};

  const [form, setForm] = useState({
    tableNo: "",
    capacity: "",
    status: "Available",
  });

  const [loading, setLoading] = useState(false);

  // Populate state whenever target table changes or modal opens
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

    const parsedTableNo = Number(form.tableNo);
    const parsedCapacity = Number(form.capacity);

    // Form Validations
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
      await axios.put(
        `${baseApi}/Table`,
        {
          tableId: table.tableId,
          tableNo: parsedTableNo,
          capacity: parsedCapacity,
          status: form.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/octet-stream",
            Authorization: token ? `Bearer ${token}` : "",
          },
          responseType: "arraybuffer", // For endpoints returning octet-stream byte arrays
        }
      );

      showToast("success", "Table updated successfully.");
      refresh();
      onClose();
    } catch (error) {
      let errorMsg = "Failed to update table.";

      // Handle binary response payload on server errors
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="table-modal"
        onClick={(e) => e.stopPropagation()} // Stop click propagation to backdrop
      >
        <h2>Edit Table T-{table.tableNo}</h2>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="tableNo">Table Number</label>
            <input
              id="tableNo"
              type="number"
              name="tableNo"
              min="1"
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