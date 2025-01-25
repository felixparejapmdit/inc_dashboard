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
import { EditIcon, DeleteIcon, CheckIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";

const Step3 = ({ employmentTypeOptions, educationalLevelOptions }) => {
  const [education, setEducation] = useState([]);
  const [certificateUploads, setCertificateUploads] = useState({});
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
        position: "bottom-left", // Position the toast on the bottom-left
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

        // Safely handle education data
        const parsedEducation =
          educationRes?.data?.map((edu) => ({
            ...edu,
            certificate_files:
              edu.certificate_files && typeof edu.certificate_files === "string"
                ? JSON.parse(edu.certificate_files)
                : [], // Default to empty array
          })) || [];

        // Safely handle work experience data
        const workExperienceData = workExperienceRes?.data || [];

        setEducation(parsedEducation);
        setWorkExperience(workExperienceData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description:
            "Failed to fetch educational background or work experience.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
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
      level: edu.level, // Ensure `level` is included in the payload
      startfrom: edu.startfrom,
      completion_year: edu.completion_year,
      school: edu.school,
      field_of_study: edu.field_of_study,
      degree: edu.degree,
      institution: edu.institution,
      professional_licensure_examination:
        edu.professional_licensure_examination,
      certificate_files: edu.certificate_files || [], // Ensure this is an array of file paths
    };

    try {
      if (edu.id) {
        console.log("Updating education:", edu.id, payload);
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/educational-backgrounds/${edu.id}`,
          payload
        );
        toast({
          title: "Educational background updated successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });

        // Update the local state to reflect the saved data
        const updatedEducation = [...education];
        updatedEducation[index] = { ...edu, ...response.data };
        setEducation(updatedEducation);
      } else {
        console.log("Saving new education:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/educational-backgrounds`,
          payload
        );
        const newEducation = { ...edu, id: response.data.id };
        const updatedEducation = [...education];
        updatedEducation[index] = newEducation;
        setEducation(updatedEducation);

        toast({
          title: "Educational background saved successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
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
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const handleCertificateUpload = async (index, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("certificates", file));

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload-certificates`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update the state with filenames instead of full paths
      const updatedEducation = [...education];
      const uploadedFilenames = response.data.filenames; // Array of filenames
      updatedEducation[index].certificate_files = [
        ...(updatedEducation[index].certificate_files || []),
        ...uploadedFilenames,
      ];
      setEducation(updatedEducation);

      toast({
        title: "Certificates uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error("Error uploading certificates:", error.message);
      toast({
        title: "Error uploading certificates.",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const handleRemoveCertificate = async (eduIndex, certIndex) => {
    try {
      const updatedEducation = [...education];
      const edu = updatedEducation[eduIndex];

      // Ensure certificate_files is initialized as an array
      if (!Array.isArray(edu.certificate_files)) {
        edu.certificate_files = [];
      }

      // Get the file to remove
      const certToRemove = edu.certificate_files[certIndex];

      if (!certToRemove) {
        toast({
          title: "Error",
          description: "File not found.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });
        return;
      }

      // Make a PUT request to the backend to remove the file from the server and database
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/remove-certificate`,
        {
          filePath: certToRemove, // Send only the filename
          educationId: edu.id, // Include the education ID
        }
      );

      // Update the local state with the updated certificate files from the backend
      edu.certificate_files = response.data.certificate_files; // Use the updated array from the backend
      setEducation(updatedEducation);

      toast({
        title: "Certificate removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error("Error removing certificate:", error.message);
      toast({
        title: "Error removing certificate.",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const isCertificateUploadAllowed = (level) => {
    const allowedLevels = [
      "Senior High School",
      "Vocational Training",
      "Associate Degree",
      "Bachelor's Degree",
      "Master's Degree",
      "Doctorate Degree",
      "Post-Doctorate",
      "Certificate Programs",
      "Professional Degree",
      "Continuing Education",
      "Alternative Learning System",
    ];
    return allowedLevels.includes(level);
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
          position: "bottom-left", // Position the toast on the bottom-left
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
          position: "bottom-left", // Position the toast on the bottom-left
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
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  // Add new educational background
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        level: "",
        startfrom: "",
        completion_year: "",
        school: "",
        field_of_study: "",
        degree: "",
        institution: "",
        professional_licensure_examination: "",
        certificate_files: [], // Ensure this is initialized as an array
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
          position: "bottom-left", // Position the toast on the bottom-left
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
          position: "bottom-left", // Position the toast on the bottom-left
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
          position: "bottom-left", // Position the toast on the bottom-left
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
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }
    }

    // Remove the entry from the state
    setWorkExperience(workExperience.filter((_, i) => i !== idx));
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={5} mt={20}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 3: Educational Background & Work Experience
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
                Educational Level:
              </Text>
              <Select
                placeholder="Level"
                value={edu.level}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "level", e.target.value)
                }
              >
                {educationalLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
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
                Start Year:
              </Text>
              <Input
                placeholder="Start Year"
                type="number"
                value={edu.startfrom}
                isDisabled={!edu.isEditing}
                onChange={(e) =>
                  handleEducationChange(idx, "startfrom", e.target.value)
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
                Field Of Study:
              </Text>
              <Input
                placeholder="Field of Study"
                value={edu.field_of_study}
                isDisabled={
                  !edu.isEditing ||
                  edu.level === "No Formal Education" ||
                  edu.level === "Primary Education" ||
                  edu.level === "Secondary Education" ||
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
                  edu.level === "No Formal Education" ||
                  edu.level === "Primary Education" ||
                  edu.level === "Secondary Education" ||
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
                  edu.level === "No Formal Education" ||
                  edu.level === "Primary Education" ||
                  edu.level === "Secondary Education" ||
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
                  edu.level === "No Formal Education" ||
                  edu.level === "Primary Education" ||
                  edu.level === "Secondary Education" ||
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
            {/* Certificate Upload Section */}
            {isCertificateUploadAllowed(edu.level) && (
              <GridItem colSpan={4}>
                <Text fontWeight="bold" mb="2">
                  Upload Certificates:
                </Text>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  multiple
                  isDisabled={!edu.isEditing}
                  onChange={(e) => handleCertificateUpload(idx, e.target.files)}
                />
                <Box mt={4}>
                  {/* Ensure certificate_files is an array before mapping */}
                  {Array.isArray(edu.certificate_files) &&
                    edu.certificate_files.map((file, fileIdx) => (
                      <Flex
                        key={fileIdx}
                        alignItems="center"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Text>{file}</Text>
                        <Flex>
                          {/* View Icon */}
                          <IconButton
                            icon={<ViewIcon />}
                            colorScheme="blue"
                            size="sm"
                            mr={2}
                            onClick={
                              () =>
                                window.open(
                                  `/uploads/certificates/${file}`,
                                  "_blank"
                                ) // Construct the full path
                            }
                          />
                          {/* Delete Icon */}
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            size="sm"
                            onClick={() =>
                              handleRemoveCertificate(idx, fileIdx)
                            }
                          />
                        </Flex>
                      </Flex>
                    ))}
                </Box>
              </GridItem>
            )}
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
                {employmentTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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
                isDisabled={
                  !work.isEditing ||
                  ["Volunteer/Kawani"].includes(work.employment_type)
                } // Disable if employment_type is Volunteer or Kawani
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

export default Step3;
