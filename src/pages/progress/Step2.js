import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  useToast,
  HStack,
  Flex,
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
import useLookupData from "../../hooks/useLookupData";
import getNamesByIds from "../../utils/getNamesByIds";

import {
  fetchData,
  fetchEnrollData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import { filterPersonnelData } from "../../utils/filterUtils";

const API_URL = process.env.REACT_APP_API_URL;

const Step2 = () => {
  const [checklist, setChecklist] = useState({
    workArea: false,
    officeDesignation: false,
    officemates: false,
    healthConcerns: false,
    cleanliness: false,
    firePrevention: false,
    appliances: false,
  });
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchPersonnel = () => {
    setLoading(true);
    fetchEnrollData(
      "personnels/progress",
      (data) => {
        // ✅ Apply RBAC Filter
        data = filterPersonnelData(data);
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
      1 // 👉 progress param
    ).finally(() => {
      setLoading(false);
    });
  };

  // Call fetchUsers() inside useEffect()
  useEffect(() => {
    fetchPersonnel();
  }, []);

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

  const handleChecklistChange = (field) => {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
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
      // ✅ Use the updated putData with full payload
      await putData(
        "users/update-progress",
        {
          personnel_id: selectedUser.personnel_id,
          personnel_progress: 2, // Step 2
        },
        "Failed to verify personnel"
      );

      toast({
        title: "Step Verified",
        description: "Building Admin Office verification complete.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Hide Personnel Info and Checklist After Verification
      setSelectedUser(null);
      setPersonnelInfo(null);

      // ✅ Refresh the personnel table using same pattern
      fetchEnrollData(
        "personnels/progress", // endpoint
        (data) => {
          // ✅ Apply RBAC Filter
          data = filterPersonnelData(data);
          setPersonnelList(data);
          setFilteredPersonnel(data);
        },
        () =>
          toast({
            title: "Error",
            description: "Failed to refresh personnel list.",
            status: "error",
            duration: 3000,
            isClosable: true,
          }),
        "Failed to fetch personnel list", // custom error message
        1, // param (appended like /personnels/progress/1)
        () => setLoading(false) // optional finally block if needed
      );

      // ✅ Close modal
      onClose();
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while verifying the personnel.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch personnel details
  const fetchPersonnelDetails = (personnelId) => {
    setLoading(true);
    fetchEnrollData(
      `personnels`, // endpoint
      (data) => {
        setPersonnelInfo(data);
        setIsVerified(data.isVerified || false);
        setLoading(false);
      },
      () => {
        toast({
          title: "Error",
          description: "Failed to fetch personnel details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      },
      "Failed to fetch personnel details",
      personnelId // parameter appended to the endpoint
    );
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);

    onOpen(); // 👈 open modal immediately

    fetchPersonnelDetails(user.personnel_id);

    setChecklist({
      workArea: false,
      officeDesignation: false,
      officemates: false,
      healthConcerns: false,
      cleanliness: false,
      firePrevention: false,
      appliances: false,
    });

    fetchEnrollData(
      "personnels",
      (data) => {
        setPersonnelInfo(data);
      },
      () => {
        toast({
          title: "Error",
          description: "Failed to fetch personnel information.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setPersonnelInfo(null);
      },
      "Failed to fetch personnel information",
      user.personnel_id
    );
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={0}>
          <Heading size="lg">Step 2: Report to Building Admin Office</Heading>
          <Text color="gray.500" fontSize="sm">Checklist and facility orientation</Text>
        </VStack>
        <HStack spacing={2}>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => navigate("/progress/step1")}
            variant="ghost"
            size="sm"
          >
            Previous Step
          </Button>
          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={() => navigate("/progress/step3")}
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
                      {`${personnelInfo?.givenname} ${personnelInfo?.middlename || ""
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
                      <b>Department: </b>
                      {getNamesByIds(
                        personnelInfo?.department_id,
                        lookupData.departments
                      )}
                    </Text>
                    <Divider />
                    <Text fontSize="lg" mt={2}>
                      <b>Designation: </b>
                      {getNamesByIds(
                        personnelInfo?.designation_id,
                        lookupData.designations
                      )}
                    </Text>
                    <Divider />

                    <Text fontSize="lg" mt={2}>
                      <b>District: </b>
                      {getNamesByIds(
                        personnelInfo?.district_id,
                        lookupData.districts
                      )}
                    </Text>
                    <Divider />

                    <Text fontSize="lg" mt={2}>
                      <b>Local Congregation: </b>
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
                  {personnelInfo?.personnel_type !== "Minister's Wife" &&
                    personnelInfo?.personnel_type !== "Lay Member" &&
                    personnelInfo?.personnel_type !== "Volunteer" && (
                      <Box
                        p={6}
                        bg="white"
                        borderRadius="lg"
                        boxShadow="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        w="100%"
                      >
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="teal.500"
                          mb={4}
                        >
                          Additional Information
                        </Text>
                        <VStack align="start" spacing={4}>
                          <Flex align="center" w="100%" mb={4}>
                            <Text fontWeight="bold" minWidth="150px">
                              Assigned Number:
                            </Text>
                            <Input
                              placeholder="Enter Assigned Number"
                              value={personnelInfo?.assigned_number || ""}
                              readOnly
                              flex="1"
                            />
                          </Flex>

                          <Text>
                            <b>Ministerial Status:</b>
                          </Text>
                          <HStack spacing={4}>
                            <Checkbox
                              isChecked={
                                personnelInfo?.m_status === "May Destino"
                              }
                              isReadOnly
                            >
                              May Destino
                            </Checkbox>
                            <Checkbox
                              isChecked={personnelInfo?.m_status === "Fulltime"}
                              isReadOnly
                            >
                              Fulltime
                            </Checkbox>
                          </HStack>
                          {(personnelInfo?.personnel_type === "Minister" ||
                            personnelInfo?.personnel_type === "Regular") && (
                              <>
                                <Flex align="center" w="100%" mb={4}>
                                  <Text fontWeight="bold" minWidth="150px" mr={2}>
                                    Panunumpa Date:
                                  </Text>
                                  <Input
                                    value={
                                      personnelInfo?.panunumpa_date
                                        ? new Date(
                                          personnelInfo?.panunumpa_date
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                        : ""
                                    }
                                    readOnly
                                    flex="1"
                                    textOverflow="ellipsis"
                                    placeholder="N/A"
                                  />
                                </Flex>

                                {personnelInfo?.personnel_type === "Minister" && (
                                  <>
                                    <Text>
                                      <b>Ordination Date:</b>
                                    </Text>
                                    <Input
                                      type="date"
                                      value={
                                        personnelInfo?.ordination_date
                                          ? new Date(
                                            personnelInfo?.ordination_date
                                          )
                                            .toISOString()
                                            .split("T")[0]
                                          : ""
                                      }
                                      readOnly
                                    />
                                  </>
                                )}
                              </>
                            )}
                        </VStack>
                      </Box>
                    )}
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
                    {/* Checklist Title */}
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

                    {/* Individual Checkboxes */}
                    <VStack align="start" spacing={3} w="100%">
                      {Object.keys(checklist).map((key) => (
                        <Checkbox
                          key={key}
                          isChecked={checklist[key]}
                          onChange={() => handleChecklistChange(key)}
                          colorScheme="teal"
                          size="lg"
                          w="100%"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Checkbox>
                      ))}
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

export default Step2;
