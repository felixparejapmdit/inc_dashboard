// src/pages/Step4.js
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  IconButton,
  useToast,
  SimpleGrid,
  FormControl,
  FormLabel,
  Flex,
  Divider,
  Button,
  Checkbox,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import { CheckIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import InfoField from "./PreviewForm";

const API_URL = process.env.REACT_APP_API_URL;

const Step4 = ({
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

  const [loading, setLoading] = useState(false);
  const toast = useToast();


  const handleSaveOrUpdate = async (index) => {
    setLoading(true);

    const updatedParent = data[index];

    const {
      id,
      isEditing,
      relationship_type = updatedParent.relationship_type,
      gender,
      givenName,
      lastName,
      ...parentData
    } = updatedParent;

    const formattedData = {
      ...parentData,
      gender: updatedParent.gender,
      givenname: updatedParent.givenname,
      lastname: updatedParent.lastname,
      date_of_birth: updatedParent.date_of_birth,
      relationship_type: relationship_type,
      personnel_id: personnelId,
      suffix: updatedParent.suffix,
      civil_status: updatedParent.civil_status,
      bloodtype: updatedParent.bloodtype,
      citizenship: updatedParent.citizenship,
      nationality: updatedParent.nationality, // corrected from ethnicity if that's what's used
      district_id: updatedParent.district_id,
      local_congregation: updatedParent.local_congregation,
    };

    console.log("🛠️ Debug - Formatted Data:", formattedData);

    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "gender",
      "date_of_birth",
    ];
    const missingField = requiredFields.find(
      (field) => !formattedData[field] || formattedData[field] === ""
    );

    console.log("⚠️ Debug - Missing Field:", missingField);

    if (missingField) {
      toast({
        title: "Validation Error",
        description: `The field "${missingField}" is required for ${updatedParent.relationship_type}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
      return;
    }

    try {
      let response;
      if (updatedParent.id) {
        // Use custom helper for PUT
        response = await putData(
          "family-members",
          updatedParent.id,
          formattedData
        );
      } else {
        // Use custom helper for POST
        response = await postData("family-members", formattedData);
      }

      const savedParent = response.family_member;

      // Update local state immediately
      const newData = data.map((p, i) =>
        i === index ? { ...p, ...savedParent, isEditing: false } : p
      );
      setData(newData);

      // Also fetch to sync (optional but good for consistency)
      // await fetchParents(); // Removed to prevent overwriting with stale data

      console.log("Saved parent from response:", savedParent);

      toast({
        title: updatedParent.id ? "Parent Updated" : "Parent Added",
        description: `${updatedParent.relationship_type} information has been successfully saved.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      console.error(
        "❌ Error saving/updating parent information:",
        error.response || error
      );
      toast({
        title: "Error",
        description: `Failed to save ${updatedParent.relationship_type
          } information. ${error.response?.data?.message || "Please try again later."
          }`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParent = async (index) => {
    const parent = data[index];

    if (parent.id) {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${parent.relationship_type || 'this parent'} information?`
      );
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteData("family-members", parent.id);
        toast({
          title: "Parent Information Deleted",
          description: `${parent.relationship_type} information has been successfully deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });

        const newData = data.filter((_, i) => i !== index);
        setData(newData);
      } catch (error) {
        console.error("Error deleting parent information:", error);
        toast({
          title: "Error",
          description: "Failed to delete parent information. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      } finally {
        setLoading(false);
      }
    } else {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
    }
  };

  return (
    <Box width="100%" maxW="none" bg="white" boxShadow="sm" p={{ base: 4, md: 6 }}>
      <Heading as="h2" size={{ base: "lg", md: "xl" }} textAlign="center" mb={2} color="#0a5856">
        Step 4: Parents Information
      </Heading>
      <VStack align="stretch" spacing={4} mb={4} w="100%">
        <Tabs variant="enclosed" colorScheme="blue" w="100%">
          <TabList>
            {data.length > 0 ? (
              data.map((parent, index) => (
                <Tab key={index}>{parent.relationship_type}</Tab>
              ))
            ) : (
              <Tab>Parents</Tab> // Default tab label in case of empty data
            )}
          </TabList>

          <TabPanels w="100%">
            {data.map((parent, index) => (
              <TabPanel key={index} px={0} py={2}>
                <Box w="100%" maxW="none" py={2} bg="white" shadow="sm" border="1px" borderColor="gray.100" borderRadius="lg">
                  {/* Card Header with Edit Button */}
                  <Flex justifyContent="flex-end" mb={4} px={4}>
                    <IconButton
                      icon={parent.isEditing ? <CheckIcon /> : <EditIcon />}
                      onClick={() => {
                        if (parent.isEditing) {
                          handleSaveOrUpdate(index); // Save data and disable editing
                        } else {
                          // Enable editing by updating the state
                          const updatedParents = [...data];
                          updatedParents[index].isEditing = true;
                          setData(updatedParents);
                        }
                      }}
                      colorScheme={parent.isEditing ? "green" : "blue"}
                      aria-label={parent.isEditing ? "Save" : "Edit"}
                      size="sm"
                      mr={2}
                    />
                    {parent.isEditing && (
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleRemoveParent(index)}
                        colorScheme="red"
                        aria-label="Delete"
                        size="sm"
                      />
                    )}
                  </Flex>

                  {/* Deceased Toggle */}
                  <FormControl display="flex" alignItems="center" mb={4} px={4}>
                    <Checkbox
                      isChecked={parent.is_deceased || false}
                      onChange={(e) => onChange(index, "is_deceased", e.target.checked)}
                      colorScheme="red"
                      isDisabled={!parent.isEditing}
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
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
                      <InfoField
                        label="Given Name"
                        value={parent.givenname}
                        isEditing={parent.isEditing}
                        isRequired
                      >
                        <Input placeholder="Given Name" value={parent.givenname || ""} onChange={(e) => onChange(index, "givenname", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Middle Name"
                        value={parent.middlename}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Middle Name" value={parent.middlename || ""} onChange={(e) => onChange(index, "middlename", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label={parent.relationship_type === "Mother" ? "Surname (Maiden Name)" : "Surname"}
                        value={parent.lastname}
                        isEditing={parent.isEditing}
                        isRequired
                      >
                        <Input placeholder="Surname" value={parent.lastname || ""} onChange={(e) => onChange(index, "lastname", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Suffix"
                        value={parent.suffix}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Suffix"
                          name="suffix"
                          value={parent.suffix ? { value: parent.suffix, label: parent.suffix } : null}
                          onChange={(selectedOption) => onChange(index, "suffix", selectedOption?.value || "")}
                          options={suffixOptions.map((suffix) => ({ value: suffix, label: suffix }))}
                          isDisabled={!parent.isEditing || parent.gender === "Female"}
                          isClearable
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Gender"
                        value={parent.relationship_type === "Father" ? "Male" : "Female"}
                        isEditing={parent.isEditing}
                        isRequired
                      >
                        <Select
                          value={{ value: parent.relationship_type === "Father" ? "Male" : "Female", label: parent.relationship_type === "Father" ? "Male" : "Female" }}
                          options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                          isDisabled
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Date of Birth"
                        value={parent.date_of_birth}
                        isEditing={parent.isEditing}
                        isRequired
                      >
                        <Input type="date" value={parent.date_of_birth || ""} onChange={(e) => onChange(index, "date_of_birth", e.target.value)} isDisabled={!parent.isEditing} max={new Date().toISOString().split("T")[0]} />
                      </InfoField>
                      <InfoField
                        label="Contact Number"
                        value={parent.contact_number}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Contact Number" type="number" value={parent.contact_number || ""} onChange={(e) => onChange(index, "contact_number", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Blood Type"
                        value={parent.bloodtype}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Blood Type"
                          value={bloodtypes.map(type => ({ value: type, label: type })).find(opt => String(opt.value) === String(parent.bloodtype))}
                          onChange={(opt) => onChange(index, "bloodtype", opt?.value || "")}
                          options={bloodtypes.map(type => ({ value: type, label: type }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Civil Status"
                        value={parent.civil_status}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Civil Status"
                          value={civilStatusOptions.map(s => ({ value: s, label: s })).find(opt => String(opt.value) === String(parent.civil_status))}
                          onChange={(opt) => onChange(index, "civil_status", opt?.value || "")}
                          options={civilStatusOptions.map(s => ({ value: s, label: s }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Date of Marriage"
                        value={parent.date_of_marriage}
                        isEditing={parent.isEditing}
                        isHidden={parent.civil_status === "Single"}
                      >
                        <Input type="date" value={parent.date_of_marriage || ""} onChange={(e) => onChange(index, "date_of_marriage", e.target.value)} isDisabled={!parent.isEditing || parent.civil_status === "Single"} />
                      </InfoField>
                      <InfoField
                        label="Place of Marriage"
                        value={parent.place_of_marriage}
                        isEditing={parent.isEditing}
                        isHidden={parent.civil_status === "Single"}
                      >
                        <Input placeholder="Place of Marriage" value={parent.place_of_marriage || ""} onChange={(e) => onChange(index, "place_of_marriage", e.target.value)} isDisabled={!parent.isEditing || parent.civil_status === "Single"} />
                      </InfoField>
                      <InfoField
                        label="Citizenship"
                        value={citizenships.find(c => String(c.id) === String(parent.citizenship))?.citizenship}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Citizenship"
                          value={citizenships.map(c => ({ value: c.id, label: c.citizenship })).find(opt => String(opt.value) === String(parent.citizenship))}
                          onChange={(opt) => onChange(index, "citizenship", opt?.value || "")}
                          options={citizenships.map(c => ({ value: c.id, label: c.citizenship }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Ethnicity"
                        value={nationalities.find(n => String(n.id) === String(parent.nationality))?.nationality}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Ethnicity"
                          value={nationalities.map(n => ({ value: n.id, label: n.nationality })).find(opt => String(opt.value) === String(parent.nationality))}
                          onChange={(opt) => onChange(index, "nationality", opt?.value || "")}
                          options={nationalities.map(n => ({ value: n.id, label: n.nationality }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Livelihood"
                        value={parent.livelihood}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Livelihood" value={parent.livelihood || ""} onChange={(e) => onChange(index, "livelihood", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="District"
                        value={districts.find(d => String(d.id) === String(parent.district_id))?.name}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select District"
                          value={districts.map(d => ({ value: d.id, label: d.name })).find(opt => String(opt.value) === String(parent.district_id)) || null}
                          onChange={(opt) => {
                            onChange(index, "district_id", opt?.value || "");
                            onChange(index, "local_congregation", "");
                          }}
                          options={districts.map(d => ({ value: d.id, label: d.name }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Local Congregation"
                        value={(filteredCongregations[parent.district_id] || []).find(c => String(c.id) === String(parent.local_congregation))?.name}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Local Congregation"
                          value={(filteredCongregations[parent.district_id] || []).map(c => ({ value: c.id, label: c.name })).find(opt => String(opt.value) === String(parent.local_congregation)) || null}
                          onChange={(opt) => onChange(index, "local_congregation", opt?.value || "")}
                          options={(filteredCongregations[parent.district_id] || []).map(c => ({ value: c.id, label: c.name }))}
                          isClearable
                          isDisabled={!parent.isEditing || !parent.district_id}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Church Duties"
                        value={parent.church_duties}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Church Duties" value={parent.church_duties || ""} onChange={(e) => onChange(index, "church_duties", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <FormControl display="none">
                        <Input placeholder="Evangelist" value={parent.minister_officiated || ""} onChange={(e) => onChange(index, "minister_officiated", e.target.value)} />
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Work Information Group */}
                  <Box mb={6} px={4} opacity={parent.is_deceased ? 0.5 : 1} pointerEvents={parent.is_deceased ? "none" : "auto"}>
                    <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                      Employment Details
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
                      <InfoField
                        label="Employment Type"
                        value={parent.employment_type}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Employment Type"
                          value={employmentTypeOptions.map(t => ({ value: t, label: t })).find(opt => String(opt.value) === String(parent.employment_type))}
                          onChange={(opt) => onChange(index, "employment_type", opt?.value || "")}
                          options={employmentTypeOptions.map(t => ({ value: t, label: t }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Company"
                        value={parent.company}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Company" value={parent.company || ""} onChange={(e) => onChange(index, "company", e.target.value)} isDisabled={!parent.isEditing || ["Volunteer/Kawani", "Unemployed", "Retired"].includes(parent.employment_type)} />
                      </InfoField>
                      <InfoField
                        label="Company Address"
                        value={parent.address}
                        isEditing={parent.isEditing}
                      >
                        <Textarea rows={1} placeholder="Address" value={parent.address || ""} onChange={(e) => onChange(index, "address", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Brief Description of Responsibilities"
                        value={parent.position}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Brief Description" value={parent.position || ""} onChange={(e) => onChange(index, "position", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <FormControl display="none">
                        <Input placeholder="Department" value={parent.department || ""} onChange={(e) => onChange(index, "department", e.target.value)} />
                      </FormControl>
                      <FormControl display="none">
                        <Input placeholder="Section" value={parent.section || ""} onChange={(e) => onChange(index, "section", e.target.value)} />
                      </FormControl>
                      <InfoField
                        label="Start Date"
                        value={parent.start_date}
                        isEditing={parent.isEditing}
                      >
                        <Input type="date" value={parent.start_date || ""} onChange={(e) => onChange(index, "start_date", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="End Date"
                        value={parent.end_date}
                        isEditing={parent.isEditing}
                      >
                        <Input type="date" value={parent.end_date || ""} onChange={(e) => onChange(index, "end_date", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Reason for Leaving"
                        value={parent.reason_for_leaving}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Reason for Leaving" value={parent.reason_for_leaving || ""} onChange={(e) => onChange(index, "reason_for_leaving", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                    </SimpleGrid>
                  </Box>

                  {/* Educational Info Group */}
                  <Box mb={6} px={4}>
                    <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                      Educational Background
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
                      <InfoField
                        label="Educational Level"
                        value={parent.education_level}
                        isEditing={parent.isEditing}
                      >
                        <Select
                          placeholder="Select Educational Level"
                          value={educationalLevelOptions.map(l => ({ value: l, label: l })).find(opt => String(opt.value) === String(parent.education_level))}
                          onChange={(opt) => onChange(index, "education_level", opt?.value || "")}
                          options={educationalLevelOptions.map(l => ({ value: l, label: l }))}
                          isClearable
                          isDisabled={!parent.isEditing}
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        />
                      </InfoField>
                      <InfoField
                        label="Start Year"
                        value={parent.start_year}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Start Year" value={parent.start_year || ""} onChange={(e) => onChange(index, "start_year", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Completion Year"
                        value={parent.completion_year}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Completion Year" value={parent.completion_year || ""} onChange={(e) => onChange(index, "completion_year", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="School"
                        value={parent.school}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="School" value={parent.school || ""} onChange={(e) => onChange(index, "school", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Field of Study"
                        value={parent.field_of_study}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Field of Study" value={parent.field_of_study || ""} onChange={(e) => onChange(index, "field_of_study", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Degree"
                        value={parent.degree}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Degree" value={parent.degree || ""} onChange={(e) => onChange(index, "degree", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Institution"
                        value={parent.institution}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Institution" value={parent.institution || ""} onChange={(e) => onChange(index, "institution", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                      <InfoField
                        label="Professional Licensure Examination"
                        value={parent.professional_licensure_examination}
                        isEditing={parent.isEditing}
                      >
                        <Input placeholder="Licensure Exam" value={parent.professional_licensure_examination || ""} onChange={(e) => onChange(index, "professional_licensure_examination", e.target.value)} isDisabled={!parent.isEditing} />
                      </InfoField>
                    </SimpleGrid>
                  </Box>
                </Box>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Step4;
