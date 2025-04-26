import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"; // To access the URL parameter
import axios from "axios"; // Axios for API calls
import ProfileSidebar from "../components/ProfileSidebar"; // ✅ default import
import PersonnelInfo from "../components/PersonnelInfo"; // ✅ default import
import "./PersonnelPreview.css";

// Configuration for API URLs
const API_URL = process.env.REACT_APP_API_URL; // API URL
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL; // District API URL
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL; // Local Congregation API URL
const FAMILY_MEMBERS_API_URL = `${API_URL}/api/get-family-members`; // Family Members API URL

const PersonnelPreview = () => {
  const { personnelId } = useParams(); // Get personnel ID from URL
  const [personnel, setPersonnel] = useState(null); // Personnel data
  const [familyMembers, setFamilyMembers] = useState([]); // Family members array
  const [loading, setLoading] = useState(true); // Loading state
  const [personnelImage, setPersonnelImage] = useState(null); // Image storage
  const [personnelAddress, setPersonnelAddress] = useState(null); // Address storage
  const [personnelContact, setPersonnelContact] = useState(null); // Contact storage
  const [personnelEducationalBackground, setPersonnelEducationalBackground] =
    useState(null); // Educational background storage
  const [personnelWorkExperience, setPersonnelWorkExperience] = useState(null); // Work experience storage

  const wholeBodyRef = useRef(null);
  const [hideSidebarOnPrint, setHideSidebarOnPrint] = useState(false);

  useEffect(() => {
    const checkWholeBodyPageSize = () => {
      if (wholeBodyRef.current) {
        const height = wholeBodyRef.current.getBoundingClientRect().height;
        const pageHeight = 1122; // A4 page height at 96dpi

        if (height >= pageHeight * 0.8) {
          setHideSidebarOnPrint(true);
        } else {
          setHideSidebarOnPrint(false);
        }
      }
    };

    checkWholeBodyPageSize();

    window.addEventListener("resize", checkWholeBodyPageSize);
    return () => window.removeEventListener("resize", checkWholeBodyPageSize);
  }, [personnelImage]);

  // Lookup data for other dropdowns or lookups
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
    // Function to fetch all lookup data and personnel details
    const fetchAllData = async () => {
      try {
        // API endpoints to fetch lookup data
        const endpoints = [
          "languages",
          "citizenships",
          "nationalities",
          "departments",
          "sections",
          "subsections",
          "designations",
        ];

        // Fetch all lookup data in parallel using Promise.all
        const generalResponses = await Promise.all(
          endpoints.map((endpoint) => axios.get(`${API_URL}/api/${endpoint}`))
        );

        // Fetch district and local congregations data
        const districtResponse = await axios.get(
          `${DISTRICT_API_URL}/api/districts`
        );
        const localCongregationResponse = await axios.get(
          `${LOCAL_CONGREGATION_API_URL}/api/all-congregations`
        );

        // Map fetched data to the corresponding keys in lookupData
        const lookupResults = {};
        endpoints.forEach((endpoint, index) => {
          lookupResults[endpoint] = generalResponses[index].data;
        });

        // Add district and local congregation data
        lookupResults["districts"] = districtResponse.data;
        lookupResults["localCongregations"] = localCongregationResponse.data;

        setLookupData(lookupResults); // Set lookup data in state
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };

    // Function to fetch personnel data
    const fetchPersonnel = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnels/${personnelId}`
        );
        setPersonnel(response.data); // Set personnel data
      } catch (error) {
        console.error("Error fetching personnel:", error);
      }
    };

    // Function to fetch family members
    const fetchFamilyMembers = async () => {
      try {
        const response = await axios.get(
          `${FAMILY_MEMBERS_API_URL}?personnel_id=${personnelId}`
        );
        setFamilyMembers(response.data); // Set family members data
      } catch (error) {
        console.error("Error fetching family members:", error);
      }
    };

    // Function to fetch 2x2 image for personnel
    const fetch2x2Image = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnel_images/2x2/${personnelId}`
        );
        if (response.data.success && response.data.data) {
          //setPersonnelImage(response.data.data.image_url); // Store the image data
        }
      } catch (error) {
        console.error("Error fetching 2x2 picture:", error);
      }
    };

    // Function to fetch personnel address
    const fetchPersonnelAddress = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnel-addresses/pid/${personnelId}`
        );
        setPersonnelAddress(response.data); // Set personnel address data
      } catch (error) {
        console.error("Error fetching personnel address:", error);
      }
    };

    const fetchPersonnelImages = async () => {
      try {
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/personnel_images/${personnelId}`
        );

        const imageData = response.data?.data || [];

        // Extract specific image types
        const twoByTwo = imageData.find((img) => img.type === "2x2 Picture");
        const halfBody = imageData.find(
          (img) => img.type === "Half Body Picture"
        );
        const wholeBody = imageData.find(
          (img) => img.type === "Whole Body Picture"
        );

        setPersonnelImage({
          twoByTwo: twoByTwo?.image_url || "",
          halfBody: halfBody?.image_url || "",
          wholeBody: wholeBody?.image_url || "",
        });
      } catch (error) {
        console.error(
          "Error fetching personnel images:",
          error.response?.data || error.message
        );
      }
    };

    const fetchPersonnelContacts = async () => {
      try {
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/personnel-contacts/pid/${personnelId}`
        );
        setPersonnelContact(response.data);
      } catch (error) {
        console.error(
          "Error fetching personnel contacts:",
          error.response?.data || error.message
        );
      }
    };

    const fetchPersonnelEducational = async () => {
      try {
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/educational-background/pid/${personnelId}`
        );
        setPersonnelEducationalBackground(response.data);
      } catch (error) {
        console.error(
          "Error fetching personnel educational:",
          error.response?.data || error.message
        );
      }
    };

    const fetchPersonnelWorkExperience = async () => {
      try {
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/work-experience/pid/${personnelId}`
        );
        setPersonnelWorkExperience(response.data);
      } catch (error) {
        console.error(
          "Error fetching personnel work experience:",
          error.response?.data || error.message
        );
      }
    };

    // Execute all API calls
    fetchAllData();
    fetchPersonnel();
    fetchFamilyMembers();
    fetchPersonnelAddress();
    fetchPersonnelContacts();
    fetchPersonnelEducational();
    fetchPersonnelWorkExperience();
    fetchPersonnelImages();
    fetch2x2Image().then(() => setLoading(false));
  }, [personnelId]); // Dependency on personnelId, triggers fetch when changed

  // Show loading state while fetching data
  if (loading) {
    return <div>Loading personnel data...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Passing the correct props to ProfileSidebar and PersonnelInfo */}

      <div className={hideSidebarOnPrint ? "no-print" : ""}></div>
      <ProfileSidebar
        personnel={personnel}
        personnelImage={personnelImage}
        personnelContact={personnelContact}
        personnelEducationalBackground={personnelEducationalBackground}
        personnelWorkExperience={personnelWorkExperience}
      />
      <PersonnelInfo
        personnel={personnel}
        familyMembers={familyMembers}
        lookupData={lookupData}
        personnelAddress={personnelAddress}
        personnelImage={personnelImage}
      />
    </div>
  );
};

export default PersonnelPreview;
