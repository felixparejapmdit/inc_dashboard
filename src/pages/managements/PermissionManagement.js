// frontend/src/pages/PermissionManagement.js
import React, { useState, useEffect, useRef } from "react";
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [deletingPermission, setDeletingPermission] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchPermissions();
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

  const handleAddPermission = async () => {
    if (!newPermission.name) {
      toast({
        title: "Name is required",
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
      setNewPermission({ name: "", description: "" });
      setIsAdding(false);
      toast({
        title: "Permission added",
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
        title: "Permission updated",
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
        title: "Permission deleted",
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

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!isAdding && (
                <IconButton
                  icon={<AddIcon />}
                  onClick={() => setIsAdding(true)}
                  size="sm"
                  aria-label="Add Permission"
                />
              )}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isAdding && (
            <Tr>
              <Td>
                <Input
                  placeholder="Permission Name"
                  value={newPermission.name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, name: e.target.value })
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
          {permissions.map((permission) => (
            <Tr key={permission.id}>
              <Td>
                {editingPermission && editingPermission.id === permission.id ? (
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
                {editingPermission && editingPermission.id === permission.id ? (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingPermission}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingPermission(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Permission
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the permission "
              {deletingPermission?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingPermission(null)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeletePermission} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PermissionManagement;
