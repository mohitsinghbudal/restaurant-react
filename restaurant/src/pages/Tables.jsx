import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import { Html5QrcodeScanner } from "html5-qrcode";
import { showToast } from "../components/showToast";
import api from "../util/api";
import axios from "axios";
import "./Tables.css";

function Tables() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { token, roleId } = GetCurrUser();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!token ) {
      return;
    }

    const fetchTables = async () => {
      try {
        const baseUrl = api();
        const res = await axios.get(`${baseUrl}/Table/get-all-table`);
        setTables(res.data.alltables.result);
        console.log(res.data);
      } catch (err) {
        console.error(err);
        showToast("error", "Failed to load tables.");
      }
    };

    fetchTables();

  }, [token, roleId]);

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
        showToast("success", "QR Code Scanned!");
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
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, [showScanner, navigate]);

  const OpenCamera = () => {
    setShowScanner(true);
  };

  if (!token) {
    return (
      <div>
        <h1>Please Login to get here</h1>
      </div>
    );
  }

  const roleNames = {
    5: "Admin",
    1: "Customer",
  };
  const roleName = roleNames[roleId] || "Guest";

  if (roleId === 1) {
  return (
    <div className="tables-container">
      <h1 className="tables-title">Welcome {roleName}</h1>

      {!showScanner && (
        <button className="scan-btn" onClick={OpenCamera}>
          Scan Table QR
        </button>
      )}

      {showScanner && (
        <div className="scanner-container">
          <div id="reader"></div>
        </div>
      )}
    </div>
  );
}else if (roleId === 5) {
  return (
    <div className="tables-container">
      <h1 className="tables-title">Welcome {roleName}</h1>

      <div className="table-list-container">
        <h2 className="table-heading">All Tables</h2>

        <div className="table-grid">
          {tables.map((table, index) => (
            <div
              className="table-card"
              key={table.tableId || table._id || index}
            >
              <h3 className="table-number">
                Table No : {table.tableNo || "N/A"}
              </h3>

              <p>
                <strong>Capacity:</strong> {table.capacity || "N/A"}
              </p>
              
              <p>
                <strong>Status:</strong> {table.status || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} else {
   return (
  <div className="tables-container">
    <h1 className="tables-title">Please Login</h1>
  </div>
);
  }
}

export default Tables;