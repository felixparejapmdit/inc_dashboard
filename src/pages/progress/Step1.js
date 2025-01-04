// src/pages/progress/Step1.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  HStack,
  Flex,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Divider,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step1 = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const [search, setSearch] = useState("");
  const toast = useToast();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/personnels/new`);
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUsers();
  }, [toast]);

  // Fetch personnel details
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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    const filtered = users.filter((user) => {
      const fullname = user.fullname ? user.fullname.toLowerCase() : "";
      const username = user.username ? user.username.toLowerCase() : "";
      const email = user.email ? user.email.toLowerCase() : "";

      return (
        fullname.includes(query) ||
        username.includes(query) ||
        email.includes(query)
      );
    });

    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchPersonnelDetails(user.personnel_id);
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
      // Update progress using your provided endpoint
      await axios.put(`${API_URL}/api/users/update-progress`, {
        personnel_id: selectedUser.personnel_id,
        personnel_progress: 1, // Update to the next stage or as required
      });

      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "Section Chief has verified the personnel.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 1: Report to Section Chief
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <>
          {/* Searchable User List */}
          <Box mb={6}>
            <Input
              placeholder="Search by fullname, username, or email"
              value={search}
              onChange={handleSearch}
              mb={4}
              size="lg"
              variant="outline"
            />
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Full Name</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user, index) => (
                  <Tr key={user.id}>
                    <Td>{index + 1}</Td>
                    <Td>{user.fullname || "N/A"}</Td>
                    <Td>{user.username || "N/A"}</Td>
                    <Td>{user.email || "N/A"}</Td>
                    <Td>
                      <Button
                        leftIcon={<Search2Icon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleUserSelect(user)}
                      >
                        Evaluate
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Personnel Information */}
          {personnelInfo && (
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
                <Text fontSize="lg" mb={2}>
                  <b>Reference Number:</b> {personnelInfo.reference_number}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Name:</b>{" "}
                  {`${personnelInfo.givenname} ${
                    personnelInfo.middlename || ""
                  } ${personnelInfo.surname_husband}`}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Gender:</b> {personnelInfo.gender}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Date of Birth:</b>{" "}
                  {new Date(personnelInfo.date_of_birth).toLocaleDateString()}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Email Address:</b> {personnelInfo.email_address}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Civil Status:</b> {personnelInfo.civil_status}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Department:</b> {personnelInfo.department_id || "N/A"}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Designation:</b> {personnelInfo.designation_id || "N/A"}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>District:</b> {personnelInfo.district_id || "N/A"}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Local Congregation:</b>{" "}
                  {personnelInfo.local_congregation || "N/A"}
                </Text>
                <Divider />
                <Text fontSize="lg" mt={2}>
                  <b>Personnel Type:</b> {personnelInfo.personnel_type}
                </Text>
              </Box>

              {/* Additional Fields Based on Personnel Type */}
              {personnelInfo.personnel_type !== "Minister's Wife" &&
                personnelInfo.personnel_type !== "Lay Member" && (
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
                          value={personnelInfo.assigned_number || ""}
                          readOnly
                          flex="1"
                        />
                      </Flex>

                      <Text>
                        <b>Ministerial Status:</b>
                      </Text>
                      <HStack spacing={4}>
                        <Checkbox
                          isChecked={personnelInfo.m_status === "May Destino"}
                          isReadOnly
                        >
                          May Destino
                        </Checkbox>
                        <Checkbox
                          isChecked={personnelInfo.m_status === "Fulltime"}
                          isReadOnly
                        >
                          Fulltime
                        </Checkbox>
                      </HStack>
                      {(personnelInfo.personnel_type === "Minister" ||
                        personnelInfo.personnel_type === "Regular") && (
                        <>
                          <Flex align="center" w="100%" mb={4}>
                            <Text fontWeight="bold" minWidth="150px" mr={2}>
                              Panunumpa Date:
                            </Text>
                            <Input
                              value={
                                personnelInfo.panunumpa_date
                                  ? new Date(
                                      personnelInfo.panunumpa_date
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

                          {personnelInfo.personnel_type === "Minister" && (
                            <>
                              <Text>
                                <b>Ordination Date:</b>
                              </Text>
                              <Input
                                type="date"
                                value={
                                  personnelInfo.ordination_date
                                    ? new Date(personnelInfo.ordination_date)
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

              <Divider />
              <Checkbox
                isChecked={isVerified}
                isDisabled={!selectedUser?.personnel_id}
                colorScheme="teal"
                size="lg"
              >
                Enrollment Verified
              </Checkbox>
              <Button
                colorScheme="teal"
                size="lg"
                w="100%"
                isDisabled={!selectedUser?.personnel_id || isVerified}
                onClick={handleVerify}
              >
                Verify and Proceed
              </Button>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default Step1;
