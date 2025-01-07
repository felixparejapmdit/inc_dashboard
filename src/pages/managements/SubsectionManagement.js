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

const SubsectionManagement = () => {
  const [subsections, setSubsections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]); // Add this state for filtered sections
  const [newSubsection, setNewSubsection] = useState({
    name: "",
    department_id: "",
    section_id: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubsection, setEditingSubsection] = useState(null);
  const [deletingSubsection, setDeletingSubsection] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchSubsections();
    fetchDepartments();
    fetchSections();
  }, []);

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

  // Updated handleAddSubsection function
  const handleAddSubsection = async () => {
    if (
      !newSubsection.name ||
      !newSubsection.department_id ||
      !newSubsection.section_id
    ) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subsections`,
        newSubsection
      );
      fetchSubsections(); // Refresh the list of subsections
      setNewSubsection({ name: "", department_id: "", section_id: "" });
      setFilteredSections([]); // Reset the filtered sections after adding
      setIsAdding(false);
      toast({
        title: "Subsection added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSubsection = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subsections/${editingSubsection.id}`,
        editingSubsection
      );
      fetchSubsections();
      setEditingSubsection(null);
      toast({
        title: "Subsection updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSubsection = async () => {
    if (!deletingSubsection) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/subsections/${deletingSubsection.id}`
      );
      fetchSubsections();
      toast({
        title: "Subsection deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingSubsection(null);
    }
  };

  const handleDepartmentChange = (departmentId) => {
    // Update newSubsection with selected department ID
    setNewSubsection({
      ...newSubsection,
      department_id: departmentId,
      section_id: "", // Reset section_id when department changes
    });

    // Filter sections based on the selected department ID
    const filtered = sections.filter(
      (section) => section.department_id === parseInt(departmentId)
    );
    setFilteredSections(filtered);
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Subsection/Team List
          </Text>
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Team</Th>
              <Th>Department</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Section</span>
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
                    placeholder="Subsection Name"
                    value={newSubsection.name}
                    onChange={(e) =>
                      setNewSubsection({
                        ...newSubsection,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                {/* Rendering logic for department and section dropdowns */}
                <Td>
                  <Select
                    placeholder="Select Department"
                    value={newSubsection.department_id}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    placeholder="Select Section"
                    value={newSubsection.section_id}
                    onChange={(e) =>
                      setNewSubsection({
                        ...newSubsection,
                        section_id: e.target.value,
                      })
                    }
                    isDisabled={!newSubsection.department_id} // Disable if no department is selected
                  >
                    {filteredSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </Select>
                </Td>

                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddSubsection}
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
            {subsections.map((subsection) => (
              <Tr key={subsection.id}>
                <Td>
                  {editingSubsection &&
                  editingSubsection.id === subsection.id ? (
                    <Input
                      value={editingSubsection.name}
                      onChange={(e) =>
                        setEditingSubsection({
                          ...editingSubsection,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  ) : (
                    <Flex align="center">
                      <Avatar name={subsection.name} size="sm" mr={3} />
                      <Text>{subsection.name}</Text>
                    </Flex>
                  )}
                </Td>
                <Td>
                  {editingSubsection &&
                  editingSubsection.id === subsection.id ? (
                    <Select
                      value={editingSubsection.department_id}
                      onChange={(e) =>
                        setEditingSubsection({
                          ...editingSubsection,
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
                    departments.find((d) => d.id === subsection.department_id)
                      ?.name || "N/A"
                  )}
                </Td>
                <Td>
                  <Flex align="center" justify="space-between">
                    {editingSubsection &&
                    editingSubsection.id === subsection.id ? (
                      <Select
                        value={editingSubsection.section_id}
                        onChange={(e) =>
                          setEditingSubsection({
                            ...editingSubsection,
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
                      sections.find((s) => s.id === subsection.section_id)
                        ?.name || "N/A"
                    )}
                    <Flex justify="flex-end">
                      {editingSubsection &&
                      editingSubsection.id === subsection.id ? (
                        <>
                          <Button
                            onClick={handleUpdateSubsection}
                            colorScheme="green"
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingSubsection(null)}
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
                            onClick={() => setEditingSubsection(subsection)}
                            size="sm"
                            mr={2}
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit subsection"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => setDeletingSubsection(subsection)}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete subsection"
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
        isOpen={!!deletingSubsection}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingSubsection(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subsection
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the subsection "
              {deletingSubsection?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingSubsection(null)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSubsection} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SubsectionManagement;
