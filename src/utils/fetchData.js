// src/utils/fetchData.js
import axios from "axios";
import { getAuthHeaders } from "./apiHeaders";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Reusable fetchData function
 * @param {string} endpoint - API endpoint (e.g., "users")
 * @param {Function} setter - State setter function
 * @param {Function} [setStatus] - Optional error handler
 * @param {string} [errorMsg] - Error message to display or log
 */
export const fetchData = async (endpoint, setter, setStatus = null, errorMsg = null) => {
  try {
    const response = await axios.get(`${API_URL}/api/${endpoint}`, {
      headers: getAuthHeaders(),
    });

    const data = response.data;
    if (Array.isArray(data)) {
      setter(data);
    } else {
      setter([]);
      console.warn(`Unexpected response format for ${endpoint}:`, data);
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    if (setStatus && errorMsg) {
      setStatus(errorMsg);
    }
  }
};

// POST
export const postData = async (endpoint, payload) => {
  return axios.post(`${API_URL}/api/${endpoint}`, payload, {
    headers: getAuthHeaders(),
  });
};

// PUT
export const putData = async (endpoint, payload = {}) => {
  return axios.put(`${API_URL}/api/${endpoint}`, payload, {
    headers: getAuthHeaders(),
  });
};

// DELETE
export const deleteData = async (endpoint) => {
  return axios.delete(`${API_URL}/api/${endpoint}`, {
    headers: getAuthHeaders(),
  });
};