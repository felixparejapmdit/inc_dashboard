import directus from "./directusClient";

export const moveItemToLocation = async (id, type, newLocation) => {
  const collection = type + "s"; // e.g., 'folder' → 'folders'

  const payload = {};
  if (newLocation.shelf) payload.shelf_id = newLocation.shelf;
  if (newLocation.container) payload.container_id = newLocation.container;
  if (newLocation.folder) payload.folder_id = newLocation.folder;

  try {
    await directus.patch(`/items/${collection}/${id}`, payload);
  } catch (error) {
    console.error(`[moveItemToLocation] Failed to move ${type}:`, error);
    throw error;
  }
};
