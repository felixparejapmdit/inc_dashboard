import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  IconButton,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";

const Step6 = ({ spouses, handleSpouseChange, handleAddSpouse, toggleEditSpouse, handleDeleteSpouse }) => {
  return (
    <VStack align="start" spacing={4} w="100%" mb={8}>
      <Text fontWeight="bold" fontSize="lg" mb={2}>
        Spouse Information:
      </Text>
      <Table variant="simple" size="sm">
        <Tbody>
          {spouses.map((spouse, index) => (
            <Tr key={index}>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Given Name"
                    value={spouse.givenName}
                    onChange={(e) => handleSpouseChange(index, "givenName", e.target.value)}
                  />
                ) : (
                  spouse.givenName
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Middle Name"
                    value={spouse.middleName}
                    onChange={(e) => handleSpouseChange(index, "middleName", e.target.value)}
                  />
                ) : (
                  spouse.middleName
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Last Name"
                    value={spouse.lastName}
                    onChange={(e) => handleSpouseChange(index, "lastName", e.target.value)}
                  />
                ) : (
                  spouse.lastName
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Suffix"
                    value={spouse.suffix}
                    onChange={(e) => handleSpouseChange(index, "suffix", e.target.value)}
                  />
                ) : (
                  spouse.suffix
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Select
                    placeholder="Gender"
                    value={spouse.gender}
                    onChange={(e) => handleSpouseChange(index, "gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </Select>
                ) : (
                  spouse.gender
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Blood Type"
                    value={spouse.bloodType}
                    onChange={(e) => handleSpouseChange(index, "bloodType", e.target.value)}
                  />
                ) : (
                  spouse.bloodType
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Select
                    placeholder="Civil Status"
                    value={spouse.civilStatus}
                    onChange={(e) => handleSpouseChange(index, "civilStatus", e.target.value)}
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Divorced</option>
                  </Select>
                ) : (
                  spouse.civilStatus
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={spouse.dateOfBirth}
                    onChange={(e) => handleSpouseChange(index, "dateOfBirth", e.target.value)}
                  />
                ) : (
                  spouse.dateOfBirth
                )}
              </Td>
              <Td>
                {spouse.isEditing ? (
                  <Select
                    placeholder="Status"
                    value={spouse.status}
                    onChange={(e) => handleSpouseChange(index, "status", e.target.value)}
                  >
                    <option>Alive</option>
                    <option>Deceased</option>
                  </Select>
                ) : (
                  spouse.status
                )}
              </Td>
              <Td>
                <HStack>
                  {spouse.isEditing ? (
                    <IconButton
                      icon={<CheckIcon />}
                      onClick={() => toggleEditSpouse(index)}
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => toggleEditSpouse(index)}
                    />
                  )}
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDeleteSpouse(index)}
                    colorScheme="red"
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {/* Conditional add spouse button */}
      {spouses[spouses.length - 1]?.status === "Deceased" && (
        <Button onClick={handleAddSpouse} colorScheme="teal">
          Add Spouse
        </Button>
      )}
    </VStack>
  );
};

export default Step6;
