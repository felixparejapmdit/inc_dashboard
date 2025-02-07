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
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4"; // Import Step4 component
import Step5 from "./Step5"; // Import Step5 component for siblings
import Step6 from "./Step6"; // Import Step6 component for spouse
import Step7 from "./Step7";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = `http://172.18.121.72:5000/api/districts`;
const LOCAL_CONGREGATION_API_URL = `http://172.18.121.72:5000/api/all-congregations`;
const EnrollmentForm = ({ referenceNumber }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); // Modal state
  const [isCongratulatoryModalOpen, setIsCongratulatoryModalOpen] =
    useState(false);
  const [searchParams] = useSearchParams();
  const personnelId = searchParams.get("personnel_id");
  const stepParam = searchParams.get("step");
  const typeParam = searchParams.get("type");
  const [progress, setProgress] = useState(0); // Update this based on API response

  const [id, setPersonnelId] = useState(null);

  const steps = [
    { label: "District Office", progressValue: 0 },
    { label: "Section Chief", progressValue: 0 },
    { label: "Enrollment", progressValue: 0 },
    { label: "Building Admin", progressValue: 1 },
    { label: "Security Section", progressValue: 2 },
    { label: "PMD-IT", progressValue: 3 },
    { label: "ATG Office", progressValue: [4, 5] }, // Combine 4 and 5 under "ATG Office"
    { label: "ATG Office Approval", progressValue: 6 },
    { label: "Personnel Office", progressValue: 7 },
  ];

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

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }, [step]); // Trigger on step change

  useEffect(() => {
    const fetchPersonnelDetails = async () => {
      if (!personnelId) return; // Prevent API call if personnelId is null or undefined

      try {
        const response = await axios.get(
          `${API_URL}/api/personnels/${personnelId}`
        );
        const personnel = response.data;

        //setSelectedUser(personnel); // Set the personnel data
        setProgress(personnel.personnel_progress || 0); // Set the progress
      } catch (error) {
        console.error("Error fetching personnel details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch personnel details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchPersonnelDetails();
  }, []);

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
    registered_district_id: "",
    registered_local_congregation: "",
    date_of_birth: "",
    age: "",
    place_of_birth: "",
    datejoined: "",
    language_id: [],
    bloodtype: "",
    work_email_address: "",
    citizenship: "",
    nationality: "",
    department_id: "",
    section_id: "",
    subsection_id: "",
    designation_id: "",
    district_id: "",
    local_congregation: "",
    personnel_type: "",
    district_assignment_id: "",
    local_congregation_assignment: "",
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

  const [localCongregations, setLocalCongregations] = useState([]);

  // ✅ Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(DISTRICT_API_URL);
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  // ✅ Fetch all local congregations (no filtering here)
  useEffect(() => {
    const fetchLocalCongregations = async () => {
      try {
        const response = await axios.get(LOCAL_CONGREGATION_API_URL);
        setLocalCongregations(response.data); // ✅ Store the full list of local congregations
      } catch (error) {
        console.error("Error fetching local congregations:", error);
      }
    };
    fetchLocalCongregations();
  }, []);

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
    "Volunteer/Kawani",
  ];

  const educationalLevelOptions = [
    "No Formal Education",
    "Primary Education",
    "Secondary Education",
    "Senior High School", // Idagdag ang Senior High School dito
    "Vocational Training",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate Degree",
    "Post-Doctorate",
    "Post-Graduate",
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
    fetchData("local-congregations", setLocalCongregations);
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
        startfrom: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professional_licensure_examination: "",
        certificate_files: [], // Ensure this is initialized as an array
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
      position: "bottom-left", // Position the toast on the bottom-left
    });

    // Redirect to the login page after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const openFinishModal = () => {
    setIsFinishModalOpen(true);
  };

  useEffect(() => {
    const updateLabelsAndPlaceholders = () => {
      if (
        personnelData.gender === "Female" &&
        personnelData.civil_status === "Married"
      ) {
        // Female and Married
        setPersonnelData((prevData) => ({
          ...prevData,
          surname_maiden_label: "Surname (Maiden)",
          surname_maiden_placeholder: "Surname (Maiden)",
          surname_husband_label: "Surname (Husband)",
          surname_husband_placeholder: "Surname (Husband)",
          surname_maiden_disabled: false,
        }));
      } else if (
        personnelData.gender === "Male" ||
        personnelData.civil_status === "Single"
      ) {
        // Male or Single
        setPersonnelData((prevData) => ({
          ...prevData,
          surname_maiden_label: "",
          surname_maiden_placeholder: "",
          surname_husband_label: "Surname",
          surname_husband_placeholder: "Surname",
          surname_maiden_disabled: true,
        }));
      } else {
        // Default fallback for other combinations
        setPersonnelData((prevData) => ({
          ...prevData,
          surname_maiden_label: "",
          surname_maiden_placeholder: "",
          surname_husband_label: "",
          surname_husband_placeholder: "",
          surname_maiden_disabled: true,
        }));
      }
    };

    updateLabelsAndPlaceholders();
  }, [personnelData.gender, personnelData.civil_status]); // React to changes in gender or civil_status

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPersonnelData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      // Handle multi-selection for languages
      if (name === "language_id") {
        updatedData[name] = Array.isArray(value) ? value : [];
      } else {
        updatedData[name] = value;
      }

      if (name === "citizenship") {
        updatedData.citizenship = Array.isArray(value) ? value : [];
      }

      // Reset dependent dropdowns based on the changed field
      if (name === "department_id") {
        // When department changes, reset section, subsection, and designation
        updatedData = {
          ...updatedData,
          section_id: "",
          subsection_id: "",
          designation_id: "",
        };
      } else if (name === "section_id") {
        // When section changes, reset subsection and designation
        updatedData = {
          ...updatedData,
          subsection_id: "",
          designation_id: "",
        };
      } else if (name === "subsection_id") {
        // When subsection changes, reset designation
        updatedData = {
          ...updatedData,
          designation_id: "",
        };
      }

      // Email validation while typing
      if (name === "email_address") {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Improved email regex pattern

        const invalidDomainPattern = /(\.\.)|(\.\d)|(\.$)/; // Checks for invalid multiple dots, trailing dots, or dots followed by numbers

        if (!value.trim()) {
          setEmailError("Email address cannot be empty!");
        } else if (!emailPattern.test(value)) {
          setEmailError("Please enter a valid email address!");
        } else if (invalidDomainPattern.test(value)) {
          setEmailError("Email address contains invalid domain formatting!");
        } else if (value.length > 254) {
          setEmailError("Email address is too long!");
        } else {
          setEmailError(""); // Clear the error if email is valid
        }
      }

      // Conditional logic for civil_status
      if (name === "civil_status") {
        updatedData.wedding_anniversary =
          value === "Married" ? prevData.wedding_anniversary : ""; // Reset wedding_anniversary if not married
      }

      // Update fields based on civil_status and gender
      if (name === "civil_status" || name === "gender") {
        if (
          updatedData.gender === "Female" &&
          updatedData.civil_status === "Married"
        ) {
          updatedData = {
            ...updatedData,
            surname_maiden_label: "Surname (Maiden)",
            surname_maiden_placeholder: "Surname (Maiden)",
            surname_husband_label: "Surname (Husband)",
            surname_husband_placeholder: "Surname (Husband)",
            surname_maiden_disabled: false,
          };
        } else if (updatedData.gender === "Male") {
          updatedData = {
            ...updatedData,
            surname_maiden_label: "",
            surname_maiden_placeholder: "",
            surname_husband_label: "Surname",
            surname_husband_placeholder: "Surname",
            surname_maiden_disabled: true,
          };
        } else if (
          updatedData.gender === "Female" &&
          updatedData.civil_status === "Single"
        ) {
          updatedData = {
            ...updatedData,
            surname_maiden_label: "",
            surname_maiden_placeholder: "",
            surname_husband_label: "Surname",
            surname_husband_placeholder: "Surname",
            surname_maiden_disabled: true,
          };
        }
      }

      return updatedData;
    });
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Email validation before proceeding
      if (!personnelData.email_address) {
        toast({
          title: "Validation Error",
          description: "Email Address is required.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        setIsLoading(false);
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(personnelData.email_address)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        setIsLoading(false);
        return;
      }

      // Ensure step is derived from URL for accurate calculations
      //const currentStep = parseInt(searchParams.get("step"), 10) || 1;

      // Ensure step is derived from URL
      const currentStep = parseInt(searchParams.get("step"), 10) || step;
      let nextStep = currentStep + 1;

      // Skip Step 6 if civil_status is Single
      if (personnelData.civil_status === "Single" && nextStep === 6) {
        nextStep = 7;
      }
      // Check if we are on the first step for new personnel
      //if (step === 1) {

      if (!personnelId) {
        const missingFields = [];
        if (!personnelData.givenname) missingFields.push("Given Name");
        if (!personnelData.date_of_birth) missingFields.push("Date of Birth");
        if (!personnelData.civil_status) missingFields.push("Civil Status");
        if (!personnelData.email_address) missingFields.push("Email Address");
        if (!personnelData.personnel_type) missingFields.push("Personnel Type");

        if (missingFields.length > 0) {
          toast({
            title: "Validation Error",
            description: `The following fields are required: ${missingFields.join(
              ", "
            )}.`,
            duration: 3000,
            isClosable: true,
            position: "bottom-left", // Position the toast on the bottom-left
            render: () => (
              <Box
                color="black"
                p={3}
                bg="yellow.300"
                borderRadius="md"
                boxShadow="lg"
              >
                <strong>Validation Error:</strong> <br />
                The following fields are required: {missingFields.join(", ")}.
              </Box>
            ),
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
            position: "bottom-left", // Position the toast on the bottom-left
          });
          setIsLoading(false);
          return;
        }

        await axios.put(`${API_URL}/api/personnels/${personnelId}`, {
          ...personnelData,
          enrollment_progress: currentStep.toString(), // Update enrollment_progress
        });

        toast({
          title: "Enrollment Updated",
          description: "Your enrollment data has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });
        // Calculate the next step
        //const nextStep = currentStep + 1;

        // If the next step is within the range, update the URL dynamically
        // Navigate to the next step

        if (nextStep <= totalSteps) {
          navigate(`/enroll?personnel_id=${personnelId}&step=${nextStep}`);
          setStep(nextStep);
        } else {
          toast({
            title: "Process Complete",
            description: "You have completed the enrollment process.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
      //}

      // Move to the next step
      //setStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error("Error handling next step:", error);
      toast({
        title: "Error",
        description: "Failed to save enrollment data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    let previousStep = step - 1;

    // Skip Step 6 if civil_status is Single and moving from Step 7
    if (personnelData.civil_status === "Single" && previousStep === 6) {
      previousStep = 5;
    }

    setStep(previousStep);
    navigate(`/enroll?personnel_id=${personnelId}&step=${previousStep}`);
  };

  // Confirm Early Completion and Save Step 1 Data
  const handleConfirm = async () => {
    try {
      setIsLoading(true); // Start loading indicator

      const searchParams = new URLSearchParams(window.location.search);
      const notEnrolledId = searchParams.get("not_enrolled");

      // Destructure all necessary fields from personnelData
      const {
        gender,
        civil_status,
        wedding_anniversary,
        givenname,
        middlename,
        surname_maiden,
        surname_husband,
        suffix,
        nickname,
        registered_local_congregation,
        date_of_birth,
        place_of_birth,
        datejoined,
        language_id,
        bloodtype,
        email_address,
        citizenship,
        nationality,
        department_id,
        section_id,
        subsection_id,
        designation_id,
        district_id,
        local_congregation,
        personnel_type,
        district_assignment_id,
        local_congregation_assignment,
        assigned_number,
        m_status,
        panunumpa_date,
        ordination_date,
      } = personnelData;

      // Check for existing givenname and surname_husband combination
      const existingCheckResponse = await axios.get(
        `${API_URL}/api/personnels_check`, // Adjust the API endpoint if needed
        {
          params: {
            givenname,
            surname_husband,
          },
        }
      );

      if (existingCheckResponse.data.exists) {
        // Show error toast if the combination already exists
        toast({
          title: "Duplicate Entry",
          description:
            "A personnel record with the same given name and surname already exists.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });

        setIsLoading(false); // Stop loading indicator
        return; // Exit the function early
      }

      // Prepare the API payload dynamically
      const response = await axios.post(`${API_URL}/api/personnels`, {
        reference_number: null, // Can be generated later
        enrollment_progress: "1", // Required value
        personnel_progress: "0", // Required value
        gender: gender || null,
        civil_status: civil_status || null,
        wedding_anniversary: wedding_anniversary || null,
        givenname: givenname || null,
        middlename: middlename || null,
        surname_maiden: surname_maiden || null,
        surname_husband: surname_husband || null,
        suffix: suffix || null,
        nickname: nickname || null,
        registered_local_congregation: registered_local_congregation || null,
        date_of_birth: date_of_birth || null,
        place_of_birth: place_of_birth || null,
        datejoined: datejoined || null,
        language_id: language_id || null,
        bloodtype: bloodtype || null,
        email_address: email_address || null,
        citizenship: citizenship || null,
        nationality: nationality || null,
        department_id: department_id || null,
        section_id: section_id || null,
        subsection_id: subsection_id || null,
        designation_id: designation_id || null,
        district_id: district_id || null,
        local_congregation: local_congregation || null,
        personnel_type: personnel_type || null,
        district_assignment_id: district_assignment_id || null,
        local_congregation_assignment: local_congregation_assignment || null,
        assigned_number: assigned_number || null,
        m_status: m_status || null,
        panunumpa_date: panunumpa_date || null,
        ordination_date: ordination_date || null,
      });

      // Extract the personnel_id from the response
      const { personnel } = response.data;
      const { personnel_id, reference_number } = personnel;

      // Create a downloadable file
      const fileContent = `Reference Number: ${reference_number}\nDate: ${new Date().toLocaleString()}`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Reference_Number_${reference_number}.txt`;
      link.click();

      // Display a success message with the reference number
      toast({
        title: "Enrollment Saved",
        description: `Your reference number is ${reference_number}. Please keep this number for your records.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
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
        position: "bottom-left", // Position the toast on the bottom-left
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
            position: "bottom-left", // Position the toast on the bottom-left
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
          position: "bottom-left", // Position the toast on the bottom-left
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
          {Array.from({ length: totalSteps }, (_, index) => {
            const isDisabled =
              personnelData.civil_status === "Single" && index + 1 === 6;

            return (
              <Box
                key={index}
                as="button"
                onClick={() => {
                  if (isDisabled) {
                    toast({
                      title: "Step Disabled",
                      description:
                        "This step is not applicable for single civil status.",
                      status: "info",
                      duration: 3000,
                      isClosable: true,
                      position: "bottom-right",
                    });
                    return;
                  }
                  const selectedStep = index + 1;

                  if (selectedStep > 1 && !personnelId) {
                    alert(
                      "Please complete the primary information before proceeding to the next step."
                    );
                    return;
                  }

                  // Construct the new URL based on typeParam
                  const newUrl = `/enroll?personnel_id=${personnelId}&step=${selectedStep}${
                    typeParam === "evaluation" ? "&type=evaluation" : ""
                  }`;

                  // Navigate to the updated URL
                  navigate(newUrl);

                  // Set the step state to match the selected progress indicator
                  setStep(selectedStep);
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
                bg={
                  isDisabled
                    ? "gray.400"
                    : step > index
                    ? "green.400"
                    : "gray.200"
                }
                border={step === index + 1 ? "2px solid #2D3748" : "none"}
                transition="background 0.3s, border 0.3s"
                cursor={isDisabled ? "not-allowed" : "pointer"}
                opacity={isDisabled ? 0.5 : 1} // Visual indicator for disabled steps
              >
                {step > index ? <CheckIcon /> : index + 1}
              </Box>
            );
          })}
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
          localCongregations={localCongregations} // Add Local Congregations here
          suffixOptions={suffixOptions}
          civilStatusOptions={civilStatusOptions}
          bloodtypes={bloodtypes}
        />
      )}

      {step === 2 && (
        <Step2
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

      {step === 3 && (
        <Step3
          education={education}
          workExperience={workExperience}
          handleAddEducation={handleAddEducation}
          handleAddWorkExperience={handleAddWorkExperience}
          setEducation={setEducation}
          setWorkExperience={setWorkExperience}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
        />
      )}

      {step === 4 && (
        <Step4
          data={
            family.parents.length > 0
              ? family.parents
              : [
                  { relationship_type: "Father", givenname: "", lastname: "" },
                  { relationship_type: "Mother", givenname: "", lastname: "" },
                ]
          }
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
          localCongregations={localCongregations} // Add Local Congregations here
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
        />
      )}
      {step === 5 && (
        <Step5
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
          localCongregations={localCongregations} // Add Local Congregations here
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
        />
      )}
      {step === 6 && (
        <Step6
          data={
            family.spouses?.length > 0
              ? family.spouses
              : [
                  {
                    relationship_type: "Spouse",
                    givenname: "",
                    lastname: "",
                  },
                ]
          }
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
          localCongregations={localCongregations} // Add Local Congregations here
          civilStatusOptions={civilStatusOptions}
          employmentTypeOptions={employmentTypeOptions}
          educationalLevelOptions={educationalLevelOptions}
          bloodtypes={bloodtypes}
          enrolleeGender={personnelData.gender} // Pass the gender from Step 1
        />
      )}

      {step === 7 && (
        <Step7
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
          localCongregations={localCongregations} // Add Local Congregations here
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
        {step < 7 ? (
          <Button
            colorScheme="teal"
            onClick={handleNext}
            isLoading={isLoading}
            disabled={!!emailError || !personnelData.email_address} // Disable if invalid
          >
            Next
          </Button>
        ) : (
          <Button onClick={openFinishModal} colorScheme="teal">
            Finish
          </Button>
        )}
      </Box>

      {/* Finish Confirmation Modal */}
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
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                setIsFinishModalOpen(false);
                setIsCongratulatoryModalOpen(true); // Open the congratulatory modal
              }}
            >
              Yes, Finish
            </Button>
            <Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Congratulatory Modal */}
      <Modal
        isOpen={isCongratulatoryModalOpen}
        onClose={() => setIsCongratulatoryModalOpen(false)}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent maxWidth="900px">
          <ModalHeader bg="yellow.400" color="black" textAlign="center">
            🎉 Congratulations! You are now enrolled! 🎉
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text textAlign="center" fontSize="lg" fontWeight="semibold" mb={4}>
              Please download and keep your reference number from the folder for
              future tracking of your application.
            </Text>
            <Box
              bg="yellow.100"
              borderRadius="lg"
              p={5}
              boxShadow="lg"
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold" mb={4}>
                Progress Guide:
              </Text>
              {/* Progress Bar */}
              <Flex justifyContent="space-between" alignItems="center" mt={6}>
                {steps.map((step, index) => {
                  const isCompleted = Array.isArray(step.progressValue)
                    ? step.progressValue.includes(progress)
                    : progress >= step.progressValue;

                  return (
                    <Flex
                      key={index}
                      direction="column"
                      alignItems="center"
                      flex="1"
                      position="relative"
                    >
                      {index !== steps.length - 1 && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          width="100%"
                          height="4px"
                          bg={isCompleted ? "blue.500" : "gray.300"}
                          zIndex={0}
                          transform="translateX(-50%)"
                        />
                      )}
                      <Box
                        bg={isCompleted ? "blue.500" : "gray.300"}
                        borderRadius="full"
                        w="40px"
                        h="40px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mb={2}
                        zIndex={1}
                      >
                        <Text color="white" fontSize="xl" fontWeight="bold">
                          {isCompleted ? "✔" : ""}
                        </Text>
                      </Box>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        textAlign="center"
                        maxWidth="80px"
                        color={isCompleted ? "black" : "gray.500"}
                      >
                        {step.label}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              width="full"
              onClick={() => {
                // Success toast message
                toast({
                  title: "Enrollment Process Completed",
                  description:
                    "Redirecting you to the login page. Make sure to keep your reference number safe.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                  position: "bottom-left",
                });

                // Determine the correct progress update
                const personnelProgress =
                  typeParam === "evaluation" ? "verified" : "0";

                axios.put(
                  `${API_URL}/api/users/update-progress`,
                  {
                    personnel_id: personnelId,
                    personnel_progress: personnelProgress,
                  },
                  {
                    headers: { "Content-Type": "application/json" },
                  }
                );

                // Redirect to login
                setTimeout(() => {
                  navigate("/login");
                }, 1000);
              }}
            >
              Okay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Finish Confirmation Modal */}
      {/* <Modal
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
      </Modal> */}

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
