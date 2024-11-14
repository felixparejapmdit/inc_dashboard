import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  IconButton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";

const Step7 = () => {
  const [children, setChildren] = useState([
    {
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      contactNumber: "",
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

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        contactNumber: "",
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

  const toggleEditChild = (index) => {
    const updatedChildren = [...children];
    updatedChildren[index].isEditing = !updatedChildren[index].isEditing;
    setChildren(updatedChildren);
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = children.map((child, i) =>
      i === index ? { ...child, [field]: value } : child
    );
    setChildren(updatedChildren);
  };

  const handleDeleteChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  return (
    <VStack align="start" spacing={4} w="100%" mb={8}>
      <Text fontWeight="bold" fontSize="lg" mb={2}>
        Children Information:
      </Text>
      {children.map((child, index) => (
        <VStack
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          w="100%"
          bg="gray.50"
          spacing={4}
        >
          <HStack w="100%" justify="space-between">
            <Text fontWeight="bold">Child #{index + 1}</Text>
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleDeleteChild(index)}
            />
          </HStack>
          <Grid templateColumns="repeat(4, 1fr)" gap={4} w="100%">
            {/* Basic Information */}
            <GridItem colSpan={1}>
              <Input
                placeholder="Given Name"
                value={child.givenName}
                onChange={(e) => handleChildChange(index, "givenName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Middle Name"
                value={child.middleName}
                onChange={(e) => handleChildChange(index, "middleName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Last Name"
                value={child.lastName}
                onChange={(e) => handleChildChange(index, "lastName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Suffix"
                value={child.suffix}
                onChange={(e) => handleChildChange(index, "suffix", e.target.value)}
              />
            </GridItem>

            {/* Additional Information */}
            <GridItem colSpan={1}>
              <Select
                placeholder="Gender"
                value={child.gender}
                onChange={(e) => handleChildChange(index, "gender", e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
              </Select>
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Blood Type"
                value={child.bloodType}
                onChange={(e) => handleChildChange(index, "bloodType", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Select
                placeholder="Civil Status"
                value={child.civilStatus}
                onChange={(e) => handleChildChange(index, "civilStatus", e.target.value)}
              >
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Divorced</option>
              </Select>
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Date of Birth"
                type="date"
                value={child.dateOfBirth}
                onChange={(e) => handleChildChange(index, "dateOfBirth", e.target.value)}
              />
            </GridItem>

            {/* Educational Information */}
            <GridItem colSpan={1}>
              <Input
                placeholder="Education Level"
                value={child.educationLevel}
                onChange={(e) => handleChildChange(index, "educationLevel", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Start Year"
                type="number"
                value={child.startYear}
                onChange={(e) => handleChildChange(index, "startYear", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Completion Year"
                type="number"
                value={child.completionYear}
                onChange={(e) => handleChildChange(index, "completionYear", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="School"
                value={child.school}
                onChange={(e) => handleChildChange(index, "school", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Field of Study"
                value={child.fieldOfStudy}
                onChange={(e) => handleChildChange(index, "fieldOfStudy", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Degree"
                value={child.degree}
                onChange={(e) => handleChildChange(index, "degree", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Institution"
                value={child.institution}
                onChange={(e) => handleChildChange(index, "institution", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Professional Licensure Examination"
                value={child.professionalLicensureExamination}
                onChange={(e) => handleChildChange(index, "professionalLicensureExamination", e.target.value)}
              />
            </GridItem>
          </Grid>
          <HStack spacing={2} mt={4}>
            {child.isEditing ? (
              <IconButton
                icon={<CheckIcon />}
                colorScheme="green"
                onClick={() => toggleEditChild(index)}
              />
            ) : (
              <IconButton
                icon={<EditIcon />}
                colorScheme="blue"
                onClick={() => toggleEditChild(index)}
              />
            )}
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleDeleteChild(index)}
            />
          </HStack>
        </VStack>
      ))}

      {/* Always visible add child button */}
      <Button onClick={handleAddChild} colorScheme="teal" mt={4}>
        Add Child
      </Button>
    </VStack>
  );
};

export default Step7;
