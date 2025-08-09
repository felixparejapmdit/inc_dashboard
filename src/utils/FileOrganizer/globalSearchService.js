// utils/FileOrganizer/globalSearchService.js
import directus from "./directusClient";

const fieldMap = {
  shelves: "id,name,generated_code",
  containers: "id,name,shelf_id",
  folders: "id,name,container_id,container.shelf_id", // 👈 Add container.shelf_id
  documents: "id,title,folder_id",
};

export const getAllData = async (collection) => {
  try {
    const response = await directus.get(`/items/${collection}`, {
      params: {
        limit: -1,
        fields: fieldMap[collection] || "*", // fallback to all fields
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`[GlobalSearchService] Error fetching ${collection}:`, error);
    throw new Error(`Failed to fetch ${collection}`);
  }
};
