// src/pages/Step8.js
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

const Step8 = ({
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

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 8: Child Information
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
                    value={child.gender}
                    onChange={(e) => onChange(index, "gender", e.target.value)}
                    isDisabled={!child.isEditing}
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
                    name="suffix"
                    value={child.suffix || ""}
                    onChange={(e) => onChange(index, "suffix", e.target.value)}
                    width="100%"
                    isDisabled={!child.isEditing || child.gender === "Female"} // Maintains both conditions
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
                    value={child.bloodtype}
                    onChange={(e) =>
                      onChange(index, "bloodtype", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.civil_status}
                    onChange={(e) =>
                      onChange(index, "civil_status", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={data.date_of_marriage}
                    onChange={(e) =>
                      onChange(index, "date_of_marriage", e.target.value)
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
                    Place of Marriage:
                  </Text>
                  <Input
                    placeholder="Place of Marriage"
                    value={child.place_of_marriage}
                    onChange={(e) =>
                      onChange(index, "place_of_marriage", e.target.value)
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
                    Citizenship:
                  </Text>
                  <Select
                    placeholder="Select Citizenship"
                    name="citizenship"
                    value={child.citizenship}
                    onChange={(e) =>
                      onChange(index, "citizenship", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.nationality}
                    onChange={(e) =>
                      onChange(index, "nationality", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
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
                    District:
                  </Text>
                  <Select
                    placeholder="Select District"
                    name="district_id"
                    value={child.district_id}
                    onChange={(e) =>
                      onChange(index, "district_id", e.target.value)
                    }
                    isD
                    isDisabled={!child.isEditing}
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
                    value={child.employment_type}
                    onChange={(e) =>
                      onChange(index, "employment_type", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.company}
                    onChange={(e) => onChange(index, "company", e.target.value)}
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
                  <Select
                    placeholder="Education Level"
                    value={child.education_level}
                    onChange={(e) =>
                      onChange(index, "education_level", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    School:
                  </Text>
                  <Input
                    placeholder="School"
                    value={child.school}
                    onChange={(e) => onChange(index, "school", e.target.value)}
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
                    Field of Study:
                  </Text>
                  <Input
                    placeholder="Field of Study"
                    value={child.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
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
                    Degree:
                  </Text>
                  <Input
                    placeholder="Degree"
                    value={child.degree}
                    onChange={(e) => onChange(index, "degree", e.target.value)}
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
                    Institution:
                  </Text>
                  <Input
                    placeholder="Institution"
                    value={child.institution}
                    onChange={(e) =>
                      onChange(index, "institution", e.target.value)
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

export default Step8;
