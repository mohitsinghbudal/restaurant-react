import { useNavigate } from "react-router-dom"; 
import "./Login.css";
import { useState, useEffect } from "react";
import axios from "axios";       
import api from "../util/api";  
import { showToast } from "../components/showToast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Redirect to dashboard immediately if a token is already present
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation check
    if (!email || !password) {
      showToast("warning", "Please fill in all fields.");
      return;
    }

    try {
      const baseUrl = api();
      const res = await axios.post(`${baseUrl}/User/login`, { email, password });
      
      // Save authentication criteria safely to session storage
      sessionStorage.setItem("token", res.data.Login_token);
      sessionStorage.setItem("userId", res.data.userId);
      sessionStorage.setItem("roleId", res.data.roleId);

      showToast("success", "Login Successful!");
      
      // Use navigate to change routes, which acts as the trigger for layout elements
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      
      // Fallback message extraction if backend sends a custom error message string
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
              type="email" // Changed from "text" to "email" for built-in browser validation
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