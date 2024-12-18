import React, { useState,useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams for retrieving URL parameters
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Select,
  Button,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";

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
  civilStatusOptions,
  employmentTypeOptions,
  educationalLevelOptions,
  bloodtypes,
}) => {
  

  const { personnelId } = useParams(); // Retrieve personnelId from URL

  const [spouses, setSpouses] = useState([]);
  const getRowBgColor = (index) => (index % 2 === 0 ? "gray.50" : "green.50"); // Alternate colors
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (personnelId) {
      // Fetch spouses related to the personnelId
      axios
        .get(`${API_URL}/api/family-members?personnel_id=${personnelId}`)
        .then((res) => {
          setSpouses(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching spouses:", err);
          toast({
            title: "Error",
            description: "Failed to fetch spouse data.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  }, [personnelId]);


  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const spouse = data[index];

    const {
      id,
      isEditing,
      relationshipType,
      gender,
      givenName,
      lastName,
      ...spouseData
    } = spouse;

    // Prepare the data to send
    const formattedData = {
      ...spouseData,
      gender: spouse.gender,
      givenname: spouse.givenname,
      lastname: spouse.lastname,
      relationship_type: relationshipType,
      personnel_id: spouseData.personnel_id || 8,
    };
    console.log("Formatted Data:", formattedData);
    // Validate required fields
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "gender",
      "givenname",
      "lastname",
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
        description: `The field "${missingField}" is required for ${relationshipType}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false); // Reset loading state
      return;
    }

    try {
      let updatedSpouse;
      if (id) {
        // Update existing spouse record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        updatedSpouse = response.data;
      } else {
        // Save new spouse record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );
        updatedSpouse = response.data;
      }

      // Update spouse in state
      onToggleEdit(index); // Disable editing mode for the updated spouse
      onChange(index, "id", updatedSpouse.id); // Update the `id` field if it was a new record

      toast({
        title: id ? "Spouse Updated" : "Spouse Added",
        description: `${relationshipType} information has been ${
          id ? "updated" : "added"
        } successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error saving/updating spouse information:",
        error.response
      );
      toast({
        title: "Error",
        description: `Failed to ${
          id ? "update" : "add"
        } ${relationshipType} information. ${
          error.response?.data?.message || "Please try again later."
        }`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <VStack width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 7: Spouse Information
      </Heading>
      {data.map((spouse, index) => (
        <VStack
          align="start" spacing={4} mb={8} w="100%"
        >
          <Table
             key={spouse.id || spouse.generatedId}
             size="md"
             variant="simple"
          >
            <Tbody>
              {/* Personal Information */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Personal Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Select Gender"
                    value={spouse.gender}
                    onChange={(e) =>
                      onChange(index, "gender", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Given Name"
                    value={spouse.givenname}
                    onChange={(e) =>
                      onChange(index, "givenname", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={spouse.middlename}
                    onChange={(e) =>
                      onChange(index, "middlename", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Last Name"
                    value={spouse.lastname}
                    onChange={(e) =>
                      onChange(index, "lastname", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    name="suffix"
                    value={spouse.suffix || ""}
                    onChange={(e) =>
                      onChange(index, "suffix", e.target.value)
                    }
                    width="100%"
                    isDisabled={spouse.gender === "Female"}
                  >
                    <option value="" disabled>
                      Select Suffix
                    </option>
                    {suffixOptions.map((suffix) => (
                      <option key={suffix} value={suffix}>
                        {suffix}
                      </option>
                    ))}
                  </Select>
                </Td>

                <Td>
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={spouse.date_of_birth}
                    onChange={(e) =>
                      onChange(index, "date_of_birth", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={spouse.contact_number}
                    onChange={(e) =>
                      onChange(index, "contact_number", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Blood Type"
                    name="bloodtype"
                    value={spouse.bloodtype}
                    onChange={(e) =>
                      onChange(index, "bloodtype", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                    width="100%"
                  >
                    {bloodtypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Civil Status"
                    value={spouse.civil_status}
                    onChange={(e) =>
                      onChange(index, "civil_status", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  >
                    {civilStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Td>

                <Td>
                  <Input
                    placeholder="Date of Marriage"
                    type="date"
                    value={data.date_of_marriage}
                    onChange={(e) =>
                      onChange(index, "date_of_marriage", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Place of Marriage"
                    value={spouse.place_of_marriage}
                    onChange={(e) =>
                      onChange(
                        index,
                        "place_of_marriage",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>

                <Td>
                  <Select
                    placeholder="Select Citizenship"
                    name="citizenship"
                    value={spouse.citizenship}
                    onChange={(e) =>
                      onChange(index, "citizenship", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                    width="100%"
                  >
                    {citizenships.map((citizenship) => (
                      <option key={citizenship.id} value={citizenship.id}>
                        {citizenship.citizenship}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Select Nationality"
                    name="nationality"
                    value={spouse.nationality}
                    onChange={(e) =>
                      onChange(index, "nationality", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                    width="100%"
                  >
                    {nationalities.map((nationality) => (
                      <option key={nationality.id} value={nationality.id}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Livelihood"
                    value={spouse.livelihood}
                    onChange={(e) =>
                      onChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select District"
                    name="district_id"
                    value={spouse.district_id}
                    onChange={(e) =>
                      onChange(index, "district_id", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                    width="100%"
                  >
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Local Congregation"
                    value={spouse.local_congregation}
                    onChange={(e) =>
                      onChange(
                        index,
                        "local_congregation",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>

              <Tr>
                <Td>
                  <Input
                    placeholder="Church Duties"
                    value={spouse.church_duties}
                    onChange={(e) =>
                      onChange(index, "church_duties", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Minister Officiated"
                    value={spouse.minister_officiated}
                    onChange={(e) =>
                      onChange(
                        index,
                        "minister_officiated",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>

              {/* Work Information Section */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Work Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Employment Type"
                    value={spouse.employment_type}
                    onChange={(e) =>
                      onChange(index, "employment_type", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  >
                    {employmentTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="Company"
                    value={spouse.company}
                    onChange={(e) =>
                      onChange(index, "company", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Position"
                    value={spouse.position}
                    onChange={(e) =>
                      onChange(index, "position", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Address"
                    value={spouse.address}
                    onChange={(e) =>
                      onChange(index, "address", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Department"
                    value={spouse.department}
                    onChange={(e) =>
                      onChange(index, "department", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Section"
                    value={spouse.section}
                    onChange={(e) =>
                      onChange(index, "section", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={spouse.start_date}
                    onChange={(e) =>
                      onChange(index, "start_date", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={spouse.end_date}
                    onChange={(e) =>
                      onChange(index, "end_date", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={spouse.reason_for_leaving}
                    onChange={(e) =>
                      onChange(
                        index,
                        "reason_for_leaving",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>

              {/* Educational Information Section */}
              <Tr bg={getRowBgColor(index)}>
                <Td colSpan={4}>
                  <Text fontWeight="bold">Educational Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Education Level"
                    value={spouse.education_level}
                    onChange={(e) =>
                      onChange(
                        index,
                        "education_level",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  >
                    {educationalLevelOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input
                    placeholder="School"
                    value={spouse.school}
                    onChange={(e) =>
                      onChange(index, "school", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Field of Study"
                    value={spouse.field_of_study}
                    onChange={(e) =>
                      onChange(index, "field_of_study", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Degree"
                    value={spouse.degree}
                    onChange={(e) =>
                      onChange(index, "degree", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Institution"
                    value={spouse.institution}
                    onChange={(e) =>
                      onChange(index, "institution", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Professional Licensure"
                    value={spouse.professional_licensure_examination}
                    onChange={(e) =>
                      onChange(
                        index,
                        "professional_licensure_examination",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={spouse.start_year}
                    onChange={(e) =>
                      onChange(index, "start_year", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={spouse.completion_year}
                    onChange={(e) =>
                      onChange(
                        index,
                        "completion_year",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>

              {/* Save and Edit Button */}
              <Tr>
              <Td colSpan={4} textAlign="center">
                  <IconButton
                    icon={spouse.isEditing ? <CheckIcon /> : <EditIcon />}
                    onClick={() =>
                      spouse.isEditing
                        ? handleSaveOrUpdate(index)
                        : onChange(index, "isEditing", true)
                    }
                    colorScheme={spouse.isEditing ? "green" : "blue"}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <HStack spacing={2} mt={4}></HStack>
        </VStack>
      ))}

      {/* Conditional add spouse button */}
      {spouses.length > 0 &&
        spouses[spouses.length - 1]?.status === "Deceased" && (
          <Button onClick={onAdd} colorScheme="teal" mt={4}>
            Add Spouse
          </Button>
        )}
    </VStack>
  );
};

export default Step7;
