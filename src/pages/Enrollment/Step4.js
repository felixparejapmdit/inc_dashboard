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
  //Select,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

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
      // Fetch parents (Father and Mother) related to the personnelId
      axios
        .get(`${API_URL}/api/get-family-members`, {
          params: {
            personnel_id: personnelId,
            relationship_type: ["Father", "Mother"], // Specify relationship types for parents
          },
        })
        .then((res) => {
          // Check if data exists and ensure "Father" and "Mother" rows are always present
          const parents = [
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
          ];

          if (Array.isArray(res.data) && res.data.length === 0) {
            setData(parents); // Default empty fields for Father and Mother
          } else {
            // Merge returned data with defaults to ensure Father and Mother rows
            const mergedParents = parents.map(
              (defaultParent) =>
                res.data.find(
                  (item) =>
                    item.relationship_type === defaultParent.relationship_type
                ) || { ...defaultParent, isEditing: true } // Ensure isEditing is true
            );
            setData(mergedParents);
          }
        })
        .catch((err) => {
          console.error("Error fetching parents:", err);
          // Default empty fields for Father and Mother in case of an error
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
            title: "Error",
            description: "Failed to fetch parent data.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left", // Position the toast on the bottom-left
          });
        });
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

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const parent = data[index];

    const {
      id,
      isEditing,
      relationship_type = parent.relationship_type, // Fallback to the existing key if relationship_type is undefined,
      givenName,
      lastName,
      gender,
      ...parentData
    } = parent;

    // Prepare the data to send
    const formattedData = {
      ...parentData,
      givenname: parent.givenname,
      lastname: parent.lastname,
      gender:
        relationship_type === "Father"
          ? "Male"
          : relationship_type === "Mother"
          ? "Female"
          : parent.gender, // Automatically set gender for Father and Mother
      relationship_type: relationship_type,
      personnel_id: personnelId,
      date_of_birth: parent.date_of_birth || null, // Ensure empty date is set to null
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "gender",
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
      let updatedParent;
      if (id) {
        // Update existing parent record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        //updatedParent = response.data;
        updatedParent = response.data.family_member;
      } else {
        // Save new parent record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        //updatedParent = response.data;
        updatedParent = response.data.family_member;
      }

      // Update parent in state
      onToggleEdit(index); // Disable editing mode for the updated parent
      onChange(index, "id", updatedParent.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Parent Updated" : "Parent Added",
        description: `${relationship_type} information has been ${
          id ? "updated" : "added"
        } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } catch (error) {
      console.error(
        "Error saving/updating parent information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to ${
          id ? "update" : "add"
        } ${relationship_type} information. ${
          error.response?.data?.message || "Please try again later."
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
    <Box width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 4: Parents Information
      </Heading>
      <VStack align="start" spacing={4} mb={8} w="100%">
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            {data.length > 0 ? (
              data.map((parent, index) => (
                <Tab key={index}>{parent.relationship_type}</Tab>
              ))
            ) : (
              <Tab>Parents</Tab> // Default tab label in case of empty data
            )}
          </TabList>

          <TabPanels>
            {data.map((parent, index) => (
              <TabPanel key={index}>
                <Table size="md" variant="simple">
                  <Tbody>
                    {/* Personal Information */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Personal Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Given Name:
                        </Text>
                        <Input
                          placeholder="Given Name"
                          value={parent.givenname}
                          onChange={(e) =>
                            onChange(index, "givenname", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Middle Name:
                        </Text>
                        <Input
                          placeholder="Middle Name"
                          value={parent.middlename}
                          onChange={(e) =>
                            onChange(index, "middlename", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Last Name:
                        </Text>
                        <Input
                          placeholder="Last Name"
                          value={parent.lastname}
                          onChange={(e) =>
                            onChange(index, "lastname", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Suffix:
                        </Text>
                        <Select
                          placeholder="Select Suffix"
                          name="suffix"
                          value={
                            parent.suffix
                              ? { value: parent.suffix, label: parent.suffix }
                              : null // Ensure no default value on load if none exists
                          }
                          onChange={(selectedOption) => {
                            onChange(
                              index,
                              "suffix",
                              selectedOption?.value || ""
                            ); // Update the state
                          }}
                          options={suffixOptions.map((suffix) => ({
                            value: suffix,
                            label: suffix,
                          }))}
                          isClearable // Adds a clear button to reset selection
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Gender:
                        </Text>
                        <Select
                          value={{
                            value:
                              parent.relationship_type === "Father"
                                ? "Male"
                                : "Female",
                            label:
                              parent.relationship_type === "Father"
                                ? "Male"
                                : "Female",
                          }} // Automatically set based on relationship_type
                          options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                          ]} // Define the options for gender
                          isDisabled // Always disabled
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Date Of Birth:
                        </Text>
                        <Input
                          placeholder="Date of Birth"
                          type="date"
                          value={parent.date_of_birth}
                          onChange={(e) =>
                            onChange(index, "date_of_birth", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Contact Number:
                        </Text>
                        <Input
                          placeholder="Contact Number"
                          value={parent.contact_number}
                          type="number"
                          onChange={(e) =>
                            onChange(index, "contact_number", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Blood Type:
                        </Text>
                        <Select
                          placeholder="Select Blood Type"
                          name="bloodtype"
                          value={bloodtypes
                            .map((type) => ({
                              value: type,
                              label: type,
                            }))
                            .find(
                              (option) => option.value === parent.bloodtype
                            )} // Match selected value
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "bloodtype",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={bloodtypes.map((type) => ({
                            value: type,
                            label: type,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Civil Status:
                        </Text>
                        <Select
                          placeholder="Select Civil Status"
                          name="civil_status"
                          value={civilStatusOptions
                            .map((status) => ({
                              value: status,
                              label: status,
                            }))
                            .find(
                              (option) => option.value === parent.civil_status
                            )} // Match selected value
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "civil_status",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={civilStatusOptions.map((status) => ({
                            value: status,
                            label: status,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Date of Marriage:
                        </Text>
                        <Input
                          placeholder="Date of Marriage"
                          type="date"
                          value={parent.date_of_marriage}
                          onChange={(e) =>
                            onChange(index, "date_of_marriage", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.civil_status === "Single"
                          } // Disable if civil_status is "Single"
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Place of Marriage:
                        </Text>
                        <Input
                          placeholder="Place of Marriage"
                          value={parent.place_of_marriage}
                          onChange={(e) =>
                            onChange(index, "place_of_marriage", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.civil_status === "Single"
                          } // Disable if civil_status is "Single"
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Citizenship:
                        </Text>
                        <Select
                          placeholder="Select Citizenship"
                          name="citizenship"
                          value={citizenships
                            .map((citizenship) => ({
                              value: citizenship.id,
                              label: citizenship.citizenship,
                            }))
                            .find(
                              (option) => option.value === parent.citizenship
                            )} // Map value for selected option
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "citizenship",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={citizenships.map((citizenship) => ({
                            value: citizenship.id,
                            label: citizenship.citizenship,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Disable when editing is not enabled
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Ethnicity:
                        </Text>
                        <Select
                          placeholder="Select Ethnicity"
                          name="nationality"
                          value={nationalities
                            .map((nationality) => ({
                              value: nationality.id,
                              label: nationality.nationality,
                            }))
                            .find(
                              (option) => option.value === parent.nationality
                            )} // Map value for selected option
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "nationality",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={nationalities.map((nationality) => ({
                            value: nationality.id,
                            label: nationality.nationality,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Disable when editing is not enabled
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Livelihood:
                        </Text>
                        <Input
                          placeholder="Livelihood"
                          value={parent.livelihood}
                          onChange={(e) =>
                            onChange(index, "livelihood", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          District:
                        </Text>
                        <Select
                          placeholder="Select District"
                          name="district_id"
                          value={
                            districts
                              .map((district) => ({
                                value: district.id,
                                label: district.name,
                              }))
                              .find(
                                (option) => option.value === parent.district_id
                              ) || null
                          } // Ensure the correct selected district
                          onChange={(selectedOption) => {
                            onChange(
                              index,
                              "district_id",
                              selectedOption?.value || ""
                            );
                            onChange(index, "local_congregation", ""); // Reset local congregation when district changes
                          }}
                          options={districts.map((district) => ({
                            value: district.id,
                            label: district.name,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Disable when editing is not enabled
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      {/* ✅ Local Congregation Select Dropdown */}
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Local Congregation:
                        </Text>
                        <Select
                          placeholder="Select Local Congregation"
                          name="local_congregation"
                          value={
                            (filteredCongregations[parent.district_id] || [])
                              .map((congregation) => ({
                                value: congregation.id,
                                label: congregation.name,
                              }))
                              .find(
                                (option) =>
                                  option.value === parent.local_congregation
                              ) || null
                          } // Ensure the correct selected local congregation
                          onChange={(selectedOption) =>
                            onChange(
                              index,
                              "local_congregation",
                              selectedOption?.value || ""
                            )
                          }
                          options={(
                            filteredCongregations[parent.district_id] || []
                          ).map((congregation) => ({
                            value: congregation.id,
                            label: congregation.name,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing || !parent.district_id} // Disable if no district is selected
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>
                    </Tr>

                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Church Duties:
                        </Text>
                        <Input
                          placeholder="Church Duties"
                          value={parent.church_duties}
                          onChange={(e) =>
                            onChange(index, "church_duties", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td display="none">
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Evangelist:
                        </Text>
                        <Input
                          placeholder="Evangelist"
                          value={parent.minister_officiated}
                          onChange={(e) =>
                            onChange(
                              index,
                              "minister_officiated",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    {/* Work Information Section */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Work Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
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
                          placeholder="Select Employment Type"
                          name="employment_type"
                          value={employmentTypeOptions
                            .map((type) => ({
                              value: type,
                              label: type,
                            }))
                            .find(
                              (option) =>
                                option.value === parent.employment_type
                            )} // Map value for selected option
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "employment_type",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={employmentTypeOptions.map((type) => ({
                            value: type,
                            label: type,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Disable when editing is not enabled
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      <Td>
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
                          value={parent.company}
                          onChange={(e) =>
                            onChange(index, "company", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            ["Volunteer/Kawani"].includes(
                              parent.employment_type
                            )
                          } // Disable if employment_type is Volunteer or Kawani
                        />
                      </Td>
                      <Td>
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
                          value={parent.address}
                          onChange={(e) =>
                            onChange(index, "address", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="100px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Brief Description <br></br> of Responsibilities:
                        </Text>
                        <Input
                          placeholder="Brief Description of Responsibilities"
                          value={parent.position}
                          onChange={(e) =>
                            onChange(index, "position", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      {/* Department Field */}
                      <Td display="none">
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
                          value={parent.department} // Ensure binding to state
                          onChange={
                            (e) => onChange(index, "department", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        />
                      </Td>

                      {/* Section Field */}
                      <Td display="none">
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
                          value={parent.section} // Ensure binding to state
                          onChange={
                            (e) => onChange(index, "section", e.target.value) // Pass index, field, and value
                          }
                          isDisabled={!parent.isEditing} // Enable/disable based on editing state
                        />
                      </Td>

                      <Td>
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
                          placeholder="Start Date"
                          type="date"
                          value={parent.start_date}
                          onChange={(e) =>
                            onChange(index, "start_date", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
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
                          placeholder="End Date"
                          type="date"
                          value={parent.end_date}
                          onChange={(e) =>
                            onChange(index, "end_date", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
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
                          value={parent.reason_for_leaving}
                          onChange={(e) =>
                            onChange(
                              index,
                              "reason_for_leaving",
                              e.target.value
                            )
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>

                    {/* Educational Information Section */}
                    <Tr bg="gray.50">
                      <Td colSpan={4}>
                        <Text fontWeight="bold">Educational Information</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
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
                          placeholder="Select Educational Level"
                          name="education_level"
                          value={educationalLevelOptions
                            .map((level) => ({
                              value: level,
                              label: level,
                            }))
                            .find(
                              (option) =>
                                option.value === parent.education_level
                            )} // Map value for selected option
                          onChange={
                            (selectedOption) =>
                              onChange(
                                index,
                                "education_level",
                                selectedOption?.value || ""
                              ) // Update state on selection
                          }
                          options={educationalLevelOptions.map((level) => ({
                            value: level,
                            label: level,
                          }))}
                          isClearable
                          isDisabled={!parent.isEditing} // Conditionally disable dropdown
                          styles={{
                            container: (base) => ({
                              ...base,
                              width: "100%",
                            }),
                          }}
                        />
                      </Td>

                      <Td>
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
                          value={parent.start_year}
                          onChange={(e) =>
                            onChange(index, "start_year", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                      <Td>
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
                          value={parent.completion_year}
                          onChange={(e) =>
                            onChange(index, "completion_year", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>

                      <Td>
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
                          value={parent.school}
                          onChange={(e) =>
                            onChange(index, "school", e.target.value)
                          }
                          isDisabled={!parent.isEditing}
                        />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Text
                          fontWeight="bold"
                          mb="2"
                          minWidth="120px"
                          whiteSpace="nowrap"
                          color="#0a5856"
                        >
                          Field of Study:
                        </Text>
                        <Input
                          placeholder="Field of Study"
                          value={parent.field_of_study}
                          onChange={(e) =>
                            onChange(index, "field_of_study", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.education_level === "No Formal Education" ||
                            parent.education_level === "Primary Education" ||
                            parent.education_level === "Secondary Education" ||
                            parent.education_level === "Senior High School"
                          }
                        />
                      </Td>
                      <Td>
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
                          value={parent.degree}
                          onChange={(e) =>
                            onChange(index, "degree", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.education_level === "No Formal Education" ||
                            parent.education_level === "Primary Education" ||
                            parent.education_level === "Secondary Education" ||
                            parent.education_level === "Senior High School"
                          }
                        />
                      </Td>
                      <Td display="none">
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
                          value={parent.institution}
                          onChange={(e) =>
                            onChange(index, "institution", e.target.value)
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.education_level === "No Formal Education" ||
                            parent.education_level === "Primary Education" ||
                            parent.education_level === "Secondary Education" ||
                            parent.education_level === "Senior High School"
                          }
                        />
                      </Td>
                      <Td>
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
                          value={parent.professional_licensure_examination}
                          onChange={(e) =>
                            onChange(
                              index,
                              "professional_licensure_examination",
                              e.target.value
                            )
                          }
                          isDisabled={
                            !parent.isEditing ||
                            parent.education_level === "No Formal Education" ||
                            parent.education_level === "Primary Education" ||
                            parent.education_level === "Secondary Education" ||
                            parent.education_level === "Senior High School"
                          }
                        />
                      </Td>
                    </Tr>

                    {/* Save Button */}
                    <Tr>
                      <Td colSpan={4} textAlign="center">
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
                        />
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Step4;
