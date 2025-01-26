// src/pages/ProgressTracking.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  IconButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, Search2Icon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const stages = [
  "Report to the Section Chief",
  "Report to the Building Admin Office",
  "Report to the Building Security Overseer",
  "Report to PMD IT",
  "Report to Ka Marco Cervantes for Photoshoot",
  "Report Ka Karl Dematera for Instructions on Confidentiality",
  "Submit forms to ATG Office for Approval",
  "Report to the Personnel Office to get the ID",
];

const ProgressTracking = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/personnels/new`);

        // Combine givenname and surname_husband into fullname
        const formattedUsers = response.data.map((user) => ({
          ...user,
          fullname: `${user.givenname || ""} ${
            user.surname_husband || ""
          }`.trim(),
        }));

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers); // Initialize filtered users
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

  const handleUserSelect = async (user) => {
    setLoading(true);
    try {
      // Fetch updated progress of the selected user
      const response = await axios.get(
        `${API_URL}/api/personnels/${user.personnel_id}`
      );
      const updatedUser = response.data;

      setSelectedUser(updatedUser);
      setProgress(updatedUser.personnel_progress || 0); // Set the progress of the selected user
    } catch (error) {
      console.error("Error fetching selected user progress:", error);
      toast({
        title: "Error",
        description: "Failed to load user progress.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (stageIndex) => {
    // Prevent approving already approved stages
    if (stageIndex < progress) {
      toast({
        title: "Already Approved",
        description: `Stage ${stageIndex + 1} has already been approved.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${API_URL}/api/users/update-progress`, {
        personnel_id: selectedUser.personnel_id,
        personnel_progress: stageIndex + 1,
      });

      setProgress(stageIndex + 1); // Update the local progress state
      toast({
        title: "Stage Approved",
        description: `Stage ${stageIndex + 1} approved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error approving stage:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to approve stage. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (stageIndex) => {
    if (stageIndex >= progress) {
      toast({
        title: "Not Approved Yet",
        description: `Stage ${stageIndex + 1} is not approved yet.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${API_URL}/api/users/update-progress`, {
        personnel_id: selectedUser.personnel_id,
        personnel_progress: stageIndex, // Revert progress to the previous stage
      });

      setProgress(stageIndex);
      toast({
        title: "Approval Cancelled",
        description: `Approval for stage ${stageIndex + 1} has been cancelled.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error cancelling stage:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to cancel approval. Please try again.",
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
      const fullname = user.fullname || ""; // Fallback to empty string if null/undefined
      const username = user.username || ""; // Fallback to empty string if null/undefined
      const email = user.email || ""; // Fallback to empty string if null/undefined
      return (
        fullname.toLowerCase().includes(query) ||
        username.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh">
      <Heading as="h1" size="lg" textAlign="center" mb={8}>
        Personnel Progress Tracking
      </Heading>

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
              <Th>Email</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user, index) => (
              <Tr key={user.id}>
                <Td>{index + 1}</Td>
                <Td>{user.fullname || "N/A"}</Td>
                <Td>{user.email_address || "No Email"}</Td>
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

      {/* Progress Tracker for Selected User */}
      {selectedUser ? (
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Tracking Progress for:{" "}
            {selectedUser.givenname + " " + selectedUser.surname_husband}
          </Text>

          <VStack spacing={6} align="stretch">
            {stages.map((stage, index) => (
              <HStack
                key={index}
                bg={progress > index ? "green.100" : "white"}
                borderRadius="md"
                p={4}
                boxShadow="sm"
                justifyContent="space-between"
                align="center"
              >
                <Text
                  fontWeight={progress > index ? "bold" : "normal"}
                  color={progress > index ? "green.800" : "gray.800"}
                >
                  {index + 1}. {stage}
                </Text>
                {/* <HStack>
                  <IconButton
                    icon={<CheckIcon />}
                    colorScheme={progress > index ? "green" : "blue"}
                    isDisabled={progress > index}
                    isLoading={loading && progress === index}
                    onClick={() => handleApprove(index)}
                  />
                  <IconButton
                    icon={<CloseIcon />}
                    colorScheme="red"
                    isDisabled={progress <= index}
                    onClick={() => handleCancel(index)}
                  />
                </HStack> */}
              </HStack>
            ))}
          </VStack>

          <Box mt={8}>
            <Text fontSize="md" fontWeight="bold">
              Overall Progress
            </Text>
            <Progress
              value={(progress / stages.length) * 100}
              colorScheme="green"
              size="lg"
              borderRadius="md"
            />
          </Box>
        </Box>
      ) : (
        <Text>Select a user from the list above to view progress.</Text>
      )}
    </Box>
  );
};

export default ProgressTracking;
