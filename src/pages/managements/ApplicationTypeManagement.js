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
  HStack,
  Badge,
  InputGroup,
  InputLeftElement,
  Heading,
  Card,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";

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
        isClosable: true,
      });
    }
  };

  // Add new application type
  const handleAddApplicationType = async () => {
    if (!newAppType.name) {
      toast({
        title: "Name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error adding application type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update existing application type
  const handleUpdateApplicationType = async () => {
    if (!editingAppType.name) {
      toast({
        title: "Name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating application type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete application type
  const handleDeleteApplicationType = async () => {
    try {
      await deleteData("application-types", deletingAppType.id);
      fetchApplicationTypes();
      toast({
        title: "Application type deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting application type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingAppType(null);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <Heading size="lg" color="gray.700">
            Application Type Management
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="md"
            onClick={() => {
              setEditingAppType(null);
              setNewAppType({ name: "" });
              setIsModalOpen(true);
            }}
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            Application Type
          </Button>
        </Flex>

        {/* Search Bar */}
        <Card variant="outline" boxShadow="sm">
          <CardBody>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search application types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
              />
            </InputGroup>
          </CardBody>
        </Card>

        {/* Results Summary */}
        <Flex justify="space-between" align="center" px={2}>
          <Text fontSize="sm" color="gray.600">
            Showing {filteredAppTypes.length} of {appTypes.length} application types
          </Text>
          {searchQuery && (
            <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="md">
              Filtered
            </Badge>
          )}
        </Flex>

        {/* Application Type Table */}
        <Card variant="outline" boxShadow="md" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="80px" color="gray.600" fontWeight="semibold">#</Th>
                  <Th color="gray.600" fontWeight="semibold">Name</Th>
                  <Th width="140px" textAlign="center" color="gray.600" fontWeight="semibold">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAppTypes.length > 0 ? (
                  filteredAppTypes.map((type, index) => (
                    <Tr
                      key={`${type.id}-${index}`}
                      _hover={{ bg: "gray.50" }}
                      transition="background-color 0.2s"
                    >
                      <Td color="gray.500" fontWeight="medium">
                        {index + 1}
                      </Td>
                      <Td fontWeight="medium" color="gray.700">
                        {type.name}
                      </Td>
                      <Td>
                        <HStack spacing={2} justify="center" flexWrap="nowrap">
                          <IconButton
                            icon={<EditIcon />}
                            colorScheme="orange"
                            variant="ghost"
                            size="md"
                            aria-label="Edit"
                            onClick={() => {
                              setEditingAppType(type);
                              setIsModalOpen(true);
                            }}
                            _hover={{ bg: "orange.50" }}
                            flexShrink={0}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            size="md"
                            aria-label="Delete"
                            onClick={() => setDeletingAppType(type)}
                            _hover={{ bg: "red.50" }}
                            flexShrink={0}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="md">
                        {searchQuery
                          ? "No application types found matching your search."
                          : "No application types available. Click 'New Application Type' to add one."}
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </Stack>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppType(null);
          setNewAppType({ name: "" });
        }}
        isCentered
        size="md"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" pb={4}>
            {editingAppType
              ? "Edit Application Type"
              : "Add New Application Type"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Stack spacing={4}>
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.600">
                  Application Type Name
                </Text>
                <Input
                  placeholder="Enter application type name"
                  value={editingAppType ? editingAppType.name : newAppType.name}
                  onChange={(e) =>
                    editingAppType
                      ? setEditingAppType({
                        ...editingAppType,
                        name: e.target.value,
                      })
                      : setNewAppType({ name: e.target.value })
                  }
                  size="md"
                  autoFocus
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                />
              </Box>
            </Stack>
          </ModalBody>
          <Divider />
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAppType(null);
                setNewAppType({ name: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={
                editingAppType
                  ? handleUpdateApplicationType
                  : handleAddApplicationType
              }
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
            >
              {editingAppType ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingAppType}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingAppType(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" pb={4}>
              Delete Application Type
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <Text>
                Are you sure you want to delete <strong>"{deletingAppType?.name}"</strong>?
              </Text>
              <Text mt={2} color="gray.600" fontSize="sm">
                This action cannot be undone.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter borderTopWidth="1px" pt={4} gap={3}>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingAppType(null)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteApplicationType}
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
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
