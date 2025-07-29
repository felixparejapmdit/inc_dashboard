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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const ApplicationTypeManagement = () => {
  const [appTypes, setAppTypes] = useState([]);
  const [filteredAppTypes, setFilteredAppTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAppType, setNewAppType] = useState({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppType, setEditingAppType] = useState(null);
  const [deletingAppType, setDeletingAppType] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    const filtered = appTypes.filter((type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppTypes(filtered);
  }, [searchQuery, appTypes]);

  useEffect(() => {
    fetchApplicationTypes();
  }, []);

  // Fetch all application types
  const fetchApplicationTypes = async () => {
    try {
      await fetchData("application-types", (data) => {
        setAppTypes(data);
        setFilteredAppTypes(data);
      });
    } catch (error) {
      toast({
        title: "Error loading application types",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Add new application type
  const handleAddApplicationType = async () => {
    if (!newAppType.name) {
      toast({ title: "Name is required", status: "warning", duration: 3000 });
      return;
    }

    try {
      await postData("add_application-types", newAppType);
      fetchApplicationTypes();
      setNewAppType({ name: "" });
      setIsModalOpen(false);
      toast({
        title: "Application type added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding application type",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Update existing application type
  const handleUpdateApplicationType = async () => {
    if (!editingAppType.name) {
      toast({ title: "Name is required", status: "warning", duration: 3000 });
      return;
    }

    try {
      await putData(`application-types/${editingAppType.id}`, editingAppType);
      fetchApplicationTypes();
      setEditingAppType(null);
      setIsModalOpen(false);
      toast({
        title: "Application type updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating application type",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Delete application type
  const handleDeleteApplicationType = async () => {
    try {
      await deleteData(`application-types/${deletingAppType.id}`);
      fetchApplicationTypes();
      toast({
        title: "Application type deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting application type",
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingAppType(null);
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Application Type Management
        </Text>

        {/* Search Bar and Add Button Aligned */}
        <Flex justify="space-between" align="center">
          {/* Search Bar on the Right */}
          <Input
            placeholder="Search Application Types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width="250px"
          />

          {/* Add New Button on the Left */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="orange"
            onClick={() => setIsModalOpen(true)}
          >
            New Application Type
          </Button>
        </Flex>

        {/* Application Type Table */}
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>#</Th> {/* Row Number Column */}
              <Th>Name</Th>
              <Th width="20%" textAlign="right">
                Actions
              </Th>
              {/* Actions Column - Aligned Right */}
            </Tr>
          </Thead>
          <Tbody>
            {filteredAppTypes.length > 0 ? (
              filteredAppTypes.map((type, index) => (
                // <Tr key={type.id}>
                <Tr key={`${type.id}-${index}`}>
                  <Td>{index + 1}</Td> {/* Row Number */}
                  <Td>{type.name}</Td>
                  <Td textAlign="right">
                    {/* Align Actions to the Right */}
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="yellow"
                      aria-label="Edit"
                      onClick={() => {
                        setEditingAppType(type);
                        setIsModalOpen(true);
                      }}
                      mr={2}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      aria-label="Delete"
                      onClick={() => setDeletingAppType(type)}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3} textAlign="center">
                  No application types found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Stack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAppType
              ? "Edit Application Type"
              : "Add New Application Type"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Application Type Name"
              value={editingAppType ? editingAppType.name : newAppType.name}
              onChange={(e) =>
                editingAppType
                  ? setEditingAppType({
                      ...editingAppType,
                      name: e.target.value,
                    })
                  : setNewAppType({ name: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={
                editingAppType
                  ? handleUpdateApplicationType
                  : handleAddApplicationType
              }
            >
              {editingAppType ? "Update" : "Save"}
            </Button>
            <Button onClick={() => setIsModalOpen(false)} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingAppType}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingAppType(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Application Type
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deletingAppType?.name}"? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingAppType(null)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteApplicationType}
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

export default ApplicationTypeManagement;
