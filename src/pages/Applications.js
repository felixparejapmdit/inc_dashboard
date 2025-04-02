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
  Select,
  Textarea,
  InputGroup,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const [apps, setApps] = useState([]);

  const [appTypes, setAppTypes] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]); // Search-filtered applications
  const [searchQuery, setSearchQuery] = useState(""); // Search input value
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null);
  const [app_type, setAppType] = useState(""); // Stores selected application type
  const [status, setStatus] = useState("");
  const [fileError, setFileError] = useState("");

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
      .then((data) => {
        setApps(data);
        setFilteredApps(data);
      })
      .catch((err) => console.error(err));

    fetch(`${API_URL}/api/application-types`) // Fetch application types
      .then((res) => res.json())
      .then((data) => {
        setAppTypes(data);
      })
      .catch((err) => console.error("Error fetching application types:", err));
  }, []);

  // Search filter logic (filter first, then paginate)
  useEffect(() => {
    const filtered = apps.filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApps(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, apps]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 102400) {
        setFileError("The image size should be less than 100 KB.");
        setIcon(null); // prevent saving
        return;
      } else {
        setFileError(""); // clear previous error if valid
      }

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

    if (icon === null) {
      setStatus("Please upload a valid icon (less than 100KB).");
      return;
    }

    const newApp = {
      name,
      url,
      description: description.trim() === "" ? null : description.trim(),
      icon,
      app_type,
    };

    if (editingApp) {
      // ✅ Check if the URL is being updated
      if (editingApp.url !== url) {
        // ✅ Remove the old app data from localStorage
        const recentApps = JSON.parse(localStorage.getItem("recentApps")) || [];
        const updatedRecentApps = recentApps.filter(
          (app) => app.url !== editingApp.url
        );
        localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps));
      }

      fetch(`${API_URL}/api/apps/${editingApp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      })
        .then((response) => response.json())
        .then(() => {
          const typeName =
            appTypes.find((t) => t.id === parseInt(app_type))?.name ||
            "Unknown";

          setApps((prevApps) =>
            prevApps.map((app) =>
              app.id === editingApp.id
                ? { ...newApp, id: editingApp.id, app_type_name: typeName }
                : app
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
    setDescription(app.description || "");
    setIcon(app.icon);
    setAppType(app.app_type); // Set selected app_type
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

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const currentItems = filteredApps.slice(
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

  const hasUnsavedInput =
    name.trim() !== "" ||
    url.trim() !== "" ||
    app_type !== "" ||
    description.trim() !== "" ||
    icon !== null;

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Applications</Heading>

      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <InputGroup width={["100%", "300px"]}>
          <Input
            placeholder="Search Applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="orange"
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          Application
        </Button>
      </Flex>

      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            isDisabled={currentPage === 1}
            colorScheme="gray"
            variant="outline"
          >
            Previous
          </Button>

          <Text fontSize="sm" color="gray.600">
            Page {currentPage} of {totalPages}
          </Text>

          <Button
            onClick={() => handlePageChange("next")}
            isDisabled={currentPage === totalPages}
            colorScheme="gray"
            variant="outline"
          >
            Next
          </Button>
        </Flex>
      )}

      <Box overflowX="auto">
        <Table
          variant="simple"
          size="md"
          mt={4}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          whiteSpace="nowrap"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>URL</Th>
              <Th>Description</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((app, index) => (
              <Tr key={app.id} _hover={{ bg: "gray.50", transition: "0.2s" }}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td>
                  <Flex align="center" gap={2}>
                    <Avatar src={app.icon || ""} name={app.name} size="sm" />
                    <Text fontSize="sm" isTruncated maxW="150px">
                      {app.name}
                    </Text>
                  </Flex>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.700" isTruncated maxW="150px">
                    {app.app_type_name || "Unknown"}
                  </Text>
                </Td>
                <Td maxW="250px" isTruncated>
                  <Text fontSize="sm" color="blue.600" isTruncated>
                    {app.url}
                  </Text>
                </Td>
                <Td maxW="200px" isTruncated>
                  <Text fontSize="sm" color="gray.600" isTruncated>
                    {app.description || "—"}
                  </Text>
                </Td>
                <Td>
                  <Flex gap={1} justify="center">
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleEditApp(app)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete"
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleOpenDeleteDialog(app.id)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            isDisabled={currentPage === 1}
            colorScheme="gray"
            variant="outline"
          >
            Previous
          </Button>

          <Text fontSize="sm" color="gray.600">
            Page {currentPage} of {totalPages}
          </Text>

          <Button
            onClick={() => handlePageChange("next")}
            isDisabled={currentPage === totalPages}
            colorScheme="gray"
            variant="outline"
          >
            Next
          </Button>
        </Flex>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={!hasUnsavedInput}
      >
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
                <FormLabel>Application Type</FormLabel>
                <Select
                  value={app_type}
                  onChange={(e) => setAppType(e.target.value)}
                  placeholder="Select Application Type"
                >
                  {appTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <VStack align="stretch" spacing={1}>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Description"
                    resize="vertical"
                    size="md"
                    maxLength={50}
                    borderColor="gray.300"
                    _hover={{ borderColor: "teal.400" }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal",
                    }}
                  />
                  <Text
                    fontSize="sm"
                    color={description.length >= 40 ? "red.500" : "gray.500"}
                  >
                    {50 - description.length} characters remaining
                  </Text>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>App Icon</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {fileError && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {fileError}
                  </Text>
                )}
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
