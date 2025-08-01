import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../utils/fetchData";
const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  // Fetch permissions based on group ID
  const fetchPermissions = (groupId) => {
    fetchData(
      `permissions_access/${groupId}`,
      (data) => setPermissions(data),
      (err) => console.error("Error fetching permissions:", err),
      "Failed to fetch permissions"
    );
  };

  // Check if the user has a specific permission
  const hasPermission = (permissionName) => {
    //console.log("Permissions: ", permissions); // Log all permissions
    //console.log("Checking permission: ", permissionName); // Log the permission being checked

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
