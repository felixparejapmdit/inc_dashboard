import React, { useState, useEffect, useRef } from "react";

import { useSearchParams } from "react-router-dom";
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Select,
  Input,
  IconButton,
  Button,
  Text,
  Textarea,
  useToast,
  Flex,
  Progress,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Divider,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import { getAuthHeaders } from "../../utils/apiHeaders";

const API_URL = process.env.REACT_APP_API_URL || "";
const MAX_CERTIFICATE_SIZE_MB = 5;
const MAX_CERTIFICATE_SIZE_BYTES = MAX_CERTIFICATE_SIZE_MB * 1024 * 1024;

const createLocalUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const isHigherEducationDetailsDisabled = (edu) =>
  !edu.isEditing ||
  edu.level === "No Formal Education" ||
  edu.level === "Primary Education" ||
  edu.level === "Secondary Education" ||
  edu.level === "Senior High School";

const getEducationValidation = (edu) => {
  const normalizedLevel = String(edu?.level ?? "").trim();
  const normalizedSchool = String(edu?.school ?? "").trim();
  const levelError = normalizedLevel === "";
  const schoolError = normalizedSchool === "";

  return {
    levelError,
    schoolError,
    isValid: !levelError && !schoolError,
  };
};

const EducationItem = ({
  edu,
  idx,
  educationalLevelOptions,
  uploadProgress,
  validation,
  onEducationChange,
  onSaveOrEditEducation,
  onRemoveEducation,
  onCertificateUpload,
  onRemoveCertificate,
  isCertificateUploadAllowed,
}) => (
  <Box
    p={4}
    bg="white"
    borderRadius="lg"
    mb={4}
    shadow="sm"
    border="1px"
    borderColor="gray.100"
  >

    <Flex justifyContent="space-between" alignItems="center" mb={4}>
      <Text fontWeight="bold" fontSize="lg" color="teal.600">
        #{idx + 1}
      </Text>
      <Box>
        <IconButton
          aria-label={edu.isEditing ? "Save education" : "Edit education"}
          icon={edu.isEditing ? <CheckIcon /> : <EditIcon />}
          colorScheme={edu.isEditing ? "green" : "blue"}
          onClick={() => onSaveOrEditEducation(idx, edu.isEditing)}
          isDisabled={edu.isEditing && !validation.isValid}
          size="sm"
          mr={2}
        />
        <IconButton
          aria-label="Delete education entry"
          icon={<DeleteIcon />}
          colorScheme="red"
          size="sm"
          onClick={() => onRemoveEducation(idx)}
        />
      </Box>
    </Flex>
    <Divider mb={4} />
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
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
          onChange={(e) => onEducationChange(idx, "level", e.target.value)}
        >
          {educationalLevelOptions.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
        {edu.isEditing && validation.levelError && (
          <Text fontSize="xs" color="red.500" mt={1}>
            Educational level is required.
          </Text>
        )}
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
          value={edu.school || ""}
          isDisabled={!edu.isEditing}
          onChange={(e) => onEducationChange(idx, "school", e.target.value)}
        />
        {edu.isEditing && validation.schoolError && (
          <Text fontSize="xs" color="red.500" mt={1}>
            School is required.
          </Text>
        )}
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
          value={edu.startfrom || ""}
          isDisabled={!edu.isEditing}
          onChange={(e) => onEducationChange(idx, "startfrom", e.target.value)}
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
          value={edu.completion_year || ""}
          isDisabled={!edu.isEditing}
          onChange={(e) =>
            onEducationChange(idx, "completion_year", e.target.value)
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
          value={edu.field_of_study || ""}
          isDisabled={isHigherEducationDetailsDisabled(edu)}
          onChange={(e) =>
            onEducationChange(idx, "field_of_study", e.target.value)
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
          value={edu.degree || ""}
          isDisabled={isHigherEducationDetailsDisabled(edu)}
          onChange={(e) => onEducationChange(idx, "degree", e.target.value)}
        />
      </GridItem>
      <GridItem display="none">
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
          value={edu.institution || ""}
          isDisabled={isHigherEducationDetailsDisabled(edu)}
          onChange={(e) => onEducationChange(idx, "institution", e.target.value)}
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
          value={edu.professional_licensure_examination || ""}
          isDisabled={isHigherEducationDetailsDisabled(edu)}
          onChange={(e) =>
            onEducationChange(
              idx,
              "professional_licensure_examination",
              e.target.value
            )
          }
        />
      </GridItem>
      {isCertificateUploadAllowed(edu.level) && (
        <GridItem colSpan={{ base: 1, md: 2, lg: 4 }}>
          <Text fontWeight="bold" mb="2">
            Upload Certificates:
          </Text>
          <Input
            type="file"
            accept=".pdf,.jpg,.png"
            multiple
            isDisabled={!edu.isEditing}
            onChange={(e) => onCertificateUpload(idx, e.target.files)}
          />
          {typeof uploadProgress === "number" && (
            <Box mt={2}>
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="teal"
                borderRadius="md"
              />
              <Text fontSize="xs" color="gray.600" mt={1}>
                {uploadProgress < 100
                  ? `Uploading... ${uploadProgress}%`
                  : "Upload complete."}
              </Text>
            </Box>
          )}
          <Box mt={4}>
            {Array.isArray(edu.certificate_files) &&
              edu.certificate_files.map((file, fileIdx) => (
                <Flex
                  key={`${file}-${fileIdx}`}
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Text>{file}</Text>
                  <Flex>
                    <IconButton
                      aria-label="View certificate"
                      icon={<ViewIcon />}
                      colorScheme="blue"
                      size="sm"
                      mr={2}
                      onClick={() =>
                        window.open(`/uploads/certificates/${file}`, "_blank")
                      }
                    />
                    <IconButton
                      aria-label="Delete certificate"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => onRemoveCertificate(idx, fileIdx)}
                    />
                  </Flex>
                </Flex>
              ))}
          </Box>
        </GridItem>
      )}
    </Grid>

  </Box>
);

const Step3 = ({ employmentTypeOptions, educationalLevelOptions }) => {
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [uploadProgressByKey, setUploadProgressByKey] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null,
    index: null,
  });

  const cancelRef = useRef(null);
  const toast = useToast();

  const [searchParams] = useSearchParams();
  const personnelId = searchParams.get("personnel_id");

  const getEducationKey = (edu, idx) => edu?.id || edu?.uuid || `edu-${idx}`;
  const closeDeleteDialog = () =>
    setDeleteDialog({ isOpen: false, type: null, index: null });

  useEffect(() => {
    if (!personnelId) {
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to fetch data.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    const fetchEducationAndWorkData = async () => {
      try {
        const [educationRes, workExperienceRes] = await Promise.all([
          fetchData("educational-backgrounds", null, null, null, {
            personnel_id: personnelId,
          }),
          fetchData("work-experiences", null, null, null, {
            personnel_id: personnelId,
          }),
        ]);

        const parsedEducation =
          educationRes?.map((edu) => {
            let parsedCertificates = [];

            if (Array.isArray(edu.certificate_files)) {
              parsedCertificates = edu.certificate_files;
            } else if (
              edu.certificate_files &&
              typeof edu.certificate_files === "string"
            ) {
              try {
                parsedCertificates = JSON.parse(edu.certificate_files);
              } catch (parseError) {
                console.warn("Invalid certificate_files format:", parseError);
                parsedCertificates = [];
              }
            }

            return {
              ...edu,
              uuid: edu.uuid || createLocalUuid(),
              certificate_files: parsedCertificates,
            };
          }) || [];

        const parsedWorkExperience =
          workExperienceRes?.map((work) => ({
            ...work,
            uuid: work.uuid || createLocalUuid(),
          })) || [];

        setEducation(parsedEducation);
        setWorkExperience(parsedWorkExperience);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description:
            "Failed to fetch educational background or work experience.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    };

    fetchEducationAndWorkData();
  }, [personnelId, toast]);

  // Handle changes for educational background fields
  const handleEducationChange = (index, field, value) => {
    setEducation((prevEducation) => {
      const updatedEducation = [...prevEducation];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };
      return updatedEducation;
    });
  };

  // Handle changes for work experience fields
  const handleWorkExperienceChange = (index, field, value) => {
    setWorkExperience((prevWorkExperience) => {
      const updatedWorkExperience = [...prevWorkExperience];
      updatedWorkExperience[index] = {
        ...updatedWorkExperience[index],
        [field]: value,
      };
      return updatedWorkExperience;
    });
  };

  const normalizeOptionalText = (value) => {
    const trimmed = String(value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  };

  const normalizeYear = (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  // Save or update educational background
  const handleSaveOrUpdateEducation = async (index) => {
    const edu = education[index];
    const validation = getEducationValidation(edu);

    if (!personnelId) {
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required.",
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }

    if (!validation.isValid) {
      toast({
        title: "Missing required fields",
        description: "Educational level and School are required.",
        status: "warning",
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }

    const payload = {
      personnel_id: personnelId,
      level: String(edu.level ?? "").trim(),
      startfrom: normalizeYear(edu.startfrom),
      completion_year: normalizeYear(edu.completion_year),
      school: normalizeOptionalText(edu.school),
      field_of_study: normalizeOptionalText(edu.field_of_study),
      degree: normalizeOptionalText(edu.degree),
      institution: normalizeOptionalText(edu.institution),
      professional_licensure_examination: normalizeOptionalText(
        edu.professional_licensure_examination
      ),
      certificate_files: Array.isArray(edu.certificate_files)
        ? edu.certificate_files
        : [],
    };

    try {
      const response = edu.id
        ? await putData("educational-backgrounds", edu.id, payload)
        : await postData("educational-backgrounds", payload);

      const serverData = response?.data || response;

      setEducation((prevEducation) => {
        const updatedEducation = [...prevEducation];
        updatedEducation[index] = {
          ...updatedEducation[index],
          ...serverData,
          id: serverData?.id || updatedEducation[index].id,
          uuid: updatedEducation[index].uuid,
          isEditing: false,
        };
        return updatedEducation;
      });

      toast({
        title: edu.id
          ? "Educational background updated successfully."
          : "Educational background saved successfully.",
        status: "success",
        duration: 3000,
        position: "bottom-left",
      });
    } catch (error) {
      console.error("Error saving/updating education:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save or update education.",
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
    }
  };

  const handleCertificateUpload = async (index, files) => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_CERTIFICATE_SIZE_BYTES
    );
    const validFiles = selectedFiles.filter(
      (file) => file.size <= MAX_CERTIFICATE_SIZE_BYTES
    );

    if (oversizedFiles.length > 0) {
      toast({
        title: "File size limit exceeded",
        description: `Each file must be ${MAX_CERTIFICATE_SIZE_MB}MB or smaller.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
    }

    if (validFiles.length === 0) {
      return;
    }

    const eduKey = getEducationKey(education[index], index);
    const formData = new FormData();
    validFiles.forEach((file) => formData.append("certificates", file));

    setUploadProgressByKey((prev) => ({ ...prev, [eduKey]: 0 }));

    try {
      const response = await axios.post(
        `${API_URL}/api/upload-certificates`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgressByKey((prev) => ({ ...prev, [eduKey]: percent }));
          },
        }
      );

      const uploadedFilenames = response?.data?.filenames || [];

      setEducation((prevEducation) => {
        const updatedEducation = [...prevEducation];
        const currentFiles = Array.isArray(
          updatedEducation[index]?.certificate_files
        )
          ? updatedEducation[index].certificate_files
          : [];

        // Avoid duplicates
        const mergedFiles = [
          ...new Set([...currentFiles, ...uploadedFilenames]),
        ];

        updatedEducation[index] = {
          ...updatedEducation[index],
          certificate_files: mergedFiles,
        };

        return updatedEducation;
      });

      setUploadProgressByKey((prev) => ({ ...prev, [eduKey]: 100 }));
      setTimeout(() => {
        setUploadProgressByKey((prev) => {
          const next = { ...prev };
          delete next[eduKey];
          return next;
        });
      }, 1000);

      toast({
        title: "Certificates uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      setUploadProgressByKey((prev) => {
        const next = { ...prev };
        delete next[eduKey];
        return next;
      });

      console.error("Error uploading certificates:", error);
      toast({
        title: "Error uploading certificates.",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleRemoveCertificate = async (eduIndex, certIndex) => {
    try {
      const updatedEducation = [...education];
      const edu = updatedEducation[eduIndex];

      if (!Array.isArray(edu.certificate_files)) {
        edu.certificate_files = [];
      }

      const certToRemove = edu.certificate_files[certIndex];

      if (!certToRemove) {
        toast({
          title: "Error",
          description: "File not found.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }

      const response = await putData("remove-certificate", {
        filePath: certToRemove,
        educationId: edu.id,
      });

      edu.certificate_files =
        response?.certificate_files || response?.data?.certificate_files || [];
      setEducation(updatedEducation);

      toast({
        title: "Certificate removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      console.error("Error removing certificate:", error.message);
      toast({
        title: "Error removing certificate.",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
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
        await putData("work-experiences", work.id, payload);

        toast({
          title: "Work experience updated successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left",
        });
      } else {
        console.log("Saving new work experience:", payload);
        const response = await postData("work-experiences", payload);
        const createdId =
          response?.data?.id || response?.workExperience?.id || response?.id;

        if (createdId) {
          setWorkExperience((prevWorkExperience) => {
            const updatedWorkExperience = [...prevWorkExperience];
            updatedWorkExperience[index] = {
              ...updatedWorkExperience[index],
              id: createdId,
            };
            return updatedWorkExperience;
          });
        }

        toast({
          title: "Work experience saved successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left",
        });
      }

      toggleEditWorkExperience(index);
    } catch (error) {
      console.error("Error saving/updating work experience:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to save or update work experience.",
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
    }
  };

  // Add new educational background
  const handleAddEducation = () => {
    setEducation((prevEducation) => [
      ...prevEducation,
      {
        uuid: createLocalUuid(),
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
    setWorkExperience((prevWorkExperience) => [
      ...prevWorkExperience,
      {
        uuid: createLocalUuid(),
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
    setEducation((prevEducation) => {
      const updatedEducation = [...prevEducation];
      updatedEducation[index] = {
        ...updatedEducation[index],
        isEditing: !updatedEducation[index].isEditing,
      };
      return updatedEducation;
    });
  };

  // Toggle editing for work experience
  const toggleEditWorkExperience = (index) => {
    setWorkExperience((prevWorkExperience) => {
      const updatedWorkExperience = [...prevWorkExperience];
      updatedWorkExperience[index] = {
        ...updatedWorkExperience[index],
        isEditing: !updatedWorkExperience[index].isEditing,
      };
      return updatedWorkExperience;
    });
  };

  const removeEducationEntry = async (idx) => {
    const educationEntry = education[idx];

    if (educationEntry?.id) {
      try {
        await deleteData("educational-backgrounds", educationEntry.id);

        toast({
          title: "Educational background deleted successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting educational background:", error);
        toast({
          title: "Error deleting educational background.",
          description:
            error.message || "Failed to delete the educational background.",
          status: "error",
          duration: 3000,
          position: "bottom-left",
        });
        return;
      }
    }

    setEducation((prevEducation) => prevEducation.filter((_, i) => i !== idx));
  };

  const removeWorkExperienceEntry = async (idx) => {
    const workEntry = workExperience[idx];

    if (workEntry?.id) {
      try {
        await deleteData("work-experiences", workEntry.id);

        toast({
          title: "Work experience deleted successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting work experience:", error);
        toast({
          title: "Error deleting work experience.",
          description: error.message || "Failed to delete the work experience.",
          status: "error",
          duration: 3000,
          position: "bottom-left",
        });
        return;
      }
    }

    setWorkExperience((prevWorkExperience) =>
      prevWorkExperience.filter((_, i) => i !== idx)
    );
  };

  const handleConfirmDelete = async () => {
    const { type, index } = deleteDialog;
    closeDeleteDialog();

    if (index === null || index === undefined) {
      return;
    }

    if (type === "education") {
      await removeEducationEntry(index);
      return;
    }

    if (type === "work") {
      await removeWorkExperienceEntry(index);
    }
  };

  return (
    <>
      <Box width="100%" bg="white" boxShadow="sm" p={{ base: 4, md: 5 }}>
        <Heading as="h2" size={{ base: "lg", md: "xl" }} textAlign="center" mb={2} color="#0a5856">
          Step 3: Educational Background & Work Experience
        </Heading>

        <Flex alignItems="center" mb={4}>
          <Heading as="h3" size="md" color="#0a5856" mr={2}>
            Educational Background
          </Heading>
          <Box
            bg="teal.500"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="sm"
            fontWeight="bold"
          >
            {education.length}
          </Box>
        </Flex>

        {education.map((edu, idx) => {
          const validation = getEducationValidation(edu);
          const itemKey = getEducationKey(edu, idx);

          return (
            <EducationItem
              key={itemKey}
              edu={edu}
              idx={idx}
              educationalLevelOptions={educationalLevelOptions}
              uploadProgress={uploadProgressByKey[itemKey]}
              validation={validation}
              onEducationChange={handleEducationChange}
              onSaveOrEditEducation={(targetIdx, isEditing) =>
                isEditing
                  ? handleSaveOrUpdateEducation(targetIdx)
                  : toggleEditEducation(targetIdx)
              }
              onRemoveEducation={(targetIdx) =>
                setDeleteDialog({
                  isOpen: true,
                  type: "education",
                  index: targetIdx,
                })
              }
              onCertificateUpload={handleCertificateUpload}
              onRemoveCertificate={handleRemoveCertificate}
              isCertificateUploadAllowed={isCertificateUploadAllowed}
            />
          );
        })}
        <Button onClick={handleAddEducation} colorScheme="teal" mt={4}>
          Add Educational Background
        </Button>

        <Flex alignItems="center" mt={8} mb={4}>
          <Heading as="h3" size="md" color="#0a5856" mr={2}>
            Work Experience
          </Heading>
          <Box
            bg="teal.500"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="sm"
            fontWeight="bold"
          >
            {workExperience.length}
          </Box>
        </Flex>

        {workExperience.map((work, idx) => (
          <Box
            key={work.id || work.uuid}
            p={4}
            bg="white"
            borderRadius="lg"
            mb={4}
            shadow="sm"
            border="1px"
            borderColor="gray.100"
          >
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Text fontWeight="bold" fontSize="lg" color="teal.600">
                #{idx + 1}
              </Text>
              <Box>
                <IconButton
                  icon={work.isEditing ? <CheckIcon /> : <EditIcon />}
                  colorScheme={work.isEditing ? "green" : "blue"}
                  onClick={() =>
                    work.isEditing
                      ? handleSaveOrUpdateWorkExperience(idx)
                      : toggleEditWorkExperience(idx)
                  }
                  size="sm"
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={() =>
                    setDeleteDialog({
                      isOpen: true,
                      type: "work",
                      index: idx,
                    })
                  }
                />
              </Box>
            </Flex>
            <Divider mb={4} />
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
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
                  value={work.company || ""}
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
                  Company Address:
                </Text>
                <Textarea rows={3}
                  placeholder="Company Address (Unit/Street, Brgy, City, Province)"
                  value={work.address || ""}
                  isDisabled={!work.isEditing}
                  onChange={(e) =>
                    handleWorkExperienceChange(idx, "address", e.target.value)
                  }
                />
              </GridItem>
              <GridItem display="none">
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
                  value={work.position || ""}
                  isDisabled={!work.isEditing}
                  onChange={(e) =>
                    handleWorkExperienceChange(idx, "position", e.target.value)
                  }
                />
              </GridItem>
              <GridItem display="none">
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
                  value={work.department || ""}
                  isDisabled={!work.isEditing}
                  onChange={(e) =>
                    handleWorkExperienceChange(idx, "department", e.target.value)
                  }
                />
              </GridItem>
              <GridItem display="none">
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
                  value={work.section || ""}
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
                  Brief Description of Responsibilities:
                </Text>
                <Textarea
                  placeholder="Enter description..."
                  value={work.position || ""}
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
                  Start Date:
                </Text>
                <Input
                  type="date"
                  value={work.start_date || ""}
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
                  value={work.end_date || ""}
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
                  value={work.reason_for_leaving || ""}
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

          </Box>
        ))}
        <Button onClick={handleAddWorkExperience} colorScheme="teal" mt={4}>
          Add Work Experience
        </Button>
      </Box>

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Delete
            </AlertDialogHeader>

            <AlertDialogBody>
              {deleteDialog.type === "education"
                ? "Are you sure you want to delete this educational background?"
                : "Are you sure you want to delete this work experience?"}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Step3;


