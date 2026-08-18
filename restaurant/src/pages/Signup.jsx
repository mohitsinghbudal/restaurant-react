import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from "../util/api";
import { showToast } from "../components/showToast";
import "./Signup.css"

function Signup() {

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

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("userId", res.data.userId);
      if (res.data.roles) {
        sessionStorage.setItem("roles", JSON.stringify(res.data.roles));
        if (res.data.roles.length > 0) {
          sessionStorage.setItem("roleId", String(res.data.roles[0]));
        }
      } else if (res.data.roleId) {
        sessionStorage.setItem("roleId", String(res.data.roleId));
        sessionStorage.setItem("roles", JSON.stringify([res.data.roleId]));
      }

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
