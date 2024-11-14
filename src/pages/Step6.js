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

const Step6 = () => {
  const [spouses, setSpouses] = useState([
    {
        relationshipType: "Spouse",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      contactNumber: "",
      employmentType: "",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true,
    },
  ]);

  const handleAddSpouse = () => {
    setSpouses([
      ...spouses,
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
        employmentType: "",
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        institution: "",
        professionalLicensureExamination: "",
        isEditing: true,
      },
    ]);
  };

  const toggleEditSpouse = (index) => {
    const updatedSpouses = [...spouses];
    updatedSpouses[index].isEditing = !updatedSpouses[index].isEditing;
    setSpouses(updatedSpouses);
  };

  const handleSpouseChange = (index, field, value) => {
    const updatedSpouses = spouses.map((spouse, i) =>
      i === index ? { ...spouse, [field]: value } : spouse
    );
    setSpouses(updatedSpouses);
  };

  const handleDeleteSpouse = (index) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  return (
    <VStack align="start" spacing={4} w="100%" mb={8}>
      <Text fontWeight="bold" fontSize="lg" mb={2}>
        Spouse Information:
      </Text>
      {spouses.map((spouse, index) => (
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
            <Text fontWeight="bold">Spouse #{index + 1}</Text>
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleDeleteSpouse(index)}
            />
          </HStack>
          <Grid templateColumns="repeat(4, 1fr)" gap={4} w="100%">
            {/* Basic Information */}
            <GridItem colSpan={1}>
              <Input
                placeholder="Given Name"
                value={spouse.givenName}
                onChange={(e) => handleSpouseChange(index, "givenName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Middle Name"
                value={spouse.middleName}
                onChange={(e) => handleSpouseChange(index, "middleName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Last Name"
                value={spouse.lastName}
                onChange={(e) => handleSpouseChange(index, "lastName", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Suffix"
                value={spouse.suffix}
                onChange={(e) => handleSpouseChange(index, "suffix", e.target.value)}
              />
            </GridItem>

            {/* Additional Information */}
            <GridItem colSpan={1}>
              <Select
                placeholder="Gender"
                value={spouse.gender}
                onChange={(e) => handleSpouseChange(index, "gender", e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
              </Select>
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Blood Type"
                value={spouse.bloodType}
                onChange={(e) => handleSpouseChange(index, "bloodType", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Select
                placeholder="Civil Status"
                value={spouse.civilStatus}
                onChange={(e) => handleSpouseChange(index, "civilStatus", e.target.value)}
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
                value={spouse.dateOfBirth}
                onChange={(e) => handleSpouseChange(index, "dateOfBirth", e.target.value)}
              />
            </GridItem>

            {/* Educational Information */}
            <GridItem colSpan={1}>
              <Input
                placeholder="Education Level"
                value={spouse.educationLevel}
                onChange={(e) => handleSpouseChange(index, "educationLevel", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Start Year"
                type="number"
                value={spouse.startYear}
                onChange={(e) => handleSpouseChange(index, "startYear", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Completion Year"
                type="number"
                value={spouse.completionYear}
                onChange={(e) => handleSpouseChange(index, "completionYear", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="School"
                value={spouse.school}
                onChange={(e) => handleSpouseChange(index, "school", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Field of Study"
                value={spouse.fieldOfStudy}
                onChange={(e) => handleSpouseChange(index, "fieldOfStudy", e.target.value)}
              />
            </GridItem>

            {/* Employment Information */}
            <GridItem colSpan={1}>
              <Select
                placeholder="Employment Type"
                value={spouse.employmentType}
                onChange={(e) => handleSpouseChange(index, "employmentType", e.target.value)}
              >
                <option>Self-employed</option>
                <option>Employed</option>
                <option>Government</option>
                <option>Private</option>
              </Select>
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Company"
                value={spouse.company}
                onChange={(e) => handleSpouseChange(index, "company", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Position"
                value={spouse.position}
                onChange={(e) => handleSpouseChange(index, "position", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Start Date"
                type="date"
                value={spouse.startDate}
                onChange={(e) => handleSpouseChange(index, "startDate", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="End Date"
                type="date"
                value={spouse.endDate}
                onChange={(e) => handleSpouseChange(index, "endDate", e.target.value)}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <Input
                placeholder="Reason for Leaving"
                value={spouse.reasonForLeaving}
                onChange={(e) => handleSpouseChange(index, "reasonForLeaving", e.target.value)}
              />
            </GridItem>
          </Grid>
          <HStack spacing={2} mt={4}>
            {spouse.isEditing ? (
              <IconButton
                icon={<CheckIcon />}
                colorScheme="green"
                onClick={() => toggleEditSpouse(index)}
              />
            ) : (
              <IconButton
                icon={<EditIcon />}
                colorScheme="blue"
                onClick={() => toggleEditSpouse(index)}
              />
            )}
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleDeleteSpouse(index)}
            />
          </HStack>
        </VStack>
      ))}

      {/* Conditional add spouse button */}
      {spouses.length > 0 && spouses[spouses.length - 1]?.status === "Deceased" && (
        <Button onClick={handleAddSpouse} colorScheme="teal" mt={4}>
          Add Spouse
        </Button>
      )}
    </VStack>
  );
};

export default Step6;
