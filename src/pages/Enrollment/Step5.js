// src/pages/Step5.js
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Button,
  IconButton,
  useToast,
  SimpleGrid,
  FormControl,
  FormLabel,
  Flex,
  Checkbox,
  Textarea,
  Divider,
  Badge
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import InfoField from "./PreviewForm";

const API_URL = process.env.REACT_APP_API_URL;

const Step5 = ({
  data = [], // Ensure data defaults to an empty array
  setData, // Added setData as a prop
  onAdd,
  onChange,
  onToggleEdit,
  citizenships,
  nationalities,
  suffixOptions,
  districts,
  localCongregations,
  civilStatusOptions,
  employmentTypeOptions,
  educationalLevelOptions,
  bloodtypes,
}) => {
  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  // Local state for filtered congregations per parent
  const [filteredCongregations, setFilteredCongregations] = useState({});

  // ✅ Update local congregations dynamically when a district is selected
  useEffect(() => {
    if (data.length > 0) {
      const newFilteredCongregations = {};

      data.forEach((parent) => {
        if (parent.district_id) {
          newFilteredCongregations[parent.district_id] =
            localCongregations.filter(
              (congregation) => congregation.district_id === parent.district_id
            );
        }
      });

      setFilteredCongregations(newFilteredCongregations);
    }
  }, [data, localCongregations]);

  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const toast = useToast();
  const [loading, setLoading] = useState(false);


  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const sibling = data[index];

    const {
      id,
      isEditing,
      relationship_type = sibling.relationship_type, // Fallback to the existing key if relationship_type is undefined,
      gender,
      givenName,
      lastName,
      ...siblingData
    } = sibling;

    // Prepare data for saving/updating
    const formattedData = {
      ...siblingData,
      givenname: sibling.givenname,
      lastname: sibling.lastname,
      gender: sibling.gender,
      relationship_type: "Sibling",
      personnel_id: personnelId,
      date_of_birth: sibling.date_of_birth || null, // Ensure empty date is set to null
      contact_number: sibling.contact_number
        ? String(sibling.contact_number)
        : null, // Ensure it is a string
    };

    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "gender",
      "givenname",
      "lastname",
      "date_of_birth", // Add date_of_birth as required
    ];
    const missingField = requiredFields.find(
      (field) =>
        !formattedData[field] ||
        (typeof formattedData[field] === "string" &&
          formattedData[field].trim() === "")
    );

    if (missingField) {
      toast({
        title: "Validation Error",
        description: `The field "${missingField}" is required for ${relationship_type}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      setLoading(false); // Reset loading state
      return;
    }

    try {
      let updatedSibling;

      if (id) {
        // Update existing sibling record
        const response = await putData("family-members", id, formattedData);
        updatedSibling = response?.family_member;
      } else {
        // Save new sibling record
        const response = await postData("family-members", formattedData);
        updatedSibling = response?.family_member;
      }

      // Update sibling in state
      onToggleEdit(index); // Disable editing mode for the updated sibling
      onChange(index, "id", updatedSibling.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Sibling Updated" : "Sibling Added",
        description: `${relationship_type} information has been ${id ? "updated" : "added"
          } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error(
        "Error saving/updating sibling information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to ${id ? "update" : "add"
          } ${relationship_type} information. ${error.response?.data?.message || "Please try again later."
          }`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to remove a sibling entry
  const handleRemoveSibling = async (index) => {
    const sibling = data[index];

    if (sibling.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this sibling?"
      );
      if (!confirmed) return;

      try {
        await deleteData("family-members", sibling.id);
        toast({
          title: "Sibling Deleted",
          description: "Sibling information has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting sibling:", error);
        toast({
          title: "Error",
          description: "Failed to delete sibling information.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }

    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={{ base: 4, md: 5 }}>
      <Heading as="h2" size={{ base: "lg", md: "xl" }} textAlign="center" mb={2} color="#0a5856">
        Step 5: Siblings Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {data.map((sibling, index) => (
          <Box key={sibling.id || `sibling-${index}`} w="100%" pb={4} bg="white" shadow="sm" border="1px" borderColor="gray.100" borderRadius="lg">

            {/* Header with Buttons */}
            <Flex justifyContent="flex-end" px={4} py={2} mb={2}>
              <Flex gap={2}>
                <IconButton
                  icon={sibling.isEditing ? <CheckIcon /> : <EditIcon />}
                  onClick={async () => {
                    if (sibling.isEditing) {
                      await handleSaveOrUpdate(index);
                      // handleSaveOrUpdate toggles edit mode inside it if successful? 
                      // actually handleSaveOrUpdate calls onToggleEdit(index) which should toggle it.
                      // But the original onClick also had onChange(index, "isEditing", false/true).
                      // handleSaveOrUpdate in Step5 calls onToggleEdit(index).
                    } else {
                      onToggleEdit(index);
                    }
                  }}
                  colorScheme={sibling.isEditing ? "green" : "blue"}
                  size="sm"
                  aria-label={sibling.isEditing ? "Save" : "Edit"}
                />
                {sibling.isEditing && (
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemoveSibling(index)}
                    size="sm"
                    aria-label="Delete"
                  />
                )}
              </Flex>
            </Flex>

            {/* Deceased Toggle */}
            <Box mb={4} px={4}>
              {sibling.isEditing ? (
                <FormControl display="flex" alignItems="center">
                  <Checkbox
                    isChecked={sibling.is_deceased || false}
                    onChange={(e) => onChange(index, "is_deceased", e.target.checked)}
                    colorScheme="red"
                  >
                    <Text fontWeight="bold" color="red.500">
                      Deceased (Check if applicable)
                    </Text>
                  </Checkbox>
                </FormControl>
              ) : (
                sibling.is_deceased && (
                  <Badge colorScheme="red" variant="solid" px={3} py={1} borderRadius="full">
                    Deceased
                  </Badge>
                )
              )}
            </Box>

            {/* Personal Information Group */}
            <Box mb={6} px={4}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Personal Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Gender"
                  value={sibling.gender}
                  isEditing={sibling.isEditing}
                  isRequired
                >
                  <Select
                    placeholder="Select Gender"
                    value={sibling.gender ? { value: sibling.gender, label: sibling.gender } : null}
                    onChange={(selectedOption) => onChange(index, "gender", selectedOption?.value || "")}
                    options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                    isDisabled={!sibling.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Given Name"
                  value={sibling.givenname}
                  isEditing={sibling.isEditing}
                  isRequired
                >
                  <Input placeholder="Given Name" value={sibling.givenname || ""} onChange={(e) => onChange(index, "givenname", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Middle Name"
                  value={sibling.middlename}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Middle Name" value={sibling.middlename || ""} onChange={(e) => onChange(index, "middlename", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Last Name"
                  value={sibling.lastname}
                  isEditing={sibling.isEditing}
                  isRequired
                >
                  <Input placeholder="Last Name" value={sibling.lastname || ""} onChange={(e) => onChange(index, "lastname", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Suffix"
                  value={sibling.suffix}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Suffix"
                    name="suffix"
                    value={sibling.suffix ? { value: sibling.suffix, label: sibling.suffix } : null}
                    onChange={(selectedOption) => onChange(index, "suffix", selectedOption?.value || "")}
                    options={suffixOptions.map((suffix) => ({ value: suffix, label: suffix }))}
                    isDisabled={!sibling.isEditing || sibling.gender === "Female"}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Date of Birth"
                  value={sibling.date_of_birth}
                  isEditing={sibling.isEditing}
                  isRequired
                >
                  <Input type="date" value={sibling.date_of_birth || ""} onChange={(e) => onChange(index, "date_of_birth", e.target.value)} isDisabled={!sibling.isEditing} max={new Date().toISOString().split("T")[0]} />
                </InfoField>

                <InfoField
                  label="Contact Number"
                  value={sibling.contact_number}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Contact Number" value={sibling.contact_number || ""} onChange={(e) => onChange(index, "contact_number", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Blood Type"
                  value={sibling.bloodtype}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Blood Type"
                    name="bloodtype"
                    value={sibling.bloodtype ? { value: sibling.bloodtype, label: sibling.bloodtype } : null}
                    onChange={(selectedOption) => onChange(index, "bloodtype", selectedOption?.value || "")}
                    options={bloodtypes.map((type) => ({ value: type, label: type }))}
                    isDisabled={!sibling.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Civil Status"
                  value={sibling.civil_status}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Civil Status"
                    name="civil_status"
                    value={sibling.civil_status ? { value: sibling.civil_status, label: sibling.civil_status } : null}
                    onChange={(selectedOption) => onChange(index, "civil_status", selectedOption?.value || "")}
                    options={civilStatusOptions.map((status) => ({ value: status, label: status }))}
                    isDisabled={!sibling.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Date of Marriage"
                  value={sibling.date_of_marriage}
                  isEditing={sibling.isEditing}
                >
                  <Input type="date" value={sibling.date_of_marriage || ""} onChange={(e) => onChange(index, "date_of_marriage", e.target.value)} isDisabled={!sibling.isEditing || sibling.civil_status === "Single"} />
                </InfoField>

                <InfoField
                  label="Place of Marriage"
                  value={sibling.place_of_marriage}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Place of Marriage" value={sibling.place_of_marriage || ""} onChange={(e) => onChange(index, "place_of_marriage", e.target.value)} isDisabled={!sibling.isEditing || sibling.civil_status === "Single"} />
                </InfoField>

                <InfoField
                  label="Citizenship"
                  value={citizenships.find(c => String(c.id) === String(sibling.citizenship))?.citizenship}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Citizenship"
                    value={sibling.citizenship ? citizenships.map(c => ({ value: c.id, label: c.citizenship })).find(opt => String(opt.value) === String(sibling.citizenship)) : null}
                    onChange={(opt) => onChange(index, "citizenship", opt?.value || "")}
                    options={citizenships.map(c => ({ value: c.id, label: c.citizenship }))}
                    isDisabled={!sibling.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Ethnicity"
                  value={nationalities.find(n => String(n.id) === String(sibling.nationality))?.nationality}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Ethnicity"
                    value={sibling.nationality ? nationalities.map(n => ({ value: n.id, label: n.nationality })).find(opt => String(opt.value) === String(sibling.nationality)) : null}
                    onChange={(opt) => onChange(index, "nationality", opt?.value || "")}
                    options={nationalities.map(n => ({ value: n.id, label: n.nationality }))}
                    isDisabled={!sibling.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Livelihood"
                  value={sibling.livelihood}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Livelihood" value={sibling.livelihood || ""} onChange={(e) => onChange(index, "livelihood", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="District"
                  value={districts.find(d => String(d.id) === String(sibling.district_id))?.name}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select District"
                    value={districts.map(d => ({ value: d.id, label: d.name })).find(opt => String(opt.value) === String(sibling.district_id)) || null}
                    onChange={(opt) => {
                      onChange(index, "district_id", opt?.value || "");
                      onChange(index, "local_congregation", "");
                    }}
                    options={districts.map(d => ({ value: d.id, label: d.name }))}
                    isClearable
                    isDisabled={!sibling.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Local Congregation"
                  value={localCongregations.find(c => String(c.id) === String(sibling.local_congregation))?.name}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Local Congregation"
                    value={(filteredCongregations[sibling.district_id] || []).map(c => ({ value: c.id, label: c.name })).find(opt => String(opt.value) === String(sibling.local_congregation)) || null}
                    onChange={(opt) => onChange(index, "local_congregation", opt?.value || "")}
                    options={(filteredCongregations[sibling.district_id] || []).map(c => ({ value: c.id, label: c.name }))}
                    isClearable
                    isDisabled={!sibling.isEditing || !sibling.district_id}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Church Duties"
                  value={sibling.church_duties}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Church Duties" value={sibling.church_duties || ""} onChange={(e) => onChange(index, "church_duties", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>
              </SimpleGrid>
            </Box>

            {/* Employment Details Group */}
            <Box mb={6} px={4} opacity={sibling.is_deceased ? 0.5 : 1} pointerEvents={sibling.is_deceased && !sibling.isEditing ? "none" : "auto"}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Employment Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Employment Type"
                  value={sibling.employment_type}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Employment Type"
                    value={sibling.employment_type ? employmentTypeOptions.map(t => ({ value: t, label: t })).find(opt => opt.value === sibling.employment_type) : null}
                    onChange={(opt) => onChange(index, "employment_type", opt?.value || "")}
                    options={employmentTypeOptions.map(t => ({ value: t, label: t }))}
                    isClearable
                    isDisabled={!sibling.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Company"
                  value={sibling.company}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Company" value={sibling.company || ""} onChange={(e) => onChange(index, "company", e.target.value)} isDisabled={!sibling.isEditing || ["Volunteer/Kawani", "Unemployed", "Retired"].includes(sibling.employment_type)} />
                </InfoField>

                <InfoField
                  label="Address"
                  value={sibling.address}
                  isEditing={sibling.isEditing}
                >
                  <Textarea rows={1} placeholder="Address" value={sibling.address || ""} onChange={(e) => onChange(index, "address", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Responsibilities"
                  value={sibling.position}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Brief Description" value={sibling.position || ""} onChange={(e) => onChange(index, "position", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Start Date"
                  value={sibling.start_date}
                  isEditing={sibling.isEditing}
                >
                  <Input type="date" value={sibling.start_date || ""} onChange={(e) => onChange(index, "start_date", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="End Date"
                  value={sibling.end_date}
                  isEditing={sibling.isEditing}
                >
                  <Input type="date" value={sibling.end_date || ""} onChange={(e) => onChange(index, "end_date", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Reason for Leaving"
                  value={sibling.reason_for_leaving}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Reason for Leaving" value={sibling.reason_for_leaving || ""} onChange={(e) => onChange(index, "reason_for_leaving", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>
              </SimpleGrid>
            </Box>

            {/* Educational Background Group */}
            <Box mb={6} px={4}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Educational Background
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Educational Level"
                  value={sibling.education_level}
                  isEditing={sibling.isEditing}
                >
                  <Select
                    placeholder="Select Educational Level"
                    value={sibling.education_level ? educationalLevelOptions.map(l => ({ value: l, label: l })).find(opt => opt.value === sibling.education_level) : null}
                    onChange={(opt) => onChange(index, "education_level", opt?.value || "")}
                    options={educationalLevelOptions.map(l => ({ value: l, label: l }))}
                    isClearable
                    isDisabled={!sibling.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>

                <InfoField
                  label="Start Year"
                  value={sibling.start_year}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Start Year" type="number" value={sibling.start_year || ""} onChange={(e) => onChange(index, "start_year", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Completion Year"
                  value={sibling.completion_year}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Completion Year" type="number" value={sibling.completion_year || ""} onChange={(e) => onChange(index, "completion_year", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="School"
                  value={sibling.school}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="School" value={sibling.school || ""} onChange={(e) => onChange(index, "school", e.target.value)} isDisabled={!sibling.isEditing} />
                </InfoField>

                <InfoField
                  label="Field of Study"
                  value={sibling.field_of_study}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Field of Study" value={sibling.field_of_study || ""} onChange={(e) => onChange(index, "field_of_study", e.target.value)} isDisabled={!sibling.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(sibling.education_level)} />
                </InfoField>

                <InfoField
                  label="Degree"
                  value={sibling.degree}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Degree" value={sibling.degree || ""} onChange={(e) => onChange(index, "degree", e.target.value)} isDisabled={!sibling.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(sibling.education_level)} />
                </InfoField>

                <InfoField
                  label="Professional Licensure"
                  value={sibling.professional_licensure_examination}
                  isEditing={sibling.isEditing}
                >
                  <Input placeholder="Licensure" value={sibling.professional_licensure_examination || ""} onChange={(e) => onChange(index, "professional_licensure_examination", e.target.value)} isDisabled={!sibling.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(sibling.education_level)} />
                </InfoField>
              </SimpleGrid>
            </Box>
          </Box>
        ))}

        <Button onClick={onAdd} colorScheme="teal">Add Sibling</Button>
      </VStack>
    </Box>
  );
};
export default Step5;
