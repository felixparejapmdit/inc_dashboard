import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null);
  const [status, setStatus] = useState("");
  const [editingApp, setEditingApp] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [appToDelete, setAppToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const cancelRef = React.useRef();

  // Fetch apps from the backend
  useEffect(() => {
    fetch(`${API_URL}/api/apps`)
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch((err) => console.error(err));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdateApp = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setStatus("Name and URL fields are required.");
      return;
    }

    const newApp = { name, url, description, icon };

    if (editingApp) {
      fetch(`${API_URL}/api/apps/${editingApp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      })
        .then((response) => response.json())
        .then(() => {
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.id === editingApp.id ? { ...newApp, id: editingApp.id } : app
            )
          );
          setStatus(`App "${name}" updated successfully.`);
          resetForm();
        })
        .catch(() => setStatus("Error updating app. Please try again."));
    } else {
      fetch(`${API_URL}/api/apps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      })
        .then((response) => response.json())
        .then((data) => {
          setApps((prevApps) => [...prevApps, { ...newApp, id: data.id }]);
          setStatus(`App "${name}" added successfully.`);
          resetForm();
        })
        .catch(() => setStatus("Error adding app. Please try again."));
    }
  };

  const handleDeleteApp = () => {
    fetch(`${API_URL}/api/apps/${appToDelete}`, {
      method: "DELETE",
    })
      .then(() => {
        setApps((prevApps) => prevApps.filter((app) => app.id !== appToDelete));
        setStatus("App deleted successfully.");
        onDeleteClose();
      })
      .catch((err) => console.error("Error deleting app:", err));
  };

  const handleEditApp = (app) => {
    setEditingApp(app);
    setName(app.name);
    setUrl(app.url);
    setDescription(app.description);
    setIcon(app.icon);
    onOpen();
  };

  const handleOpenDeleteDialog = (appId) => {
    setAppToDelete(appId);
    onDeleteOpen();
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setIcon(null);
    setEditingApp(null);
    onClose();
  };

  const totalPages = Math.ceil(apps.length / ITEMS_PER_PAGE);
  const currentItems = apps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPages)
        : Math.max(prev - 1, 1)
    );
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Applications</Heading>

      <Button
        leftIcon={<AddIcon />}
        onClick={() => {
          resetForm();
          onOpen();
        }}
        colorScheme="teal"
        mb={4}
      >
        App
      </Button>
      {apps.length > ITEMS_PER_PAGE && (
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      )}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>URL</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentItems.map((app, index) => (
            <Tr key={app.id}>
              <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
              <Td>
                <Flex align="center">
                  <Avatar
                    src={app.icon ? app.icon : ""}
                    name={app.name}
                    size="sm"
                    mr={2}
                  />
                  <Text>{app.name}</Text>
                </Flex>
              </Td>

              <Td>{app.url}</Td>
              <Td>{app.description}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleEditApp(app)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleOpenDeleteDialog(app.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {apps.length > ITEMS_PER_PAGE && (
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingApp ? "Edit App" : "Add App"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>App Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>App URL</FormLabel>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                />
              </FormControl>

              <FormControl>
                <FormLabel>App Icon</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddOrUpdateApp} mr={3}>
              {editingApp ? "Save Changes" : "Add App"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete App
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this app? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteApp} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {status && (
        <Text
          mt={4}
          color={status.includes("successfully") ? "green.500" : "red.500"}
          textAlign="center"
        >
          {status}
        </Text>
      )}
    </Box>
  );
};

export default Applications;
