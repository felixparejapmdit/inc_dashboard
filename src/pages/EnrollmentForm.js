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

const EnrollmentForm = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(10);
  const [personnelData, setPersonnelData] = useState({
    reference_number: "",
    enrollment_progress: 1,
    personnel_progress: "",
    givenname: "",
    middlename: "",
    lastname: "",
    nickname: "",
    suffix: "",
    languages: "",
    date_of_birth: "",
    place_of_birth: "",
    gender: "",
    bloodtype: "",
    civil_status: "",
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
  const [languages, setLanguages] = useState([]);
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
  const [civilStatuses] = useState(["Single", "Married", "Divorced"]);
  const [citizenships, setCitizenships] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Load API data for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const languagesRes = await axios.get("/api/languages");
        const citizenshipsRes = await axios.get("/api/citizenships");
        const nationalitiesRes = await axios.get("/api/nationalities");
        const districtsRes = await axios.get("/api/districts");
        const departmentsRes = await axios.get("/api/departments");
        const sectionsRes = await axios.get("/api/sections");
        const subsectionsRes = await axios.get("/api/subsections");
        const designationsRes = await axios.get("/api/designations");

        setLanguages(languagesRes.data);
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

  const handleChange = (e) => {
    setPersonnelData({ ...personnelData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
    setProgress(progress + 10);
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setProgress(progress - 10);
  };

  return (
    <VStack
      spacing={4}
      w="600px"
      mx="auto"
      mt="50px"
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
        <Heading as="h2" size="lg" color="teal.600" textAlign="center" p={4}>
          Personnel Enrollment
        </Heading>
        <Progress
          colorScheme="teal"
          value={progress}
          size="md"
          width="100%"
          top="0"
        />
      </Box>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Box width="100%" bg="white" boxShadow="sm">
          <Text fontSize="lg" mb="2">
            Step 1: Basic Information
          </Text>
          {/* Basic Fields */}
          <Flex alignItems="center" mb="5"></Flex>
          <Input
            placeholder="Given Name"
            name="givenname"
            value={personnelData.givenname}
            onChange={handleChange}
            mb="3"
          />
          <Input
            placeholder="Middle Name"
            name="middlename"
            value={personnelData.middlename}
            onChange={handleChange}
            mb="3"
          />
          <Input
            placeholder="Last Name"
            name="lastname"
            value={personnelData.lastname}
            onChange={handleChange}
            mb="3"
          />

          <Input
            placeholder="Suffix"
            name="suffix"
            value={personnelData.suffix}
            onChange={handleChange}
            mb="3"
          />
          <Input
            placeholder="Nickname"
            name="nickname"
            value={personnelData.nickname}
            onChange={handleChange}
            mb="3"
          />
          <Flex />
          <Select
            placeholder="Select Language"
            name="languages"
            value={personnelData.languages}
            onChange={handleChange}
            mb="3"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Date of Birth"
            name="date_of_birth"
            type="date"
            value={personnelData.date_of_birth}
            onChange={handleChange}
            mb="3"
          />
          <Input
            placeholder="Place of Birth"
            name="place_of_birth"
            value={personnelData.place_of_birth}
            onChange={handleChange}
            mb="3"
          />

          <RadioGroup
            name="gender"
            onChange={handleChange}
            value={personnelData.gender}
            mb="3"
          >
            <Stack direction="row">
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
            </Stack>
          </RadioGroup>

          <Select
            placeholder="Select Blood Type"
            name="bloodtype"
            value={personnelData.bloodtype}
            onChange={handleChange}
            mb="3"
          >
            {bloodtypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Select Civil Status"
            name="civil_status"
            value={personnelData.civil_status}
            onChange={handleChange}
            mb="3"
          >
            {civilStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Wedding Anniversary"
            name="wedding_anniversary"
            type="date"
            value={personnelData.wedding_anniversary}
            onChange={handleChange}
            mb="3"
          />

          <Select
            placeholder="Select Citizenship"
            name="citizenship"
            value={personnelData.citizenship}
            onChange={handleChange}
            mb="3"
          >
            {citizenships.map((citizenship) => (
              <option key={citizenship.id} value={citizenship.id}>
                {citizenship.name}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Select Nationality"
            name="nationality"
            value={personnelData.nationality}
            onChange={handleChange}
            mb="3"
          >
            {nationalities.map((nationality) => (
              <option key={nationality.id} value={nationality.id}>
                {nationality.name}
              </option>
            ))}
          </Select>
          {/* Additional Fields */}
          <Input
            placeholder="Contact Info"
            name="contact_info"
            value={personnelData.contact_info}
            onChange={handleChange}
            mb="3"
          />
          <Input
            placeholder="Email Address"
            name="email_address"
            value={personnelData.email_address}
            onChange={handleChange}
            mb="3"
          />
          {/* Continue adding more fields as per the requirements */}

          {/* Government ID */}
          <Select
            placeholder="Select Government ID"
            name="government_id"
            value={personnelData.government_id}
            onChange={handleChange}
            mb="3"
          >
            {/* Replace with dynamic data from government ID options if available */}
            <option value="1">ID Type 1</option>
            <option value="2">ID Type 2</option>
          </Select>

          {/* Address ID */}
          <Select
            placeholder="Select Address"
            name="address_id"
            value={personnelData.address_id}
            onChange={handleChange}
            mb="3"
          >
            {/* Replace with dynamic data from address options if available */}
            <option value="1">Address 1</option>
            <option value="2">Address 2</option>
          </Select>

          <Input
            placeholder="Local Congregation"
            name="local_congregation"
            value={personnelData.local_congregation}
            onChange={handleChange}
            mb="3"
          />

          {/* District */}
          <Select
            placeholder="Select District"
            name="district_id"
            value={personnelData.district_id}
            onChange={handleChange}
            mb="3"
          >
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </Select>

          <Flex alignItems="center" mb="3">
            <Text fontSize="md" fontWeight="bold" mr={4}>
              INC Status
            </Text>
            <RadioGroup
              name="inc_status"
              onChange={handleChange}
              value={personnelData.inc_status}
            >
              <Stack direction="row">
                <Radio value="Active">Active</Radio>
                <Radio value="Non-Active">Non-Active</Radio>
              </Stack>
            </RadioGroup>
          </Flex>

          {/* Department */}
          <Select
            placeholder="Select Department"
            name="department_id"
            value={personnelData.department_id}
            onChange={handleChange}
            mb="3"
          >
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>

          {/* Section */}
          <Select
            placeholder="Select Section"
            name="section_id"
            value={personnelData.section_id}
            onChange={handleChange}
            mb="3"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </Select>

          {/* Subsection */}
          <Select
            placeholder="Select Subsection"
            name="subsection_id"
            value={personnelData.subsection_id}
            onChange={handleChange}
            mb="3"
          >
            {subsections.map((subsection) => (
              <option key={subsection.id} value={subsection.id}>
                {subsection.name}
              </option>
            ))}
          </Select>

          {/* Designation */}
          <Select
            placeholder="Select Designation"
            name="designation_id"
            value={personnelData.designation_id}
            onChange={handleChange}
            mb="3"
          >
            {designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.name}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Date Joined"
            name="datejoined"
            type="date"
            value={personnelData.datejoined}
            onChange={handleChange}
            mb="3"
          />

          {/* Personnel Type */}
          <RadioGroup
            name="personnel_type"
            onChange={handleChange}
            value={personnelData.personnel_type}
            mb="3"
          >
            <Stack direction="row">
              <Radio value="Minister">Minister</Radio>
              <Radio value="Regular">Regular</Radio>
              <Radio value="Ministerial Student">Ministerial Student</Radio>
              <Radio value="Minister's Wife">Minister's Wife</Radio>
              <Radio value="Lay Member">Lay Member</Radio>
            </Stack>
          </RadioGroup>

          {/* Assigned Number */}
          {["Minister", "Regular", "Ministerial Student"].includes(
            personnelData.personnel_type
          ) && (
            <Input
              placeholder="Assigned Number"
              name="assigned_number"
              value={personnelData.assigned_number}
              onChange={handleChange}
              mb="3"
            />
          )}

          {/* M Type */}
          <RadioGroup
            name="m_type"
            onChange={handleChange}
            value={personnelData.m_type}
            mb="3"
          >
            <Stack direction="row">
              <Radio value="May Destino">May Destino</Radio>
              <Radio value="Fulltime">Fulltime</Radio>
            </Stack>
          </RadioGroup>

          {/* Panunumpa Date */}
          {["Minister", "Regular"].includes(personnelData.personnel_type) && (
            <Input
              placeholder="Panunumpa Date"
              name="panunumpa_date"
              type="date"
              value={personnelData.panunumpa_date}
              onChange={handleChange}
              mb="3"
            />
          )}

          {/* Ordination Date */}
          {personnelData.personnel_type === "Minister" && (
            <Input
              placeholder="Ordination Date"
              name="ordination_date"
              type="date"
              value={personnelData.ordination_date}
              onChange={handleChange}
              mb="3"
            />
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
        {step < 5 ? (
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
