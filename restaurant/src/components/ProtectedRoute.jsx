import { Navigate, Outlet } from 'react-router';
const useAuth = () => {
  const user = { name: "Jane Doe", role: "editor" }; 
  return { isAuthenticated: !!user, role: user.role };
};

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;