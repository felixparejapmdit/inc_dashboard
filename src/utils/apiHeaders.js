// src/utils/apiHeaders.js

export const getAuthHeaders = ({ contentType } = {}) => {
  const authToken = localStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
};



