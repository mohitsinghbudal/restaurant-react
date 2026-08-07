import { useNavigate } from "react-router-dom"; 
import "./Login.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";       
import api from "../util/api";  
import GetCurrUser from "../util/GetcurrUser";
import { showToast } from "../components/showToast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { token, roles: hookRoles } = GetCurrUser();

  // Centralized navigation logic that accepts explicit roles array or falls back to hook state
  const handleRoleRedirect = useCallback((rolesArray) => {
    const activeRoles = Array.isArray(rolesArray) && rolesArray.length > 0 
      ? rolesArray 
      : hookRoles;

    // Check numeric values directly
    if (activeRoles.includes(5)) {
      navigate("/admin-dashboard");
    } else if (activeRoles.includes(1)) {
      navigate("/customer-table");
    } else {
      navigate("/dashboard");
    }
  }, [hookRoles, navigate]);

  // Auto-redirect if the user visits /login while already authenticated
  useEffect(() => {
    if (token && hookRoles.length > 0) {
      handleRoleRedirect(hookRoles);
    }
  }, [token, hookRoles, handleRoleRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("warning", "Please fill in all fields.");
      return;
    }

    try {
      const baseUrl = api();
      const res = await axios.post(`${baseUrl}/User/login`, { email, password });
      
      const token = res.data.login_token;
      const userId = res.data.userId;
      // Convert backend roles to numbers
      const roles = (res.data.roles || []).map(Number);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", String(userId));
      sessionStorage.setItem("roles", JSON.stringify(roles));

      showToast("success", res.data.message || "Login Successful!");
      
      // Perform redirect using response roles directly
      handleRoleRedirect(roles);

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login Failed. Please try again.";
      showToast("error", errorMessage);
    }
  };

  return (
    <div className="board">
      <div className="aligner">
        <h1 className="login">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="sbtn" type="submit">Login</button>
        </form>
        <h5 className="underline">Forgot password?</h5>
        <h5 className="underline" onClick={() => navigate("/signup")}>
          Create new account?
        </h5>
      </div>
    </div>
  );
}

export default Login;