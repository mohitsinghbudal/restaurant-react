import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ReportMgmt.css";
import api from "../../util/api";
import GetCurrUser from "../../util/GetCurrUser";

function ReportMgmt() {
    const baseURL = api();
    const { token } = GetCurrUser();

    // Default dates (e.g., start of current month to today)
    const getInitialDates = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return {
            start: firstDay.toISOString().split("T")[0],
            end: today.toISOString().split("T")[0]
        };
    };

    const initialDates = getInitialDates();
    const [reportType, setReportType] = useState("Monthly");
    const [startDate, setStartDate] = useState(initialDates.start);
    const [endDate, setEndDate] = useState(initialDates.end);

    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic states matching backend models
    const [financialSummary, setFinancialSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        customersServed: 0,
        averageBill: 0
    });
    const [topSellingItems, setTopSellingItems] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);

    // Configure request options
    const authConfig = React.useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`
        }
    }), [token]);

    // Calculate dates based on preset selection (Daily, Weekly, Monthly, Yearly)
    const handlePresetChange = (type) => {
        setReportType(type);
        const today = new Date();
        let start = new Date();

        switch (type) {
            case "Daily":
                start = today;
                break;
            case "Weekly":
                start.setDate(today.getDate() - 7);
                break;
            case "Monthly":
                start.setDate(1);
                break;
            case "Yearly":
                start = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                break;
        }

        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
    };

    // Fetch dashboard report data from backend
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Prepare query parameters
        const params = { startDate, endDate };

        try {
            const [financialRes, itemsRes, customersRes] = await Promise.all([
                axios.get(`${baseURL}/Report/get-total-financial-order`, { ...authConfig, params }),
                axios.get(`${baseURL}/Report/top-selling-item`, { ...authConfig, params }),
                axios.get(`${baseURL}/Report/top-customer`, { ...authConfig, params })
            ]);


            console.log(financialRes);
            setFinancialSummary(financialRes.data?.response || {
                totalRevenue: 0,
                totalOrders: 0,
                customersServed: 0,
                averageBill: 0
            });
            setTopSellingItems(itemsRes.data?.response || []);
            setTopCustomers(customersRes.data?.response || []);
        } catch (err) {
            console.error("Failed to fetch report data:", err);
            setError("Failed to load dashboard metrics. Please check connection and try again.");
        } finally {
            setLoading(false);
        }
    }, [baseURL, authConfig, startDate, endDate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Handle Excel Export download
    const handleExportExcel = async () => {
        try {
            setDownloading(true);

            const response = await axios.get(`${baseURL}/Report/dashboard/excel`, {
                ...authConfig,
                params: { startDate, endDate },
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `Report_${startDate}_to_${endDate}.xlsx`
            );
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading file:", err);
            alert("Failed to download the Excel report.");
        } finally {
            setDownloading(false);
        }
    };

    const cards = [
        {
            title: "Total Revenue",
            value: `Rs. ${financialSummary.totalRevenue?.toLocaleString() || 0}`,
            color: "blue"
        },
        {
            title: "Orders Completed",
            value: financialSummary.totalOrders || 0,
            color: "green"
        },
        {
            title: "Customers Served",
            value: financialSummary.customersServed || 0,
            color: "orange"
        },
        {
            title: "Average Bill",
            value: `Rs. ${financialSummary.averageBill?.toLocaleString() || 0}`,
            color: "purple"
        }
    ];

    return (
        <div className="report-page">
            <div className="report-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Restaurant business insights and performance metrics.</p>
                </div>

                <button 
                    className="download-btn" 
                    onClick={handleExportExcel}
                    disabled={downloading}
                >
                    {downloading ? "Downloading..." : "Export Report (Excel)"}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Toolbar */}
            <div className="report-toolbar">
                <div className="filter-group">
                    <label>Period Preset:</label>
                    <select
                        value={reportType}
                        onChange={(e) => handlePresetChange(e.target.value)}
                    >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>From:</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setReportType("Custom");
                        }} 
                    />
                </div>

                <div className="filter-group">
                    <label>To:</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setReportType("Custom");
                        }} 
                    />
                </div>

                <button 
                    className="generate-btn" 
                    onClick={fetchDashboardData}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh Data"}
                </button>
            </div>

            {/* Financial Cards */}
            <div className="report-cards">
                {cards.map((card, index) => (
                    <div className={`report-card ${card.color}`} key={index}>
                        <h3>{card.title}</h3>
                        <span>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Top Selling Items Table */}
            <div className="report-table">
                <h2>Top Selling Menu Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Menu Item</th>
                            <th>Quantity Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topSellingItems.length > 0 ? (
                            topSellingItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.itemName || <i>Unnamed Item / Miscellaneous</i>}</td>
                                    <td>{item.totalQuantity}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No top selling items recorded for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Top Customers Table */}
            <div className="report-table" style={{ marginTop: "2rem" }}>
                <h2>Top Customers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User ID / Name</th>
                            <th>Total Spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topCustomers.length > 0 ? (
                            topCustomers.map((cust, index) => (
                                <tr key={cust.userId || index}>
                                    <td>{index + 1}</td>
                                    <td>{cust.fullName || cust.userName || `Customer #${cust.userId || cust.sessionId || index + 1}`}</td>
                                    <td>Rs. {cust.totalSpent?.toLocaleString() || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No customer activity found for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReportMgmt;