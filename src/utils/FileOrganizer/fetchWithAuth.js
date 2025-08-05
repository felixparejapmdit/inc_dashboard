// utils/FileOrganizer/fetchWithAuth.js

export const DIRECTUS_API_URL = "http://172.18.162.62:3307";

// Function to get the full asset URL
export const getAssetUrl = (assetId) => {
  return `${DIRECTUS_API_URL}/assets/${assetId}`;
};

// Function to handle API calls with authorization
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("directus_session_token"))
      ?.split("=")[1];

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
