import React, { useState } from 'react'; // Added useState
import { useNavigate } from 'react-router-dom';
import axios from 'axios';                  // Added axios import
import api from "../util/api";              // Added api import
import { showToast } from "../components/showToast"; // Added toast import
import "./Signup.css"

function Signup() {
  // Added controlled state for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const baseUrl = api();
      const res = await axios.post(
        `${baseUrl}/User/signup`, 
        { email, password }
      );

      // Fixed: changed 'response' to 'res' to match your variable declaration
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("userId", res.data.userId);
      sessionStorage.setItem("roles", JSON.stringify(res.data.roles || []));
      
      showToast("success", "Account created successfully!");
      navigate("/verify-otp");
    } catch (error) {
      console.error("Signup error:", error);
      showToast("error", "Signup failed. Try again.");
    }
  };

  return (
    <div className="board">
      <div className="aligner">
        <h1 className="Signup">Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            {/* Added value and onChange handlers */}
            <input 
              type="text" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-box">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="sbtn" type="submit">Sign Up</button>
        </form>
        <h5 className="underline" onClick={() => navigate("/login")}>
          Already have an account?
        </h5>
      </div>
    </div>
  );
}

export default Signup;