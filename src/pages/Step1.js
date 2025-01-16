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
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { CheckIcon } from "@chakra-ui/icons";

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
  suffixOptions,
  bloodtypes,
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
    if (personnelData.gender === "Female") {
      setFilteredPersonnelTypes(["Minister's Wife", "Lay Member"]);
    } else {
      setFilteredPersonnelTypes(totalPersonnelTypes);
    }
    // Reset personnel_type if it's invalid for the new gender
    setPersonnelData((prevData) => ({
      ...prevData,
      personnel_type: totalPersonnelTypes.includes(prevData.personnel_type)
        ? prevData.personnel_type
        : "",
    }));
  }, [personnelData.gender, setPersonnelData]);

  // States for filtered sections and subsections
  const [filteredSections, setFilteredSections] = useState([]);
  const [filteredSubsections, setFilteredSubsections] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

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

    // Pre-fill section if already set
    setPersonnelData((prevData) => ({
      ...prevData,
      section_id: prevData.section_id || "",
    }));
  }, [personnelData.department_id, sections, setPersonnelData]);

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

    // Pre-fill subsection if already set
    setPersonnelData((prevData) => ({
      ...prevData,
      subsection_id: prevData.subsection_id || "",
    }));
  }, [personnelData.section_id, subsections, setPersonnelData]);

  // Filter designations based on section and subsection
  useEffect(() => {
    if (personnelData.section_id) {
      const filtered = designations.filter(
        (designation) =>
          designation.section_id === parseInt(personnelData.section_id) &&
          (!personnelData.subsection_id ||
            designation.subsection_id === parseInt(personnelData.subsection_id))
      );
      setFilteredDesignations(filtered);
    } else {
      setFilteredDesignations([]);
    }

    // Pre-fill designation if already set
    setPersonnelData((prevData) => ({
      ...prevData,
      designation_id: prevData.designation_id || "",
    }));
  }, [
    personnelData.section_id,
    personnelData.subsection_id,
    designations,
    setPersonnelData,
  ]);

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
                  onChange={(value) => {
                    setPersonnelData((prevData) => ({
                      ...prevData,
                      civil_status: value,
                      wedding_anniversary:
                        value === "Married" ? prevData.wedding_anniversary : "", // Clear if not Married
                    }));
                  }}
                  value={personnelData.civil_status}
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
                  Wedding Anniversary:
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
                Surname Name(Maiden):
              </Text>
              <Input
                placeholder="Surname (Maiden)"
                name="surname_maiden"
                value={personnelData.surname_maiden}
                onChange={handleChange}
                width="100%"
                isDisabled={personnelData.gender === "Male"}
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
                Surname Name(Husband):
              </Text>
              <Input
                placeholder="Surname (Husband)"
                name="surname_husband"
                value={personnelData.surname_husband}
                onChange={handleChange}
                width="100%"
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
                isDisabled={personnelData.gender === "Female"} // Disable for Female gender
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
                Nickname:
              </Text>
              <Input
                placeholder="Nickname"
                name="nickname"
                value={personnelData.nickname}
                onChange={handleChange}
                width="100%"
              />
            </Box>

            {/* Local Congregation */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Local Congregation:
              </Text>
              <Input
                placeholder="Local Congregation"
                name="registered_local_congregation"
                value={personnelData.registered_local_congregation}
                onChange={handleChange}
                width="100%"
              />
            </Box>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
            gap="4"
          >
            {/* Date of Birth Input with Age Calculation */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Flex align="center" width="100%">
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
                />
              </Flex>
            </Box>

            {/* Age Display */}
            <Box width={{ base: "100%", md: "15%" }}>
              <Flex align="center" width="100%">
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
                />
              </Flex>
            </Box>

            {/* Place of Birth */}
            <Box width={{ base: "100%", md: "50%" }}>
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
              />
            </Box>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
            gap="4"
          >
            {/* Date Joined */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Box align="center" width="100%">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mr="2"
                  color="#0a5856"
                  whiteSpace="nowrap"
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
                />
              </Box>
            </Box>

            {/* Language Selector */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Select
                placeholder="Select Language"
                name="language_id"
                value={languages
                  .map((language) => ({
                    value: language.id, // Map to the id of the Language model
                    label: language.name, // Display the language name
                  }))
                  .find((option) => option.value === personnelData.language_id)}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "language_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={languages.map((language) => ({
                  value: language.id, // Use the id of the Language model
                  label: language.name, // Use the language name for display
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

            {/* Blood Type Selector */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Select
                placeholder="Select Blood Type"
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
              />
            </Box>
          </Flex>

          <Flex
            wrap="nowrap"
            justify="space-between"
            align="center"
            mb="3"
            width="100%"
            gap="4"
            position="relative" // Added for tooltip positioning
          >
            {/* Email Input Field */}
            <Flex
              align="center"
              width={{ base: "100%", md: "35%" }}
              mb={{ base: "3", md: "0" }}
              position="relative" // Added for tooltip positioning
            >
              <Text
                fontWeight="bold"
                mr="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Email Address:
              </Text>
              <Input
                placeholder="Enter Email Address"
                name="email_address"
                value={personnelData.email_address}
                onChange={(e) =>
                  handleChange({
                    target: { name: "email_address", value: e.target.value },
                  })
                }
                width="100%"
                isInvalid={!!emailError}
                errorBorderColor="red.300"
              />
              {emailError && (
                <Box
                  position="absolute"
                  bottom="-20px" // Positioned below the input
                  left="0"
                  color="red.500"
                  fontSize="sm"
                  bg="white"
                  p="1"
                  borderRadius="md"
                  boxShadow="md"
                  zIndex="10" // Ensure tooltip is above other elements
                >
                  {emailError}
                </Box>
              )}
            </Flex>

            {/* Citizenship Selector */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Select
                placeholder="Select Citizenship"
                name="citizenship"
                value={citizenships
                  .map((citizenship) => ({
                    value: citizenship.id,
                    label: citizenship.citizenship,
                  }))
                  .find((option) => option.value === personnelData.citizenship)}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "citizenship",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={citizenships.map((citizenship) => ({
                  value: citizenship.id,
                  label: citizenship.citizenship,
                }))}
                isClearable // Adds a clear button to reset selection
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
              />
            </Box>

            {/* Nationality Selector */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Select
                placeholder="Select Nationality"
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
              width={{ base: "100%", md: "48%" }}
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
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "department_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
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
              />
            </Box>

            {/* Section */}
            <Box
              width={{ base: "100%", md: "48%" }}
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
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "section_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={filteredSections.map((section) => ({
                  value: section.id,
                  label: section.name,
                }))}
                isDisabled={!personnelData.department_id} // Disable if no department is selected
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
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "3" }}
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
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "subsection_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
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
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "3" }}
            >
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Designation:
              </Text>
              <Select
                placeholder="Select Designation"
                name="designation_id"
                value={designations
                  .map((designation) => ({
                    value: designation.id,
                    label: designation.name,
                  }))
                  .find(
                    (option) => option.value === personnelData.designation_id
                  )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "designation_id",
                      value: selectedOption?.value || "",
                    },
                  })
                }
                options={filteredDesignations.map((designation) => ({
                  value: designation.id,
                  label: designation.name,
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
            {/* District */}
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
              />
            </Box>

            {/* Local Congregation */}
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
              <Input
                placeholder="Local Congregation"
                name="local_congregation"
                value={personnelData.local_congregation}
                onChange={handleChange}
                width="100%"
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
                  />
                </Flex>

                {/* Ministerial Status */}
                <Flex direction="column" mb="3" width="100%">
                  <Text fontSize="md" fontWeight="bold" mb="1" color="#0a5856">
                    Ministerial Status:
                  </Text>
                  <RadioGroup
                    name="m_status"
                    onChange={(value) =>
                      handleChange({ target: { name: "m_status", value } })
                    }
                    value={personnelData.m_status}
                  >
                    <Stack direction="row" spacing={4} wrap="wrap">
                      <Radio value="May Destino">May Destino</Radio>
                      <Radio value="Fulltime">Fulltime</Radio>
                    </Stack>
                  </RadioGroup>
                </Flex>
              </>
            )}
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
                        option.value === personnelData.district_assignment_id
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
                />
              </Box>

              {/* Local Congregation Assignment*/}
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
                <Input
                  placeholder="Local Congregation"
                  name="local_congregation_assignment"
                  value={personnelData.local_congregation_assignment}
                  onChange={handleChange}
                  width="100%"
                />
              </Box>
            </Flex>
          )}

          {/* Panunumpa Date */}
          {personnelData.gender === "Male" &&
            ["Minister", "Regular"].includes(personnelData.personnel_type) && (
              <Flex align="center" mb="3" width="100%">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mr="4"
                  width="150px"
                  color="#0a5856"
                >
                  Panunumpa Date:
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
                  width="calc(100% - 150px)" // Matches remaining width
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
                  width="150px"
                  color="#0a5856"
                >
                  Ordination Date:
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
                  width="calc(100% - 150px)" // Matches remaining width
                />
              </Flex>
            )}
        </Box>
      )}
    </Box>
  );
};

export default Step1;
