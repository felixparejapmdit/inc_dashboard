import React, { useState } from "react";
import axios from "axios";

const LdapLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login_ldap", {
        username,
        password,
      });
      setSuccess("Login successful");
      setError("");
      // Perform actions like saving the user info or redirecting to a dashboard
    } catch (err) {
      setError(err.response.data.message);
      setSuccess("");
    }
  };

  return (
    <div>
      <h2>LDAP Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LdapLogin;
