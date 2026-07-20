import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import { Html5QrcodeScanner } from "html5-qrcode";
import { showToast } from "../components/showToast";

function Tables() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { token, roleId } = GetCurrUser();

  useEffect(() => {
    if (!token) {
      showToast("error", "Unauthorized user");
      return;
    }

    switch (roleId) {
      case 5:
        showToast("success", "Welcome Admin!");
        break;
      case 1:
        showToast("success", "Welcome Customer!");
        break;
      default:
        showToast("info", "Welcome Guest!");
        break;
    }
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

  return (
    <div>
      <h1>Welcome {roleName}</h1>
      
      {!showScanner && (
        <button onClick={OpenCamera}>Scan Table QR</button>
      )}

      {showScanner && (
        <div id="reader" style={{ width: "350px", marginTop: "20px" }}></div>
      )}
    </div>
  );
}

export default Tables;