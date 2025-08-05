// utils/FileOrganizer/foldersService.js
import directus from "./directusClient";

// GET all folders, optionally by container_id
export const getFolders = (params = {}) =>
  directus.get("/items/Folders", { params });

// GET folder by ID
export const getFolderById = (id) =>
  directus.get(`/items/Folders/${id}`);

// POST new folder
export const createFolder = (data) =>
  directus.post("/items/Folders", data);

// PUT update folder
export const updateFolder = (id, data) =>
  directus.patch(`/items/Folders/${id}`, data);

// DELETE folder
export const deleteFolder = (id) =>
  directus.delete(`/items/Folders/${id}`);
