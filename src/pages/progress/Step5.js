// src/pages/progress/Step5.js
import React, { useState } from "react";
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
  Image,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step5 = ({ user }) => {
  const [photos, setPhotos] = useState({
    twoByTwo: false,
    halfBody: false,
    fullBody: false,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step5`, {
        photosVerified: true,
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
        <VStack align="start" spacing={4}>
          <Text fontSize="lg">Checklist:</Text>
          <Checkbox
            isChecked={photos.twoByTwo}
            onChange={() => handlePhotoChange("twoByTwo")}
          >
            2x2 Photo
          </Checkbox>
          <Checkbox
            isChecked={photos.halfBody}
            onChange={() => handlePhotoChange("halfBody")}
          >
            Half Body Photo
          </Checkbox>
          <Checkbox
            isChecked={photos.fullBody}
            onChange={() => handlePhotoChange("fullBody")}
          >
            Full Body Photo
          </Checkbox>
          <Button colorScheme="teal" mt={4} onClick={handleVerify}>
            Verify and Proceed
          </Button>
          {!user?.personnel_id && (
            <Alert status="error" borderRadius="md" mt={4}>
              <AlertIcon />
              The personnel is not enrolled yet.
            </Alert>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default Step5;
