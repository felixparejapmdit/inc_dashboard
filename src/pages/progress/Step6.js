// src/pages/progress/Step6.js
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
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step6 = ({ user }) => {
  const [checklist, setChecklist] = useState({
    confidentiality: false,
    informationSheet: false,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step6`, {
        checklistCompleted: true,
      });

      toast({
        title: "Step Verified",
        description:
          "Instructions on confidentiality and final information check completed.",
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
        <VStack align="start" spacing={3}>
          <Text fontSize="lg">Checklist:</Text>
          <Checkbox
            isChecked={checklist.confidentiality}
            onChange={() => handleChecklistChange("confidentiality")}
          >
            Instructions on confidentiality, correspondences, and personnel
            office
          </Checkbox>
          <Checkbox
            isChecked={checklist.informationSheet}
            onChange={() => handleChecklistChange("informationSheet")}
          >
            Final checking of information sheet
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

export default Step6;
