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
  Flex,
  Divider,
  Slide,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckIcon, Search2Icon } from "@chakra-ui/icons";
import axios from "axios";
import { MdTrackChanges } from "react-icons/md"; // Import Track Icon

const API_URL = process.env.REACT_APP_API_URL;

const stages = [
  "Report to the Section Chief",
  "Report to the Building Admin Office",
  "Report to the Building Security Overseer",
  "Report to PMD IT",
  "Report to Ka Marco Cervantes for Photoshoot",
  "Report to Ka Karl Dematera for Confidentiality",
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

  // Chakra UI Hook for Slide Panel Control
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/personnels/new`);
        const formattedUsers = response.data.map((user) => ({
          ...user,
          fullname: `${user.givenname || ""} ${
            user.surname_husband || ""
          }`.trim(),
        }));

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
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
      const response = await axios.get(
        `${API_URL}/api/personnels/${user.personnel_id}`
      );
      const updatedUser = response.data;

      setSelectedUser(updatedUser);
      setProgress(updatedUser.personnel_progress || 0);
      onOpen(); // Open the sidebar when selecting a user
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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = users.filter((user) => {
      const fullname = user.fullname || "";
      const email = user.email || "";
      return (
        fullname.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  };

  return (
    <Flex p={6} bg="gray.50" minHeight="100vh">
      {/* Left: Personnel Table */}
      <Box flex="2" pr={6}>
        <Heading as="h1" size="lg" textAlign="center" mb={6}>
          Personnel Progress Tracking
        </Heading>

        {/* Search Input */}
        <Input
          placeholder="Search by fullname or email"
          value={search}
          onChange={handleSearch}
          mb={4}
          size="lg"
          variant="outline"
        />

        {/* Personnel List Table */}
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
                    leftIcon={<MdTrackChanges />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleUserSelect(user)}
                  >
                    Track
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Right: Progress Sidebar */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 20 }}>
        <Box
          position="fixed"
          top="0"
          right="0"
          height="100vh"
          width={{ base: "100%", sm: "400px" }} // Responsive width
          bg="white"
          p={6}
          boxShadow="lg"
          borderLeft="4px solid teal"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            {selectedUser ? (
              <>
                <Heading size="md" mb={4} color="teal.600">
                  Tracking Progress
                </Heading>

                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  {selectedUser.givenname} {selectedUser.surname_husband}
                </Text>

                <VStack spacing={4} align="stretch">
                  {stages.map((stage, index) => (
                    <HStack
                      key={index}
                      p={3}
                      bg={progress > index ? "green.100" : "gray.100"}
                      borderRadius="md"
                    >
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="50%"
                        bg={progress > index ? "green.500" : "gray.400"}
                        boxShadow={
                          progress > index ? "0px 0px 6px green" : "none"
                        }
                      />
                      <Text
                        fontSize="sm"
                        fontWeight={progress > index ? "bold" : "normal"}
                        color={progress > index ? "green.700" : "gray.700"}
                      >
                        {stage}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </>
            ) : (
              <Text>Select a user to see progress.</Text>
            )}
          </Box>

          {/* Close Button */}
          <Button colorScheme="red" onClick={onClose} mt={4} w="100%">
            Close
          </Button>
        </Box>
      </Slide>

      {/* Background Overlay (Click Outside to Close) */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100%"
          h="100vh"
          bg="blackAlpha.500"
          zIndex="10"
          onClick={onClose}
        />
      )}
    </Flex>
  );
};

export default ProgressTracking;
