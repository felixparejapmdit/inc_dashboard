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
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step5 = () => {
  const [photos, setPhotos] = useState({
    twoByTwo: false,
    halfBody: false,
    fullBody: false,
  });
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const toast = useToast();

  // Fetch new personnel list
  useEffect(() => {
    const fetchPersonnel = async () => {
      setLoading(true);
      try {
        //const response = await axios.get(`${API_URL}/api/personnels/new`);
        const response = await axios.get(
          `${API_URL}/api/personnels/progress/4`
        );

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
    const allChecked = Object.values(photos).every((photo) => photo);

    if (!allChecked) {
      toast({
        title: "Verification Failed",
        description: "All required photos must be uploaded.",
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
        personnel_progress: 5, // Update to Step 5
      });
      toast({
        title: "Step Verified",
        description: "Photoshoot and interview verification complete.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  const handlePhotoChange = (field) => {
    setPhotos((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 5: Report to Ka Marco Cervantes for Photoshoot
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
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPersonnel.map((personnel, index) => (
                <Tr key={personnel.id}>
                  <Td>{index + 1}</Td>
                  <Td>{personnel.fullname || "N/A"}</Td>
                  <Td>{personnel.username || "N/A"}</Td>
                  <Td>{personnel.email || "N/A"}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
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
          {/* Checklist */}
          {selectedUser && (
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
                  {personnelInfo.reference_number || "N/A"}
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
                  Photo Checklist
                </Text>
                <VStack align="start" spacing={3} w="100%">
                  <Checkbox
                    isChecked={photos.twoByTwo}
                    onChange={() => handlePhotoChange("twoByTwo")}
                    colorScheme="teal"
                    size="lg"
                  >
                    2x2 Photo
                  </Checkbox>
                  <Checkbox
                    isChecked={photos.halfBody}
                    onChange={() => handlePhotoChange("halfBody")}
                    colorScheme="teal"
                    size="lg"
                  >
                    Half Body Photo
                  </Checkbox>
                  <Checkbox
                    isChecked={photos.fullBody}
                    onChange={() => handlePhotoChange("fullBody")}
                    colorScheme="teal"
                    size="lg"
                  >
                    Full Body Photo
                  </Checkbox>
                </VStack>
                <Button
                  colorScheme="teal"
                  mt={6}
                  size="lg"
                  w="100%"
                  onClick={handleVerify}
                  isDisabled={!Object.values(photos).every((photo) => photo)}
                >
                  Verify and Proceed
                </Button>
              </Flex>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
};

export default Step5;
