// src/pages/Step5.js
import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
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

const Step5 = () => {
  const [parents, setParents] = useState([
    {
      relationshipType: "Father",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Male",
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
      isEditing: true,
    },
    {
      relationshipType: "Mother",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Female",
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
      isEditing: true,
    },
  ]);

  const toggleEditParent = (index) => {
    const updatedParents = [...parents];
    updatedParents[index].isEditing = !updatedParents[index].isEditing;
    setParents(updatedParents);
  };

  const toast = useToast();

  // Handle input change
  const handleParentChange = (index, field, value) => {
    const updatedParents = parents.map((parent, i) =>
      i === index ? { ...parent, [field]: value } : parent
    );
    setParents(updatedParents);
  };

  const handleSaveOrUpdate = async (index) => {
    const parent = parents[index];
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
      lastname: lastName, // Ensure lastname is sent
      gender: gender, // Ensure gender is sent
      relationship_type: relationshipType,
      personnel_id: parentData.personnel_id || 8,
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
        // Update existing parent record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        const updatedParent = response.data;

        setParents((prev) =>
          prev.map((item, i) =>
            i === index ? { ...updatedParent, isEditing: false } : item
          )
        );

        toast({
          title: "Parent Information Updated",
          description: `${relationshipType} information has been updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save new parent record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        const savedParent = response.data;

        setParents((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, id: savedParent.id, isEditing: false }
              : item
          )
        );

        toast({
          title: "Parent Information Saved",
          description: `${relationshipType} information has been saved successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(
        "Error saving/updating parent information:",
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
    }
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 5: Parents Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        <Table variant="striped" colorScheme="gray" size="md">
          <Tbody>
            {parents.map((parent, index) => (
              <React.Fragment key={index}>
                {/* Header */}
                <Tr>
                  <Td colSpan={4} fontWeight="bold" fontSize="md">
                    {parent.relationshipType}
                  </Td>
                </Tr>

                {/* Personal Information */}
                <Tr>
                  <Td colSpan={4} fontWeight="bold">
                    Personal Information
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Input
                      placeholder="Given Name"
                      value={parent.givenName}
                      onChange={(e) =>
                        handleParentChange(index, "givenName", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Middle Name"
                      value={parent.middleName}
                      onChange={(e) =>
                        handleParentChange(index, "middleName", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Last Name"
                      value={parent.lastName}
                      onChange={(e) =>
                        handleParentChange(index, "lastName", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Suffix"
                      value={parent.suffix}
                      onChange={(e) =>
                        handleParentChange(index, "suffix", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Select
                      placeholder="Gender"
                      value={parent.gender}
                      onChange={(e) =>
                        handleParentChange(index, "gender", e.target.value)
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
                      value={parent.dateOfBirth}
                      onChange={(e) =>
                        handleParentChange(index, "dateOfBirth", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Contact Number"
                      value={parent.contactNumber}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "contactNumber",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Select
                      placeholder="Blood Type"
                      value={parent.bloodType}
                      onChange={(e) =>
                        handleParentChange(index, "bloodType", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    >
                      <option>A</option>
                      <option>B</option>
                      <option>AB</option>
                      <option>O</option>
                    </Select>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Input
                      placeholder="Civil Status"
                      value={parent.civilStatus}
                      onChange={(e) =>
                        handleParentChange(index, "civilStatus", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Place of Marriage"
                      value={parent.placeOfMarriage}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "placeOfMarriage",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Select
                      placeholder="Citizenship"
                      value={parent.citizenship}
                      onChange={(e) =>
                        handleParentChange(index, "citizenship", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    >
                      <option>Filipino</option>
                      <option>Other</option>
                    </Select>
                  </Td>
                  <Td>
                    <Input
                      placeholder="Nationality"
                      value={parent.nationality}
                      onChange={(e) =>
                        handleParentChange(index, "nationality", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Input
                      placeholder="Church Duties"
                      value={parent.churchDuties}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "churchDuties",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Livelihood"
                      value={parent.livelihood}
                      onChange={(e) =>
                        handleParentChange(index, "livelihood", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Local Congregation"
                      value={parent.localCongregation}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "localCongregation",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Select
                      placeholder="District ID"
                      value={parent.districtId}
                      onChange={(e) =>
                        handleParentChange(index, "districtId", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    >
                      <option>District 1</option>
                      <option>District 2</option>
                      <option>District 3</option>
                    </Select>
                  </Td>
                </Tr>

                {/* Work Information */}
                <Tr>
                  <Td colSpan={4} fontWeight="bold">
                    Work Information
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Select
                      placeholder="Employment Type"
                      value={parent.employmentType}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "employmentType",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
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
                      value={parent.company}
                      onChange={(e) =>
                        handleParentChange(index, "company", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Position"
                      value={parent.position}
                      onChange={(e) =>
                        handleParentChange(index, "position", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Address"
                      value={parent.address}
                      onChange={(e) =>
                        handleParentChange(index, "address", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                </Tr>

                {/* Education Information */}
                <Tr>
                  <Td colSpan={4} fontWeight="bold">
                    Educational Information
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Select
                      placeholder="Education Level"
                      value={parent.educationLevel}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "educationLevel",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
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
                      value={parent.school}
                      onChange={(e) =>
                        handleParentChange(index, "school", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Field of Study"
                      value={parent.fieldOfStudy}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "fieldOfStudy",
                          e.target.value
                        )
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Degree"
                      value={parent.degree}
                      onChange={(e) =>
                        handleParentChange(index, "degree", e.target.value)
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
                        handleParentChange(index, "institution", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Professional Licensure"
                      value={parent.professionalLicensureExamination}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "professionalLicensureExamination",
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
                      value={parent.startYear}
                      onChange={(e) =>
                        handleParentChange(index, "startYear", e.target.value)
                      }
                      isDisabled={!parent.isEditing}
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Completion Year"
                      type="number"
                      value={parent.completionYear}
                      onChange={(e) =>
                        handleParentChange(
                          index,
                          "completionYear",
                          e.target.value
                        )
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
                          : handleParentChange(index, "isEditing", true)
                      }
                      colorScheme={parent.isEditing ? "green" : "blue"}
                    />
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default Step5;
