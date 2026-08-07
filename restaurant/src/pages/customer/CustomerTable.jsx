import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

import GetCurrUser from "../../util/GetcurrUser";
import { showToast } from "../../components/showToast";
import api from "../../util/api";
import "./CustomerTables.css";

const ROLE_NAMES = {
  "Customer": "Customer",
  "Admin": "Admin",
};

function TableCard({ table, onBook }) {
  const isAvailable = table?.status?.toLowerCase() === "available" && table?.isActive;
  const statusClass = table?.status?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <div className="table-card">
      <h3 className="table-number">Table #{table.tableNo}</h3>

      <div className="table-details">
        <div className="table-row">
          <span>Status: </span>
          <span className={`status-${statusClass}`}>{table.status}</span>
        </div>

        <div className="table-row">
          <span>Capacity: </span>
          <span>{table.capacity} Persons</span>
        </div>
      </div>

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
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { token, roleId } = GetCurrUser();
  const baseUrl = api();

  const fetchData = useCallback(async () => {
    if (!token) return;

    const authHeader = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      setLoading(true);

      const [tablesRes, bookingsRes] = await Promise.all([
        axios.get(`${baseUrl}/Table/get-all-table`, authHeader),
        axios.get(`${baseUrl}/Table/my-all-bookings`, authHeader),
      ]);

      console.log("Tables Response:", tablesRes.data.alltables.result);
      setTables(tablesRes.data?.alltables?.result || []);
      
      // Setting current bookings from backend response
      setCurrBookings(bookingsRes.data?.bookings || bookingsRes.data?.result || []);
    } catch (err) {
      console.error("Data Fetching Error:", err);
      showToast("error", "Failed to load table data.");
    } finally {
      setLoading(false);
    }
  }, [token, baseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!showScanner) return;

    let scanner;

    try {
      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          showToast("success", "QR Code Scanned");
          try {
            await scanner.clear();
          } catch (e) {
            console.error("Failed to clear scanner on scan:", e);
          }
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
    } catch (err) {
      console.error("Scanner Initialization Error:", err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner on unmount:", error));
      }
    };
  }, [showScanner, navigate]);

  const handleBook = async (table) => {
    if (table.status?.toLowerCase() !== "available" || !table.isActive) {
      showToast("error", "This table is not available.");
      return;
    }

    try {
      const res = await axios.post(
        `${baseUrl}/Table/book-table`,
        JSON.stringify(table.tableNo),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showToast("success", res.data?.message || "Table booked successfully!");
      if (res.data?.sessionid) {
        sessionStorage.setItem("sessionId", res.data.sessionid);
      }

      await fetchData();
      navigate("/customer-menu");
    } catch (err) {
      console.error("Booking Error:", err);
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
        Welcome {ROLE_NAMES[Number(roleId)] || "Guest"}
      </h1>

      <section className="table-list-container">
        <h2 className="table-heading">Available Tables</h2>
        {loading ? (
          <div className="loading-state">Loading tables...</div>
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

      {roles.includes("Customer") && (
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
              <h2 className="booking-heading">Current Booking</h2>
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
        </section>
      )}
    </div>
  );
}

export default Tables;