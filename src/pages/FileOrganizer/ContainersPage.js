// src/pages/FileOrganizer/ContainersPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Spinner,
  Center,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useParams, Link as RouterLink } from "react-router-dom";

import ContainerCard from "./ContainerCard";
import AddContainerForm from "./AddContainerForm";
import {
  getContainers,
  createContainer,
  deleteContainer,
  updateContainer,
} from "../../utils/FileOrganizer/containersService";
import { getShelfById } from "../../utils/FileOrganizer/shelvesService";
import { handleError } from "../../utils/FileOrganizer/handleError";

const ContainersPage = () => {
  const { shelfId } = useParams();
  const toast = useToast();

  const [shelf, setShelf] = useState(null);
  const [containers, setContainers] = useState([]);
  const [filteredContainers, setFilteredContainers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const formRef = React.useRef(null);

  // Delete confirmation state
  const [containerToDelete, setContainerToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchShelf();
    fetchContainers();
  }, [shelfId]);

  const fetchShelf = async () => {
    try {
      const data = await getShelfById(shelfId);
      setShelf(data);
    } catch (error) {
      handleError(error, toast, "Failed to fetch shelf");
    }
  };

  const fetchContainers = async () => {
    await refreshContainers();
  };

  const refreshContainers = async () => {
    try {
      setLoading(true);
      const all = await getContainers();
      const shelfContainers = all.filter(
        (c) => c.shelf_id === parseInt(shelfId)
      );
      setContainers(shelfContainers);
      setFilteredContainers(filterBySearch(shelfContainers, search));
    } catch (error) {
      handleError(error, toast, "Failed to fetch containers");
    } finally {
      setLoading(false);
    }
  };

  const filterBySearch = (list, searchText) => {
    if (!searchText.trim()) return list;
    return list.filter((c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleAddContainer = async (data) => {
    try {
      const newContainer = {
        ...data,
        shelf_id: parseInt(shelfId),
      };
      await createContainer(newContainer);
      toast({
        title: "Container added",
        description: "New container created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowForm(false);
      setEditingContainer(null);
      setSearch("");
      await refreshContainers();
    } catch (error) {
      handleError(error, toast, "Error adding container");
    }
  };

  const handleUpdateContainer = async (containerId, updatedData) => {
    setEditingContainer({ id: containerId, ...updatedData });
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveUpdate = async (updatedData) => {
    try {
      await updateContainer(editingContainer.id, updatedData);
      toast({
        title: "Container updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowForm(false);
      setEditingContainer(null);
      await refreshContainers();
    } catch (error) {
      handleError(error, toast, "Error updating container");
    }
  };

  const confirmDeleteContainer = (containerId) => {
    setContainerToDelete(containerId);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteContainer(containerToDelete);
      toast({
        title: "Container deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setContainerToDelete(null);
      await refreshContainers();
    } catch (error) {
      handleError(error, toast, "Error deleting container");
    }
  };

  useEffect(() => {
    setFilteredContainers(filterBySearch(containers, search));
  }, [search, containers]);

  return (
    <Box p={[4, 6, 10]} mt={12}>
      {/* Breadcrumb */}
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.400" boxSize={4} />}
        mb={6}
        fontWeight="medium"
        fontSize="sm"
        color="gray.600"
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/file-organizer/shelves">
            📁 Shelves
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink isCurrentPage color="teal.700" fontWeight="semibold">
            {shelf ? shelf.name : "Loading..."}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color="gray.700" fontWeight="semibold">
            Containers
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Heading */}
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" color="teal.700" mb={1}>
            📦 Containers in{" "}
            <Text as="span" fontWeight="bold" color="teal.800">
              {shelf ? shelf.name : "..."}
            </Text>
          </Heading>
          {filteredContainers.length > 0 && (
            <Text fontSize="sm" color="gray.500" ml="2">
              ({filteredContainers.length} total)
            </Text>
          )}
        </Box>

        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => {
            setShowForm(!showForm);
            setEditingContainer(null);
          }}
        >
          {showForm ? "Cancel" : "Container"}
        </Button>
      </HStack>

      {/* Form */}
      {showForm && (
        <Box mb={6}>
          <AddContainerForm
            onSave={editingContainer ? handleSaveUpdate : handleAddContainer}
            editData={editingContainer}
          />
        </Box>
      )}

      {/* Search */}
      <HStack mb={6}>
        <Input
          placeholder="Search containers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </HStack>

      {/* List */}
      <Box mt={6}>
        {loading ? (
          <Center>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : filteredContainers.length > 0 ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={4}>
            {filteredContainers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                foldersCount={container.folders?.length || 0}
                onUpdate={handleUpdateContainer}
                onDelete={confirmDeleteContainer}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center>
            <Text color="gray.500">No containers found.</Text>
          </Center>
        )}
      </Box>

      {/* Confirm Delete AlertDialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Container
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this container? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
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

export default ContainersPage;
