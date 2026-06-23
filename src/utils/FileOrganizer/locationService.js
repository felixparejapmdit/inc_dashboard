import directus from "./directusClient";

const collectionMap = {
  shelf: "Shelves",
  shelves: "Shelves",
  container: "Containers",
  containers: "Containers",
  folder: "Folders",
  folders: "Folders",
  document: "Documents",
  documents: "Documents",
};

export const moveItemToLocation = async (id, type, newLocation) => {
  const collection = collectionMap[String(type || "").toLowerCase()];

  if (!collection) {
    throw new Error(`Unknown file organizer type: ${type}`);
  }

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
