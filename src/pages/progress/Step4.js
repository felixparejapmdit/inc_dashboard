// src/pages/progress/Step4.js
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

const Step4 = ({ user }) => {
  const [checklist, setChecklist] = useState({
    telephone: false,
    adobeCreativeCloud: false,
    nextCloud: false,
    internetAccess: false,
    networkSettings: false,
    dosDonts: false,
    internetGuidelines: false,
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
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step4`, {
        checklistCompleted: true,
      });

      toast({
        title: "Step Verified",
        description: "PMD IT verification complete.",
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
        Step 4: Report to PMD IT
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack align="start" spacing={3}>
          <Text fontSize="lg">Checklist:</Text>
          <Checkbox
            isChecked={checklist.telephone}
            onChange={() => handleChecklistChange("telephone")}
          >
            Telephone
          </Checkbox>
          <Checkbox
            isChecked={checklist.adobeCreativeCloud}
            onChange={() => handleChecklistChange("adobeCreativeCloud")}
          >
            Adobe Creative Cloud
          </Checkbox>
          <Checkbox
            isChecked={checklist.nextCloud}
            onChange={() => handleChecklistChange("nextCloud")}
          >
            Next Cloud
          </Checkbox>
          <Checkbox
            isChecked={checklist.internetAccess}
            onChange={() => handleChecklistChange("internetAccess")}
          >
            Internet Access
          </Checkbox>
          <Checkbox
            isChecked={checklist.networkSettings}
            onChange={() => handleChecklistChange("networkSettings")}
          >
            Network Settings
          </Checkbox>
          <Checkbox
            isChecked={checklist.dosDonts}
            onChange={() => handleChecklistChange("dosDonts")}
          >
            Do's and Don'ts in Networking
          </Checkbox>
          <Checkbox
            isChecked={checklist.internetGuidelines}
            onChange={() => handleChecklistChange("internetGuidelines")}
          >
            Guidelines in Internet Use
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

export default Step4;
