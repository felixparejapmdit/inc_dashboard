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
  InputLeftElement,
  useColorModeValue,
  Badge,
  Tooltip,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Stack,
  Divider,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Container,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  ExternalLinkIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  FiGrid,
  FiList,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiUpload,
} from "react-icons/fi";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [appTypes, setAppTypes] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null);
  const [app_type, setAppType] = useState("");
  const [status, setStatus] = useState("");
  const [fileError, setFileError] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [loading, setLoading] = useState(true);

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
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found. User may not be logged in.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetchData(
        "apps",
        (data) => {
          setApps(data);
          setFilteredApps(data);
        },
        null,
        "Failed to fetch apps"
      ),
      fetchData(
        "application-types",
        setAppTypes,
        null,
        "Failed to fetch application types"
      ),
    ]).finally(() => setLoading(false));
  }, []);

  // Combined search and filter logic
  useEffect(() => {
    let filtered = apps;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter((app) => app.app_type == filterType);
    }

    setFilteredApps(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterType, apps]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 102400) {
        setFileError("The image size should be less than 100 KB.");
        setIcon(null);
        return;
      } else {
        setFileError("");
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
      toast({
        title: "Validation Error",
        description: "Name and URL fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (icon === null) {
      toast({
        title: "Icon Required",
        description: "Please upload a valid icon (less than 100KB).",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
      if (editingApp.url !== url) {
        const recentApps = JSON.parse(localStorage.getItem("recentApps")) || [];
        const updatedRecentApps = recentApps.filter(
          (app) => app.url !== editingApp.url
        );
        localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps));
      }

      putData("apps", editingApp.id, newApp)
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

          toast({
            title: "Success",
            description: `App "${name}" updated successfully.`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          resetForm();
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Error updating app. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      postData("apps", newApp)
        .then((data) => {
          setApps((prevApps) => [...prevApps, { ...newApp, id: data.id }]);
          toast({
            title: "Success",
            description: `App "${name}" added successfully.`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          resetForm();
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Error adding app. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const handleDeleteApp = () => {
    deleteData("apps", appToDelete)
      .then(() => {
        setApps((prevApps) => prevApps.filter((app) => app.id !== appToDelete));
        toast({
          title: "Deleted",
          description: "App deleted successfully.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
      })
      .catch((err) => {
        console.error("Error deleting app:", err);
        toast({
          title: "Error",
          description: "Failed to delete app.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleEditApp = (app) => {
    setEditingApp(app);
    setName(app.name);
    setUrl(app.url);
    setDescription(app.description || "");
    setIcon(app.icon);
    setAppType(app.app_type);
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
    setAppType("");
    setEditingApp(null);
    setFileError("");
    onClose();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("");
  };

  const handleOpenApp = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
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

  // Stats
  const totalApps = apps.length;
  const appsByType = appTypes.reduce((acc, type) => {
    acc[type.name] = apps.filter((app) => app.app_type == type.id).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="50vh">
          <VStack spacing={4}>
            <Icon as={FiRefreshCw} boxSize={12} color="orange.500" className="spin" />
            <Text color="gray.500">Loading applications...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 2, md: 4 }}>
      <Box maxW="100%" mx="auto">
        {/* Header Section */}
        <VStack spacing={4} align="stretch" mb={8} px={{ base: 2, md: 0 }}>
          <Flex justify="space-between" direction={{ base: "column", sm: "row" }} gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size={{ base: "md", md: "lg" }}>
                Application Management
              </Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                Manage your applications and their configurations
              </Text>
            </VStack>
            <HStack>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="orange"
                size={{ base: "sm", md: "md" }}
                onClick={() => {
                  resetForm();
                  onOpen();
                }}
              >
                Application
              </Button>
            </HStack>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            <Card bg={cardBg} boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    Total Applications
                  </StatLabel>
                  <StatNumber color="orange.600">{totalApps}</StatNumber>
                  <StatHelpText fontSize="xs">All registered apps</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    Filtered Results
                  </StatLabel>
                  <StatNumber color="blue.600">{filteredApps.length}</StatNumber>
                  <StatHelpText fontSize="xs">Currently showing</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    App Types
                  </StatLabel>
                  <StatNumber color="purple.600">{appTypes.length}</StatNumber>
                  <StatHelpText fontSize="xs">Categories</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} boxShadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    Current Page
                  </StatLabel>
                  <StatNumber color="teal.600">
                    {currentPage} / {totalPages || 1}
                  </StatNumber>
                  <StatHelpText fontSize="xs">Pagination</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Filters and Search */}
        <Box bg={cardBg} p={4} borderRadius="xl" boxShadow="sm" mb={6}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiFilter} color="gray.500" />
              <Text fontWeight="semibold" fontSize="sm">
                Filters & Search
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, URL, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {appTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({appsByType[type.name] || 0})
                  </option>
                ))}
              </Select>
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={handleClearFilters}
                  flex={1}
                >
                  Clear
                </Button>
                <Tooltip label={viewMode === "table" ? "Switch to Grid View" : "Switch to Table View"}>
                  <IconButton
                    icon={<Icon as={viewMode === "table" ? FiGrid : FiList} />}
                    onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                    variant="outline"
                    aria-label="Toggle view"
                  />
                </Tooltip>
              </HStack>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Results Info */}
        <HStack justify="space-between" mb={4} flexWrap="wrap">
          <Text fontSize="sm" color="gray.600">
            Showing {currentItems.length} of {filteredApps.length} application(s)
          </Text>
          {(searchQuery || filterType) && (
            <Badge colorScheme="orange" fontSize="xs">
              Filters Active
            </Badge>
          )}
        </HStack>

        {/* Grid View */}
        {viewMode === "grid" && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6} mb={6}>
            {currentItems.map((app) => (
              <Card
                key={app.id}
                bg={cardBg}
                boxShadow="md"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                }}
              >
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Flex justify="center">
                      <Avatar
                        src={app.icon || ""}
                        name={app.name}
                        size="xl"
                        borderRadius="lg"
                      />
                    </Flex>
                    <VStack spacing={1} align="center">
                      <Tooltip label={app.name}>
                        <Text
                          fontWeight="bold"
                          fontSize="md"
                          textAlign="center"
                          isTruncated
                          maxW="200px"
                        >
                          {app.name}
                        </Text>
                      </Tooltip>
                      <Badge colorScheme="purple" fontSize="xs">
                        {app.app_type_name || "Unknown"}
                      </Badge>
                    </VStack>
                    <Divider />
                    <Tooltip label={app.url}>
                      <Text
                        fontSize="xs"
                        color="blue.600"
                        textAlign="center"
                        isTruncated
                      >
                        {app.url}
                      </Text>
                    </Tooltip>
                    {app.description && (
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        textAlign="center"
                        noOfLines={2}
                        minH="32px"
                      >
                        {app.description}
                      </Text>
                    )}
                    <HStack spacing={2} justify="center" mt={2}>
                      <Tooltip label="Open Application">
                        <IconButton
                          icon={<ExternalLinkIcon />}
                          aria-label="Open"
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleOpenApp(app.url)}
                        />
                      </Tooltip>
                      <Tooltip label="Edit Application">
                        <IconButton
                          icon={<EditIcon />}
                          aria-label="Edit"
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditApp(app)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete Application">
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Delete"
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleOpenDeleteDialog(app.id)}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Box
            overflowX="auto"
            bg={cardBg}
            borderRadius="xl"
            boxShadow="sm"
            w="100%"
            maxW="100%"
          >
            <Table variant="simple" size={isMobile ? "sm" : "md"} w="100%">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="50px">#</Th>
                  <Th minW="150px">Name</Th>
                  <Th minW="120px">Type</Th>
                  <Th minW="200px">URL</Th>
                  <Th minW="180px" display={{ base: "none", lg: "table-cell" }}>Description</Th>
                  <Th width="120px" textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentItems.map((app, index) => (
                  <Tr key={app.id} _hover={{ bg: hoverBg, transition: "0.2s" }}>
                    <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                    <Td>
                      <Flex align="center" gap={2}>
                        <Avatar src={app.icon || ""} name={app.name} size="sm" />
                        <Tooltip label={app.name}>
                          <Text fontSize="sm" isTruncated maxW={{ base: "100px", md: "150px" }}>
                            {app.name}
                          </Text>
                        </Tooltip>
                      </Flex>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" fontSize="xs">
                        {app.app_type_name || "Unknown"}
                      </Badge>
                    </Td>
                    <Td>
                      <Tooltip label={app.url}>
                        <Text
                          fontSize="sm"
                          color="blue.600"
                          isTruncated
                          maxW={{ base: "150px", md: "200px" }}
                          cursor="pointer"
                          _hover={{ textDecor: "underline" }}
                          onClick={() => handleOpenApp(app.url)}
                        >
                          {app.url}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td display={{ base: "none", lg: "table-cell" }}>
                      <Tooltip label={app.description}>
                        <Text fontSize="sm" color="gray.600" isTruncated maxW="180px">
                          {app.description || "—"}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Flex gap={1} justify="center">
                        <Tooltip label="Open">
                          <IconButton
                            icon={<ExternalLinkIcon />}
                            aria-label="Open"
                            size="xs"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleOpenApp(app.url)}
                          />
                        </Tooltip>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit"
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEditApp(app)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete"
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleOpenDeleteDialog(app.id)}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <Box textAlign="center" py={12}>
            <Icon as={FiGrid} boxSize={16} color="gray.300" mb={4} />
            <Text fontSize="lg" fontWeight="medium" color="gray.600" mb={2}>
              No applications found
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              {searchQuery || filterType
                ? "Try adjusting your filters"
                : "Get started by adding your first application"}
            </Text>
            {(searchQuery || filterType) && (
              <Button size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" align="center" mt={6} flexWrap="wrap" gap={8}>
            <Button
              onClick={() => handlePageChange("previous")}
              isDisabled={currentPage === 1}
              colorScheme="gray"
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            <HStack spacing={2}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "solid" : "ghost"}
                  colorScheme={currentPage === page ? "orange" : "gray"}
                  onClick={() => setCurrentPage(page)}
                  display={{ base: "none", md: "inline-flex" }}
                >
                  {page}
                </Button>
              ))}
              <Text fontSize="sm" fontWeight="bold" color="gray.600" display={{ base: "block", md: "none" }}>
                Page {currentPage} of {totalPages}
              </Text>
            </HStack>

            <Button
              onClick={() => handlePageChange("next")}
              isDisabled={currentPage === totalPages}
              colorScheme="gray"
              variant="outline"
              size="sm"
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
          size={{ base: "full", md: "xl" }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingApp ? "Edit Application" : "Add New Application"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {/* Icon Preview */}
                {icon && (
                  <Flex justify="center" mb={2}>
                    <Avatar src={icon} size="xl" borderRadius="lg" />
                  </Flex>
                )}

                <FormControl isRequired>
                  <FormLabel>Application Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter application name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Application URL</FormLabel>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Application Type</FormLabel>
                  <Select
                    value={app_type}
                    onChange={(e) => setAppType(e.target.value)}
                    placeholder="Select application type"
                  >
                    {appTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <VStack align="stretch" spacing={1}>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the application"
                      resize="vertical"
                      size="md"
                      maxLength={50}
                    />
                    <Text
                      fontSize="xs"
                      color={description.length >= 40 ? "red.500" : "gray.500"}
                      textAlign="right"
                    >
                      {50 - description.length} characters remaining
                    </Text>
                  </VStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Application Icon</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    p={1}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Maximum file size: 100 KB
                  </Text>
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
                {editingApp ? "Save Changes" : "Add Application"}
              </Button>
              <Button onClick={resetForm}>Cancel</Button>
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
                Delete Application
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this application? This action cannot be
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
      </Box>

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 2s linear infinite;
          }
        `}
      </style>
    </Box>
  );
};

export default Applications;
