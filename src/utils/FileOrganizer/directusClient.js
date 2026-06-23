// utils/FileOrganizer/directusClient.js
import axios from "axios";

const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const DEFAULT_DIRECTUS_URL = isLocalBrowser
  ? "http://localhost:8055"
  : "https://test-directus.pmdmc.net";

export const DIRECTUS_URL = (
  process.env.REACT_APP_DIRECTUS_URL || DEFAULT_DIRECTUS_URL
).replace(/\/+$/, "");

const AUTH_TOKEN = process.env.REACT_APP_DIRECTUS_TOKEN || "";

const headers = {
  "Content-Type": "application/json",
};

if (AUTH_TOKEN) {
  headers.Authorization = `Bearer ${AUTH_TOKEN}`;
}

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers,
});

const collectionFallbacks = {
  Shelves: "shelves",
  Containers: "containers",
  Folders: "folders",
  Documents: "documents",
};

directus.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      !originalRequest ||
      originalRequest._usedCollectionFallback ||
      ![400, 403, 404].includes(status)
    ) {
      throw error;
    }

    const nextUrl = originalRequest.url?.replace(
      /\/items\/(Shelves|Containers|Folders|Documents)(?=\/|$|\?)/,
      (_, collection) => `/items/${collectionFallbacks[collection]}`
    );

    if (!nextUrl || nextUrl === originalRequest.url) {
      throw error;
    }

    originalRequest._usedCollectionFallback = true;
    originalRequest.url = nextUrl;
    return directus(originalRequest);
  }
);

export default directus;
