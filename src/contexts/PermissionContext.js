import React, { createContext, useContext, useState } from "react";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  const loadPermissions = async (groupId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/permissions_access/${groupId}`);
  
    const data = await response.json();
    setPermissions(data);
  };

  const hasPermission = (permissionName) => {
    return permissions.some(
      (perm) => perm.permission_name === permissionName && perm.accessrights === 1
    );
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, loadPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};
