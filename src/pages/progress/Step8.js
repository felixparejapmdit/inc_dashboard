// src/pages/progress/Step8.js
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

const Step8 = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleVerify = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step8`, {
        idIssued: true,
      });

      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "ID issued successfully by the Personnel Office.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while issuing the ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 8: Report to the Personnel Office to Get the ID
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack align="start" spacing={3}>
          <Text fontSize="lg">Checklist:</Text>
          <Checkbox isChecked={isVerified} isDisabled>
            ID Issued
          </Checkbox>
          <Button
            colorScheme="teal"
            mt={4}
            onClick={handleVerify}
            isDisabled={isVerified}
          >
            Issue ID and Complete Process
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

export default Step8;
