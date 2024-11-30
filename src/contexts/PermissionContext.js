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
    console.log("Permissions: ", permissions); // Log all permissions
    console.log("Checking permission: ", permissionName); // Log the permission being checked

    const permission = permissions.find(
      (perm) => perm.permission_name === permissionName
    );
    return permission?.accessrights === 1; // Return true if accessrights is 1
  };

  return (
    <PermissionContext.Provider value={{ fetchPermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to use the PermissionContext
export const usePermissionContext = () => useContext(PermissionContext);
