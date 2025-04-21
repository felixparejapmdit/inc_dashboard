// import React, { useState, useEffect } from "react";
// import Sidebar from "./Sidebar"; // Import your Sidebar component
// import { usePermissionContext } from "../contexts/PermissionContext"; // Import Permission Context

// const Layout = ({ children, currentUser }) => {
//   // State to track sidebar's expanded or collapsed state
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

//   // Permission context
//   const { fetchPermissions } = usePermissionContext();

//   // Function to handle sidebar hover to expand or collapse
//   const handleSidebarToggle = (expanded) => {
//     setIsSidebarExpanded(expanded);
//   };

//   // Fetch permissions on layout load
//   useEffect(() => {
//     const groupId = localStorage.getItem("groupId");
//     fetchPermissions(groupId); // Fetch permissions for the group
//   }, [fetchPermissions]);

//   return (
//     <div style={{ display: "flex", position: "relative", height: "100vh" }}>
//       {/* Sidebar */}
//       <Sidebar
//         currentUser={currentUser}
//         onSidebarToggle={handleSidebarToggle}
//       />

//       {/* Main content */}
//       <div
//         style={{
//           marginLeft: isSidebarExpanded ? "250px" : "60px", // Adjust dynamically
//           width: "100%",
//           padding: "20px",
//           transition: "margin-left 0.3s ease", // Smooth transition
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import your Sidebar component
import { usePermissionContext } from "../contexts/PermissionContext"; // Import Permission Context

const Layout = ({ children, currentUser }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { fetchPermissions } = usePermissionContext();
  const navigate = useNavigate();

  const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  //const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute in milliseconds

  let inactivityTimer;

  // Reset the inactivity timer and define logout behavior
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      // alert(
      //   "Your session has expired due to inactivity. You will be redirected to the login page."
      // );
      navigate("/login");
    }, INACTIVITY_LIMIT);
  }, [navigate]);

  useEffect(() => {
    const groupId = localStorage.getItem("groupId");
    fetchPermissions(groupId); // Fetch permissions for the group
  }, [fetchPermissions]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    // Set listeners for user activity
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize the inactivity timer
    resetInactivityTimer();

    // Cleanup on component unmount
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [resetInactivityTimer]);

  return (
    <div style={{ display: "flex", position: "relative", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onSidebarToggle={setIsSidebarExpanded}
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
