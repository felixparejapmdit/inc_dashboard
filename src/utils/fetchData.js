// src/utils/fetchData.js
import axios from "axios";
import { getAuthHeaders } from "./apiHeaders";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Reusable GET data function
 * @param {string} endpoint - API endpoint (e.g., "users")
 * @param {Function} setter - State setter function
 * @param {Function} [setStatus] - Optional error handler
 * @param {string} [errorMsg] - Error message to display or log
 */

export const fetchData = async (
  endpoint,
  setter = null, // Now optional
  onError = null,
  errorMsg = null,
  params = null,
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

    // If no setter provided, just return the result
    return data.success ? data.data : data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (onError && errorMsg) {
      onError(errorMsg);
    }
    throw error; // So `await fetchData()` can catch this too
  } finally {
    if (onFinally) onFinally();
  }
};

// export const fetchData = async (
//   endpoint,
//   setter,
//   onError = null,
//   errorMsg = null,
//   params = null, // string or object
//   onFinally = null,
//   baseUrl = API_URL
// ) => {
//   try {
//     let url = `${baseUrl}/api/${endpoint}`;
//     if (typeof params === "string") {
//       url += `/${params}`;
//     } else if (typeof params === "object" && params !== null) {
//       const queryString = new URLSearchParams(params).toString();
//       url += `?${queryString}`;
//     }

//     const response = await axios.get(url, {
//       headers: getAuthHeaders(),
//     });

//     const data = response.data;

//     if (data.success) {
//       setter(data.data);
//     } else if (Array.isArray(data)) {
//       setter(data);
//     } else if (typeof data === "object" && data !== null) {
//       setter(data);
//     } else {
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

// export const fetchData = async (
//   endpoint,
//   setter,
//   onError = null,
//   errorMsg = null,
//   params = null,
//   onFinally = null,
//   baseUrl = API_URL
// ) => {
//   try {
//     const url = params
//       ? `${baseUrl}/api/${endpoint}/${params}`
//       : `${baseUrl}/api/${endpoint}`;

//     const response = await axios.get(url, {
//       headers: getAuthHeaders(),
//     });

//     const data = response.data;

//     if (data.success) {
//       setter(data.data);
//     } else if (Array.isArray(data)) {
//       setter(data);
//     } else if (typeof data === "object" && data !== null) {
//       setter(data);
//     } else {
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
    console.error(`POST error on ${endpoint}:`, error);
    throw new Error(errorMsg);
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
    const url = `${API_URL}/api/${endpoint}/`;

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

export const putData = async (
  endpoint,
  idOrPayload,
  maybePayload,
  errorMsg = "Failed to update data."
) => {
  try {
    let url = `${API_URL}/api/${endpoint}`;
    let payload = {};

    if (typeof idOrPayload === "object") {
      // Case: called with (endpoint, payload, errorMsg)
      payload = idOrPayload;
    } else {
      // Case: called with (endpoint, id, payload, errorMsg)
      url += `/${idOrPayload}`;
      payload = maybePayload;
    }

    const response = await axios.put(url, payload, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`PUT error on ${endpoint}:`, error);
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
