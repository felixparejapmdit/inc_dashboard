import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar"; // Import your Sidebar component
import { usePermissionContext } from "../contexts/PermissionContext"; // Import Permission Context

const Layout = ({ children, currentUser }) => {
  // State to track sidebar's expanded or collapsed state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Permission context
  const { fetchPermissions } = usePermissionContext();

  // Function to handle sidebar hover to expand or collapse
  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  // Fetch permissions on layout load
  useEffect(() => {
    const groupId = localStorage.getItem("groupId");
    fetchPermissions(groupId); // Fetch permissions for the group
  }, [fetchPermissions]);

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
          marginLeft: isSidebarExpanded ? "250px" : "60px", // Adjust dynamically
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
