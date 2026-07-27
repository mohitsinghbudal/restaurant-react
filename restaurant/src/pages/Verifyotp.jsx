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

// Inline CSS styles for quick preview / layout
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
  },
  heading: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    textAlign: 'center',
  },
  subheading: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  alert: {
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid transparent',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2b6cb0',
    border: 'none',
    borderRadius: '4px',
    marginTop: '10px',
  },
};

export default Verifyotp;