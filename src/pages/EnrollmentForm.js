// src/pages/EnrollmentForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const EnrollmentForm = ({ referenceNumber }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); // Modal state
  const [searchParams] = useSearchParams();
  const personnelId = searchParams.get("personnel_id");
  const stepParam = searchParams.get("step");

  const [id, setPersonnelId] = useState(null);
  useEffect(() => {
    // Get step and personnel_id from URL parameters
    const stepFromUrl = searchParams.get("step");
    const personnelIdFromUrl = searchParams.get("personnel_id");

    // Set the step from the URL if available
    if (stepFromUrl) {
      setStep(Number(stepFromUrl));
    }

    // Set the personnel_id from the URL
    if (personnelIdFromUrl) {
      setPersonnelId(personnelIdFromUrl);
    }
  }, [searchParams]);
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
    relationship_type: "",
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
      { ...initialFamilyMember, relationship_type: "Father", gender: "Male" },
      { ...initialFamilyMember, relationship_type: "Mother", gender: "Female" },
    ],
    siblings: [{ ...initialFamilyMember, relationship_type: "Sibling" }],
    spouses: [{ ...initialFamilyMember, relationship_type: "Spouse" }],
    children: [{ ...initialFamilyMember, relationship_type: "Child" }],
  });

  // Add Family Member
  const handleAddFamilyMember = (type, relationship_type = "") => {
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

    // Correctly interpolate the relationship_type in the toast message
    toast({
      title: `${relationship_type} Added`,
      description: `A new ${relationship_type} has been added.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Add the new family member to the state
    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: [
        ...prevFamily[type],
        { ...initialFamilyMember, relationship_type, isEditing: true },
      ],
    }));
  };

  // Edit Family Member
  const handleFamilyMemberChange = (type, index, field, value) => {
    console.log("Type:", type);
    console.log("Index:", index);
    console.log("Field:", field);
    console.log("Value:", value);

    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: prevFamily[type].map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  // Toggle Edit Mode
  const toggleEditFamilyMember = (type, index) => {
    setFamily((prevFamily) => ({
      ...prevFamily,
      [type]: prevFamily[type].map((member, i) =>
        i === index ? { ...member, isEditing: !member.isEditing } : member
      ),
    }));
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
  //const [personnelId, setPersonnelId] = useState(null);

  const handleSaveImage = (imageData) => {
    setPersonnelImage(imageData);
    // Here you can add code to save `imageData` to your database if needed.
  };

  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login"); // Navigate back to login page
  };

  const handleFinish = () => {
    // Close the modal
    setIsFinishModalOpen(false);

    // Show a success toast message
    toast({
      title: "Enrollment Process",
      description:
        "You will be redirected to the login page. Please ensure all updates are complete.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Redirect to the login page after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const openFinishModal = () => {
    setIsFinishModalOpen(true);
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

  const handleNext = async () => {
    setIsLoading(true);

    try {
      // Check if we are on the first step
      if (step === 1) {
        if (!personnelId) {
          const missingFields = [];
          if (!personnelData.givenname) missingFields.push("Given Name");
          if (!personnelData.date_of_birth) missingFields.push("Date of Birth");
          if (!personnelData.civil_status) missingFields.push("Civil Status");
          if (!personnelData.email_address) missingFields.push("Email Address");
          if (!personnelData.personnel_type)
            missingFields.push("Personnel Type");

          if (missingFields.length > 0) {
            toast({
              title: "Validation Error",
              description: `The following fields are required: ${missingFields.join(
                ", "
              )}.`,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            setIsLoading(false);
            return;
          }

          // Show confirmation modal for new enrollment
          setIsModalOpen(true);
          setIsLoading(false);
          return;
        } else {
          // If personnel_id exists, update the data directly
          if (!personnelData.email_address) {
            toast({
              title: "Validation Error",
              description: "Email Address is required for updating data.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            setIsLoading(false);
            return;
          }

          await axios.put(`${API_URL}/api/personnels/${personnelId}`, {
            ...personnelData,
            enrollment_progress: "1", // Update enrollment_progress
          });

          toast({
            title: "Enrollment Updated",
            description: "Your enrollment data has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }

      // Move to the next step
      setStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error("Error handling next step:", error);
      toast({
        title: "Error",
        description: "Failed to save enrollment data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Confirm Early Completion and Save Step 1 Data
  const handleConfirm = async () => {
    try {
      setIsLoading(true); // Start loading indicator

      const searchParams = new URLSearchParams(window.location.search);
      const notEnrolledId = searchParams.get("not_enrolled");

      // Destructure necessary fields from personnelData
      const {
        gender,
        civil_status,
        givenname,
        surname_husband,
        date_of_birth,
        email_address,
        personnel_type,
        panunumpa_date,
        ordination_date,
        m_status,
      } = personnelData;

      // Prepare the API payload dynamically
      const response = await axios.post(`${API_URL}/api/personnels`, {
        reference_number: null, // Can be generated later
        enrollment_progress: "1", // Required value
        personnel_progress: "1", // Required value
        gender: gender || null, // Use null if empty
        civil_status: civil_status || null, // Use null if empty
        givenname: givenname || null, // Use null if empty
        surname_husband: surname_husband || null, // Use null if empty
        date_of_birth: date_of_birth || null, // Use null if empty
        email_address: email_address || null, // Use null if empty
        personnel_type: personnel_type || null, // Use null if empty
        panunumpa_date: panunumpa_date || null, // Use null if empty
        ordination_date: ordination_date || null, // Use null if empty
        m_status: m_status || null, // Use null if empty
      });

      // Extract the personnel_id from the response
      const { personnel } = response.data;
      const { personnel_id, reference_number } = personnel;

      // Display a success message with the reference number
      toast({
        title: "Enrollment Saved",
        description: `Your reference number is ${reference_number}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Step 2: If `not_enrolled` exists, update the users table
      if (notEnrolledId) {
        const userResponse = await axios.get(
          `${API_URL}/api/users_access/${notEnrolledId}`
        );

        if (!userResponse.data) {
          throw new Error("User not found in the database.");
        }
        //alert(notEnrolledId);
        // Update the personnel_id in the users table
        await axios.put(`${API_URL}/api/users/update`, {
          username: notEnrolledId,
          personnel_id: personnel_id, // Use the newly created personnel_id
        });
      }

      // Close modal and move to the next step
      setIsModalOpen(false);

      // Redirect to Step 2 with personnel_id
      window.location.href = `/enroll?personnel_id=${personnel_id}&step=2`;
    } catch (error) {
      console.error("Error saving personnel data:", error);

      // Display an error message
      toast({
        title: "Error",
        description: "Failed to save enrollment data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // Fetch personnel and family member data and determine the current step based on enrollment_progress
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        // Fetch personnel data
        const personnelResponse = await axios.get(
          `${API_URL}/api/personnels/${personnelId}`
        );

        if (personnelResponse.data) {
          const personnel = personnelResponse.data;

          // Adjust date fields to the correct format
          setPersonnelData({
            ...personnel,
            panunumpa_date: personnel.panunumpa_date
              ? new Date(personnel.panunumpa_date).toISOString().split("T")[0]
              : "",
            date_of_birth: personnel.date_of_birth
              ? new Date(personnel.date_of_birth).toISOString().split("T")[0]
              : "",
            datejoined: personnel.datejoined
              ? new Date(personnel.datejoined).toISOString().split("T")[0]
              : "",
          });

          // Set step based on enrollment_progress
          if (!stepParam) {
            const enrollmentProgress = parseInt(
              personnel.enrollment_progress,
              10
            );
            setStep(enrollmentProgress || 1);
          }
        } else {
          toast({
            title: "Not Found",
            description: "Personnel data not found.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate("/"); // Redirect to home or login page
          return;
        }

        // Fetch family members for the personnel
        const familyMembersResponse = await axios.get(
          `${API_URL}/api/get-family-members?personnel_id=${personnelId}`
        );
        if (familyMembersResponse.data) {
          const members = familyMembersResponse.data;

          // Organize family members by relationship type
          const organizedFamily = {
            parents: members.filter(
              (member) =>
                member.relationship_type === "Father" ||
                member.relationship_type === "Mother"
            ),
            siblings: members.filter(
              (member) => member.relationship_type === "Sibling"
            ),
            spouses: members.filter(
              (member) => member.relationship_type === "Spouse"
            ),
            children: members.filter(
              (member) => member.relationship_type === "Child"
            ),
          };

          setFamily(organizedFamily);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        toast({
          title: "Error",
          description: "Failed to retrieve enrollment data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/"); // Redirect to home or login page
      }
    };

    if (personnelId) {
      fetchEnrollmentData();
    }
  }, [personnelId, navigate, toast, stepParam]);

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
          <Button
            display="none"
            colorScheme="gray"
            onClick={handleBackToLogin}
            mr={4}
          >
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
              onClick={() => {
                if (index + 1 > 1 && !personnelId) {
                  alert(
                    "Please complete the primary information before proceeding to the next step."
                  );
                  return;
                }
                setStep(index + 1);
              }}
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
          bloodtypes={bloodtypes}
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
          // handleAddContact={handleAddContact}
          // handleAddAddress={handleAddAddress}
          // handleAddGovID={handleAddGovID}
          // handleContactChange={handleContactChange}
          // handleAddressChange={handleAddressChange}
          // handleGovIDChange={handleGovIDChange}
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
              siblings: updatedSiblings, // Update the siblings array only
            }))
          }
          onAdd={() => handleAddFamilyMember("siblings", "Sibling")}
          onChange={(index, field, value) =>
            handleFamilyMemberChange("siblings", index, field, value)
          }
          onToggleEdit={(index) => toggleEditFamilyMember("siblings", index)}
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
              spouses: updatedSpouses, // Update the spouses array only
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
          enrolleeGender={personnelData.gender} // Pass the gender from Step 1
        />
      )}

      {step === 8 && (
        <Step8
          data={family.children}
          setData={(updatedChildren) =>
            setFamily((prevFamily) => ({
              ...prevFamily,
              children: updatedChildren, // Update the children array only
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
          <Button onClick={openFinishModal} colorScheme="teal">
            Finish
          </Button>
        )}
      </Box>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to finish? Any incomplete updates may not be
              saved.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleFinish}>
              Yes, Finish
            </Button>
            <Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Enrollment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Do you want to complete the enrollment now? A reference number will
            be generated.
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              Confirm
            </Button>
            <Button onClick={() => setIsModalOpen(false)} variant="ghost">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EnrollmentForm;
