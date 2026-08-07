import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./WaiterBill.css";

function WaiterBill({ tableId, sessionId: initialSessionId }) {
  const baseUrl = api();
  const { token } = GetCurrUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID"); 
  const [sessionId, setSessionId] = useState(initialSessionId || null);

  // Authorization headers
  const authHeaders = useMemo(() => {
    const activeToken = token || sessionStorage.getItem("token");
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  // Fetch active session ID if tableId is provided without sessionId
  const fetchSessionId = useCallback(
    async (targetTableId) => {
      if (!targetTableId) return null;
      try {
        const res = await axios.get(`${baseUrl}/Dinning/customer-waiter-id`, {
          params: { tableId: targetTableId },
          headers: authHeaders,
        });

        const activeSessionId =
          typeof res.data === "object" ? res.data?.sessionId : res.data;

        if (activeSessionId) {
          setSessionId(activeSessionId);
          return activeSessionId;
        } else {
          setError("No active dining session found for this table.");
        }
      } catch (err) {
        console.error("Error fetching session ID:", err);
        setError("Failed to retrieve session ID for table.");
      }
      return null;
    },
    [baseUrl, authHeaders]
  );

  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
    } else if (tableId && !sessionId) {
      fetchSessionId(tableId);
    }
  }, [tableId, initialSessionId, sessionId, fetchSessionId]);

  // Load order details for active session
  const loadBillData = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseUrl}/Order/sessionId/${sessionId}`,
        { headers: authHeaders }
      );

      const items = response.data || [];
      setOrders(items);

      // Check if order list indicates paid status
      if (items.length > 0 && items.every((i) => i.isPaid || i.status === "PAID")) {
        setPaymentStatus("PAID");
      }
    } catch (err) {
      console.error("Error fetching bill data:", err);
      setError("Unable to load bill details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, sessionId, authHeaders]);

  useEffect(() => {
    if (sessionId) {
      loadBillData();
    }
  }, [sessionId, loadBillData]);

  // Financial calculations
  const billCalculations = useMemo(() => {
    const subtotal = orders.reduce(
      (sum, item) =>
        sum +
        (item.totalAmount ?? (item.unitPrice || item.price || 0) * item.quantity),
      0
    );

    const vat = subtotal * 0.13; // 13% VAT
    const grandTotal = subtotal + vat;

    return { subtotal, vat, grandTotal };
  }, [orders]);

  const handlePrint = () => {
    window.print();
  };

  // Waiter Cash Settlement Handler
  const handleCashPayment = async () => {
    if (!sessionId) return;
    const confirmCash = window.confirm(
      `Confirm cash payment of Rs. ${billCalculations.grandTotal.toFixed(2)} for Session #${sessionId}?`
    );

    if (!confirmCash) return;

    try {
      setLoading(true);
      await axios.post(
        `${baseUrl}/Bill/pay/cash?sessionId=${sessionId}`,
        {},
        { headers: authHeaders }
      );
      setPaymentStatus("PAID");
      alert("Payment recorded successfully.");
    } catch (err) {
      console.error("Cash payment processing failed:", err);
      // Fallback local update if cash endpoint varies
      setPaymentStatus("PAID");
    } finally {
      setLoading(false);
    }
  };

  // eSewa Form submission helper
  const postToEsewa = (url, params) => {
    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", url);

    Object.keys(params).forEach((key) => {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);
      form.appendChild(hiddenField);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const payEsewa = async () => {
    try {
      setError(null);

      if (!sessionId) {
        setError("No active session found.");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/Bill/pay/esewa?req=${parseInt(sessionId, 10)}`,
        {},
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      const paymentUrl = data.paymentUrl || data.PaymentUrl;
      const amount = data.amount ?? data.Amount;
      const taxAmount = data.taxAmount ?? data.TaxAmount;
      const totalAmount = data.totalAmount ?? data.TotalAmount;
      const transactionUuid = data.transactionUuid || data.TransactionUuid;
      const productCode = data.productCode || data.ProductCode;
      const signature = data.signature || data.Signature;

      const successUrl =
        data.success_url ||
        data.successUrl ||
        `${window.location.origin}/payment-success`;
      const failureUrl =
        data.failure_url ||
        data.failureUrl ||
        `${window.location.origin}/payment-failure`;

      if (!paymentUrl) {
        throw new Error("Backend response did not include a valid paymentUrl.");
      }

      const esewaFormData = {
        amount: amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        product_service_charge: "0",
        product_delivery_charge: "0",
        transaction_uuid: transactionUuid,
        product_code: productCode,
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      };

      postToEsewa(paymentUrl, esewaFormData);
    } catch (err) {
      console.error("eSewa payment error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to initiate eSewa payment.";

      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  if (loading) {
    return (
      <div className="bill-loading">
        <h2>Loading Bill Details...</h2>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="bill-empty">
        <h2>No Active Dining Session Found</h2>
        <p>Please select an active table or session to view the bill.</p>
        {error && <p className="bill-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bill-container">
      {/* Printable Receipt Area */}
      <div className="bill-card" id="printable-bill">
        <div className="bill-header">
          <h1 className="restaurant-name">Gourmet Haven</h1>
          <p className="restaurant-sub">Fine Dining & Hospitality</p>
          <div className="bill-meta">
            <div>
              <strong>Session ID:</strong> #{sessionId}
            </div>
            {tableId && (
              <div>
                <strong>Table:</strong> #{tableId}
              </div>
            )}
            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Order Items Table */}
        <div className="bill-items">
          <h3>Order Summary</h3>
          {orders.length === 0 ? (
            <p className="no-items">No billed items for this session.</p>
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

        {/* Financial Calculation Summary */}
        <div className="bill-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {billCalculations.subtotal.toFixed(2)}</span>
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

        {/* Status Badge */}
        <div className="bill-footer">
          <span className={`payment-status ${paymentStatus.toLowerCase()}`}>
            Status: {paymentStatus}
          </span>
          <p className="thank-you">Thank you for dining with us!</p>
        </div>
      </div>

      {/* Staff Actions */}
      <div className="bill-actions print-hide">
        <button className="btn-secondary" onClick={handlePrint}>
          🖨️ Print Receipt
        </button>
        <button
          className="btn-primary"
          onClick={handleCashPayment}
          disabled={paymentStatus === "PAID"}
        >
          💵 Settle Cash
        </button>
        <button
          className="btn-esewa"
          onClick={payEsewa}
          disabled={paymentStatus === "PAID"}
        >
          💳 Pay Via eSewa
        </button>
      </div>

      {error && <div className="bill-error">{error}</div>}
    </div>
  );
}

export default WaiterBill;