// src/pages/Step5.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Select,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const Step5 = ({
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
  const { personnelId } = useParams(); // Retrieve personnelId from URL

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (personnelId) {
      // Fetch siblings related to the personnelId
      axios
        .get(`${API_URL}/api/family-members?personnel_id=${personnelId}`)
        .then((res) => {
          setParents(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching parents:", err);
          toast({
            title: "Error",
            description: "Failed to fetch parents data.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  }, [personnelId]);

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const parent = data[index];

    const {
      id,
      isEditing,
      relationshipType = parent.relationship_type, // Fallback to the existing key if relationshipType is undefined,
      givenName,
      lastName,
      gender,
      ...parentData
    } = parent;

    // Prepare the data to send
    const formattedData = {
      ...parentData,
      givenname: parent.givenname,
      lastname: parent.lastname,
      gender: parent.gender,
      relationship_type: relationshipType,
      personnel_id: parentData.personnel_id || 8,
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "gender",
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
        description: `The field "${missingField}" is required for ${relationshipType}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false); // Reset loading state
      return;
    }

    try {
      let updatedParent;
      if (id) {
        // Update existing parent record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        updatedParent = response.data;
      } else {
        // Save new parent record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        updatedParent = response.data;
      }

      // Update parent in state
      onToggleEdit(index); // Disable editing mode for the updated parent
      onChange(index, "id", updatedParent.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Parent Updated" : "Parent Added",
        description: `${relationshipType} information has been ${
          id ? "updated" : "added"
        } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error saving/updating parent information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to ${
          id ? "update" : "add"
        } ${relationshipType} information. ${
          error.response?.data?.message || "Please try again later."
        }`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 5: Parents Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            {data.map((parent, index) => (
              <Tab key={index}>{parent.relationshipType}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {data.map((parent, index) => (
              <TabPanel key={index}>
                <Table size="md" variant="simple">
                  <Tbody>
                    {/* Personal Information */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Personal Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Input
                          placeholder="Given Name"
                          value={parent.givenname}
                          onChange={(e) =>
                            onChange(index, "givenname", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Middle Name"
                          value={parent.middlename}
                          onChange={(e) =>
                            onChange(index, "middlename", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Last Name"
                          value={parent.lastname}
                          onChange={(e) =>
                            onChange(index, "lastname", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select Suffix"
                          name="suffix"
                          value={parent.suffix} // Default to "" on page load
                          onChange={(e) => {
                            onChange(index, "suffix", e.target.value); // Update the state
                          }}
                          width="100%"
                          isDisabled={parent.gender === "Female"} // Conditionally disable for Female
                        >
                          {suffixOptions.map((suffix) => (
                            <option key={suffix} value={suffix}>
                              {suffix}
                            </option>
                          ))}
                        </Select>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Select
                          value={parent.gender}
                          onChange={(e) =>
                            onChange(index, "gender", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        >
                          <option>Male</option>
                          <option>Female</option>
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          placeholder="Date of Birth"
                          type="date"
                          value={parent.date_of_birth}
                          onChange={(e) =>
                            onChange(index, "date_of_birth", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Contact Number"
                          value={parent.contact_number}
                          type="number"
                          onChange={(e) =>
                            onChange(index, "contact_number", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select Blood Type"
                          name="bloodtype"
                          value={parent.bloodtype} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "bloodtype", e.target.value)
                          }
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
                        <Select
                          placeholder="Select Civil Status"
                          value={parent.civil_status} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "civil_status", e.target.value)
                          }
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                        >
                          {civilStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </Td>

                      <Td>
                        <Input
                          placeholder="Date of Marriage"
                          type="date"
                          value={parent.date_of_marriage}
                          onChange={(e) =>
                            onChange(index, "date_of_marriage", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Place of Marriage"
                          value={parent.place_of_marriage}
                          onChange={(e) =>
                            onChange(index, "place_of_marriage", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select Citizenship"
                          name="citizenship"
                          value={parent.citizenship} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "citizenship", e.target.value)
                          }
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
                        <Select
                          placeholder="Select Nationality"
                          name="nationality"
                          value={parent.nationality} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "nationality", e.target.value)
                          }
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
                        <Input
                          placeholder="Livelihood"
                          value={parent.livelihood}
                          onChange={(e) =>
                            onChange(index, "livelihood", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select District"
                          name="district_id"
                          value={parent.district_id} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "district_id", e.target.value)
                          }
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
                        <Input
                          placeholder="Local Congregation"
                          value={parent.local_congregation}
                          onChange={(e) =>
                            onChange(
                              index,
                              "local_congregation",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    <Tr>
                      <Td>
                        <Input
                          placeholder="Church Duties"
                          value={parent.church_duties}
                          onChange={(e) =>
                            onChange(index, "church_duties", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Minister Officiated"
                          value={parent.minister_officiated}
                          onChange={(e) =>
                            onChange(
                              index,
                              "minister_officiated",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    {/* Work Information Section */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Work Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Select
                          placeholder="Select Employment Type"
                          value={parent.employment_type} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "employment_type", e.target.value)
                          }
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                        >
                          {employmentTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          placeholder="Company"
                          value={parent.company}
                          onChange={(e) =>
                            onChange(index, "company", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Position"
                          value={parent.position}
                          onChange={(e) =>
                            onChange(index, "position", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Address"
                          value={parent.address}
                          onChange={(e) =>
                            onChange(index, "address", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      {/* Department Field */}
                      <Td>
                        <Input
                          placeholder="Department"
                          value={parent.department} // Ensure binding to state
                          onChange={
                            (e) => onChange(index, "department", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        />
                      </Td>

                      {/* Section Field */}
                      <Td>
                        <Input
                          placeholder="Section"
                          value={parent.section} // Ensure binding to state
                          onChange={
                            (e) => onChange(index, "section", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        />
                      </Td>

                      <Td>
                        <Input
                          placeholder="Start Date"
                          type="date"
                          value={parent.start_date}
                          onChange={(e) =>
                            onChange(index, "start_date", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="End Date"
                          type="date"
                          value={parent.end_date}
                          onChange={(e) =>
                            onChange(index, "end_date", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Input
                          placeholder="Reason for Leaving"
                          value={parent.reason_for_leaving}
                          onChange={(e) =>
                            onChange(
                              index,
                              "reason_for_leaving",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    {/* Educational Information Section */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Educational Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Select
                          placeholder="Select Education Level"
                          value={parent.education_level} // Default to empty value if not set
                          onChange={(e) =>
                            onChange(index, "education_level", e.target.value)
                          }
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                        >
                          {educationalLevelOptions.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          placeholder="School"
                          value={parent.school}
                          onChange={(e) =>
                            onChange(index, "school", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Field of Study"
                          value={parent.field_of_study}
                          onChange={(e) =>
                            onChange(index, "field_of_study", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Degree"
                          value={parent.degree}
                          onChange={(e) =>
                            onChange(index, "degree", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Input
                          placeholder="Institution"
                          value={parent.institution}
                          onChange={(e) =>
                            onChange(index, "institution", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Professional Licensure"
                          value={parent.professional_licensure_examination}
                          onChange={(e) =>
                            onChange(
                              index,
                              "professional_licensure_examination",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Start Year"
                          type="number"
                          value={parent.start_year}
                          onChange={(e) =>
                            onChange(index, "start_year", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Completion Year"
                          type="number"
                          value={parent.completion_year}
                          onChange={(e) =>
                            onChange(index, "completion_year", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    {/* Save Button */}
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        <IconButton
                          icon={parent.isEditing ? <CheckIcon /> : <EditIcon />}
                          onClick={() =>
                            parent.isEditing
                              ? handleSaveOrUpdate(index)
                              : onChange(index, "isEditing", true)
                          }
                          colorScheme={parent.isEditing ? "green" : "blue"}
                        />
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Step5;
