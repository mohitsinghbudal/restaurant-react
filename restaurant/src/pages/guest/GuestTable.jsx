import React from 'react'
import { useNavigate } from 'react-router-dom'

function GuestTable() {
    const navigate = useNavigate();

    return (
      <div className="tables-container">
        <h1 className="tables-title">Please Login</h1>
        <p className="tables-title-link" onClick={() => navigate("/login")}>
          Click here to redirect to Login Page
        </p>
      </div>
    
  )
}

export default GuestTable