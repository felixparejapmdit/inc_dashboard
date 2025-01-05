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
} from "@chakra-ui/react";
import { EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const PersonnelPreview = () => {
  const { personnelId } = useParams();
  const [personnel, setPersonnel] = useState(null);

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
                {new Date(personnel.date_of_birth).toLocaleDateString()}
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

        {/* Employment Details */}
        <Box>
          <Heading size="md" mb={4}>
            Employment Details
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <Text>
                <b>Department:</b> {personnel.department_id || "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Designation:</b> {personnel.designation_id || "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>Local Congregation:</b>{" "}
                {personnel.local_congregation || "N/A"}
              </Text>
            </GridItem>
            <GridItem>
              <Text>
                <b>District:</b> {personnel.district_id || "N/A"}
              </Text>
            </GridItem>
            {personnel.datejoined && (
              <GridItem>
                <Text>
                  <b>Date Joined:</b>{" "}
                  {new Date(personnel.datejoined).toLocaleDateString()}
                </Text>
              </GridItem>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* Additional Information Based on Personnel Type */}
        {personnel.personnel_type === "Minister" && (
          <Box>
            <Heading size="md" mb={4}>
              Ministerial Information
            </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <Text>
                  <b>Ministerial Status:</b> {personnel.m_status || "N/A"}
                </Text>
              </GridItem>
              <GridItem>
                <Text>
                  <b>Panunumpa Date:</b>{" "}
                  {personnel.panunumpa_date
                    ? new Date(personnel.panunumpa_date).toLocaleDateString()
                    : "N/A"}
                </Text>
              </GridItem>
              <GridItem>
                <Text>
                  <b>Ordination Date:</b>{" "}
                  {personnel.ordination_date
                    ? new Date(personnel.ordination_date).toLocaleDateString()
                    : "N/A"}
                </Text>
              </GridItem>
            </Grid>
          </Box>
        )}

        {personnel.personnel_type === "Minister's Wife" && (
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

        {/* Print Button */}
        <Button
          colorScheme="teal"
          onClick={() => window.print()}
          width="full"
          size="lg"
        >
          Print
        </Button>
      </VStack>
    </Box>
  );
};

export default PersonnelPreview;
