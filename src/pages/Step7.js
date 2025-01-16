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
  enrolleeGender,
}) => {
  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  const [spouses, setSpouses] = useState([]);
  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (personnelId) {
      // Fetch spouses related to the personnelId and relationship_type
      axios
        .get(`${API_URL}/api/get-family-members`, {
          params: {
            personnel_id: personnelId,
            relationship_type: "Spouse", // Specify relationship_type for spouses
          },
        })
        .then((res) => {
          // Ensure at least one spouse row is present
          const defaultSpouse = {
            relationship_type: "Spouse",
            givenname: "",
            lastname: "",
            middlename: "",
            date_of_marriage: "",
            place_of_marriage: "",
            contact_number: "",
            isEditing: true, // Ensure editing is enabled
          };

          if (Array.isArray(res.data) && res.data.length === 0) {
            setData([defaultSpouse]); // Default empty spouse row
          } else {
            setData(res.data || [defaultSpouse]); // Use fetched data or default row
          }
        })
        .catch((err) => {
          console.error("Error fetching spouses:", err);
          // Show a default spouse row in case of an error
          setData([
            {
              relationship_type: "Spouse",
              givenname: "",
              lastname: "",
              middlename: "",
              date_of_marriage: "",
              place_of_marriage: "",
              contact_number: "",
              isEditing: true, // Ensure editing is enabled
            },
          ]);
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
      // Default empty spouse row if no personnelId
      setData([
        {
          relationship_type: "Spouse",
          givenname: "",
          lastname: "",
          middlename: "",
          date_of_marriage: "",
          place_of_marriage: "",
          contact_number: "",
          isEditing: true, // Ensure editing is enabled
        },
      ]);
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
    const spouse = data[index];

    const {
      id,
      isEditing,
      relationship_type = spouse.relationship_type, // Fallback to the existing key if relationship_type is undefined
      givenName,
      lastName,
      ...spouseData
    } = spouse;

    // Prepare the data to send
    const formattedData = {
      ...spouseData,
      givenname: spouse.givenname,
      lastname: spouse.lastname,
      relationship_type: relationship_type,
      personnel_id: personnelId,
      date_of_birth: spouse.date_of_birth || null, // Ensure empty date is set to null
    };
    console.log("Formatted Data:", formattedData);

    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "date_of_birth", // Add date_of_birth as required
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
      let updatedSpouse;
      if (id) {
        // Update existing spouse record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        updatedSpouse = response.data;
      } else {
        // Save new spouse record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        updatedSpouse = response.data;
      }

      // Update spouse in state
      onToggleEdit(index); // Disable editing mode for the updated spouse
      onChange(index, "id", updatedSpouse.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Spouse Updated" : "Spouse Added",
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
        "Error saving/updating spouse information:",
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

  const renderSelect = (placeholder, value, options, onChange, isDisabled) => (
    <Select
      placeholder={placeholder} // Placeholder text
      value={
        value
          ? options
              .map((option) => ({
                value: option.id || option.value,
                label:
                  option.citizenship ||
                  option.nationality ||
                  option.label ||
                  option.name,
              }))
              .find((option) => option.value === value)
          : null
      } // Find and display the correct selected option
      onChange={(selectedOption) => onChange(selectedOption?.value || "")} // Update the selected value
      options={options.map((option) => ({
        value: option.id || option.value,
        label:
          option.citizenship ||
          option.nationality ||
          option.label ||
          option.name,
      }))} // Map options to value-label pairs
      isDisabled={isDisabled} // Disable conditionally
      isClearable // Allow clearing the selection
      styles={{
        container: (base) => ({ ...base, width: "100%" }),
        placeholder: (base) => ({ ...base, color: "#a8a8a8" }),
      }}
    />
  );

  return (
    <VStack width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 7: Spouse Information
      </Heading>
      {data.map((spouse, index) => (
        <VStack align="start" spacing={4} mb={8} w="100%">
          <Table
            key={spouse.id || spouse.generatedId}
            size="md"
            variant="simple"
          >
            <Tbody>
              {/* Personal Information */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Personal Information</Text>
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
                    Gender:
                  </Text>
                  {renderSelect(
                    "Select Gender",
                    spouse.gender ||
                      (enrolleeGender === "Male" ? "Female" : "Male"),
                    [
                      enrolleeGender === "Male"
                        ? { value: "Female", label: "Female" }
                        : { value: "Male", label: "Male" },
                    ],
                    (value) => onChange(index, "gender", value),
                    !spouse.isEditing
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
                    value={spouse.givenname}
                    onChange={(e) =>
                      onChange(index, "givenname", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.middlename}
                    onChange={(e) =>
                      onChange(index, "middlename", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.lastname}
                    onChange={(e) =>
                      onChange(index, "lastname", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                      spouse.suffix
                        ? { value: spouse.suffix, label: spouse.suffix }
                        : null
                    } // Ensures the selected value matches spouse.suffix
                    onChange={(selectedOption) =>
                      onChange(index, "suffix", selectedOption?.value || "")
                    } // Updates the suffix field in state
                    options={suffixOptions.map((suffix) => ({
                      value: suffix,
                      label: suffix,
                    }))} // Maps suffix options to value-label pairs
                    isDisabled={!spouse.isEditing || spouse.gender === "Female"} // Conditionally disable for editing or gender
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
                    value={spouse.date_of_birth}
                    onChange={(e) =>
                      onChange(index, "date_of_birth", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.contact_number}
                    onChange={(e) =>
                      onChange(index, "contact_number", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Blood Type:
                  </Text>
                  {renderSelect(
                    "Select Blood Type",
                    spouse.bloodtype,
                    bloodtypes.map((type) => ({ value: type, label: type })),
                    (value) => onChange(index, "bloodtype", value),
                    !spouse.isEditing
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
                    spouse.civil_status,
                    civilStatusOptions.map((status) => ({
                      value: status,
                      label: status,
                    })),
                    (value) => onChange(index, "civil_status", value),
                    !spouse.isEditing
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
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.place_of_marriage}
                    onChange={(e) =>
                      onChange(index, "place_of_marriage", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>

                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    Citizenship:
                  </Text>
                  {renderSelect(
                    "Select Citizenship", // Placeholder
                    spouse.citizenship, // Current selected value
                    citizenships, // Array of options
                    (value) => onChange(index, "citizenship", value), // Change handler
                    !spouse.isEditing // Disable conditionally
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
                    spouse.nationality,
                    nationalities,
                    (value) => onChange(index, "nationality", value),
                    !spouse.isEditing
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
                    value={spouse.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Text fontWeight="bold" mb="2" color="#0a5856">
                    District:
                  </Text>
                  {renderSelect(
                    "Select District",
                    spouse.district_id,
                    districts,
                    (value) => onChange(index, "district_id", value),
                    !spouse.isEditing
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
                    value={spouse.local_congregation}
                    onChange={(e) =>
                      onChange(index, "local_congregation", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.church_duties}
                    onChange={(e) =>
                      onChange(index, "church_duties", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    Evangelist:
                  </Text>
                  <Input
                    placeholder="Evangelist"
                    value={spouse.minister_officiated}
                    onChange={(e) =>
                      onChange(index, "minister_officiated", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    spouse.employment_type, // Current selected value
                    employmentTypeOptions.map((type) => ({
                      value: type,
                      label: type,
                    })), // Transform `employmentTypeOptions` to value-label pairs
                    (value) => onChange(index, "employment_type", value), // Handle change
                    !spouse.isEditing // Disable when not in edit mode
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
                    value={spouse.company}
                    onChange={(e) => onChange(index, "company", e.target.value)}
                    isDisabled={
                      !spouse.isEditing ||
                      ["Volunteer/Kawani"].includes(spouse.employment_type)
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
                    value={spouse.position}
                    onChange={(e) =>
                      onChange(index, "position", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.address}
                    onChange={(e) => onChange(index, "address", e.target.value)}
                    isDisabled={!spouse.isEditing}
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
                    Department:
                  </Text>
                  <Input
                    placeholder="Department"
                    value={spouse.department}
                    onChange={(e) =>
                      onChange(index, "department", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.section}
                    onChange={(e) => onChange(index, "section", e.target.value)}
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.start_date}
                    onChange={(e) =>
                      onChange(index, "start_date", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.end_date}
                    onChange={(e) =>
                      onChange(index, "end_date", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.reason_for_leaving}
                    onChange={(e) =>
                      onChange(index, "reason_for_leaving", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    spouse.education_level, // Selected value
                    educationalLevelOptions.map((level) => ({
                      value: level,
                      label: level,
                    })), // Options for the dropdown
                    (value) => onChange(index, "education_level", value), // Change handler
                    !spouse.isEditing // Disable editing when not allowed
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
                    value={spouse.start_year}
                    onChange={(e) =>
                      onChange(index, "start_year", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.completion_year}
                    onChange={(e) =>
                      onChange(index, "completion_year", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.school}
                    onChange={(e) => onChange(index, "school", e.target.value)}
                    isDisabled={!spouse.isEditing}
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
                    value={spouse.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
                    }
                    isDisabled={
                      !spouse.isEditing ||
                      spouse.education_level === "No Formal Education" ||
                      spouse.education_level === "Primary Education" ||
                      spouse.education_level === "Secondary Education" ||
                      spouse.education_level === "Senior High School"
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
                    value={spouse.degree}
                    onChange={(e) => onChange(index, "degree", e.target.value)}
                    isDisabled={
                      !spouse.isEditing ||
                      spouse.education_level === "No Formal Education" ||
                      spouse.education_level === "Primary Education" ||
                      spouse.education_level === "Secondary Education" ||
                      spouse.education_level === "Senior High School"
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
                    Institution:
                  </Text>
                  <Input
                    placeholder="Institution"
                    value={spouse.institution}
                    onChange={(e) =>
                      onChange(index, "institution", e.target.value)
                    }
                    isDisabled={
                      !spouse.isEditing ||
                      spouse.education_level === "No Formal Education" ||
                      spouse.education_level === "Primary Education" ||
                      spouse.education_level === "Secondary Education" ||
                      spouse.education_level === "Senior High School"
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
                    value={spouse.professional_licensure_examination}
                    onChange={(e) =>
                      onChange(
                        index,
                        "professional_licensure_examination",
                        e.target.value
                      )
                    }
                    isDisabled={
                      !spouse.isEditing ||
                      spouse.education_level === "No Formal Education" ||
                      spouse.education_level === "Primary Education" ||
                      spouse.education_level === "Secondary Education" ||
                      spouse.education_level === "Senior High School"
                    }
                  />
                </Td>
              </Tr>

              {/* Save and Edit Button */}
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <IconButton
                    icon={spouse.isEditing ? <CheckIcon /> : <EditIcon />}
                    onClick={() =>
                      spouse.isEditing
                        ? handleSaveOrUpdate(index)
                        : onChange(index, "isEditing", true)
                    }
                    colorScheme={spouse.isEditing ? "green" : "blue"}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <HStack spacing={2} mt={4}></HStack>
        </VStack>
      ))}

      {/* Conditional add spouse button */}
      {spouses.length > 0 &&
        spouses[spouses.length - 1]?.status === "Deceased" && (
          <Button onClick={onAdd} colorScheme="teal" mt={4}>
            Add Spouse
          </Button>
        )}
    </VStack>
  );
};

export default Step7;
