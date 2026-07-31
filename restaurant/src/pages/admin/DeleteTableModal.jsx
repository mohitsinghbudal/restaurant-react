import React, { useState } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function DeleteTableModal({ open, table, onClose, refresh }) {
  const baseApi = api();
  const { token } = GetCurrUser();
  const [loading, setLoading] = useState(false);

  if (!open || !table) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Correct URL matching [HttpDelete] with [FromQuery] int tableId
      await axios.delete(`${baseApi}/Table`, {
        params: { tableId: table.tableId },
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      showToast("success", "Table deleted successfully.");
      refresh();
      onClose();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete table."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.classList.contains("modal-overlay") && !loading && onClose()}
    >
      <div className="confirm-modal">
        <h2>Delete Table</h2>

        <p>
          Are you sure you want to delete <strong>Table {table.tableNo}</strong>?
        </p>

        <p className="warning-text">This action cannot be undone.</p>

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="delete-btn" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTableModal;