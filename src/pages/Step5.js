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
  citizenships,
  nationalities,}) => {

  
  const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const suffixOptions = ["No Suffix", "Jr.", "Sr.", "II", "III", "IV", "V", "VI"];

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
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Handle input change
  const handleParentChange = (index, field, value) => {
    const updatedParents = parents.map((parent, i) =>
      i === index ? { ...parent, [field]: value } : parent
    );
    setParents(updatedParents);
  };

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
            {parents.map((parent, index) => (
              <Tab key={index}>{parent.relationshipType}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {parents.map((parent, index) => (
              <TabPanel key={index}>
                <Table size="md" variant="simple">
                  <Tbody>
                    {/* Header */}
                    <Tr>
                      <Td colSpan={4} fontWeight="bold" fontSize="md">
                        {parent.relationshipType}
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
                          value={parent.givenName}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "givenName",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Middle Name"
                          value={parent.middleName}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "middleName",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Last Name"
                          value={parent.lastName}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "lastName",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                
                      <Select
                        name="suffix"
                        value={parent.suffix}
                        onChange={handleParentChange}
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
                            handleParentChange(
                              index,
                              "dateOfBirth",
                              e.target.value
                            )
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
                          placeholder="Select Blood Type"
                          name="bloodtype"
                          value={parent.bloodtype}
                          onChange={(e) =>
                            handleParentChange(
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
                          value={parent.civilStatus}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "civilStatus",
                              e.target.value
                            )
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
                placeholder="Select Citizenship"
                name="citizenship"
                value={parent.citizenship}
                onChange={(e) =>
                  handleParentChange({
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
                        value={parent.nationality}
                        onChange={(e) =>
                          handleParentChange({
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
                            handleParentChange(
                              index,
                              "livelihood",
                              e.target.value
                            )
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
                            handleParentChange(
                              index,
                              "districtId",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
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
                          value={parent.ministerOfficiated}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "ministerOfficiated",
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
                            handleParentChange(
                              index,
                              "position",
                              e.target.value
                            )
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
                    <Tr>
                      <Td>
                        <Input
                          placeholder="Department"
                          value={parent.department}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "department",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Section"
                          value={parent.section}
                          onChange={(e) =>
                            handleParentChange(index, "section", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Start Date"
                          type="date"
                          value={parent.startDate}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="End Date"
                          type="date"
                          value={parent.endDate}
                          onChange={(e) =>
                            handleParentChange(index, "endDate", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Input
                          placeholder="Reason for Leaving"
                          value={parent.reasonForLeaving}
                          onChange={(e) =>
                            handleParentChange(
                              index,
                              "reasonForLeaving",
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
                            handleParentChange(
                              index,
                              "institution",
                              e.target.value
                            )
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
                            handleParentChange(
                              index,
                              "startYear",
                              e.target.value
                            )
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
