import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; 
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Contact from "./pages/Contact";

const Dashboard = () => <h2>User Dashboard (All logged-in users)</h2>;
const AdminPanel = () => <h2>Admin Panel (Admins Only)</h2>;
const Analytics = () => <h2>Analytics Page (Admins & Editors)</h2>;
const Unauthorized = () => <h2>⚠️ Access Denied: You don't have permission.</h2>;

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
      {/* Global ToastContainer so it works across routes */}
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
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/admin", element: <AdminPanel /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      {path:"/contact",element:<Contact/>},
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
