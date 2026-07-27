import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";
import api from "../../util/api";
import "./CustomerTables.css";

const ROLE_NAMES = {
  1: "Customer",
  5: "Admin",
};

function TableCard({ table, onBook }) {
  const isAvailable = table?.status?.toLowerCase() === "available" && table?.isActive;
  const statusClass = table?.status?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <div className="table-card">
      <h3 className="table-number">Table #{table.tableNo}</h3>

      <p>
        <strong>Capacity:</strong> {table.capacity}
      </p>

      <p>
        <div className="table-row">
    <span>Status</span>
    <span className={`status-${statusClass}`}>
        {table.status}
    </span>
</div>

<div className="table-row">
    <span>Capacity</span>
    <span>{table.capacity} Persons</span>
</div>

<div className="table-row">
    <span>Availability</span>

    <span
        className={
            table.isActive
                ? "availability available"
                : "availability unavailable"
        }
    >
        {table.isActive ? "Available" : "Unavailable"}
    </span>
</div>{" "}
        <span className={`status-${statusClass}`}>
          {table.status}
        </span>
      </p>

      <p>
        <strong>Availability:</strong>{" "}
        <span className={table.isActive ? "availability available" : "availability unavailable"}>
          {table.isActive ? "Available" : "Unavailable"}
        </span>
      </p>

      {isAvailable ? (
        <button className="book-btn" onClick={() => onBook(table)}>
          Book Now
        </button>
      ) : (
        <button className="book-btn disabled" disabled>
          {!table.isActive ? "Unavailable" : table.status}
        </button>
      )}
    </div>
  );
}

function Tables() {
  const [showScanner, setShowScanner] = useState(false);
  const [tables, setTables] = useState([]);
  const [currBookings, setCurrBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { token, roleId, userId } = GetCurrUser();
  const baseUrl = api();


  const fetchData = async () => {
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    setLoading(true);

    const [tablesRes, currentRes, historyRes] = await Promise.all([
      axios.get(`${baseUrl}/Table/get-all-table`, authHeader),
      axios.get(`${baseUrl}/Table/my-active-bookings`, authHeader),
      axios.get(`${baseUrl}/Table/my-all-bookings`, authHeader),
    ]);

    setTables(tablesRes.data.alltables.result || []);
    setCurrBookings(currentRes.data.bookings || []);
    setAllBookings(historyRes.data.bookings || []);
  } catch (err) {
    console.error(err);
    showToast("error", "Failed to load data.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (token) {
    fetchData();
  }
}, [token]);

  useEffect(() => {
    if (!token) return;

    fetchData();
  }, [token, baseUrl]);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        showToast("success", "QR Code Scanned");
        scanner.clear();
        setShowScanner(false);

        try {
          const url = new URL(decodedText);
          const tableId = url.pathname.split("/").pop();
          navigate(`/table/${tableId}`);
        } catch {
          navigate(`/table/${decodedText}`);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [showScanner, navigate]);

  const handleBook = async (table) => {
  if (
    table.status.toLowerCase() !== "available" ||
    !table.isActive
  ) {
    showToast("error", "This table is not available.");
    return;
  }

  try {
    const res = await axios.post(
      `${baseUrl}/Table/book-table`,
      table.tableNo,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    showToast("success", res.data.message);
    sessionStorage.setItem("sessionId", res.data.sessionid);
    await fetchData();

    navigate("/customer-menu");
  } catch (err) {
    console.error(err);

    showToast(
      "error",
      err.response?.data?.message || "Failed to book table."
    );
  }
};

  if (!token) {
    return (
      <div className="tables-container">
        <h1 className="tables-title">Please Login</h1>
        <p className="tables-title-link" onClick={() => navigate("/login")}>
          Click here to redirect to Login Page
        </p>
      </div>
    );
  }

  return (
    <div className="tables-container">
      <h1 className="tables-title">
        Welcome {ROLE_NAMES[roleId] || "Guest"}
      </h1>

      <section className="table-list-container">
        <h2 className="table-heading">Available Tables</h2>
        {loading ? (
          <div className="loading-state">
  Loading tables...
</div>
        ) : (
          <div className="table-grid">
            {tables.map((table, index) => (
              <TableCard
                key={table.tableId || table._id || index}
                table={table}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </section>

      {Number(roleId) === 1 && (
        <section className="scanner-section">
          <p className="tables-subtitle">
            Scan the QR code placed on your table to start ordering.
          </p>

          {!showScanner ? (
            <button className="scan-btn" onClick={() => setShowScanner(true)}>
              Scan Table QR
            </button>
          ) : (
            <div className="scanner-container">
              <div id="reader"></div>
            </div>
          )}

          {currBookings.length > 0 && (
            <div className="booking-group">
              <h2 className="booking-heading">
                Current Booking
              </h2>
              <div className="table-grid">
                {currBookings.map((table, index) => (
                  <TableCard
                    key={table.tableId || table._id || `curr-${index}`}
                    table={table}
                    onBook={handleBook}
                  />
                ))}
              </div>
            </div>
          )}

          {allBookings.length > 0 && (
            <div className="booking-group">
              <h2 className="booking-heading">
                   Booking History
              </h2>
              <div className="table-grid">
                {allBookings.map((table, index) => (
                  <TableCard
                    key={table.tableId || table._id || `all-${index}`}
                    table={table}
                    onBook={handleBook}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Tables;

