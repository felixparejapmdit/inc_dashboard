import React, { useState, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  Select,
  Input,
  IconButton,
  Button,
  Text,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";

const Step4 = () => {
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const toast = useToast();

  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  const [loading, setLoading] = useState(true);

  // Fetch educational and work experience data
  useEffect(() => {
    if (!personnelId) {
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to fetch data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fetchData = async () => {
      try {
        const [educationRes, workExperienceRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/educational-backgrounds`,
            {
              params: { personnel_id: personnelId },
            }
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/api/work-experiences`, {
            params: { personnel_id: personnelId },
          }),
        ]);
        setEducation(educationRes.data || []);
        setWorkExperience(workExperienceRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description:
            "Failed to fetch educational background or work experience.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [personnelId, toast]);

  // Handle changes for educational background fields
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[index][field] = value;
    setEducation(updatedEducation);
  };

  // Handle changes for work experience fields
  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperience = [...workExperience];
    updatedWorkExperience[index][field] = value;
    setWorkExperience(updatedWorkExperience);
  };

  // Save or update educational background
  const handleSaveOrUpdateEducation = async (index) => {
    const edu = education[index];
    const payload = {
      personnel_id: personnelId,
      level: edu.level,
      startfrom: edu.startFrom,
      completion_year: edu.completion_year,
      school: edu.school,
      field_of_study: edu.field_of_study,
      degree: edu.degree,
      institution: edu.institution,
      professional_licensure_examination:
        edu.professional_licensure_examination,
    };

    try {
      if (edu.id) {
        console.log("Updating education:", edu.id, payload);
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/educational-backgrounds/${edu.id}`,
          payload
        );
        toast({
          title: "Educational background updated successfully.",
          status: "success",
          duration: 3000,
        });
      } else {
        console.log("Saving new education:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/educational-backgrounds`,
          payload
        );
        edu.id = response.data.id; // Assign new ID to the record
        toast({
          title: "Educational background saved successfully.",
          status: "success",
          duration: 3000,
        });
      }
      toggleEditEducation(index);
    } catch (error) {
      console.error("Error saving/updating education:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save or update education.",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Save or update work experience
  const handleSaveOrUpdateWorkExperience = async (index) => {
    const work = workExperience[index];
    const payload = {
      personnel_id: personnelId,
      employment_type: work.employment_type,
      company: work.company,
      address: work.address,
      position: work.position,
      department: work.department,
      section: work.section,
      start_date: work.start_date,
      end_date: work.end_date,
      reason_for_leaving: work.reason_for_leaving,
    };

    try {
      if (work.id) {
        console.log("Updating work experience:", work.id, payload);
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/work-experiences/${work.id}`,
          payload
        );
        toast({
          title: "Work experience updated successfully.",
          status: "success",
          duration: 3000,
        });
      } else {
        console.log("Saving new work experience:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/work-experiences`,
          payload
        );
        work.id = response.data.id; // Assign new ID to the record
        toast({
          title: "Work experience saved successfully.",
          status: "success",
          duration: 3000,
        });
      }
      toggleEditWorkExperience(index);
    } catch (error) {
      console.error("Error saving/updating work experience:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save or update work experience.",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Add new educational background
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        level: "",
        startFrom: "",
        completion_year: "",
        school: "",
        field_of_study: "",
        degree: "",
        institution: "",
        professional_licensure_examination: "",
        isEditing: true,
      },
    ]);
  };

  // Add new work experience
  const handleAddWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        employment_type: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        start_date: "",
        end_date: "",
        reason_for_leaving: "",
        isEditing: true,
      },
    ]);
  };

  // Toggle editing for educational background
  const toggleEditEducation = (index) => {
    const updatedEducation = [...education];
    updatedEducation[index].isEditing = !updatedEducation[index].isEditing;
    setEducation(updatedEducation);
  };

  // Toggle editing for work experience
  const toggleEditWorkExperience = (index) => {
    const updatedWorkExperience = [...workExperience];
    updatedWorkExperience[index].isEditing =
      !updatedWorkExperience[index].isEditing;
    setWorkExperience(updatedWorkExperience);
  };

  // Function to remove an education entry
  const handleRemoveEducation = async (idx) => {
    const educationEntry = education[idx];

    if (educationEntry.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this educational background?"
      );
      if (!confirmed) return;

      try {
        // Delete the record from the database
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/educational-backgrounds/${educationEntry.id}`
        );

        toast({
          title: "Educational background deleted successfully.",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error deleting educational background:", error);
        toast({
          title: "Error deleting educational background.",
          description:
            error.response?.data?.error ||
            "Failed to delete the educational background.",
          status: "error",
          duration: 3000,
        });
      }
    }

    // Remove the entry from the state
    setEducation(education.filter((_, i) => i !== idx));
  };

  // Function to remove a work experience entry
  const handleRemoveWorkExperience = async (idx) => {
    const workEntry = workExperience[idx];

    if (workEntry.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this work experience?"
      );
      if (!confirmed) return;

      try {
        // Delete the record from the database
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/work-experiences/${workEntry.id}`
        );

        toast({
          title: "Work experience deleted successfully.",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error deleting work experience:", error);
        toast({
          title: "Error deleting work experience.",
          description:
            error.response?.data?.error ||
            "Failed to delete the work experience.",
          status: "error",
          duration: 3000,
        });
      }
    }

    // Remove the entry from the state
    setWorkExperience(workExperience.filter((_, i) => i !== idx));
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={5} mt={20}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 4: Educational Background & Work Experience
      </Heading>

      {/* Educational Background Section */}
      <Text fontWeight="bold" fontSize="lg" mt={6} mb={2}>
        Educational Background
      </Text>
      {education.map((edu, idx) => (
        <Box
          key={idx}
          p={4}
          bg="cyan.50"
          borderRadius="md"
          mb={4}
          boxShadow="md"
        >
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Level:
              </Text>
              <Select
                placeholder="Level"
                value={edu.level}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "level", e.target.value)
                }
              >
                <option value="Elementary">Elementary</option>
                <option value="Secondary">Secondary</option>
                <option value="Senior High School">Senior High School</option>
                <option value="College Graduate">College Graduate</option>
                <option value="Undergrad">Undergrad</option>
              </Select>
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Start Year:
              </Text>
              <Input
                placeholder="Start Year"
                type="number"
                value={edu.startFrom}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "startFrom", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Completion Year:
              </Text>
              <Input
                placeholder="Completion Year"
                type="number"
                value={edu.completion_year}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "completion_year", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                School:
              </Text>
              <Input
                placeholder="School"
                value={edu.school}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "school", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Field Of Study:
              </Text>
              <Input
                placeholder="Field of Study"
                value={edu.field_of_study}
                isDisabled={
                  !edu.isEditing ||
                  edu.level === "Elementary" ||
                  edu.level === "Secondary" ||
                  edu.level === "Senior High School"
                }
                onChange={(e) =>
                  handleEducationChange(idx, "field_of_study", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Degree:
              </Text>
              <Input
                placeholder="Degree"
                value={edu.degree}
                isDisabled={
                  !edu.isEditing ||
                  edu.level === "Elementary" ||
                  edu.level === "Secondary" ||
                  edu.level === "Senior High School"
                }
                onChange={(e) =>
                  handleEducationChange(idx, "degree", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Institution:
              </Text>
              <Input
                placeholder="Institution"
                value={edu.institution}
                isDisabled={
                  !edu.isEditing ||
                  edu.level === "Elementary" ||
                  edu.level === "Secondary" ||
                  edu.level === "Senior High School"
                }
                onChange={(e) =>
                  handleEducationChange(idx, "institution", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Professional Licensure:
              </Text>
              <Input
                placeholder="Professional Licensure"
                value={edu.professional_licensure_examination}
                isDisabled={
                  !edu.isEditing ||
                  edu.level === "Elementary" ||
                  edu.level === "Secondary" ||
                  edu.level === "Senior High School"
                }
                onChange={(e) =>
                  handleEducationChange(
                    idx,
                    "professional_licensure_examination",
                    e.target.value
                  )
                }
              />
            </GridItem>
          </Grid>
          <Flex justifyContent="flex-end" mt={4}>
            <IconButton
              icon={edu.isEditing ? <CheckIcon /> : <EditIcon />}
              colorScheme={edu.isEditing ? "green" : "blue"}
              onClick={() =>
                edu.isEditing
                  ? handleSaveOrUpdateEducation(idx)
                  : toggleEditEducation(idx)
              }
              mr={2}
            />
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleRemoveEducation(idx)}
            />
          </Flex>
        </Box>
      ))}
      <Button onClick={handleAddEducation} colorScheme="teal" mt={4}>
        Add Educational Background
      </Button>

      {/* Work Experience Section */}
      <Text fontWeight="bold" fontSize="lg" mt={6} mb={2}>
        Work Experience
      </Text>
      {workExperience.map((work, idx) => (
        <Box
          key={idx}
          p={4}
          bg="cyan.50"
          borderRadius="md"
          mb={4}
          boxShadow="md"
        >
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Employment Type:
              </Text>
              <Select
                placeholder="Employment Type"
                value={work.employment_type}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(
                    idx,
                    "employment_type",
                    e.target.value
                  )
                }
              >
                <option value="Self-employed">Self-employed</option>
                <option value="Employed">Employed</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </Select>
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Company:
              </Text>
              <Input
                placeholder="Company"
                value={work.company}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "company", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Address:
              </Text>
              <Input
                placeholder="Address"
                value={work.address}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "address", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Position:
              </Text>
              <Input
                placeholder="Position"
                value={work.position}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "position", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Department:
              </Text>
              <Input
                placeholder="Department"
                value={work.department}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "department", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Section:
              </Text>
              <Input
                placeholder="Section"
                value={work.section}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "section", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Start Date:
              </Text>
              <Input
                type="date"
                value={work.start_date}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "start_date", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                End Date:
              </Text>
              <Input
                type="date"
                value={work.end_date}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(idx, "end_date", e.target.value)
                }
              />
            </GridItem>
            <GridItem>
              <Text
                fontWeight="bold"
                mb="2"
                minWidth="120px"
                whiteSpace="nowrap"
                color="#0a5856"
              >
                Reason for Leaving:
              </Text>
              <Input
                placeholder="Reason for Leaving"
                value={work.reason_for_leaving}
                isDisabled={!work.isEditing}
                onChange={(e) =>
                  handleWorkExperienceChange(
                    idx,
                    "reason_for_leaving",
                    e.target.value
                  )
                }
              />
            </GridItem>
          </Grid>
          <Flex justifyContent="flex-end" mt={4}>
            <IconButton
              icon={work.isEditing ? <CheckIcon /> : <EditIcon />}
              colorScheme={work.isEditing ? "green" : "blue"}
              onClick={() =>
                work.isEditing
                  ? handleSaveOrUpdateWorkExperience(idx)
                  : toggleEditWorkExperience(idx)
              }
              mr={2}
            />
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={() => handleRemoveWorkExperience(idx)}
            />
          </Flex>
        </Box>
      ))}
      <Button onClick={handleAddWorkExperience} colorScheme="teal" mt={4}>
        Add Work Experience
      </Button>
    </Box>
  );
};

export default Step4;
