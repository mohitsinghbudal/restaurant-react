import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import "./BillsMgmt.css";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";
import { showToast } from "../../components/showToast";

function BillsMgmt() {
  const baseApi = api();
  const { token } = GetCurrUser();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${baseApi}/Bill/all-bills`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setBills(res.data?.allbills ?? []);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load bills.");
    } finally {
      setLoading(false);
    }
  }, [baseApi, token]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Derived filtered bill list
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const query = search.trim().toLowerCase();
      const status = bill.isPaid ? "paid" : "pending";

      const matchesSearch =
        !query ||
        String(bill.billId ?? "").toLowerCase().includes(query) ||
        String(bill.billNo ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || status === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [bills, search, filter]);

  // Derived statistics (Memoized for performance)
  const paidBills = useMemo(
    () => bills.filter((bill) => bill.isPaid),
    [bills]
  );

  const pendingBills = useMemo(
    () => bills.filter((bill) => !bill.isPaid),
    [bills]
  );

  const totalRevenue = useMemo(() => {
    return paidBills.reduce((sum, bill) => {
      const amount =
        Number(
          bill.grandTotal > 0 ? bill.grandTotal : bill.totalAmount
        ) || 0;

      return sum + amount;
    }, 0); // Fixed: set initial value to 0 instead of []
  }, [paidBills]);

  return (
    <div className="bill-page">
      <div className="bill-header">
        <div>
          <h1>Bills Management</h1>
          <p>Manage restaurant bills and payments.</p>
        </div>

        <button
          className="create-bill-btn"
          onClick={fetchBills}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bill-cards">
        <div className="bill-card">
          <h3>Total Bills</h3>
          <span>{bills.length}</span>
        </div>

        <div className="bill-card green">
          <h3>Paid Bills</h3>
          <span>{paidBills.length}</span>
        </div>

        <div className="bill-card orange">
          <h3>Pending Bills</h3>
          <span>{pendingBills.length}</span>
        </div>

        <div className="bill-card blue">
          <h3>Total Revenue</h3>
          <span>Rs. {totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="bill-toolbar">
        <input
          type="text"
          placeholder="Search Bill ID or Bill No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="bill-table">
        <table>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Bill Amount</th>
              <th>Status</th>
              <th>Bill Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty">
                  Loading Bills...
                </td>
              </tr>
            ) : filteredBills.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
                  No Bills Found
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => {
                const amount =
                  bill.grandTotal > 0
                    ? bill.grandTotal
                    : bill.totalAmount;

                return (
                  <tr key={bill.billId}>
                    <td>#{bill.billId}</td>

                    <td>Rs. {amount?.toLocaleString() ?? 0}</td>

                    <td>
                      <span
                        className={`payment ${
                          bill.isPaid ? "paid" : "pending"
                        }`}
                      >
                        {bill.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>

                    <td>
                      {bill.createdDate
                        ? new Date(bill.createdDate).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedBill(bill)}
                      >
                        View All Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div
          className="bill-modal-overlay"
          onClick={() => setSelectedBill(null)}
        >
          <div
            className="bill-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Bill Details</h2>

              <button
                className="close-btn"
                onClick={() => setSelectedBill(null)}
              >
                ✕
              </button>
            </div>

            <div className="bill-details">
              <div className="detail-row">
                <span>Bill ID</span>
                <strong>{selectedBill.billId ?? "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Bill Number</span>
                <strong>{selectedBill.billNo ?? "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Session ID</span>
                <strong>{selectedBill.sessionId ?? "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Total Amount</span>
                <strong>
                  Rs. {selectedBill.totalAmount?.toLocaleString() ?? 0}
                </strong>
              </div>

              <div className="detail-row">
                <span>Tax Amount</span>
                <strong>
                  Rs. {selectedBill.taxAmount?.toLocaleString() ?? 0}
                </strong>
              </div>

              <div className="detail-row">
                <span>Discount</span>
                <strong>
                  Rs. {selectedBill.discountAmount?.toLocaleString() ?? 0}
                </strong>
              </div>

              <div className="detail-row">
                <span>Grand Total</span>
                <strong>
                  Rs. {selectedBill.grandTotal?.toLocaleString() ?? 0}
                </strong>
              </div>

              <div className="detail-row">
                <span>Payment Method</span>
                <strong>
                  {selectedBill.paymentMethod || "N/A"}
                </strong>
              </div>

              <div className="detail-row">
                <span>Status</span>
                <strong
                  className={
                    selectedBill.isPaid ? "paid-text" : "pending-text"
                  }
                >
                  {selectedBill.isPaid ? "Paid" : "Pending"}
                </strong>
              </div>

              <div className="detail-row">
                <span>Created Date</span>
                <strong>
                  {selectedBill.createdDate
                    ? new Date(selectedBill.createdDate).toLocaleString()
                    : "-"}
                </strong>
              </div>

              <div className="detail-row">
                <span>Paid At</span>
                <strong>
                  {selectedBill.paidAt
                    ? new Date(selectedBill.paidAt).toLocaleString()
                    : "-"}
                </strong>
              </div>

              <div className="detail-row">
                <span>Paid By</span>
                <strong>{selectedBill.paidBy || "-"}</strong>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setSelectedBill(null)}
              >
                Close
              </button>

              <button
                className="print-btn"
                onClick={() => window.print()}
              >
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillsMgmt;