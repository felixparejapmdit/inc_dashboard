// src/pages/Step6.js
import React, { useState } from "react";
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
  data,
  setData, // Added setData as a prop
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
  const [siblings, setSiblings] = useState([
    {
      relationshipType: "Sibling",
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
      isEditing: true, // Default is true for editable fields on load
    },
  ]);

  const handleAddSibling = () => {
    setSiblings([
      ...siblings,
      {
        relationshipType: "Sibling",
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
        isEditing: true, // Default to true for new siblings
      },
    ]);
    toast({
      title: "Sibling Added",
      description: "A new sibling has been added.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const sibling = data[index];

    const {
      id,
      isEditing,
      relationshipType,
      givenName,
      lastName,
      gender,
      ...siblingData
    } = sibling;

    // Prepare the data to send
    const formattedData = {
      ...siblingData,
      givenname: sibling.givenname,
      lastname: sibling.lastname,
      gender: sibling.gender,
      relationship_type: relationshipType,
      personnel_id: siblingData.personnel_id || 8,
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
      // Update the sibling in state
      // const updatedData = [...data];
      // updatedData[index] = {
      //   ...updatedSibling,
      //   isEditing: true, // Exit editing mode
      // };

      // setData(updatedData); // Update the entire siblings array

      // Update sibling in state
      onToggleEdit(index); // Disable editing mode for the updated sibling
      onChange(index, "id", updatedSibling.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Sibling Updated" : "Sibling Added",
        description: `${relationshipType} information has been ${
          id ? "updated" : "added"
        } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
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
              <Tr bg="gray.50">
                <Td colSpan={4}>
                  <Text fontWeight="bold">Personal Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Select Gender"
                    value={data.gender}
                    onChange={(e) => onChange(index, "gender", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Given Name"
                    value={data.givenname}
                    onChange={(e) =>
                      onChange(index, "givenname", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>

                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={data.middlename}
                    onChange={(e) =>
                      onChange(index, "middlename", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>

                <Td>
                  <Input
                    placeholder="Last Name"
                    value={data.lastname}
                    onChange={(e) =>
                      onChange(index, "lastname", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    name="suffix"
                    value={data[index]?.suffix || ""}
                    onChange={(e) => onChange(index, "suffix", e.target.value)}
                    width="100%"
                    isDisabled={sibling[index]?.gender === "Female"}
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
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={data.date_of_birth}
                    onChange={(e) =>
                      onChange(index, "date_of_birth", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={data.contact_number}
                    onChange={(e) =>
                      onChange(index, "contact_number", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Blood Type"
                    name="bloodtype"
                    value={data.bloodtype}
                    onChange={(e) =>
                      onChange(index, "bloodType", e.target.value)
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
                    placeholder="Civil Status"
                    value={data.civil_status}
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
                  <Input
                    placeholder="Date of Marriage"
                    type="date"
                    value={data.date_of_marriage}
                    onChange={(e) =>
                      onChange(index, "date_of_marriage", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Place of Marriage"
                    value={data.place_of_marriage}
                    onChange={(e) =>
                      onChange(index, "place_of_marriage", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Citizenship"
                    name="citizenship"
                    value={data.citizenship}
                    onChange={(e) =>
                      onChange({
                        target: { name: "citizenship", value: e.target.value },
                      })
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
                    value={data.nationality}
                    onChange={(e) =>
                      onChange({
                        target: { name: "nationality", value: e.target.value },
                      })
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
                    value={data.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select District"
                    name="district_id"
                    value={data.district_id}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "district_id",
                          value: e.target.value,
                        },
                      })
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
                    value={data.local_congregation}
                    onChange={(e) =>
                      onChange(index, "local_congregation", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Minister Officiated"
                    value={data.minister_officiated}
                    onChange={(e) =>
                      onChange(index, "minister_officiated", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    placeholder="Employment Type"
                    value={data.employment_type}
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
                  <Input
                    placeholder="Company"
                    value={data.company}
                    onChange={(e) => onChange(index, "company", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Position"
                    value={data.position}
                    onChange={(e) =>
                      onChange(index, "position", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Address"
                    value={data.address}
                    onChange={(e) => onChange(index, "address", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Department"
                    value={data.department}
                    onChange={(e) =>
                      onChange(index, "department", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Section"
                    value={data.section}
                    onChange={(e) => onChange(index, "section", e.target.value)}
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={data.reason_for_leaving}
                    onChange={(e) =>
                      onChange(index, "reason_for_leaving", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
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
                    placeholder="Education Level"
                    value={data.education_level}
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
                  <Input
                    placeholder="School"
                    value={data.school}
                    onChange={(e) => onChange(index, "school", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Field of Study"
                    value={data.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Degree"
                    value={data.degree}
                    onChange={(e) => onChange(index, "degree", e.target.value)}
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
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
                    isDisabled={!sibling.isEditing}
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
                </Td>
              </Tr>
            </Tbody>
          </Table>
        ))}
        <Button onClick={handleAddSibling} colorScheme="teal">
          Add Sibling
        </Button>
      </VStack>
    </Box>
  );
};

export default Step6;
