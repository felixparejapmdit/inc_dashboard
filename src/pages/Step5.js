// src/pages/Step5.js
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
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";

const Step5 = () => {
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
      contactNumber: "",
      churchDuties: "",
      livelihood: "",
      localCongregation: "",
      districtId: "",
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
        contactNumber: "",
        churchDuties: "",
        livelihood: "",
        localCongregation: "",
        districtId: "",
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
  };

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
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 6: Siblings Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {siblings.map((sibling, index) => (
          <Box
            key={index}
            p={4}
            bg="gray.50"
            borderRadius="md"
            boxShadow="sm"
            mb={4}
            width="100%"
          >
            <HStack spacing={4} mb={3}>
              <Text fontWeight="bold">Sibling #{index + 1}</Text>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                onClick={() => handleDeleteSibling(index)}
              />
            </HStack>
            <VStack spacing={3} align="stretch">
              <HStack>
                <Select
                  placeholder="Gender"
                  value={sibling.gender}
                  onChange={(e) =>
                    handleSiblingChange(index, "gender", e.target.value)
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                </Select>
                <Input
                  placeholder="Given Name"
                  value={sibling.givenName}
                  onChange={(e) =>
                    handleSiblingChange(index, "givenName", e.target.value)
                  }
                />
                <Input
                  placeholder="Middle Name"
                  value={sibling.middleName}
                  onChange={(e) =>
                    handleSiblingChange(index, "middleName", e.target.value)
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={sibling.lastName}
                  onChange={(e) =>
                    handleSiblingChange(index, "lastName", e.target.value)
                  }
                />
                <Input
                  placeholder="Suffix"
                  value={sibling.suffix}
                  onChange={(e) =>
                    handleSiblingChange(index, "suffix", e.target.value)
                  }
                />
              </HStack>
              <HStack>
                <Select
                  placeholder="Civil Status"
                  value={sibling.civilStatus}
                  onChange={(e) =>
                    handleSiblingChange(index, "civilStatus", e.target.value)
                  }
                >
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                </Select>
                <Input
                  placeholder="Date of Birth"
                  type="date"
                  value={sibling.dateOfBirth}
                  onChange={(e) =>
                    handleSiblingChange(index, "dateOfBirth", e.target.value)
                  }
                />
                <Input
                  placeholder="Contact Number"
                  value={sibling.contactNumber}
                  onChange={(e) =>
                    handleSiblingChange(index, "contactNumber", e.target.value)
                  }
                />
              </HStack>
              <HStack>
                <Select
                  placeholder="Employment Type"
                  value={sibling.employmentType}
                  onChange={(e) =>
                    handleSiblingChange(index, "employmentType", e.target.value)
                  }
                >
                  <option>Self-employed</option>
                  <option>Employed</option>
                  <option>Government</option>
                  <option>Private</option>
                </Select>
                <Input
                  placeholder="Company"
                  value={sibling.company}
                  onChange={(e) =>
                    handleSiblingChange(index, "company", e.target.value)
                  }
                />
                <Input
                  placeholder="Position"
                  value={sibling.position}
                  onChange={(e) =>
                    handleSiblingChange(index, "position", e.target.value)
                  }
                />
              </HStack>
              <HStack>
                <Input
                  placeholder="School"
                  value={sibling.school}
                  onChange={(e) =>
                    handleSiblingChange(index, "school", e.target.value)
                  }
                />
                <Input
                  placeholder="Field of Study"
                  value={sibling.fieldOfStudy}
                  onChange={(e) =>
                    handleSiblingChange(index, "fieldOfStudy", e.target.value)
                  }
                />
                <Input
                  placeholder="Degree"
                  value={sibling.degree}
                  onChange={(e) =>
                    handleSiblingChange(index, "degree", e.target.value)
                  }
                />
              </HStack>
              <HStack>
                <Input
                  placeholder="Start Year"
                  type="number"
                  value={sibling.startYear}
                  onChange={(e) =>
                    handleSiblingChange(index, "startYear", e.target.value)
                  }
                />
                <Input
                  placeholder="Completion Year"
                  type="number"
                  value={sibling.completionYear}
                  onChange={(e) =>
                    handleSiblingChange(index, "completionYear", e.target.value)
                  }
                />
                <Input
                  placeholder="Institution"
                  value={sibling.institution}
                  onChange={(e) =>
                    handleSiblingChange(index, "institution", e.target.value)
                  }
                />
                <Input
                  placeholder="Professional Licensure Examination"
                  value={sibling.professionalLicensureExamination}
                  onChange={(e) =>
                    handleSiblingChange(
                      index,
                      "professionalLicensureExamination",
                      e.target.value
                    )
                  }
                />
              </HStack>
              <HStack>
                {sibling.isEditing ? (
                  <IconButton
                    icon={<CheckIcon />}
                    onClick={() => toggleEditSibling(index)}
                    colorScheme="green"
                    size="sm"
                  />
                ) : (
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => toggleEditSibling(index)}
                    colorScheme="blue"
                    size="sm"
                  />
                )}
              </HStack>
            </VStack>
          </Box>
        ))}
        <Button onClick={handleAddSibling} colorScheme="teal">
          Add Sibling
        </Button>
      </VStack>
    </Box>
  );
};

export default Step5;
