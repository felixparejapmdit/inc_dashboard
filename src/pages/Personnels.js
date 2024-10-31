import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Progress,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";

export const Personnels = () => {
  const [step, setStep] = useState(1);
  const toast = useToast();

  const handleNext = () => {
    if (step < 10) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileUpload = () => {
    toast({
      title: "File uploaded",
      description: "Your picture has been uploaded successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Checkbox>Male</Checkbox>
              <Checkbox>Female</Checkbox>
            </FormControl>
            <FormControl>
              <FormLabel>Locale Congregation</FormLabel>
              <Input placeholder="Locale Congregation" />
            </FormControl>
            <FormControl>
              <FormLabel>Given Name</FormLabel>
              <Input placeholder="Given Name" />
            </FormControl>
            <FormControl>
              <FormLabel>Birthday</FormLabel>
              <Input type="date" />
            </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Educational Attainment</FormLabel>
              <Checkbox>Elementary</Checkbox>
              <Checkbox>Secondary</Checkbox>
              <Checkbox>College Graduate</Checkbox>
              <Checkbox>Undergrad</Checkbox>
            </FormControl>
            <FormControl>
              <FormLabel>School</FormLabel>
              <Input placeholder="School" />
            </FormControl>
            <FormControl>
              <FormLabel>Course</FormLabel>
              <Input placeholder="Course" />
            </FormControl>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Working Experience</FormLabel>
              <Checkbox>Self-employed</Checkbox>
              <Checkbox>Employed</Checkbox>
              <Checkbox>Government</Checkbox>
              <Checkbox>Private</Checkbox>
            </FormControl>
            <FormControl>
              <FormLabel>Company</FormLabel>
              <Input placeholder="Company" />
            </FormControl>
            <FormControl>
              <FormLabel>Position</FormLabel>
              <Input placeholder="Work/Position" />
            </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={4}>
            <Text>Children Information</Text>
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input placeholder="Child's Full Name" />
            </FormControl>
            <FormControl>
              <FormLabel>Religion</FormLabel>
              <Input placeholder="Religion" />
            </FormControl>
            <FormControl>
              <FormLabel>District</FormLabel>
              <Input placeholder="District" />
            </FormControl>
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={4}>
            <Text>Parent's Information</Text>
            <FormControl>
              <FormLabel>Father's Name</FormLabel>
              <Input placeholder="Father's Full Name" />
            </FormControl>
            <FormControl>
              <FormLabel>Mother's Name</FormLabel>
              <Input placeholder="Mother's Full Name" />
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input placeholder="Parent's Address" />
            </FormControl>
          </VStack>
        );
      case 10:
        return (
          <Flex direction="column" align="center">
            <Box border="1px dashed gray" padding={10} width="100%">
              <IconButton
                aria-label="Upload Picture"
                icon={<FiUpload />}
                onClick={handleFileUpload}
              />
              <Text mt={4}>Drop your 2x2 picture here or browse</Text>
            </Box>
            <Button
              mt={6}
              colorScheme="yellow"
              onClick={() => alert("Submitted!")}
            >
              Submit Now
            </Button>
          </Flex>
        );
      default:
        return <Text>Step content not found</Text>;
    }
  };

  return (
    <Box p={6} bg="yellow.100" minH="100vh">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Personnel's Enrollment Form
      </Text>
      <Progress value={(step / 10) * 100} mb={6} />
      {renderStepContent()}
      <Flex mt={8} justify="space-between">
        <Button onClick={handleBack} isDisabled={step === 1} colorScheme="gray">
          Back
        </Button>
        <Button
          onClick={handleNext}
          isDisabled={step === 10}
          colorScheme="yellow"
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default Personnels;
