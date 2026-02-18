import React, { useState, useEffect, useRef } from "react";
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
  IconButton,
  Text,
  Avatar,
  HStack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const DistrictManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newDistrict, setNewDistrict] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  // Delete modal states
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    const filtered = districts.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDistricts(filtered);
    setCurrentPage(1); // reset page when filtering
  }, [searchQuery, districts]);

  const fetchDistricts = () => {
    fetchData(
      "districts",
      setDistricts,
      (errorMsg) =>
        toast({
          title: "Error loading districts",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to load districts"
    );
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.name.trim()) {
      toast({
        title: "District name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("districts", newDistrict, "Failed to add district");
      fetchDistricts();
      setNewDistrict({ name: "" });
      setIsAdding(false);
      toast({
        title: "District added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDistrict = async () => {
    try {
      await putData(
        "districts",
        editingDistrict.id,
        editingDistrict,
        "Failed to update district"
      );
      fetchDistricts();
      setEditingDistrict(null);
      toast({
        title: "District updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const openDeleteDialog = (id) => {
    setSelectedDistrictId(id);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteData("districts", selectedDistrictId, "Failed to delete district");
      fetchDistricts();
      onClose();
      toast({
        title: "District deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDistricts.length / itemsPerPage);
  const paginatedDistricts = filteredDistricts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          District List
        </Text>

        <Input
          placeholder="Search district..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>District Name</Th>
              <Th textAlign="center">
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add district"
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
                    placeholder="Type District Name"
                    value={newDistrict.name}
                    onChange={(e) =>
                      setNewDistrict({
                        ...newDistrict,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddDistrict}
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

            {paginatedDistricts.map((district) => (
              <Tr key={district.id}>
                <Td>
                  {editingDistrict && editingDistrict.id === district.id ? (
                    <Input
                      value={editingDistrict.name}
                      onChange={(e) =>
                        setEditingDistrict({
                          ...editingDistrict,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  ) : (
                    <Flex align="center">
                      <Avatar name={district.name} size="sm" mr={3} />
                      <Text>{district.name}</Text>
                    </Flex>
                  )}
                </Td>
                <Td>
                  <HStack spacing={2} justify="flex-end">
                    {editingDistrict && editingDistrict.id === district.id ? (
                      <>
                        <Button
                          onClick={handleUpdateDistrict}
                          colorScheme="green"
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingDistrict(null)}
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
                          onClick={() => setEditingDistrict(district)}
                          size="sm"
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit district"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => openDeleteDialog(district.id)}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete district"
                        />
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {totalPages > 1 && (
          <HStack justify="center" mt={4} spacing={4}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              isDisabled={currentPage === totalPages}
              size="sm"
            >
              Next
            </Button>
          </HStack>
        )}
      </Stack>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete District
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this district? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DistrictManagement;
