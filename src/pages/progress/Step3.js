// src/pages/progress/Step3.js
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

const Step3 = ({ user }) => {
  const [checklist, setChecklist] = useState({
    workArea: false,
    officeDesignation: false,
    officemates: false,
    healthProfile: false,
    homeAddress: false,
    familyBackground: false,
    safetyProtocols: false,
    confidentialAreas: false,
    healthProtocols: false,
    emergencyProtocols: false,
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
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step3`, {
        checklistCompleted: true,
      });

      toast({
        title: "Step Verified",
        description: "Building Security Overseer verification complete.",
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
        Step 3: Report to Building Security Overseer
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
            Officemates
          </Checkbox>
          <Checkbox
            isChecked={checklist.healthProfile}
            onChange={() => handleChecklistChange("healthProfile")}
          >
            Health profile and history
          </Checkbox>
          <Checkbox
            isChecked={checklist.homeAddress}
            onChange={() => handleChecklistChange("homeAddress")}
          >
            Home and provincial address
          </Checkbox>
          <Checkbox
            isChecked={checklist.familyBackground}
            onChange={() => handleChecklistChange("familyBackground")}
          >
            Family background
          </Checkbox>
          <Checkbox
            isChecked={checklist.safetyProtocols}
            onChange={() => handleChecklistChange("safetyProtocols")}
          >
            General safety and security in the office
          </Checkbox>
          <Checkbox
            isChecked={checklist.confidentialAreas}
            onChange={() => handleChecklistChange("confidentialAreas")}
          >
            Confidential and Non-confidential Areas
          </Checkbox>
          <Checkbox
            isChecked={checklist.healthProtocols}
            onChange={() => handleChecklistChange("healthProtocols")}
          >
            General health protocols
          </Checkbox>
          <Checkbox
            isChecked={checklist.emergencyProtocols}
            onChange={() => handleChecklistChange("emergencyProtocols")}
          >
            Emergency protocols
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

export default Step3;
