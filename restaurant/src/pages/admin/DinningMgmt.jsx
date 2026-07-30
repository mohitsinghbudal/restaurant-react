import React, { useState, useEffect, useCallback } from "react";
import "./DinningMgmt.css";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";

function DinningMgmt() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // End Session Modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Create Session Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Session Form
  const [newSession, setNewSession] = useState({
    tableId: "",
    createdBy: ""
  });

  const baseApi = api();
  const { token } = GetCurrUser();

  /* =============================
          FETCH SESSIONS
  ============================== */

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${baseApi}/Dinning/all`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

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
          FILTERING
  ============================== */

  const filteredSessions = sessions.filter((session) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      session.sessionId
        .toString()
        .includes(searchLower) ||
      session.tableId
        .toString()
        .includes(searchLower);

    const matchesStatus =
      statusFilter === "All" ||
      session.sessionStatus.toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* =============================
          DATE FORMAT
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
    if (!selectedSession) return;

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
    }
  };

  /* =============================
        CREATE DINING SESSION
  ============================== */

  const createSession = async () => {
    try {
      await axios.post(
        `${baseApi}/Dinning/Create-Session`,
        newSession,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      showToast("success", "Dining session created successfully.");

      setShowCreateModal(false);

      setNewSession({
        tableId: "",
        createdBy: ""
      });

      fetchSessions();
    } catch (err) {
      showToast(
  "error",
  err.response?.data?.message || "Unable to create session."
);
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
          disabled={loading}
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
                x => x.sessionStatus.toLowerCase() === "active"
              ).length
            }
          </span>
        </div>

        <div className="dining-card complete-card">
          <h3>Closed</h3>
          <span>
            {
              sessions.filter(
                x => x.sessionStatus.toLowerCase() === "closed"
              ).length
            }
          </span>
        </div>

        <div className="dining-card">
          <h3>Open Sessions</h3>
          <span>
            {
              sessions.filter(
                x => x.endAt === null
              ).length
            }
          </span>
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
          <option>All</option>
          <option>Active</option>
          <option>Closed</option>
        </select>

      </div>

      {/* Table */}

      <div className="dining-table">

        {loading ? (

          <div className="empty">
            Loading dining sessions...
          </div>

        ) : error ? (

          <div
            className="empty"
            style={{ color: "var(--danger)" }}
          >
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

                  <td
                    colSpan="7"
                    className="empty"
                  >
                    No Dining Sessions Found
                  </td>

                </tr>

              ) : (

                filteredSessions.map((session) => (

                  <tr key={session.sessionId}>

                    <td>#{session.sessionId}</td>

                    <td>Table {session.tableId}</td>

                    <td>
                      {formatDateTime(session.startedAt)}
                    </td>

                    <td>
                      {formatDateTime(session.endAt)}
                    </td>

                    <td>

                      <span
                        className={`status ${session.sessionStatus.toLowerCase()}`}
                      >
                        {session.sessionStatus}
                      </span>

                    </td>

                    <td>{session.createdBy}</td>

                    <td>

                      {session.sessionStatus === "Active" ? (

                        <button
                          className="end-btn"
                          onClick={() => {
                            setSelectedSession(session);
                            setShowEndModal(true);
                          }}
                        >
                          End Session
                        </button>

                      ) : (

                        <span className="closed-text">
                          Closed
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        )}

      </div>

      {/* Floating Button */}

      <button
        className="fab"
        onClick={() => setShowCreateModal(true)}
      >
        +
      </button>

      {/* End Session Modal */}

      {showEndModal && (

        <div className="modal-overlay">

          <div className="confirm-modal">

            <h3>End Dining Session</h3>

            <p>

              Are you sure you want to end
              Session #
              {selectedSession?.sessionId}?

            </p>

            <div className="modal-buttons">

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowEndModal(false);
                  setSelectedSession(null);
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={endSession}
              >
                End Session
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Create Session Modal */}

      {showCreateModal && (

        <div className="modal-overlay">

          <div className="confirm-modal">

            <h3>Create Dining Session</h3>

            <div className="form-group">

              <label>Table ID</label>

              <input
                type="number"
                value={newSession.tableId}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    tableId: e.target.value
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>Created By</label>

              <input
                type="number"
                value={newSession.createdBy}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    createdBy: e.target.value
                  })
                }
              />

            </div>

            <div className="modal-buttons">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={createSession}
              >
                Create
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default DinningMgmt;