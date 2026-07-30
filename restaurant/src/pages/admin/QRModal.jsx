import React, { useEffect, useState } from "react";
import axios from "axios";
import GetCurrUser from "../../util/GetcurrUser";
import api from "../../util/api";

function QRModal({ open, table, onClose }) {
  const [qrURL, setQrURL] = useState("");

  const { token } = GetCurrUser();
  const baseURL = api();

  useEffect(() => {
    if (!open || !table) return;

    const fetchQR = async () => {
      try {
        const res = await axios.get(
          `${baseURL}/Table/qrcode/${table.tableNo}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
            responseType: "blob", // API returns image
          }
        );

        const imageUrl = URL.createObjectURL(res.data);
        setQrURL(imageUrl);
      } catch (err) {
        console.error(err);
        setQrURL("");
      }
    };

    fetchQR();

    return () => {
      if (qrURL) {
        URL.revokeObjectURL(qrURL);
      }
    };
  }, [open, table, token, baseURL]);

  if (!open || !table) return null;

  const downloadQR = () => {
    if (!qrURL) return;

    const link = document.createElement("a");
    link.href = qrURL;
    link.download = `Table-${table.tableNo}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="qr-modal">
        <h2>Table QR Code</h2>

        <div className="qr-details">
          <p>
            <strong>Table No:</strong> {table.tableNo}
          </p>

          <p>
            <strong>Capacity:</strong> {table.capacity} Person(s)
          </p>

          <p>
            <strong>Status:</strong> {table.status}
          </p>
        </div>

        <div className="qr-image-container">
          {qrURL ? (
            <img
              src={qrURL}
              alt="QR Code"
              className="qr-image"
            />
          ) : (
            <div className="no-qr">
              QR Code Not Available
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Close
          </button>

          {qrURL && (
            <button
              className="confirm-btn"
              onClick={downloadQR}
            >
              Download QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRModal;