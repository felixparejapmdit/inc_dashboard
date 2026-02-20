// src/utils/fetchData.js
import axios from "axios";
import { getAuthHeaders } from "./apiHeaders";

let API_URL = process.env.REACT_APP_API_URL || "";
if (typeof window !== "undefined" && window.location.protocol === "https:" && API_URL.startsWith("http://")) {
  API_URL = API_URL.replace("http://", "https://");
}

// Global Axios Interceptor for 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Prevent redirect loop if already on login page
      if (currentPath !== "/login") {
        console.warn("Session expired or unauthorized. Redirecting to login...");
        localStorage.removeItem("authToken"); // Clear invalid token
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Reusable GET data function
 * @param {string} endpoint - API endpoint (e.g., "users")
 * @param {Function} setter - State setter function
 * @param {Function} [setStatus] - Optional error handler
 * @param {string} [errorMsg] - Error message to display or log
 */

export const fetchData = async (
  endpoint,
  setter = null,
  onError = null,
  errorMsg = null,
  params = null,
  onFinally = null,
  baseUrl = ""
) => {
  try {
    let url = `${baseUrl}/api/${endpoint}`;

    // Log API request in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 API Request: ${url}`);
    }

    // Handle parameters
    if (typeof params === "string") {
      url += `/${params}`;
    } else if (typeof params === "object" && params !== null) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    const data = response.data;

    if (setter && typeof setter === "function") {
      if (data.success) {
        setter(data.data);
      } else if (Array.isArray(data)) {
        setter(data);
      } else if (typeof data === "object" && data !== null) {
        setter(data);
      } else {
        console.warn(`Unexpected response format for ${endpoint}:`, data);
        setter([]);
        if (onError) onError("Unexpected response format.");
      }
    }

    // Return the data for optional use
    return data.success ? data.data : data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (onError && errorMsg) {
      onError(errorMsg);
    }
    throw error;
  } finally {
    if (typeof onFinally === "function") {
      onFinally();
    }
  }
};

/**
 * Fetch permissions for a specific group ID.
 *
 * @param {number|string} groupId - The group ID to fetch permissions for.
 * @param {Function} setPermissions - State setter function for permissions.
 * @param {Function} [onError] - Optional callback for handling errors.
 */
export const fetchPermissionData = async (groupId, setPermissions, onError) => {
  if (!groupId) {
    console.warn("⚠️ No group ID provided for permission fetch.");
    if (onError) onError("Group ID is required to fetch permissions.");
    return;
  }

  console.log(`📡 Fetching permissions for group ID: ${groupId}`);

  try {
    const cleanApiUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const url = `${cleanApiUrl}/api/permissions_access/${groupId}`;

    console.log(`🔍 Request URL: ${url}`);
    const response = await axios.get(url, {
      headers: getAuthHeaders(),
      timeout: 10000, // Prevent hanging requests
    });

    const data = response.data;

    if (!data) {
      console.warn("⚠️ Empty response received for permissions.");
      setPermissions([]);
      return;
    }

    // ✅ Handle possible data formats
    if (Array.isArray(data)) {
      setPermissions(data);
    } else if (data.success && Array.isArray(data.data)) {
      setPermissions(data.data);
    } else if (data.data && typeof data.data === "object") {
      setPermissions(Object.values(data.data));
    } else {
      console.warn("⚠️ Unexpected permissions data format:", data);
      setPermissions([]);
    }

  } catch (error) {
    console.error(`❌ Network Error fetching permissions for group ${groupId}:`, {
      message: error.message,
      url: `${API_URL}/api/permissions_access/${groupId}`,
      code: error.code,
      stack: error.stack
    });

    // Handle specific network errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out while fetching permissions.");
    } else if (error.response) {
      console.error(
        `Server responded with ${error.response.status}:`,
        error.response.data
      );
    }

    if (onError) {
      onError("Failed to fetch permissions. Please try again later.");
    }

    setPermissions([]); // fallback to empty
  }
};


export const fetchLoginData = async (
  endpoint,
  onSuccess,
  onError,
  errorMessage = "Failed to fetch data",
  param = null // dynamic parameter for endpoint (e.g., username or groupId)
) => {
  try {
    const url = param ? `${API_URL}/api/${endpoint}/${param}` : `${API_URL}/api/${endpoint}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
      timeout: 10000, // prevent hanging requests
    });

    const data = response.data;

    if (data && (data.success || Array.isArray(data) || typeof data === "object")) {
      onSuccess(data);
    } else {
      console.warn(`⚠️ Unexpected data format from ${url}:`, data);
      onSuccess([]);
    }
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error.message);
    if (onError) onError(errorMessage);
  }
};

/**
 * Reusable GET data function specifically for Photoshoot/Personnel Images.
 * Assumes the API endpoint is fixed to "personnel_images" and requires a personnelId parameter.
 * @param {string} personnelId - The ID used in the route: /api/personnel_images/:personnel_id
 * @param {Function} setter - State setter function
 * @param {Function} [onError] - Optional error handler
 * @param {string} [errorMsg] - Error message to display or log
 */
export const fetchDataPhotoshoot = async (
  personnelId,
  setter = null,
  onError = null,
  errorMsg = "Failed to fetch personnel images."
) => {
  try {
    const url = `${API_URL}/api/personnel_images/${personnelId}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    const data = response.data;

    // CRITICAL: The image endpoint must return { success: true, data: [...] }
    if (data.success && Array.isArray(data.data)) {
      if (setter && typeof setter === "function") {
        setter(data.data);
      }
      return data.data; // Return raw image data
    } else {
      console.warn(`Photoshoot API failed or returned unexpected format for ID ${personnelId}:`, data);
      if (setter) setter([]);
      if (onError) onError(errorMsg);
      return [];
    }

  } catch (error) {
    console.error(`Error fetching personnel_images/${personnelId}:`, error);
    if (onError) onError(errorMsg);
    throw error;
  }
};

export const fetchProgressData = async (
  endpoint,
  setter,
  onError = null,
  errorMsg = null,
  params = null, // string or object
  onFinally = null,
  baseUrl = API_URL
) => {
  try {
    let url = `${baseUrl}/api/${endpoint}`;
    if (typeof params === "string") {
      url += `/${params}`;
    } else if (typeof params === "object" && params !== null) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    const data = response.data;

    if (data.success) {
      setter(data.data);
    } else if (Array.isArray(data)) {
      setter(data);
    } else if (typeof data === "object" && data !== null) {
      setter(data);
    } else {
      console.warn(`Unexpected response format for ${endpoint}:`, data);
      setter([]);
      if (onError) onError("Unexpected response format.");
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (onError && errorMsg) {
      onError(errorMsg);
    }
  } finally {
    if (onFinally) onFinally();
  }
};

export const fetchEnrollData = async (
  endpoint,
  setter,
  onError = null,
  errorMsg = null,
  params = null,
  onFinally = null,
  baseUrl = API_URL
) => {
  try {
    const url = params
      ? `${baseUrl}/api/${endpoint}/${params}`
      : `${baseUrl}/api/${endpoint}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    const data = response.data;

    if (data.success) {
      setter(data.data);
    } else if (Array.isArray(data)) {
      setter(data);
    } else if (typeof data === "object" && data !== null) {
      setter(data);
    } else {
      console.warn(`Unexpected response format for ${endpoint}:`, data);
      setter([]);
      if (onError) onError("Unexpected response format.");
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (onError && errorMsg) {
      onError(errorMsg);
    }
  } finally {
    if (onFinally) onFinally();
  }
};

// export const fetchData = async (
//   endpoint,
//   setter,
//   onError = null,
//   errorMsg = null,
//   params = null,
//   onFinally = null
// ) => {
//   try {
//     const url = params
//       ? `${API_URL}/api/${endpoint}/${params}`
//       : `${API_URL}/api/${endpoint}`;

//     const response = await axios.get(url, {
//       headers: getAuthHeaders(),
//     });

//     const data = response.data;

//     if (data.success) {
//       // ✅ Handles: { success: true, data: [...] } or { success: true, data: {...} }
//       setter(data.data);
//     } else if (Array.isArray(data)) {
//       // ✅ Handles: raw array
//       setter(data);
//     } else if (typeof data === "object" && data !== null) {
//       // ✅ Handles: raw object (like personnels/59)
//       setter(data);
//     } else {
//       // ❌ Unexpected
//       console.warn(`Unexpected response format for ${endpoint}:`, data);
//       setter([]);
//       if (onError) onError("Unexpected response format.");
//     }
//   } catch (error) {
//     console.error(`Error fetching ${endpoint}:`, error);
//     if (onError && errorMsg) {
//       onError(errorMsg);
//     }
//   } finally {
//     if (onFinally) onFinally();
//   }
// };

/**
 * Reusable POST request
//  */

// export const postData = async (
//   endpoint,
//   payload,
//   errorMsg = "Failed to submit data."
// ) => {
//   try {
//     const isFormData = payload instanceof FormData;

//     // Remove undefined fields for JSON payloads
//     if (!isFormData) {
//       payload = Object.fromEntries(
//         Object.entries(payload).filter(
//           ([_, value]) => value !== undefined && value !== null
//         )
//       );
//     }

//     console.log("📤 POST to:", `${API_URL}/api/${endpoint}`);
//     console.log("📦 Payload:", payload);

//     const response = await axios.post(`${API_URL}/api/${endpoint}`, payload, {
//       headers: {
//         ...getAuthHeaders(),
//         ...(isFormData ? {} : { "Content-Type": "application/json" }),
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error(`❌ POST error on ${endpoint}:`, error.response?.data || error);
//     throw new Error(errorMsg);
//   }
// };

export const postData = async (
  endpoint,
  payload,
  errorMsg = "Failed to submit data."
) => {
  try {
    const isFormData = payload instanceof FormData;

    const response = await axios.post(`${API_URL}/api/${endpoint}`, payload, {
      headers: {
        ...getAuthHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });

    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.details;

    console.error(`POST error on ${endpoint}:`, error?.response?.data || error);
    throw new Error(serverMessage || errorMsg);
  }
};

export const fetchSetting = async (
  endpoint, // e.g. "settings/drag-drop"
  errorMsg = "Failed to fetch setting."
) => {
  try {
    const url = `${API_URL}/api/${endpoint}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`❌ FETCH setting error on ${endpoint}:`, error);
    throw new Error(errorMsg);
  }
};

export const putSetting = async (
  endpoint, // e.g. "settings/drag-drop"
  payload,
  errorMsg = "Failed to update setting."
) => {
  try {
    const url = `${API_URL}/api/${endpoint}`;

    const response = await axios.put(url, payload, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`❌ PUT error on ${endpoint}:`, error);
    throw new Error(errorMsg);
  }
};

/**
 * Reusable PUT request with ID in URL
 */

// export const putData = async (
//   endpoint,
//   idOrPayload,
//   maybePayload,
//   errorMsg = "Failed to update data."
// ) => {
//   try {
//     let url = `${API_URL}/api/${endpoint}`;
//     let payload = {};

//     if (typeof idOrPayload === "object") {
//       // Case: called with (endpoint, payload, errorMsg)
//       payload = idOrPayload;
//     } else {
//       // Case: called with (endpoint, id, payload, errorMsg)
//       url += `/${idOrPayload}`;
//       payload = maybePayload;
//     }

//     const response = await axios.put(url, payload, {
//       headers: getAuthHeaders(),
//     });

//     return response.data;
//   } catch (error) {
//     console.error(`PUT error on ${endpoint}:`, error);
//     throw new Error(errorMsg);
//   }
// };

export const putFileData = async (
  endpoint,
  idOrPayload,
  maybePayload,
  errorMsg = "Failed to update data."
) => {
  try {
    let url = `${API_URL}/${endpoint}`;
    let payload = {};
    let isMultipart = false;

    // Detect structure: putData('endpoint', payload) or putData('endpoint', id, payload)
    if (typeof idOrPayload === "object") {
      payload = idOrPayload;
    } else {
      url += `/${idOrPayload}`;
      payload = maybePayload;
    }

    // Check if payload contains any File objects
    isMultipart =
      payload &&
      Object.values(payload).some(
        (val) =>
          val instanceof File ||
          (Array.isArray(val) && val.some((item) => item instanceof File))
      );

    let dataToSend = payload;

    // Convert to FormData if multipart is needed
    if (isMultipart) {
      const formData = new FormData();
      for (const key in payload) {
        const value = payload[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, value);
        }
      }
      dataToSend = formData;
    }

    const response = await axios.put(url, dataToSend, {
      headers: {
        ...getAuthHeaders(),
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
      },
    });

    return response.data;
  } catch (error) {
    console.error(`PUT error on ${endpoint}:`, error?.response || error);
    throw new Error(errorMsg);
  }
};

export const putData = async (
  endpoint,
  idOrPayload,
  maybePayload,
  errorMsg = "Failed to update data."
) => {
  try {
    let url = `${API_URL}/api/${endpoint}`;
    let payload;
    let isMultipart = false;

    // Determine if ID is provided (and adjust URL)
    if (typeof idOrPayload === "object" && idOrPayload !== null) {
      payload = idOrPayload;
    } else {
      url += `/${idOrPayload}`;
      payload = maybePayload;
    }

    // Detect if any value is a File (for multipart upload)
    if (payload && Object.values(payload).some((val) => val instanceof File)) {
      isMultipart = true;
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value);
        }
      });

      payload = formData;
    }

    const response = await axios.put(url, payload, {
      headers: {
        ...getAuthHeaders(),
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
      },
    });

    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.details;

    console.error(`PUT error on ${endpoint}:`, error?.response?.data || error);
    throw new Error(serverMessage || errorMsg);
  }
};

export const putDataRestore = async (endpoint, id, errorMsg = "Failed to restore data.") => {
  try {
    // Build the correct restore URL
    const url = `${API_URL}/api/${endpoint}/${id}`;

    const response = await axios.put(
      url,
      {}, // Empty body for restore (no payload needed)
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(`PUT restore error on ${endpoint}/${id}:`, error?.response || error);
    throw new Error(errorMsg);
  }
};


// New function optimized for simple JSON updates (like contact extension)
export const putDataContact = async (
  endpoint, // e.g., 'personnel-contacts/90'
  payload, // The JSON object {extension: '1234'}
  errorMsg = "Failed to update contact data."
) => {
  try {
    // CRITICAL FIX: The endpoint should be treated as the full path already, 
    // without adding another /api/ or using complex ID logic.
    const url = `${API_URL}/api/${endpoint}`;

    // Note: We assume the payload is always a simple JSON object for this function.
    const response = await axios.put(url, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json", // Explicitly set JSON content type
      },
    });

    return response.data;
  } catch (error) {
    console.error(`PUT error on ${endpoint}:`, error?.response || error);
    throw new Error(errorMsg);
  }
};

/**
 * Reusable DELETE request
 */
export const deleteData = async (
  endpoint,
  id,
  errorMsg = "Failed to delete data."
) => {
  try {
    const response = await axios.delete(`${API_URL}/api/${endpoint}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`DELETE error on ${endpoint}/${id}:`, error);
    throw new Error(errorMsg);
  }
};
