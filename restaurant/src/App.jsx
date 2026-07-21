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
import Menu from "./pages/Menu";
import Table from "./pages/Tables";

const AdminPanel = () => <h2>Admin Panel (Admins Only)</h2>;
const Analytics = () => <h2>Analytics Page (Admins & Editors)</h2>;
const Unauthorized = () => <h2>⚠️ Access Denied: You don't have permission.</h2>;
const UserPanel = () => <h2>this is the user dashboard</h2>;
console.log(GetCurrUser());
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
      {path:"/menu",element:<Menu/>},
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/dashboard", element: <Dashboard />},
      { 
        element: <ProtectedRoute allowedRoles={[5]} />,
        children: [
          { path: "/admin-dashboard", element: <AdminPanel /> },
          { path: "/analytics", element: <Analytics /> }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          { path: "/customer-dashboard", element: <UserPanel /> },
          {path:"/table", element: <Table/>}
        ]
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;