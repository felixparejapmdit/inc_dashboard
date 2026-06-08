// src/hooks/useLookupData.js
import { useState, useEffect } from "react";
import axios from "axios";


import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed

const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;
const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const DEFAULT_API_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalDev ? "http://127.0.0.1:5000" : "");

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
            axios.get(`${DEFAULT_API_URL}/api/${endpoint}`, { headers })
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
