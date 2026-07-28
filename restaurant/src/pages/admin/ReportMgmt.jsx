import React, { useState } from "react";
import "./ReportMgmt.css";

function ReportMgmt() {

    const [reportType, setReportType] = useState("Daily");

    const reports = [
        {
            title: "Today's Revenue",
            value: "Rs. 24,580",
            color: "blue"
        },
        {
            title: "Orders Completed",
            value: "156",
            color: "green"
        },
        {
            title: "Customers Served",
            value: "128",
            color: "orange"
        },
        {
            title: "Average Bill",
            value: "Rs. 485",
            color: "purple"
        }
    ];

    const topSelling = [
        {
            id:1,
            item:"Chicken Biryani",
            sold:85,
            revenue:38250
        },
        {
            id:2,
            item:"Momo",
            sold:70,
            revenue:12600
        },
        {
            id:3,
            item:"Pizza",
            sold:55,
            revenue:35750
        },
        {
            id:4,
            item:"Coffee",
            sold:120,
            revenue:14400
        }
    ];

    return (

        <div className="report-page">

            <div className="report-header">

                <div>

                    <h1>Reports & Analytics</h1>

                    <p>Restaurant business insights and statistics.</p>

                </div>

                <button className="download-btn">

                    Export Report

                </button>

            </div>

            {/* Summary */}

            <div className="report-cards">

                {reports.map((card,index)=>(

                    <div className={`report-card ${card.color}`} key={index}>

                        <h3>{card.title}</h3>

                        <span>{card.value}</span>

                    </div>

                ))}

            </div>

            {/* Filters */}

            <div className="report-toolbar">

                <select
                value={reportType}
                onChange={(e)=>setReportType(e.target.value)}
                >

                    <option>Daily</option>

                    <option>Weekly</option>

                    <option>Monthly</option>

                    <option>Yearly</option>

                </select>

                <button className="generate-btn">

                    Generate Report

                </button>

            </div>

            {/* Chart Placeholder */}

            <div className="chart-placeholder">

                <h2>Sales Overview</h2>

                <div className="fake-chart">

                    <div style={{height:"60%"}}></div>

                    <div style={{height:"90%"}}></div>

                    <div style={{height:"75%"}}></div>

                    <div style={{height:"100%"}}></div>

                    <div style={{height:"80%"}}></div>

                    <div style={{height:"65%"}}></div>

                    <div style={{height:"95%"}}></div>

                </div>

                <p>Replace this placeholder with Chart.js or Recharts.</p>

            </div>

            {/* Top Selling */}

            <div className="report-table">

                <h2>Top Selling Menu Items</h2>

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Menu Item</th>

                            <th>Sold</th>

                            <th>Total Revenue</th>

                        </tr>

                    </thead>

                    <tbody>

                        {topSelling.map(item=>(

                            <tr key={item.id}>

                                <td>{item.id}</td>

                                <td>{item.item}</td>

                                <td>{item.sold}</td>

                                <td>Rs. {item.revenue}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* More Reports */}

            <div className="extra-reports">

                <div className="extra-card">

                    <h3>Inventory Report</h3>

                    <p>Current stock levels and low stock alerts.</p>

                    <button>View</button>

                </div>

                <div className="extra-card">

                    <h3>Payment Report</h3>

                    <p>Cash, eSewa, Khalti and Card summary.</p>

                    <button>View</button>

                </div>

                <div className="extra-card">

                    <h3>Waiter Performance</h3>

                    <p>Orders handled by each waiter.</p>

                    <button>View</button>

                </div>

                <div className="extra-card">

                    <h3>Customer Report</h3>

                    <p>Returning customers and order statistics.</p>

                    <button>View</button>

                </div>

            </div>

        </div>

    );

}

export default ReportMgmt;