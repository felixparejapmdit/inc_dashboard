import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  HStack,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const GovernmentIssuedIDManagement = () => {
  const [governmentIDs, setGovernmentIDs] = useState([]);
  const [filteredGovernmentIDs, setFilteredGovernmentIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGovernmentID, setNewGovernmentID] = useState({ name: "" });
  const [editingGovernmentID, setEditingGovernmentID] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredGovernmentIDs.length / itemsPerPage);
  const paginatedIDs = filteredGovernmentIDs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    fetchGovernmentIDs();
  }, []);

  useEffect(() => {
    const filtered = governmentIDs.filter((id) =>
      id.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGovernmentIDs(filtered);
    setCurrentPage(1); // reset page on search
  }, [searchTerm, governmentIDs]);

  const fetchGovernmentIDs = () => {
    fetchData(
      "government-issued-ids",
      setGovernmentIDs,
      (errorMsg) =>
        toast({
          title: "Error fetching government-issued IDs.",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to load government-issued IDs"
    );
  };

  const handleAddGovernmentID = async () => {
    if (!newGovernmentID.name.trim()) {
      toast({
        title: "Field Required",
        description: "Please provide a government-issued ID name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const createdID = await postData(
        "government-issued-ids",
        newGovernmentID,
        "Failed to add government-issued ID"
      );
      setGovernmentIDs((prev) => [...prev, createdID]);
      toast({
        title: "Government-issued ID added successfully.",
        status: "success",
        duration: 3000,
      });
      setNewGovernmentID({ name: "" });
      setIsAddingNew(false);
    } catch (error) {
      toast({
        title: "Error adding government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditGovernmentID = async () => {
    if (!editingGovernmentID.name.trim()) {
      toast({
        title: "Field Required",
        description: "Please provide a government-issued ID name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await putData(
        "government-issued-ids",
        editingGovernmentID.id,
        { name: editingGovernmentID.name },
        "Failed to update government-issued ID"
      );
      setGovernmentIDs((prev) =>
        prev.map((id) =>
          id.id === editingGovernmentID.id ? editingGovernmentID : id
        )
      );
      toast({
        title: "Government-issued ID updated successfully.",
        status: "success",
        duration: 3000,
      });
      setEditingGovernmentID(null);
    } catch (error) {
      toast({
        title: "Error updating government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteGovernmentID = (id) => {
    setSelectedDeleteId(id);
    onOpen();
  };

  const confirmDeleteGovernmentID = async () => {
    try {
      await deleteData(
        "government-issued-ids",
        selectedDeleteId,
        "Failed to delete government-issued ID"
      );
      setGovernmentIDs((prev) =>
        prev.filter((idData) => idData.id !== selectedDeleteId)
      );
      toast({
        title: "Government-issued ID deleted successfully.",
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error deleting government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={6}>
      <Input
        placeholder="Search by Government-issued ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={4}
      />

      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Government Issued ID</Th>
            <Th>
              <Flex justify="space-between" align="center">
                <span>Actions</span>
                {!isAddingNew && !editingGovernmentID && (
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => setIsAddingNew(true)}
                    size="sm"
                    aria-label="Add Government ID"
                    variant="ghost"
                  />
                )}
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isAddingNew && (
            <Tr>
              <Td>—</Td>
              <Td>
                <Input
                  placeholder="Government Issued ID Name"
                  value={newGovernmentID.name}
                  onChange={(e) =>
                    setNewGovernmentID({
                      ...newGovernmentID,
                      name: e.target.value,
                    })
                  }
                />
              </Td>
              <Td>
                <HStack justify="flex-end">
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={handleAddGovernmentID}
                  >
                    Add
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </Td>
            </Tr>
          )}
          {paginatedIDs.map((id, index) => (
            <Tr key={`${id.id}-${index}`}>
              <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
              <Td>
                {editingGovernmentID?.id === id.id ? (
                  <Input
                    value={editingGovernmentID.name}
                    onChange={(e) =>
                      setEditingGovernmentID({
                        ...editingGovernmentID,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  id.name
                )}
              </Td>
              <Td>
                <HStack justify="flex-end">
                  {editingGovernmentID?.id === id.id ? (
                    <>
                      <IconButton
                        icon={<CheckIcon />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleEditGovernmentID}
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => setEditingGovernmentID(null)}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => setEditingGovernmentID(id)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteGovernmentID(id.id)}
                      />
                    </>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <HStack justify="center" mt={4}>
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
              Delete Government-issued ID
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this ID? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteGovernmentID}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default GovernmentIssuedIDManagement;
