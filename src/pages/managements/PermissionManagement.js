import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Flex,
  Select,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

import { fetchData, postData, putData, deleteData } from "../../utils/fetchData";
const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [deletingPermission, setDeletingPermission] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchPermissions();
    fetchCategories();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/permissions`
      );
      setPermissions(response.data);
    } catch (error) {
      toast({
        title: "Error loading permissions",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/permission-categories`
      );
      setCategories(response.data);
    } catch (error) {
      toast({
        title: "Error loading categories",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.name || !newPermission.categoryId) {
      toast({
        title: "Name and category are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/permissions`,
        newPermission
      );
      fetchPermissions();
      setNewPermission({ name: "", description: "", categoryId: "" });
      setIsAdding(false);
      toast({
        title: "Permission added successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding permission",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdatePermission = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/permissions/${editingPermission.id}`,
        editingPermission
      );
      fetchPermissions();
      setEditingPermission(null);
      toast({
        title: "Permission updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating permission",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeletePermission = async () => {
    if (!deletingPermission) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/permissions/${deletingPermission.id}`
      );
      fetchPermissions();
      toast({
        title: "Permission deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting permission",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingPermission(null);
    }
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box fontSize="2xl" fontWeight="bold">
          Permission Management
        </Box>
      </Flex>

      {categories.map((category) => (
        <Box key={category.id} mb={6}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {category.name}
          </Text>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>
                  {" "}
                  Category
                  <Flex display="none" justify="space-between" align="center">
                    <Text>Category</Text>
                    <Select
                      placeholder="Select Category"
                      size="sm"
                      value={category.id}
                      disabled
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </Th>
                <Th>
                  <Flex justify="flex-end">
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => {
                        setNewPermission({
                          ...newPermission,
                          categoryId: category.id,
                        });
                        setIsAdding(true);
                      }}
                      size="sm"
                      aria-label="Add Permission"
                    />
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {isAdding && newPermission.categoryId === category.id && (
                <Tr>
                  <Td></Td>
                  <Td>
                    <Input
                      placeholder="Permission Name"
                      value={newPermission.name}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          name: e.target.value,
                        })
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      placeholder="Description"
                      value={newPermission.description}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          description: e.target.value,
                        })
                      }
                    />
                  </Td>
                  <Td>
                    <Select
                      placeholder="Select Category"
                      value={newPermission.categoryId || ""}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Flex justify="flex-end">
                      <Button
                        onClick={handleAddPermission}
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
              {permissions
                .filter((permission) => permission.categoryId === category.id)
                .map((permission, index) => (
                  // <Tr key={permission.id}>
                  <Tr key={`${permission.id}-${index}`}>
                    <Td>{index + 1}</Td>
                    <Td>
                      {editingPermission &&
                      editingPermission.id === permission.id ? (
                        <Input
                          value={editingPermission.name}
                          onChange={(e) =>
                            setEditingPermission({
                              ...editingPermission,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        permission.name
                      )}
                    </Td>
                    <Td>
                      {editingPermission &&
                      editingPermission.id === permission.id ? (
                        <Input
                          value={editingPermission.description}
                          onChange={(e) =>
                            setEditingPermission({
                              ...editingPermission,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        permission.description || "N/A"
                      )}
                    </Td>
                    <Td>
                      {editingPermission &&
                      editingPermission.id === permission.id ? (
                        <Select
                          placeholder="Select Category"
                          value={editingPermission.categoryId || ""}
                          onChange={(e) =>
                            setEditingPermission({
                              ...editingPermission,
                              categoryId: e.target.value,
                            })
                          }
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        category.name
                      )}
                    </Td>
                    <Td>
                      <Flex justify="center">
                        {editingPermission &&
                        editingPermission.id === permission.id ? (
                          <>
                            <Button
                              onClick={handleUpdatePermission}
                              colorScheme="green"
                              size="sm"
                              mr={2}
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingPermission(null)}
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
                              onClick={() => setEditingPermission(permission)}
                              size="sm"
                              mr={2}
                              variant="ghost"
                              colorScheme="yellow"
                              aria-label="Edit permission"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              onClick={() => setDeletingPermission(permission)}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              aria-label="Delete permission"
                            />
                          </>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
      ))}
    </Box>
  );
};

export default PermissionManagement;
