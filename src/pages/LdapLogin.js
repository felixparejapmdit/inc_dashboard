import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import crypto from "crypto-js"; // Use crypto-js for password hashing
import "./LdapLogin.css";

const LdapLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize for redirection

  // Function to encode the password to MD5 (same as LDAP MD5 format)
  const md5HashPassword = (password) => {
    const md5sum = crypto.MD5(password);
    return `{MD5}` + crypto.enc.Base64.stringify(md5sum); // LDAP stores passwords in base64-encoded MD5
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      setError("Username and password are required.");
      setSuccess("");
      setLoading(false);
      return;
    }

    try {
      // Fetch user details from the backend using the username
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/ldap/user/${username}`
      );
      const user = res.data;

      if (user) {
        // Check if the password matches
        const hashedPassword = md5HashPassword(password);
        if (user.userPassword === hashedPassword) {
          // Password matches, login successful
          setSuccess("Login successful");
          setError("");
          setLoading(false);

          // Redirect to the dashboard
          navigate("/dashboard");
        } else {
          // Password does not match, show error
          setError("Invalid password");
          setSuccess("");
          setLoading(false);
        }
      } else {
        // If no user is found, show an error
        setError("User not found");
        setSuccess("");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setSuccess("");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">LDAP Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? "loading" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LdapLogin;
