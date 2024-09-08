import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  useColorModeValue,
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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

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
    fetch("http://localhost:5000/api/apps")
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
      // Update existing app
      fetch(`http://localhost:5000/api/apps/${editingApp.name}`, {
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
      // Add new app
      fetch("http://localhost:5000/api/apps", {
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
    fetch(`http://localhost:5000/api/apps/${appName}`, {
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

  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputHoverBg = useColorModeValue("gray.100", "gray.600");
  const formLabelColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.700", "white");
  const buttonBg = useColorModeValue("blue.600", "blue.500");
  const buttonHoverBg = useColorModeValue("blue.700", "blue.600");
  const defaultIcon = "https://via.placeholder.com/40"; // URL for default icon placeholder

  return (
    <Box bgGradient={bgGradient} minH="100vh" p={6}>
      <Heading as="h1" mb={6} color={headingColor} textAlign="center">
        Admin - Manage Applications
      </Heading>

      <Box maxW="900px" mx="auto">
        <Box textAlign="right" mb={4}>
          <IconButton
            icon={<AddIcon />}
            onClick={() => {
              setEditingApp(null); // Clear editing state for adding new
              onOpen();
            }}
            colorScheme="teal"
            aria-label="Add App"
          />
        </Box>

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
                    src={app.icon || defaultIcon}
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
                    aria-label="Edit"
                    onClick={() => handleEditApp(app)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleOpenDeleteDialog(app.name)}
                    aria-label="Delete"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for Adding/Editing App */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingApp ? "Edit App" : "Add New App"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack as="form" spacing={4} onSubmit={handleAddApp}>
              <FormControl id="app-name" isRequired>
                <FormLabel color={formLabelColor}>App Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg={inputBg}
                  _hover={{ bg: inputHoverBg }}
                  focusBorderColor="blue.400"
                  borderRadius="md"
                />
              </FormControl>
              <FormControl id="app-url" isRequired>
                <FormLabel color={formLabelColor}>App URL</FormLabel>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  bg={inputBg}
                  _hover={{ bg: inputHoverBg }}
                  focusBorderColor="blue.400"
                  borderRadius="md"
                />
              </FormControl>
              <FormControl id="app-description" isRequired>
                <FormLabel color={formLabelColor}>App Description</FormLabel>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  bg={inputBg}
                  _hover={{ bg: inputHoverBg }}
                  focusBorderColor="blue.400"
                  borderRadius="md"
                />
              </FormControl>
              <FormControl id="app-icon">
                <FormLabel color={formLabelColor}>App Icon</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  bg={inputBg}
                  _hover={{ bg: inputHoverBg }}
                  focusBorderColor="blue.400"
                  borderRadius="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              bg={buttonBg}
              color="white"
              _hover={{ bg: buttonHoverBg }}
              onClick={handleAddApp}
              mr={3}
            >
              {editingApp ? "Save Changes" : "Add App"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog for Deleting App */}
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
