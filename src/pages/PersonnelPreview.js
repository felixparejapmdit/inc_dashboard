import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@chakra-ui/react";
import { EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import axios from "axios";

import { FaPrint } from "react-icons/fa"; // Import the desired print icon
const API_URL = process.env.REACT_APP_API_URL;

const PersonnelPreview = () => {
  const { personnelId } = useParams();
  const [personnel, setPersonnel] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [citizenships, setCitizenships] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Fetch data on component load
  useEffect(() => {
    // Helper function to fetch and set data
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await axios.get(`${API_URL}/api/${endpoint}`);
        setter(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData("languages", setLanguages); // Add this line for languages
    fetchData("citizenships", setCitizenships);
    fetchData("nationalities", setNationalities);
    fetchData("departments", setDepartments);
    fetchData("sections", setSections);
    fetchData("subsections", setSubsections);
    fetchData("designations", setDesignations);
    fetchData("districts", setDistricts);
  }, []);

  // Helper function to get the name from the array based on the ID and a custom name field
  const getNameById = (id, array, nameField = "name") => {
    const item = array.find((entry) => entry.id === id);
    return item ? item[nameField] : "N/A"; // Return the name or "N/A" if not found
  };

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnels/${personnelId}`
        );
        setPersonnel(response.data);
      } catch (error) {
        console.error("Error fetching personnel:", error);
      }
    };

    fetchPersonnel();
  }, [personnelId]);

  if (!personnel) {
    return <Text>Loading...</Text>;
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
          position="sticky" // Makes the header sticky
          top="0" // Position it at the top of the viewport
          zIndex="10" // Ensure it stays above other elements
          bg="white" // Maintain background consistency
          boxShadow="md" // Add a subtle shadow for separation
          p={4} // Add padding for spacing
        >
          <HStack alignItems="center" spacing={6}>
            <Avatar
              size="2xl"
              src={`${API_URL}${personnel.avatar || ""}`}
              name={fullName}
            />
            <VStack align="start">
              <Heading size="lg">{fullName}</Heading>
              <Text color="gray.500" fontSize="lg">
                {personnel.personnel_type}
              </Text>
              <Text color="gray.600">{personnel.email_address}</Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Personal Information */}
        <Box>
          <Heading size="md" mb={4}>
            Personal Information
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
            {personnel.wedding_anniversary && (
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

        {/* Another Details */}
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
                <b>Language:</b> {getNameById(personnel.language_id, languages)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Citizenship:</b>{" "}
                {getNameById(
                  personnel.citizenship,
                  citizenships,
                  "citizenship"
                )}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Ethnicity:</b>{" "}
                {getNameById(
                  personnel.nationality,
                  nationalities,
                  "nationality"
                )}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Department:</b>{" "}
                {getNameById(personnel.department_id, departments)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Section:</b> {getNameById(personnel.section_id, sections)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Team:</b> {getNameById(personnel.subsection_id, subsections)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Designation:</b>{" "}
                {getNameById(personnel.designation_id, designations)}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>District:</b> {getNameById(personnel.district_id, districts)}
              </Text>
            </GridItem>

            <GridItem>
              <Text>
                <b>Local Congregation:</b>{" "}
                {personnel.local_congregation || "N/A"}
              </Text>
            </GridItem>
          </Grid>
        </Box>

        <Divider />

        {/* Additional Information Based on Personnel Type */}
        {personnel.personnel_type !== "Minister's Wife" &&
          personnel.personnel_type !== "Lay Member" && (
            <Box>
              <Heading size="md" mb={4}>
                Ministerial Details
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <Text>
                    <b>Personnel Type:</b> {personnel.personnel_type || "N/A"}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text>
                    <b>Assigned Number:</b> {personnel.assigned_number || "N/A"}
                  </Text>
                </GridItem>

                <GridItem>
                  <Text>
                    <b>Ministerial Status:</b>{" "}
                    {personnel.m_status
                      ? personnel.m_status === "May Destino"
                        ? "May Destino"
                        : "Fulltime"
                      : "N/A"}
                  </Text>
                </GridItem>

                {(personnel.personnel_type === "Minister" ||
                  personnel.personnel_type === "Regular") && (
                  <>
                    <GridItem>
                      <Text>
                        <b>Panunumpa Date:</b>{" "}
                        {personnel.panunumpa_date
                          ? new Date(
                              personnel.panunumpa_date
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </Text>
                    </GridItem>

                    {personnel.personnel_type === "Minister" && (
                      <GridItem>
                        <Text>
                          <b>Ordination Date:</b>{" "}
                          {personnel.ordination_date
                            ? new Date(
                                personnel.ordination_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </Text>
                      </GridItem>
                    )}
                  </>
                )}
              </Grid>
            </Box>
          )}

        {personnel.civil_status === "Married" && (
          <Box>
            <Heading size="md" mb={4}>
              Minister's Wife Information
            </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {personnel.wedding_anniversary && (
                <GridItem>
                  <Text>
                    <b>Wedding Anniversary:</b>{" "}
                    {new Date(
                      personnel.wedding_anniversary
                    ).toLocaleDateString()}
                  </Text>
                </GridItem>
              )}
            </Grid>
          </Box>
        )}

        <Divider />

        {/* Divider Above the Print Button */}
        <Box
          borderTop="1px solid"
          borderColor="gray.200"
          mt={8} // Add some margin to separate it from the content above
          pt={4} // Add padding above the button for better spacing
        >
          {/* Print Button */}
          <Button
            colorScheme="teal"
            onClick={() => window.print()}
            width="full"
            size="lg"
            leftIcon={<Icon as={FaPrint} />} // Add the icon here
            _hover={{
              bg: "teal.600",
            }}
            borderRadius="md" // Rounded edges for consistency
          >
            Print
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default PersonnelPreview;
