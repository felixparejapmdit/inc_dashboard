// src/utils/FileOrganizer/globalSearchService.js
import directus from "./directusClient";

export const getAllData = async (endpoint) => {
  try {
    const response = await directus.items(endpoint).readByQuery({
      limit: -1, // fetch all items
    });

    return response.data || [];
  } catch (error) {
    console.error(`[GlobalSearchService] Error fetching ${endpoint}:`, error);
    throw new Error(`Failed to fetch ${endpoint}`);
  }
};
