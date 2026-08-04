import React, { useState, useEffect, useCallback } from "react";
import "./DinningMgmt.css";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function DinningMgmt() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Session Form State
  const [newSession, setNewSession] = useState({
    tableId: "",
    createdBy: "",
  });

  const baseApi = api();
  const currentUser = GetCurrUser() || {};
  const token = currentUser.token;

  /* =============================
          FETCH SESSIONS
  ============================== */

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${baseApi}/Dinning/all`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setSessions(res.data.sessions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dining sessions."
      );
    } finally {
      setLoading(false);
    }
  }, [baseApi, token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /* =============================
          KEYBOARD SHORTCUTS
  ============================== */

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !actionLoading) {
        setShowEndModal(false);
        setShowCreateModal(false);
        setSelectedSession(null);
      }
    },
    [actionLoading]
  );

  useEffect(() => {
    if (showEndModal || showCreateModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEndModal, showCreateModal, handleKeyDown]);

  /* =============================
          FILTERING LOGIC
  ============================== */

  const filteredSessions = sessions.filter((session) => {
    const searchLower = search.trim().toLowerCase();

    const sessionIdStr = session.sessionId ? String(session.sessionId) : "";
    const tableIdStr = session.tableId ? String(session.tableId) : "";

    const matchesSearch =
      !searchLower ||
      sessionIdStr.toLowerCase().includes(searchLower) ||
      tableIdStr.toLowerCase().includes(searchLower);

    const statusStr = session.sessionStatus || "";
    const matchesStatus =
      statusFilter === "All" ||
      statusStr.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* =============================
          DATE FORMATTING
  ============================== */

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =============================
        END DINING SESSION
  ============================== */

  const endSession = async () => {
    if (!selectedSession || actionLoading) return;

    setActionLoading(true);

    try {
      await axios.post(
        `${baseApi}/Dinning/End-Session/${selectedSession.sessionId}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      showToast("success", "Dining session ended successfully.");
      setShowEndModal(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Unable to end session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =============================
        CREATE DINING SESSION
  ============================== */

  const openCreateModal = () => {
    setNewSession({
      tableId: "",
      createdBy: currentUser.userId || currentUser.id || "",
    });
    setShowCreateModal(true);
  };

  const createSession = async (e) => {
    if (e) e.preventDefault();
    if (actionLoading) return;

    if (!newSession.tableId) {
      showToast("error", "Please enter a valid Table ID.");
      return;
    }

    setActionLoading(true);

    try {
      await axios.post(`${baseApi}/Dinning/Create-Session`, newSession, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      showToast("success", "Dining session created successfully.");
      setShowCreateModal(false);
      setNewSession({ tableId: "", createdBy: "" });
      fetchSessions();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Unable to create session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dining-page">
      {/* Header */}
      <div className="dining-header">
        <div>
          <h1>Dining Management</h1>
          <p>Monitor all dining sessions.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchSessions}
          disabled={loading || actionLoading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dining-cards">
        <div className="dining-card">
          <h3>Total Sessions</h3>
          <span>{sessions.length}</span>
        </div>

        <div className="dining-card active-card">
          <h3>Active</h3>
          <span>
            {
              sessions.filter(
                (x) => x.sessionStatus?.toLowerCase() === "active"
              ).length
            }
          </span>
        </div>

        <div className="dining-card complete-card">
          <h3>Closed</h3>
          <span>
            {
              sessions.filter(
                (x) => x.sessionStatus?.toLowerCase() === "closed"
              ).length
            }
          </span>
        </div>

        <div className="dining-card">
          <h3>Open Sessions</h3>
          <span>{sessions.filter((x) => x.endAt === null).length}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dining-toolbar">
        <input
          type="text"
          placeholder="Search by Session ID or Table ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="dining-table">
        {loading ? (
          <div className="empty">Loading dining sessions...</div>
        ) : error ? (
          <div className="empty" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Table</th>
                <th>Started At</th>
                <th>Ended At</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    No Dining Sessions Found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.sessionId}>
                    <td>#{session.sessionId}</td>
                    <td>Table {session.tableId}</td>
                    <td>{formatDateTime(session.startedAt)}</td>
                    <td>{formatDateTime(session.endAt)}</td>
                    <td>
                      <span
                        className={`status ${
                          session.sessionStatus?.toLowerCase() || ""
                        }`}
                      >
                        {session.sessionStatus}
                      </span>
                    </td>
                    <td>{session.createdBy || "-"}</td>
                    <td>
                      {session.sessionStatus === "Active" ? (
                        <button
                          className="end-btn"
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedSession(session);
                            setShowEndModal(true);
                          }}
                        >
                          End Session
                        </button>
                      ) : (
                        <span className="closed-text">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={openCreateModal}
        disabled={actionLoading}
        title="Create New Session"
      >
        +
      </button>

      {/* End Session Modal */}
      {showEndModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setShowEndModal(false);
              setSelectedSession(null);
            }
          }}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>End Dining Session</h3>
            <p>
              Are you sure you want to end Session #{selectedSession?.sessionId}?
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                disabled={actionLoading}
                onClick={() => {
                  setShowEndModal(false);
                  setSelectedSession(null);
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                disabled={actionLoading}
                onClick={endSession}
              >
                {actionLoading ? "Ending..." : "End Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!actionLoading) setShowCreateModal(false);
          }}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Dining Session</h3>

            <form onSubmit={createSession}>
              <div className="form-group">
                <label htmlFor="tableId">Table ID</label>
                <input
                  id="tableId"
                  type="number"
                  min="1"
                  value={newSession.tableId}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      tableId: e.target.value,
                    })
                  }
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="createdBy">Created By (User ID)</label>
                <input
                  id="createdBy"
                  type="text"
                  value={newSession.createdBy}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      createdBy: e.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  disabled={actionLoading}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DinningMgmt;