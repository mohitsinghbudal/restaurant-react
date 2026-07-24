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

    const vat = (subtotal ) * 0.13; // 13% VAT
    const grandTotal = subtotal  + vat;

    return {
      subtotal,
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

    // Place this inside CustomerBill() or outside at the top of the file
const postToEsewa = (url, params) => {
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', url);

  Object.keys(params).forEach((key) => {
    const hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  });

  document.body.appendChild(form);
  form.submit();
};



 const payEsewa = async () => {
  try {
    setError(null);
    const activeToken =
      token || sessionStorage.getItem("token") || localStorage.getItem("token");

    if (!activeSessionId) {
      setError("No active session found.");
      return;
    }

    const response = await axios.post(
      `${baseUrl}/Bill/pay/esewa?sessionId=${parseInt(activeSessionId, 10)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    // const response = await axios.post(
    //   `${baseUrl}/Bill/pay/esewa`,
    //   {
    //     SessionId:parseInt(activeSessionId, 10)
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${activeToken}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    const data = response.data;

    // Handle both PascalCase and camelCase property bindings safely
    const paymentUrl = data.paymentUrl || data.PaymentUrl;
    const amount = data.amount ?? data.Amount;                   // e.g. "100.00"
    const taxAmount = data.taxAmount ?? data.TaxAmount;           // e.g. "13.00"
    const totalAmount = data.totalAmount ?? data.TotalAmount;     // e.g. "113.00"
    const transactionUuid = data.transactionUuid || data.TransactionUuid;
    const productCode = data.productCode || data.ProductCode;
    const signature = data.signature || data.Signature;

    if (!paymentUrl) {
      throw new Error("Backend response did not include a valid paymentUrl.");
    }

    // Build eSewa Form payload (total_amount MUST EQUAL amount + tax_amount)
    const esewaFormData = {
      amount: amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${baseUrl}/Bill/pay/esewa/success`,
      failure_url: `${baseUrl}/Bill/pay/esewa/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    console.log("Submitting form to eSewa:", paymentUrl, esewaFormData);

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
        <button
          className="btn-esewa"
          onClick={payEsewa}
        >
          💳 Pay Via Esewa
        </button>
      </div>

      {error && <div className="bill-error">{error}</div>}
    </div>
  );
}

export default CustomerBill;