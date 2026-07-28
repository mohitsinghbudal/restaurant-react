import React, { useState } from "react";
import "./DinningMgmt.css";

function DinningMgmt() {

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const sessions = [
        {
            id: 1,
            table: "T-01",
            customer: "John Smith",
            waiter: "Ram",
            guests: 2,
            startTime: "10:15 AM",
            status: "Active"
        },
        {
            id: 2,
            table: "T-03",
            customer: "Alice",
            waiter: "Hari",
            guests: 4,
            startTime: "11:05 AM",
            status: "Completed"
        },
        {
            id: 3,
            table: "VIP-01",
            customer: "David",
            waiter: "Sita",
            guests: 6,
            startTime: "12:00 PM",
            status: "Reserved"
        },
        {
            id: 4,
            table: "T-05",
            customer: "Emily",
            waiter: "Ram",
            guests: 3,
            startTime: "12:30 PM",
            status: "Active"
        }
    ];

    const filteredSessions = sessions.filter(session => {

        const searchMatch =
            session.customer.toLowerCase().includes(search.toLowerCase()) ||
            session.table.toLowerCase().includes(search.toLowerCase());

        const statusMatch =
            statusFilter === "All" || session.status === statusFilter;

        return searchMatch && statusMatch;

    });

    return (

        <div className="dining-page">

            <div className="dining-header">

                <div>

                    <h1>Dining Management</h1>

                    <p>Monitor all active dining sessions.</p>

                </div>

                <button className="refresh-btn">

                    Refresh

                </button>

            </div>

            <div className="dining-cards">

                <div className="dining-card">
                    <h3>Total Sessions</h3>
                    <span>{sessions.length}</span>
                </div>

                <div className="dining-card active-card">
                    <h3>Active</h3>
                    <span>{sessions.filter(x=>x.status==="Active").length}</span>
                </div>

                <div className="dining-card reserve-card">
                    <h3>Reserved</h3>
                    <span>{sessions.filter(x=>x.status==="Reserved").length}</span>
                </div>

                <div className="dining-card complete-card">
                    <h3>Completed</h3>
                    <span>{sessions.filter(x=>x.status==="Completed").length}</span>
                </div>

            </div>

            <div className="dining-toolbar">

                <input
                    type="text"
                    placeholder="Search customer or table..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e)=>setStatusFilter(e.target.value)}
                >
                    <option>All</option>
                    <option>Active</option>
                    <option>Reserved</option>
                    <option>Completed</option>
                </select>

            </div>

            <div className="dining-table">

                <table>

                    <thead>

                        <tr>

                            <th>Session</th>

                            <th>Table</th>

                            <th>Customer</th>

                            <th>Waiter</th>

                            <th>Guests</th>

                            <th>Start Time</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredSessions.length===0 ?

                        <tr>

                            <td colSpan="8" className="empty">

                                No Dining Sessions

                            </td>

                        </tr>

                        :

                        filteredSessions.map(session=>(

                            <tr key={session.id}>

                                <td>#{session.id}</td>

                                <td>{session.table}</td>

                                <td>{session.customer}</td>

                                <td>{session.waiter}</td>

                                <td>{session.guests}</td>

                                <td>{session.startTime}</td>

                                <td>

                                    <span className={`status ${session.status.toLowerCase()}`}>

                                        {session.status}

                                    </span>

                                </td>

                                <td>

                                    <button className="view-btn">

                                        View

                                    </button>

                                    <button className="edit-btn">

                                        Update

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

export default DinningMgmt;