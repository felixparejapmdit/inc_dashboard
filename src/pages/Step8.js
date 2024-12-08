// src/pages/Step8.js
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
import { Children } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Step8 = ({
  citizenships,
  nationalities,}) => {
  
  const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  
  const suffixOptions = ["No Suffix", "Jr.", "Sr.", "II", "III", "IV", "V", "VI"];
  const [children, setChildren] = useState([
    {
      relationshipType: "Child",
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
      isEditing: true, // Default is true for editable fields on load
    },
  ]);

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        relationshipType: "Child",
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
        isEditing: true, // Default to true for new child
      },
    ]);
    toast({
      title: "Child Added",
      description: "A new child has been added.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const toggleEditChildren = (index) => {
    const updatedchild = [...children];
    updatedchild[index].isEditing = !updatedchild[index].isEditing;
    setChildren(updatedchild);
  };

  const handleChildChange = (index, field, value) => {
    const updatedchild = children.map((child, i) =>
      i === index ? { ...child, [field]: value } : child
    );
    setChildren(updatedchild);
  };

  const handleDeleteChildren = (index) => {
    setChildren(children.filter((_, i) => i !== index));
    toast({
      title: "Child Deleted",
      description: `Child ${index + 1} removed.`,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };
  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const child = children[index];
    const {
      id,
      isEditing,
      relationshipType,
      givenName,
      lastName,
      gender,
      ...childData
    } = child;

    // Map frontend fields to backend fields
    const formattedData = {
      ...childData,
      givenname: givenName,
      lastname: lastName, // Ensure lastname is sent
      gender: gender, // Ensure gender is sent
      relationship_type: relationshipType,
      personnel_id: childData.personnel_id || 8,
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
        // Update existing child record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        const updatedchild = response.data;

        setChildren((prev) =>
          prev.map((item, i) =>
            i === index ? { ...updatedchild, isEditing: false } : item
          )
        );

        toast({
          title: "child Information Updated",
          description: `${relationshipType} information has been updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save new child record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        const savedchild = response.data;

        setChildren((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, id: savedchild.id, isEditing: false }
              : item
          )
        );

        toast({
          title: "child Information Saved",
          description: `${relationshipType} information has been saved successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving/updating child information:", error.response);
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
        Step 8: Child Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {children.map((child, index) => (
          <Table key={child.id || child.generatedId} size="md" variant="simple">
            <Tbody>
              {/* Header */}
              <Tr>
                <Td colSpan={4} fontWeight="bold" fontSize="md">
                  {children.relationshipType}
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
                  <Input
                    placeholder="Given Name"
                    value={children.givenName}
                    onChange={(e) =>
                      handleChildChange(index, "givenName", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={child.middleName}
                    onChange={(e) =>
                      handleChildChange(index, "middleName", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Last Name"
                    value={child.lastName}
                    onChange={(e) =>
                      handleChildChange(index, "lastName", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                    <Select
                      name="suffix"
                      value={child.suffix}
                      onChange={handleChildChange}
                      width="100%"
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
                    placeholder="Gender"
                    value={child.gender}
                    onChange={(e) =>
                      handleChildChange(index, "gender", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={child.dateOfBirth}
                    onChange={(e) =>
                      handleChildChange(index, "dateOfBirth", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={child.contactNumber}
                    onChange={(e) =>
                      handleChildChange(index, "contactNumber", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                          placeholder="Select Blood Type"
                          name="bloodtype"
                          value={child.bloodtype}
                          onChange={(e) =>
                            handleChildChange(
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
                    value={child.civilStatus}
                    onChange={(e) =>
                      handleChildChange(index, "civilStatus", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Place of Marriage"
                    value={child.placeOfMarriage}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        "placeOfMarriage",
                        e.target.value
                      )
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>

                <Td>
                        <Select
                placeholder="Select Citizenship"
                name="citizenship"
                value={child.citizenship}
                onChange={(e) =>
                  handleChildChange({
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
                        value={child.nationality}
                        onChange={(e) =>
                          handleChildChange({
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
                    value={child.churchDuties}
                    onChange={(e) =>
                      handleChildChange(index, "churchDuties", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Livelihood"
                    value={child.livelihood}
                    onChange={(e) =>
                      handleChildChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Local Congregation"
                    value={child.localCongregation}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        "localCongregation",
                        e.target.value
                      )
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="District ID"
                    value={child.districtId}
                    onChange={(e) =>
                      handleChildChange(index, "districtId", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.ministerOfficiated}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        "ministerOfficiated",
                        e.target.value
                      )
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.employmentType}
                    onChange={(e) =>
                      handleChildChange(index, "employmentType", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.company}
                    onChange={(e) =>
                      handleChildChange(index, "company", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Position"
                    value={child.position}
                    onChange={(e) =>
                      handleChildChange(index, "position", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Address"
                    value={child.address}
                    onChange={(e) =>
                      handleChildChange(index, "address", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Department"
                    value={child.department}
                    onChange={(e) =>
                      handleChildChange(index, "department", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Section"
                    value={child.section}
                    onChange={(e) =>
                      handleChildChange(index, "section", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={child.startDate}
                    onChange={(e) =>
                      handleChildChange(index, "startDate", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={child.endDate}
                    onChange={(e) =>
                      handleChildChange(index, "endDate", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={child.reasonForLeaving}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        "reasonForLeaving",
                        e.target.value
                      )
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.educationLevel}
                    onChange={(e) =>
                      handleChildChange(index, "educationLevel", e.target.value)
                    }
                    isDisabled={!child.isEditing}
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
                    value={child.school}
                    onChange={(e) =>
                      handleChildChange(index, "school", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Field of Study"
                    value={child.fieldOfStudy}
                    onChange={(e) =>
                      handleChildChange(index, "fieldOfStudy", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Degree"
                    value={child.degree}
                    onChange={(e) =>
                      handleChildChange(index, "degree", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Institution"
                    value={child.institution}
                    onChange={(e) =>
                      handleChildChange(index, "institution", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Professional Licensure"
                    value={child.professionalLicensureExamination}
                    onChange={(e) =>
                      handleChildChange(
                        index,
                        "professionalLicensureExamination",
                        e.target.value
                      )
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={child.startYear}
                    onChange={(e) =>
                      handleChildChange(index, "startYear", e.target.value)
                    }
                    isDisabled={!child.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={child.completionYear}
                    onChange={(e) =>
                      handleChildChange(index, "completionYear", e.target.value)
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
                    onClick={
                      () =>
                        child.isEditing
                          ? handleSaveOrUpdate(index) // Save on check
                          : handleChildChange(index, "isEditing", true) // Enable editing
                    }
                    colorScheme={child.isEditing ? "green" : "blue"}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        ))}
        <Button onClick={handleAddChild} colorScheme="teal">
          Add Child
        </Button>
      </VStack>
    </Box>
  );
};

export default Step8;
