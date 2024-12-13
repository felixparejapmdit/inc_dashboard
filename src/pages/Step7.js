import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Select,
  Button,
  IconButton,
  Grid,
  GridItem,
  Table,
  Tbody,
  Tr,
  Td,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Step7 = ({
  data,
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
  const [spouses, setSpouses] = useState([
    {
      relationshipType: "Spouse",
      givenName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "",
      bloodType: "",
      civilStatus: "",
      dateOfBirth: "",
      dateOfMarriage: "",
      placeOfMarriage: "",
      citizenship: "",
      nationality: "",
      contactNumber: "",
      churchDuties: "",
      livelihood: "",
      districtId: "",
      localCongregation: "",
      ministerOfficiated: "",
      employmentType: "",
      company: "",
      address: "",
      position: "",
      department: "",
      section: "",
      startDate: "",
      endDate: "",
      reasonForLeaving: "",
      educationLevel: "",
      startYear: "",
      completionYear: "",
      school: "",
      fieldOfStudy: "",
      degree: "",
      institution: "",
      professionalLicensureExamination: "",
      isEditing: true, // Default is true for editable fields on load
    },
  ]);

  const handleAddSpouse = () => {
    setSpouses([
      ...spouses,
      {
        givenName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "",
        bloodType: "",
        civilStatus: "",
        dateOfBirth: "",
        dateOfMarriage: "",
        placeOfMarriage: "",
        citizenship: "",
        nationality: "",
        contactNumber: "",
        churchDuties: "",
        livelihood: "",
        districtId: "",
        localCongregation: "",
        ministerOfficiated: "",
        employmentType: "",
        company: "",
        address: "",
        position: "",
        department: "",
        section: "",
        startDate: "",
        endDate: "",
        reasonForLeaving: "",
        educationLevel: "",
        startYear: "",
        completionYear: "",
        school: "",
        fieldOfStudy: "",
        degree: "",
        institution: "",
        professionalLicensureExamination: "",
        isEditing: true, // Default to true for new spouses
      },
    ]);
  };

  const toggleEditSpouse = (index) => {
    const updatedSpouses = [...spouses];
    updatedSpouses[index].isEditing = !updatedSpouses[index].isEditing;
    setSpouses(updatedSpouses);
  };

  const handleSpouseChange = (index, field, value) => {
    const updatedSpouses = spouses.map((spouse, i) =>
      i === index ? { ...spouse, [field]: value } : spouse
    );
    setSpouses(updatedSpouses);
  };

  const handleDeleteSpouse = (index) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSaveOrUpdate = async (index) => {
    setLoading(true);
    const spouse = spouses[index];
    const {
      id,
      isEditing,
      relationshipType,
      givenName,
      lastName,
      gender,
      ...spousesData
    } = spouse;

    // Map frontend fields to backend fields
    const formattedData = {
      ...spousesData,
      givenname: givenName,
      lastname: lastName, // Ensure lastname is sent
      gender: gender, // Ensure gender is sent
      relationship_type: relationshipType,
      personnel_id: spousesData.personnel_id || 8,
    };

    // Validate required fields before saving/updating
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
      "gender",
    ];
    for (const field of requiredFields) {
      if (
        !formattedData[field] ||
        (typeof formattedData[field] === "string" &&
          formattedData[field].trim() === "")
      ) {
        toast({
          title: "Validation Error",
          description: `The field ${field} is required for ${relationshipType}.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    try {
      if (spouse.id) {
        // Update existing spouses record
        const response = await axios.put(
          `${API_URL}/api/family-members/${id}`,
          formattedData
        );
        const updatedspouses = response.data;

        setSpouses((prev) =>
          prev.map((item, i) =>
            i === index ? { ...updatedspouses, isEditing: false } : item
          )
        );

        toast({
          title: "spouses Information Updated",
          description: `${relationshipType} information has been updated successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save new spouses record
        const response = await axios.post(
          `${API_URL}/api/family-members`,
          formattedData
        );

        const savedspouses = response.data;

        setSpouses((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, id: savedspouses.id, isEditing: false }
              : item
          )
        );

        toast({
          title: "spouses Information Saved",
          description: `${relationshipType} information has been saved successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving/updating spouses information:", error); // Log the full error
      toast({
        title: "Error",
        description: `Failed to save/update ${relationshipType} information. ${
          error.response?.data?.message ||
          "Please check the data or server connectivity."
        }`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack width="100%" bg="white" boxShadow="sm" my={85} p={5}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 7: Spouse Information
      </Heading>
      {spouses.map((spouse, index) => (
        <VStack
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          w="100%"
          bg="gray.50"
          spacing={4}
        >
          <Table
            key={spouse.id || spouse.generatedId}
            size="md"
            variant="simple"
          >
            <Tbody>
              {/* Personal Information */}
              <Tr bg="gray.50">
                <Td colSpan={4}>
                  <Text fontWeight="bold">Personal Information</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    placeholder="Select Gender"
                    value={spouses.gender}
                    onChange={(e) =>
                      handleSpouseChange(index, "gender", e.target.value)
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
                    value={spouses.givenName}
                    onChange={(e) =>
                      handleSpouseChange(index, "givenName", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Middle Name"
                    value={spouses.middleName}
                    onChange={(e) =>
                      handleSpouseChange(index, "middleName", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Last Name"
                    value={spouses.lastName}
                    onChange={(e) =>
                      handleSpouseChange(index, "lastName", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Select
                    name="suffix"
                    value={spouses[index]?.suffix || ""}
                    onChange={(e) =>
                      handleSpouseChange(index, "suffix", e.target.value)
                    }
                    width="100%"
                    isDisabled={spouses[index]?.gender === "Female"}
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
                    value={spouses.dateOfBirth}
                    onChange={(e) =>
                      handleSpouseChange(index, "dateOfBirth", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Contact Number"
                    value={spouses.contactNumber}
                    onChange={(e) =>
                      handleSpouseChange(index, "contactNumber", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Blood Type"
                    name="bloodtype"
                    value={spouses.bloodtype}
                    onChange={(e) =>
                      handleSpouseChange(index, "bloodType", e.target.value)
                    }
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
                    value={spouses.civilStatus}
                    onChange={(e) =>
                      handleSpouseChange(index, "civilStatus", e.target.value)
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
                    value={spouses.placeOfMarriage}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "placeOfMarriage",
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
                    value={spouses.citizenship}
                    onChange={(e) =>
                      handleSpouseChange({
                        target: { name: "citizenship", value: e.target.value },
                      })
                    }
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
                    value={spouses.nationality}
                    onChange={(e) =>
                      handleSpouseChange({
                        target: { name: "nationality", value: e.target.value },
                      })
                    }
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
                    value={spouses.livelihood}
                    onChange={(e) =>
                      handleSpouseChange(index, "livelihood", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select District"
                    name="district_id"
                    value={spouses.districtId}
                    onChange={(e) =>
                      handleSpouseChange({
                        target: {
                          name: "districtId",
                          value: e.target.value,
                        },
                      })
                    }
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
                    value={spouses.localCongregation}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "localCongregation",
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
                    value={spouses.churchDuties}
                    onChange={(e) =>
                      handleSpouseChange(index, "churchDuties", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Minister Officiated"
                    value={spouses.ministerOfficiated}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "ministerOfficiated",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
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
                  <Select
                    placeholder="Employment Type"
                    value={spouses.employmentType}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "employmentType",
                        e.target.value
                      )
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
                    value={spouses.company}
                    onChange={(e) =>
                      handleSpouseChange(index, "company", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Position"
                    value={spouses.position}
                    onChange={(e) =>
                      handleSpouseChange(index, "position", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Address"
                    value={spouses.address}
                    onChange={(e) =>
                      handleSpouseChange(index, "address", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Department"
                    value={spouses.department}
                    onChange={(e) =>
                      handleSpouseChange(index, "department", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Section"
                    value={spouses.section}
                    onChange={(e) =>
                      handleSpouseChange(index, "section", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={spouses.startDate}
                    onChange={(e) =>
                      handleSpouseChange(index, "startDate", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={spouses.endDate}
                    onChange={(e) =>
                      handleSpouseChange(index, "endDate", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Reason for Leaving"
                    value={spouses.reasonForLeaving}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "reasonForLeaving",
                        e.target.value
                      )
                    }
                    isDisabled={!spouse.isEditing}
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
                  <Select
                    placeholder="Education Level"
                    value={spouses.educationLevel}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "educationLevel",
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
                    value={spouses.school}
                    onChange={(e) =>
                      handleSpouseChange(index, "school", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Field of Study"
                    value={spouses.fieldOfStudy}
                    onChange={(e) =>
                      handleSpouseChange(index, "fieldOfStudy", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Degree"
                    value={spouses.degree}
                    onChange={(e) =>
                      handleSpouseChange(index, "degree", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Input
                    placeholder="Institution"
                    value={spouses.institution}
                    onChange={(e) =>
                      handleSpouseChange(index, "institution", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Professional Licensure"
                    value={spouses.professionalLicensureExamination}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "professionalLicensureExamination",
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
                    value={spouses.startYear}
                    onChange={(e) =>
                      handleSpouseChange(index, "startYear", e.target.value)
                    }
                    isDisabled={!spouse.isEditing}
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Completion Year"
                    type="number"
                    value={spouses.completionYear}
                    onChange={(e) =>
                      handleSpouseChange(
                        index,
                        "completionYear",
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
                  {spouse.isEditing ? (
                    <IconButton
                      icon={<CheckIcon />}
                      colorScheme="green"
                      onClick={
                        () =>
                          spouse.isEditing
                            ? handleSaveOrUpdate(index) // Save on check
                            : handleSpouseChange(index, "isEditing", true) // Enable editing
                      }
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="blue"
                      onClick={() => toggleEditSpouse(index)}
                    />
                  )}
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteSpouse(index)}
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
          <Button onClick={handleAddSpouse} colorScheme="teal" mt={4}>
            Add Spouse
          </Button>
        )}
    </VStack>
  );
};

export default Step7;
