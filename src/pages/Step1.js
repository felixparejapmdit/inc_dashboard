// src/pages/Step1.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Select,
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
            mb="5"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Suffix Selector */}
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
                Suffix:
              </Text>
              <Select
                name="suffix"
                value={personnelData.suffix}
                onChange={handleChange}
                width="100%"
                isDisabled={personnelData.gender === "Female"}
              >
                <option value="" disabled>
                  Select Suffix
                </option>
                {suffixOptions.map((suffix) => (
                  <option key={suffix} value={suffix}>
                    {suffix}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Nickname Input */}
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
              <Flex align="center" width="100%">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mr="2"
                  color="#0a5856"
                  whiteSpace="nowrap"
                >
                  Date Joined:
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
              </Flex>
            </Box>

            {/* Language Selector */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Select
                placeholder="Select Language"
                name="languages"
                value={personnelData.languages}
                onChange={(e) =>
                  handleChange({
                    target: { name: "languages", value: e.target.value },
                  })
                }
                width="100%"
              >
                {languages.map((language) => (
                  <option key={language.id} value={language.language}>
                    {language.country_name} - {language.language}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Blood Type Selector */}
            <Box width={{ base: "100%", md: "30%" }}>
              <Select
                placeholder="Select Blood Type"
                name="bloodtype"
                value={personnelData.bloodtype}
                onChange={(e) =>
                  handleChange({
                    target: { name: "bloodtype", value: e.target.value },
                  })
                }
                width="100%"
              >
                {bloodtypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
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
                value={personnelData.citizenship}
                onChange={(e) =>
                  handleChange({
                    target: { name: "citizenship", value: e.target.value },
                  })
                }
                width="100%"
              >
                {citizenships.map((citizenship) => (
                  <option key={citizenship.id} value={citizenship.id}>
                    {citizenship.citizenship}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Nationality Selector */}
            <Box
              width={{ base: "100%", md: "30%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Select
                placeholder="Select Nationality"
                name="nationality"
                value={personnelData.nationality}
                onChange={(e) =>
                  handleChange({
                    target: { name: "nationality", value: e.target.value },
                  })
                }
                width="100%"
              >
                {nationalities.map((nationality) => (
                  <option key={nationality.id} value={nationality.id}>
                    {nationality.nationality}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>

          <Flex
            align="center"
            mb="3"
            width="100%"
            wrap="wrap"
            justify="space-between"
          >
            {/* Department */}
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
                value={personnelData.department_id}
                onChange={(e) =>
                  handleChange({
                    target: { name: "department_id", value: e.target.value },
                  })
                }
                width="100%"
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
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
                value={personnelData.section_id} // Bind current value
                onChange={(e) =>
                  handleChange({
                    target: { name: "section_id", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!personnelData.department_id} // Disable if no department is selected
              >
                {filteredSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </Select>
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
                value={personnelData.subsection_id}
                onChange={(e) =>
                  handleChange({
                    target: { name: "subsection_id", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!personnelData.section_id} // Disable if no section is selected
              >
                {filteredSubsections.map((subsection) => (
                  <option key={subsection.id} value={subsection.id}>
                    {subsection.name}
                  </option>
                ))}
              </Select>
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
                value={personnelData.designation_id}
                onChange={(e) =>
                  handleChange({
                    target: { name: "designation_id", value: e.target.value },
                  })
                }
                width="100%"
                isDisabled={!personnelData.section_id} // Disable if no section is selected
              >
                {filteredDesignations.map((designation) => (
                  <option key={designation.id} value={designation.id}>
                    {designation.name}
                  </option>
                ))}
              </Select>
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
                District:
              </Text>
              <Select
                placeholder="Select District"
                name="district_id"
                value={personnelData.district_id}
                onChange={(e) =>
                  handleChange({
                    target: { name: "district_id", value: e.target.value },
                  })
                }
                width="100%"
              >
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </Select>
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
                Local Congregation:
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
                <Radio value="Minister" width={{ base: "100%", md: "auto" }}>
                  Minister
                </Radio>
                <Radio value="Regular" width={{ base: "100%", md: "auto" }}>
                  Regular
                </Radio>
                <Radio
                  value="Ministerial Student"
                  width={{ base: "100%", md: "auto" }}
                >
                  Ministerial Student
                </Radio>
                <Radio
                  value="Minister's Wife"
                  width={{ base: "100%", md: "auto" }}
                >
                  Minister's Wife
                </Radio>
                <Radio value="Lay Member" width={{ base: "100%", md: "auto" }}>
                  Lay Member
                </Radio>
              </Stack>
            </RadioGroup>
          </Flex>

          {/* Conditional Fields Based on Personnel Type */}
          {["Minister", "Regular", "Ministerial Student"].includes(
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

          {/* Panunumpa Date */}
          {["Minister", "Regular"].includes(personnelData.personnel_type) && (
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
          {personnelData.personnel_type === "Minister" && (
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
                    target: { name: "ordination_date", value: e.target.value },
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
