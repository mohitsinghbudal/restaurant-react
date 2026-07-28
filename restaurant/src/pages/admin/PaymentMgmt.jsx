import React, { useState } from "react";
import "./PaymentMgmt.css";

function PaymentMgmt() {

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const payments = [
        {
            id: "TXN1001",
            customer: "John Smith",
            amount: 1450,
            method: "eSewa",
            status: "Success",
            date: "2026-07-27",
        },
        {
            id: "TXN1002",
            customer: "Alice",
            amount: 850,
            method: "Cash",
            status: "Success",
            date: "2026-07-27",
        },
        {
            id: "TXN1003",
            customer: "David",
            amount: 1200,
            method: "Khalti",
            status: "Pending",
            date: "2026-07-27",
        },
        {
            id: "TXN1004",
            customer: "Emily",
            amount: 670,
            method: "Card",
            status: "Failed",
            date: "2026-07-27",
        },
    ];

    const filteredPayments = payments.filter(payment => {

        const searchMatch =
            payment.customer.toLowerCase().includes(search.toLowerCase()) ||
            payment.id.toLowerCase().includes(search.toLowerCase());

        const statusMatch =
            status === "All" || payment.status === status;

        return searchMatch && statusMatch;

    });

    return (

        <div className="payment-page">

            <div className="payment-header">

                <div>
                    <h1>Payment Management</h1>
                    <p>Manage and monitor payment transactions.</p>
                </div>

                <button className="export-btn">
                    Export Report
                </button>

            </div>

            <div className="payment-cards">

                <div className="payment-card">
                    <h3>Total Transactions</h3>
                    <span>{payments.length}</span>
                </div>

                <div className="payment-card success-card">
                    <h3>Successful</h3>
                    <span>{payments.filter(x => x.status === "Success").length}</span>
                </div>

                <div className="payment-card pending-card">
                    <h3>Pending</h3>
                    <span>{payments.filter(x => x.status === "Pending").length}</span>
                </div>

                <div className="payment-card failed-card">
                    <h3>Failed</h3>
                    <span>{payments.filter(x => x.status === "Failed").length}</span>
                </div>

            </div>

            <div className="payment-toolbar">

                <input
                    type="text"
                    placeholder="Search transaction..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option>All</option>
                    <option>Success</option>
                    <option>Pending</option>
                    <option>Failed</option>
                </select>

            </div>

            <div className="payment-table">

                <table>

                    <thead>

                        <tr>
                            <th>Transaction ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filteredPayments.length === 0 ?

                            <tr>
                                <td colSpan="7" className="empty">
                                    No Transactions Found
                                </td>
                            </tr>

                            :

                            filteredPayments.map(payment => (

                                <tr key={payment.id}>

                                    <td>{payment.id}</td>

                                    <td>{payment.customer}</td>

                                    <td>Rs. {payment.amount}</td>

                                    <td>{payment.method}</td>

                                    <td>

                                        <span className={`payment-status ${payment.status.toLowerCase()}`}>
                                            {payment.status}
                                        </span>

                                    </td>

                                    <td>{payment.date}</td>

                                    <td>

                                        <button className="view-btn">
                                            View
                                        </button>

                                        <button className="refund-btn">
                                            Refund
                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default PaymentMgmt;