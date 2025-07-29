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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]); // Filtered list
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const [newDepartment, setNewDepartment] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 🔍 Search Filter Logic
  useEffect(() => {
    const filtered = departments.filter((department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDepartments(filtered);
  }, [searchQuery, departments]);

  const fetchDepartments = () => {
    fetchData(
      "departments",
      (data) => {
        setDepartments(data);
        setFilteredDepartments(data);
      },
      (errorMsg) =>
        toast({
          title: "Error loading departments",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch departments."
    );
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      toast({
        title: "Name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("departments", newDepartment, "Failed to add department");
      fetchDepartments();
      setNewDepartment({ name: "" });
      setIsAdding(false);
      toast({
        title: "Department added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding department",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      await putData(
        "departments",
        editingDepartment.id,
        editingDepartment,
        "Failed to update department"
      );

      fetchDepartments();
      setEditingDepartment(null);
      toast({
        title: "Department updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating department",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return;

    try {
      await deleteData(
        "departments",
        deletingDepartment.id,
        "Failed to delete department"
      );
      fetchDepartments();
      toast({
        title: "Department deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting department",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingDepartment(null);
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="28px" fontWeight="bold">
            Department List
          </Text>

          {/* 🔍 Search Bar */}
          <Input
            placeholder="Search Departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width="250px"
          />
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Name</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add department"
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
                    placeholder="Department Name"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ name: e.target.value })}
                    autoFocus
                  />
                  <Flex mt={2} justify="flex-end">
                    <Button
                      onClick={handleAddDepartment}
                      colorScheme="green"
                      size="sm"
                      mt={2}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                      mt={2}
                      ml={2}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {filteredDepartments.map((department) => (
              <Tr key={department.id}>
                <Td>
                  <Flex align="center">
                    {editingDepartment &&
                    editingDepartment.id === department.id ? (
                      <>
                        <Input
                          value={editingDepartment.name}
                          onChange={(e) =>
                            setEditingDepartment({
                              ...editingDepartment,
                              name: e.target.value,
                            })
                          }
                          autoFocus
                          mr={2}
                        />
                        <Button
                          onClick={handleUpdateDepartment}
                          colorScheme="green"
                          size="sm"
                          mr={2}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingDepartment(null)}
                          colorScheme="red"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Avatar name={department.name} size="sm" mr={3} />
                        <Text>{department.name}</Text>
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => setEditingDepartment(department)}
                          size="sm"
                          ml="auto"
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit department"
                          _hover={{ bg: "yellow.100" }}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => setDeletingDepartment(department)}
                          size="sm"
                          ml={2}
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete department"
                          _hover={{ bg: "red.100" }}
                        />
                      </>
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingDepartment}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingDepartment(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Department
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the department "
              {deletingDepartment?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingDepartment(null)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteDepartment} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DepartmentManagement;
