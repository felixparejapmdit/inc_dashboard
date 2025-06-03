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
import { CheckIcon, Search2Icon, CloseIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";
import { MdTrackChanges } from "react-icons/md"; // Import Track Icon

const API_URL = process.env.REACT_APP_API_URL;

const stages = [
  "Report to the Section Chief",
  "Report to the Building Admin Office",
  "Report to the Building Security Overseer",
  "Report to PMD IT",
  "Report to ATG Office 1 for Photoshoot",
  "Report to ATG Office 2 for Confidentiality",
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
              // <Tr key={user.id}>
              <Tr key={`${user.id}-${index}`}>
                <Td>{index + 1}</Td>
                <Td>{user.fullname || "N/A"}</Td>
                <Td>{user.email_address || "No Email"}</Td>
                <Td>
                  <Button
                    leftIcon={<MdTrackChanges />}
                    colorScheme="orange"
                    size="sm"
                    mr={2}
                    onClick={() => handleUserSelect(user)}
                  >
                    Track
                  </Button>

                  <IconButton
                    icon={<ViewIcon />}
                    aria-label="Print"
                    colorScheme="yellow"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/personnel-preview/${user.personnel_id}`,
                        "_blank"
                      )
                    }
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Right: Progress Sidebar */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 50 }}>
        <Box
          position="fixed"
          top="0"
          right="0"
          height="100vh"
          width={{ base: "100%", sm: "400px" }} // Responsive width
          bgGradient="linear(to-b, white, orange.50)" // Gradient effect
          p={6}
          boxShadow="2xl"
          borderLeft="8px solid orange"
          display="flex"
          flexDirection="column"
          transition="all 0.3s ease-in-out"
        >
          {/* Close Button at the Upper Right */}
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close Progress Tracking"
            colorScheme="red"
            position="absolute"
            top="10px"
            right="10px"
            size="md"
            variant="ghost"
            _hover={{ bg: "red.200", transform: "scale(1.1)" }}
            onClick={onClose}
          />

          <Box mt={6}>
            {selectedUser ? (
              <>
                <Heading size="md" mb={2} color="orange.600">
                  Tracking Progress
                </Heading>

                <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                  {selectedUser.givenname} {selectedUser.surname_husband}
                </Text>

                <VStack spacing={3} align="stretch">
                  {stages.map((stage, index) => (
                    <HStack
                      key={index}
                      p={4}
                      bg={progress > index ? "green.100" : "red.100"}
                      borderRadius="md"
                      boxShadow="md"
                      transition="all 0.2s ease-in-out"
                      _hover={{ transform: "scale(1.02)", boxShadow: "lg" }}
                    >
                      <Box>
                        {progress > index ? (
                          <CheckIcon color="green.600" boxSize={5} /> // ✔ Check Icon for completed
                        ) : (
                          <CloseIcon color="red.500" boxSize={5} /> // ✖ X Icon for incomplete
                        )}
                      </Box>
                      <Text
                        fontSize="md"
                        fontWeight={progress > index ? "bold" : "normal"}
                        color={progress > index ? "green.700" : "red.700"}
                      >
                        {stage}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                <Divider my={4} />

                <Text
                  fontSize="sm"
                  textAlign="center"
                  fontWeight="bold"
                  color="gray.600"
                >
                  Overall Progress:{" "}
                  {((progress / stages.length) * 100).toFixed(0)}%
                </Text>
              </>
            ) : (
              <Text>Select a user to see progress.</Text>
            )}
          </Box>
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
