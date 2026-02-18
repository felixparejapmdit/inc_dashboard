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

const API_URL = process.env.REACT_APP_API_URL;

const Step6 = ({
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
  enrolleeGender,
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

  const [spouses, setSpouses] = useState([]);
  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const defaultSpouse = {
      relationship_type: "Spouse",
      givenname: "",
      lastname: "",
      middlename: "",
      date_of_marriage: "",
      place_of_marriage: "",
      contact_number: "",
      isEditing: true,
    };

    if (personnelId) {
      const params = {
        personnel_id: personnelId,
        relationship_type: "Spouse",
      };

      fetchData(
        "get-family-members",
        (res) => {
          if (Array.isArray(res) && res.length === 0) {
            setData([defaultSpouse]);
          } else {
            setData(res || [defaultSpouse]);
          }
        },
        () => {
          setData([defaultSpouse]);
          toast({
            title: "Error",
            description: "Failed to fetch spouse data.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
        },
        "Failed to fetch spouse data.",
        params
      );
    } else {
      setData([defaultSpouse]);
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to proceed.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [personnelId]);

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const spouse = data[index];

    const {
      id,
      isEditing,
      relationship_type = spouse.relationship_type, // Fallback to the existing key if relationship_type is undefined
      givenName,
      lastName,
      ...spouseData
    } = spouse;

    // Prepare the data to send
    const formattedData = {
      ...spouseData,
      givenname: spouse.givenname,
      lastname: spouse.lastname,
      relationship_type: relationship_type,
      personnel_id: personnelId,
      date_of_birth: spouse.date_of_birth || null, // Ensure empty date is set to null
    };
    console.log("Formatted Data:", formattedData);

    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
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
      let updatedSpouse;

      if (id) {
        // Update existing spouse record
        const response = await putData("family-members", id, formattedData);
        updatedSpouse = response?.family_member;
      } else {
        // Save new spouse record
        const response = await postData("family-members", formattedData);
        updatedSpouse = response?.family_member;
      }

      // Update spouse in state
      onToggleEdit(index); // Disable editing mode for the updated spouse
      onChange(index, "id", updatedSpouse.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Spouse Updated" : "Spouse Added",
        description: `${relationship_type} information has been ${id ? "updated" : "added"
          } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error(
        "Error saving/updating spouse information:",
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

  return (
    <Box width="100%" bg="white" boxShadow="sm" p={{ base: 4, md: 5 }}>
      <Heading as="h2" size={{ base: "lg", md: "xl" }} textAlign="center" mb={2} color="#0a5856">
        Step 6: Spouse Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        {data.map((spouse, index) => (
          <Box key={spouse.id || `spouse-${index}`} w="100%" pb={4} bg="white" shadow="sm" border="1px" borderColor="gray.100" borderRadius="lg">

            {/* Header with Buttons */}
            <Flex justifyContent="flex-end" px={4} py={2} mb={2}>
              <IconButton
                icon={spouse.isEditing ? <CheckIcon /> : <EditIcon />}
                onClick={() => {
                  if (spouse.isEditing) {
                    handleSaveOrUpdate(index);
                  } else {
                    const updatedSpouses = [...data];
                    updatedSpouses[index].isEditing = true;
                    setData(updatedSpouses);
                  }
                }}
                colorScheme={spouse.isEditing ? "green" : "blue"}
                size="sm"
                aria-label={spouse.isEditing ? "Save" : "Edit"}
              />
            </Flex>

            {/* Deceased Toggle */}
            <FormControl display="flex" alignItems="center" mb={4} px={4}>
              <Checkbox
                isChecked={spouse.is_deceased || false}
                onChange={(e) => onChange(index, "is_deceased", e.target.checked)}
                colorScheme="red"
                isDisabled={!spouse.isEditing}
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
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Gender <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                  <Select
                    placeholder="Select Gender"
                    value={spouse.gender ? { value: spouse.gender, label: spouse.gender } : (enrolleeGender === "Male" ? { value: "Female", label: "Female" } : { value: "Male", label: "Male" })}
                    onChange={(selectedOption) => onChange(index, "gender", selectedOption?.value || "")}
                    options={enrolleeGender === "Male" ? [{ value: "Female", label: "Female" }] : [{ value: "Male", label: "Male" }]}
                    isDisabled={!spouse.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Given Name <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                  <Input placeholder="Given Name" value={spouse.givenname || ""} onChange={(e) => onChange(index, "givenname", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Middle Name</FormLabel>
                  <Input placeholder="Middle Name" value={spouse.middlename || ""} onChange={(e) => onChange(index, "middlename", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Last Name <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                  <Input placeholder="Last Name" value={spouse.lastname || ""} onChange={(e) => onChange(index, "lastname", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Suffix</FormLabel>
                  <Select
                    placeholder="Select Suffix"
                    name="suffix"
                    value={spouse.suffix ? { value: spouse.suffix, label: spouse.suffix } : null}
                    onChange={(selectedOption) => onChange(index, "suffix", selectedOption?.value || "")}
                    options={suffixOptions.map((suffix) => ({ value: suffix, label: suffix }))}
                    isDisabled={!spouse.isEditing || spouse.gender === "Female"}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Date of Birth <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                  <Input type="date" value={spouse.date_of_birth || ""} onChange={(e) => onChange(index, "date_of_birth", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Contact Number</FormLabel>
                  <Input placeholder="Contact Number" value={spouse.contact_number || ""} onChange={(e) => onChange(index, "contact_number", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Blood Type</FormLabel>
                  <Select
                    placeholder="Select Blood Type"
                    value={spouse.bloodtype ? { value: spouse.bloodtype, label: spouse.bloodtype } : null}
                    onChange={(opt) => onChange(index, "bloodtype", opt?.value || "")}
                    options={bloodtypes.map(t => ({ value: t, label: t }))}
                    isDisabled={!spouse.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Civil Status <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                  <Select
                    placeholder="Select Civil Status"
                    value={spouse.civil_status ? { value: spouse.civil_status, label: spouse.civil_status } : null}
                    onChange={(opt) => onChange(index, "civil_status", opt?.value || "")}
                    options={civilStatusOptions.map(s => ({ value: s, label: s }))}
                    isDisabled={!spouse.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Date of Marriage</FormLabel>
                  <Input type="date" value={spouse.date_of_marriage || ""} onChange={(e) => onChange(index, "date_of_marriage", e.target.value)} isDisabled={!spouse.isEditing || spouse.civil_status === "Single"} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Place of Marriage</FormLabel>
                  <Input placeholder="Place of Marriage" value={spouse.place_of_marriage || ""} onChange={(e) => onChange(index, "place_of_marriage", e.target.value)} isDisabled={!spouse.isEditing || spouse.civil_status === "Single"} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Citizenship</FormLabel>
                  <Select
                    placeholder="Select Citizenship"
                    value={spouse.citizenship ? citizenships.map(c => ({ value: c.id, label: c.citizenship })).find(opt => opt.value === spouse.citizenship) : null}
                    onChange={(opt) => onChange(index, "citizenship", opt?.value || "")}
                    options={citizenships.map(c => ({ value: c.id, label: c.citizenship }))}
                    isDisabled={!spouse.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Ethnicity</FormLabel>
                  <Select
                    placeholder="Select Ethnicity"
                    value={spouse.nationality ? nationalities.map(n => ({ value: n.id, label: n.nationality })).find(opt => opt.value === spouse.nationality) : null}
                    onChange={(opt) => onChange(index, "nationality", opt?.value || "")}
                    options={nationalities.map(n => ({ value: n.id, label: n.nationality }))}
                    isDisabled={!spouse.isEditing}
                    isClearable
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Livelihood</FormLabel>
                  <Input placeholder="Livelihood" value={spouse.livelihood || ""} onChange={(e) => onChange(index, "livelihood", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">District</FormLabel>
                  <Select
                    placeholder="Select District"
                    value={districts.map(d => ({ value: d.id, label: d.name })).find(opt => opt.value === spouse.district_id) || null}
                    onChange={(opt) => {
                      onChange(index, "district_id", opt?.value || "");
                      onChange(index, "local_congregation", "");
                    }}
                    options={districts.map(d => ({ value: d.id, label: d.name }))}
                    isClearable
                    isDisabled={!spouse.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Local Congregation</FormLabel>
                  <Select
                    placeholder="Select Local Congregation"
                    value={(filteredCongregations[spouse.district_id] || []).map(c => ({ value: c.id, label: c.name })).find(opt => opt.value === spouse.local_congregation) || null}
                    onChange={(opt) => onChange(index, "local_congregation", opt?.value || "")}
                    options={(filteredCongregations[spouse.district_id] || []).map(c => ({ value: c.id, label: c.name }))}
                    isClearable
                    isDisabled={!spouse.isEditing || !spouse.district_id}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Church Duties</FormLabel>
                  <Input placeholder="Church Duties" value={spouse.church_duties || ""} onChange={(e) => onChange(index, "church_duties", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl display="none">
                  <Input placeholder="Evangelist" value={spouse.minister_officiated || ""} onChange={(e) => onChange(index, "minister_officiated", e.target.value)} />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Employment Details Group */}
            <Box mb={6} px={4} opacity={spouse.is_deceased ? 0.5 : 1} pointerEvents={spouse.is_deceased ? "none" : "auto"}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Employment Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Employment Type</FormLabel>
                  <Select
                    placeholder="Select Employment Type"
                    value={spouse.employment_type ? employmentTypeOptions.map(t => ({ value: t, label: t })).find(opt => opt.value === spouse.employment_type) : null}
                    onChange={(opt) => onChange(index, "employment_type", opt?.value || "")}
                    options={employmentTypeOptions.map(t => ({ value: t, label: t }))}
                    isClearable
                    isDisabled={!spouse.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Company</FormLabel>
                  <Input placeholder="Company" value={spouse.company || ""} onChange={(e) => onChange(index, "company", e.target.value)} isDisabled={!spouse.isEditing || ["Volunteer/Kawani", "Unemployed", "Retired"].includes(spouse.employment_type)} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Address</FormLabel>
                  <Textarea rows={1} placeholder="Address" value={spouse.address || ""} onChange={(e) => onChange(index, "address", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Brief Description of Responsibilities</FormLabel>
                  <Input placeholder="Brief Description" value={spouse.position || ""} onChange={(e) => onChange(index, "position", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl display="none">
                  <Input placeholder="Department" value={spouse.department || ""} onChange={(e) => onChange(index, "department", e.target.value)} />
                </FormControl>
                <FormControl display="none">
                  <Input placeholder="Section" value={spouse.section || ""} onChange={(e) => onChange(index, "section", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Start Date</FormLabel>
                  <Input type="date" value={spouse.start_date || ""} onChange={(e) => onChange(index, "start_date", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">End Date</FormLabel>
                  <Input type="date" value={spouse.end_date || ""} onChange={(e) => onChange(index, "end_date", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Reason for Leaving</FormLabel>
                  <Input placeholder="Reason for Leaving" value={spouse.reason_for_leaving || ""} onChange={(e) => onChange(index, "reason_for_leaving", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Educational Background Group */}
            <Box mb={6} px={4}>
              <Heading as="h4" size="sm" mb={4} color="teal.500" borderBottom="1px" borderColor="gray.200" pb={2}>
                Educational Background
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Educational Level</FormLabel>
                  <Select
                    placeholder="Select Educational Level"
                    value={spouse.education_level ? educationalLevelOptions.map(l => ({ value: l, label: l })).find(opt => opt.value === spouse.education_level) : null}
                    onChange={(opt) => onChange(index, "education_level", opt?.value || "")}
                    options={educationalLevelOptions.map(l => ({ value: l, label: l }))}
                    isClearable
                    isDisabled={!spouse.isEditing}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Start Year</FormLabel>
                  <Input placeholder="Start Year" type="number" value={spouse.start_year || ""} onChange={(e) => onChange(index, "start_year", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Completion Year</FormLabel>
                  <Input placeholder="Completion Year" type="number" value={spouse.completion_year || ""} onChange={(e) => onChange(index, "completion_year", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">School</FormLabel>
                  <Input placeholder="School" value={spouse.school || ""} onChange={(e) => onChange(index, "school", e.target.value)} isDisabled={!spouse.isEditing} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Field of Study</FormLabel>
                  <Input placeholder="Field of Study" value={spouse.field_of_study || ""} onChange={(e) => onChange(index, "field_of_study", e.target.value)} isDisabled={!spouse.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(spouse.education_level)} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Degree</FormLabel>
                  <Input placeholder="Degree" value={spouse.degree || ""} onChange={(e) => onChange(index, "degree", e.target.value)} isDisabled={!spouse.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(spouse.education_level)} />
                </FormControl>
                <FormControl display="none">
                  <Input placeholder="Institution" value={spouse.institution || ""} onChange={(e) => onChange(index, "institution", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel color="#0a5856" fontWeight="bold">Professional Licensure</FormLabel>
                  <Input placeholder="Licensure" value={spouse.professional_licensure_examination || ""} onChange={(e) => onChange(index, "professional_licensure_examination", e.target.value)} isDisabled={!spouse.isEditing || ["No Formal Education", "Primary Education", "Secondary Education", "Senior High School"].includes(spouse.education_level)} />
                </FormControl>
              </SimpleGrid>
            </Box>
          </Box>
        ))}


        {/* Conditional add spouse button */}
        {spouses.length > 0 &&
          spouses[spouses.length - 1]?.status === "Deceased" && (
            <Button onClick={onAdd} colorScheme="teal" mt={4}>
              Add Spouse
            </Button>
          )}
      </VStack>
    </Box>
  );
};
export default Step6;
