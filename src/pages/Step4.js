// src/pages/Step4.js
import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";

const Step4 = () => {
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

  const handleParentChange = (index, field, value) => {
    const updatedParents = parents.map((parent, i) =>
      i === index ? { ...parent, [field]: value } : parent
    );
    setParents(updatedParents);
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <VStack align="start" spacing={4} mb={8} w="100%">
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          Parents Information:
        </Text>
        <Table variant="striped" colorScheme="gray" size="md">
          <Tbody>
            {parents.map((parent, index) => (
              <React.Fragment key={index}>
                <Tr>
                  <Td colSpan={4} fontWeight="bold" fontSize="md">
                    {parent.relationshipType}
                  </Td>
                </Tr>
                {/* Basic Information */}
                <Tr>
                  <Td>
                    <Input
                      placeholder="Given Name"
                      value={parent.givenName}
                      onChange={(e) =>
                        handleParentChange(index, "givenName", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Middle Name"
                      value={parent.middleName}
                      onChange={(e) =>
                        handleParentChange(index, "middleName", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Last Name"
                      value={parent.lastName}
                      onChange={(e) =>
                        handleParentChange(index, "lastName", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Suffix"
                      value={parent.suffix}
                      onChange={(e) =>
                        handleParentChange(index, "suffix", e.target.value)
                      }
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
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </Select>
                  </Td>
                  <Td>
                    <Select
                      placeholder="Blood Type"
                      value={parent.bloodType}
                      onChange={(e) =>
                        handleParentChange(index, "bloodType", e.target.value)
                      }
                    >
                      <option>A</option>
                      <option>B</option>
                      <option>AB</option>
                      <option>O</option>
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
                    />
                  </Td>
                </Tr>
                {/* Employment Information */}
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
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Position"
                      value={parent.position}
                      onChange={(e) =>
                        handleParentChange(index, "position", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Address"
                      value={parent.address}
                      onChange={(e) =>
                        handleParentChange(index, "address", e.target.value)
                      }
                    />
                  </Td>
                </Tr>
                {/* Education Information */}
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
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Degree"
                      value={parent.degree}
                      onChange={(e) =>
                        handleParentChange(index, "degree", e.target.value)
                      }
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
                    />
                  </Td>
                  <Td colSpan={2}>
                    <HStack>
                      <IconButton
                        icon={parent.isEditing ? <CheckIcon /> : <EditIcon />}
                        onClick={() => toggleEditParent(index)}
                      />
                    </HStack>
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

export default Step4;
