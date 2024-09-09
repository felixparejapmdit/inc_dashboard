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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Admin = () => {
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setIcon(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddApp = (e) => {
    e.preventDefault();
    const newApp = { name, url, description, icon };

    if (editingApp) {
      fetch(`${API_URL}/api/apps/${editingApp.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      })
        .then((response) => response.json())
        .then(() => {
          setApps((prevApps) =>
            prevApps.map((app) => (app.name === editingApp.name ? newApp : app))
          );
          setStatus(`App "${name}" updated successfully.`);
          onClose();
          setEditingApp(null); // Reset editing state
        })
        .catch((error) => setStatus("Error updating app. Please try again."));
    } else {
      fetch(`${API_URL}/api/apps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      })
        .then((response) => response.json())
        .then(() => {
          setApps((prevApps) => [...prevApps, newApp]);
          setStatus(`App "${name}" added successfully.`);
          setName("");
          setUrl("");
          setDescription("");
          setIcon(null);
          onClose(); // Close the modal after adding
        })
        .catch((error) => setStatus("Error adding app. Please try again."));
    }
  };

  const handleDeleteApp = (appName) => {
    fetch(`${API_URL}/api/apps/${appName}`, {
      method: "DELETE",
    })
      .then(() => {
        setApps(apps.filter((app) => app.name !== appName));
        onDeleteClose();
      })
      .catch((err) => console.error("Error deleting app:", err));
  };

  const handleEditApp = (app) => {
    setEditingApp(app); // Set the app to edit
    setName(app.name);
    setUrl(app.url);
    setDescription(app.description);
    setIcon(app.icon);
    onOpen(); // Open the modal for editing
  };

  const handleOpenDeleteDialog = (appName) => {
    setAppToDelete(appName);
    onDeleteOpen();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Applications</Heading>

      <Button leftIcon={<AddIcon />} onClick={onOpen} colorScheme="teal" mb={4}>
        Add App
      </Button>

      <Table variant="simple" bg="white" borderRadius="md" shadow="md">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Icon</Th>
            <Th>Name</Th>
            <Th>URL</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {apps.map((app, index) => (
            <Tr key={index}>
              <Td>{index + 1}</Td>
              <Td>
                <img
                  src={app.icon || "https://via.placeholder.com/40"}
                  alt={`${app.name} Icon`}
                  width="40"
                  height="40"
                />
              </Td>
              <Td>{app.name}</Td>
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
                  onClick={() => handleOpenDeleteDialog(app.name)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

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

              <FormControl isRequired>
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
            <Button colorScheme="blue" onClick={handleAddApp} mr={3}>
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
              Are you sure you want to delete this app? You can't undo this
              action.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDeleteApp(appToDelete)}
                ml={3}
              >
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

export default Admin;
