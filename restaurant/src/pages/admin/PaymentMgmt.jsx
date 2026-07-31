import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./PaymentMgmt.css";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";

function PaymentMgmt() {
    const  baseUrl  = api();
    const { token } = GetCurrUser();

    // Data & API states
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    // Modal state for viewing details
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const authHeader = useMemo(
        () => ({
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        [token]
    );

    useEffect(() => {
        getPayments();
    }, []);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, status]);

    const getPayments = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await axios.get(`${baseUrl}/Payment/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        console.log("Full Response:", res.data);

        // Handle both object wrapper { message: [...] } and direct array [...]
        const paymentData = Array.isArray(res.data) 
            ? res.data 
            : res.data?.message || [];

        setPayments(paymentData);
    } catch (err) {
        console.error("Fetch payments failed:", err);
        setError("Failed to load payment transactions.");
    } finally {
        setLoading(false);
    }
};

    // Filter logic wrapped in useMemo for performance
    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const searchLower = search.toLowerCase();

            const searchMatch =
                !search ||
                payment.transactionUuid?.toLowerCase().includes(searchLower) ||
                payment.paymentGateway?.toLowerCase().includes(searchLower) ||
                payment.gatewayTransactionId?.toLowerCase().includes(searchLower) ||
                payment.billId?.toString().includes(searchLower) ||
                payment.paymentId?.toString().includes(searchLower);

            const statusMatch =
                status === "All" ||
                payment.status?.toLowerCase() === status.toLowerCase();

            return searchMatch && statusMatch;
        });
    }, [payments, search, status]);

    // Paginated subset of filtered items
    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPayments, currentPage]);

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;

    // Export to CSV Functionality
    const exportToCSV = () => {
        if (filteredPayments.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = [
            "Payment ID",
            "Bill ID",
            "Transaction UUID",
            "Gateway Txn ID",
            "Gateway",
            "Amount (Rs.)",
            "Status",
            "Created Date",
            "Updated Date",
        ];

        const rows = filteredPayments.map((p) => [
            p.paymentId || "-",
            p.billId || "-",
            p.transactionUuid || "-",
            p.gatewayTransactionId || "-",
            p.paymentGateway || "-",
            p.amount || 0,
            p.status || "-",
            p.createdDate ? new Date(p.createdDate).toLocaleString() : "-",
            p.updatedDate ? new Date(p.updatedDate).toLocaleString() : "-",
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Payment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="payment-page">
            {/* Header */}
            <div className="payment-header">
                <div>
                    <h1>Payment Management</h1>
                    <p>Manage and monitor payment transactions.</p>
                </div>

                <button className="export-btn" onClick={exportToCSV}>
                    Export Report (.CSV)
                </button>
            </div>

            {/* Summary Cards */}
            <div className="payment-cards">
                <div className="payment-card">
                    <h3>Total Transactions</h3>
                    <span>{payments.length}</span>
                </div>

                <div className="payment-card success-card">
                    <h3>Completed</h3>
                    <span>
                        {payments.filter((x) => x.status === "Completed").length}
                    </span>
                </div>

                <div className="payment-card pending-card">
                    <h3>Pending</h3>
                    <span>
                        {payments.filter((x) => x.status === "Pending").length}
                    </span>
                </div>

                <div className="payment-card failed-card">
                    <h3>Failed</h3>
                    <span>
                        {payments.filter((x) => x.status === "Failed").length}
                    </span>
                </div>
            </div>

            {/* Toolbar Filters */}
            <div className="payment-toolbar">
                <input
                    type="text"
                    placeholder="Search Payment ID, Bill ID, UUID, or Gateway..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>

            {/* Error Message Feedback */}
            {error && <div className="payment-error-msg">{error}</div>}

            {/* Transactions Table */}
            <div className="payment-table">
                <table>
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Bill ID</th>
                            <th>Transaction UUID</th>
                            <th>Gateway Txn ID</th>
                            <th>Gateway</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Updated Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="empty">
                                    Loading payments...
                                </td>
                            </tr>
                        ) : paginatedPayments.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="empty">
                                    No Transactions Found
                                </td>
                            </tr>
                        ) : (
                            paginatedPayments.map((payment) => (
                                <tr key={payment.paymentId}>
                                    <td>{payment.paymentId}</td>
                                    <td>{payment.billId}</td>
                                    <td>{payment.transactionUuid}</td>
                                    <td>{payment.gatewayTransactionId || "-"}</td>
                                    <td>{payment.paymentGateway}</td>
                                    <td>Rs. {payment.amount}</td>
                                    <td>
                                        <span
                                            className={`payment-status ${payment.status?.toLowerCase()}`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>
                                        {payment.createdDate
                                            ? new Date(payment.createdDate).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {payment.updatedDate
                                            ? new Date(payment.updatedDate).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        <button
                                            className="view-btn"
                                            onClick={() => setSelectedPayment(payment)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredPayments.length > itemsPerPage && (
                <div className="payment-pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Detail View Modal */}
            {selectedPayment && (
                <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Payment Details</h2>
                        <hr />
                        <div className="modal-details">
                            <p><strong>Payment ID:</strong> {selectedPayment.paymentId}</p>
                            <p><strong>Bill ID:</strong> {selectedPayment.billId}</p>
                            <p><strong>Transaction UUID:</strong> {selectedPayment.transactionUuid}</p>
                            <p><strong>Gateway Txn ID:</strong> {selectedPayment.gatewayTransactionId || "N/A"}</p>
                            <p><strong>Gateway:</strong> {selectedPayment.paymentGateway}</p>
                            <p><strong>Amount:</strong> Rs. {selectedPayment.amount}</p>
                            <p><strong>Status:</strong> {selectedPayment.status}</p>
                            <p>
                                <strong>Created Date:</strong>{" "}
                                {selectedPayment.createdDate
                                    ? new Date(selectedPayment.createdDate).toLocaleString()
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>Updated Date:</strong>{" "}
                                {selectedPayment.updatedDate
                                    ? new Date(selectedPayment.updatedDate).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedPayment(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentMgmt;