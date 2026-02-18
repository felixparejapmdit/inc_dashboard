import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchData, fetchPermissionData } from "../utils/fetchData";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  /**
   * Fetch permissions based on group ID
   * @param {number|string} groupId
   */

  const fetchPermissions = useCallback(async (groupId) => {
    if (!groupId) {
      console.error("Group ID is required to fetch permissions.");
      return;
    }

    try {
      await fetchPermissionData(
        groupId, // ✅ only pass groupId (no endpoint)
        (data) => setPermissions(Array.isArray(data) ? data : []),
        (err) => console.error("Failed to fetch permissions:", err)
      );
    } catch (error) {
      console.error("❌ Error in fetchPermissions:", error);
    }
  }, []);




  /**
   * Check if the user has a specific permission
   * @param {string} permissionName
   * @returns {boolean}
   */
  const hasPermission = (permissionName) => {
    const permission = permissions.find(
      (perm) => perm.permission_name === permissionName
    );
    return permission?.accessrights === 1;
  };

  return (
    <PermissionContext.Provider value={{ fetchPermissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => useContext(PermissionContext);
