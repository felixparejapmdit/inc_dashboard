// utils/FileOrganizer/directusClient.js
import axios from "axios";
import { resolveDirectusBaseUrl } from "../urlResolvers";

export const DIRECTUS_URL = resolveDirectusBaseUrl(8055);

const headers = {
  "Content-Type": "application/json",
};

// Authentication is handled by the backend proxy at /api/directus.
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
