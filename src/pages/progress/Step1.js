// src/pages/progress/Step1.js
import React, { useEffect, useState } from "react";
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

const Step1 = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch user verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (user?.personnel_id) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${API_URL}/api/personnels/${user.personnel_id}/verification`
          );
          setIsVerified(response.data.isVerified || false);
        } catch (error) {
          console.error("Error fetching verification status:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVerificationStatus();
  }, [user]);

  const handleVerify = async () => {
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
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/verify`, {
        verified: true,
      });
      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "Section Chief has verified the personnel.",
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

  return (
    <Box p={6} bg="gray.50" minHeight="100vh" borderRadius="md">
      <Heading size="lg" mb={4}>
        Step 1: Report to Section Chief
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack align="start" spacing={4}>
          <Text fontSize="lg">
            Please verify the personnel's enrollment before proceeding.
          </Text>
          <Checkbox
            isChecked={isVerified}
            isDisabled={!user?.personnel_id}
            colorScheme="green"
          >
            Enrollment Verified
          </Checkbox>
          <Button
            colorScheme="teal"
            isDisabled={!user?.personnel_id || isVerified}
            onClick={handleVerify}
          >
            Verify and Proceed
          </Button>
          {!user?.personnel_id && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              The personnel is not enrolled yet.
            </Alert>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default Step1;
