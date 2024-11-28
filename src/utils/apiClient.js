export const fetchFromApi = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  };
  