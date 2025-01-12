// src/pages/Step6.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Select,
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

const API_URL = process.env.REACT_APP_API_URL;

const Step6 = ({
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

  const [siblings, setSiblings] = useState([]);
  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (personnelId) {
      // Fetch siblings related to the personnelId and relationship_type
      axios
        .get(`${API_URL}/api/get-family-members`, {
          params: {
            personnel_id: personnelId,
            relationship_type: "Sibling", // Specify relationship_type for siblings
          },
        })
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length === 0) {
            setData([]); // Clear the siblings table if no data
          } else {
            setData(res.data || []); // Set siblings if data exists
          }
        })
        .catch((err) => {
          console.error("Error fetching siblings:", err);
          setData([]); // Clear the table on error
          toast({
            title: "Error",
            description: "Failed to fetch sibling data1.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left", // Position the toast on the bottom-left
          });
        });
    } else {
      setData([]); // Clear siblings if no personnelId
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
    const sibling = data[index];

    const {
      id,
      isEditing,
      relationship_type = sibling.relationship_type, // Fallback to the existing key if relationship_type is undefined,
      gender,
      givenName,
      lastName,
      ...siblingData
    } = sibling;

    // Prepare the data to send
    const formattedData = {
      ...siblingData,
      gender: sibling.gender,
      givenname: sibling.givenname,
      lastname: sibling.lastname,
      relationship_type: relationship_type,
      personnel_id: personnelId,
      date_of_birth: sibling.date_of_birth || null, // Ensure empty date is set to null
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "gender",
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
      let updatedSibling;
      if (id) {
        // Update existing sibling record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        updatedSibling = response.data;
      } else {
        // Save new sibling record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        updatedSibling = response.data;
      }

      // Update sibling in state
      onToggleEdit(index); // Disable editing mode for the updated sibling
      onChange(index, "id", updatedSibling.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Sibling Updated" : "Sibling Added",
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
        "Error saving/updating sibling information:",
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
  const handleRemoveSibling = async (index) => {
    const sibling = data[index];

    if (sibling.id) {
      const confirmed = window.confirm("Are you sure you want to delete this sibling?");
      if (!confirmed) return;

      try {
        await axios.delete(`${API_URL}/api/family-members/${sibling.id}`);
        toast({
          title: "Sibling Deleted",
          description: "Sibling information has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting sibling:", error);
        toast({
          title: "Error",
          description: "Failed to delete sibling information.",
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
  
  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 6: Siblings Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {data.map((sibling, index) => (
          <Table
            key={sibling.id || sibling.generatedId}
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
                  <Select
                    placeholder="Select Gender"
                    value={sibling.gender}
                    onChange={(e) => onChange(index, "gender", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
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
                    value={sibling.givenname}
                    onChange={(e) =>
                      onChange(index, "givenname", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.middlename}
                    onChange={(e) =>
                      onChange(index, "middlename", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.lastname}
                    onChange={(e) =>
                      onChange(index, "lastname", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    name="suffix"
                    value={sibling.suffix || ""}
                    onChange={(e) => onChange(index, "suffix", e.target.value)}
                    width="100%"
                    isDisabled={
                      !sibling.isEditing || sibling.gender === "Female"
                    } // Maintains both conditions
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
                    value={sibling.date_of_birth}
                    onChange={(e) =>
                      onChange(index, "date_of_birth", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.contact_number}
                    onChange={(e) =>
                      onChange(index, "contact_number", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    Blood Type:
                  </Text>
                  <Select
                    placeholder="Select Blood Type"
                    name="bloodtype"
                    value={sibling.bloodtype || ""}
                    onChange={
                      (e) => onChange(index, "bloodtype", e.target.value) // Correct field name
                    }
                    isDisabled={!sibling.isEditing}
                    width="100%"
                  >
                    {bloodtypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
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
                    Civil Status:
                  </Text>
                  <Select
                    placeholder="Civil Status"
                    value={sibling.civil_status}
                    onChange={(e) =>
                      onChange(index, "civil_status", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    {civilStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
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
                    value={sibling.date_of_marriage}
                    onChange={(e) =>
                      onChange(index, "date_of_marriage", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.place_of_marriage}
                    onChange={(e) =>
                      onChange(index, "place_of_marriage", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    Citizenship:
                  </Text>
                  <Select
                    placeholder="Select Citizenship"
                    name="citizenship"
                    value={sibling.citizenship}
                    onChange={(e) =>
                      onChange(index, "citizenship", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                    width="100%"
                  >
                    {citizenships.map((citizenship) => (
                      <option key={citizenship.id} value={citizenship.id}>
                        {citizenship.citizenship}
                      </option>
                    ))}
                  </Select>
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
                    Nationality:
                  </Text>
                  <Select
                    placeholder="Select Nationality"
                    name="nationality"
                    value={sibling.nationality}
                    onChange={(e) =>
                      onChange(index, "nationality", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                    width="100%"
                  >
                    {nationalities.map((nationality) => (
                      <option key={nationality.id} value={nationality.id}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Select>
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
                    value={sibling.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    District:
                  </Text>
                  <Select
                    placeholder="Select District"
                    name="district_id"
                    value={sibling.district_id}
                    onChange={(e) =>
                      onChange(index, "district_id", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                    width="100%"
                  >
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </Select>
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
                    value={sibling.local_congregation}
                    onChange={(e) =>
                      onChange(index, "local_congregation", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.church_duties}
                    onChange={(e) =>
                      onChange(index, "church_duties", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    Minister Officiated:
                  </Text>
                  <Input
                    placeholder="Minister Officiated"
                    value={sibling.minister_officiated}
                    onChange={(e) =>
                      onChange(index, "minister_officiated", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                  <Text
                    fontWeight="bold"
                    mb="2"
                    minWidth="120px"
                    whiteSpace="nowrap"
                    color="#0a5856"
                  >
                    Employment Type:
                  </Text>
                  <Select
                    placeholder="Employment Type"
                    value={sibling.employment_type}
                    onChange={(e) =>
                      onChange(index, "employment_type", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    {employmentTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
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
                    value={sibling.company}
                    onChange={(e) => onChange(index, "company", e.target.value)}
                    isDisabled={
                      !sibling.isEditing || 
                      ["Volunteer/Kawani"].includes(sibling.employment_type)
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
                    value={sibling.position}
                    onChange={(e) =>
                      onChange(index, "position", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.address}
                    onChange={(e) => onChange(index, "address", e.target.value)}
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.department}
                    onChange={(e) =>
                      onChange(index, "department", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.section}
                    onChange={(e) => onChange(index, "section", e.target.value)}
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.start_date}
                    onChange={(e) =>
                      onChange(index, "start_date", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.end_date}
                    onChange={(e) =>
                      onChange(index, "end_date", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.reason_for_leaving}
                    onChange={(e) =>
                      onChange(index, "reason_for_leaving", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                  <Select
                    placeholder="Education Level"
                    value={sibling.education_level}
                    onChange={(e) =>
                      onChange(index, "education_level", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    {educationalLevelOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Select>
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
                    value={sibling.start_year}
                    onChange={(e) =>
                      onChange(index, "start_year", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.completion_year}
                    onChange={(e) =>
                      onChange(index, "completion_year", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.school}
                    onChange={(e) => onChange(index, "school", e.target.value)}
                    isDisabled={!sibling.isEditing}
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
                    value={sibling.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
                    }
                    isDisabled={
                      !sibling.isEditing ||
                      sibling.education_level === "No Formal Education" ||
                      sibling.education_level === "Primary Education" ||
                      sibling.education_level === "Secondary Education" ||
                      sibling.education_level === "Senior High School"
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
                    value={sibling.degree}
                    onChange={(e) => onChange(index, "degree", e.target.value)}
                    isDisabled={
                      !sibling.isEditing ||
                      sibling.education_level === "No Formal Education" ||
                      sibling.education_level === "Primary Education" ||
                      sibling.education_level === "Secondary Education" ||
                      sibling.education_level === "Senior High School"
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
                    value={sibling.institution}
                    onChange={(e) =>
                      onChange(index, "institution", e.target.value)
                    }
                    isDisabled={
                      !sibling.isEditing ||
                      sibling.education_level === "No Formal Education" ||
                      sibling.education_level === "Primary Education" ||
                      sibling.education_level === "Secondary Education" ||
                      sibling.education_level === "Senior High School"
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
                    value={sibling.professional_licensure_examination}
                    onChange={(e) =>
                      onChange(
                        index,
                        "professional_licensure_examination",
                        e.target.value
                      )
                    }
                    isDisabled={
                      !sibling.isEditing ||
                      sibling.education_level === "No Formal Education" ||
                      sibling.education_level === "Primary Education" ||
                      sibling.education_level === "Secondary Education" ||
                      sibling.education_level === "Senior High School"
                    }
                  />
                </Td>
                
              </Tr>

              {/* Save and Edit Button */}
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <IconButton
                    icon={sibling.isEditing ? <CheckIcon /> : <EditIcon />}
                    onClick={() =>
                      sibling.isEditing
                        ? handleSaveOrUpdate(index)
                        : onChange(index, "isEditing", true)
                    }
                    colorScheme={sibling.isEditing ? "green" : "blue"}
                  />
                  
                              <IconButton
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                onClick={() => handleRemoveSibling(index)}
                              />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        ))}
        <Button onClick={onAdd} colorScheme="teal">
          Add Sibling
        </Button>
      </VStack>
    </Box>
  );
};

export default Step6;
