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
      lastName: "",
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
        lastName: "",
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

  // const toggleEditSibling = (index) => {
  //   const updatedSiblings = [...siblings];
  //   updatedSiblings[index].isEditing = !updatedSiblings[index].isEditing;
  //   setSiblings(updatedSiblings);
  // };

  // const onChange = (index, field, value) => {
  //   const updatedSiblings = siblings.map((sibling, i) =>
  //     i === index ? { ...sibling, [field]: value } : sibling
  //   );
  //   setSiblings(updatedSiblings);
  // };

  // const handleDeleteSibling = (index) => {
  //   setSiblings(siblings.filter((_, i) => i !== index));
  //   toast({
  //     title: "Sibling Deleted",
  //     description: `Sibling ${index + 1} removed.`,
  //     status: "warning",
  //     duration: 3000,
  //     isClosable: true,
  //   });
  // };
  const handleSaveOrUpdate = async (index, setData) => {
    setLoading(true);
    const sibling = data[index];
    const {
      id,
      isEditing,
      relationshipType,
      givenName,
      lastName,
      gender,
      ...siblingsData
    } = sibling;

    // Map frontend fields to backend fields
    const formattedData = {
      ...siblingsData,
      givenname: givenName,
      lastname: lastName, // Ensure lastname is sent
      gender: gender, // Ensure gender is sent
      relationship_type: relationshipType,
      personnel_id: siblingsData.personnel_id || 8, // Ensure personnel_id exists
    };

    // Validate required fields before saving/updating
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "gender",
    ];

    for (const field of requiredFields) {
      if (
        !formattedData[field] ||
        (typeof formattedData[field] === "string" &&
          formattedData[field].trim() === "")
      ) {
        toast({
          title: "Validation Error",
          description: `The field ${field} is required for ${relationshipType}.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false); // Reset loading state
        return;
      }
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

        setData((prev) =>
          prev.map((item, i) =>
            i === index ? { ...updatedSibling, isEditing: false } : item
          )
        );

        toast({
          title: "Sibling Information Updated",
          description: `${relationshipType} information has been updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save new sibling record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        const savedSibling = response.data;

        setData((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, id: savedSibling.id, isEditing: false }
              : item
          )
        );

        toast({
          title: "Sibling Information Saved",
          description: `${relationshipType} information has been saved successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(
        "Error saving/updating sibling information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to save/update ${relationshipType} information. ${
          error.response?.data?.message || "Please check the data."
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
                      onChange(index, "givenName", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={data.middlename}
                    onChange={(e) =>
                      onChange(index, "middleName", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Last Name"
                    value={data.lastName}
                    onChange={(e) =>
                      onChange(index, "lastName", e.target.value)
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
                    value={data.dateOfBirth}
                    onChange={(e) =>
                      onChange(index, "dateOfBirth", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={data.contactNumber}
                    onChange={(e) =>
                      onChange(index, "contactNumber", e.target.value)
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
                    value={data.civilStatus}
                    onChange={(e) =>
                      onChange(index, "civilStatus", e.target.value)
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
                    value={data.placeOfMarriage}
                    onChange={(e) =>
                      onChange(index, "placeOfMarriage", e.target.value)
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
                    value={data.districtId}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "districtId",
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
                    value={data.localCongregation}
                    onChange={(e) =>
                      onChange(index, "localCongregation", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>

              <Tr>
                <Td>
                  <Input
                    placeholder="Church Duties"
                    value={data.churchDuties}
                    onChange={(e) =>
                      onChange(index, "churchDuties", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Minister Officiated"
                    value={data.ministerOfficiated}
                    onChange={(e) =>
                      onChange(index, "ministerOfficiated", e.target.value)
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
                    value={data.employmentType}
                    onChange={(e) =>
                      onChange(index, "employmentType", e.target.value)
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
                    value={data.startDate}
                    onChange={(e) =>
                      onChange(index, "startDate", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={data.endDate}
                    onChange={(e) => onChange(index, "endDate", e.target.value)}
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={data.reasonForLeaving}
                    onChange={(e) =>
                      onChange(index, "reasonForLeaving", e.target.value)
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
                    value={data.educationLevel}
                    onChange={(e) =>
                      onChange(index, "educationLevel", e.target.value)
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
                    value={data.fieldOfStudy}
                    onChange={(e) =>
                      onChange(index, "fieldOfStudy", e.target.value)
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
                    value={data.professionalLicensureExamination}
                    onChange={(e) =>
                      onChange(
                        index,
                        "professionalLicensureExamination",
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
                    value={data.startYear}
                    onChange={(e) =>
                      onChange(index, "startYear", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={data.completionYear}
                    onChange={(e) =>
                      onChange(index, "completionYear", e.target.value)
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
                    onClick={
                      () =>
                        sibling.isEditing
                          ? handleSaveOrUpdate(index) // Save on check
                          : onChange(index, "isEditing", true) // Enable editing
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
