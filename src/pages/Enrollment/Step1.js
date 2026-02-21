// src/pages/Step1.js
import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CheckIcon, AddIcon } from "@chakra-ui/icons";
import InfoField from "./PreviewForm";
import StepProgressTracker from "../../components/StepProgressTracker"; // ✅ Import StepProgressTracker
import axios from "axios";

import { fetchData, postData, putData, deleteData } from "../../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;

const Step1 = ({
  personnelData,
  setPersonnelData,
  handleChange,
  emailError,
  age,
  languages,
  citizenships,
  nationalities,
  departments,
  sections,
  subsections,
  designations,
  districts,
  localCongregations,
  suffixOptions,
  bloodtypes,
  isEditing, // ✅ Receive isEditing as a prop
  toggleEdit, // ✅ Receive toggleEdit function as a prop
  dutiesToDelete, // 🔥 ADD THIS
  setDutiesToDelete, // 🔥 AND THIS
  formErrors = {}, // ✅ Receive formErrors
}) => {
  const [step, setStep] = useState(1);

  const totalSteps = 10;

  const civilStatuses = ["Single", "Married"];
  const totalPersonnelTypes = [
    "Minister",
    "Regular",
    "Ministerial Student",
    "Minister's Wife",
    "Lay Member",
    "Volunteer",
  ];

  const [filteredPersonnelTypes, setFilteredPersonnelTypes] =
    useState(totalPersonnelTypes);

  // Filter Personnel Type based on Gender
  useEffect(() => {
    let updatedTypes = [];

    if (personnelData.gender === "Female") {
      updatedTypes = ["Minister's Wife", "Lay Member", "Volunteer"];
    } else if (personnelData.gender === "Male") {
      updatedTypes = totalPersonnelTypes.filter(
        (type) => type !== "Minister's Wife"
      );
    } else {
      updatedTypes = totalPersonnelTypes;
    }

    setFilteredPersonnelTypes(updatedTypes);

    // Reset personnel_type if it doesn't exist in the updated options
    setPersonnelData((prevData) => ({
      ...prevData,
      personnel_type: updatedTypes.includes(prevData.personnel_type)
        ? prevData.personnel_type
        : "",
    }));
  }, [personnelData.gender, setPersonnelData]);

  // States for filtered sections and subsections
  const [filteredSections, setFilteredSections] = useState([]);
  const [filteredSubsections, setFilteredSubsections] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  const [duties, setDuties] = useState(personnelData.church_duties || []);

  useEffect(() => {
    if (Array.isArray(personnelData.church_duties)) {
      setDuties(personnelData.church_duties);
    }
  }, [personnelData.church_duties]);

  const [filteredLocalCongregations, setFilteredLocalCongregations] = useState(
    []
  );

  const [
    filteredLocalCongregationsOrigin,
    setFilteredLocalCongregationsOrigin,
  ] = useState([]);
  const [
    filteredLocalCongregationsAssignment,
    setFilteredLocalCongregationsAssignment,
  ] = useState([]);

  const [
    filteredFirstLocalCongregations,
    setFilteredFirstLocalCongregations,
    ,
  ] = useState([]);

  // Filter sections based on department
  useEffect(() => {
    if (personnelData.department_id && Array.isArray(sections)) {
      const filtered = sections.filter(
        (section) =>
          String(section.department_id) === String(personnelData.department_id)
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [personnelData.department_id, sections]);

  // Filter subsections based on section
  useEffect(() => {
    if (personnelData.section_id && Array.isArray(subsections)) {
      const filtered = subsections.filter(
        (subsection) =>
          String(subsection.section_id) === String(personnelData.section_id)
      );
      setFilteredSubsections(filtered);
    } else {
      setFilteredSubsections([]);
    }
  }, [personnelData.section_id, subsections]);

  useEffect(() => {
    if (personnelData.registered_district_id && Array.isArray(localCongregations)) {
      const filtered = localCongregations.filter(
        (congregation) =>
          String(congregation.district_id) === String(personnelData.registered_district_id)
      );
      setFilteredLocalCongregations(filtered);
    } else {
      setFilteredLocalCongregations([]);
    }
  }, [personnelData.registered_district_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_id && Array.isArray(localCongregations)) {
      const filtered = localCongregations.filter(
        (congregation) =>
          String(congregation.district_id) === String(personnelData.district_id)
      );
      setFilteredLocalCongregationsOrigin(filtered);
    } else {
      setFilteredLocalCongregationsOrigin([]);
    }
  }, [personnelData.district_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_assignment_id && Array.isArray(localCongregations)) {
      const filtered = localCongregations.filter(
        (congregation) =>
          String(congregation.district_id) === String(personnelData.district_assignment_id)
      );
      setFilteredLocalCongregationsAssignment(filtered);
    } else {
      setFilteredLocalCongregationsAssignment([]);
    }
  }, [personnelData.district_assignment_id, localCongregations]);

  useEffect(() => {
    if (personnelData.district_first_registered && Array.isArray(localCongregations)) {
      const filtered = localCongregations.filter(
        (congregation) =>
          String(congregation.district_id) === String(personnelData.district_first_registered)
      );
      setFilteredFirstLocalCongregations(filtered);
    } else {
      setFilteredFirstLocalCongregations([]);
    }
  }, [personnelData.district_first_registered, localCongregations]);

  // Validation Functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email regex

  const isRequiredFieldMissing = (field) =>
    field === undefined || field === null || field.trim() === "";

  // Function to validate the entire form


  const handleAddDuty = () => {
    if (duties.length >= 5) {
      return; // Stop if already 5 duties
    }

    setDuties([
      ...duties,
      { personnel_id: "", duty: "", start_year: "", end_year: "" },
    ]);
  };

  const handleDutyChange = (index, field, value) => {
    const updatedDuties = [...duties];
    updatedDuties[index][field] = value;
    setDuties(updatedDuties);

    // Optional: also update personnelData immediately if needed
    setPersonnelData((prevData) => ({
      ...prevData,
      church_duties: updatedDuties,
    }));
  };

  const handleDeleteDuty = (index) => {
    const updatedDuties = duties.filter((_, i) => i !== index);
    const deletedDuty = duties[index];

    setDuties(updatedDuties);

    setPersonnelData((prevData) => ({
      ...prevData,
      church_duties: updatedDuties,
    }));

    if (deletedDuty && deletedDuty.id) {
      setDutiesToDelete((prev) => [...prev, deletedDuty.id]);
    }
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={{ base: 4, md: 6 }}>
      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Box>


          <Heading as="h2" size={{ base: "lg", md: "xl" }} textAlign="center" mb={3} color="#0a5856">
            Step 1: Primary Information
          </Heading>

          <Flex justifyContent="flex-end" mb={4} px={4}>
            <IconButton
              icon={isEditing ? <CheckIcon /> : <EditIcon />}
              onClick={toggleEdit} // ✅ Use the updated toggleEdit that includes handleSave validation
              colorScheme={isEditing ? "green" : "blue"}
              aria-label={isEditing ? "Save" : "Edit"}
              size="sm"
            />
          </Flex>



          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={4}>
              <InfoField
                label="Gender"
                value={personnelData.gender}
                isEditing={isEditing}
                isRequired
                error={formErrors.gender}
              >
                <RadioGroup
                  name="gender"
                  onChange={(value) =>
                    handleChange({
                      target: {
                        name: "gender",
                        value: value,
                      },
                    })
                  }
                  value={personnelData.gender}
                  isDisabled={!isEditing}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="Male">Male</Radio>
                    <Radio value="Female">Female</Radio>
                  </Stack>
                </RadioGroup>
              </InfoField>

              <InfoField
                label="Civil Status"
                value={personnelData.civil_status}
                isEditing={isEditing}
                isRequired
                error={formErrors.civil_status}
              >
                <RadioGroup
                  name="civil_status"
                  onChange={(value) =>
                    handleChange({
                      target: {
                        name: "civil_status",
                        value: value,
                      },
                    })
                  }
                  value={personnelData.civil_status}
                  isDisabled={!isEditing}
                >
                  <Stack direction="row" spacing={4}>
                    {civilStatuses.map((status) => (
                      <Radio key={status} value={status}>
                        {status}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </InfoField>

              {personnelData.civil_status === "Married" && (
                <InfoField
                  label="Wedding Date"
                  value={personnelData.wedding_anniversary}
                  isEditing={isEditing}
                >
                  <Input
                    placeholder="Wedding Anniversary"
                    name="wedding_anniversary"
                    type="date"
                    value={personnelData.wedding_anniversary || ""}
                    onChange={(e) =>
                      setPersonnelData((prevData) => ({
                        ...prevData,
                        wedding_anniversary: e.target.value,
                      }))
                    }
                    width="100%"
                    isDisabled={!isEditing}
                  />
                </InfoField>
              )}
            </SimpleGrid>

            {/* Names Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <InfoField
                label="Given Name"
                value={personnelData.givenname}
                isEditing={isEditing}
                isRequired
                error={formErrors.givenname}
              >
                <Input
                  placeholder="Given Name"
                  name="givenname"
                  value={personnelData.givenname || ""}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Middle Name"
                value={personnelData.middlename}
                isEditing={isEditing}
              >
                <Input
                  placeholder="Middle Name"
                  name="middlename"
                  value={personnelData.middlename || ""}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label={personnelData.surname_maiden_label || "Surname (Maiden)"}
                value={personnelData.surname_maiden}
                isEditing={isEditing}
                error={formErrors.surname_maiden}
              >
                <Input
                  placeholder={
                    personnelData.surname_maiden_placeholder || "Surname (Maiden)"
                  }
                  name="surname_maiden"
                  value={personnelData.surname_maiden || ""}
                  onChange={handleChange}
                  isDisabled={personnelData.surname_maiden_disabled || !isEditing}
                />
              </InfoField>

              <InfoField
                label={personnelData.surname_husband_label || "Surname (Husband)"}
                value={personnelData.surname_husband}
                isEditing={isEditing}
                isRequired
                error={formErrors.surname_husband}
              >
                <Input
                  placeholder={
                    personnelData.surname_husband_placeholder ||
                    "Surname (Husband)"
                  }
                  name="surname_husband"
                  value={personnelData.surname_husband || ""}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Suffix"
                value={personnelData.suffix}
                isEditing={isEditing}
              >
                <Select
                  name="suffix"
                  value={
                    suffixOptions
                      .map((suffix) => ({
                        value: suffix,
                        label: suffix,
                      }))
                      .find((option) => option.value === personnelData.suffix) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "suffix",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing || personnelData.gender === "Female"}
                  options={suffixOptions.map((suffix) => ({
                    value: suffix,
                    label: suffix,
                  }))}
                  isClearable
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: "100%",
                    }),
                  }}
                />
              </InfoField>

              <InfoField
                label="Nickname"
                value={personnelData.nickname}
                isEditing={isEditing}
                error={formErrors.nickname}
              >
                <Input
                  placeholder="Nickname"
                  name="nickname"
                  value={personnelData.nickname || ""}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                />
              </InfoField>
              <InfoField
                label="Current District"
                value={
                  districts.find(
                    (d) => String(d.id) === String(personnelData.registered_district_id)
                  )?.name
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select District"
                  name="registered_district_id"
                  value={districts
                    .map((district) => ({
                      value: district.id,
                      label: district.name,
                    }))
                    .find(
                      (option) =>
                        option.value === personnelData.registered_district_id
                    )}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "registered_district_id",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))}
                  isClearable
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: "100%",
                    }),
                  }}
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Current Local Congregation"
                value={
                  localCongregations.find(
                    (c) =>
                      String(c.id) ===
                      String(personnelData.registered_local_congregation)
                  )?.name
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select Local Congregation"
                  name="registered_local_congregation"
                  value={filteredLocalCongregations
                    .map((congregation) => ({
                      value: congregation.id,
                      label: congregation.name,
                    }))
                    .find(
                      (option) =>
                        option.value ===
                        personnelData.registered_local_congregation
                    )}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "registered_local_congregation",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={filteredLocalCongregations.map((congregation) => ({
                    value: congregation.id,
                    label: congregation.name,
                  }))}
                  isDisabled={!isEditing || !personnelData.registered_district_id}
                  isClearable
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: "100%",
                    }),
                  }}
                />
              </InfoField>
            </SimpleGrid>
          </Box>



          {/* Vital Statistics Section */}
          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <InfoField
                label="Birthday"
                value={personnelData.date_of_birth}
                isEditing={isEditing}
                isRequired
                error={formErrors.date_of_birth}
              >
                <Input
                  placeholder="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={personnelData.date_of_birth || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "date_of_birth", value: e.target.value },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField label="Age" value={age} isEditing={isEditing}>
                <Input
                  placeholder="0"
                  name="age"
                  value={age || ""}
                  readOnly
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Place of Birth"
                value={personnelData.place_of_birth}
                isEditing={isEditing}
              >
                <Input
                  placeholder="Place of Birth"
                  name="place_of_birth"
                  value={personnelData.place_of_birth || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "place_of_birth", value: e.target.value },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Date Started in the office"
                value={personnelData.datejoined}
                isEditing={isEditing}
                isRequired
                error={formErrors.datejoined}
              >
                <Input
                  placeholder="Date Joined"
                  name="datejoined"
                  type="date"
                  value={personnelData.datejoined || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "datejoined", value: e.target.value },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>
            </SimpleGrid>
          </Box>

          {/* Contact & Demographics Section */}
          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <InfoField
                label="Languages"
                value={
                  Array.isArray(personnelData.language_id)
                    ? languages
                      .filter((lang) =>
                        personnelData.language_id.includes(lang.id)
                      )
                      .map((lang) => lang.name)
                      .join(", ")
                    : "N/A"
                }
                isEditing={isEditing}
              >
                <Select
                  isMulti
                  placeholder="Select Languages"
                  name="language_id"
                  value={
                    Array.isArray(personnelData.language_id)
                      ? languages
                        .filter((lang) =>
                          personnelData.language_id.includes(lang.id)
                        )
                        .map((lang) => ({ value: lang.id, label: lang.name }))
                      : []
                  }
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [];
                    handleChange({
                      target: {
                        name: "language_id",
                        value: selectedIds,
                      },
                    });
                  }}
                  options={languages.map((language) => ({
                    value: language.id,
                    label: language.name,
                  }))}
                  isClearable
                  closeMenuOnSelect={false}
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>

              <InfoField
                label="Blood Type"
                value={personnelData.bloodtype}
                isEditing={isEditing}
              >
                <Select
                  placeholder="Blood Type"
                  name="bloodtype"
                  value={bloodtypes
                    .map((type) => ({ value: type, label: type }))
                    .find((option) => option.value === personnelData.bloodtype)}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "bloodtype",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={bloodtypes.map((type) => ({ value: type, label: type }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>

              <InfoField
                label="Personal Email Address"
                value={personnelData.email_address}
                isEditing={isEditing}
                isRequired
                error={formErrors.email_address}
              >
                <Input
                  placeholder="Enter Email Address"
                  name="email_address"
                  value={personnelData.email_address || ""}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                />
              </InfoField>

              <FormControl display="none">
                <FormLabel fontWeight="bold" color="#0a5856">Work Email Address</FormLabel>
                <Input
                  placeholder="Enter Work Email Address"
                  name="work_email_address"
                  value={personnelData.work_email_address || ""}
                  onChange={handleChange}
                />
              </FormControl>

              <InfoField
                label="Citizenship"
                value={
                  Array.isArray(personnelData.citizenship)
                    ? citizenships
                      .filter((c) =>
                        personnelData.citizenship?.includes(c.id)
                      )
                      .map((c) => c.citizenship)
                      .join(", ")
                    : "N/A"
                }
                isEditing={isEditing}
              >
                <Select
                  isMulti
                  placeholder="Select Citizenship"
                  name="citizenship"
                  value={citizenships
                    .filter((citizenship) =>
                      personnelData.citizenship?.includes(citizenship.id)
                    )
                    .map((citizenship) => ({
                      value: citizenship.id,
                      label: citizenship.citizenship,
                    }))}
                  onChange={(selectedOptions) =>
                    handleChange({
                      target: {
                        name: "citizenship",
                        value: selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : [],
                      },
                    })
                  }
                  options={citizenships.map((citizenship) => ({
                    value: citizenship.id,
                    label: citizenship.citizenship,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>


            </SimpleGrid>
          </Box>

          {/* Office Information Section */}
          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <InfoField
                label="Ethnicity"
                value={
                  nationalities.find(
                    (n) => n.id === personnelData.nationality
                  )?.nationality
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select Ethnicity"
                  name="nationality"
                  value={nationalities
                    .map((nationality) => ({
                      value: nationality.id,
                      label: nationality.nationality,
                    }))
                    .find((option) => option.value === personnelData.nationality)}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "nationality",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={nationalities.map((nationality) => ({
                    value: nationality.id,
                    label: nationality.nationality,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>
              <InfoField
                label="Department"
                value={
                  departments.find(
                    (d) => String(d.id) === String(personnelData.department_id)
                  )?.name
                }
                isEditing={isEditing}
                isRequired
                error={formErrors.department_id}
              >
                <Select
                  placeholder="Select Department"
                  name="department_id"
                  value={departments
                    .map((department) => ({
                      value: department.id,
                      label: department.name,
                    }))
                    .find(
                      (option) => option.value === personnelData.department_id
                    )}
                  onChange={(selectedOption) => {
                    handleChange({
                      target: {
                        name: "department_id",
                        value: selectedOption?.value || "",
                      },
                    });
                  }}
                  options={departments.map((department) => ({
                    value: department.id,
                    label: department.name,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>

              <InfoField
                label="Section"
                value={
                  sections.find(
                    (s) => String(s.id) === String(personnelData.section_id)
                  )?.name
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select Section"
                  name="section_id"
                  value={sections
                    .map((section) => ({
                      value: section.id,
                      label: section.name,
                    }))
                    .find((option) => option.value === personnelData.section_id)}
                  onChange={(selectedOption) => {
                    handleChange({
                      target: {
                        name: "section_id",
                        value: selectedOption?.value || "",
                      },
                    });
                  }}
                  options={filteredSections.map((section) => ({
                    value: section.id,
                    label: section.name,
                  }))}
                  isDisabled={!isEditing || !personnelData.department_id}
                  isClearable
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>

              <FormControl display="none">
                <FormLabel fontWeight="bold" color="#0a5856">Subsection/Team</FormLabel>
                <Select
                  placeholder="Select Subsection"
                  name="subsection_id"
                  value={subsections
                    .map((subsection) => ({
                      value: subsection.id,
                      label: subsection.name,
                    }))
                    .find(
                      (option) => option.value === personnelData.subsection_id
                    )}
                  onChange={(selectedOption) => {
                    handleChange({
                      target: {
                        name: "subsection_id",
                        value: selectedOption?.value || "",
                      },
                    });
                  }}
                  options={filteredSubsections.map((subsection) => ({
                    value: subsection.id,
                    label: subsection.name,
                  }))}
                  isDisabled={!personnelData.section_id}
                  isClearable
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="#0a5856">Role</FormLabel>
                <Select
                  placeholder="Select Role"
                  name="designation_id"
                  value={
                    designations
                      .map((designation) => ({
                        value: designation.id,
                        label: designation.name,
                      }))
                      .find(
                        (option) => option.value === personnelData.designation_id
                      ) || null
                  }
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "designation_id",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={designations.map((designation) => ({
                    value: designation.id,
                    label: designation.name,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Church History Section */}
          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">


            {/* Hidden INC Status */}
            <Box style={{ display: "none" }}>
              <RadioGroup
                name="inc_status"
                onChange={(value) => handleChange(value, "inc_status")}
                value={personnelData.inc_status}
              >
                <Stack direction="row">
                  <Radio value="Active">Active</Radio>
                  <Radio disabled value="Non-Active">Non-Active</Radio>
                </Stack>
              </RadioGroup>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <FormControl>
                <FormLabel fontWeight="bold" color="#0a5856">District Origin</FormLabel>
                <Select
                  placeholder="Select District"
                  name="district_id"
                  value={districts
                    .map((district) => ({
                      value: district.id,
                      label: district.name,
                    }))
                    .find((option) => option.value === personnelData.district_id)}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "district_id",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="#0a5856">Local Congregation Origin</FormLabel>
                <Select
                  placeholder="Select Local Congregation"
                  name="local_congregation"
                  value={filteredLocalCongregationsOrigin
                    .map((congregation) => ({
                      value: congregation.id,
                      label: congregation.name,
                    }))
                    .find(
                      (option) =>
                        option.value === personnelData.local_congregation
                    )}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "local_congregation",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={filteredLocalCongregationsOrigin.map(
                    (congregation) => ({
                      value: congregation.id,
                      label: congregation.name,
                    })
                  )}
                  isDisabled={!isEditing || !personnelData.district_id}
                  isClearable
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="#0a5856">Classification</FormLabel>
                <RadioGroup
                  name="is_offered"
                  onChange={(value) =>
                    handleChange({
                      target: { name: "is_offered", value },
                    })
                  }
                  value={
                    personnelData.is_offered !== undefined &&
                      personnelData.is_offered !== null &&
                      personnelData.is_offered !== ""
                      ? personnelData.is_offered
                      : "1"
                  }
                  isDisabled={!isEditing}
                >
                  <Stack direction="row">
                    <Radio value="1">Offered</Radio>
                    <Radio value="0">Convert</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <InfoField
                label="Date Baptized"
                value={personnelData.date_baptized}
                isEditing={isEditing}
              >
                <Input
                  type="date"
                  name="date_baptized"
                  value={personnelData.date_baptized || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "date_baptized",
                        value: e.target.value,
                      },
                    })
                  }
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Place of Baptism"
                value={personnelData.place_of_baptism}
                isEditing={isEditing}
              >
                <Input
                  type="text"
                  name="place_of_baptism"
                  value={personnelData.place_of_baptism || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "place_of_baptism",
                        value: e.target.value,
                      },
                    })
                  }
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="Minister Officiated"
                value={personnelData.minister_officiated}
                isEditing={isEditing}
              >
                <Input
                  type="text"
                  name="minister_officiated"
                  value={personnelData.minister_officiated || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "minister_officiated",
                        value: e.target.value,
                      },
                    })
                  }
                  isDisabled={!isEditing}
                />
              </InfoField>

              <InfoField
                label="District First Registered"
                value={
                  districts.find(
                    (d) => String(d.id) === String(personnelData.district_first_registered)
                  )?.name
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select District"
                  name="district_first_registered"
                  value={districts
                    .map((district) => ({
                      value: district.id,
                      label: district.name,
                    }))
                    .find(
                      (option) =>
                        option.value === personnelData.district_first_registered
                    )}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "district_first_registered",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name,
                  }))}
                  isClearable
                  isDisabled={!isEditing}
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>

              <InfoField
                label="Local First Registered"
                value={
                  localCongregations.find(
                    (c) => String(c.id) === String(personnelData.local_first_registered)
                  )?.name
                }
                isEditing={isEditing}
              >
                <Select
                  placeholder="Select Local Congregation"
                  name="local_first_registered"
                  value={filteredFirstLocalCongregations
                    .map((congregation) => ({
                      value: congregation.id,
                      label: congregation.name,
                    }))
                    .find(
                      (option) =>
                        option.value === personnelData.local_first_registered
                    )}
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "local_first_registered",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  options={filteredFirstLocalCongregations.map(
                    (congregation) => ({
                      value: congregation.id,
                      label: congregation.name,
                    })
                  )}
                  isDisabled={
                    !isEditing || !personnelData.district_first_registered
                  }
                  isClearable
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              </InfoField>
            </SimpleGrid>
          </Box>

          {/* Personnel Classification Section */}
          <Box mb={6} p={4} borderRadius="lg" bg="white" shadow="sm" border="1px" borderColor="gray.100">

            <InfoField
              label="Personnel Type"
              value={personnelData.personnel_type}
              isEditing={isEditing}
              isRequired
              error={formErrors.personnel_type}
            >
              <RadioGroup
                name="personnel_type"
                onChange={(value) => {
                  handleChange({ target: { name: "personnel_type", value } });
                }}
                value={personnelData.personnel_type}
                isDisabled={!isEditing}
              >
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={{ base: 2, md: 4 }}
                  wrap="wrap"
                >
                  {filteredPersonnelTypes.map((type) => (
                    <Radio
                      key={type}
                      value={type}
                    >
                      {type}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </InfoField>
          </Box>

          {/* Conditional Fields Based on Personnel Type */}
          {["Lay Member"].includes(personnelData.personnel_type) && (
            <>
              <Flex align="center" mb="3" width="100%">
                <Text
                  fontWeight="bold"
                  mr="4"
                  minWidth="120px"
                  whiteSpace="nowrap"
                  color="#0a5856"
                >
                  Church Duty:
                </Text>
                <Button
                  onClick={handleAddDuty}
                  isDisabled={!isEditing || duties.length >= 5}
                >
                  Add New
                </Button>
              </Flex>

              {duties.length > 0 ? (
                <Box bg="white" p={6} rounded="xl" shadow="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          #
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Duty
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Start Year
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          End Year
                        </Th>
                        <Th textAlign="center" fontSize="sm" color="gray.600">
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {duties.map((duty, index) => (
                        <Tr
                          key={index}
                          _hover={{ bg: "gray.100" }}
                          transition="background 0.2s"
                        >
                          <Td textAlign="center" fontWeight="semibold">
                            {index + 1}
                          </Td>
                          <Td>
                            <Input
                              value={duty.duty || ""}
                              onChange={(e) =>
                                handleDutyChange(index, "duty", e.target.value)
                              }
                              placeholder="Duty"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              value={duty.start_year || ""}
                              onChange={(e) =>
                                handleDutyChange(
                                  index,
                                  "start_year",
                                  e.target.value
                                )
                              }
                              placeholder="Start"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              value={duty.end_year || ""}
                              onChange={(e) =>
                                handleDutyChange(
                                  index,
                                  "end_year",
                                  e.target.value
                                )
                              }
                              placeholder="End"
                              variant="unstyled"
                              borderBottom="1px solid"
                              borderColor="gray.200"
                              borderRadius="none"
                              _focus={{ borderColor: "blue.400", bg: "white" }}
                              isDisabled={!isEditing}
                              textAlign="center"
                            />
                          </Td>
                          <Td textAlign="center">
                            <IconButton
                              aria-label="Delete Duty"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDuty(index)}
                              isDisabled={!isEditing}
                              _hover={{ bg: "red.100" }}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box textAlign="center" py={5} fontSize="lg" color="gray.500">
                  No duties available.
                </Box>
              )}
            </>
          )}

          {/* Conditional Fields Based on Personnel Type */}
          {personnelData.gender === "Male" &&
            ["Minister", "Regular", "Ministerial Student"].includes(
              personnelData.personnel_type
            ) && (
              <>
                <InfoField
                  label="Assigned Number"
                  value={personnelData.assigned_number}
                  isEditing={isEditing}
                >
                  <Input
                    type="number"
                    placeholder="Enter Assigned Number"
                    name="assigned_number"
                    value={personnelData.assigned_number || ""}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "assigned_number",
                          value: e.target.value,
                        },
                      })
                    }
                    width="100%"
                    min="0"
                    isDisabled={!isEditing}
                  />
                </InfoField>

                <InfoField
                  label="Classification in Central Office"
                  value={personnelData.m_status}
                  isEditing={isEditing}
                >
                  <RadioGroup
                    name="m_status"
                    onChange={(value) =>
                      handleChange({ target: { name: "m_status", value } })
                    }
                    value={personnelData.m_status}
                    isDisabled={!isEditing}
                  >
                    <Stack direction="row" spacing={4} wrap="wrap">
                      <Radio value="May Destino">May Destino</Radio>
                      <Radio value="Fulltime">Fulltime</Radio>
                    </Stack>
                  </RadioGroup>
                </InfoField>

                {/* Conditional Rendering for District and Local Assignments */}
                {personnelData.m_status === "May Destino" && (
                  <Flex
                    align="center"
                    mb="3"
                    width="100%"
                    wrap="wrap"
                    justify="space-between"
                  >
                    {/* District Assignment*/}
                    <InfoField
                      label="District Assignment"
                      value={
                        districts.find(
                          (d) =>
                            String(d.id) ===
                            String(personnelData.district_assignment_id)
                        )?.name
                      }
                      isEditing={isEditing}
                    >
                      <Select
                        placeholder="Select District"
                        name="district_assignment_id"
                        value={districts
                          .map((district) => ({
                            value: district.id,
                            label: district.name,
                          }))
                          .find(
                            (option) =>
                              option.value ===
                              personnelData.district_assignment_id
                          )}
                        onChange={(selectedOption) =>
                          handleChange({
                            target: {
                              name: "district_assignment_id",
                              value: selectedOption?.value || "",
                            },
                          })
                        }
                        options={districts.map((district) => ({
                          value: district.id,
                          label: district.name,
                        }))}
                        isClearable
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                        }}
                        isDisabled={!isEditing}
                      />
                    </InfoField>

                    {/* Local Congregation Assignment Dropdown */}
                    <InfoField
                      label="Local Congregation Assignment"
                      value={
                        localCongregations.find(
                          (c) =>
                            String(c.id) ===
                            String(personnelData.local_congregation_assignment)
                        )?.name
                      }
                      isEditing={isEditing}
                    >
                      <Select
                        placeholder="Select Local Congregation"
                        name="local_congregation_assignment"
                        value={filteredLocalCongregationsAssignment
                          .map((congregation) => ({
                            value: congregation.id,
                            label: congregation.name,
                          }))
                          .find(
                            (option) =>
                              option.value ===
                              personnelData.local_congregation_assignment
                          )}
                        onChange={(selectedOption) =>
                          handleChange({
                            target: {
                              name: "local_congregation_assignment",
                              value: selectedOption?.value || "",
                            },
                          })
                        }
                        options={filteredLocalCongregationsAssignment.map(
                          (congregation) => ({
                            value: congregation.id,
                            label: congregation.name,
                          })
                        )}
                        isDisabled={
                          !isEditing || !personnelData.district_assignment_id
                        } // Disable if no district is selected
                        isClearable
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                        }}
                      />
                    </InfoField>
                  </Flex>
                )}
              </>
            )}

          {/* Panunumpa Date */}
          {personnelData.gender === "Male" &&
            ["Minister", "Regular"].includes(personnelData.personnel_type) && (
              <InfoField
                label="Date of Oath-taking as Worker"
                value={personnelData.panunumpa_date}
                isEditing={isEditing}
              >
                <Input
                  placeholder="Panunumpa Date"
                  name="panunumpa_date"
                  type="date"
                  value={personnelData.panunumpa_date || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "panunumpa_date", value: e.target.value },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>
            )}

          {/* Ordination Date */}
          {personnelData.gender === "Male" &&
            personnelData.personnel_type === "Minister" && (
              <InfoField
                label="Date of Ordination"
                value={personnelData.ordination_date}
                isEditing={isEditing}
              >
                <Input
                  placeholder="Ordination Date"
                  name="ordination_date"
                  type="date"
                  value={personnelData.ordination_date}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "ordination_date",
                        value: e.target.value,
                      },
                    })
                  }
                  width="100%"
                  isDisabled={!isEditing}
                />
              </InfoField>
            )}
        </Box>
      )
      }
    </Box >
  );
};

export default Step1;
