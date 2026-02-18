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
  Button
} from "@chakra-ui/react";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

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

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    console.log("Step 4 - Parents Data:", data);
  }, [data]);

  useEffect(() => {
    const initializeDefaultParents = () => [
      {
        relationship_type: "Father",
        givenname: "",
        lastname: "",
        middlename: "",
        suffix: "",
        gender: "Male",
        date_of_birth: "",
        contact_number: "",
        civil_status: "",
        bloodtype: "",
        isEditing: true, // Ensure editing is enabled by default
      },
      {
        relationship_type: "Mother",
        givenname: "",
        lastname: "",
        middlename: "",
        suffix: "",
        gender: "Female",
        date_of_birth: "",
        contact_number: "",
        civil_status: "",
        bloodtype: "",
        isEditing: true, // Ensure editing is enabled by default
      },
    ];

    if (personnelId) {
      const params = {
        personnel_id: personnelId,
        relationship_type: ["Father", "Mother"], // Ensure both are fetched
      };

      fetchData(
        "get-family-members",
        (res) => {
          const defaultParents = [
            {
              relationship_type: "Father",
              givenname: "",
              lastname: "",
              isEditing: true,
            },
            {
              relationship_type: "Mother",
              givenname: "",
              lastname: "",
              isEditing: true,
            },
          ];

          if (Array.isArray(res) && res.length === 0) {
            setData(defaultParents);
          } else {
            const mergedParents = defaultParents.map(
              (defaultParent) =>
                res.find(
                  (item) =>
                    item.relationship_type === defaultParent.relationship_type
                ) || { ...defaultParent, isEditing: true }
            );
            setData(mergedParents);
          }
        },
        () => {
          setData([
            {
              relationship_type: "Father",
              givenname: "",
              lastname: "",
              isEditing: true,
            },
            {
              relationship_type: "Mother",
              givenname: "",
              lastname: "",
              isEditing: true,
            },
          ]);

          toast({
            title: "Error",
            description: "Failed to fetch parent data.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
        },
        "Failed to fetch parent data.",
        params // ✅ Correct placement for custom query parameters
      );
    } else {
      // Default empty fields for Father and Mother if no personnelId
      setData([
        {
          relationship_type: "Father",
          givenname: "",
          lastname: "",
          isEditing: true, // Ensure editing is enabled
        },
        {
          relationship_type: "Mother",
          givenname: "",
          lastname: "",
          isEditing: true, // Ensure editing is enabled
        },
      ]);
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to proceed.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  }, [personnelId]);

  const fetchParents = () => {
    if (!personnelId) return;

    const params = {
      personnel_id: personnelId,
      relationship_type: ["Father", "Mother"],
    };

    fetchData(
      "get-family-members",
      (res) => {
        const parents = [
          {
            relationship_type: "Father",
            givenname: "",
            lastname: "",
            bloodtype: "",
            birthplace: "",
            birthdate: "",
            nationality: "",
            religion: "",
            occupation: "",
            employer: "",
            is_alive: true,
            isEditing: true,
          },
          {
            relationship_type: "Mother",
            givenname: "",
            lastname: "",
            bloodtype: "",
            birthplace: "",
            birthdate: "",
            nationality: "",
            religion: "",
            occupation: "",
            employer: "",
            is_alive: true,
            isEditing: true,
          },
        ];

        setData((prevData) => {
          const mergedParents = parents.map((defaultParent) => {
            const found = res.find(
              (item) =>
                item.relationship_type === defaultParent.relationship_type
            );

            const prevParent = prevData.find(
              (p) => p.relationship_type === defaultParent.relationship_type
            );

            return {
              ...defaultParent,
              ...found,
              isEditing: prevParent?.isEditing ?? true,
            };
          });

          return mergedParents;
        });
      },
      (err) => {
        console.error("Error fetching parents:", err);
      },
      "Failed to fetch parent data.",
      params
    );
  };


  useEffect(() => {
    fetchParents();
  }, [personnelId]);

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
      ethnicity: updatedParent.ethnicity,
      district: updatedParent.district,
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

      await fetchParents();

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
                  {/* Personal Information Group */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={4}>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Given Name</FormLabel>
                      <Input placeholder="Given Name" value={parent.givenname || ""} onChange={(e) => onChange(index, "givenname", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Middle Name</FormLabel>
                      <Input placeholder="Middle Name" value={parent.middlename || ""} onChange={(e) => onChange(index, "middlename", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">{parent.relationship_type === "Mother" ? "Surname (Maiden Name)" : "Surname"}</FormLabel>
                      <Input placeholder="Surname" value={parent.lastname || ""} onChange={(e) => onChange(index, "lastname", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Suffix</FormLabel>
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
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Gender</FormLabel>
                      <Select
                        value={{ value: parent.relationship_type === "Father" ? "Male" : "Female", label: parent.relationship_type === "Father" ? "Male" : "Female" }}
                        options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                        isDisabled
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Date of Birth</FormLabel>
                      <Input type="date" value={parent.date_of_birth || ""} onChange={(e) => onChange(index, "date_of_birth", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Contact Number</FormLabel>
                      <Input placeholder="Contact Number" type="number" value={parent.contact_number || ""} onChange={(e) => onChange(index, "contact_number", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Blood Type</FormLabel>
                      <Select
                        placeholder="Select Blood Type"
                        value={bloodtypes.map(type => ({ value: type, label: type })).find(opt => opt.value === parent.bloodtype)}
                        onChange={(opt) => onChange(index, "bloodtype", opt?.value || "")}
                        options={bloodtypes.map(type => ({ value: type, label: type }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Civil Status</FormLabel>
                      <Select
                        placeholder="Select Civil Status"
                        value={civilStatusOptions.map(s => ({ value: s, label: s })).find(opt => opt.value === parent.civil_status)}
                        onChange={(opt) => onChange(index, "civil_status", opt?.value || "")}
                        options={civilStatusOptions.map(s => ({ value: s, label: s }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Date of Marriage</FormLabel>
                      <Input type="date" value={parent.date_of_marriage || ""} onChange={(e) => onChange(index, "date_of_marriage", e.target.value)} isDisabled={!parent.isEditing || parent.civil_status === "Single"} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Place of Marriage</FormLabel>
                      <Input placeholder="Place of Marriage" value={parent.place_of_marriage || ""} onChange={(e) => onChange(index, "place_of_marriage", e.target.value)} isDisabled={!parent.isEditing || parent.civil_status === "Single"} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Citizenship</FormLabel>
                      <Select
                        placeholder="Select Citizenship"
                        value={citizenships.map(c => ({ value: c.id, label: c.citizenship })).find(opt => opt.value === parent.citizenship)}
                        onChange={(opt) => onChange(index, "citizenship", opt?.value || "")}
                        options={citizenships.map(c => ({ value: c.id, label: c.citizenship }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Ethnicity</FormLabel>
                      <Select
                        placeholder="Select Ethnicity"
                        value={nationalities.map(n => ({ value: n.id, label: n.nationality })).find(opt => opt.value === parent.nationality)}
                        onChange={(opt) => onChange(index, "nationality", opt?.value || "")}
                        options={nationalities.map(n => ({ value: n.id, label: n.nationality }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Livelihood</FormLabel>
                      <Input placeholder="Livelihood" value={parent.livelihood || ""} onChange={(e) => onChange(index, "livelihood", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">District</FormLabel>
                      <Select
                        placeholder="Select District"
                        value={districts.map(d => ({ value: d.id, label: d.name })).find(opt => opt.value === parent.district_id) || null}
                        onChange={(opt) => {
                          onChange(index, "district_id", opt?.value || "");
                          onChange(index, "local_congregation", "");
                        }}
                        options={districts.map(d => ({ value: d.id, label: d.name }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Local Congregation</FormLabel>
                      <Select
                        placeholder="Select Local Congregation"
                        value={(filteredCongregations[parent.district_id] || []).map(c => ({ value: c.id, label: c.name })).find(opt => opt.value === parent.local_congregation) || null}
                        onChange={(opt) => onChange(index, "local_congregation", opt?.value || "")}
                        options={(filteredCongregations[parent.district_id] || []).map(c => ({ value: c.id, label: c.name }))}
                        isClearable
                        isDisabled={!parent.isEditing || !parent.district_id}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Church Duties</FormLabel>
                      <Input placeholder="Church Duties" value={parent.church_duties || ""} onChange={(e) => onChange(index, "church_duties", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl display="none">
                      <Input placeholder="Evangelist" value={parent.minister_officiated || ""} onChange={(e) => onChange(index, "minister_officiated", e.target.value)} />
                    </FormControl>
                  </SimpleGrid>

                  {/* Work Information Group */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={4}>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Employment Type</FormLabel>
                      <Select
                        placeholder="Select Employment Type"
                        value={employmentTypeOptions.map(t => ({ value: t, label: t })).find(opt => opt.value === parent.employment_type)}
                        onChange={(opt) => onChange(index, "employment_type", opt?.value || "")}
                        options={employmentTypeOptions.map(t => ({ value: t, label: t }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Company</FormLabel>
                      <Input placeholder="Company" value={parent.company || ""} onChange={(e) => onChange(index, "company", e.target.value)} isDisabled={!parent.isEditing || ["Volunteer/Kawani"].includes(parent.employment_type)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Address</FormLabel>
                      <Input placeholder="Address" value={parent.address || ""} onChange={(e) => onChange(index, "address", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Brief Description of Responsibilities</FormLabel>
                      <Input placeholder="Brief Description" value={parent.position || ""} onChange={(e) => onChange(index, "position", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl display="none">
                      <Input placeholder="Department" value={parent.department || ""} onChange={(e) => onChange(index, "department", e.target.value)} />
                    </FormControl>
                    <FormControl display="none">
                      <Input placeholder="Section" value={parent.section || ""} onChange={(e) => onChange(index, "section", e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Start Date</FormLabel>
                      <Input type="date" value={parent.start_date || ""} onChange={(e) => onChange(index, "start_date", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">End Date</FormLabel>
                      <Input type="date" value={parent.end_date || ""} onChange={(e) => onChange(index, "end_date", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Reason for Leaving</FormLabel>
                      <Input placeholder="Reason for Leaving" value={parent.reason_for_leaving || ""} onChange={(e) => onChange(index, "reason_for_leaving", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                  </SimpleGrid>

                  {/* Educational Info Group */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={4}>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Educational Level</FormLabel>
                      <Select
                        placeholder="Select Educational Level"
                        value={educationalLevelOptions.map(l => ({ value: l, label: l })).find(opt => opt.value === parent.education_level)}
                        onChange={(opt) => onChange(index, "education_level", opt?.value || "")}
                        options={educationalLevelOptions.map(l => ({ value: l, label: l }))}
                        isClearable
                        isDisabled={!parent.isEditing}
                        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Start Year</FormLabel>
                      <Input placeholder="Start Year" value={parent.start_year || ""} onChange={(e) => onChange(index, "start_year", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Completion Year</FormLabel>
                      <Input placeholder="Completion Year" value={parent.completion_year || ""} onChange={(e) => onChange(index, "completion_year", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">School</FormLabel>
                      <Input placeholder="School" value={parent.school || ""} onChange={(e) => onChange(index, "school", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Field of Study</FormLabel>
                      <Input placeholder="Field of Study" value={parent.field_of_study || ""} onChange={(e) => onChange(index, "field_of_study", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Degree</FormLabel>
                      <Input placeholder="Degree" value={parent.degree || ""} onChange={(e) => onChange(index, "degree", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Institution</FormLabel>
                      <Input placeholder="Institution" value={parent.institution || ""} onChange={(e) => onChange(index, "institution", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="#0a5856" fontWeight="bold">Professional Licensure Examination</FormLabel>
                      <Input placeholder="Licensure Exam" value={parent.professional_licensure_examination || ""} onChange={(e) => onChange(index, "professional_licensure_examination", e.target.value)} isDisabled={!parent.isEditing} />
                    </FormControl>
                  </SimpleGrid>

                  <Flex justify="center" mt={4}>
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
                    />
                  </Flex>
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
