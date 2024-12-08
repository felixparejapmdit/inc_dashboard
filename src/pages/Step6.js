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
  citizenships,
  nationalities,}) => {
  
  const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  
  const suffixOptions = ["No Suffix", "Jr.", "Sr.", "II", "III", "IV", "V", "VI"];
  const [siblings, setSiblings] = useState([
    {
      relationshipType: "Sibling",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      dateOfMarriage: "",
      placeOfMarriage: "",
      citizenship: "",
      nationality: "",
      contactNumber: "",
      churchDuties: "",
      livelihood: "",
      localCongregation: "",
      districtId: "",
      ministerOfficiated: "",
      employmentType: "",
      company: "",
      address: "",
      position: "",
      department: "",
      section: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true, // Default is true for editable fields on load
    },
  ]);

  const handleAddSibling = () => {
    setSiblings([
      ...siblings,
      {
        relationshipType: "Sibling",
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        dateOfMarriage: "",
        placeOfMarriage: "",
        citizenship: "",
        nationality: "",
        contactNumber: "",
        churchDuties: "",
        livelihood: "",
        localCongregation: "",
        districtId: "",
        ministerOfficiated: "",
        employmentType: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensureExamination: "",
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

  const toggleEditSibling = (index) => {
    const updatedSiblings = [...siblings];
    updatedSiblings[index].isEditing = !updatedSiblings[index].isEditing;
    setSiblings(updatedSiblings);
  };

  const handleSiblingChange = (index, field, value) => {
    const updatedSiblings = siblings.map((sibling, i) =>
      i === index ? { ...sibling, [field]: value } : sibling
    );
    setSiblings(updatedSiblings);
  };

  const handleDeleteSibling = (index) => {
    setSiblings(siblings.filter((_, i) => i !== index));
    toast({
      title: "Sibling Deleted",
      description: `Sibling ${index + 1} removed.`,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };
  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const sibling = siblings[index];
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
      personnel_id: siblingsData.personnel_id || 8,
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
        return;
      }
    }

    try {
      if (id) {
        // Update existing siblings record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        const updatedsiblings = response.data;

        setSiblings((prev) =>
          prev.map((item, i) =>
            i === index ? { ...updatedsiblings, isEditing: false } : item
          )
        );

        toast({
          title: "siblings Information Updated",
          description: `${relationshipType} information has been updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save new siblings record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        const savedsiblings = response.data;

        setSiblings((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, id: savedsiblings.id, isEditing: false }
              : item
          )
        );

        toast({
          title: "siblings Information Saved",
          description: `${relationshipType} information has been saved successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(
        "Error saving/updating siblings information:",
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
      setLoading(false);
    }
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 6: Siblings Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {siblings.map((sibling, index) => (
          <Table
            key={sibling.id || sibling.generatedId}
            size="md"
            variant="simple"
          >
            <Tbody>
              {/* Header */}
              <Tr>
                <Td colSpan={4} fontWeight="bold" fontSize="md">
                  {siblings.relationshipType}
                </Td>
              </Tr>

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
                    value={siblings.gender}
                    onChange={(e) =>
                      handleSiblingChange(index, "gender", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Given Name"
                    value={siblings.givenName}
                    onChange={(e) =>
                      handleSiblingChange(index, "givenName", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={siblings.middleName}
                    onChange={(e) =>
                      handleSiblingChange(index, "middleName", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Last Name"
                    value={siblings.lastName}
                    onChange={(e) =>
                      handleSiblingChange(index, "lastName", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>

              </Tr>
              <Tr>
                
              <Td>
  <Select
    name="suffix"
    value={siblings[index]?.suffix || ""}
    onChange={(e) =>
      handleSiblingChange(index, "suffix", e.target.value)
    }
    width="100%"
    isDisabled={siblings[index]?.gender === "Female"}
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
                    value={siblings.dateOfBirth}
                    onChange={(e) =>
                      handleSiblingChange(index, "dateOfBirth", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={siblings.contactNumber}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "contactNumber",
                        e.target.value
                      )
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                          placeholder="Select Blood Type"
                          name="bloodtype"
                          value={siblings.bloodtype}
                          onChange={(e) =>
                            handleSiblingChange(
                              index,
                              "bloodType",
                              e.target.value
                            )
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
                  <Input
                    placeholder="Civil Status"
                    value={siblings.civilStatus}
                    onChange={(e) =>
                      handleSiblingChange(index, "civilStatus", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Place of Marriage"
                    value={siblings.placeOfMarriage}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "placeOfMarriage",
                        e.target.value
                      )
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                        <Select
                placeholder="Select Citizenship"
                name="citizenship"
                value={siblings.citizenship}
                onChange={(e) =>
                  handleSiblingChange({
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
                      <Td>
                      <Select
                        placeholder="Select Nationality"
                        name="nationality"
                        value={siblings.nationality}
                        onChange={(e) =>
                          handleSiblingChange({
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

              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Church Duties"
                    value={siblings.churchDuties}
                    onChange={(e) =>
                      handleSiblingChange(index, "churchDuties", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Livelihood"
                    value={siblings.livelihood}
                    onChange={(e) =>
                      handleSiblingChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Local Congregation"
                    value={siblings.localCongregation}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "localCongregation",
                        e.target.value
                      )
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="District ID"
                    value={siblings.districtId}
                    onChange={(e) =>
                      handleSiblingChange(index, "districtId", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    <option>District 1</option>
                    <option>District 2</option>
                    <option>District 3</option>
                  </Select>
                </Td>
              </Tr>

              <Tr>
                <Td>
                  <Input
                    placeholder="Minister Officiated"
                    value={siblings.ministerOfficiated}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "ministerOfficiated",
                        e.target.value
                      )
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
                    value={siblings.employmentType}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "employmentType",
                        e.target.value
                      )
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    <option>Self-employed</option>
                    <option>Employed</option>
                    <option>Government</option>
                    <option>Private</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Company"
                    value={siblings.company}
                    onChange={(e) =>
                      handleSiblingChange(index, "company", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Position"
                    value={siblings.position}
                    onChange={(e) =>
                      handleSiblingChange(index, "position", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Address"
                    value={siblings.address}
                    onChange={(e) =>
                      handleSiblingChange(index, "address", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Department"
                    value={siblings.department}
                    onChange={(e) =>
                      handleSiblingChange(index, "department", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Section"
                    value={siblings.section}
                    onChange={(e) =>
                      handleSiblingChange(index, "section", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={siblings.startDate}
                    onChange={(e) =>
                      handleSiblingChange(index, "startDate", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={siblings.endDate}
                    onChange={(e) =>
                      handleSiblingChange(index, "endDate", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={siblings.reasonForLeaving}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "reasonForLeaving",
                        e.target.value
                      )
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
                    value={siblings.educationLevel}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "educationLevel",
                        e.target.value
                      )
                    }
                    isDisabled={!sibling.isEditing}
                  >
                    <option>Elementary</option>
                    <option>Secondary</option>
                    <option>Senior High School</option>
                    <option>College</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="School"
                    value={siblings.school}
                    onChange={(e) =>
                      handleSiblingChange(index, "school", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Field of Study"
                    value={siblings.fieldOfStudy}
                    onChange={(e) =>
                      handleSiblingChange(index, "fieldOfStudy", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Degree"
                    value={siblings.degree}
                    onChange={(e) =>
                      handleSiblingChange(index, "degree", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Institution"
                    value={siblings.institution}
                    onChange={(e) =>
                      handleSiblingChange(index, "institution", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Professional Licensure"
                    value={siblings.professionalLicensureExamination}
                    onChange={(e) =>
                      handleSiblingChange(
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
                    value={siblings.startYear}
                    onChange={(e) =>
                      handleSiblingChange(index, "startYear", e.target.value)
                    }
                    isDisabled={!sibling.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={siblings.completionYear}
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "completionYear",
                        e.target.value
                      )
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
                          : handleSiblingChange(index, "isEditing", true) // Enable editing
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
