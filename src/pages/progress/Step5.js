// src/pages/progress/Step5.js
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
  Image, // ✅ Add Image here
} from "@chakra-ui/react";
import axios from "axios";

import { usePermissionContext } from "../../contexts/PermissionContext";

import Photoshoot from "./Photoshoot"; // Import Photoshoot component

const API_URL = process.env.REACT_APP_API_URL;

const Step5 = () => {
  const [photos, setPhotos] = useState({
    twoByTwo: false,
    halfBody: false,
    fullBody: false,
  });
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [personnelInfo, setPersonnelInfo] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false); // Manage Photoshoot modal
  const [showChecklist, setShowChecklist] = useState(false);

  const [personnelImages, setPersonnelImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: 2x2, Step 2: Half Body, Step 3: Full Body

  const { hasPermission } = usePermissionContext(); // Correct usage

  const toast = useToast();

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      //const response = await axios.get(`${API_URL}/api/personnels/new`);
      const response = await axios.get(`${API_URL}/api/personnels/progress/4`);

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

  // const fetchPersonnelImages = async (personnelId) => {
  //   try {
  //     const response = await axios.get(
  //       `${API_URL}/api/personnel_images/${personnelId}`
  //     );
  //     if (response.data.success) {
  //       setPersonnelImages(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching personnel images:", error);
  //   }
  // };

  const fetchPersonnelImages = async (personnelId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/personnel_images/${personnelId}`
      );

      if (response.data.success) {
        const imagesByType = {};

        // Debugging: Log the API response
        console.log("Fetched Personnel Images:", response.data.data);

        // Store images based on type
        response.data.data.forEach((img) => {
          imagesByType[img.type.trim()] = `${API_URL}${img.image_url}`;
        });

        setPersonnelImages(imagesByType); // Store images in state

        // Debugging: Log the mapped images
        console.log("Mapped Personnel Images:", imagesByType);
      }
    } catch (error) {
      console.error("Error fetching personnel images:", error);
    }
  };

  // Open Photoshoot Modal and Fetch Images
  const openPhotoshootModal = (user) => {
    setSelectedUser(user);
    setIsPhotoModalOpen(true);
    fetchPersonnelImages(user.personnel_id); // Fetch images on modal open
  };

  // Determine Image URL based on Step
  // const getCurrentImage = () => {
  //   const imageTypes = [
  //     "2x2 Picture",
  //     "Half Body Picture",
  //     "Full Body Picture",
  //   ];
  //   const selectedType = imageTypes[currentStep - 1];

  //   const foundImage = personnelImages.find((img) => img.type === selectedType);
  //   return foundImage
  //     ? `${API_URL}${foundImage.image_url}`
  //     : `${API_URL}/uploads/avatar/default.png`;
  // };

  // Fetch new personnel list when component mounts
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

  const handleVerify = async () => {
    if (!selectedUser || !selectedUser.personnel_id) {
      toast({
        title: "Verification Failed",
        description: "Please select a personnel before verifying.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const allChecked = Object.values(photos).every((photo) => photo);

    if (!allChecked && !hasPermission("progress.photoshoot_access")) {
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

      // Refresh table after verification
      fetchPersonnel();

      // ✅ Hide Personnel Info and Checklist After Verification
      setSelectedUser(null);
      setPersonnelInfo(null);
      // ✅ Hide the checklist panel after verification
      setShowChecklist(false);
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

    setSelectedUser(user);
    setShowChecklist(true);

    // ✅ Fetch images when a user is selected
    fetchPersonnelImages(user.personnel_id);
  };

  const handlePhotoChange = (field) => {
    setPhotos((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const imageMapping = {
    twoByTwo: "2x2 Picture",
    halfBody: "Half Body Picture",
    fullBody: "Full Body Picture",
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
                      onClick={() => handleUserSelect(personnel)} // Only selects personnel
                    >
                      Select
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {selectedUser && ( // Only show when a personnel is selected
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

              {/* Upload Photos Button - Opens Modal */}
              <Button
                colorScheme="blue"
                size="md"
                w="100%"
                mb={4}
                onClick={() => setIsPhotoModalOpen(true)} // Opens Photoshoot Modal
              >
                Upload Photos
              </Button>

              {/* Select All Checkbox */}
              <Checkbox
                isChecked={Object.keys(photos).every(
                  (key) => photos[key] && personnelImages[imageMapping[key]]
                )}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const updatedChecklist = {};

                  // ✅ Only check items where an image exists
                  Object.keys(photos).forEach((key) => {
                    updatedChecklist[key] =
                      isChecked && personnelImages[imageMapping[key]];
                  });

                  setPhotos(updatedChecklist);
                }}
                colorScheme="teal"
                size="lg"
                w="100%"
                fontWeight="bold"
                mb={2}
                isDisabled={
                  !Object.keys(photos).every(
                    (key) => personnelImages[imageMapping[key]]
                  )
                } // ✅ Disable if any image is missing
              >
                Select All
              </Checkbox>

              <VStack align="start" spacing={4} w="100%">
                {/* 2x2 Photo */}
                <Flex
                  align="center"
                  w="100%"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                >
                  <Checkbox
                    isChecked={photos.twoByTwo}
                    onChange={() => handlePhotoChange("twoByTwo")}
                    colorScheme="teal"
                    size="lg"
                    mr={3}
                    isDisabled={!personnelImages["2x2 Picture"]} // ✅ Disable if no image
                  />
                  {personnelImages["2x2 Picture"] ? (
                    <Image
                      src={personnelImages["2x2 Picture"]}
                      alt="2x2 Photo"
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #ccc"
                      shadow="sm"
                      mr={3}
                    />
                  ) : (
                    <Box
                      boxSize="50px"
                      bg="gray.200"
                      borderRadius="md"
                      mr={3}
                    />
                  )}
                  <Text fontSize="md" fontWeight="medium">
                    2x2 Photo
                  </Text>
                </Flex>

                {/* Half Body Photo */}
                <Flex
                  align="center"
                  w="100%"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                >
                  <Checkbox
                    isChecked={photos.halfBody}
                    onChange={() => handlePhotoChange("halfBody")}
                    colorScheme="teal"
                    size="lg"
                    mr={3}
                    isDisabled={!personnelImages["Half Body Picture"]} // ✅ Disable if no image
                  />
                  {personnelImages["Half Body Picture"] ? (
                    <Image
                      src={personnelImages["Half Body Picture"]}
                      alt="Half Body"
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #ccc"
                      shadow="sm"
                      mr={3}
                    />
                  ) : (
                    <Box
                      boxSize="50px"
                      bg="gray.200"
                      borderRadius="md"
                      mr={3}
                    />
                  )}
                  <Text fontSize="md" fontWeight="medium">
                    Half Body Photo
                  </Text>
                </Flex>

                {/* Full Body Photo */}
                <Flex
                  align="center"
                  w="100%"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                >
                  <Checkbox
                    isChecked={photos.fullBody}
                    onChange={() => handlePhotoChange("fullBody")}
                    colorScheme="teal"
                    size="lg"
                    mr={3}
                    isDisabled={!personnelImages["Full Body Picture"]} // ✅ Disable if no image
                  />
                  {personnelImages["Full Body Picture"] ? (
                    <Image
                      src={personnelImages["Full Body Picture"]}
                      alt="Full Body"
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #ccc"
                      shadow="sm"
                      mr={3}
                    />
                  ) : (
                    <Box
                      boxSize="50px"
                      bg="gray.200"
                      borderRadius="md"
                      mr={3}
                    />
                  )}
                  <Text fontSize="md" fontWeight="medium">
                    Full Body Photo
                  </Text>
                </Flex>
              </VStack>

              {/* Verify Button */}
              <Button
                colorScheme="orange"
                mt={6}
                size="lg"
                w="100%"
                onClick={handleVerify}
                isDisabled={
                  (!Object.values(photos).every((photo) => photo) &&
                    !hasPermission("progress.photoshoot_access")) ||
                  !selectedUser?.personnel_id
                }
              >
                Verify and Proceed
              </Button>
            </Flex>
          )}
        </>
      )}

      {/* Photoshoot Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          if (selectedUser) {
            fetchPersonnelImages(selectedUser.personnel_id); // ✅ Fetch latest images after closing modal
          }
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Photoshoot and Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <Photoshoot
                personnel={selectedUser}
                onClose={() => {
                  setIsPhotoModalOpen(false);
                  fetchPersonnelImages(selectedUser.personnel_id); // ✅ Ensure images are refreshed
                }}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                setIsPhotoModalOpen(false);
                fetchPersonnelImages(selectedUser.personnel_id); // ✅ Fetch latest images on Close button click
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Step5;
