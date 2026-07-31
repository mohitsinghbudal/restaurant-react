import { useNavigate } from "react-router-dom"; 
import "./Login.css";
import { useState, useEffect } from "react";
import axios from "axios";       
import api from "../util/api";  
import GetCurrUser from "../util/GetcurrUser";
import { showToast } from "../components/showToast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { token, roles } = GetCurrUser();

  const handleRoleRedirect = (roles) => {
    if (roles.includes("Admin")) {
      navigate("/admin-dashboard");
    } else if (roles.includes("Customer")) {
      navigate("/customer-table");
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (token) {
      handleRoleRedirect(roles);
    }
  }, [token, roles, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("warning", "Please fill in all fields.");
      return;
    }

    try {
      const baseUrl = api();
      const res = await axios.post(`${baseUrl}/User/login`, { email, password });
      
      sessionStorage.setItem("token", res.data.login_token);
      sessionStorage.setItem("userId", res.data.userId);
      sessionStorage.setItem("roles", JSON.stringify(res.data.roles || []));

      showToast("success", "Login Successful!");
      
      
      handleRoleRedirect(res.data.roles || []);
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