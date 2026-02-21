// src/pages/Step7.js
import React, { useState, useEffect } from "react";
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
  Divider
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";
import Select from "react-select";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import InfoField from "./PreviewForm";

const API_URL = process.env.REACT_APP_API_URL;

const Step7 = ({
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
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    let child = data[index];

    const {
      id,
      isEditing,
      relationship_type = child.relationship_type, // Fallback to the existing key if relationship_type is undefined,
      gender,
      givenName,
      lastName,
      ...childData
    } = child;

    // Prepare the data to send
    const formattedData = {
      ...childData,
      gender: child.gender,
      givenname: child.givenname,
      lastname: child.lastname,
      date_of_birth: child.date_of_birth,
      relationship_type: relationship_type,
      personnel_id: personnelId,
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "gender",
      "givenname",
      "lastname",
      "date_of_birth",
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
      let updateChildren;

      if (id) {
        // Update existing children record
        const response = await putData("family-members", id, formattedData);
        updateChildren = response?.family_member;
      } else {
        // Save new children record
        const response = await postData("family-members", formattedData);
        updateChildren = response?.family_member; // ✅ Ensure we get the new ID
      }

      // Update children in state
      onToggleEdit(index); // Disable editing mode for the updated children
      onChange(index, "id", updateChildren.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Child Updated" : "Child Added",
        description: `${relationship_type} information has been ${id ? "updated" : "added"
          } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error(
        "Error saving/updating children information:",
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

  // Function to remove a child entry
  const handleRemoveChild = async (index) => {
    const child = data[index];

    if (child.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this child?"
      );
      if (!confirmed) return;

      try {
        await deleteData("family-members", child.id); // Use reusable function
        toast({
          title: "Child Deleted",
          description: "Child information has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      } catch (error) {
        console.error("Error deleting child:", error);
        toast({
          title: "Error",
          description: "Failed to delete child information.",
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
        Step 7: Child Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {data.map((child, index) => (
          <Box key={child.id || child.generatedId || `child-${index}`} w="100%" pb={4} bg="white" shadow="sm" border="1px" borderColor="gray.100" borderRadius="lg">

            {/* Header with Buttons */}
            <Flex justifyContent="flex-end" px={4} py={2} mb={2}>
              <Flex gap={2}>
                <IconButton
                  icon={child.isEditing ? <CheckIcon /> : <EditIcon />}
                  onClick={async () => {
                    if (child.isEditing) {
                      await handleSaveOrUpdate(index);
                      // handleSaveOrUpdate calls onToggleEdit(index)
                    } else {
                      onToggleEdit(index);
                    }
                  }}
                  colorScheme={child.isEditing ? "green" : "blue"}
                  size="sm"
                  aria-label={child.isEditing ? "Save" : "Edit"}
                />
                {child.isEditing && (
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemoveChild(index)}
                    size="sm"
                    aria-label="Delete"
                  />
                )}
              </Flex>
            </Flex>

            {/* Deceased Toggle */}
            <FormControl display="flex" alignItems="center" mb={4} px={4}>
              <Checkbox
                isChecked={child.is_deceased || false}
                onChange={(e) => onChange(index, "is_deceased", e.target.checked)}
                colorScheme="red"
                isDisabled={!child.isEditing}
              >
                <Text fontWeight="bold" color="red.500">
                  Deceased (Check if applicable)
                </Text>
              </Checkbox>
            </FormControl>

            {/* Personal Information Group */}
            <Box mb={6} px={4}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Personal Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Gender"
                  value={child.gender}
                  isEditing={child.isEditing}
                  isRequired
                >
                  <Select
                    placeholder="Select Gender"
                    value={child.gender ? { value: child.gender, label: child.gender } : null}
                    onChange={(selectedOption) => onChange(index, "gender", selectedOption?.value || "")}
                    options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                    isDisabled={!child.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Given Name"
                  value={child.givenname}
                  isEditing={child.isEditing}
                  isRequired
                >
                  <Input placeholder="Given Name" value={child.givenname || ""} onChange={(e) => onChange(index, "givenname", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Middle Name"
                  value={child.middlename}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Middle Name" value={child.middlename || ""} onChange={(e) => onChange(index, "middlename", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Last Name"
                  value={child.lastname}
                  isEditing={child.isEditing}
                  isRequired
                >
                  <Input placeholder="Last Name" value={child.lastname || ""} onChange={(e) => onChange(index, "lastname", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Suffix"
                  value={child.suffix}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Suffix"
                    name="suffix"
                    value={child.suffix ? { value: child.suffix, label: child.suffix } : null}
                    onChange={(selectedOption) => onChange(index, "suffix", selectedOption?.value || "")}
                    options={suffixOptions.map((suffix) => ({ value: suffix, label: suffix }))}
                    isDisabled={!child.isEditing || child.gender === "Female"}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Date of Birth"
                  value={child.date_of_birth}
                  isEditing={child.isEditing}
                  isRequired
                >
                  <Input type="date" value={child.date_of_birth || ""} onChange={(e) => onChange(index, "date_of_birth", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Contact Number"
                  value={child.contact_number}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Contact Number" value={child.contact_number || ""} onChange={(e) => onChange(index, "contact_number", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Blood Type"
                  value={child.bloodtype}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Blood Type"
                    value={child.bloodtype ? { value: child.bloodtype, label: child.bloodtype } : null}
                    onChange={(opt) => onChange(index, "bloodtype", opt?.value || "")}
                    options={bloodtypes.map(t => ({ value: t, label: t }))}
                    isDisabled={!child.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Civil Status"
                  value={child.civil_status}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Civil Status"
                    value={child.civil_status ? { value: child.civil_status, label: child.civil_status } : null}
                    onChange={(opt) => onChange(index, "civil_status", opt?.value || "")}
                    options={civilStatusOptions.map(s => ({ value: s, label: s }))}
                    isDisabled={!child.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Date of Marriage"
                  value={child.date_of_marriage}
                  isEditing={child.isEditing}
                >
                  <Input type="date" value={child.date_of_marriage || ""} onChange={(e) => onChange(index, "date_of_marriage", e.target.value)} isDisabled={!child.isEditing || child.civil_status === "Single"} />
                </InfoField>
                <InfoField
                  label="Place of Marriage"
                  value={child.place_of_marriage}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Place of Marriage" value={child.place_of_marriage || ""} onChange={(e) => onChange(index, "place_of_marriage", e.target.value)} isDisabled={!child.isEditing || child.civil_status === "Single"} />
                </InfoField>
                <InfoField
                  label="Citizenship"
                  value={citizenships.find(c => c.id === child.citizenship)?.citizenship}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Citizenship"
                    value={child.citizenship ? citizenships.map(c => ({ value: c.id, label: c.citizenship })).find(opt => opt.value === child.citizenship) : null}
                    onChange={(opt) => onChange(index, "citizenship", opt?.value || "")}
                    options={citizenships.map(c => ({ value: c.id, label: c.citizenship }))}
                    isDisabled={!child.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Ethnicity"
                  value={nationalities.find(n => n.id === child.nationality)?.nationality}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Ethnicity"
                    value={child.nationality ? nationalities.map(n => ({ value: n.id, label: n.nationality })).find(opt => opt.value === child.nationality) : null}
                    onChange={(opt) => onChange(index, "nationality", opt?.value || "")}
                    options={nationalities.map(n => ({ value: n.id, label: n.nationality }))}
                    isDisabled={!child.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Livelihood"
                  value={child.livelihood}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Livelihood" value={child.livelihood || ""} onChange={(e) => onChange(index, "livelihood", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="District"
                  value={districts.find(d => d.id === child.district_id)?.name}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select District"
                    value={districts.map(d => ({ value: d.id, label: d.name })).find(opt => opt.value === child.district_id) || null}
                    onChange={(opt) => {
                      onChange(index, "district_id", opt?.value || "");
                      onChange(index, "local_congregation", "");
                    }}
                    options={districts.map(d => ({ value: d.id, label: d.name }))}
                    isClearable
                    isDisabled={!child.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Local Congregation"
                  value={localCongregations.find(c => c.id === child.local_congregation)?.name}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Local Congregation"
                    value={(filteredCongregations[child.district_id] || []).map(c => ({ value: c.id, label: c.name })).find(opt => opt.value === child.local_congregation) || null}
                    onChange={(opt) => onChange(index, "local_congregation", opt?.value || "")}
                    options={(filteredCongregations[child.district_id] || []).map(c => ({ value: c.id, label: c.name }))}
                    isClearable
                    isDisabled={!child.isEditing || !child.district_id}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Church Duties"
                  value={child.church_duties}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Church Duties" value={child.church_duties || ""} onChange={(e) => onChange(index, "church_duties", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <FormControl display="none">
                  <Input placeholder="Evangelist" value={child.minister_officiated || ""} onChange={(e) => onChange(index, "minister_officiated", e.target.value)} />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Employment Details Group */}
            <Box mb={6} px={4} opacity={child.is_deceased ? 0.5 : 1} pointerEvents={child.is_deceased ? "none" : "auto"}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Employment Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Employment Type"
                  value={child.employment_type}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Employment Type"
                    value={child.employment_type ? employmentTypeOptions.map(t => ({ value: t, label: t })).find(opt => opt.value === child.employment_type) : null}
                    onChange={(opt) => onChange(index, "employment_type", opt?.value || "")}
                    options={employmentTypeOptions.map(t => ({ value: t, label: t }))}
                    isClearable
                    isDisabled={!child.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Company"
                  value={child.company}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Company" value={child.company || ""} onChange={(e) => onChange(index, "company", e.target.value)} isDisabled={!child.isEditing || ["Volunteer/Kawani"].includes(child.employment_type)} />
                </InfoField>
                <InfoField
                  label="Address"
                  value={child.address}
                  isEditing={child.isEditing}
                >
                  <Textarea rows={1} placeholder="Address" value={child.address || ""} onChange={(e) => onChange(index, "address", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Brief Description of Responsibilities"
                  value={child.position}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Brief Description" value={child.position || ""} onChange={(e) => onChange(index, "position", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <FormControl display="none">
                  <Input placeholder="Department" value={child.department || ""} onChange={(e) => onChange(index, "department", e.target.value)} />
                </FormControl>
                <InfoField
                  label="Start Date"
                  value={child.start_date}
                  isEditing={child.isEditing}
                >
                  <Input type="date" value={child.start_date || ""} onChange={(e) => onChange(index, "start_date", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="End Date"
                  value={child.end_date}
                  isEditing={child.isEditing}
                >
                  <Input type="date" value={child.end_date || ""} onChange={(e) => onChange(index, "end_date", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Reason for Leaving"
                  value={child.reason_for_leaving}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Reason for Leaving" value={child.reason_for_leaving || ""} onChange={(e) => onChange(index, "reason_for_leaving", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
              </SimpleGrid>
            </Box>

            {/* Edu Info */}
            <Box mb={6} px={4}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Educational Background
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <InfoField
                  label="Educational Level"
                  value={child.education_level}
                  isEditing={child.isEditing}
                >
                  <Select
                    placeholder="Select Educational Level"
                    value={child.education_level ? educationalLevelOptions.map(l => ({ value: l, label: l })).find(opt => opt.value === child.education_level) : null}
                    onChange={(opt) => onChange(index, "education_level", opt?.value || "")}
                    options={educationalLevelOptions.map(l => ({ value: l, label: l }))}
                    isClearable
                    isDisabled={!child.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </InfoField>
                <InfoField
                  label="Start Year"
                  value={child.start_year}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Start Year" type="number" value={child.start_year || ""} onChange={(e) => onChange(index, "start_year", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Completion Year"
                  value={child.completion_year}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Completion Year" type="number" value={child.completion_year || ""} onChange={(e) => onChange(index, "completion_year", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="School"
                  value={child.school}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="School" value={child.school || ""} onChange={(e) => onChange(index, "school", e.target.value)} isDisabled={!child.isEditing} />
                </InfoField>
                <InfoField
                  label="Field of Study"
                  value={child.field_of_study}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Field of Study" value={child.field_of_study || ""} onChange={(e) => onChange(index, "field_of_study", e.target.value)} isDisabled={!child.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(child.education_level)} />
                </InfoField>
                <InfoField
                  label="Degree"
                  value={child.degree}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Degree" value={child.degree || ""} onChange={(e) => onChange(index, "degree", e.target.value)} isDisabled={!child.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(child.education_level)} />
                </InfoField>
                <InfoField
                  label="Professional Licensure"
                  value={child.professional_licensure_examination}
                  isEditing={child.isEditing}
                >
                  <Input placeholder="Licensure" value={child.professional_licensure_examination || ""} onChange={(e) => onChange(index, "professional_licensure_examination", e.target.value)} isDisabled={!child.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(child.education_level)} />
                </InfoField>
              </SimpleGrid>
            </Box>
          </Box>
        ))}
        <Button onClick={onAdd} colorScheme="teal">
          Add Child
        </Button>
      </VStack>
    </Box>
  );
};

export default Step7;
