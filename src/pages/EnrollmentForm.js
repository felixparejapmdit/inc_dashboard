// src/pages/EnrollmentForm.js
import React, { useState, useEffect } from "react";
import { Box, Button, VStack, Heading, Flex, useToast } from "@chakra-ui/react";
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

  const suffixOptions = [
    "No Suffix",
    "Jr.",
    "Sr.",
    "II",
    "III",
    "IV",
    "V",
    "VI",
  ];

  const civilStatusOptions = [
    "Annulled",
    "Cohabitating",
    "Divorced",
    "Engaged",
    "Married",
    "Separated",
    "Single",
    "Widowed",
  ];

  const employmentTypeOptions = [
    "Casual",
    "Contract",
    "Freelance",
    "Full-Time",
    "Internship",
    "Part-Time",
    "Retired",
    "Seasonal",
    "Self-Employed",
    "Temporary",
    "Unemployed",
    "Volunteer",
  ];

  const educationalLevelOptions = [
    "No Formal Education",
    "Primary Education",
    "Secondary Education",
    "Vocational Training",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate Degree",
    "Post-Doctorate",
    "Certificate Programs",
    "Professional Degree",
    "Continuing Education",
    "Alternative Learning System",
  ];

  const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

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

  const initialFamilyMember = {
    relationshipType: "",
    givenname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    gender: "",
    bloodtype: "",
    civil_status: "",
    date_of_marriage: "",
    place_of_marriage: "",
    citizenship: "",
    nationality: "",
    date_of_birth: "",
    contact_number: "",
    church_duties: "",
    livelihood: "",
    district_id: "",
    local_congregation: "",
    minister_officiated: "",
    employment_type: "",
    company: "",
    address: "",
    position: "",
    department: "",
    section: "",
    start_date: "",
    end_date: "",
    reason_for_leaving: "",
    education_level: "",
    start_year: "",
    completion_year: "",
    school: "",
    field_of_study: "",
    degree: "",
    institution: "",
    professional_licensure_examination: "",
    isEditing: true,
  };

  const toast = useToast();
  const [family, setFamily] = useState({
    parents: [
      { ...initialFamilyMember, relationshipType: "Father", gender: "Male" },
      { ...initialFamilyMember, relationshipType: "Mother", gender: "Female" },
    ],
    siblings: [{ ...initialFamilyMember, relationshipType: "Sibling" }],
    spouses: [{ ...initialFamilyMember, relationshipType: "Spouse" }],
    children: [{ ...initialFamilyMember, relationshipType: "Child" }],
  });

  // Add Family Member
  const handleAddFamilyMember = (type, relationshipType = "") => {
    if (type === "parents") {
      toast({
        title: "Error",
        description: "Only Father and Mother are allowed in Parents.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: [
        ...prevFamily[type],
        { ...initialFamilyMember, relationshipType, isEditing: true },
      ],
    }));
  };

  // Edit Family Member
  const handleFamilyMemberChange = (type, index, field, value) => {
    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: prevFamily[type].map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  // Toggle Edit Mode
  // const toggleEditFamilyMember = (type, index) => {
  //   setFamily((prevFamily) => ({
  //     ...prevFamily,
  //     [type]: prevFamily[type].map((member, i) =>
  //       i === index ? { ...member, isEditing: !member.isEditing } : member
  //     ),
  //   }));
  // };

  const toggleEditFamilyMember = (type, index) => {
    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: prevFamily[type].map((member, i) =>
        i === index ? { ...member, isEditing: !member.isEditing } : member
      ),
    }));
  };

  // State to manage parents' data for Step4
  // const [parents, setParents] = useState([
  //   {
  //     relationshipType: "Father",
  //     givenName: "",
  //     middleName: "",
  //     lastName: "",
  //     suffix: "",
  //     gender: "Female",
  //     bloodType: "",
  //     civilStatus: "",
  //     dateOfBirth: "",
  //     dateOfMarriage: "",
  //     placeOfMarriage: "",
  //     citizenship: "",
  //     nationality: "",
  //     contactNumber: "",
  //     churchDuties: "",
  //     livelihood: "",
  //     districtId: "",
  //     localCongregation: "",
  //     ministerOfficiated: "",
  //     employmentType: "",
  //     company: "",
  //     address: "",
  //     position: "",
  //     department: "",
  //     section: "",
  //     startDate: "",
  //     endDate: "",
  //     reasonForLeaving: "",
  //     educationLevel: "",
  //     startYear: "",
  //     completionYear: "",
  //     school: "",
  //     fieldOfStudy: "",
  //     degree: "",
  //     institution: "",
  //     professionalLicensureExamination: "",
  //     isEditing: true,
  //   },
  //   {
  //     relationshipType: "Mother",
  //     givenName: "",
  //     middleName: "",
  //     lastName: "",
  //     suffix: "",
  //     gender: "Female",
  //     bloodType: "",
  //     civilStatus: "",
  //     dateOfBirth: "",
  //     dateOfMarriage: "",
  //     placeOfMarriage: "",
  //     citizenship: "",
  //     nationality: "",
  //     contactNumber: "",
  //     churchDuties: "",
  //     livelihood: "",
  //     districtId: "",
  //     localCongregation: "",
  //     ministerOfficiated: "",
  //     employmentType: "",
  //     company: "",
  //     address: "",
  //     position: "",
  //     department: "",
  //     section: "",
  //     startDate: "",
  //     endDate: "",
  //     reasonForLeaving: "",
  //     educationLevel: "",
  //     startYear: "",
  //     completionYear: "",
  //     school: "",
  //     fieldOfStudy: "",
  //     degree: "",
  //     institution: "",
  //     professionalLicensureExamination: "",
  //     isEditing: true,
  //   },
  // ]);

  //Add Family Member
  const handleAddContact = () =>
    setContacts([...contacts, { contactType: "", contactInfo: "" }]);
  const handleAddAddress = () =>
    setAddresses([...addresses, { addressType: "", name: "" }]);
  const handleAddGovID = () =>
    setGovIDs([...govIDs, { govIDType: "", govIDNumber: "" }]);

  //Edit Family Member
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
          suffixOptions={suffixOptions}
          civilStatusOptions={civilStatusOptions}
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
          data={family.parents}
          setData={(updatedParents) =>
            setFamily((prevFamily) => ({
              ...prevFamily,
              parents: updatedParents,
            }))
          }
          onChange={(index, field, value) =>
            handleFamilyMemberChange("parents", index, field, value)
          }
          onToggleEdit={(index) => toggleEditFamilyMember("parents", index)}
          citizenships={citizenships}
          nationalities={nationalities}
          suffixOptions={suffixOptions}
          districts={districts}
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
        />
      )}

      {step === 6 && (
        <Step6
          data={family.siblings}
          setData={(updatedSiblings) =>
            setFamily((prevFamily) => ({
              ...prevFamily,
              siblings: updatedSiblings,
            }))
          }
          // onAdd={() => handleAddFamilyMember("siblings", "Sibling")}
          onChange={(index, field, value) =>
            handleFamilyMemberChange("siblings", index, field, value)
          }
          onToggleEdit={(index) => toggleEditFamilyMember("siblings", index)}
          onAddSibling={() => handleAddFamilyMember("siblings", "Sibling")}
          citizenships={citizenships}
          nationalities={nationalities}
          suffixOptions={suffixOptions}
          districts={districts}
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
        />
      )}

      {step === 7 && (
        <Step7
          data={family.spouses}
          setData={(updatedSpouses) =>
            setFamily((prevFamily) => ({
              ...prevFamily,
              spouses: updatedSpouses,
            }))
          }
          onAdd={() => handleAddFamilyMember("spouses", "Spouse")}
          onChange={(index, field, value) =>
            handleFamilyMemberChange("spouses", index, field, value)
          }
          onToggleEdit={(index) => toggleEditFamilyMember("spouses", index)}
          citizenships={citizenships}
          nationalities={nationalities}
          suffixOptions={suffixOptions}
          districts={districts}
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
        />
      )}

      {step === 8 && (
        <Step8
          data={family.children}
          setData={(updatedChildren) =>
            setFamily((prevFamily) => ({
              ...prevFamily,
              children: updatedChildren,
            }))
          }
          onAdd={() => handleAddFamilyMember("children", "Child")}
          onChange={(index, field, value) =>
            handleFamilyMemberChange("children", index, field, value)
          }
          onToggleEdit={(index) => toggleEditFamilyMember("children", index)}
          citizenships={citizenships}
          nationalities={nationalities}
          suffixOptions={suffixOptions}
          districts={districts}
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
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
