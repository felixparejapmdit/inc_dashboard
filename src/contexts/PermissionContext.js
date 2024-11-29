import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  // Fetch permissions based on group ID
  const fetchPermissions = async (groupId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/permissions_access/${groupId}`
      );
      setPermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // Check if the user has a specific permission
  const hasPermission = (permissionName) => {
    const permission = permissions.find(
      (perm) => perm.permission_name === permissionName
    );
    console.log("Checking permission:", permission); // Debug log
    return permission?.accessrights === 1;
  };

  return (
    <PermissionContext.Provider value={{ fetchPermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to use the PermissionContext
export const usePermissionContext = () => useContext(PermissionContext);
