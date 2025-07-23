// src/hooks/useLookupData.js
import { useState, useEffect } from "react";
import axios from "axios";

// Load API URLs from .env
const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const useLookupData = () => {
  const [lookupData, setLookupData] = useState({
    languages: [],
    citizenships: [],
    nationalities: [],
    departments: [],
    sections: [],
    subsections: [],
    designations: [],
    districts: [],
    localCongregations: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = getAuthHeaders();

        const endpoints = [
          "languages",
          "citizenships",
          "nationalities",
          "departments",
          "sections",
          "subsections",
          "designations",
        ];

        // Fetch general lookup data with headers
        const generalResponses = await Promise.all(
          endpoints.map((endpoint) =>
            axios.get(`${API_URL}/api/${endpoint}`, { headers })
          )
        );

        // Fetch districts and local congregations with headers
        const districtResponse = await axios.get(
          `${DISTRICT_API_URL}/api/districts`,
          { headers }
        );
        const localCongregationResponse = await axios.get(
          `${LOCAL_CONGREGATION_API_URL}/api/all-congregations`,
          { headers }
        );

        // Map results to state
        const lookupResults = {};
        endpoints.forEach((endpoint, index) => {
          lookupResults[endpoint] = generalResponses[index].data;
        });

        lookupResults["districts"] = districtResponse.data;
        lookupResults["localCongregations"] = localCongregationResponse.data;

        setLookupData(lookupResults);
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };

    fetchAllData();
  }, []);

  return lookupData;
};

export default useLookupData;
