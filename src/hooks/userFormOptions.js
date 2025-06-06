// hooks/userFormOptions.js
import { useState, useEffect } from "react";
import axios from "axios";

// Environment variables
const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

// Custom Hook for form data
export function useUserFormData() {
  const [districts, setDistricts] = useState([]);
  const [localCongregations, setLocalCongregations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [citizenships, setCitizenships] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [incHousingAddresses, setIncHousingAddresses] = useState([]);

  useEffect(() => {
    const getApiUrl = (endpoint) => {
      switch (endpoint) {
        case "districts":
          return DISTRICT_API_URL;
        case "all-congregations":
          return LOCAL_CONGREGATION_API_URL;
        default:
          return API_URL;
      }
    };

    const fetchData = async (endpoint, setter) => {
      try {
        const url = `${getApiUrl(endpoint)}/api/${endpoint}`;
        const response = await axios.get(url);
        setter(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData("districts", setDistricts);
    fetchData("all-congregations", setLocalCongregations);
    fetchData("languages", setLanguages);
    fetchData("citizenships", setCitizenships);
    fetchData("nationalities", setNationalities);
    fetchData("departments", setDepartments);
    fetchData("sections", setSections);
    fetchData("subsections", setSubsections);
    fetchData("designations", setDesignations);
    fetchData("personnel-addresses/inc-housing", setIncHousingAddresses);
  }, []);

  return {
    districts,
    localCongregations,
    languages,
    citizenships,
    nationalities,
    departments,
    sections,
    subsections,
    designations,
    incHousingAddresses, // 👈 NEW
    civilStatusOptions,
    educationalLevelOptions,
    bloodtypes,
  };
}

// Static options
export const suffixOptions = [
  "No Suffix",
  "Jr.",
  "Sr.",
  "II",
  "III",
  "IV",
  "V",
  "VI",
];

export const civilStatusOptions = [
  "Annulled",
  "Cohabitating",
  "Divorced",
  "Engaged",
  "Married",
  "Separated",
  "Single",
  "Widowed",
];

export const educationalLevelOptions = [
  "No Formal Education",
  "Primary Education",
  "Secondary Education",
  "Senior High School",
  "Vocational Training",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate Degree",
  "Post-Doctorate",
  "Post-Graduate",
  "Certificate Programs",
  "Professional Degree",
  "Continuing Education",
  "Alternative Learning System",
];

export const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
