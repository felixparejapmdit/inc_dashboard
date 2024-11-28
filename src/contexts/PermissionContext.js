import React, { createContext, useContext, useEffect, useState } from "react";
import { getGroupPermissions } from "../utils/permissions";

const PermissionContext = createContext();

export const PermissionProvider = ({ children, groupId }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const fetchedPermissions = await getGroupPermissions(groupId);
      setPermissions(fetchedPermissions);
    };

    fetchPermissions();
  }, [groupId]);

  const hasPermission = (permissionName) => {
    const permission = permissions.find(
      (perm) => perm.permission_name === permissionName
    );
    return permission?.accessrights === 1; // Returns true if the user has access
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
