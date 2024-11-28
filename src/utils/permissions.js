import axios from "axios";

export const getGroupPermissions = async (groupId) => {
  const API_URL = process.env.REACT_APP_API_URL;
  try {
    const response = await axios.get(`${API_URL}/api/group-permissions`, {
      params: { groupId },
    });
    return response.data; // Permissions fetched from the backend
  } catch (error) {
    console.error("Error fetching group permissions:", error);
    return [];
  }
};
