import "pagedjs";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"; // To access the URL parameter
import axios from "axios"; // Axios for API calls
import ProfileSidebar from "../components/ProfileSidebar"; // ✅ default import
import PersonnelInfo from "../components/PersonnelInfo"; // ✅ default import
import styles from "../components/PersonnelImage.module.css";

import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

// Configuration for API URLs
const API_URL = process.env.REACT_APP_API_URL; // API URL
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL; // District API URL
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL; // Local Congregation API URL
const FAMILY_MEMBERS_API_URL = `${API_URL}/api/get-family-members`; // Family Members API URL

const PersonnelPreview = ({ personnelId: propPersonnelId, inModal = false, isSidebarOpen = false }) => {
  const { personnelId: paramsPersonnelId } = useParams(); // Get personnel ID from URL
  const personnelId = propPersonnelId || paramsPersonnelId; // Prefer prop if provided

  const [personnel, setPersonnel] = useState(null); // Personnel data
  const [familyMembers, setFamilyMembers] = useState([]); // Family members array
  const [loading, setLoading] = useState(true); // Loading state
  const [personnelImage, setPersonnelImage] = useState(null); // Image storage
  const [personnelAddress, setPersonnelAddress] = useState(null); // Address storage
  const [personnelContact, setPersonnelContact] = useState(null); // Contact storage
  const [personnelEducationalBackground, setPersonnelEducationalBackground] =
    useState(null); // Educational background storage
  const [personnelWorkExperience, setPersonnelWorkExperience] = useState(null); // Work experience storage

  // Sidebar logic
  // We rely on isSidebarOpen prop passed from Dashboard -> Layout

  const containerPaddingLeft = (inModal && isSidebarOpen) ? "250px" : "0";

  const wholeBodyRef = useRef(null);
  const [hideSidebarOnPrint, setHideSidebarOnPrint] = useState(false);
  const [personnelDuties, setPersonnelDuties] = useState(null); // Duties storage

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const formattedDate = `${mm}-${dd}-${yyyy}`;
    setCurrentDate(formattedDate);

    // Optionally set the data-date attribute for CSS purposes
    document.documentElement.setAttribute("data-date", formattedDate);

    // Trigger print-specific adjustments, if needed for Paged.js
    if (window.PagedPolyfill) {
      window.PagedPolyfill.preview();
    }
  }, []);

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
          endpoints.map((endpoint) =>
            axios.get(`${API_URL}/api/${endpoint}`, {
              headers: getAuthHeaders(),
            })
          )
        );

        // Fetch district and local congregations data
        const districtResponse = await axios.get(
          `${DISTRICT_API_URL}/api/districts`,
          { headers: getAuthHeaders() }
        );
        const localCongregationResponse = await axios.get(
          `${LOCAL_CONGREGATION_API_URL}/api/all-congregations`,
          { headers: getAuthHeaders() }
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
          `${API_URL}/api/personnels/${personnelId}`,
          { headers: getAuthHeaders() }
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
          `${FAMILY_MEMBERS_API_URL}?personnel_id=${personnelId}`,
          { headers: getAuthHeaders() }
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
          `${API_URL}/api/personnel_images/2x2/${personnelId}`,
          { headers: getAuthHeaders() }
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
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/personnel-addresses/pid/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        // Validate response
        if (
          !response ||
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          console.warn("No personnel address data found.");
          return;
        }

        // All validations passed, set the data
        setPersonnelAddress(response.data);
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
          `${API_URL}/api/personnel_images/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        const imageData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        if (imageData.length === 0) {
          console.warn("No personnel images found.");
        }
        if (Array.isArray(imageData)) {
          const twoByTwo = imageData.find((img) => img?.type === "2x2 Picture");
          const halfBody = imageData.find(
            (img) => img?.type === "Half Body Picture"
          );
          const wholeBody = imageData.find(
            (img) => img?.type === "Full Body Picture"
          );

          setPersonnelImage({
            twoByTwo: twoByTwo?.image_url || "",
            halfBody: halfBody?.image_url || "",
            wholeBody: wholeBody?.image_url || "",
          });
        } else {
          // Fallback: set empty images if imageData is not an array
          setPersonnelImage({
            twoByTwo: "",
            halfBody: "",
            wholeBody: "",
          });
          console.warn("imageData is not an array:", imageData);
        }
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
          `${API_URL}/api/personnel-contacts/pid/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        if (
          !response ||
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          console.warn("No personnel contact data found.");
          return;
        }

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
          `${API_URL}/api/educational-background/pid/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        if (
          !response ||
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          console.warn("No educational background data found.");
          return;
        }

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
          `${API_URL}/api/work-experience/pid/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        if (
          !response ||
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          console.warn("No work experience data found.");
          return;
        }

        setPersonnelWorkExperience(response.data);
      } catch (error) {
        console.error(
          "Error fetching personnel work experience:",
          error.response?.data || error.message
        );
      }
    };

    // Function to fetch personnel duties
    const fetchPersonnelDuties = async () => {
      try {
        if (!personnelId) {
          console.warn("Personnel ID is not set.");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/church-duties/${personnelId}`,
          { headers: getAuthHeaders() }
        );

        // Validate response
        if (
          !response ||
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          console.warn("No personnel duty data found.");
          return;
        }

        // All validations passed, set the data
        setPersonnelDuties(response.data);
      } catch (error) {
        console.error("Error fetching personnel duties:", error);
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
    fetchPersonnelDuties();
    fetch2x2Image().then(() => setLoading(false));
  }, [personnelId]); // Dependency on personnelId, triggers fetch when changed

  // Show loading state while fetching data
  if (loading) {
    return <div>Loading personnel data...</div>;
  }

  return (
    <div
      style={{
        display: "block",
        minHeight: "100vh",
        paddingLeft: containerPaddingLeft,
        transition: "padding-left 0.3s ease"
      }}
    >
      <div className="main-content-row" style={{ display: "flex", minHeight: "100vh" }}>
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
          personnelDuties={personnelDuties}
        />
      </div>

      {/* === WHOLE BODY PICTURE (Solo Page) === */}
      {personnelImage?.wholeBody && (
        <div
          className={`${styles.printOnly} ${styles.pageBreak} wholeBodyPrint`}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh", // Fixed height for centering
            width: "100%",
            pageBreakBefore: "always", // Force explicit new page
            breakBefore: "page",
          }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <img
              src={`${API_URL}${personnelImage.wholeBody}`}
              alt="Whole Body"
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
                margin: "1rem auto",
                display: "block",
                objectFit: "contain",
                border: "2px solid #000",
                borderRadius: "8px",
              }}
            />
            <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Whole Body Picture
            </div>
          </div>
        </div>
      )}

      {/* === 2x2 & HALF BODY PICTURES (Combined Page) === */}
      {(personnelImage?.twoByTwo || personnelImage?.halfBody) && (
        <div
          className={`${styles.printOnly} twoByTwoHalfBodyPrint`}
          style={{
            marginTop: "2rem",
            textAlign: "center",
            width: "100%",
            pageBreakBefore: "always",
            breakBefore: "page",
            pageBreakAfter: "avoid", // Ensure no page break after this
          }}
        >
          {/* 2x2 Pictures Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            {[...Array(4)].map((_, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={
                    personnelImage.twoByTwo
                      ? `${API_URL}${personnelImage.twoByTwo}`
                      : "/default-avatar.png"
                  }
                  alt={`2x2 Picture ${index + 1}`}
                  style={{
                    width: "100%",
                    maxWidth: "150px",
                    height: "auto",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    margin: "0 auto",
                  }}
                />
                <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  2x2 Picture
                </div>
              </div>
            ))}
          </div>

          {/* Half Body Picture */}
          {personnelImage.halfBody && (
            <div style={{ textAlign: "center" }}>
              <img
                src={`${API_URL}${personnelImage.halfBody}`}
                alt="Half Body"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "auto",
                  objectFit: "cover",
                  border: "2px solid #333",
                  borderRadius: "6px",
                  margin: "0 auto",
                }}
              />
              <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Half Body Picture
              </div>
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @media print {
            @page {
              margin: 10mm; /* Reduced margins */

              @bottom-right {
                content: "Page " counter(page) " | " counter(pages) "\\AThis document was generated dated " attr(data-date);
                white-space: pre-wrap;
                font-size: 10px;
                border-top: 1px solid #ccc;
                padding-top: 5px;
              }
            }
          }
        `}
      </style>
    </div>
  );
};

export default PersonnelPreview;
