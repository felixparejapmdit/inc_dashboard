// src/pages/Step3.js
import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  IconButton,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step3 = ({ personnelId }) => {
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const toast = useToast();

  // Validation Function
  const validateEducation = (edu) => {
    return (
      edu.level &&
      edu.startFrom &&
      edu.completionYear &&
      edu.school &&
      edu.fieldOfStudy &&
      edu.degree &&
      edu.institution
    );
  };

  const validateWorkExperience = (work) => {
    return (
      work.employmentType &&
      work.company &&
      work.position &&
      work.department &&
      work.startDate
    );
  };

  // Save Education to Database
  // Save Education to Database
  const saveEducationToDatabase = async (edu) => {
    console.log("Saving Education:", edu); // Debugging log
    console.log("Personnel ID:", personnelId); // Debugging log for personnel ID

    try {
      const response = await axios.post(
        `${API_URL}/api/educational-backgrounds`,
        {
          personnel_id: personnelId,
          level: edu.level,
          startfrom: edu.startFrom,
          completion_year: edu.completionYear,
          school: edu.school,
          field_of_study: edu.fieldOfStudy,
          degree: edu.degree,
          institution: edu.institution,
          professional_licensure_examination: edu.professionalLicensure,
        }
      );

      console.log("Response:", response.data); // Debugging log
      toast({
        title: "Educational Background Saved",
        description: "Entry has been saved to the database.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving education:", error.response || error.message);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save educational background.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Save Work Experience to Database
  const saveWorkExperienceToDatabase = async (work) => {
    try {
      await axios.post(`${API_URL}/api/work-experiences`, {
        personnel_id: personnelId,
        employment_type: work.employmentType,
        company: work.company,
        address: work.address,
        position: work.position,
        department: work.department,
        section: work.section,
        start_date: work.startDate,
        end_date: work.endDate,
        reason_for_leaving: work.reasonForLeaving,
      });
      toast({
        title: "Work Experience Saved",
        description: "Entry has been saved to the database.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast({
        title: "Error",
        description: "Failed to save work experience.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add new entry handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        level: "",
        startFrom: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensure: "",
        isEditing: true,
      },
    ]);
  };

  const handleAddWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        employmentType: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        isEditing: true,
      },
    ]);
  };

  // Save handlers for education and work experience
  const handleSaveEducation = (index) => {
    const edu = education[index];
    console.log("Education Entry to Save:", edu); // Debugging log

    if (!validateEducation(edu)) {
      toast({
        title: "Validation Error",
        description: "All fields are required for Educational Background.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    saveEducationToDatabase(edu); // Save to database
    const updatedEducation = [...education];
    updatedEducation[index].isEditing = false;
    setEducation(updatedEducation);
  };

  const handleSaveWorkExperience = (index) => {
    const work = workExperience[index];
    if (!validateWorkExperience(work)) {
      toast({
        title: "Validation Error",
        description: "All required fields must be filled for Work Experience.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    saveWorkExperienceToDatabase(work); // Save to database
    const updatedExperience = [...workExperience];
    updatedExperience[index].isEditing = false;
    setWorkExperience(updatedExperience);
  };

  // Delete handlers
  const handleDeleteEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
    toast({
      title: "Deleted Successfully",
      description: "Education entry has been removed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteWorkExperience = (index) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
    toast({
      title: "Deleted Successfully",
      description: "Work Experience entry has been removed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Edit and save entry handlers
  const toggleEditEducation = (index) => {
    const updatedEducation = [...education];
    updatedEducation[index].isEditing = !updatedEducation[index].isEditing;
    setEducation(updatedEducation);
  };

  const toggleEditWorkExperience = (index) => {
    const updatedExperience = [...workExperience];
    updatedExperience[index].isEditing = !updatedExperience[index].isEditing;
    setWorkExperience(updatedExperience);
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={5} my={85}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 4: Educational Background & Work Experience
      </Heading>

      <VStack align="start" spacing={4} w="100%">
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          Educational Background:
        </Text>
        {education.map((edu, index) => (
          <Box
            key={index}
            bg="gray.50"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            mb={4}
            width="100%"
          >
            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">Level</Text>
                {edu.isEditing ? (
                  <Select
                    placeholder="Select Level"
                    value={edu.level}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].level = e.target.value;
                        return updated;
                      })
                    }
                  >
                    <option>Elementary</option>
                    <option>Secondary</option>
                    <option>Senior High School</option>
                    <option>College Graduate</option>
                    <option>Undergrad</option>
                  </Select>
                ) : (
                  <Text>{edu.level}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Start From</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={edu.startFrom}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].startFrom = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.startFrom}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Completion Year</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={edu.completionYear}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].completionYear = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.completionYear}</Text>
                )}
              </Box>
            </HStack>

            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">School</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="School"
                    value={edu.school}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].school = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.school}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Field of Study</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].fieldOfStudy = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.fieldOfStudy}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Degree</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].degree = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.degree}</Text>
                )}
              </Box>
            </HStack>

            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">Institution</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].institution = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.institution}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Professional Licensure</Text>
                {edu.isEditing ? (
                  <Input
                    placeholder="Professional Licensure"
                    value={edu.professionalLicensure}
                    onChange={(e) =>
                      setEducation((prev) => {
                        const updated = [...prev];
                        updated[index].professionalLicensure = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{edu.professionalLicensure}</Text>
                )}
              </Box>
              <HStack>
                {edu.isEditing ? (
                  <IconButton
                    icon={<CheckIcon />}
                    onClick={() => handleSaveEducation(index)}
                    colorScheme="green"
                  />
                ) : (
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => toggleEditEducation(index)}
                  />
                )}
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDeleteEducation(index)}
                  colorScheme="red"
                />
              </HStack>
            </HStack>
          </Box>
        ))}
        <Button onClick={handleAddEducation} colorScheme="teal">
          Add Education
        </Button>
      </VStack>

      <VStack align="start" spacing={4} w="100%">
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          Work Experience:
        </Text>
        {workExperience.map((work, index) => (
          <Box
            key={index}
            bg="gray.50"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            mb={4}
            width="100%"
          >
            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">Employment Type</Text>
                {work.isEditing ? (
                  <Select
                    placeholder="Select Type"
                    value={work.employmentType}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].employmentType = e.target.value;
                        return updated;
                      })
                    }
                  >
                    <option>Self-employed</option>
                    <option>Employed</option>
                    <option>Government</option>
                    <option>Private</option>
                  </Select>
                ) : (
                  <Text>{work.employmentType}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Company</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Company"
                    value={work.company}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].company = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.company}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Address</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Address"
                    value={work.address}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].address = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.address}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Position</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Position"
                    value={work.position}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].position = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.position}</Text>
                )}
              </Box>
            </HStack>

            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">Department</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Department"
                    value={work.department}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].department = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.department}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Section</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Section"
                    value={work.section}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].section = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.section}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">Start Date</Text>
                {work.isEditing ? (
                  <Input
                    type="date"
                    value={work.startDate}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].startDate = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.startDate}</Text>
                )}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold">End Date</Text>
                {work.isEditing ? (
                  <Input
                    type="date"
                    value={work.endDate}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].endDate = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.endDate}</Text>
                )}
              </Box>
            </HStack>

            <HStack spacing={4} mb={4} w="100%">
              <Box flex="1">
                <Text fontWeight="bold">Reason for Leaving</Text>
                {work.isEditing ? (
                  <Input
                    placeholder="Reason for Leaving"
                    value={work.reasonForLeaving}
                    onChange={(e) =>
                      setWorkExperience((prev) => {
                        const updated = [...prev];
                        updated[index].reasonForLeaving = e.target.value;
                        return updated;
                      })
                    }
                  />
                ) : (
                  <Text>{work.reasonForLeaving}</Text>
                )}
              </Box>
              <HStack>
                {work.isEditing ? (
                  <IconButton
                    icon={<CheckIcon />}
                    onClick={() => handleSaveWorkExperience(index)}
                    colorScheme="green"
                  />
                ) : (
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => toggleEditWorkExperience(index)}
                  />
                )}
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDeleteWorkExperience(index)}
                  colorScheme="red"
                />
              </HStack>
            </HStack>
          </Box>
        ))}
        <Button onClick={handleAddWorkExperience} colorScheme="teal">
          Add Work Experience
        </Button>
      </VStack>
    </Box>
  );
};

export default Step3;
