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
      await axios.delete(
        `${baseApi}/Table/delete-table/${table.tableId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      showToast("success", "Table deleted successfully.");

      refresh();
      onClose();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to delete table."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">

        <h2>Delete Table</h2>

        <p>
          Are you sure you want to delete
          <strong> {table.tableNumber}</strong>?
        </p>

        <p className="warning-text">
          This action cannot be undone.
        </p>

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default DeleteTableModal;