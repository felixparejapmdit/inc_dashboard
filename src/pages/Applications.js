import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
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
  Input,
  useColorModeValue,
  Badge,
  Tooltip,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Divider,
  useToast,
  Container,
  FormControl,
  FormLabel,
  Image,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  Grid,
  List,
  Filter,
  RefreshCw,
  AppWindow,
  Download,
  AlertCircle,
  MoreVertical,
  UploadCloud,
  X,
  CheckCircle2,
  Layers,
  Database,
  Activity
} from "lucide-react";
import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 12;
const MotionBox = motion.create(Box);

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [appTypes, setAppTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [viewMode, setViewMode] = useState("table"); // grid or table

  // Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null);
  const [app_type, setAppType] = useState("");
  const [editingApp, setEditingApp] = useState(null);
  const [fileError, setFileError] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deletingApp, setDeletingApp] = useState(null);
  const cancelRef = React.useRef();
  const toast = useToast();

  const [page, setPage] = useState(1);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, orange.500, red.600)",
    "linear(to-r, orange.400, red.500)"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, typesData] = await Promise.all([
        fetchData("apps"),
        fetchData("application-types"),
      ]);
      setApps(appsData || []);
      setAppTypes(typesData || []);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 102400) {
        setFileError("Image size must be less than 100 KB.");
        return;
      }
      setFileError("");
      const reader = new FileReader();
      reader.onloadend = () => setIcon(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setIcon(null);
    setAppType("");
    setEditingApp(null);
    setFileError("");
  };

  const handleSave = async () => {
    if (!name.trim() || !url.trim() || !app_type) {
      toast({ title: "Required fields missing", status: "warning" });
      return;
    }

    if (!icon && !editingApp) {
      toast({ title: "Icon is required", status: "warning" });
      return;
    }

    const payload = {
      name,
      url,
      description,
      icon,
      app_type,
    };

    try {
      if (editingApp) {
        await putData("apps", editingApp.id, payload);
        toast({ title: "Application updated", status: "success" });
      } else {
        await postData("apps", payload);
        toast({ title: "Application added", status: "success" });
      }
      resetForm();
      onClose();
      loadData();
    } catch (error) {
      toast({ title: "Error saving application", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("apps", deletingApp.id);
      toast({ title: "Application deleted", status: "success" });
      setDeletingApp(null);
      loadData();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredApps = useMemo(() => {
    let data = [...apps];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.url.toLowerCase().includes(q) ||
          app.description?.toLowerCase().includes(q)
      );
    }
    if (filterType) {
      data = data.filter((app) => String(app.app_type) === String(filterType));
    }
    return data;
  }, [apps, searchQuery, filterType]);

  const stats = useMemo(() => {
    return {
      total: apps.length,
      types: appTypes.length,
      active: filteredApps.length,
    };
  }, [apps, appTypes, filteredApps]);

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredApps.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        {/* Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={AppWindow} boxSize={8} color="orange.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Application Portal
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage all tools and software</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="orange"
              onClick={() => { resetForm(); onOpen(); }}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Add Application
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={() => { setSearchQuery(""); setFilterType(""); setPage(1); loadData(); }}
              isLoading={isLoading}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            { label: "Total Applications", value: stats.total, icon: Layers, color: "blue" },
            { label: "App Categories", value: stats.types, icon: Database, color: "purple" },
            { label: "Visible Apps", value: stats.active, icon: Activity, color: "orange" }
          ].map((stat) => (
            <MotionBox
              key={stat.label}
              whileHover={{ y: -4 }}
              bg={cardBg}
              p={5}
              borderRadius="2xl"
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                    {stat.label}
                  </Text>
                  <Text fontSize="3xl" fontWeight="black" color={`${stat.color}.500`}>
                    {stat.value}
                  </Text>
                </VStack>
                <Box p={3} bg={`${stat.color}.50`} borderRadius="xl">
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.500`} />
                </Box>
              </HStack>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Action Toolbar */}
        <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
          <InputGroup maxW={{ base: "full", md: "400px" }} size="lg">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              bg={cardBg}
              focusBorderColor="orange.400"
            />
          </InputGroup>
          <Select
            placeholder="Filter by Type"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            maxW={{ base: "full", md: "250px" }}
            size="lg"
            borderRadius="xl"
            bg={cardBg}
            focusBorderColor="orange.400"
          >
            {appTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <HStack ml="auto">
            <IconButton
              icon={<Grid size={20} />}
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "solid" : "ghost"}
              colorScheme="orange"
              aria-label="Grid View"
            />
            <IconButton
              icon={<List size={20} />}
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "solid" : "ghost"}
              colorScheme="orange"
              aria-label="Table View"
            />
          </HStack>
        </Stack>

        {/* Content Area */}
        {isLoading ? (
          <Center p={20} flexDir="column">
            <Icon as={RefreshCw} boxSize={12} color="orange.500" className="spin" />
            <Text mt={4} color="gray.500">Loading applications...</Text>
          </Center>
        ) : filteredApps.length === 0 ? (
          <Center p={20} flexDir="column" bg={cardBg} borderRadius="3xl" border="1px solid" borderColor={borderColor}>
            <Icon as={AlertCircle} boxSize={12} color="gray.300" />
            <Heading size="md" mt={4} color="gray.500">No applications found</Heading>
            <Text color="gray.400">Try adjusting search or filters.</Text>
          </Center>
        ) : (
          <>
            {viewMode === "grid" ? (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
                <AnimatePresence>
                  {paginatedData.map((app) => (
                    <MotionBox
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ y: -8 }}
                      bg={cardBg}
                      p={0}
                      borderRadius="2xl"
                      boxShadow="md"
                      border="1px solid"
                      borderColor={borderColor}
                      overflow="hidden"
                    >
                      <Box h="120px" bgGradient="linear(to-br, orange.50, red.50)" position="relative">
                        <Flex justify="center" align="center" h="full" pt={6}>
                          <Avatar
                            src={app.icon}
                            name={app.name}
                            size="xl"
                            borderRadius="2xl"
                            border="4px solid white"
                            itemShadow="lg"
                            bg="white"
                          />
                        </Flex>
                        <Badge
                          position="absolute"
                          top={3}
                          right={3}
                          colorScheme="purple"
                          variant="solid"
                          borderRadius="full"
                          px={2}
                        >
                          {app.app_type_name || "App"}
                        </Badge>
                      </Box>
                      <VStack p={6} pt={8} spacing={3}>
                        <VStack spacing={0}>
                          <Heading size="md" textAlign="center" color="gray.800" noOfLines={1}>{app.name}</Heading>
                          <Text fontSize="xs" color="blue.500" fontWeight="bold" noOfLines={1}>{app.url}</Text>
                        </VStack>
                        <Text fontSize="sm" color="gray.500" textAlign="center" noOfLines={2} minH="40px">
                          {app.description || "No description provided."}
                        </Text>
                        <Divider />
                        <HStack spacing={2} w="full" justify="center">
                          <Tooltip label="Launch">
                            <IconButton
                              icon={<ExternalLink size={18} />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => window.open(app.url, "_blank")}
                            />
                          </Tooltip>
                          <Tooltip label="Edit">
                            <IconButton
                              icon={<Edit3 size={18} />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => {
                                setEditingApp(app);
                                setName(app.name);
                                setUrl(app.url);
                                setDescription(app.description || "");
                                setIcon(app.icon);
                                setAppType(app.app_type);
                                onOpen();
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              icon={<Trash2 size={18} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => setDeletingApp(app)}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            ) : (
              <Box bg={cardBg} borderRadius="3xl" shadow="sm" border="1px solid" borderColor={borderColor} overflow="hidden">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Application</Th>
                      <Th>Category</Th>
                      <Th>URL Endpoint</Th>
                      <Th>Status</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedData.map((app) => (
                      <Tr key={app.id} _hover={{ bg: "gray.50" }}>
                        <Td>
                          <HStack>
                            <Avatar src={app.icon} name={app.name} size="sm" borderRadius="md" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{app.name}</Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>{app.description}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                            {app.app_type_name || "General"}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="blue.500" fontWeight="medium" textDecor="underline" cursor="pointer" onClick={() => window.open(app.url, "_blank")}>
                            {app.url}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} fontSize="xs"> Active </Badge>
                        </Td>
                        <Td textAlign="right">
                          <HStack justify="flex-end">
                            <IconButton icon={<Edit3 size={16} />} size="sm" variant="ghost" onClick={() => {
                              setEditingApp(app);
                              setName(app.name);
                              setUrl(app.url);
                              setDescription(app.description || "");
                              setIcon(app.icon);
                              setAppType(app.app_type);
                              onOpen();
                            }} />
                            <IconButton icon={<Trash2 size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => setDeletingApp(app)} />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Pagination */}
            <Flex justify="center" mt={8} gap={2}>
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1} size="sm" variant="outline">Previous</Button>
              <Text alignSelf="center" fontSize="sm" color="gray.500">Page {page} of {totalPages}</Text>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page === totalPages} size="sm" variant="outline">Next</Button>
            </Flex>
          </>
        )}
      </Container>


      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader bgGradient={headerGradient} color="white" borderTopRadius="3xl">
            {editingApp ? "Edit Application" : "New Application"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Box w="full" textAlign="center">
                <Box
                  position="relative"
                  w="100px"
                  h="100px"
                  mx="auto"
                  borderRadius="2xl"
                  border="2px dashed"
                  borderColor="gray.300"
                  bg="gray.50"
                  overflow="hidden"
                  _hover={{ borderColor: "orange.400" }}
                  cursor="pointer"
                  onClick={() => document.getElementById("icon-upload").click()}
                >
                  {icon ? (
                    <Image src={icon} w="full" h="full" objectFit="cover" />
                  ) : (
                    <Center w="full" h="full" flexDirection="column">
                      <Icon as={UploadCloud} color="gray.400" boxSize={8} />
                      <Text fontSize="xs" color="gray.500" mt={1}>Upload Icon</Text>
                    </Center>
                  )}
                  <Input type="file" id="icon-upload" display="none" accept="image/*" onChange={handleImageUpload} />
                </Box>
                {fileError && <Text color="red.500" fontSize="xs" mt={1}>{fileError}</Text>}
              </Box>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="sm">Application Name</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dashboard" borderRadius="xl" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="sm">Category</FormLabel>
                  <Select value={app_type} onChange={(e) => setAppType(e.target.value)} placeholder="Select Type" borderRadius="xl">
                    {appTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" fontSize="sm">URL Endpoint</FormLabel>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." borderRadius="xl" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Description</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." borderRadius="xl" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="3xl" p={6}>
            <Button variant="ghost" onClick={onClose} mr={3} borderRadius="xl">Cancel</Button>
            <Button colorScheme="orange" onClick={handleSave} borderRadius="xl" px={8}>Save Application</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={!!deletingApp} leastDestructiveRef={cancelRef} onClose={() => setDeletingApp(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(5px)" />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Application</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete <b>{deletingApp?.name}</b>? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setDeletingApp(null)} borderRadius="xl">Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl">Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Box>
  );
};

export default Applications;
