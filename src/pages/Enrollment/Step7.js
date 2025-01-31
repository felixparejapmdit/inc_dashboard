// src/pages/Step7.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  //Select,
  Button,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";
import Select from "react-select";

const API_URL = process.env.REACT_APP_API_URL;

const Step7 = ({
  data = [], // Ensure data defaults to an empty array
  setData, // Added setData as a prop
  onAdd,
  onChange,
  onToggleEdit,
  citizenships,
  nationalities,
  suffixOptions,
  districts,
  civilStatusOptions,
  employmentTypeOptions,
  educationalLevelOptions,
  bloodtypes,
}) => {
  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  const [children, setChildren] = useState([]);
  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (personnelId) {
      // Fetch children related to the personnelId and relationship_type
      axios
        .get(`${API_URL}/api/get-family-members`, {
          params: {
            personnel_id: personnelId,
            relationship_type: "Child", // Specify relationship_type for children
          },
        })
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length === 0) {
            setData([]); // Clear the children table if no data
          } else {
            setData(res.data || []); // Set children if data exists
          }
        })
        .catch((err) => {
          console.error("Error fetching children:", err);
          setData([]); // Clear the table on error
          toast({
            title: "Error",
            description: "Failed to fetch spouse data.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left", // Position the toast on the bottom-left
          });
        });
    } else {
      setData([]); // Clear children if no personnelId
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to proceed.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  }, [personnelId]);

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const child = data[index];

    const {
      id,
      isEditing,
      relationship_type = child.relationship_type, // Fallback to the existing key if relationship_type is undefined,
      gender,
      givenName,
      lastName,
      ...childData
    } = child;

    // Prepare the data to send
    const formattedData = {
      ...childData,
      gender: child.gender,
      givenname: child.givenname,
      lastname: child.lastname,
      date_of_birth: child.date_of_birth,
      relationship_type: relationship_type,
      personnel_id: personnelId,
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "gender",
      "givenname",
      "lastname",
      "date_of_birth",
    ];
    const missingField = requiredFields.find(
      (field) =>
        !formattedData[field] ||
        (typeof formattedData[field] === "string" &&
          formattedData[field].trim() === "")
    );

    if (missingField) {
      toast({
        title: "Validation Error",
        description: `The field "${missingField}" is required for ${relationship_type}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      setLoading(false); // Reset loading state
      return;
    }

    try {
      let updateChildren;
      if (id) {
        // Update existing children record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        updateChildren = response.data;
      } else {
        // Save new children record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        updateChildren = response.data;
      }

      // Update children in state
      onToggleEdit(index); // Disable editing mode for the updated children
      onChange(index, "id", updateChildren.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Child Updated" : "Child Added",
        description: `${relationship_type} information has been ${
          id ? "updated" : "added"
        } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error(
        "Error saving/updating children information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to ${
          id ? "update" : "add"
        } ${relationship_type} information. ${
          error.response?.data?.message || "Please try again later."
        }`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to remove an education entry
  const handleRemoveChild = async (index) => {
    const child = data[index];

    if (child.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this child?"
      );
      if (!confirmed) return;

      try {
        await axios.delete(`${API_URL}/api/family-members/${child.id}`);
        toast({
          title: "Child Deleted",
          description: "Child information has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting child:", error);
        toast({
          title: "Error",
          description: "Failed to delete child information.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }

    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const renderSelect = (placeholder, value, options, onChange, isDisabled) => (
    <Select
      placeholder={placeholder}
      value={
        value
          ? options
              .map((option) => ({
                value: option.id || option.value,
                label:
                  option.name ||
                  option.label ||
                  option.suffix ||
                  option.citizenship ||
                  option.nationality,
              }))
              .find((option) => option.value === value)
          : null
      }
      onChange={(selectedOption) => onChange(selectedOption?.value || "")}
      options={options.map((option) => ({
        value: option.id || option.value,
        label:
          option.name ||
          option.label ||
          option.suffix ||
          option.citizenship ||
          option.nationality,
      }))}
      isDisabled={isDisabled}
      isClearable
      styles={{
        container: (base) => ({ ...base, width: "100%" }),
      }}
    />
  );

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 7: Child Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {data.map((child, index) => (
          <Table key={child.id || child.generatedId} size="md" variant="simple">
            <Tbody>
              {/* Header */}
              <Tr>
                <Td colSpan={4} fontWeight="bold" fontSize="md">
                  {children.relationship_type}
                </Td>
              </Tr>

              {/* Personal Information */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Personal Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Gender:
                  </Text>
                  {renderSelect(
                    "Select Gender",
                    child.gender,
                    [
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ],
                    (value) => onChange(index, "gender", value),
                    !child.isEditing
                  )}
                </Td>
                <Td>
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
                    value={child.givenname}
                    onChange={(e) =>
                      onChange(index, "givenname", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
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
                    value={child.middlename}
                    onChange={(e) =>
                      onChange(index, "middlename", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Last Name:
                  </Text>
                  <Input
                    placeholder="Last Name"
                    value={child.lastname}
                    onChange={(e) =>
                      onChange(index, "lastname", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
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
                    placeholder="Select Suffix"
                    name="suffix"
                    value={
                      child.suffix
                        ? { value: child.suffix, label: child.suffix }
                        : null
                    } // Ensures the selected value matches child.suffix
                    onChange={(selectedOption) =>
                      onChange(index, "suffix", selectedOption?.value || "")
                    } // Updates the suffix field in state
                    options={suffixOptions.map((suffix) => ({
                      value: suffix,
                      label: suffix,
                    }))} // Maps suffix options to value-label pairs
                    isDisabled={!child.isEditing || child.gender === "Female"} // Conditionally disable for editing or gender
                    isClearable // Allow clearing the selection
                    styles={{
                      container: (base) => ({
                        ...base,
                        width: "100%", // Adjust width to fit the design
                      }),
                    }}
                  />
                </Td>

                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Date of Birth:
                  </Text>
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={child.date_of_birth}
                    onChange={(e) =>
                      onChange(index, "date_of_birth", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Contact Number:
                  </Text>
                  <Input
                    placeholder="Contact Number"
                    value={child.contact_number}
                    onChange={(e) =>
                      onChange(index, "contact_number", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Blood Type:
                  </Text>
                  {renderSelect(
                    "Select Blood Type",
                    child.bloodtype,
                    bloodtypes.map((type) => ({ value: type, label: type })),
                    (value) => onChange(index, "bloodtype", value),
                    !child.isEditing
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Civil Status:
                  </Text>
                  {renderSelect(
                    "Select Civil Status",
                    child.civil_status,
                    civilStatusOptions.map((status) => ({
                      value: status,
                      label: status,
                    })),
                    (value) => onChange(index, "civil_status", value),
                    !child.isEditing
                  )}
                </Td>

                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Date of Marriage:
                  </Text>
                  <Input
                    placeholder="Date of Marriage"
                    type="date"
                    value={data.date_of_marriage}
                    onChange={(e) =>
                      onChange(index, "date_of_marriage", e.target.value)
                    }
                    isDisabled={
                      !child.isEditing || child.civil_status === "Single"
                    } // Disable if civil_status is "Single"
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Place of Marriage:
                  </Text>
                  <Input
                    placeholder="Place of Marriage"
                    value={child.place_of_marriage}
                    onChange={(e) =>
                      onChange(index, "place_of_marriage", e.target.value)
                    }
                    isDisabled={
                      !child.isEditing || child.civil_status === "Single"
                    } // Disable if civil_status is "Single"
                  />
                </Td>

                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Citizenship:
                  </Text>
                  {renderSelect(
                    "Select Citizenship",
                    child.citizenship,
                    citizenships,
                    (value) => onChange(index, "citizenship", value),
                    !child.isEditing
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Nationality:
                  </Text>
                  {renderSelect(
                    "Select Nationality",
                    child.nationality,
                    nationalities,
                    (value) => onChange(index, "nationality", value),
                    !child.isEditing
                  )}
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Livelihood:
                  </Text>
                  <Input
                    placeholder="Livelihood"
                    value={child.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    District:
                  </Text>
                  {renderSelect(
                    "Select District",
                    child.district_id,
                    districts,
                    (value) => onChange(index, "district_id", value),
                    !child.isEditing
                  )}
                </Td>
                <Td>
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
                    value={child.local_congregation}
                    onChange={(e) =>
                      onChange(index, "local_congregation", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>

              <Tr>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Church Duties:
                  </Text>
                  <Input
                    placeholder="Church Duties"
                    value={child.church_duties}
                    onChange={(e) =>
                      onChange(index, "church_duties", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td display="none">
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Evangelist:
                  </Text>
                  <Input
                    placeholder="Evangelist"
                    value={child.minister_officiated}
                    onChange={(e) =>
                      onChange(index, "minister_officiated", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>

              {/* Work Information Section */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Work Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Employment Type:
                  </Text>
                  {renderSelect(
                    "Select Employment Type", // Placeholder
                    child.employment_type, // Current selected value
                    employmentTypeOptions.map((type) => ({
                      value: type,
                      label: type,
                    })), // Transform `employmentTypeOptions` to value-label pairs
                    (value) => onChange(index, "employment_type", value), // Handle change
                    !child.isEditing // Disable when not in edit mode
                  )}
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Company:
                  </Text>
                  <Input
                    placeholder="Company"
                    value={child.company}
                    onChange={(e) => onChange(index, "company", e.target.value)}
                    isDisabled={
                      !child.isEditing ||
                      ["Volunteer/Kawani"].includes(child.employment_type)
                    } // Disable if employment_type is Volunteer or Kawani
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Position:
                  </Text>
                  <Input
                    placeholder="Position"
                    value={child.position}
                    onChange={(e) =>
                      onChange(index, "position", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Address:
                  </Text>
                  <Input
                    placeholder="Address"
                    value={child.address}
                    onChange={(e) => onChange(index, "address", e.target.value)}
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Address:
                  </Text>
                  <Input
                    placeholder="Department"
                    value={child.department}
                    onChange={(e) =>
                      onChange(index, "department", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Section:
                  </Text>
                  <Input
                    placeholder="Section"
                    value={child.section}
                    onChange={(e) => onChange(index, "section", e.target.value)}
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Start Date:
                  </Text>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={child.start_date}
                    onChange={(e) =>
                      onChange(index, "start_date", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    End Date:
                  </Text>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={child.end_date}
                    onChange={(e) =>
                      onChange(index, "end_date", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Reason for Leaving:
                  </Text>
                  <Input
                    placeholder="Reason for Leaving"
                    value={child.reason_for_leaving}
                    onChange={(e) =>
                      onChange(index, "reason_for_leaving", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>

              {/* Educational Information Section */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Educational Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Educational Level:
                  </Text>
                  {renderSelect(
                    "Select Educational Level", // Placeholder text
                    child.education_level, // Selected value
                    educationalLevelOptions.map((level) => ({
                      value: level,
                      label: level,
                    })), // Options for the dropdown
                    (value) => onChange(index, "education_level", value), // Change handler
                    !child.isEditing // Disable editing when not allowed
                  )}
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Start Year:
                  </Text>
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={child.start_year}
                    onChange={(e) =>
                      onChange(index, "start_year", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Completion Year:
                  </Text>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={child.completion_year}
                    onChange={(e) =>
                      onChange(index, "completion_year", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    School:
                  </Text>
                  <Input
                    placeholder="School"
                    value={child.school}
                    onChange={(e) => onChange(index, "school", e.target.value)}
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Field of Study:
                  </Text>
                  <Input
                    placeholder="Field of Study"
                    value={child.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
                    }
                    isDisabled={
                      !child.isEditing ||
                      child.education_level === "No Formal Education" ||
                      child.education_level === "Primary Education" ||
                      child.education_level === "Secondary Education" ||
                      child.education_level === "Senior High School"
                    }
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Degree:
                  </Text>
                  <Input
                    placeholder="Degree"
                    value={child.degree}
                    onChange={(e) => onChange(index, "degree", e.target.value)}
                    isDisabled={
                      !child.isEditing ||
                      child.education_level === "No Formal Education" ||
                      child.education_level === "Primary Education" ||
                      child.education_level === "Secondary Education" ||
                      child.education_level === "Senior High School"
                    }
                  />
                </Td>
                <Td display="none">
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Institution:
                  </Text>
                  <Input
                    placeholder="Institution"
                    value={child.institution}
                    onChange={(e) =>
                      onChange(index, "institution", e.target.value)
                    }
                    isDisabled={
                      !child.isEditing ||
                      child.education_level === "No Formal Education" ||
                      child.education_level === "Primary Education" ||
                      child.education_level === "Secondary Education" ||
                      child.education_level === "Senior High School"
                    }
                  />
                </Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Professional Licensure:
                  </Text>
                  <Input
                    placeholder="Professional Licensure"
                    value={child.professional_licensure_examination}
                    onChange={(e) =>
                      onChange(
                        index,
                        "professional_licensure_examination",
                        e.target.value
                      )
                    }
                    isDisabled={
                      !child.isEditing ||
                      child.education_level === "No Formal Education" ||
                      child.education_level === "Primary Education" ||
                      child.education_level === "Secondary Education" ||
                      child.education_level === "Senior High School"
                    }
                  />
                </Td>
              </Tr>

              {/* Save and Edit Button */}
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <IconButton
                    icon={child.isEditing ? <CheckIcon /> : <EditIcon />}
                    onClick={() =>
                      child.isEditing
                        ? handleSaveOrUpdate(index)
                        : onChange(index, "isEditing", true)
                    }
                    colorScheme={child.isEditing ? "green" : "blue"}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemoveChild(index)}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        ))}
        <Button onClick={onAdd} colorScheme="teal">
          Add Child
        </Button>
      </VStack>
    </Box>
  );
};

export default Step7;
