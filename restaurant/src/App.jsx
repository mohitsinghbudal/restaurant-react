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
import Menu from "./pages/guest/GuestMenu";
import Table from "./pages/customer/CustomerTable";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerMenu from "./pages/customer/CustomerMenu";
import Cart from "./pages/customer/Cart";
import Inventory from "./pages/admin/Inventory";
import AdminTable from "./pages/admin/AdminTable";
import GuestTable from "./pages/guest/GuestTable";
import CustomerBill from "./pages/customer/CustomerBill";
import Verifyotp from "./pages/Verifyotp";

const AdminPanel = () => <h2>Admin Panel (Admins Only)</h2>;
const Analytics = () => <h2>Analytics Page (Admins & Editors)</h2>;
const Unauthorized = () => <h2>⚠️ Access Denied: You don't have permission.</h2>;
const UserPanel = () => <h2>this is the user dashboard</h2>;
const ProtectedRoute = ({ allowedRoles }) => {
  const { token, roleId } = GetCurrUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(Number(roleId))) {
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
      {path:"/Verifyotp", element : <Verifyotp/>},

      { 
        element: <ProtectedRoute allowedRoles={[5]} />,
        children: [
          { path: "/admin-dashboard", element: <AdminPanel /> },
          { path: "/analytics", element: <Analytics /> },
          {path:"/inventory",element:<Inventory/>},
          {path:"/admin-table",element:<AdminTable/>},
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          { path: "/customer-dashboard", element: <UserPanel /> },
          {path:"/customer-orders",element:<CustomerOrders/>},
          {path:"/customer-cart",element:<Cart/>},
          {path:"/customer-table", element: <Table/>},
          {path:"/customer-orders",element:<CustomerOrders/>},
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