import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../util/api";
import GetCurrUser from "../../util/GetcurrUser";
import "./CustomerBill.css";

// Helper function to submit eSewa POST form with DOM cleanup
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

  // Clean up dynamic DOM elements after redirection trigger
  setTimeout(() => {
    if (document.body.contains(form)) {
      document.body.removeChild(form);
    }
  }, 1000);
};

function CustomerBill() {
  const baseUrl = api();
  const currentUser = GetCurrUser() || {};
  const activeToken = currentUser.token || sessionStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID"); // UNPAID | CASH_REQUESTED | PAID
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bill, setBill] = useState(null);

  // Retrieve Bill details (BillNo, Invoice, etc.)
  const fetchBill = useCallback(
    async (sId) => {
      if (!sId) return;
      try {
        const res = await axios.get(`${baseUrl}/Bill/view-bill`, {
          params: { sessionId: sId },
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        console.log("Fetched Bill:", res.data);
        setBill(res.data);
      } catch (err) {
        console.error("Error fetching bill information:", err);
      }
    },
    [baseUrl, activeToken]
  );

  useEffect(() => {
    let isMounted = true;

    const loadCustomerData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Active Dining Session
        const sessionRes = await axios.get(`${baseUrl}/Dinning/my-id`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        const fetchedSessionId =
          typeof sessionRes.data === "object"
            ? sessionRes.data?.sessionId || sessionRes.data?.id
            : sessionRes.data;

        if (!isMounted) return;
        setSessionId(fetchedSessionId);
        console.log("Fetched Session ID:", fetchedSessionId);

        if (fetchedSessionId) {
          // Fetch existing bill details
          fetchBill(fetchedSessionId);

          // 2. Fetch Itemized Orders for Active Session
          const billRes = await axios.get(
            `${baseUrl}/Order/sessionId/${fetchedSessionId}`,
            {
              headers: { Authorization: `Bearer ${activeToken}` },
            }
          );

          if (isMounted) {
            const rawData = billRes.data;

            // Safe array normalization to prevent orders.reduce / orders.filter runtime errors
            if (Array.isArray(rawData)) {
              setOrders(rawData);
            } else if (Array.isArray(rawData?.data)) {
              setOrders(rawData.data);
            } else if (Array.isArray(rawData?.$values)) {
              setOrders(rawData.$values);
            } else {
              setOrders([]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading bill data:", err);
        if (isMounted) {
          setError("Unable to retrieve bill details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (activeToken) {
      loadCustomerData();
    } else {
      setLoading(false);
      setError("Authentication token missing. Please log in.");
    }

    return () => {
      isMounted = false;
    };
  }, [baseUrl, activeToken, fetchBill]);

  // Safe filter for COMPLETED orders
  const completedOrders = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders.filter(
      (item) => (item.orderStatus || item.OrderStatus) === "Completed"
    );
  }, [orders]);

  // Safe financial calculations based ONLY on completed items
  const billCalculations = useMemo(() => {
    const safeCompletedOrders = Array.isArray(completedOrders)
      ? completedOrders
      : [];

    const subtotal = safeCompletedOrders.reduce((sum, item) => {
      const price = item.unitPrice || item.price || 0;
      const total = item.totalAmount ?? price * (item.quantity || 1);
      return sum + total;
    }, 0);

    const vat = subtotal * 0.13;
    const grandTotal = subtotal + vat;

    return { subtotal, vat, grandTotal };
  }, [completedOrders]);

  const handlePrint = () => {
    window.print();
  };

  // Cash Payment Handler
  const handleCashPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      if (!sessionId) {
        setError("No active session found.");
        return;
      }

      const nowIso = new Date().toISOString();
      const userId = currentUser.id || currentUser.userId || 0;

      const cashPayload = {
        billNo: bill?.billNo || 0,
        billAmount: billCalculations.grandTotal,
        sessionId: parseInt(sessionId, 10),
        paymentMethod: "CASH",
        updatedDate: nowIso,
        paidAt: nowIso,
        paidBy: userId,
      };

      await axios.post(`${baseUrl}/Bill/pay/cash`, cashPayload, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json",
        },
      });

      setPaymentStatus("CASH_REQUESTED");
    } catch (err) {
      console.error("Cash payment request error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to request cash payment. Please inform your server.";
      setError(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // eSewa Payment Handler
  const payEsewa = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      if (!sessionId) {
        setError("No active session found.");
        return;
      }

      const response = await axios.post(
        `${baseUrl}/Bill/pay/esewa?req=${parseInt(sessionId, 10)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
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
      const successUrl = data.SuccessUrl || `${baseUrl}/Bill/pay/esewa/success`;
      const failureUrl = data.failureUrl || `${baseUrl}/Bill/pay/esewa/failure`;

      if (!paymentUrl) {
        throw new Error(
          "Backend response did not include a valid payment URL."
        );
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

      setError(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bill-container">
      {/* Loading State */}
      {loading && (
        <div className="bill-card bill-state-box">
          <h2>Generating Your Bill...</h2>
          <p>Please wait while we prepare your invoice.</p>
        </div>
      )}

      {/* Empty / No Session State */}
      {!loading && !sessionId && (
        <div className="bill-card bill-state-box">
          <h2>No Active Dining Session</h2>
          <p>Please start a session or scan a table QR code to view your bill.</p>
          {error && <div className="bill-error">{error}</div>}
        </div>
      )}

      {/* Active Bill Display */}
      {!loading && sessionId && (
        <>
          <div className="bill-card" id="printable-bill">
            <div className="bill-header">
              <h1 className="restaurant-name">Gourmet Haven</h1>
              <p className="restaurant-sub">Fine Dining & Hospitality</p>
              <div className="bill-meta">
                <div>
                  <strong>Bill No:</strong> #{bill?.billNo || "N/A"}
                </div>
                <div>
                  <strong>Session ID:</strong> #{sessionId}
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
              {completedOrders.length === 0 ? (
                <p className="no-items">
                  No completed items available for this session bill yet.
                </p>
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
                    {completedOrders.map((item, index) => {
                      const price = item.unitPrice || item.price || 0;
                      const itemTotal =
                        item.totalAmount ?? price * (item.quantity || 1);

                      return (
                        <tr key={item.orderId || item.id || index}>
                          <td>
                            {item.itemName || `Menu Item #${item.menuId}`}
                          </td>
                          <td className="text-center">{item.quantity || 1}</td>
                          <td className="text-right">Rs. {price.toFixed(2)}</td>
                          <td className="text-right">
                            Rs. {itemTotal.toFixed(2)}
                          </td>
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
                Status: {paymentStatus.replace("_", " ")}
              </span>
              {paymentStatus === "CASH_REQUESTED" && (
                <p className="cash-notice">
                  🔔 Cash payment requested. A server will arrive at your table shortly to collect payment.
                </p>
              )}
              <p className="thank-you">Thank you for dining with us!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bill-actions print-hide">
            <button
              className="btn-secondary"
              onClick={handlePrint}
              disabled={isProcessing}
            >
              🖨️ Print Receipt
            </button>

            <button
              className="btn-primary"
              onClick={handleCashPayment}
              disabled={isProcessing || paymentStatus === "CASH_REQUESTED"}
            >
              💵 {paymentStatus === "CASH_REQUESTED" ? "Cash Requested" : "Pay Cash at Table"}
            </button>

            <button
              className="btn-esewa"
              onClick={payEsewa}
              disabled={isProcessing || completedOrders.length === 0}
            >
              💳 Pay via eSewa
            </button>
          </div>

          {error && <div className="bill-error">{error}</div>}
        </>
      )}
    </div>
  );
}

export default CustomerBill;