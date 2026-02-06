// src/pages/progress/Step7.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  HStack,
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
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";

import { Search2Icon, SearchIcon, CheckIcon } from "@chakra-ui/icons";

import {
  fetchData,
  fetchEnrollData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;

const Step7 = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch personnel list

  const fetchPersonnel = () => {
    setLoading(true);
    fetchEnrollData(
      "personnels/progress",
      (data) => {
        setPersonnelList(data);
        setFilteredPersonnel(data);
      },
      (errorMsg) => {
        toast({
          title: "Error",
          description: "Failed to fetch personnel list.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
      "Failed to fetch personnel list",
      6 // 👉 progress param
    ).finally(() => {
      setLoading(false);
    });
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

  const handleVerify = async (selectedUser) => {
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
      await putData(
        "users/update-progress",
        {
          personnel_id: selectedUser.personnel_id,
          personnel_progress: 7, // Step 7
        },
        "Failed to verify personnel"
      );

      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "Forms submitted to ATG Office for approval.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Refresh the personnel list after verification
      fetchPersonnel();

      // ✅ Clear selected user & personnel panel after verification
      setSelectedUser(null);
      setPersonnelInfo(null);
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while submitting the forms.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonnelDetails = async (personnelId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/personnels/${personnelId}`
      );
      setPersonnelInfo(response.data);
      setIsVerified(response.data.isVerified || false);
    } catch (error) {
      console.error("Error fetching personnel details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch personnel details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={0}>
          <Heading size="lg">Step 7: Submit Forms to ATG Office for Approval</Heading>
          <Text color="gray.500" fontSize="sm">Final documentation review and office clearance</Text>
        </VStack>
        <HStack spacing={2}>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => navigate("/progress/step6")}
            variant="ghost"
            size="sm"
          >
            Previous Step
          </Button>
          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={() => navigate("/progress/step8")}
            colorScheme="blue"
            size="sm"
          >
            Next Step
          </Button>
        </HStack>
      </HStack>
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
                // <Tr key={personnel.id}>
                <Tr key={`${personnel.id}-${index}`}>
                  <Td>{index + 1}</Td>
                  <Td>{personnel.fullname || "N/A"}</Td>
                  <Td>{personnel.email_address || "N/A"}</Td>
                  <Td>
                    <IconButton
                      aria-label="Verify and Proceed"
                      icon={<CheckIcon />} // Use an icon that represents verification
                      colorScheme="teal"
                      size="sm"
                      isDisabled={
                        parseInt(personnel.personnel_progress, 10) === 0
                      } // Disable if personnel_progress is 0
                      onClick={() => handleVerify(personnel)}
                    />
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
                  {`${personnelInfo?.givenname || ""} ${personnelInfo?.middlename || ""
                    } ${personnelInfo?.surname_husband || ""}`}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Email Address:</b> {personnelInfo?.email_address || "N/A"}
                </Text>
              </Box>
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
                <Checkbox
                  isChecked={isVerified}
                  isDisabled
                  colorScheme="teal"
                  size="lg"
                >
                  Forms Submitted
                </Checkbox>
                <Button
                  colorScheme="teal"
                  mt={6}
                  size="lg"
                  w="100%"
                  onClick={handleVerify}
                  isDisabled={isVerified}
                >
                  Submit and Proceed
                </Button>
              </Flex>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default Step7;
