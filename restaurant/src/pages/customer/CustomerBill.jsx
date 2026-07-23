import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./CustomerBill.css";

function CustomerBill() {
  const baseUrl = api();
  const { token, sessionId: userSessionId } = GetCurrUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID"); // UNPAID | PAID

  // Fetch session ID if not in hook
  const activeSessionId = userSessionId || sessionStorage.getItem("sessionId");

  const loadBillData = async () => {
    if (!activeSessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const activeToken =
        token || sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await axios.get(
        `${baseUrl}/Order/sessionId/${activeSessionId}`,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        }
      );

      setOrders(response.data || []);
    } catch (err) {
      console.error("Error fetching bill data:", err);
      setError("Unable to load bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillData();
  }, [baseUrl, activeSessionId]);

  // Financial Calculations
  const billCalculations = useMemo(() => {
    const subtotal = orders.reduce(
      (sum, item) =>
        sum + (item.totalAmount ?? (item.unitPrice || item.price || 0) * item.quantity),
      0
    );

    const serviceCharge = subtotal * 0.10; // 10% Service Charge
    const vat = (subtotal + serviceCharge) * 0.13; // 13% VAT
    const grandTotal = subtotal + serviceCharge + vat;

    return {
      subtotal,
      serviceCharge,
      vat,
      grandTotal,
    };
  }, [orders]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bill-loading">
        <h2>Generating Your Bill...</h2>
      </div>
    );
  }

  if (!activeSessionId) {
    return (
      <div className="bill-empty">
        <h2>No Active Dining Session Found</h2>
        <p>Please start a dining session or scan a table QR code to view your bill.</p>
      </div>
    );
  }

  return (
    <div className="bill-container">
      {/* Bill Header / Receipt Top */}
      <div className="bill-card" id="printable-bill">
        <div className="bill-header">
          <h1 className="restaurant-name">Gourmet Haven</h1>
          <p className="restaurant-sub">Fine Dining & Hospitality</p>
          <div className="bill-meta">
            <div>
              <strong>Session ID:</strong> #{activeSessionId}
            </div>
            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Itemized Order Table */}
        <div className="bill-items">
          <h3>Order Details</h3>
          {orders.length === 0 ? (
            <p className="no-items">No billed items available for this session.</p>
          ) : (
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, index) => {
                  const price = item.unitPrice || item.price || 0;
                  const itemTotal = item.totalAmount ?? price * item.quantity;

                  return (
                    <tr key={item.orderId || index}>
                      <td>{item.itemName}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">Rs. {price}</td>
                      <td className="text-right">Rs. {itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <hr className="divider" />

        {/* Financial Breakdown */}
        <div className="bill-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {billCalculations.subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Service Charge (10%)</span>
            <span>Rs. {billCalculations.serviceCharge.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>VAT (13%)</span>
            <span>Rs. {billCalculations.vat.toFixed(2)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Grand Total</span>
            <span>Rs. {billCalculations.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Status Badge */}
        <div className="bill-footer">
          <span className={`payment-status ${paymentStatus.toLowerCase()}`}>
            Status: {paymentStatus}
          </span>
          <p className="thank-you">Thank you for dining with us!</p>
        </div>
      </div>

      {/* Action Buttons (Excluded during print) */}
      <div className="bill-actions print-hide">
        <button className="btn-secondary" onClick={handlePrint}>
          🖨️ Print / Save Receipt
        </button>
        <button
          className="btn-primary"
          onClick={() => alert("Please request cash/eSewa payment from your waiter.")}
        >
          💳 Pay at Table
        </button>
      </div>

      {error && <div className="bill-error">{error}</div>}
    </div>
  );
}

export default CustomerBill;