// src/pages/progress/Step7.js
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

const Step7 = ({ user }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleVerify = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/personnels/${user.personnel_id}/step7`, {
        formsSubmitted: true,
      });

      setIsVerified(true);
      toast({
        title: "Step Verified",
        description: "Forms submitted to ATG Office for approval.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while submitting the forms.",
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
        Step 7: Submit Forms to ATG Office for Approval
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <VStack align="start" spacing={3}>
          <Text fontSize="lg">
            Please ensure all forms are ready for submission to the ATG Office.
          </Text>
          <Checkbox isChecked={isVerified} isDisabled>
            Forms Submitted
          </Checkbox>
          <Button
            colorScheme="teal"
            mt={4}
            onClick={handleVerify}
            isDisabled={isVerified}
          >
            Submit and Proceed
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

export default Step7;
