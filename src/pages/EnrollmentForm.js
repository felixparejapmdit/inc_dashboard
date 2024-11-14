// src/pages/EnrollmentForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Progress,
  Heading,
  Flex,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckIcon } from "@chakra-ui/icons";
import Step1 from "./Step1"; // Import Step1 component

const EnrollmentForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [personnelData, setPersonnelData] = useState({
    // Initialize all fields here as in your original code
  });

  const [emailError, setEmailError] = useState("");
  const [age, setAge] = useState("");

  const navigate = useNavigate();

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/personnels",
        personnelData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert("Personnel data has been successfully saved.");
        if (step === 1) {
          navigate("/step2");
        } else {
          setStep((prevStep) => Math.min(prevStep + 1, totalSteps));
        }
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      navigate("/step2");
      console.error("Error saving personnel data:", error);
      alert("Failed to save personnel data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => setStep((prevStep) => Math.max(prevStep - 1, 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonnelData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "email_address") {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      !emailPattern.test(email) ? "Please enter a valid email address." : ""
    );
  };

  return (
    <VStack
      spacing={4}
      w="80%"
      mx="auto"
      mt="50px"
      mb="50px"
      p="6"
      boxShadow="lg"
      rounded="md"
      bg="white"
    >
      <Box
        position="fixed"
        top="0"
        width="100%"
        zIndex="1"
        bg="white"
        boxShadow="sm"
      >
        <Flex alignItems="center" my={2}>
          <Heading
            as="h2"
            size="lg"
            color="teal.600"
            textAlign="center"
            flex="1"
          >
            Personnel Enrollment
          </Heading>
        </Flex>
        <Flex justify="center" align="center" my={6} px={4} bg="#FEF3C7" py={2}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <Box
              key={index}
              as="button"
              onClick={() => setStep(index + 1)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              width="40px"
              height="40px"
              mx={2}
              fontWeight="bold"
              color="white"
              bg={step > index ? "green.400" : "gray.200"}
              border={step === index + 1 ? "2px solid #2D3748" : "none"}
              transition="background 0.3s, border 0.3s"
            >
              {step > index ? <CheckIcon /> : index + 1}
            </Box>
          ))}
        </Flex>
      </Box>

      {step === 1 && (
        <Step1
          personnelData={personnelData}
          handleChange={handleChange}
          emailError={emailError}
          age={age}
        />
      )}

      <Box
        position="fixed"
        bottom="0"
        width="100%"
        bg="white"
        boxShadow="sm"
        p={4}
        display="flex"
        justifyContent="center"
        zIndex="1"
      >
        {step > 1 && (
          <Button onClick={handlePrevious} colorScheme="gray" mr={4}>
            Previous
          </Button>
        )}
        {step < 2 ? (
          <Button onClick={handleNext} colorScheme="teal">
            Next
          </Button>
        ) : (
          <Button colorScheme="teal">Finish</Button>
        )}
      </Box>
    </VStack>
  );
};

export default EnrollmentForm;
