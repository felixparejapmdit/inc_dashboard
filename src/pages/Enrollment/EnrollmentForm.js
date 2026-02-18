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
  IconButton,
  Center,
  HStack,
  Badge,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import StepProgressTracker from "../../components/StepProgressTracker"; // ✅ Import StepProgressTracker
import Step4 from "./Step4"; // Import Step4 component
import Step5 from "./Step5"; // Import Step5 component for siblings
import Step6 from "./Step6"; // Import Step6 component for spouse
import Step7 from "./Step7";
import { AiFillHome } from "react-icons/ai"; // Add this at the top of your component
import { FiArrowLeft } from "react-icons/fi"; // Add this

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;
const EnrollmentForm = ({ referenceNumber }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); // Modal state
  const [isCongratulatoryModalOpen, setIsCongratulatoryModalOpen] =
    useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchParams] = useSearchParams();
  const personnelId = searchParams.get("personnel_id");
  const stepParam = searchParams.get("step");
  const typeParam = searchParams.get("type");
  const [progress, setProgress] = useState(0); // Update this based on API response
  const personnelProgress = Number(searchParams.get("personnel_progress"));
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const toast = useToast();

  const [id, setPersonnelId] = useState(null);

  const getLabelById = (list, id, labelKey = "name") => {
    if (!id) return "N/A";
    const item = list.find((item) => String(item.id) === String(id));
    return item ? item[labelKey] : "N/A";
  };

  const getLabelsByIds = (list, ids, labelKey = "name") => {
    if (!Array.isArray(ids) || ids.length === 0) return "N/A";
    return list
      .filter((item) => ids.includes(item.id))
      .map((item) => item[labelKey])
      .join(", ");
  };

  const SummaryItem = ({ label, value }) => (
    <Flex direction="column" p={3} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="teal.400">
      <Text fontSize="2xs" fontWeight="bold" color="teal.600" textTransform="uppercase" letterSpacing="wider" mb={1}>
        {label}
      </Text>
      <Text fontSize="sm" color="gray.800" fontWeight="bold" noOfLines={2}>
        {value || "N/A"}
      </Text>
    </Flex>
  );

  //const [searchParams] = useSearchParams();
  //const personnelId = searchParams.get("personnel_id");
  const [isEditing, setIsEditing] = useState(!personnelId); // Enabled if personnel_id exists
  const [dutiesToDelete, setDutiesToDelete] = useState([]);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const steps = [
    { label: "District Office", progressValue: 0 },
    { label: "Section Chief", progressValue: 0 },
    { label: "Enrollment", progressValue: 0 },
    { label: "Building Admin", progressValue: 1 },
    { label: "Security Section", progressValue: 2 },
    { label: "PMD-IT", progressValue: 3 },
    { label: "ATG Office 1", progressValue: 4 }, // ✅ This is correct
    { label: "ATG Office 2", progressValue: 5 }, // ✅ This is correct
    { label: "ATG Office Approval", progressValue: 6 },
    { label: "Personnel Office", progressValue: 7 },
  ];

  useEffect(() => {
    // Get step and personnel_id from URL parameters
    const stepFromUrl = searchParams.get("step");
    const personnelIdFromUrl = searchParams.get("personnel_id");

    // Set the step from the URL if available
    if (!isNaN(stepFromUrl) && stepFromUrl) {
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
      if (!personnelId) return;

      fetchData(
        "personnels", // endpoint
        (data) => {
          // If your API returns { success: true, data: { personnel_progress: ... } }
          setProgress(Number(data.personnel_progress) || 0);
        },
        (errorMsg) => {
          toast({
            title: "Error",
            description: errorMsg || "Failed to fetch personnel details.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
        "Failed to fetch personnel details",
        personnelId // params
      );
    };

    fetchPersonnelDetails();
  }, []);

  // Put fetchChurchDuties outside useEffect so you can call it manually
  const fetchChurchDuties = () => {
    if (!personnelId) return;

    fetchData(
      "church-duties", // API endpoint
      (data) => {
        setPersonnelData((prevState) => ({
          ...prevState,
          church_duties: data || [],
        }));
      },
      (errorMsg) =>
        toast({
          title: "Error",
          description: errorMsg || "Failed to fetch church duties.",
          status: "error",
          duration: 3000,
          isClosable: true,
        }),
      "Failed to fetch church duties",
      personnelId // passed as param to format endpoint like /api/church-duties/:id
    );
  };

  // useEffect will still use it once at mount
  useEffect(() => {
    fetchChurchDuties();
  }, [personnelId]);

  useEffect(() => {
    // Get personnel_progress from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const personnelProgressParam = urlParams.get("personnel_progress");

    // Check if personnel_progress is present in the URL before showing the modal
    if (personnelProgressParam !== null) {
      setIsCongratulatoryModalOpen(true);
    }
  }, []);

  // Hide the Congratulatory Modal if type=evaluation
  useEffect(() => {
    if (typeParam === "evaluation") {
      setIsCongratulatoryModalOpen(false);
    }
  }, [typeParam]);

  const handleEdit = () => {
    setIsCongratulatoryModalOpen(false); // Close modal

    // Ensure we get personnel_progress from the URL
    const personnelProgress =
      searchParams.get("personnel_progress") || stepParam;

    // navigate(
    //   `/enroll?personnel_id=${personnelId}&step=${stepParam}&personnel_progress=${personnelProgress}`
    // ); // Navigate back to form

    navigate(
      `/enroll?personnel_id=${personnelId}&step=${stepParam}&personnel_progress=${personnelProgress}${typeParam === "evaluation"
        ? "&type=evaluation"
        : typeParam === "editprofile"
          ? "&type=editprofile"
          : typeParam === "editpersonnel"
            ? "&type=editpersonnel"
            : typeParam === "track"
              ? "&type=track"
              : typeParam === "new"
                ? "&type=new"
                : ""
      }`
    ); // Navigate back to form
  };

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
    is_offered: "",
    minister_officiated: "",
    date_baptized: "",
    place_of_baptism: "",
    local_first_registered: "",
    date_first_registered: "",
    personnel_type: "",
    district_assignment_id: "",
    local_congregation_assignment: "",
    assigned_number: "",
    m_status: "",
    m_type: "",
    panunumpa_date: "",
    ordination_date: "",
    church_duties: [], // <<-- ADD THIS
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

  const fetchDistricts = async () => {
    try {
      await fetchData(
        "districts",
        setDistricts, // ✅ Direct setter
        (errorMsg) => {
          console.error("Error fetching districts:", errorMsg);
          toast({
            title: "Error",
            description: errorMsg || "Failed to fetch districts.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
        "Failed to fetch districts",
        null, // No params
        null, // No finally callback
        DISTRICT_API_URL // ✅ Custom base URL
      );
    } catch (err) {
      console.error("❌ fetchDistricts error:", err);
    }
  };

  const fetchLocalCongregations = async () => {
    try {
      await fetchData(
        "all-congregations",
        setLocalCongregations, // ✅ Direct setter
        (errorMsg) => {
          console.error("Error fetching local congregations:", errorMsg);
          toast({
            title: "Error",
            description: errorMsg || "Failed to fetch local congregations.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
        "Failed to fetch local congregations",
        null, // No params
        null, // No finally callback
        LOCAL_CONGREGATION_API_URL // ✅ Custom base URL
      );
    } catch (err) {
      console.error("❌ fetchLocalCongregations error:", err);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    const getBaseUrl = (endpoint) => {
      if (endpoint === "districts") {
        return DISTRICT_API_URL;
      } else if (endpoint === "all-congregations") {
        return LOCAL_CONGREGATION_API_URL;
      } else {
        return API_URL;
      }
    };

    const fetchAll = (endpoint, setter, label) => {
      fetchData(
        endpoint,
        setter,
        (errorMsg) =>
          toast({
            title: `Error loading ${label || endpoint}`,
            description: errorMsg || `Failed to load ${label || endpoint}.`,
            status: "error",
            duration: 3000,
            isClosable: true,
          }),
        `Failed to load ${label || endpoint}`,
        null,
        null,
        getBaseUrl(endpoint)
      );
    };

    // 🔁 Call for each endpoint
    fetchAll("languages", setLanguages, "Languages");
    fetchAll("citizenships", setCitizenships, "Citizenships");
    fetchAll("nationalities", setNationalities, "Nationalities");
    fetchAll("departments", setDepartments, "Departments");
    fetchAll("sections", setSections, "Sections");
    fetchAll("subsections", setSubsections, "Subsections");
    fetchAll("designations", setDesignations, "Designations");
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
        position: "bottom-left", // Position the toast on the bottom-left
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
      position: "bottom-left", // Position the toast on the bottom-left
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
  // const handleFamilyMemberChange = (type, index, field, value) => {
  //   console.log("Type:", type);
  //   console.log("Index:", index);
  //   console.log("Field:", field);
  //   console.log("Value:", value);

  //   setFamily((prevFamily) => ({
  //     ...prevFamily,
  //     [type]: prevFamily[type].map((member, i) =>
  //       i === index ? { ...member, [field]: value } : member
  //     ),
  //   }));
  // };

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

  const navigate = useNavigate();

  const handleBackHome = () => {
    console.log("🏠 handleBackHome called, typeParam:", typeParam);
    if (typeParam === "track" || typeParam === "new") {
      const confirmExit = window.confirm(
        "Are you sure you want to exit? Please make sure all necessary data is saved."
      );
      if (!confirmExit) return;
      navigate("/login");
    } else if (typeParam === "editpersonnel") {
      navigate("/profile");
    } else if (typeParam === "editprogress") {
      navigate("/progresstracking");
    } else if (typeParam === "edituser") {
      navigate("/user");
    } else if (typeParam === "evaluation") {
      navigate("/progress/step1");
    } else {
      navigate("/dashboard"); // fallback
    }
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
      } else if (name === "registered_district_id") {
        // When current district changes, reset current local
        updatedData = {
          ...updatedData,
          registered_local_congregation: "",
        };
      } else if (name === "district_id") {
        // When district origin changes, reset local origin
        updatedData = {
          ...updatedData,
          local_congregation: "",
        };
      } else if (name === "district_assignment_id") {
        // When district assignment changes, reset local assignment
        updatedData = {
          ...updatedData,
          local_congregation_assignment: "",
        };
      } else if (name === "district_first_registered") {
        // When district first registered changes, reset local first registered
        updatedData = {
          ...updatedData,
          local_first_registered: "",
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

  const handleSave = async () => {
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

        try {
          await putData("personnels", personnelId, {
            ...personnelData,
            enrollment_progress: currentStep.toString(),
          });

          toast({
            title: "Enrollment Updated",
            description: "Your enrollment data has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
        } catch (error) {
          toast({
            title: "Update Failed",
            description:
              error.message ||
              "Something went wrong while updating enrollment.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
        }

        //updating personnel church duties

        // Delete the duties first
        if (dutiesToDelete.length > 0) {
          for (const dutyId of dutiesToDelete) {
            // await axios.delete(
            //   `${API_URL}/api/personnel_church_duties/${dutyId}`
            // );
            await deleteData("personnel_church_duties", dutyId);
          }
          setDutiesToDelete([]); // Clear after deletion
        }

        // Assuming you can send updated duties via PUT or PATCH request
        if (
          personnelData.church_duties &&
          personnelData.church_duties.length > 0
        ) {
          for (const duty of personnelData.church_duties) {
            const payload = {
              duty: duty.duty || null,
              start_year: duty.start_year || null,
              end_year: duty.end_year || null,
            };

            try {
              if (duty.id) {
                await putData("personnel_church_duties", duty.id, payload);
              } else {
                await postData("personnel_church_duties", {
                  ...payload,
                  personnel_id: personnelId,
                });
              }
            } catch (error) {
              console.error("Error saving duty:", error);
              toast({
                title: "Error",
                description: error.message || "Failed to save the duty.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          }
        }

        // 🔥 After saving duties, refresh the duties list
        await fetchChurchDuties(); // <-- ADD THIS
        // ✅ After saving, switch icon to `EditIcon`
        setIsEditing(false);
      }
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

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // ✅ Prevent proceeding if editing is enabled
      if (isEditing) {
        toast({
          title: "Save Required",
          description:
            "Please save your changes before proceeding to the next step.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        setIsLoading(false);
        return;
      }

      const currentStep = parseInt(searchParams.get("step"), 10) || step;
      let nextStep = currentStep + 1;

      // Skip Step 6 if civil_status is Single
      if (personnelData.civil_status === "Single" && nextStep === 6) {
        nextStep = 7;
      }

      if (nextStep <= totalSteps) {
        //navigate(`/enroll?personnel_id=${personnelId}&step=${nextStep}`);

        navigate(
          `/enroll?personnel_id=${personnelId}&step=${nextStep}${typeParam === "evaluation"
            ? "&type=evaluation"
            : typeParam === "editprofile"
              ? "&type=editprofile"
              : typeParam === "track"
                ? "&type=track"
                : typeParam === "new"
                  ? "&type=new"
                  : "&type=editpersonnel"
          }`
        );

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

      await putData("personnels", personnelId, {
        ...personnelData,
        enrollment_progress: currentStep.toString(), // Update enrollment_progress
      });
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
    //navigate(`/enroll?personnel_id=${personnelId}&step=${previousStep}`);

    // Include type=evaluation in the URL if typeParam is "evaluation"
    navigate(
      `/enroll?personnel_id=${personnelId}&step=${previousStep}${typeParam === "evaluation"
        ? "&type=evaluation"
        : typeParam === "editprofile"
          ? "&type=editprofile"
          : typeParam === "track"
            ? "&type=track"
            : typeParam === "new"
              ? "&type=new"
              : "&type=editpersonnel"
      }`
    );
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
      const existingCheckResponse = await fetchData(
        "personnels_check", // endpoint
        null, // no state setter
        null, // no custom error handler
        null, // no custom error message
        {
          givenname,
          surname_husband,
        } // passed as params object
      );

      if (existingCheckResponse && existingCheckResponse.exists) {
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
      const response = await postData("personnels", {
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
      // Note: fetchData/postData already returns the unwrapped data (data.success ? data.data : data)
      const personnel = response.personnel || response;
      const { personnel_id, reference_number } = personnel;

      // After saving personnel and getting personnel_id
      if (
        personnelData.church_duties &&
        personnelData.church_duties.length > 0
      ) {
        for (const duty of personnelData.church_duties) {
          const payload = {
            personnel_id: personnel_id,
            duty: duty.duty || null,
            start_year: duty.start_year || null,
            end_year: duty.end_year || null,
          };

          await postData("personnel_church_duties", payload);
        }
      }

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
        const userResponse = await fetchData(
          `users_access`,
          null,
          null,
          null,
          notEnrolledId
        );

        if (!userResponse) {
          throw new Error("User not found in the database.");
        }

        await putData("users/update", {
          username: notEnrolledId,
          personnel_id: personnel_id,
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

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      if (!personnelId) return;

      // ✅ 1. Fetch personnel
      await fetchData(
        "personnels",
        (personnel) => {
          if (!personnel) {
            toast({
              title: "Not Found",
              description: "Personnel data not found.",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "bottom-left",
            });
            navigate("/");
            return;
          }

          // Adjust date formats
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
            const progress = parseInt(personnel.enrollment_progress, 10);
            setStep(progress || 1);
          }
        },
        (errorMsg) => {
          toast({
            title: "Error",
            description: errorMsg || "Failed to retrieve personnel data.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
          navigate("/");
        },
        "Failed to fetch personnel data",
        personnelId
      );

      // ✅ 2. Fetch family members
      await fetchData(
        "get-family-members",
        (members) => {
          const organizedFamily = {
            parents: members.filter(
              (m) =>
                m.relationship_type === "Father" ||
                m.relationship_type === "Mother"
            ),
            siblings: members.filter((m) => m.relationship_type === "Sibling"),
            spouses: members.filter((m) => m.relationship_type === "Spouse"),
            children: members.filter((m) => m.relationship_type === "Child"),
          };
          setFamily(organizedFamily);
        },
        (errorMsg) => {
          toast({
            title: "Error",
            description: errorMsg || "Failed to retrieve family members.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
          navigate("/");
        },
        "Failed to fetch family members",
        { personnel_id: personnelId }
      );
    };

    fetchEnrollmentData();
  }, [personnelId, navigate, toast, stepParam]);

  return (
    <VStack
      spacing={4}
      w={{ base: "100%", lg: "80%" }}
      mx="auto"
      mt={{ base: "120px", md: "130px" }}
      mb="50px"
      p={{ base: 2, md: 4, lg: 6 }}
      boxShadow="lg"
      rounded="md"
      bg="white"
    >
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        width="100%"
        zIndex="1000"
        bg="white"
        boxShadow="md"
        pb={{ base: 2, md: 3 }}
      >
        {/* Unified Header + Progress Indicator Container */}
        <Box
          bgGradient="linear(to-r, yellow.50, orange.50)"
          pt={{ base: 4, md: 5 }}
          pb={{ base: 2, md: 3 }}
          px={{ base: 2, md: 4 }}
          boxShadow="0 1px 6px rgba(0,0,0,0.05)"
          borderBottom="2px solid"
          borderColor="orange.200"
        >
          {/* Progress Indicator with Back Button */}
          <Flex
            align="center"
            justify="space-between"
            w="100%"
            px={{ base: 2, md: 4 }}
          >
            {/* Back Button - Left Side */}
            <Box flexShrink={0}>
              <Button
                leftIcon={typeParam === "track" || typeParam === "new" ? <FiArrowLeft size={20} /> : <AiFillHome size={20} />}
                colorScheme="orange"
                variant="solid"
                onClick={() => {
                  console.log("🔘 Button clicked!");
                  console.log("📍 typeParam:", typeParam);
                  console.log("📍 navigate function:", navigate);
                  handleBackHome();
                }}
                size="md"
                px={{ base: 3, md: 4 }}
                borderRadius="full"
                boxShadow="md"
                fontWeight="semibold"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "lg",
                  bg: "orange.600",
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md",
                }}
                transition="all 0.2s ease-out"
              >
                {typeParam === "track" || typeParam === "new" ? "Back" : "Home"}
              </Button>
            </Box>

            {/* Stepper - Center */}
            <Box
              flex="1"
              overflowX="auto"
              overflowY="visible"
              mx={{ base: 2, md: 4 }}
              css={{
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              <Flex
                justify="center"
                align="center"
                position="relative"
                minW={{ base: "700px", md: "auto" }}
                maxW="1200px"
                mx="auto"
              >
                {/* Step labels array */}
                {(() => {
                  const stepLabels = [
                    "Personal Info",
                    "Contact & Address",
                    "Education & Work",
                    "Parents",
                    "Siblings",
                    "Spouse",
                    "Children",
                  ];

                  return Array.from({ length: totalSteps }, (_, index) => {
                    const isDisabled =
                      personnelData.civil_status === "Single" && index + 1 === 6;
                    const isCompleted = step > index;
                    const isActive = step === index + 1;
                    const isUpcoming = step < index + 1;

                    return (
                      <Box
                        key={index}
                        position="relative"
                        flex="1"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        zIndex="10"
                      >
                        {/* Connecting Line */}
                        {index < totalSteps - 1 && (
                          <Box
                            position="absolute"
                            top={{ base: "17px", md: "22px" }}
                            left="50%"
                            width="100%"
                            height={{ base: "3px", md: "4px" }}
                            zIndex="0"
                            overflow="hidden"
                            borderRadius="full"
                          >
                            {/* Background line */}
                            <Box
                              position="absolute"
                              width="100%"
                              height="100%"
                              bg="gray.200"
                            />
                            {/* Progress line with animation and glow */}
                            <Box
                              position="absolute"
                              width={isCompleted ? "100%" : "0%"}
                              height="100%"
                              bgGradient="linear(to-r, green.400, teal.400, cyan.400)"
                              transition="width 0.5s ease-out"
                              boxShadow={isCompleted ? "0 0 10px rgba(72, 187, 120, 0.5)" : "none"}
                              animation={isCompleted ? "shimmer 1.5s ease-in-out infinite" : "none"}
                              sx={{
                                "@keyframes shimmer": {
                                  "0%": {
                                    backgroundPosition: "-200% center",
                                  },
                                  "100%": {
                                    backgroundPosition: "200% center",
                                  },
                                },
                                backgroundSize: "200% 100%",
                              }}
                            />
                          </Box>
                        )}

                        {/* Step Circle Button */}
                        <Box
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

                            const newUrl = `/enroll?personnel_id=${personnelId}&step=${selectedStep}${typeParam === "evaluation"
                              ? "&type=evaluation"
                              : typeParam === "editpersonnel"
                                ? "&type=editpersonnel"
                                : typeParam === "editprofile"
                                  ? "&type=editprofile"
                                  : typeParam === "track"
                                    ? "&type=track"
                                    : typeParam === "new"
                                      ? "&type=new"
                                      : ""
                              }`;

                            navigate(newUrl);
                            setStep(selectedStep);
                          }}
                          position="relative"
                          zIndex="100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="full"
                          width={{ base: "36px", md: "46px" }}
                          height={{ base: "36px", md: "46px" }}
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color="white"
                          bg={
                            isDisabled
                              ? "gray.400"
                              : isCompleted
                                ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                                : isActive
                                  ? "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)"
                                  : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)"
                          }
                          border={isActive ? "4px solid" : isCompleted ? "3px solid" : "2px solid"}
                          borderColor={
                            isActive
                              ? "blue.300"
                              : isCompleted
                                ? "green.300"
                                : "gray.300"
                          }
                          boxShadow={
                            isActive
                              ? "0 0 0 3px rgba(66, 153, 225, 0.2), 0 6px 15px rgba(66, 153, 225, 0.3)"
                              : isCompleted
                                ? "0 3px 12px rgba(72, 187, 120, 0.4)"
                                : "0 2px 6px rgba(0,0,0,0.1)"
                          }
                          cursor={isDisabled ? "not-allowed" : "pointer"}
                          opacity={isDisabled ? 0.5 : 1}
                          transform={isActive ? "scale(1.15)" : "scale(1)"}
                          transition="all 0.3s ease-out"
                          animation={
                            isActive
                              ? "pulse 1.5s ease-in-out infinite"
                              : isCompleted
                                ? "bounce 0.6s ease-in-out"
                                : "none"
                          }
                          _hover={{
                            transform: isDisabled ? "scale(1)" : isActive ? "scale(1.25)" : "scale(1.15)",
                            boxShadow: isDisabled
                              ? "none"
                              : isActive
                                ? "0 0 0 4px rgba(66, 153, 225, 0.25), 0 8px 20px rgba(66, 153, 225, 0.4)"
                                : isCompleted
                                  ? "0 4px 18px rgba(72, 187, 120, 0.5)"
                                  : "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                          _active={{
                            transform: isDisabled ? "scale(1)" : "scale(0.95)",
                          }}
                          sx={{
                            "@keyframes pulse": {
                              "0%, 100%": {
                                boxShadow:
                                  "0 0 0 3px rgba(66, 153, 225, 0.2), 0 6px 15px rgba(66, 153, 225, 0.3)",
                              },
                              "50%": {
                                boxShadow:
                                  "0 0 0 6px rgba(66, 153, 225, 0.3), 0 8px 20px rgba(66, 153, 225, 0.5)",
                              },
                            },
                            "@keyframes bounce": {
                              "0%, 100%": {
                                transform: "scale(1)",
                              },
                              "50%": {
                                transform: "scale(1.2)",
                              },
                            },
                          }}
                        >
                          {isCompleted ? (
                            <CheckIcon boxSize={{ base: 3, md: 4 }} />
                          ) : (
                            <Text
                              fontSize={{ base: "sm", md: "md" }}
                              fontWeight="extrabold"
                              color={isActive || isCompleted ? "white" : "gray.500"}
                            >
                              {index + 1}
                            </Text>
                          )}
                        </Box>

                        {/* Step Label */}
                        <Text
                          mt={2}
                          fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                          fontWeight={isActive ? "bold" : isCompleted ? "semibold" : "medium"}
                          textAlign="center"
                          maxWidth={{ base: "70px", md: "100px" }}
                          color={
                            isDisabled
                              ? "gray.400"
                              : isActive
                                ? "blue.700"
                                : isCompleted
                                  ? "green.700"
                                  : "gray.600"
                          }
                          textShadow={
                            isActive
                              ? "0 1px 3px rgba(66, 153, 225, 0.3)"
                              : isCompleted
                                ? "0 1px 2px rgba(72, 187, 120, 0.2)"
                                : "none"
                          }
                          transition="all 0.3s ease-out"
                          lineHeight="1.2"
                          noOfLines={2}
                          opacity={isDisabled ? 0.6 : 1}
                          animation={isActive ? "fadeIn 0.3s ease-in" : "none"}
                          sx={{
                            "@keyframes fadeIn": {
                              "0%": {
                                opacity: 0,
                                transform: "translateY(5px)",
                              },
                              "100%": {
                                opacity: 1,
                                transform: "translateY(0)",
                              },
                            },
                          }}
                        >
                          {stepLabels[index]}
                        </Text>
                      </Box>
                    );
                  });
                })()}
              </Flex>
            </Box>

            {/* Spacer - Right Side (for balance) */}
            <Box flexShrink={0} width={{ base: "36px", md: "40px" }} />
          </Flex>

          {/* Add StepProgressTracker here for sticky slim progress bar */}
          <Box mt={2}>
            {step === 1 && <StepProgressTracker
              data={personnelData}
              totalFields={[
                "gender", "civil_status", "givenname", "middlename", "surname_maiden",
                "surname_husband", "suffix", "nickname", "date_of_birth", "place_of_birth",
                "datejoined", "language_id", "bloodtype", "email_address",
                "citizenship", "nationality", "department_id", "section_id", "subsection_id",
                "designation_id", "personnel_type", "is_offered", "minister_officiated",
                "date_baptized", "place_of_baptism", "registered_district_id",
                "registered_local_congregation", "district_first_registered",
                "local_first_registered", "date_first_registered", "church_duties",
                "wedding_anniversary", "m_status", "m_type", "panunumpa_date", "ordination_date"
              ]}
            />}

            {step === 4 && <StepProgressTracker
              data={(Array.isArray(family?.parents) ? family.parents : []).reduce((acc, parent, index) => {
                Object.keys(parent || {}).forEach(key => {
                  acc[`${key}_${index}`] = parent[key];
                });
                return acc;
              }, {})}
              totalFields={
                (Array.isArray(family?.parents) && family.parents.length > 0) ? family.parents.flatMap((_, index) => [
                  `gender_${index}`, `givenname_${index}`, `middlename_${index}`, `lastname_${index}`, `suffix_${index}`,
                  `date_of_birth_${index}`, `contact_number_${index}`, `bloodtype_${index}`,
                  `civil_status_${index}`, `date_of_marriage_${index}`, `place_of_marriage_${index}`,
                  `citizenship_${index}`, `nationality_${index}`, `livelihood_${index}`,
                  `district_id_${index}`, `local_congregation_${index}`, `church_duties_${index}`,
                  `employment_type_${index}`, `company_${index}`, `address_${index}`, `position_${index}`,
                  `start_date_${index}`, `end_date_${index}`, `reason_for_leaving_${index}`,
                  `education_level_${index}`, `start_year_${index}`, `completion_year_${index}`,
                  `school_${index}`, `field_of_study_${index}`, `degree_${index}`, `professional_licensure_examination_${index}`
                ]) : []
              }
            />}

            {step === 5 && <StepProgressTracker
              data={(Array.isArray(family?.siblings) ? family.siblings : []).reduce((acc, sibling, index) => {
                Object.keys(sibling || {}).forEach(key => {
                  acc[`${key}_${index}`] = sibling[key];
                });
                return acc;
              }, {})}
              totalFields={
                (Array.isArray(family?.siblings) && family.siblings.length > 0) ? family.siblings.flatMap((_, index) => [
                  `gender_${index}`, `givenname_${index}`, `middlename_${index}`, `lastname_${index}`, `suffix_${index}`,
                  `date_of_birth_${index}`, `contact_number_${index}`, `bloodtype_${index}`,
                  `civil_status_${index}`, `date_of_marriage_${index}`, `place_of_marriage_${index}`,
                  `citizenship_${index}`, `nationality_${index}`, `livelihood_${index}`,
                  `district_id_${index}`, `local_congregation_${index}`, `church_duties_${index}`,
                  `employment_type_${index}`, `company_${index}`, `address_${index}`, `position_${index}`,
                  `start_date_${index}`, `end_date_${index}`, `reason_for_leaving_${index}`,
                  `education_level_${index}`, `start_year_${index}`, `completion_year_${index}`,
                  `school_${index}`, `field_of_study_${index}`, `degree_${index}`, `professional_licensure_examination_${index}`
                ]) : []
              }
            />}

            {step === 6 && <StepProgressTracker
              data={(Array.isArray(family?.spouses) ? family.spouses : []).reduce((acc, spouse, index) => {
                Object.keys(spouse || {}).forEach(key => {
                  acc[`${key}_${index}`] = spouse[key];
                });
                return acc;
              }, {})}
              totalFields={
                (Array.isArray(family?.spouses) && family.spouses.length > 0) ? family.spouses.flatMap((_, index) => [
                  `gender_${index}`, `givenname_${index}`, `middlename_${index}`, `lastname_${index}`, `suffix_${index}`,
                  `date_of_birth_${index}`, `contact_number_${index}`, `bloodtype_${index}`,
                  `civil_status_${index}`, `date_of_marriage_${index}`, `place_of_marriage_${index}`,
                  `citizenship_${index}`, `nationality_${index}`, `livelihood_${index}`,
                  `district_id_${index}`, `local_congregation_${index}`, `church_duties_${index}`,
                  `employment_type_${index}`, `company_${index}`, `address_${index}`, `position_${index}`,
                  `start_date_${index}`, `end_date_${index}`, `reason_for_leaving_${index}`,
                  `education_level_${index}`, `start_year_${index}`, `completion_year_${index}`,
                  `school_${index}`, `field_of_study_${index}`, `degree_${index}`, `professional_licensure_examination_${index}`
                ]) : []
              }
            />}

            {step === 7 && <StepProgressTracker
              data={(Array.isArray(family?.children) ? family.children : []).reduce((acc, child, index) => {
                Object.keys(child || {}).forEach(key => {
                  acc[`${key}_${index}`] = child[key];
                });
                return acc;
              }, {})}
              totalFields={
                (Array.isArray(family?.children) && family.children.length > 0) ? family.children.flatMap((_, index) => [
                  `gender_${index}`, `givenname_${index}`, `middlename_${index}`, `lastname_${index}`, `suffix_${index}`,
                  `date_of_birth_${index}`, `contact_number_${index}`, `bloodtype_${index}`,
                  `civil_status_${index}`, `date_of_marriage_${index}`, `place_of_marriage_${index}`,
                  `citizenship_${index}`, `nationality_${index}`, `livelihood_${index}`,
                  `district_id_${index}`, `local_congregation_${index}`, `church_duties_${index}`,
                  `employment_type_${index}`, `company_${index}`, `address_${index}`, `position_${index}`,
                  `start_date_${index}`, `end_date_${index}`, `reason_for_leaving_${index}`,
                  `education_level_${index}`, `start_year_${index}`, `completion_year_${index}`,
                  `school_${index}`, `field_of_study_${index}`, `degree_${index}`, `professional_licensure_examination_${index}`
                ]) : []
              }
            />}
          </Box>
        </Box>
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
          isEditing={isEditing} // ✅ Pass isEditing as a prop
          toggleEdit={toggleEdit} // ✅ Pass toggleEdit function
          dutiesToDelete={dutiesToDelete} // 🔥 ADD THIS
          setDutiesToDelete={setDutiesToDelete} // 🔥 ADD THIS
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
          // data={
          //   family.parents.length > 0
          //     ? ["Father", "Mother"].map(
          //         (relationship) =>
          //           family.parents.find(
          //             (parent) => parent.relationship_type === relationship
          //           ) || {
          //             relationship_type: relationship,
          //             // givenname: "",
          //             // lastname: "",
          //             isEditing: true,
          //           }
          //       )
          //     : [
          //         {
          //           relationship_type: "Father",
          //           // givenname: "",
          //           // lastname: "",
          //           isEditing: true,
          //         },
          //         {
          //           relationship_type: "Mother",
          //           // givenname: "",
          //           // lastname: "",
          //           isEditing: true,
          //         },
          //       ]
          // }
          data={["Father", "Mother"].map((relationship) => {
            // Ensure `family.parents` is an array, otherwise default to an empty array
            const parentsArray = Array.isArray(family.parents)
              ? family.parents
              : [];

            const existingParent = parentsArray.find(
              (parent) => parent.relationship_type === relationship
            );

            return existingParent
              ? {
                ...existingParent,
                givenname: existingParent.givenname || "", // Ensure givenname exists
                lastname: existingParent.lastname || "", // Ensure lastname exists
                gender:
                  existingParent.gender ||
                  (relationship === "Father" ? "Male" : "Female"),
                //isEditing: existingParent.isEditing ?? true, // Preserve edit mode
              }
              : {
                relationship_type: relationship,
                givenname: "",
                lastname: "",
                gender: relationship === "Father" ? "Male" : "Female",
                //isEditing: true, // Always allow editing for new entries
              };
          })}
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

                if (typeParam === "evaluation") {
                  setIsVerifyModalOpen(true); // ✅ show verification modal
                } else {
                  setIsCongratulatoryModalOpen(true);
                }
              }}
            >
              Yes, Finish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        isCentered
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader
            bgGradient="linear(to-r, teal.500, blue.600)"
            color="white"
            fontSize="2xl"
            fontWeight="bold"
            py={6}
          >
            Personnel Summary
          </ModalHeader>
          <ModalCloseButton color="white" top={6} />
          <ModalBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* Header Info */}
              <VStack spacing={4} align="center" pb={6} borderBottom="1px solid" borderColor="gray.100">
                <Heading size="lg" color="gray.800" textAlign="center">
                  {`${personnelData.givenname || ""} ${personnelData.middlename || ""} ${personnelData.surname_husband || personnelData.surname_maiden || ""}`.trim()}
                </Heading>
                <Flex gap={3} wrap="wrap" justify="center">
                  <Box bg="teal.500" color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                    {personnelData.personnel_type || "N/A"}
                  </Box>
                  <Box bg="blue.100" color="blue.700" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                    {getLabelById(departments, personnelData.department_id)}
                  </Box>
                </Flex>
              </VStack>

              <Flex wrap="wrap" gap={4}>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Nickname" value={personnelData.nickname} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Gender" value={personnelData.gender} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Civil Status" value={personnelData.civil_status} />
                </Box>
                {personnelData.civil_status === "Married" && (
                  <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                    <SummaryItem label="Wedding Date" value={personnelData.wedding_anniversary} />
                  </Box>
                )}
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Birthday" value={personnelData.date_of_birth} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Age" value={age} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Place of Birth" value={personnelData.place_of_birth} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Date Started (Office)" value={personnelData.datejoined} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Blood Type" value={personnelData.bloodtype} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Email Address" value={personnelData.email_address} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Languages"
                    value={getLabelsByIds(languages, personnelData.language_id)}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Citizenship"
                    value={getLabelsByIds(citizenships, personnelData.citizenship, "citizenship")}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Current District"
                    value={getLabelById(districts, personnelData.registered_district_id)}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Current Local"
                    value={getLabelById(localCongregations, personnelData.registered_local_congregation)}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Section"
                    value={getLabelById(sections, personnelData.section_id)}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Role"
                    value={getLabelById(designations, personnelData.designation_id)}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem
                    label="Classification"
                    value={personnelData.is_offered === "1" ? "Offered" : personnelData.is_offered === "0" ? "Convert" : "N/A"}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Date Baptized" value={personnelData.date_baptized} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Place of Baptism" value={personnelData.place_of_baptism} />
                </Box>
                <Box flex={{ base: "1 1 100%", sm: "1 1 45%", md: "1 1 30%" }}>
                  <SummaryItem label="Minister Officiated" value={personnelData.minister_officiated} />
                </Box>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" py={4}>
            <Button
              colorScheme="teal"
              size="lg"
              px={10}
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              onClick={async () => {
                try {
                  // Update progress before redirecting
                  await putData("users/update-progress", {
                    personnel_id: personnelId,
                    personnel_progress: "1", // or any other progress level
                  });

                  // Redirect to the Personnel Preview page
                  navigate(`/personnel-preview/${personnelId}`);
                } catch (error) {
                  console.error("Failed to update progress:", error);
                  toast({
                    title: "Error",
                    description: "Failed to update progress. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom-left",
                  });
                }
              }}
            >
              Verify & Proceed
            </Button>

            <Button
              variant="ghost"
              ml={3}
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Go Back & Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ✅ Congratulatory Modal (Responsive & Enhanced Layout) */}
      <Modal
        isOpen={isCongratulatoryModalOpen}
        onClose={() => setIsCongratulatoryModalOpen(false)}
        isCentered
        size={{ base: "full", md: "xl" }}
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          maxWidth={{ base: "98%", md: "900px" }}
          borderRadius={{ base: "none", md: "2xl" }}
          overflow="hidden"
          m={{ base: 0, md: 4 }}
        >
          <ModalHeader
            bgGradient="linear(to-r, yellow.400, orange.500)"
            color="white"
            textAlign="center"
            py={{ base: 4, md: 8 }}
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="extrabold"
            textShadow="2px 2px 4px rgba(0,0,0,0.3)"
          >
            🎉 Enrollment Complete! 🎉
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" top={{ base: 2, md: 4 }} />

          <ModalBody p={{ base: 4, md: 8 }}>
            <VStack spacing={6} align="stretch">
              <Text
                textAlign="center"
                fontSize={{ base: "md", md: "xl" }}
                fontWeight="bold"
                color="gray.800"
                lineHeight="tall"
              >
                Congratulations! You have successfully completed the enrollment process.
                <br />
                <Text as="span" color="orange.600" fontSize={{ base: "sm", md: "lg" }}>
                  Keep your reference number safe for future tracking.
                </Text>
              </Text>

              <Box
                bgGradient="linear(to-br, orange.50, yellow.50)"
                borderRadius="2xl"
                p={{ base: 4, md: 8 }}
                boxShadow="inner"
                border="1px solid"
                borderColor="orange.100"
              >
                <Heading
                  size="md"
                  textAlign="center"
                  mb={8}
                  color="orange.700"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  📋 Application Journey
                </Heading>

                {/* Multi-mode Progress Tracker */}
                <Box
                  maxHeight={{ base: "50vh", md: "auto" }}
                  overflowY={{ base: "auto", md: "visible" }}
                  px={{ base: 2, md: 0 }}
                >
                  <Flex
                    direction={{ base: "column", lg: "row" }}
                    justifyContent="space-between"
                    alignItems={{ base: "flex-start", lg: "center" }}
                    position="relative"
                    gap={{ base: 4, lg: 0 }}
                  >
                    {steps.map((step, index) => {
                      const progressNumber = Number(progress);
                      const isCompleted = Array.isArray(step.progressValue)
                        ? step.progressValue.includes(progressNumber)
                        : progressNumber >= step.progressValue;
                      const isActive = Array.isArray(step.progressValue)
                        ? step.progressValue.includes(progressNumber)
                        : progressNumber === step.progressValue;
                      const isNextCompleted =
                        index < steps.length - 1 &&
                        (Array.isArray(steps[index + 1].progressValue)
                          ? steps[index + 1].progressValue.includes(progressNumber)
                          : progressNumber >= steps[index + 1].progressValue);

                      return (
                        <Flex
                          key={index}
                          direction={{ base: "row", lg: "column" }}
                          alignItems="center"
                          flex="1"
                          position="relative"
                          w={{ base: "full", lg: "auto" }}
                        >
                          {/* Connecting Line - Responsive */}
                          {index !== steps.length - 1 && (
                            <Box
                              position="absolute"
                              // Vertical line for mobile, Horizontal for desktop
                              top={{ base: "36px", lg: "23px" }}
                              left={{ base: "18px", lg: "50%" }}
                              width={{ base: "4px", lg: "100%" }}
                              height={{ base: "calc(100% - 24px)", lg: "4px" }}
                              zIndex="0"
                              bg="gray.100"
                              borderRadius="full"
                              overflow="hidden"
                            >
                              <Box
                                width="100%"
                                height="100%"
                                bg={isNextCompleted ? "blue.400" : "gray.200"}
                                bgGradient={isNextCompleted ? "linear(to-r, blue.400, teal.400)" : "none"}
                                transition="all 0.6s"
                              />
                            </Box>
                          )}

                          {/* Step Badge */}
                          <Center
                            bg={isCompleted ? "blue.500" : "white"}
                            color={isCompleted ? "white" : "gray.400"}
                            borderRadius="full"
                            w={{ base: "36px", md: "46px" }}
                            h={{ base: "36px", md: "46px" }}
                            zIndex={1}
                            border="3px solid"
                            borderColor={isCompleted ? "blue.200" : "gray.200"}
                            transition="all 0.3s"
                            boxShadow={isActive ? "0 0 15px rgba(66, 153, 225, 0.6)" : "sm"}
                            transform={isActive ? "scale(1.2)" : "scale(1)"}
                            mr={{ base: 4, lg: 0 }}
                            mb={{ base: 0, lg: 3 }}
                          >
                            {isCompleted ? <CheckIcon fontSize="xs" /> : <Text fontWeight="bold">{index + 1}</Text>}
                          </Center>

                          <VStack align={{ base: "start", lg: "center" }} spacing={0}>
                            <Text
                              fontSize={{ base: "sm", md: "xs" }}
                              fontWeight={isActive ? "900" : "bold"}
                              color={isActive ? "blue.600" : isCompleted ? "gray.700" : "gray.400"}
                              textAlign={{ base: "left", lg: "center" }}
                              lineHeight="shorter"
                              maxW={{ base: "200px", lg: "80px" }}
                            >
                              {step.label}
                            </Text>
                          </VStack>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Box>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            bg="gray.50"
            p={{ base: 6, md: 8 }}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              w="full"
              justify="center"
            >
              {typeParam === "evaluation" ? (
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  h="60px"
                  fontSize="xl"
                  onClick={async () => {
                    toast({
                      title: "Success",
                      description: "Redirecting to login...",
                      status: "success",
                      duration: 2000,
                    });
                    await putData("users/update-progress", {
                      personnel_id: personnelId,
                      personnel_progress: "0",
                    });
                    setTimeout(() => navigate("/login"), 1000);
                  }}
                >
                  Complete Process
                </Button>
              ) : (
                <>
                  {personnelProgress < 7 ? (
                    <Button
                      bgGradient="linear(to-r, blue.600, blue.400)"
                      color="white"
                      size="lg"
                      w={{ base: "full", md: "auto" }}
                      px={12}
                      h="56px"
                      _hover={{ bgGradient: "linear(to-r, blue.700, blue.500)", transform: "scale(1.02)" }}
                      onClick={handleEdit}
                    >
                      Edit Enrollment
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      size="lg"
                      w={{ base: "full", md: "auto" }}
                      px={12}
                      h="56px"
                      isLoading={isDownloading}
                      loadingText="Fetching..."
                      leftIcon={<span>📥</span>}
                      onClick={async () => {
                        setIsDownloading(true);
                        try {
                          const response = await fetchData(
                            "get-user-credentials",
                            null,
                            null,
                            null,
                            { personnel_id: personnelId }
                          );

                          if (!response) throw new Error("No response");

                          const { username, reference_number, givenname, surname_husband } = response;
                          const fileContent = `Reference Number: ${reference_number}\nName: ${givenname} ${surname_husband}\nUsername: ${username}\nPassword: Please contact PMD-IT.`;
                          const blob = new Blob([fileContent], { type: "text/plain" });
                          const link = document.createElement("a");
                          link.href = window.URL.createObjectURL(blob);
                          link.download = `PMD_Credentials_${reference_number}.txt`;
                          link.click();

                          toast({
                            title: "Downloaded!",
                            status: "success",
                            position: "top",
                          });

                          setTimeout(() => navigate("/login"), 1500);
                        } catch (error) {
                          console.error(error);
                          toast({ title: "Check ID", description: "Failed to download", status: "error" });
                        } finally {
                          setIsDownloading(false);
                        }
                      }}
                    >
                      Download & Finish
                    </Button>
                  )}
                </>
              )}
            </Flex>
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
      {step === 1 && ( // ✅ Only show on Step 1
        <Flex w="100%" justify="flex-end" align="center" mt={2} mb={2} px={4}>
          <IconButton
            icon={isEditing ? <CheckIcon /> : <EditIcon />}
            // onClick={toggleEdit}
            onClick={isEditing ? handleSave : () => setIsEditing(true)} // ✅ Save before disabling fields
            colorScheme={isEditing ? "green" : "blue"}
          />
        </Flex>
      )}
    </VStack>
  );
};

export default EnrollmentForm;
