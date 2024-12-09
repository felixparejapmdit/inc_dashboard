// src/pages/EnrollmentForm.js
import React, { useState, useEffect } from "react";
import { Box, Button, VStack, Heading, Flex } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckIcon } from "@chakra-ui/icons";
import Step1 from "./Step1";
import Step2 from "./Step2"; // Update the path if needed
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5"; // Import Step4 component
import Step6 from "./Step6"; // Import Step5 component for siblings
import Step7 from "./Step7"; // Import Step6 component for spouse
import Step8 from "./Step8";

const API_URL = process.env.REACT_APP_API_URL;

const EnrollmentForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 values
  const [personnelData, setPersonnelData] = useState({
    gender: "",
    civil_status: "",
    surname_maiden_disabled: false,
    surname_husband_disabled: false,
    wedding_anniversary: "",
    givenname: "",
    middlename: "",
    surname_maiden: "",
    surname_husband: "",
    suffix: "",
    nickname: "",
    date_of_birth: "",
    age: "",
    place_of_birth: "",
    datejoined: "",
    languages: "",
    bloodtype: "",
    citizenship: "",
    nationality: "",
    department_id: "",
    section_id: "",
    subsection_id: "",
    designation_id: "",
    district_id: "",
    local_congregation: "",
    personnel_type: "",
    assigned_number: "",
    m_type: "",
    panunumpa_date: "",
    ordination_date: "",
  });

  const [emailError, setEmailError] = useState("");
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
  
  const [languages, setLanguages] = useState([]);
  const [citizenships, setCitizenships] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Fetch data on component load
  useEffect(() => {
    // Helper function to fetch and set data
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await axios.get(`${API_URL}/api/${endpoint}`);
        setter(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData("languages", setLanguages); // Add this line for languages
    fetchData("citizenships", setCitizenships);
    fetchData("nationalities", setNationalities);
    fetchData("departments", setDepartments);
    fetchData("sections", setSections);
    fetchData("subsections", setSubsections);
    fetchData("designations", setDesignations);
    fetchData("districts", setDistricts);
  }, []);

  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);

  // State to manage parents' data for Step4
  const [parents, setParents] = useState([
    {
      relationshipType: "Father",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Male",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      dateOfMarriage: "",
      placeOfMarriage: "",
      citizenship: "",
      nationality: "",
      contactNumber: "",
      churchDuties: "",
      livelihood: "",
      localCongregation: "",
      districtId: "",
      ministerOfficiated: "",
      employmentType: "",
      company: "",
      address: "",
      position: "",
      department: "",
      section: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true,
    },
    {
      relationshipType: "Mother",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Female",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      dateOfMarriage: "",
      placeOfMarriage: "",
      citizenship: "",
      nationality: "",
      contactNumber: "",
      churchDuties: "",
      livelihood: "",
      localCongregation: "",
      districtId: "",
      ministerOfficiated: "",
      employmentType: "",
      company: "",
      address: "",
      position: "",
      department: "",
      section: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true,
    },
  ]);

  const handleAddContact = () =>
    setContacts([...contacts, { contactType: "", contactInfo: "" }]);
  const handleAddAddress = () =>
    setAddresses([...addresses, { addressType: "", name: "" }]);
  const handleAddGovID = () =>
    setGovIDs([...govIDs, { govIDType: "", govIDNumber: "" }]);

  const handleContactChange = (idx, field, value) => {
    const updatedContacts = contacts.map((contact, i) =>
      i === idx ? { ...contact, [field]: value } : contact
    );
    setContacts(updatedContacts);
  };

  const handleAddressChange = (idx, field, value) => {
    const updatedAddresses = addresses.map((address, i) =>
      i === idx ? { ...address, [field]: value } : address
    );
    setAddresses(updatedAddresses);
  };

  const handleGovIDChange = (idx, field, value) => {
    const updatedGovIDs = govIDs.map((id, i) =>
      i === idx ? { ...id, [field]: value } : id
    );
    setGovIDs(updatedGovIDs);
  };

  const handleAddEducation = () =>
    setEducation([
      ...education,
      {
        level: "",
        startFrom: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensure: "",
        isEditing: true,
      },
    ]);

  const handleAddWorkExperience = () =>
    setWorkExperience([
      ...workExperience,
      {
        employmentType: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        isEditing: true,
      },
    ]);

  const toggleEditParent = (index) => {
    const updatedParents = [...parents];
    updatedParents[index].isEditing = !updatedParents[index].isEditing;
    setParents(updatedParents);
  };

  const handleParentChange = (index, field, value) => {
    const updatedParents = parents.map((parent, i) =>
      i === index ? { ...parent, [field]: value } : parent
    );
    setParents(updatedParents);
  };

  const [siblings, setSiblings] = useState([
    {
      relationshipType: "Sibling",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Male",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      contactNumber: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true,
    },
  ]);

  // 3. Functions for managing siblings
  const handleAddSibling = () =>
    setSiblings([
      ...siblings,
      {
        relationshipType: "Sibling",
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "Male",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        contactNumber: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensureExamination: "",
        isEditing: true,
      },
    ]);

  const handleSiblingChange = (index, field, value) => {
    const updatedSiblings = siblings.map((sibling, i) =>
      i === index ? { ...sibling, [field]: value } : sibling
    );
    setSiblings(updatedSiblings);
  };

  const [spouses, setSpouses] = useState([
    {
      relationshipType: "Spouse",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Male", // Default gender
      status: "Alive", // Default status
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      contactNumber: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      employmentType: "",
      company: "",
      address: "",
      position: "",
      department: "",
      section: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      isEditing: true,
    },
  ]);

  const handleAddSpouse = () => {
    setSpouses([
      ...spouses,
      {
        relationshipType: "Spouse",
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "Female",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        dateOfMarriage: "",
        placeOfMarriage: "",
        citizenship: "",
        nationality: "",
        contactNumber: "",
        churchDuties: "",
        livelihood: "",
        localCongregation: "",
        districtId: "",
        ministerOfficiated: "",
        employmentType: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensureExamination: "",
        status: "Alive",
        isEditing: true,
      },
    ]);
  };

  const handleSpouseChange = (index, field, value) => {
    const updatedSpouses = spouses.map((spouse, i) =>
      i === index ? { ...spouse, [field]: value } : spouse
    );
    setSpouses(updatedSpouses);
  };

  const toggleEditSpouse = (index) => {
    const updatedSpouses = [...spouses];
    updatedSpouses[index].isEditing = !updatedSpouses[index].isEditing;
    setSpouses(updatedSpouses);
  };

  const handleDeleteSpouse = (index) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  const [children, setChildren] = useState([
    {
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      contactNumber: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true,
    },
  ]);

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        contactNumber: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensureExamination: "",
        isEditing: true,
      },
    ]);
  };

  const toggleEditChild = (index) => {
    const updatedChildren = [...children];
    updatedChildren[index].isEditing = !updatedChildren[index].isEditing;
    setChildren(updatedChildren);
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = children.map((child, i) =>
      i === index ? { ...child, [field]: value } : child
    );
    setChildren(updatedChildren);
  };

  const handleDeleteChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const [personnelImage, setPersonnelImage] = useState(null);
  const [personnelId, setPersonnelId] = useState(null);

  const handleSaveImage = (imageData) => {
    setPersonnelImage(imageData);
    // Here you can add code to save `imageData` to your database if needed.
  };

  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login"); // Navigate back to login page
  };

  const handleNext = async () => {
    setIsLoading(true);
    if (step === 1) {
      try {
        await axios.post(`${API_URL}/api/personnels`, personnelData, {
          headers: { "Content-Type": "application/json" },
        });
        setStep(2); // Move to Step 2
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Failed to save data. Please try again.");
      }
    } else {
      setStep(step + 1);
    }
    setIsLoading(false);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPersonnelData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Conditional logic for email validation
      if (name === "email_address") {
        validateEmail(value);
      }

      // Conditional logic for civil_status
      if (name === "civil_status") {
        updatedData.wedding_anniversary =
          value === "Married" ? prevData.wedding_anniversary : ""; // Reset wedding_anniversary if not married
      }

      // Conditional logic for gender
      if (name === "gender") {
        updatedData.surname_maiden_disabled = value === "Male";
        updatedData.surname_husband_disabled = value === "Male";
        if (value === "Male") {
          updatedData.surname_maiden = ""; // Clear surname_maiden if gender is Male
          updatedData.surname_husband = ""; // Clear surname_husband if gender is Male
        }
      }

      return updatedData;
    });
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
        {/* Progress Indicator */}
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

      {/* Step Content */}
      {step === 1 && (
        <Step1
          personnelData={personnelData}
          setPersonnelData={setPersonnelData} // Add this line
          handleChange={handleChange}
          emailError={emailError}
          age={age}
          languages={languages}
          citizenships={citizenships}
          nationalities={nationalities}
          departments={departments}
          sections={sections}
          subsections={subsections}
          designations={designations}
          districts={districts}
        />
      )}

      {step === 2 && (
        <Step2 personnelId={personnelId} onSaveImage={handleSaveImage} />
      )}

      {step === 3 && (
        <Step3
          contacts={contacts}
          addresses={addresses}
          govIDs={govIDs}
          handleAddContact={handleAddContact}
          handleAddAddress={handleAddAddress}
          handleAddGovID={handleAddGovID}
          handleContactChange={handleContactChange}
          handleAddressChange={handleAddressChange}
          handleGovIDChange={handleGovIDChange}
        />
      )}

      {step === 4 && (
        <Step4
          education={education}
          workExperience={workExperience}
          handleAddEducation={handleAddEducation}
          handleAddWorkExperience={handleAddWorkExperience}
          setEducation={setEducation}
          setWorkExperience={setWorkExperience}
        />
      )}

      {step === 5 && (
        <Step5
          parents={parents}
          handleParentChange={handleParentChange}
          toggleEditParent={toggleEditParent}
          citizenships={citizenships}
          nationalities={nationalities}
        />
      )}

      {step === 6 && (
        <Step6
          siblings={siblings}
          handleSiblingChange={handleSiblingChange}
          handleAddSibling={handleAddSibling}
          citizenships={citizenships}
          nationalities={nationalities}
        />
      )}

      {step === 7 && (
        <Step7
          spouses={spouses}
          handleSpouseChange={handleSpouseChange}
          handleAddSpouse={handleAddSpouse}
          toggleEditSpouse={toggleEditSpouse}
          handleDeleteSpouse={handleDeleteSpouse}
          citizenships={citizenships}
          nationalities={nationalities}
        />
      )}

      {step === 8 && (
        <Step8
          children={children}
          handleAddChild={handleAddChild}
          handleChildChange={handleChildChange}
          toggleEditChild={toggleEditChild}
          handleDeleteChild={handleDeleteChild}
          citizenships={citizenships}
          nationalities={nationalities}
        />
      )}

      {/* Navigation Buttons */}
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
        {step < 8 ? (
          <Button onClick={handleNext} colorScheme="teal" isLoading={isLoading}>
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
