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

import { fetchData, postData, putData, deleteData } from "../../utils/fetchData";
const PermissionCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: "Name is required", status: "warning", duration: 3000 });
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/permission-categories`,
        newCategory
      );
      fetchCategories();
      setNewCategory({ name: "", description: "" });
      setIsAdding(false);
      toast({ title: "Category added", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error adding category",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateCategory = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/permission-categories/${editingCategory.id}`,
        editingCategory
      );
      fetchCategories();
      setEditingCategory(null);
      toast({ title: "Category updated", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error updating category",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/permission-categories/${deletingCategory.id}`
      );
      fetchCategories();
      setDeletingCategory(null);
      toast({ title: "Category deleted", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error deleting category",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box fontSize="2xl" fontWeight="bold">
          Permission Categories
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
              {" "}
              {!isAdding && (
                <IconButton
                  icon={<AddIcon />}
                  onClick={() => setIsAdding(true)}
                  size="sm"
                  aria-label="Add Category"
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
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </Td>
              <Td>
                <Input
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </Td>
              <Td>
                <Button
                  onClick={handleAddCategory}
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
              </Td>
            </Tr>
          )}
          {categories.map((category) => (
            <Tr key={category.id}>
              <Td>
                {editingCategory && editingCategory.id === category.id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  category.name
                )}
              </Td>
              <Td>
                {editingCategory && editingCategory.id === category.id ? (
                  <Input
                    value={editingCategory.description}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  category.description || "N/A"
                )}
              </Td>
              <Td>
                <Flex justify="center">
                  {editingCategory && editingCategory.id === category.id ? (
                    <>
                      <Button
                        onClick={handleUpdateCategory}
                        colorScheme="green"
                        size="sm"
                        mr={2}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingCategory(null)}
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
                        onClick={() => setEditingCategory(category)}
                        size="sm"
                        variant="ghost"
                        colorScheme="yellow"
                        aria-label="Edit category"
                        mr={2}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => setDeletingCategory(category)}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete category"
                      />
                    </>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AlertDialog
        isOpen={!!deletingCategory}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingCategory(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Category</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{deletingCategory?.name}"?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setDeletingCategory(null)}>Cancel</Button>
              <Button onClick={handleDeleteCategory} colorScheme="red" ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PermissionCategoriesManagement;
