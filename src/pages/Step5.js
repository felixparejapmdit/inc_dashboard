// src/pages/Step5.js
import React, { useState } from "react";
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
  data,
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
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const parent = data[index];

    const {
      id,
      isEditing,
      relationshipType,
      givenName,
      lastName,
      gender,
      ...parentData
    } = parent;

    // Map frontend fields to backend fields
    const formattedData = {
      ...parentData,
      givenname: givenName,
      lastname: lastName,
      gender: gender,
      relationship_type: relationshipType,
      personnel_id: parentData.personnel_id || 8, // Default personnel ID if not present
    };

    // Validate required fields before saving/updating
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
                          value={data.givenname}
                          onChange={(e) =>
                            onChange(index, "givenName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Middle Name"
                          value={data.middlename}
                          onChange={(e) =>
                            onChange(index, "middleName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Last Name"
                          value={data.lastname}
                          onChange={(e) =>
                            onChange(index, "lastName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          name="suffix"
                          value={data.suffix}
                          onChange={onChange}
                          width="100%"
                          isDisabled={parent.gender === "Female"}
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
                          value={data.date_of_birth}
                          onChange={(e) =>
                            onChange(index, "date_of_birth", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Contact Number"
                          value={data.contact_number}
                          type="number"
                          onChange={(e) =>
                            onChange(index, "contact_number", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          name="bloodtype"
                          value={data.bloodtype}
                          onChange={(e) =>
                            onChange(index, "bloodtype", e.target.value)
                          }
                          width="100%"
                        >
                          <option value="" disabled>
                            Select Blood Type
                          </option>
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
                          value={data.civil_status}
                          onChange={(e) =>
                            onChange(index, "civil_status", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        >
                          <option value="" disabled>
                            Select Civil Status
                          </option>
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
                          value={data.date_of_marriage}
                          onChange={(e) =>
                            onChange(index, "date_of_marriage", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Place of Marriage"
                          value={data.place_of_marriage}
                          onChange={(e) =>
                            onChange(index, "place_of_marriage", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          name="citizenship"
                          value={data.citizenship} // Ensure the correct value is being passed
                          onChange={(e) =>
                            onChange(index, "citizenship", e.target.value)
                          } // Correctly pass the index, field, and value
                          width="100%"
                        >
                          <option value="" disabled>
                            Select Citizenship
                          </option>
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
                          name="nationality"
                          value={data.nationality} // Ensure it matches the correct value
                          onChange={(e) =>
                            onChange(index, "nationality", e.target.value)
                          } // Correctly pass index, field, and value
                          width="100%"
                        >
                          <option value="" disabled>
                            Select Nationality
                          </option>
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
                          value={data.livelihood}
                          onChange={(e) =>
                            onChange(index, "livelihood", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        {/* District Select */}
                        <Select
                          name="district_id"
                          value={data.district_id} // Ensure it matches the correct value
                          onChange={(e) =>
                            onChange(index, "district_id", e.target.value)
                          } // Correctly pass index, field, and value
                          width="100%"
                        >
                          <option value="" disabled>
                            Select District
                          </option>
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
                          value={data.local_congregation}
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
                          value={data.church_duties}
                          onChange={(e) =>
                            onChange(index, "church_duties", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Minister Officiated"
                          value={data.minister_officiated}
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
                        {/* Employment Type Select */}
                        <Select
                          value={data.employment_type} // Ensure correct binding to state
                          onChange={
                            (e) =>
                              onChange(index, "employment_type", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        >
                          <option value="" disabled>
                            Select Employment Type
                          </option>
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
                          value={data.company}
                          onChange={(e) =>
                            onChange(index, "company", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Position"
                          value={data.position}
                          onChange={(e) =>
                            onChange(index, "position", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Address"
                          value={data.address}
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
                          value={data.department} // Ensure binding to state
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
                          value={data.section} // Ensure binding to state
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
                          value={data.start_date}
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
                          value={data.end_date}
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
                          value={data.reason_for_leaving}
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
                        {/* Education Level Select */}
                        <Select
                          value={data.education_level} // Ensure correct binding to state
                          onChange={
                            (e) =>
                              onChange(index, "education_level", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        >
                          <option value="" disabled>
                            Select Education Level
                          </option>
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
                          value={data.school}
                          onChange={(e) =>
                            onChange(index, "school", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Field of Study"
                          value={data.field_of_study}
                          onChange={(e) =>
                            onChange(index, "field_of_study", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Degree"
                          value={data.degree}
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
                          value={data.institution}
                          onChange={(e) =>
                            onChange(index, "institution", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Professional Licensure"
                          value={data.professional_licensure_examination}
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
                          value={data.start_year}
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
                          value={data.completion_year}
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
