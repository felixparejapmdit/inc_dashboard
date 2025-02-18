import React from "react";

const Maintenance = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚧 Site Under Maintenance 🚧</h1>
      <p style={styles.text}>
        We're currently performing scheduled maintenance. Please check back
        later.
      </p>
      <p style={styles.footer}>Thank you for your patience! 😊</p>
    </div>
  );
};

// Inline CSS styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    color: "#333",
    padding: "20px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  text: {
    fontSize: "1.2rem",
    marginBottom: "20px",
  },
  footer: {
    fontSize: "1rem",
    fontStyle: "italic",
  },
};

export default Maintenance;
