import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
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
  Flex,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newSection, setNewSection] = useState({ name: "", department_id: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchSections();
    fetchDepartments();
  }, []);

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

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/departments`
      );
      setDepartments(response.data);
    } catch (error) {
      toast({
        title: "Error loading departments",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddSection = async () => {
    if (!newSection.name || !newSection.department_id) {
      toast({
        title: "Name and Department are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sections`,
        newSection
      );
      fetchSections();
      setNewSection({ name: "", department_id: "" });
      setIsAdding(false);
      toast({
        title: "Section added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSection = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/sections/${editingSection.id}`,
        editingSection
      );
      fetchSections();
      setEditingSection(null);
      toast({
        title: "Section updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/sections/${deletingSection.id}`
      );
      fetchSections();
      toast({
        title: "Section deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingSection(null); // Close alert after delete
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Section List
        </Text>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Department</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add section"
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
                    placeholder="Section Name"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Flex align="center">
                    <Select
                      placeholder="Select Department"
                      value={newSection.department_id}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          department_id: e.target.value,
                        })
                      }
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={handleAddSection}
                      colorScheme="green"
                      size="sm"
                      ml={2}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                      ml={2}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {sections.map((section) => (
              <Tr key={section.id}>
                <Td>
                  <Flex align="center">
                    <Avatar name={section.name} size="sm" mr={3} />
                    {editingSection && editingSection.id === section.id ? (
                      <Input
                        value={editingSection.name}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            name: e.target.value,
                          })
                        }
                        autoFocus
                        mr={2}
                      />
                    ) : (
                      <Text>{section.name}</Text>
                    )}
                  </Flex>
                </Td>
                <Td>
                  <Flex align="center" justify="space-between">
                    {editingSection && editingSection.id === section.id ? (
                      <Select
                        value={editingSection.department_id}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            department_id: e.target.value,
                          })
                        }
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      departments.find((d) => d.id === section.department_id)
                        ?.name || "N/A"
                    )}
                    <Flex ml="auto">
                      {editingSection && editingSection.id === section.id ? (
                        <>
                          <Button
                            onClick={handleUpdateSection}
                            colorScheme="green"
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingSection(null)}
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
                            onClick={() => setEditingSection(section)}
                            size="sm"
                            ml={2}
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit section"
                            _hover={{ bg: "yellow.100" }}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => setDeletingSection(section)}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete section"
                            _hover={{ bg: "red.100" }}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingSection}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingSection(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Section
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the section "
              {deletingSection?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingSection(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSection} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SectionManagement;
