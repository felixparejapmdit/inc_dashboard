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
  Flex,
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

  const [folders, setFolders] = useState([]); // <-- store containers here
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

  // put this at the top of your component (before return)
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 768) setColumns(2);
      else setColumns(3);
    };
    updateColumns(); // initial
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

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

      console.log("📦 All containers from API:", all);

      // Log folders for each container
      all.forEach((container) => {
        console.log(
          `🗂 Container ${container.id} (${container.name}) has folders:`,
          container.folders || []
        );
      });

      const shelfContainers = all.filter(
        (c) => c.shelf_id === parseInt(shelfId)
      );

      console.log("📌 Shelf-specific containers:", shelfContainers);

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

  const handleUpdateContainer = (container) => {
    setEditingContainer(container); // pass the whole container object
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

      {/* Heading Row */}
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        {/* Title + Total */}
        <HStack spacing={2} alignItems="baseline">
          <Heading size="lg" color="teal.700">
            📦 Containers in{" "}
            <Text as="span" fontWeight="bold" color="teal.800">
              {shelf ? shelf.name : "..."}
            </Text>
          </Heading>
          {filteredContainers.length > 0 && (
            <Text fontSize="sm" color="gray.500">
              ({filteredContainers.length} total)
            </Text>
          )}
        </HStack>

        {/* Add/Cancel Button */}
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

      <Box mt={6}>
        {loading ? (
          <Center>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : filteredContainers.length > 0 ? (
          <>
            {Array.from(
              { length: Math.ceil(filteredContainers.length / columns) },
              (_, rowIndex) => {
                const start = rowIndex * columns;
                const rowItems = filteredContainers.slice(
                  start,
                  start + columns
                );

                const cardWidth =
                  columns === 1 ? 280 : columns === 2 ? 280 : 300;
                const spacing = columns === 1 ? 12 : 16;
                const shelfWidth =
                  rowItems.length * cardWidth + (rowItems.length - 1) * spacing;

                const shelfVisualWidth = shelfWidth + 80; // extra plank length

                return (
                  <Flex
                    key={rowIndex}
                    justify="center"
                    mb={4}
                    position="relative"
                  >
                    {/* Filtered background image */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgImage="url('https://images.vexels.com/media/users/3/161071/isolated/preview/522782b07ea4b4cfccaf296c313de9b9-shelf-wood-flat.png')"
                      bgRepeat="no-repeat"
                      bgSize="100% 100%"
                      filter="brightness(0) saturate(100%) invert(90%) sepia(15%) saturate(150%) hue-rotate(40deg) brightness(95%) contrast(90%)"
                      borderRadius="md"
                      zIndex={0}
                    />

                    {/* Foreground container content */}
                    <Flex
                      p={6}
                      alignItems="center"
                      minH="260px"
                      w={`${shelfVisualWidth}px`}
                      borderRadius="md"
                      justify="center"
                      position="relative"
                      zIndex={1}
                    >
                      <SimpleGrid columns={rowItems.length} spacing={4}>
                        {rowItems.map((container) => (
                          <ContainerCard
                            key={container.id}
                            container={container}
                            folders={container.folders || []}
                            onUpdate={handleUpdateContainer}
                            onDelete={confirmDeleteContainer}
                          />
                        ))}
                      </SimpleGrid>
                    </Flex>
                  </Flex>
                );
              }
            )}
          </>
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
