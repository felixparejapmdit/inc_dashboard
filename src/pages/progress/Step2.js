// src/pages/progress/Step2.js
import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Checkbox,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step2 = ({ user }) => {
  const [checklist, setChecklist] = useState({
    workArea: false,
    officeDesignation: false,
    officemates: false,
    healthConcerns: false,
    cleanliness: false,
    firePrevention: false,
    appliances: false,
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

    if (!user?.personnel_id) {
      toast({
        title: "Verification Failed",
        description: "User is not enrolled in the personnel table.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step2`, {
        checklistCompleted: true,
      });

      toast({
        title: "Step Verified",
        description: "Building Admin Office verification complete.",
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

  const handleChecklistChange = (field) => {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 2: Report to Building Admin Office
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack align="start" spacing={3}>
          <Text fontSize="lg">Checklist:</Text>
          <Checkbox
            isChecked={checklist.workArea}
            onChange={() => handleChecklistChange("workArea")}
          >
            Work area or work station
          </Checkbox>
          <Checkbox
            isChecked={checklist.officeDesignation}
            onChange={() => handleChecklistChange("officeDesignation")}
          >
            Office designation
          </Checkbox>
          <Checkbox
            isChecked={checklist.officemates}
            onChange={() => handleChecklistChange("officemates")}
          >
            Adjacent officemates
          </Checkbox>
          <Checkbox
            isChecked={checklist.healthConcerns}
            onChange={() => handleChecklistChange("healthConcerns")}
          >
            Health concerns
          </Checkbox>
          <Checkbox
            isChecked={checklist.cleanliness}
            onChange={() => handleChecklistChange("cleanliness")}
          >
            Cleanliness and orderliness of workspace
          </Checkbox>
          <Checkbox
            isChecked={checklist.firePrevention}
            onChange={() => handleChecklistChange("firePrevention")}
          >
            Fire prevention
          </Checkbox>
          <Checkbox
            isChecked={checklist.appliances}
            onChange={() => handleChecklistChange("appliances")}
          >
            Using electrical appliances
          </Checkbox>
          <Button
            colorScheme="teal"
            mt={4}
            onClick={handleVerify}
            isDisabled={loading}
          >
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

export default Step2;
