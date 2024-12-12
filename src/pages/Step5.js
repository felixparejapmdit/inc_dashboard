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
  onAdd,
  onChange,
  onDelete,
  onToggleEdit,
  citizenships,
  nationalities,
  suffixOptions,
  districts,
}) => {
  const bloodtypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // const [parents, setParents] = useState([
  //   {
  //     relationshipType: "Father",
  //     givenName: "",
  //     middleName: "",
  //     lastName: "",
  //     suffix: "",
  //     gender: "Male",
  //     bloodType: "",
  //     civilStatus: "",
  //     dateOfBirth: "",
  //     dateOfMarriage: "",
  //     placeOfMarriage: "",
  //     citizenship: "",
  //     nationality: "",
  //     contactNumber: "",
  //     churchDuties: "",
  //     livelihood: "",
  //     districtId: "",
  //     localCongregation: "",
  //     ministerOfficiated: "",
  //     employmentType: "",
  //     company: "",
  //     address: "",
  //     position: "",
  //     department: "",
  //     section: "",
  //     startDate: "",
  //     endDate: "",
  //     reasonForLeaving: "",
  //     educationLevel: "",
  //     startYear: "",
  //     completionYear: "",
  //     school: "",
  //     fieldOfStudy: "",
  //     degree: "",
  //     institution: "",
  //     professionalLicensureExamination: "",
  //     isEditing: true,
  //   },
  //   {
  //     relationshipType: "Mother",
  //     givenName: "",
  //     middleName: "",
  //     lastName: "",
  //     suffix: "",
  //     gender: "Female",
  //     bloodType: "",
  //     civilStatus: "",
  //     dateOfBirth: "",
  //     dateOfMarriage: "",
  //     placeOfMarriage: "",
  //     citizenship: "",
  //     nationality: "",
  //     contactNumber: "",
  //     churchDuties: "",
  //     livelihood: "",
  //     districtId: "",
  //     localCongregation: "",
  //     ministerOfficiated: "",
  //     employmentType: "",
  //     company: "",
  //     address: "",
  //     position: "",
  //     department: "",
  //     section: "",
  //     startDate: "",
  //     endDate: "",
  //     reasonForLeaving: "",
  //     educationLevel: "",
  //     startYear: "",
  //     completionYear: "",
  //     school: "",
  //     fieldOfStudy: "",
  //     degree: "",
  //     institution: "",
  //     professionalLicensureExamination: "",
  //     isEditing: true,
  //   },
  // ]);

  // const toggleEditParent = (index) => {
  //   const updatedParents = [...parents];
  //   updatedParents[index].isEditing = !updatedParents[index].isEditing;
  //   setParents(updatedParents);
  // };

  // // Handle input change
  // const onChange = (index, field, value) => {
  //   const updatedParents = parents.map((parent, i) =>
  //     i === index ? { ...parent, [field]: value } : parent
  //   );
  //   setParents(updatedParents);
  // };

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

        onAdd((prev) =>
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

        onAdd((prev) =>
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
            {data.map((parent, index) => (
              <Tab key={index}>{parent.relationshipType}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {data.map((parent, index) => (
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
                            onChange(index, "givenName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Middle Name"
                          value={parent.middleName}
                          onChange={(e) =>
                            onChange(index, "middleName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Last Name"
                          value={parent.lastName}
                          onChange={(e) =>
                            onChange(index, "lastName", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          name="suffix"
                          value={parent.suffix}
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
                          placeholder="Gender"
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
                          value={parent.dateOfBirth}
                          onChange={(e) =>
                            onChange(index, "dateOfBirth", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Contact Number"
                          value={parent.contactNumber}
                          onChange={(e) =>
                            onChange(index, "contactNumber", e.target.value)
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
                        <Input
                          placeholder="Civil Status"
                          value={parent.civilStatus}
                          onChange={(e) =>
                            onChange(index, "civilStatus", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Place of Marriage"
                          value={parent.placeOfMarriage}
                          onChange={(e) =>
                            onChange(index, "placeOfMarriage", e.target.value)
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
                            onChange({
                              target: {
                                name: "citizenship",
                                value: e.target.value,
                              },
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
                            onChange({
                              target: {
                                name: "nationality",
                                value: e.target.value,
                              },
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
                            onChange(index, "churchDuties", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
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
                        <Input
                          placeholder="Local Congregation"
                          value={parent.localCongregation}
                          onChange={(e) =>
                            onChange(index, "localCongregation", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select District"
                          name="district_id"
                          value={parent.districtId}
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
                    </Tr>

                    <Tr>
                      <Td>
                        <Input
                          placeholder="Minister Officiated"
                          value={parent.ministerOfficiated}
                          onChange={(e) =>
                            onChange(
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
                            onChange(index, "employmentType", e.target.value)
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
                      <Td>
                        <Input
                          placeholder="Department"
                          value={parent.department}
                          onChange={(e) =>
                            onChange(index, "department", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Section"
                          value={parent.section}
                          onChange={(e) =>
                            onChange(index, "section", e.target.value)
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
                            onChange(index, "startDate", e.target.value)
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
                            onChange(index, "endDate", e.target.value)
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
                            onChange(index, "reasonForLeaving", e.target.value)
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
                            onChange(index, "educationLevel", e.target.value)
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
                            onChange(index, "school", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Input
                          placeholder="Field of Study"
                          value={parent.fieldOfStudy}
                          onChange={(e) =>
                            onChange(index, "fieldOfStudy", e.target.value)
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
                          value={parent.professionalLicensureExamination}
                          onChange={(e) =>
                            onChange(
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
                            onChange(index, "startYear", e.target.value)
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
                            onChange(index, "completionYear", e.target.value)
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
