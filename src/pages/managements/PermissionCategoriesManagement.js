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

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
const PermissionCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);
  // Fetch Categories
  const fetchCategories = () => {
    fetchData(
      "permission-categories",
      (data) => setCategories(data),
      null, // No toast or error handler
      "Failed to fetch categories"
    );
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Category name required",
        description: "Please enter a category name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await postData("permission-categories", newCategory);
      fetchCategories();
      setNewCategory({ name: "", description: "" });
      setIsAdding(false);
      toast({
        title: "Category added",
        description: "The category was successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add category",
        description: error.message || "An error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update Category
  const handleUpdateCategory = async () => {
    try {
      await putData(
        "permission-categories",
        editingCategory.id,
        editingCategory,
        "Error updating category"
      );
      fetchCategories();
      setEditingCategory(null);
      toast({
        title: "Category updated",
        description: "The category was successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to update category",
        description: error.message || "An error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    try {
      await deleteData(
        "permission-categories",
        deletingCategory.id,
        "Error deleting category"
      );
      fetchCategories();
      setDeletingCategory(null);
      toast({
        title: "Category deleted",
        description: "The category was successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete category",
        description: error.message || "An error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
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
