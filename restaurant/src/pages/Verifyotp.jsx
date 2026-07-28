import React, { useState } from 'react';
import axios from 'axios';

function Verifyotp() {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit OTP Verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.email || !formData.otp) {
      setMessage({ type: 'error', text: 'Please fill in both Email and OTP.' });
      return;
    }

    setLoading(true);

    try {
      // Matches the VerifyOTP endpoint expectations in your .NET Controller
      const response = await axios.post('/api/user/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });

      if (response.status === 200) {
        setMessage({
          type: 'success',
          text: 'Email verified successfully! You can now log in.',
        });
        // Optional: Reset form or redirect user to Login page
        // navigate('/login');
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'OTP verification failed or has expired. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Verify Your Email</h2>
        <p style={styles.subheading}>
          Please enter your registered email address and the 6-digit OTP code sent to your inbox.
        </p>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>OTP Code</label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="e.g. 123456"
              maxLength={6}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {

  container: {

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    minHeight: "100vh",

    padding: "30px",

    background: "#f6f5f1",

    fontFamily: "Montserrat, sans-serif"

  },


  card: {

    width: "100%",

    maxWidth: "420px",

    padding: "35px",

    borderRadius: "18px",

    backgroundColor: "#ffffff",

    border: "1px solid rgba(176,139,62,.18)",

    boxShadow: "0 15px 35px rgba(0,0,0,.08)"

  },


  heading: {

    margin: "0 0 12px 0",

    fontSize: "32px",

    textAlign: "center",

    fontFamily: "'Playfair Display', serif",

    fontWeight: "600",

    color: "#2b2b2b"

  },


  subheading: {

    margin: "0 0 25px 0",

    fontSize: "14px",

    textAlign: "center",

    color: "#777",

    lineHeight: "1.6"

  },


  alert: {

    padding: "12px 15px",

    borderRadius: "10px",

    marginBottom: "18px",

    fontSize: "14px",

    background: "#fae7e7",

    color: "#a33a3a",

    border: "1px solid rgba(163,58,58,.2)"

  },


  form: {

    display: "flex",

    flexDirection: "column",

    gap: "18px"

  },


  formGroup: {

    display: "flex",

    flexDirection: "column",

    gap: "8px"

  },


  label: {

    fontSize: "14px",

    fontWeight: "600",

    color: "#444"

  },


  input: {

    padding: "14px",

    fontSize: "16px",

    borderRadius: "10px",

    border: "1px solid #ddd",

    outline: "none",

    textAlign: "center",

    letterSpacing: "5px",

    transition: ".3s",

    color: "#333"

  },


  button: {

    padding: "14px",

    fontSize: "15px",

    fontWeight: "600",

    color: "#ffffff",

    background: "#b08b3e",

    border: "none",

    borderRadius: "25px",

    marginTop: "10px",

    cursor: "pointer",

    transition: ".3s",

    boxShadow: "0 8px 18px rgba(176,139,62,.25)"

  }

};


export default Verifyotp;