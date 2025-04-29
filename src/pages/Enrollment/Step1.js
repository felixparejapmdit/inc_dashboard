// src/pages/Step1.js
import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step1 = ({
  personnelData,
  setPersonnelData,
  handleChange,
  emailError,
  age,
  languages,
  citizenships,
  nationalities,
  departments,
  sections,
  subsections,
  designations,
  districts,
  localCongregations,
  suffixOptions,
  bloodtypes,
  isEditing, // ✅ Receive isEditing as a prop
  toggleEdit, // ✅ Receive toggleEdit function as a prop
  dutiesToDelete, // 🔥 ADD THIS
  setDutiesToDelete, // 🔥 AND THIS
}) => {
  const [step, setStep] = useState(1);

  const totalSteps = 10;

  const civilStatuses = ["Single", "Married"];
  const totalPersonnelTypes = [
    "Minister",
    "Regular",
    "Ministerial Student",
    "Minister's Wife",
    "Lay Member",
  ];

  const [filteredPersonnelTypes, setFilteredPersonnelTypes] =
    useState(totalPersonnelTypes);

  // Filter Personnel Type based on Gender
  useEffect(() => {
    let updatedTypes = [];

    if (personnelData.gender === "Female") {
      updatedTypes = ["Minister's Wife", "Lay Member"];
    } else if (personnelData.gender === "Male") {
      updatedTypes = totalPersonnelTypes.filter(
        (type) => type !== "Minister's Wife"
      );
    } else {
      updatedTypes = totalPersonnelTypes;
    }

    setFilteredPersonnelTypes(updatedTypes);

    // Reset personnel_type if it doesn't exist in the updated options
    setPersonnelData((prevData) => ({
      ...prevData,
      personnel_type: updatedTypes.includes(prevData.personnel_type)
        ? prevData.personnel_type
        : "",
    }));
  }, [personnelData.gender, setPersonnelData]);

  // States for filtered sections and subsections
  const [filteredSections, setFilteredSections] = useState([]);
  const [filteredSubsections, setFilteredSubsections] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  const [duties, setDuties] = useState(personnelData.church_duties || []);

  useEffect(() => {
    if (personnelData.church_duties) {
      if (personnelData.church_duties.length > 0) {
        setDuties(personnelData.church_duties);
      }
    }
  }, [personnelData.church_duties]);

  const [filteredLocalCongregations, setFilteredLocalCongregations] = useState(
    []
  );

  const [
    filteredLocalCongregationsOrigin,
    setFilteredLocalCongregationsOrigin,
  ] = useState([]);
  const [
    filteredLocalCongregationsAssignment,
    setFilteredLocalCongregationsAssignment,
  ] = useState([]);

  const [
    filteredFirstLocalCongregations,
    setFilteredFirstLocalCongregations,
    ,
  ] = useState([]);

  // Filter sections based on department
  useEffect(() => {
    if (personnelData.department_id) {
      const filtered = sections.filter(
        (section) =>
          section.department_id === parseInt(personnelData.department_id)
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [personnelData.department_id, sections]);

  // Filter subsections based on section
  useEffect(() => {
    if (personnelData.section_id) {
      const filtered = subsections.filter(
        (subsection) =>
          subsection.section_id === parseInt(personnelData.section_id)
      );
      setFilteredSubsections(filtered);
    } else {
      setFilteredSubsections([]);
    }
  }, [personnelData.section_id, subsections]);

  useEffect(() => {
    if (personnelData.registered_district_id) {
      const filtered = localCongregations.filter(
        (congregation) =>
          congregation.district_id ===
          parseInt(personnelData.registered_district_id)
      );
      setFilteredLocalCongregations(filtered);
    } else {
      setFilteredLocalCongregations([]);
    }
  }, [personnelData.registered_district_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_id) {
      const filtered = localCongregations.filter(
        (congregation) =>
          congregation.district_id === parseInt(personnelData.district_id)
      );
      setFilteredLocalCongregationsOrigin(filtered);
    } else {
      setFilteredLocalCongregationsOrigin([]);
    }
  }, [personnelData.district_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_assignment_id) {
      const filtered = localCongregations.filter(
        (congregation) =>
          congregation.district_id ===
          parseInt(personnelData.district_assignment_id)
      );
      setFilteredLocalCongregationsAssignment(filtered);
    } else {
      setFilteredLocalCongregationsAssignment([]);
    }
  }, [personnelData.district_assignment_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_first_registered) {
      const filtered = localCongregations.filter(
        (congregation) =>
          congregation.district_id ===
          parseInt(personnelData.district_first_registered)
      );
      setFilteredFirstLocalCongregations(filtered);
    } else {
      setFilteredFirstLocalCongregations([]);
    }
  }, [personnelData.district_first_registered, localCongregations]);

  // Validation Functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email regex

  const isRequiredFieldMissing = (field) =>
    field === undefined || field === null || field.trim() === "";

  // Function to validate the entire form
  const validateForm = (data, requiredFields) => {
    const errors = {};

    requiredFields.forEach((field) => {
      if (isRequiredFieldMissing(data[field])) {
        errors[field] = "This field is required.";
      }
    });

    if (data.email_address && !validateEmail(data.email_address)) {
      errors.email_address = "Invalid email format.";
    }

    return errors;
  };

  const handleAddDuty = () => {
    if (duties.length >= 5) {
      return; // Stop if already 5 duties
    }

    setDuties([
      ...duties,
      { personnel_id: "", duty: "", start_year: "", end_year: "" },
    ]);
  };

  const handleDutyChange = (index, field, value) => {
    const updatedDuties = [...duties];
    updatedDuties[index][field] = value;
    setDuties(updatedDuties);

    // Optional: also update personnelData immediately if needed
    setPersonnelData((prevData) => ({
      ...prevData,
      church_duties: updatedDuties,
    }));
  };

  const handleDeleteDuty = (index) => {
    const updatedDuties = duties.filter((_, i) => i !== index);
    const deletedDuty = duties[index];

    setDuties(updatedDuties);

    setPersonnelData((prevData) => ({
      ...prevData,
      church_duties: updatedDuties,
    }));

    if (deletedDuty && deletedDuty.id) {
      setDutiesToDelete((prev) => [...prev, deletedDuty.id]);
    }
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85}>
      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Box>
          <Flex justifyContent="center" mb="4">
            <Text
              fontSize={{ base: "2xl", md: "2xl" }}
              fontWeight="bold"
              color="#0a5856"
              textAlign="center"
            >
              Step 1: Primary Information
            </Text>
          </Flex>

          <Flex
            wrap="nowrap"
            justify="flex-start"
            mb="3"
            width="100%"
            align="center"
            gap="4"
          >
            <Box width={{ base: "45%", sm: "30%", md: "25%" }} mr="4">
              <Flex align="center" width="100%">
                <Text
                  fontWeight="bold"
                  mr="2"
                  color="#0a5856"
                  whiteSpace="nowrap"
                >
                  Gender:
                </Text>
                <RadioGroup
                  name="gender"
                  onChange={(value) =>
                    handleChange({
                      target: {
                        name: "gender",
                        value: value,
                      },
                    })
                  }
                  value={personnelData.gender}
                  isDisabled={!isEditing} // Fields disabled if not editing
                >
                  <Stack direction="row" spacing={2}>
                    <Radio value="Male">Male</Radio>
                    <Radio value="Female">Female</Radio>
                  </Stack>
                </RadioGroup>
              </Flex>
            </Box>

            {/* Civil Status Radio Group */}
            <Box width={{ base: "45%", sm: "30%", md: "25%" }} mr="4">
              <Flex align="center" width="100%">
                <Text
                  fontWeight="bold"
                  mr={2}
                  color="#0a5856"
                  whiteSpace="nowrap"
                >
                  Civil Status:
                </Text>
                <RadioGroup
                  name="civil_status"
                  onChange={(value) =>
                    handleChange({
                      target: {
                        name: "civil_status",
                        value: value,
                      },
                    })
                  }
                  value={personnelData.civil_status}
                  isDisabled={!isEditing} // Fields disabled if not editing
                >
                  <Stack direction="row" spacing={2}>
                    {civilStatuses.map((status) => (
                      <Radio key={status} value={status}>
                        {status}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </Flex>
            </Box>

            {/* Conditional Wedding Anniversary Field */}
            <Box
              width={{ base: "100%", md: "41%" }}
              visibility={
                personnelData.civil_status === "Married" ? "visible" : "hidden"
              }
            >
              <Flex align="center" width="100%" ml="4">
                <Text
                  fontWeight="bold"
                  mr="2"
                  color="#0a5856"
                  whiteSpace="nowrap"
                >
                  Wedding Date:
                </Text>
                <Input
                  placeholder="Wedding Anniversary"
                  name="wedding_anniversary"
                  type="date"
                  value={personnelData.wedding_anniversary}
                  onChange={(e) =>
                    setPersonnelData((prevData) => ({
                      ...prevData,
                      wedding_anniversary: e.target.value,
                    }))
                  }
                  width="100%"
                  isDisabled={!isEditing} // Fields disabled if not editing
                />
              </Flex>
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Given Name */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Given Name:
              </Text>

              <Input
                placeholder="Given Name"
                name="givenname"
                value={personnelData.givenname}
                onChange={handleChange}
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Middle Name */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Middle Name:
              </Text>
              <Input
                placeholder="Middle Name"
                name="middlename"
                value={personnelData.middlename}
                onChange={handleChange}
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Surname (Maiden) */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                {personnelData.surname_maiden_label || "Surname (Maiden)"}
              </Text>
              <Input
                placeholder={
                  personnelData.surname_maiden_placeholder || "Surname (Maiden)"
                }
                name="surname_maiden"
                value={personnelData.surname_maiden}
                onChange={handleChange}
                width="100%"
                isDisabled={personnelData.surname_maiden_disabled}
              />
            </Box>

            {/* Surname (Husband) */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                {personnelData.surname_husband_label || "Surname (Husband)"}:
              </Text>
              <Input
                placeholder={
                  personnelData.surname_husband_placeholder ||
                  "Surname (Husband)"
                }
                name="surname_husband"
                value={personnelData.surname_husband}
                onChange={handleChange}
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="4"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Suffix Selector */}
            <Box
              width={{ base: "100%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Suffix:
              </Text>
              <Select
                name="suffix"
                value={
                  suffixOptions
                    .map((suffix) => ({
                      value: suffix,
                      label: suffix,
                    }))
                    .find((option) => option.value === personnelData.suffix) ||
                  null // Match suffix from personnelData
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "suffix",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                width="100%"
                isDisabled={!isEditing || personnelData.gender === "Female"} // Disabled if not in edit mode or gender is Female
                options={suffixOptions.map((suffix) => ({
                  value: suffix,
                  label: suffix,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>

            {/* Nickname Input */}
            <Box
              width={{ base: "100%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Nickname:
              </Text>
              <Input
                placeholder="Nickname"
                name="nickname"
                value={personnelData.nickname}
                onChange={handleChange}
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Registered District */}
            <Box
              width={{ base: "100%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Current District:
              </Text>
              <Select
                placeholder="Select District"
                name="registered_district_id"
                value={districts
                  .map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))
                  .find(
                    (option) =>
                      option.value === personnelData.registered_district_id
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "registered_district_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={districts.map((district) => ({
                  value: district.id,
                  label: district.name,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Local Congregation Dropdown */}
            <Box width={{ base: "100%", md: "24%" }}>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Current Local Congregation:
              </Text>
              <Select
                placeholder="Select Local Congregation"
                name="registered_local_congregation"
                value={filteredLocalCongregations
                  .map((congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  }))
                  .find(
                    (option) =>
                      option.value ===
                      personnelData.registered_local_congregation
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "registered_local_congregation",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={filteredLocalCongregations.map((congregation) => ({
                  value: congregation.id,
                  label: congregation.name,
                }))}
                isDisabled={!isEditing || !personnelData.registered_district_id} // Disable if no district is selected
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Date of Birth Input with Age Calculation */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mr="2"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Birthday:
              </Text>
              <Input
                placeholder="Date of Birth"
                name="date_of_birth"
                type="date"
                value={personnelData.date_of_birth}
                onChange={(e) =>
                  handleChange({
                    target: { name: "date_of_birth", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Age Display */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mr="2"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Age:
              </Text>
              <Input
                placeholder="0"
                name="age"
                value={age}
                readOnly
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Place of Birth */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mr="2"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Place of Birth:
              </Text>
              <Input
                placeholder="Place of Birth"
                name="place_of_birth"
                value={personnelData.place_of_birth}
                onChange={(e) =>
                  handleChange({
                    target: { name: "place_of_birth", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Date Joined */}
            <Box
              width={{ base: "100%", sm: "48%", md: "24%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Date Started in the office:
              </Text>
              <Input
                placeholder="Date Joined"
                name="datejoined"
                type="date"
                value={personnelData.datejoined}
                onChange={(e) =>
                  handleChange({
                    target: { name: "datejoined", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Language Selector */}
            <Box
              width={{ base: "100%", sm: "48%", md: "33%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Languages:
              </Text>
              <Select
                isMulti
                placeholder="Select Languages"
                name="language_id"
                value={
                  Array.isArray(personnelData.language_id)
                    ? languages
                        .filter((lang) =>
                          personnelData.language_id.includes(lang.id)
                        )
                        .map((lang) => ({ value: lang.id, label: lang.name }))
                    : []
                }
                onChange={(selectedOptions) => {
                  const selectedIds = selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : [];

                  // ✅ Update state correctly by replacing the whole array
                  handleChange({
                    target: {
                      name: "language_id",
                      value: selectedIds, // Directly assign selected values
                    },
                  });
                }}
                options={languages.map((language) => ({
                  value: language.id,
                  label: language.name,
                }))}
                isClearable
                closeMenuOnSelect={false} // Keep menu open for multiple selections
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Blood Type Selector */}
            <Box
              width={{ base: "100%", sm: "48%", md: "33%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Blood Type:
              </Text>
              <Select
                placeholder="Blood Type"
                name="bloodtype"
                value={bloodtypes
                  .map((type) => ({
                    value: type, // Correctly map the bloodtype string
                    label: type,
                  }))
                  .find((option) => option.value === personnelData.bloodtype)} // Ensure the correct value is matched
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "bloodtype",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={bloodtypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Work Email Input Field */}
            <Box
              width={{ base: "100%", sm: "48%", md: "33%" }}
              mb={{ base: "3", md: "0" }}
              position="relative" // Ensure the error message is relative to this box
              display="none"
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Work Email Address:
              </Text>
              <Input
                placeholder="Enter Work Email Address"
                name="work_email_address"
                value={personnelData.work_email_address}
                onChange={handleChange}
                isInvalid={!!emailError} // Highlight input if there's an error
                errorBorderColor="red.300"
                borderColor={emailError ? "red.500" : "gray.300"}
                focusBorderColor={emailError ? "red.500" : "teal.400"} // Add focus styling
              />
              {emailError && (
                <Box
                  position="absolute"
                  top="100%" // Position the error box directly below the input
                  left="0"
                  color="red.500"
                  fontSize="sm"
                  bg="red.50" // Light red background for better readability
                  p="2"
                  mt="1" // Small margin above the error message
                  borderRadius="md" // Rounded corners
                  boxShadow="sm" // Subtle shadow effect
                  border="1px solid"
                  borderColor="red.200" // Match border color with the design
                  zIndex="10"
                >
                  {emailError}
                </Box>
              )}
            </Box>

            {/* Personal Email Input Field */}
            <Box
              width={{ base: "100%", sm: "48%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
              position="relative" // Ensure the error message is relative to this box
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Personal Email Address:
              </Text>
              <Input
                placeholder="Enter Email Address"
                name="email_address"
                value={personnelData.email_address}
                onChange={handleChange}
                isInvalid={!!emailError} // Highlight input if there's an error
                errorBorderColor="red.300"
                borderColor={emailError ? "red.500" : "gray.300"}
                focusBorderColor={emailError ? "red.500" : "teal.400"} // Add focus styling
                isDisabled={!isEditing} // Fields disabled if not editing
              />
              {emailError && (
                <Box
                  position="absolute"
                  top="100%" // Position the error box directly below the input
                  left="0"
                  color="red.500"
                  fontSize="sm"
                  bg="red.50" // Light red background for better readability
                  p="2"
                  mt="1" // Small margin above the error message
                  borderRadius="md" // Rounded corners
                  boxShadow="sm" // Subtle shadow effect
                  border="1px solid"
                  borderColor="red.200" // Match border color with the design
                  zIndex="10"
                >
                  {emailError}
                </Box>
              )}
            </Box>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Citizenship Selector */}
            <Box
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mr="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Citizenship:
              </Text>
              <Select
                isMulti // Enable multiple selection
                placeholder="Select Citizenship"
                name="citizenship"
                value={citizenships
                  .filter((citizenship) =>
                    personnelData.citizenship?.includes(citizenship.id)
                  )
                  .map((citizenship) => ({
                    value: citizenship.id,
                    label: citizenship.citizenship,
                  }))}
                onChange={(selectedOptions) =>
                  handleChange({
                    target: {
                      name: "citizenship",
                      value: selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : [],
                    },
                  })
                }
                options={citizenships.map((citizenship) => ({
                  value: citizenship.id,
                  label: citizenship.citizenship,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Nationality Selector */}
            <Box
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mr="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Ethnicity:
              </Text>
              <Select
                placeholder="Select Ethnicity"
                name="nationality"
                value={nationalities
                  .map((nationality) => ({
                    value: nationality.id,
                    label: nationality.nationality,
                  }))
                  .find((option) => option.value === personnelData.nationality)}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "nationality",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={nationalities.map((nationality) => ({
                  value: nationality.id,
                  label: nationality.nationality,
                }))}
                isClearable // Adds a clear button to reset selection
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Department Selector */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Department:
              </Text>
              <Select
                placeholder="Select Department"
                name="department_id"
                value={departments
                  .map((department) => ({
                    value: department.id,
                    label: department.name,
                  }))
                  .find(
                    (option) => option.value === personnelData.department_id
                  )}
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "department_id",
                      value: selectedOption?.value || "",
                    },
                  });
                }}
                options={departments.map((department) => ({
                  value: department.id,
                  label: department.name,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Section */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Section:
              </Text>
              <Select
                placeholder="Select Section"
                name="section_id"
                value={sections
                  .map((section) => ({
                    value: section.id,
                    label: section.name,
                  }))
                  .find((option) => option.value === personnelData.section_id)}
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "section_id",
                      value: selectedOption?.value || "",
                    },
                  });
                }}
                options={filteredSections.map((section) => ({
                  value: section.id,
                  label: section.name,
                }))}
                isDisabled={!isEditing || !personnelData.department_id} // Disable if no department is selected
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>

            {/* Subsection */}
            <Box
              width={{ base: "100%", md: "0%" }}
              mb={{ base: "3", md: "3" }}
              display="none"
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Subsection/Team:
              </Text>
              <Select
                placeholder="Select Subsection"
                name="subsection_id"
                value={subsections
                  .map((subsection) => ({
                    value: subsection.id,
                    label: subsection.name,
                  }))
                  .find(
                    (option) => option.value === personnelData.subsection_id
                  )}
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "subsection_id",
                      value: selectedOption?.value || "",
                    },
                  });
                }}
                options={filteredSubsections.map((subsection) => ({
                  value: subsection.id,
                  label: subsection.name,
                }))}
                isDisabled={!personnelData.section_id} // Disable if no section is selected
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>

            {/* Designation */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Role:
              </Text>
              <Select
                placeholder="Select Role"
                name="designation_id"
                value={
                  designations
                    .map((designation) => ({
                      value: designation.id,
                      label: designation.name,
                    }))
                    .find(
                      (option) => option.value === personnelData.designation_id
                    ) || null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "designation_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={designations.map((designation) => ({
                  value: designation.id,
                  label: designation.name,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>
          </Flex>

          {/* INC Status Radio Group */}
          <Flex alignItems="center" mb="3" style={{ display: "none" }}>
            <Text fontSize="md" fontWeight="bold" mr={4}>
              INC Status
            </Text>
            <RadioGroup
              name="inc_status"
              onChange={(value) => handleChange(value, "inc_status")} // Pass the value and field name
              value={personnelData.inc_status} // Bind state to RadioGroup
            >
              <Stack direction="row">
                <Radio value="Active">Active</Radio>
                <Radio disabled value="Non-Active">
                  Non-Active
                </Radio>
              </Stack>
            </RadioGroup>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* District Origin */}
            <Box
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                District Origin:
              </Text>
              <Select
                placeholder="Select District"
                name="district_id"
                value={districts
                  .map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))
                  .find((option) => option.value === personnelData.district_id)}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "district_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={districts.map((district) => ({
                  value: district.id,
                  label: district.name,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Local Congregation Origin Dropdown */}
            <Box width={{ base: "100%", md: "48%" }}>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Local Congregation Origin:
              </Text>
              <Select
                placeholder="Select Local Congregation"
                name="local_congregation"
                value={filteredLocalCongregationsOrigin
                  .map((congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  }))
                  .find(
                    (option) =>
                      option.value === personnelData.local_congregation
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "local_congregation",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={filteredLocalCongregationsOrigin.map(
                  (congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  })
                )}
                isDisabled={!isEditing || !personnelData.district_id} // Disable if no district is selected
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Classification Radio Buttons */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Classification:
              </Text>
              <RadioGroup
                name="is_offered"
                onChange={(value) =>
                  handleChange({
                    target: { name: "is_offered", value },
                  })
                }
                value={
                  personnelData.is_offered !== undefined &&
                  personnelData.is_offered !== null &&
                  personnelData.is_offered !== ""
                    ? personnelData.is_offered
                    : "1" // Default to "Offered"
                }
                isDisabled={!isEditing}
              >
                <Stack direction="row">
                  <Radio value="1">Offered</Radio>
                  <Radio value="0">Convert</Radio>
                </Stack>
              </RadioGroup>
            </Box>

            {/* Date Baptized Input Date */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Date Baptized:
              </Text>
              <Input
                type="date"
                name="date_baptized"
                value={personnelData.date_baptized || ""}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "date_baptized",
                      value: e.target.value,
                    },
                  })
                }
                isDisabled={!isEditing}
              />
            </Box>

            {/* Place of Baptism Input Text */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Place of Baptism:
              </Text>
              <Input
                type="text"
                name="minister_officiated"
                value={personnelData.place_of_baptism || ""}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "place_of_baptism",
                      value: e.target.value,
                    },
                  })
                }
                isDisabled={!isEditing}
              />
            </Box>
          </Flex>

          <Flex
            alignItems="center"
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Minister Officiated Input Text */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Minister Officiated:
              </Text>
              <Input
                type="text"
                name="minister_officiated"
                value={personnelData.minister_officiated || ""}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "minister_officiated",
                      value: e.target.value,
                    },
                  })
                }
                isDisabled={!isEditing}
              />
            </Box>

            {/* District First Registered */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                District First Registered:
              </Text>
              <Select
                placeholder="Select District"
                name="district_first_registered"
                value={districts
                  .map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))
                  .find(
                    (option) =>
                      option.value === personnelData.district_first_registered
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "district_first_registered",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={districts.map((district) => ({
                  value: district.id,
                  label: district.name,
                }))}
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                isDisabled={!isEditing} // Fields disabled if not editing
              />
            </Box>

            {/* Local Congregation First Registered */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Local First Registered:
              </Text>
              <Select
                placeholder="Select Local Congregation"
                name="local_first_registered"
                value={filteredFirstLocalCongregations
                  .map((congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  }))
                  .find(
                    (option) =>
                      option.value === personnelData.local_first_registered
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "local_first_registered",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={filteredFirstLocalCongregations.map(
                  (congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  })
                )}
                isDisabled={
                  !isEditing || !personnelData.district_first_registered
                } // Disable if no district is selected
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>
          </Flex>

          <Flex direction="column" mb="4" width="100%">
            <Text fontSize="md" fontWeight="bold" mb="1" color="#0a5856">
              Personnel Type:
            </Text>
            <RadioGroup
              name="personnel_type"
              onChange={(value) => {
                handleChange({ target: { name: "personnel_type", value } });
              }}
              value={personnelData.personnel_type}
              width="100%"
              isDisabled={!isEditing} // Fields disabled if not editing
            >
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={{ base: 2, md: 4 }}
                wrap="wrap"
                justify="space-between"
                width="100%"
              >
                {filteredPersonnelTypes.map((type) => (
                  <Radio
                    key={type}
                    value={type}
                    width={{ base: "100%", md: "auto" }}
                  >
                    {type}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Flex>

          {/* Conditional Fields Based on Personnel Type */}
          {["Lay Member"].includes(personnelData.personnel_type) && (
            <>
              <Flex align="center" mb="3" width="100%">
                <Text
                  fontWeight="bold"
                  mr="4"
                  minWidth="120px"
                  whiteSpace="nowrap"
                  color="#0a5856"
                >
                  Church Duty:
                </Text>
                <Button
                  onClick={handleAddDuty}
                  isDisabled={!isEditing || duties.length >= 5}
                >
                  Add New
                </Button>
              </Flex>

              {duties.length > 0 ? (
                <Box bg="white" p={6} rounded="xl" shadow="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          #
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Duty
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Start Year
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          End Year
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {duties.map((duty, index) => (
                        <Tr
                          key={index}
                          _hover={{ bg: "gray.100" }}
                          transition="background 0.2s"
                        >
                          <Td textAlign="center" fontWeight="semibold">
                            {index + 1}
                          </Td>
                          <Td>
                            <Input
                              value={duty.duty}
                              onChange={(e) =>
                                handleDutyChange(index, "duty", e.target.value)
                              }
                              placeholder="Duty"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              value={duty.start_year}
                              onChange={(e) =>
                                handleDutyChange(
                                  index,
                                  "start_year",
                                  e.target.value
                                )
                              }
                              placeholder="Start"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              value={duty.end_year}
                              onChange={(e) =>
                                handleDutyChange(
                                  index,
                                  "end_year",
                                  e.target.value
                                )
                              }
                              placeholder="End"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td textAlign="center">
                            <IconButton
                              aria-label="Delete Duty"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDuty(index)}
                              isDisabled={!isEditing}
                              _hover={{ bg: "red.100" }}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box textAlign="center" py={5} fontSize="lg" color="gray.500">
                  No duties available.
                </Box>
              )}
            </>
          )}

          {/* Conditional Fields Based on Personnel Type */}
          {personnelData.gender === "Male" &&
            ["Minister", "Regular", "Ministerial Student"].includes(
              personnelData.personnel_type
            ) && (
              <>
                <Flex align="center" mb="3" width="100%">
                  <Text
                    fontWeight="bold"
                    mr="4"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Assigned Number:
                  </Text>
                  <Input
                    type="number"
                    placeholder="Enter Assigned Number"
                    name="assigned_number"
                    value={personnelData.assigned_number}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "assigned_number",
                          value: e.target.value,
                        },
                      })
                    }
                    width="calc(100% - 140px)" // Adjusted to fit next to label
                    min="0"
                    isDisabled={!isEditing} // Fields disabled if not editing
                  />
                </Flex>

                {/* Ministerial Status */}
                <Flex direction="column" mb="3" width="100%">
                  <Text fontSize="md" fontWeight="bold" mb="1" color="#0a5856">
                    Classification in Central Office:
                  </Text>
                  <RadioGroup
                    name="m_status"
                    onChange={(value) =>
                      handleChange({ target: { name: "m_status", value } })
                    }
                    value={personnelData.m_status}
                    isDisabled={!isEditing} // Fields disabled if not editing
                  >
                    <Stack direction="row" spacing={4} wrap="wrap">
                      <Radio value="May Destino">May Destino</Radio>
                      <Radio value="Fulltime">Fulltime</Radio>
                    </Stack>
                  </RadioGroup>
                </Flex>

                {/* Conditional Rendering for District and Local Assignments */}
                {personnelData.m_status === "May Destino" && (
                  <Flex
                    align="center"
                    mb="3"
                    width="100%"
                    wrap="wrap"
                    justify="space-between"
                  >
                    {/* District Assignment*/}
                    <Box
                      width={{ base: "100%", md: "48%" }}
                      mb={{ base: "3", md: "0" }}
                    >
                      <Text
                        fontWeight="bold"
                        mb="2"
                        minWidth="120px"
                        whiteSpace="nowrap"
                        color="#0a5856"
                      >
                        District Assignment:
                      </Text>
                      <Select
                        placeholder="Select District"
                        name="district_assignment_id"
                        value={districts
                          .map((district) => ({
                            value: district.id,
                            label: district.name,
                          }))
                          .find(
                            (option) =>
                              option.value ===
                              personnelData.district_assignment_id
                          )}
                        onChange={(selectedOption) =>
                          handleChange({
                            target: {
                              name: "district_assignment_id",
                              value: selectedOption?.value || "",
                            },
                          })
                        }
                        options={districts.map((district) => ({
                          value: district.id,
                          label: district.name,
                        }))}
                        isClearable
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                        }}
                        isDisabled={!isEditing} // Fields disabled if not editing
                      />
                    </Box>

                    {/* Local Congregation Assignment Dropdown */}
                    <Box width={{ base: "100%", md: "48%" }}>
                      <Text
                        fontWeight="bold"
                        mb="2"
                        minWidth="120px"
                        whiteSpace="nowrap"
                        color="#0a5856"
                      >
                        Local Congregation Assignment:
                      </Text>
                      <Select
                        placeholder="Select Local Congregation"
                        name="local_congregation_assignment"
                        value={filteredLocalCongregationsAssignment
                          .map((congregation) => ({
                            value: congregation.id,
                            label: congregation.name,
                          }))
                          .find(
                            (option) =>
                              option.value ===
                              personnelData.local_congregation_assignment
                          )}
                        onChange={(selectedOption) =>
                          handleChange({
                            target: {
                              name: "local_congregation_assignment",
                              value: selectedOption?.value || "",
                            },
                          })
                        }
                        options={filteredLocalCongregationsAssignment.map(
                          (congregation) => ({
                            value: congregation.id,
                            label: congregation.name,
                          })
                        )}
                        isDisabled={
                          !isEditing || !personnelData.district_assignment_id
                        } // Disable if no district is selected
                        isClearable
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                        }}
                      />
                    </Box>
                  </Flex>
                )}
              </>
            )}

          {/* Panunumpa Date */}
          {personnelData.gender === "Male" &&
            ["Minister", "Regular"].includes(personnelData.personnel_type) && (
              <Flex align="center" mb="3" width="100%">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mr="4"
                  width="250px"
                  color="#0a5856"
                >
                  Date of Oath-taking as Worker:
                </Text>
                <Input
                  placeholder="Panunumpa Date"
                  name="panunumpa_date"
                  type="date"
                  value={personnelData.panunumpa_date}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "panunumpa_date", value: e.target.value },
                    })
                  }
                  width="calc(100% - 250px)" // Matches remaining width
                  isDisabled={!isEditing} // Fields disabled if not editing
                />
              </Flex>
            )}

          {/* Ordination Date */}
          {personnelData.gender === "Male" &&
            personnelData.personnel_type === "Minister" && (
              <Flex align="center" mb="3" width="100%">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mr="4"
                  width="250px"
                  color="#0a5856"
                >
                  Date of Ordination:
                </Text>
                <Input
                  placeholder="Ordination Date"
                  name="ordination_date"
                  type="date"
                  value={personnelData.ordination_date}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "ordination_date",
                        value: e.target.value,
                      },
                    })
                  }
                  width="calc(100% - 250px)" // Matches remaining width
                  isDisabled={!isEditing} // Fields disabled if not editing
                />
              </Flex>
            )}
        </Box>
      )}
    </Box>
  );
};

export default Step1;
