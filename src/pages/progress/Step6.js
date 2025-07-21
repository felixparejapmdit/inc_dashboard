// src/pages/progress/Step6.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  Alert,
  AlertIcon,
  useToast,
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
import axios from "axios";
import useGetNamesByIds from "../../hooks/useGetNamesByIds";
import useLookupData from "../../hooks/useLookupData";

const API_URL = process.env.REACT_APP_API_URL;

const Step6 = () => {
  const [checklist, setChecklist] = useState({
    confidentiality: false,
    informationSheet: false,
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

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/personnels/progress/5`);
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

  // Fetch new personnel list when component mounts
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
    const allChecked = Object.values(checklist).every((item) => item);

    if (!allChecked) {
      toast({
        title: "Verification Failed",
        description: "Please complete all items in the checklist.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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
        personnel_progress: 6, // Update to Step 6
      });
      toast({
        title: "Step Verified",
        description:
          "Instructions on confidentiality and final information check completed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Hide the checklist and personnel panel
      setSelectedUser(null);
      setPersonnelInfo(null);
      setChecklist({
        confidentiality: false,
        informationSheet: false,
      });

      // ✅ Refresh the personnel list
      fetchPersonnel();

      onClose(); // Close the modal after verification
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification.",
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

  const handleUserSelect = async (user) => {
    setSelectedUser(user);

    fetchPersonnelDetails(user.personnel_id);

    onOpen(); // Open the modal to show personnel details
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

  const handleChecklistChange = (field) => {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 6: Report to Ka Karl Dematera for Instructions on Confidentiality
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
                  {/* Display Selected Personnel Info */}

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
                      {`${personnelInfo?.givenname} ${
                        personnelInfo?.middlename || ""
                      } ${personnelInfo?.surname_husband}`}
                    </Text>
                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Gender:</b> {personnelInfo?.gender}
                    </Text>
                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Date of Birth:</b>{" "}
                      {new Date(
                        personnelInfo?.date_of_birth
                      ).toLocaleDateString()}
                    </Text>
                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Email Address:</b> {personnelInfo?.email_address}
                    </Text>
                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Civil Status:</b> {personnelInfo?.civil_status}
                    </Text>
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
                    <Text fontSize="lg" mt={2}>
                      <b>Personnel Type:</b> {personnelInfo?.personnel_type}
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

                    {/* Select All Checkbox */}
                    <Checkbox
                      isChecked={Object.values(checklist).every((item) => item)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedChecklist = {};
                        Object.keys(checklist).forEach((key) => {
                          updatedChecklist[key] = isChecked;
                        });
                        setChecklist(updatedChecklist);
                      }}
                      colorScheme="teal"
                      size="lg"
                      w="100%"
                      fontWeight="bold"
                      mb={2}
                    >
                      Select All
                    </Checkbox>

                    <VStack align="start" spacing={3} w="100%">
                      <Checkbox
                        isChecked={checklist.confidentiality}
                        onChange={() =>
                          handleChecklistChange("confidentiality")
                        }
                        colorScheme="teal"
                        size="lg"
                      >
                        Instructions on confidentiality, correspondences, and
                        personnel office
                      </Checkbox>
                      <Checkbox
                        isChecked={checklist.informationSheet}
                        onChange={() =>
                          handleChecklistChange("informationSheet")
                        }
                        colorScheme="teal"
                        size="lg"
                      >
                        Final checking of information sheet
                      </Checkbox>
                    </VStack>

                    
                  </Flex>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="orange"
                  mr={3}
                  onClick={handleVerify}
                  isDisabled={!Object.values(checklist).every((item) => item)}
                >
                  Verify and Proceed
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedUser(null); // Clear selected user
                    onClose(); // Close the modal
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Step6;
