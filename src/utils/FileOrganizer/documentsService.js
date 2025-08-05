// utils/documentsService.js
import directus from "./directusClient";

// GET all documents, with optional filters (e.g. by folder_id)
export const getDocuments = (params = {}) =>
  directus.get("/items/Documents", { params });

// GET document by ID
export const getDocumentById = (id) =>
  directus.get(`/items/Documents/${id}`);

// POST new document
export const createDocument = (data) =>
  directus.post("/items/Documents", data);

// PUT update document
export const updateDocument = (id, data) =>
  directus.patch(`/items/Documents/${id}`, data);

// DELETE document
export const deleteDocument = (id) =>
  directus.delete(`/items/Documents/${id}`);
