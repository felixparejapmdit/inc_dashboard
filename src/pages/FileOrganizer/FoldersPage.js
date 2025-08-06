// src/pages/FileOrganizer/FoldersPage.js
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

import AddFolderForm from "./AddFolderForm";
import FolderCard from "./FolderCard";
import {
  getFoldersByContainerId,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../../utils/FileOrganizer/foldersService";
import { getContainerById } from "../../utils/FileOrganizer/containersService";
import { handleError } from "../../utils/FileOrganizer/handleError";

const FoldersPage = () => {
  const { containerId } = useParams();
  const toast = useToast();

  const [container, setContainer] = useState(null);
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const formRef = React.useRef(null);

  const [folderToDelete, setFolderToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchContainer();
    fetchFolders();
  }, [containerId]);

  const fetchContainer = async () => {
    try {
      const data = await getContainerById(containerId);
      setContainer(data);
    } catch (error) {
      handleError(error, toast, "Failed to fetch container");
    }
  };

  const fetchFolders = async () => {
    await refreshFolders();
  };

  const refreshFolders = async () => {
    try {
      setLoading(true);
      const all = await getFoldersByContainerId(containerId);
      setFolders(all);
      setFilteredFolders(filterBySearch(all, search));
    } catch (error) {
      handleError(error, toast, "Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  };

  const filterBySearch = (list, searchText) => {
    if (!searchText.trim()) return list;
    return list.filter((f) =>
      f.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleAddFolder = async (data) => {
    try {
      const newFolder = {
        ...data,
        container_id: parseInt(containerId),
      };
      await createFolder(newFolder);
      toast({
        title: "Folder added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowForm(false);
      setEditingFolder(null);
      setSearch("");
      await refreshFolders();
    } catch (error) {
      handleError(error, toast, "Error adding folder");
    }
  };

  const handleUpdateFolder = async (folderId, updatedData) => {
    setEditingFolder({ id: folderId, ...updatedData });
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveUpdate = async (updatedData) => {
    try {
      await updateFolder(editingFolder.id, updatedData);
      toast({
        title: "Folder updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowForm(false);
      setEditingFolder(null);
      await refreshFolders();
    } catch (error) {
      handleError(error, toast, "Error updating folder");
    }
  };

  const confirmDeleteFolder = (folderId) => {
    setFolderToDelete(folderId);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFolder(folderToDelete);
      toast({
        title: "Folder deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setFolderToDelete(null);
      await refreshFolders();
    } catch (error) {
      handleError(error, toast, "Error deleting folder");
    }
  };

  useEffect(() => {
    setFilteredFolders(filterBySearch(folders, search));
  }, [search, folders]);

  return (
    <Box p={[4, 6, 10]}>
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
          <BreadcrumbLink
            as={RouterLink}
            to={`/file-organizer/shelves/${container?.shelf_id}/containers`}
          >
            🗂 Containers
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color="gray.700" fontWeight="semibold">
            Folders
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Heading */}
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" color="teal.700" mb={1}>
            🗃 Folders in{" "}
            <Text as="span" fontWeight="bold" color="teal.800">
              {container ? container.name : "..."}
            </Text>
          </Heading>
          {filteredFolders.length > 0 && (
            <Text fontSize="sm" color="gray.500" ml="2">
              ({filteredFolders.length} total)
            </Text>
          )}
        </Box>

        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => {
            setShowForm(!showForm);
            setEditingFolder(null);
          }}
        >
          {showForm ? "Cancel" : "Add Folder"}
        </Button>
      </HStack>

      {/* Form */}
      {showForm && (
        <Box mb={6}>
          <AddFolderForm
            onSave={editingFolder ? handleSaveUpdate : handleAddFolder}
            editData={editingFolder}
            containerId={containerId}
          />
        </Box>
      )}

      {/* Search */}
      <HStack mb={6}>
        <Input
          placeholder="Search folders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </HStack>

      {/* Folder List */}
      <Box mt={6}>
        {loading ? (
          <Center>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : filteredFolders.length > 0 ? (
          // FoldersPage.js (adjust this part)
          <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={6}>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onDelete={confirmDeleteFolder}
                onUpdate={handleUpdateFolder}
                shelfId={container?.shelf_id} // ✅ Pass shelfId
                containerId={containerId} // ✅ Pass containerId
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center>
            <Text color="gray.500">No folders found.</Text>
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
              Delete Folder
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this folder? This action cannot be
              undone.
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

export default FoldersPage;
