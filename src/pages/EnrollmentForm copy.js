// src/pages/EnrollmentForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Progress,
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

const EnrollmentForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [progress, setProgress] = useState(10);
  const [personnelData, setPersonnelData] = useState({
    reference_number: "",
    enrollment_progress: 1,
    personnel_progress: "",
    givenname: "",
    middlename: "",
    surname_maiden: "",
    surname_husband: "",
    nickname: "",
    suffix: "",
    languages: "",
    date_of_birth: "",
    place_of_birth: "",
    gender: "",
    bloodtype: "",
    civil_status: "Select Civil Status",
    wedding_anniversary: "",
    citizenship: "",
    nationality: "",
    contact_info: "",
    email_address: "",
    government_id: "",
    address_id: "",
    local_congregation: "",
    district_id: "",
    inc_status: "",
    department_id: "",
    section_id: "",
    subsection_id: "",
    designation_id: "",
    datejoined: "",
    personnel_type: "",
    assigned_number: "",
    m_type: "",
    panunumpa_date: "",
    ordination_date: "",
  });

  // API data
  const [bloodtypes] = useState([
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
  ]);
  const [civilStatuses] = useState(["Single", "Married"]);
  const [citizenships, setCitizenships] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [designations, setDesignations] = useState([]);

  const languages = [
    { code: "en", name: "English" },
    { code: "fil", name: "Filipino" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
    { code: "ko", name: "Korean" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "vi", name: "Vietnamese" },
  ];

  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex pattern
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const [age, setAge] = useState("");

  // Update the age whenever date_of_birth changes
  useEffect(() => {
    if (personnelData.date_of_birth) {
      const birthDate = new Date(personnelData.date_of_birth);
      const today = new Date();
      let computedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      // Adjust age if the birth date hasn't occurred yet this year
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        computedAge--;
      }
      setAge(computedAge);
    } else {
      setAge(""); // Clear age if no birth date
    }
  }, [personnelData.date_of_birth]);

  // Load API data for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const citizenshipsRes = await axios.get("/api/citizenships");
        const nationalitiesRes = await axios.get("/api/nationalities");
        const districtsRes = await axios.get("/api/districts");
        const departmentsRes = await axios.get("/api/departments");
        const sectionsRes = await axios.get("/api/sections");
        const subsectionsRes = await axios.get("/api/subsections");
        const designationsRes = await axios.get("/api/designations");

        setCitizenships(citizenshipsRes.data);
        setNationalities(nationalitiesRes.data);
        setDistricts(districtsRes.data);
        setDepartments(departmentsRes.data);
        setSections(sectionsRes.data);
        setSubsections(subsectionsRes.data);
        setDesignations(designationsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // General input handler function for controlled inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPersonnelData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "email_address") {
      validateEmail(value);
    }
  };

  const handleNext = async () => {
    setIsLoading(true); // Start loading
    try {
      // Send personnelData to backend API
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
          // Redirect to Step2 page if current step is 1
          navigate("/step2");

          // setStep(2); // Navigate to Step 2 after successful submission
        } else {
          // Otherwise, move to the next step
          setStep((prevStep) => Math.min(prevStep + 1, totalSteps));
        }
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error("Error saving personnel data:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save personnel data. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const handleBackToLogin = () => {
    navigate("/login"); // Navigate back to login page
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
          <Button colorScheme="gray" onClick={handleBackToLogin} mr={4}>
            Back to Login
          </Button>
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
        {/* Step Indicator */}
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

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Box width="100%" bg="white" boxShadow="sm" my={85}>
          <Flex justifyContent="center" mb="4">
            <Text
              fontSize={{ base: "2xl", md: "2xl" }}
              fontWeight="bold"
              color="#0a5856"
              textAlign="center"
            >
              Step 1: Basic Information
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
            {/* Gender Label and Radio Group */}
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
                  onChange={(value) => {
                    handleChange({ target: { name: "gender", value } });
                    setPersonnelData((prevData) => ({
                      ...prevData,
                      gender: value,
                      surname_maiden_disabled: value === "Male",
                      surname_husband_disabled: value === "Male",
                    }));
                  }}
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
                    handleChange({ target: { name: "civil_status", value } });
                    setPersonnelData((prevData) => ({
                      ...prevData,
                      civil_status: value,
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

            {/* Wedding Anniversary */}
            <Box
              width={{ base: "100%", md: "35%" }}
              visibility={
                personnelData.civil_status === "Married" ? "visible" : "hidden"
              }
            >
              <Flex align="center" width="100%">
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
                    handleChange(e.target.value, "wedding_anniversary")
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
              <Input
                placeholder="Surname (Husband)"
                name="surname_husband"
                value={personnelData.surname_husband}
                onChange={handleChange}
                width="100%"
              />
            </Box>
          </Flex>

          <Text
            fontSize="md"
            fontWeight="bold"
            mr="2"
            whiteSpace="nowrap"
            color="#0a5856"
          >
            Extension Name eg. Jr, III (If applicable)
          </Text>
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
              <Flex align="center">
                <Select
                  placeholder="Select Suffix"
                  name="suffix"
                  value={personnelData.suffix}
                  onChange={handleChange}
                  width="100%"
                >
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="V">V</option>
                  <option value="VI">VI</option>
                </Select>
              </Flex>
            </Box>

            {/* Nickname Input */}
            <Box
              width={{ base: "100%", md: "48%" }}
              mb={{ base: "3", md: "0" }}
            >
              <Flex align="center">
                <Input
                  placeholder="Nickname"
                  name="nickname"
                  value={personnelData.nickname}
                  onChange={handleChange}
                  width="100%"
                />
              </Flex>
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
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
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
          >
            {/* Email Input Field */}
            <Flex
              align="center"
              width={{ base: "100%", md: "35%" }}
              mb={{ base: "3", md: "0" }}
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
            </Flex>

            {/* Email Error Message */}
            {emailError && (
              <Box
                color="red.500"
                fontSize="sm"
                mt="-2"
                mb="2"
                ml={{ base: "0", md: "140px" }}
                width={{ base: "100%", md: "auto" }}
              >
                {emailError}
              </Box>
            )}

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
                    {citizenship.name}
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
                    {nationality.name}
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
              <Select
                placeholder="Select Section"
                name="section_id"
                value={personnelData.section_id}
                onChange={(e) =>
                  handleChange({
                    target: { name: "section_id", value: e.target.value },
                  })
                }
                width="100%"
              >
                {sections.map((section) => (
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
              >
                {subsections.map((subsection) => (
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
              >
                {designations.map((designation) => (
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
                  name="m_type"
                  onChange={(value) =>
                    handleChange({ target: { name: "m_type", value } })
                  }
                  value={personnelData.m_type}
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
