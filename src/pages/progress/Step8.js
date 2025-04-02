// src/pages/progress/Step8.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import ScanRFIDQRBarcode from "./ScanRFIDQRBarcode"; // Import the scan component

const API_URL = process.env.REACT_APP_API_URL;

const Step8 = ({ onScanComplete }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const toast = useToast();
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [rfidInput, setRfidInput] = useState("");

  // Fetch personnel list
  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      //const response = await axios.get(`${API_URL}/api/personnels/new`);
      const response = await axios.get(`${API_URL}/api/personnels/progress/7`);
      setPersonnelList(response.data);
      setFilteredPersonnel(response.data);
    } catch (error) {
      console.error("Error fetching personnel list:", error);
      toast({
        title: "Error",
        description: "Failed to fetch personnel list.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPersonnel();
  }, [toast]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = personnelList.filter(
      (personnel) =>
        personnel.fullname?.toLowerCase().includes(query) ||
        personnel.username?.toLowerCase().includes(query) ||
        personnel.email?.toLowerCase().includes(query)
    );
    setFilteredPersonnel(filtered);
  };

  const handleVerify = async () => {
    if (!selectedUser?.personnel_id) {
      toast({
        title: "Verification Failed",
        description: "No personnel selected for verification.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/users/update-progress`, {
        personnel_id: selectedUser.personnel_id,
        personnel_progress: 8, // Update to Step 8
      });

      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "ID issued successfully by the Personnel Office.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Refresh personnel list after verification
      fetchPersonnel();

      // ✅ Hide selected personnel info and checklist panel
      setSelectedUser(null);
      setPersonnelInfo(null);
      setIsVerified(true);
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while issuing the ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(
        `${API_URL}/api/personnels/${user.personnel_id}`
      );
      setPersonnelInfo(response.data);
    } catch (error) {
      console.error("Error fetching personnel information:", error);
      toast({
        title: "Error",
        description: "Failed to fetch personnel information.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setPersonnelInfo(null);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setIsCheckboxChecked(e.target.checked);
    if (!e.target.checked) {
      setRfidInput(""); // Clear input when unchecked
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setRfidInput(e.target.value);
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 8: Report to the Personnel Office to Get the ID
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <>
          {/* Search Input */}
          <Input
            placeholder="Search by fullname, username, or email"
            value={search}
            onChange={handleSearch}
            mb={4}
            size="lg"
            variant="outline"
          />
          {/* Personnel List */}
          <Table variant="striped" colorScheme="gray" mb={6}>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Full Name</Th>
                <Th>Email</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPersonnel.map((personnel, index) => (
                <Tr key={personnel.id}>
                  <Td>{index + 1}</Td>
                  <Td>{personnel.fullname || "N/A"}</Td>
                  <Td>{personnel.email_address || "N/A"}</Td>
                  <Td>
                    <Button
                      colorScheme="orange"
                      size="sm"
                      onClick={() => handleUserSelect(personnel)}
                    >
                      Select
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {/* Personnel Information and Verification */}
          {selectedUser && (
            <VStack
              align="start"
              spacing={6}
              w="100%"
              maxWidth="600px"
              mx="auto"
            >
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="teal.500"
                textAlign="center"
                w="100%"
              >
                Personnel Information
              </Text>
              <Box
                p={6}
                bg="white"
                borderRadius="lg"
                boxShadow="lg"
                border="1px solid"
                borderColor="gray.200"
                w="100%"
              >
                <Text>
                  <b>Reference Number:</b>{" "}
                  {personnelInfo?.reference_number || "N/A"}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Name:</b>{" "}
                  {`${personnelInfo?.givenname || ""} ${
                    personnelInfo?.middlename || ""
                  } ${personnelInfo?.surname_husband || ""}`}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Email Address:</b> {personnelInfo?.email_address || "N/A"}
                </Text>
              </Box>
              {/* Checklist */}
              <Flex
                direction="column"
                align="center"
                justify="center"
                w="100%"
                bg="white"
                p={6}
                borderRadius="lg"
                boxShadow="md"
                maxWidth="500px"
                mx="auto"
              >
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                  Checklist
                </Text>

                {/* ID Issued Checkbox */}
                <Checkbox
                  isChecked={isCheckboxChecked}
                  onChange={handleCheckboxChange}
                  colorScheme="teal"
                  size="lg"
                >
                  ID Issued
                </Checkbox>

                {/* Show Scan Component if checkbox is checked */}
                {isCheckboxChecked && (
                  <ScanRFIDQRBarcode
                    onScanComplete={(code) => setRfidInput(code)}
                  />
                )}

                {/* Submit Button */}
                <Button
                  colorScheme="orange"
                  mt={6}
                  size="lg"
                  w="100%"
                  onClick={handleVerify}
                  isDisabled={!isCheckboxChecked || !rfidInput.trim()} // ✅ Both must be true
                >
                  Issue ID and Complete Process
                </Button>
              </Flex>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default Step8;
