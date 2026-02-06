// src/pages/progress/Step8.js
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
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";
import useGetNamesByIds from "../../hooks/useGetNamesByIds";
import useLookupData from "../../hooks/useLookupData";

import { usePermissionContext } from "../../contexts/PermissionContext";
import { FiCheck, FiX } from "react-icons/fi";

import ScanRFIDQRBarcode from "./ScanRFIDQRBarcode"; // Import the scan component

import {
  fetchData,
  fetchEnrollData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;

const Step8 = ({ onScanComplete }) => {
  const [checklist, setChecklist] = useState({
    id_issued: false,
  });

  const { getNamesByIds } = useGetNamesByIds();

  const lookupData = useLookupData();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [rfidInput, setRfidInput] = useState("");
  const { hasPermission } = usePermissionContext(); // Correct usage
  const userGroupName = localStorage.getItem("userGroupName");
  const isAdmin = userGroupName === "Admin"; // Check if user is Admin

  const { isOpen, onOpen, onClose } = useDisclosure();
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
      7 // 👉 progress param
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
      await putData(
        "users/update-progress",
        {
          personnel_id: selectedUser.personnel_id,
          personnel_progress: 8, // Step 8
          rfid_code: rfidInput, // <-- include scanned RFID
        },
        "Failed to verify personnel"
      );

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
      onClose(); // Close the modal after verification
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

    onOpen(); // Open the modal to show personnel info
    fetchEnrollData(
      "personnels",
      (data) => {
        setPersonnelInfo(data);
      },
      () =>
        toast({
          title: "Error",
          description: "Failed to fetch personnel information.",
          status: "error",
          duration: 3000,
          isClosable: true,
        }),
      "Failed to fetch personnel information",
      user.personnel_id
    );
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
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={0}>
          <Heading size="lg">Step 8: Report to the Personnel Office to Get the ID</Heading>
          <Text color="gray.500" fontSize="sm">Final step: Identification issuance and system activation</Text>
        </VStack>
        <HStack spacing={2}>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => navigate("/progress/step7")}
            variant="ghost"
            size="sm"
          >
            Previous Step
          </Button>
          <Button
            onClick={() => navigate("/progresstracking")}
            colorScheme="green"
            size="sm"
          >
            Go to Progress Tracker
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
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            scrollBehavior="inside"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Personnel Checklist</ModalHeader>
              <ModalCloseButton />

              <ModalBody>
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
                      <b>Email Address:</b>{" "}
                      {personnelInfo?.email_address || "N/A"}
                    </Text>

                    <Divider />
                    {personnelInfo && (
                      <Text fontSize="lg" mt={2}>
                        <b>Civil Status:</b>{" "}
                        {personnelInfo?.civil_status || "N/A"}
                      </Text>
                    )}

                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Department:</b>{" "}
                      {getNamesByIds(
                        personnelInfo?.department_id,
                        lookupData.departments
                      )}
                    </Text>
                    <Divider />

                    <Text fontSize="lg" mt={2}>
                      <b>Designation:</b>{" "}
                      {getNamesByIds(
                        personnelInfo?.designation_id,
                        lookupData.designations
                      )}
                    </Text>
                    <Divider />

                    <Text fontSize="lg" mt={2}>
                      <b>District:</b>{" "}
                      {getNamesByIds(
                        personnelInfo?.district_id,
                        lookupData.districts
                      )}
                    </Text>
                    <Divider />

                    <Text fontSize="lg" mt={2}>
                      <b>Local Congregation:</b>{" "}
                      {getNamesByIds(
                        personnelInfo?.local_congregation,
                        lookupData.localCongregations
                      )}
                    </Text>

                    <Divider />
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
                  </Flex>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Flex w="100%" gap={4}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(null); // Clear selected user
                      onClose(); // Close the modal
                    }}
                    flex={1}
                    size="lg"
                    leftIcon={<FiX />}
                    colorScheme="gray"
                  >
                    Close
                  </Button>
                  {/* Submit Button */}
                  <Button
                    colorScheme="orange"
                    size="lg"
                    flex={1}
                    onClick={handleVerify}
                    isDisabled={!isCheckboxChecked || (!isAdmin && !rfidInput.trim())} // ✅ Admins can bypass scan
                    leftIcon={<FiCheck />}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Issue ID & Complete
                  </Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Step8;
