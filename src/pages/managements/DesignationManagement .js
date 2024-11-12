import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  Avatar,
  Select,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [newDesignation, setNewDesignation] = useState({
    name: "",
    section_id: "",
    subsection_id: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchDesignations();
    fetchSections();
    fetchSubsections();
  }, []);

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/designations`
      );
      setDesignations(response.data);
    } catch (error) {
      toast({
        title: "Error loading designations",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sections`
      );
      setSections(response.data);
    } catch (error) {
      toast({
        title: "Error loading sections",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchSubsections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subsections`
      );
      setSubsections(response.data);
    } catch (error) {
      toast({
        title: "Error loading subsections",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddDesignation = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/designations`,
        newDesignation
      );
      fetchDesignations();
      setNewDesignation({ name: "", section_id: "", subsection_id: "" });
      setIsAdding(false);
      toast({
        title: "Designation added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDesignation = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/designations/${editingDesignation.id}`,
        editingDesignation
      );
      fetchDesignations();
      setEditingDesignation(null);
      toast({
        title: "Designation updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDesignation = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/designations/${id}`
      );
      fetchDesignations();
      toast({
        title: "Designation deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Designation List
        </Text>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Designation Name</Th>
              <Th>Section</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Subsection</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add designation"
                      variant="ghost"
                      _hover={{ bg: "gray.100" }}
                    />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td>
                  <Input
                    placeholder="Type Designation"
                    value={newDesignation.name}
                    onChange={(e) =>
                      setNewDesignation({
                        ...newDesignation,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Section"
                    value={newDesignation.section_id}
                    onChange={(e) =>
                      setNewDesignation({
                        ...newDesignation,
                        section_id: e.target.value,
                      })
                    }
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    placeholder="Select Subsection"
                    value={newDesignation.subsection_id}
                    onChange={(e) =>
                      setNewDesignation({
                        ...newDesignation,
                        subsection_id: e.target.value,
                      })
                    }
                  >
                    {subsections.map((subsection) => (
                      <option key={subsection.id} value={subsection.id}>
                        {subsection.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Flex mt={2} justify="flex-end">
                    <Button
                      onClick={handleAddDesignation}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {designations.map((designation) => (
              <Tr key={designation.id}>
                <Td>
                  {editingDesignation &&
                  editingDesignation.id === designation.id ? (
                    <Input
                      value={editingDesignation.name}
                      onChange={(e) =>
                        setEditingDesignation({
                          ...editingDesignation,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  ) : (
                    <Flex align="center">
                      <Avatar name={designation.name} size="sm" mr={3} />
                      <Text>{designation.name}</Text>
                    </Flex>
                  )}
                </Td>
                <Td>
                  {editingDesignation &&
                  editingDesignation.id === designation.id ? (
                    <Select
                      value={editingDesignation.section_id}
                      onChange={(e) =>
                        setEditingDesignation({
                          ...editingDesignation,
                          section_id: e.target.value,
                        })
                      }
                    >
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    sections.find((s) => s.id === designation.section_id)
                      ?.name || "N/A"
                  )}
                </Td>
                <Td>
                  <Flex align="center" justify="space-between">
                    {editingDesignation &&
                    editingDesignation.id === designation.id ? (
                      <Select
                        value={editingDesignation.subsection_id}
                        onChange={(e) =>
                          setEditingDesignation({
                            ...editingDesignation,
                            subsection_id: e.target.value,
                          })
                        }
                      >
                        {subsections.map((subsection) => (
                          <option key={subsection.id} value={subsection.id}>
                            {subsection.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      subsections.find(
                        (s) => s.id === designation.subsection_id
                      )?.name || "N/A"
                    )}
                    <Flex justify="flex-end">
                      {editingDesignation &&
                      editingDesignation.id === designation.id ? (
                        <>
                          <Button
                            onClick={handleUpdateDesignation}
                            colorScheme="green"
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingDesignation(null)}
                            colorScheme="red"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            icon={<EditIcon />}
                            onClick={() => setEditingDesignation(designation)}
                            size="sm"
                            mr={2}
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit designation"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() =>
                              handleDeleteDesignation(designation.id)
                            }
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete designation"
                          />
                        </>
                      )}
                    </Flex>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>
    </Box>
  );
};

export default DesignationManagement;
