// utils/FileOrganizer/fetchWithAuth.js

import { resolveDirectusBaseUrl } from "../urlResolvers";

export const DIRECTUS_API_URL = resolveDirectusBaseUrl(8055);

// Function to get the full asset URL
export const getAssetUrl = (assetId) => {
  return `${DIRECTUS_API_URL}/assets/${assetId}`;
};

// Function to handle API calls with authorization
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const sessionToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("directus_session_token"))
      ?.split("=")[1];
    const token = process.env.REACT_APP_DIRECTUS_TOKEN || sessionToken;

    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
