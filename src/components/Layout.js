import React, { useState } from "react";
import Sidebar from "./Sidebar"; // Import your Sidebar component

const Layout = ({ children, currentUser }) => {
  // State to track sidebar's expanded or collapsed state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Function to handle sidebar hover to expand or collapse
  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <div style={{ display: "flex", position: "relative", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* Main content */}
      <div
        style={{
          marginLeft: isSidebarExpanded ? "200px" : "60px", // Adjust dynamically
          width: "100%",
          padding: "20px",
          transition: "margin-left 0.3s ease", // Smooth transition
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
