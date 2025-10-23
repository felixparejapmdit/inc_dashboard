// src/utils/apiHeaders.js

export const getAuthHeaders = () => {
  const authToken = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json", // optional: add if you post/put json
  };
};



