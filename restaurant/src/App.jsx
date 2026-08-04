import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom"; 
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import GetCurrUser from "./util/GetcurrUser";
import Menu from "./pages/Guest/GuestMenu";
import Table from "./pages/Customer/CustomerTable";
import CustomerOrders from "./pages/Customer/CustomerOrders";
import CustomerMenu from "./pages/Customer/CustomerMenu";
import Cart from "./pages/Customer/Cart";
// import Inventory from "./pages/admin/InventoryMgmt";
import AdminTable from "./pages/admin/AdminTable";
import GuestTable from "./pages/Guest/GuestTable";
import CustomerBill from "./pages/Customer/CustomerBill";
import Verifyotp from "./pages/Verifyotp";
import InventoryMgmt from "./pages/admin/InventoryMgmt";
import BillsMgmt from "./pages/admin/BillsMgmt";
import DinningMgmt from "./pages/admin/DinningMgmt";
import UserMgmt from "./pages/admin/UserMgmt";
import MenuMgmt from "./pages/admin/MenuMgmt";
import OrderMgmt from "./pages/admin/OrderMgmt";
import PaymentMgmt from "./pages/admin/PaymentMgmt";
import ReportMgmt from "./pages/admin/ReportMgmt";
import AdminDashboard from "./pages/admin/AdminDashboard";


const AdminPanel = () => <h2>Admin Panel (Admins Only)</h2>;
const Analytics = () => <h2>Analytics Page (Admins & Editors)</h2>;
const Unauthorized = () => <h2>⚠️ Access Denied: You don't have permission.</h2>;
const UserPanel = () => <h2>this is the user dashboard</h2>;
const ProtectedRoute = ({ allowedRoles }) => {
    const { token, roles } = GetCurrUser();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const hasAccess = roles?.some(role =>
        allowedRoles.includes(Number(role))
    );

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
      <ToastContainer />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/contact", element: <Contact /> },
      {path:"/guest-table",element:<GuestTable/>},
      {path:"/menu",element:<Menu/>},
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/dashboard", element: <Dashboard />},
      {path:"/Verify-otp", element : <Verifyotp/>},
      
      

      { 
        
        element: <ProtectedRoute allowedRoles={[5]} />,
        children: [
          { path: "/admin-dashboard", element: <AdminDashboard /> },
          { path: "/analytics", element: <Analytics /> },
          // {path:"/inventory",element:<Inventory/>},

      {path:"/admin-inventory", element:<InventoryMgmt/>},

      {path:"/admin-table",element:<AdminTable/>},
      {path:"/admin-bill",element:<BillsMgmt/>},
      { path: "/admin-dining", element: <DinningMgmt /> },
          { path: "/admin-users", element: <UserMgmt /> },

{ path: "/admin-menu", element: <MenuMgmt /> },

{ path: "/admin-orders", element: <OrderMgmt /> },

{ path: "/admin-payment", element: <PaymentMgmt /> },

{ path: "/admin-reports", element: <ReportMgmt /> },
          
          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          { path: "/customer-dashboard", element: <UserPanel /> },
          {path:"/customer-orders",element:<CustomerOrders/>},
          {path:"/customer-cart",element:<Cart/>},
          {path:"/customer-table", element: <Table/>},
          {path:"/customer-menu",element:<CustomerMenu/>},
          {path:"/customer-bill",element:<CustomerBill/>},
          
        ]
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;