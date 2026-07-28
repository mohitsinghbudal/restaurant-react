import React, { useState } from "react";
import "./BillsMgmt.css";

function BillsMgmt() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const bills = [
    {
      id: 1001,
      customer: "John Smith",
      table: "T-01",
      amount: 1450,
      payment: "Paid",
      method: "eSewa",
      date: "2026-07-26",
    },
    {
      id: 1002,
      customer: "Alice",
      table: "T-02",
      amount: 980,
      payment: "Pending",
      method: "-",
      date: "2026-07-26",
    },
    {
      id: 1003,
      customer: "David",
      table: "T-05",
      amount: 2250,
      payment: "Paid",
      method: "Cash",
      date: "2026-07-26",
    },
    {
      id: 1004,
      customer: "Emily",
      table: "T-07",
      amount: 670,
      payment: "Cancelled",
      method: "-",
      date: "2026-07-26",
    },
  ];

  const filteredBills = bills.filter((bill) => {

    const matchesSearch =
      bill.customer.toLowerCase().includes(search.toLowerCase()) ||
      bill.table.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || bill.payment === filter;

    return matchesSearch && matchesFilter;

  });

  return (
    <div className="bill-page">

      <div className="bill-header">

        <div>
          <h1>Bills Management</h1>
          <p>Manage restaurant bills and payments.</p>
        </div>

        <button className="create-bill-btn">
          Generate Bill
        </button>

      </div>

      <div className="bill-cards">

        <div className="bill-card">
          <h3>Total Bills</h3>
          <span>{bills.length}</span>
        </div>

        <div className="bill-card green">
          <h3>Paid Bills</h3>
          <span>{bills.filter(x=>x.payment==="Paid").length}</span>
        </div>

        <div className="bill-card orange">
          <h3>Pending Bills</h3>
          <span>{bills.filter(x=>x.payment==="Pending").length}</span>
        </div>

        <div className="bill-card blue">
          <h3>Total Revenue</h3>
          <span>
            Rs.
            {bills
              .filter(x=>x.payment==="Paid")
              .reduce((a,b)=>a+b.amount,0)}
          </span>
        </div>

      </div>

      <div className="bill-toolbar">

        <input
          type="text"
          placeholder="Search customer or table..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>

      </div>

      <div className="bill-table">

        <table>

          <thead>

          <tr>
            <th>Bill ID</th>
            <th>Customer</th>
            <th>Table</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>

          </thead>

          <tbody>

          {filteredBills.length===0?

          <tr>
            <td colSpan="8" className="empty">
              No Bills Found
            </td>
          </tr>

          :

          filteredBills.map((bill)=>(

            <tr key={bill.id}>

              <td>#{bill.id}</td>

              <td>{bill.customer}</td>

              <td>{bill.table}</td>

              <td>Rs. {bill.amount}</td>

              <td>{bill.method}</td>

              <td>

                <span className={`payment ${bill.payment.toLowerCase()}`}>
                  {bill.payment}
                </span>

              </td>

              <td>{bill.date}</td>

              <td>

                <button className="view-btn">
                  View
                </button>

                <button className="print-btn">
                  Print
                </button>

                <button className="pay-btn">
                  Paid
                </button>

              </td>

            </tr>

          ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BillsMgmt;