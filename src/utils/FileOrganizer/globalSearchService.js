// utils/FileOrganizer/globalSearchService.js
import directus from "./directusClient";

const fieldMap = {
  Shelves: "id,name,description,generated_code,color,created_at",
  Containers: "id,name,description,generated_code,shelf_id,created_at",
  Folders: "id,name,description,generated_code,container_id,created_at",
  Documents: "id,name,title,description,generated_code,folder_id,container_id,shelf_id,file_url,type,tags,created_at",
  shelves: "id,name,description,generated_code,color,created_at",
  containers: "id,name,description,generated_code,shelf_id,created_at",
  folders: "id,name,description,generated_code,container_id,created_at",
  documents: "id,name,title,description,generated_code,folder_id,container_id,shelf_id,file_url,type,tags,created_at",
};

export const getAllData = async (collection) => {
  try {
    const response = await directus.get(`/items/${collection}`, {
      params: {
        limit: -1,
        fields: fieldMap[collection] || "*",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`[GlobalSearchService] Error fetching ${collection}:`, error);
    throw new Error(`Failed to fetch ${collection}`);
  }
};
