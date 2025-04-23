import React, { useState, useEffect } from "react"; // React and Hooks
import { useParams } from "react-router-dom"; // Routing Hook
import {
  Box,
  Heading,
  Text,
  Avatar,
  VStack,
  HStack,
  Grid,
  GridItem,
  Divider,
  Button,
  Icon,
  Flex,
  Spinner,
  Center,
} from "@chakra-ui/react"; // Chakra UI Components
import { EmailIcon, PhoneIcon } from "@chakra-ui/icons"; // Chakra UI Icons
import axios from "axios"; // Axios for HTTP requests
import { motion } from "framer-motion"; // Motion Library
import { FaPrint } from "react-icons/fa"; // Print Icon

import "./printStyles.css"; // CSS for print
import NoPersonnelData from "./NoPersonnelData"; // Component for no data

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

  // Lookup data
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
        // API requests setup
        const endpoints = [
          "languages",
          "citizenships",
          "nationalities",
          "departments",
          "sections",
          "subsections",
          "designations",
        ];

        // Fetch all lookup data in parallel
        const generalResponses = await Promise.all(
          endpoints.map((endpoint) => axios.get(`${API_URL}/api/${endpoint}`))
        );

        // Fetch other data
        const districtResponse = await axios.get(
          `${DISTRICT_API_URL}/api/districts`
        );
        const localCongregationResponse = await axios.get(
          `${LOCAL_CONGREGATION_API_URL}/api/all-congregations`
        );

        // Map fetched data to corresponding keys
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

    const fetchPersonnel = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnels/${personnelId}`
        );
        setPersonnel(response.data);
      } catch (error) {
        console.error("Error fetching personnel:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFamilyMembers = async () => {
      try {
        const response = await axios.get(
          `${FAMILY_MEMBERS_API_URL}?personnel_id=${personnelId}`
        );
        setFamilyMembers(response.data);
      } catch (error) {
        console.error("Error fetching family members:", error);
      }
    };

    const fetch2x2Image = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnel_images/2x2/${personnelId}`
        );
        if (response.data.success && response.data.data) {
          setPersonnelImage(response.data.data); // Store image object
        }
      } catch (error) {
        console.error("Error fetching 2x2 picture:", error);
      }
    };

    // Execute all API calls
    fetchAllData();
    fetchPersonnel();
    fetchFamilyMembers();
    fetch2x2Image().then(() => setLoading(false));
  }, [personnelId]); // Dependency array
  // Helper function to get the name based on ID
  const getNameById = (id, array, nameField = "name") => {
    const item = array.find((entry) => entry.id === id);
    return item ? item[nameField] : "N/A";
  };

  // Show Spinner while loading
  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="teal.500" thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  if (!personnel) {
    return (
      <Flex height="100vh" align="center" justify="center" p={4}>
        <Box maxWidth="400px" width="100%">
          <NoPersonnelData />
        </Box>
      </Flex>
    );
  }
  // Format full name
  const fullName = [
    personnel.givenname,
    personnel.middlename,
    personnel.surname_husband,
    personnel.suffix !== "No Suffix" ? personnel.suffix : "",
  ]
    .filter(Boolean) // Exclude empty values
    .join(" ");

  // Filter family members by relationship type
  const parents = familyMembers.filter(
    (fm) =>
      fm.relationship_type === "Father" || fm.relationship_type === "Mother"
  );
  const siblings = familyMembers.filter(
    (fm) => fm.relationship_type === "Sibling"
  );
  const spouse = familyMembers.find((fm) => fm.relationship_type === "Spouse");
  const children = familyMembers.filter(
    (fm) => fm.relationship_type === "Child"
  );

  return (
    <Box
      p={8}
      maxWidth="1000px"
      mx="auto"
      bg="white"
      borderRadius="md"
      boxShadow="md"
      border="1px solid #E2E8F0"
    >
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Box
          position="sticky"
          top="0"
          zIndex="10"
          bg="white"
          boxShadow="md"
          p={4}
        >
          <HStack alignItems="center" spacing={6}>
            <Avatar
              size="2xl"
              src={
                personnelImage && personnelImage.image_url
                  ? `${API_URL}${personnelImage.image_url}`
                  : `${API_URL}/uploads/avatar/default.png`
              }
              onError={(e) => {
                e.target.src = `${API_URL}/uploads/avatar/default.png`;
              }}
            />

            <VStack align="start">
              <Heading size="lg">{fullName}</Heading>
              <Text color="gray.500" fontSize="lg" fontWeight={100}>
                {personnel.personnel_type}
              </Text>
              <Text color="gray.600">{personnel.email_address}</Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Primary Information */}
        <Box>
          <Heading size="md" mb={4}>
            Primary Information
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <Text>
                <b>Gender:</b> {personnel.gender}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Civil Status:</b> {personnel.civil_status}
              </Text>
            </GridItem>
            {personnel.civil_status === "Married" && (
              <GridItem>
                <Text>
                  <b>Wedding Anniversary:</b>{" "}
                  {new Date(personnel.wedding_anniversary).toLocaleDateString()}
                </Text>
              </GridItem>
            )}
            <GridItem>
              <Text>
                <b>Date of Birth:</b>{" "}
                {new Date(personnel.date_of_birth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Place of Birth:</b> {personnel.place_of_birth || "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Nickname:</b> {personnel.nickname || "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Blood Type:</b> {personnel.bloodtype || "N/A"}
              </Text>
            </GridItem>
          </Grid>
        </Box>
        <Divider />

        {/* Additional Information */}
        <Box>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {personnel.datejoined && (
              <GridItem>
                <Text>
                  <b>Date Joined:</b>{" "}
                  {new Date(personnel.datejoined).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </GridItem>
            )}
            <GridItem>
              <Text>
                <b>Language:</b>{" "}
                {Array.isArray(personnel.language_id)
                  ? personnel.language_id
                      .map((id) => getNameById(id, lookupData.languages))
                      .join(", ") || "N/A"
                  : "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Citizenship:</b>{" "}
                {Array.isArray(personnel.citizenship)
                  ? personnel.citizenship
                      .map((id) =>
                        getNameById(id, lookupData.citizenships, "citizenship")
                      )
                      .join(", ") || "N/A"
                  : "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Ethnicity:</b>{" "}
                {getNameById(
                  personnel.nationality,
                  lookupData.nationalities,
                  "nationality"
                )}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Department:</b>{" "}
                {getNameById(personnel.department_id, lookupData.departments)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Section:</b>{" "}
                {getNameById(personnel.section_id, lookupData.sections)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Team:</b>{" "}
                {getNameById(personnel.subsection_id, lookupData.subsections)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Designation:</b>{" "}
                {getNameById(personnel.designation_id, lookupData.designations)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>District:</b>{" "}
                {getNameById(personnel.district_id, lookupData.districts)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Local Congregation:</b>{" "}
                {getNameById(
                  personnel.local_congregation,
                  lookupData.localCongregations
                )}
              </Text>
            </GridItem>
          </Grid>
        </Box>

        <Divider />

        {/* Family Information Section */}
        <Box>
          <Heading size="md" mb={4}>
            Family Information
          </Heading>
          {parents.length > 0 && (
            <>
              <Heading size="sm" mt={6} mb={3}>
                Parents
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                {parents.map((parent) => (
                  <GridItem key={parent.id}>
                    <Text mb={6}>
                      <b>Name:</b>{" "}
                      {`${parent.givenname} ${parent.middlename || ""} ${
                        parent.lastname
                      }`}
                    </Text>
                    <Text mb={6}>
                      <b>Gender:</b> {parent.gender || "N/A"}
                    </Text>
                    <Text mb={6}>
                      <b>Civil Status:</b> {parent.civil_status || "N/A"}
                    </Text>
                    <Text mb={6}>
                      <b>Date of Birth:</b>{" "}
                      {parent.date_of_birth
                        ? new Date(parent.date_of_birth).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </Text>
                    <Text mb={6}>
                      <b>Citizenship:</b>{" "}
                      {parent.citizenship
                        ? getNameById(
                            parent.citizenship,
                            lookupData.citizenships,
                            "citizenship"
                          ) || "N/A"
                        : "N/A"}
                    </Text>
                    <Text mb={6}>
                      <b>Ethnicity:</b>{" "}
                      {getNameById(
                        parent.nationality,
                        lookupData.nationalities,
                        "nationality"
                      ) || "N/A"}
                    </Text>
                    <Text mb={6}>
                      <b>Employment:</b> {parent.employment_type || "N/A"}
                    </Text>
                  </GridItem>
                ))}
              </Grid>
            </>
          )}
        </Box>

        {/* Spouse Section (If Married) */}
        {personnel.civil_status === "Married" && spouse && (
          <>
            <Heading size="sm" mt={4} mb={2}>
              Spouse
            </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text mb={6}>
                  <b>Name:</b>{" "}
                  {`${spouse.givenname} ${spouse.middlename || ""} ${
                    spouse.lastname
                  }`}
                </Text>
                <Text mb={6}>
                  <b>Gender:</b> {spouse.gender || "N/A"}
                </Text>
                <Text mb={6}>
                  <b>Date of Birth:</b>{" "}
                  {spouse.date_of_birth
                    ? new Date(spouse.date_of_birth).toLocaleDateString()
                    : "N/A"}
                </Text>
                <Text mb={6}>
                  <b>Citizenship:</b>{" "}
                  {spouse.citizenship
                    ? getNameById(
                        spouse.citizenship,
                        lookupData.citizenships,
                        "citizenship"
                      ) || "N/A"
                    : "N/A"}
                </Text>
                <Text mb={6}>
                  <b>Ethnicity:</b>{" "}
                  {getNameById(
                    spouse.nationality,
                    lookupData.nationalities,
                    "nationality"
                  )}
                </Text>
                <Text mb={6}>
                  <b>Employment Type:</b> {spouse.employment_type || "N/A"}
                </Text>
              </GridItem>
            </Grid>
          </>
        )}

        {/* Children Section */}
        {children.length > 0 && (
          <>
            <Heading size="sm" mt={4} mb={2}>
              Children
            </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {children.map((child) => (
                <GridItem key={child.id}>
                  <Text mb={6}>
                    <b>Name:</b>{" "}
                    {`${child.givenname} ${child.middlename || ""} ${
                      child.lastname
                    }`}
                  </Text>
                  <Text mb={6}>
                    <b>Gender:</b> {child.gender || "N/A"}
                  </Text>
                  <Text mb={6}>
                    <b>Date of Birth:</b>{" "}
                    {child.date_of_birth
                      ? new Date(child.date_of_birth).toLocaleDateString()
                      : "N/A"}
                  </Text>
                  <Text mb={6}>
                    <b>Citizenship:</b>{" "}
                    {child.citizenship
                      ? getNameById(
                          child.citizenship,
                          lookupData.citizenships,
                          "citizenship"
                        ) || "N/A"
                      : "N/A"}
                  </Text>
                  <Text mb={6}>
                    <b>Ethnicity:</b>{" "}
                    {getNameById(
                      child.nationality,
                      lookupData.nationalities,
                      "nationality"
                    )}
                  </Text>
                  <Text mb={6}>
                    <b>Education Level:</b> {child.education_level || "N/A"}
                  </Text>
                </GridItem>
              ))}
            </Grid>
          </>
        )}

        <Divider />

        {/* Print Button */}
        <Box textAlign="center" pt={4}>
          <Button
            colorScheme="teal"
            onClick={() => window.print()}
            size="lg"
            leftIcon={<Icon as={FaPrint} />}
            _hover={{ bg: "teal.600" }}
            borderRadius="md"
          >
            Print
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default PersonnelPreview;
