import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
import axios from "axios";
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
  Activity,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { fetchData, postData, putData, deleteData } from "../utils/fetchData";
import { getAuthHeaders } from "../utils/apiHeaders";
import SearchableCheckboxMultiSelect from "../components/SearchableCheckboxMultiSelect";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 12;
const MAX_ICON_SIZE_BYTES = 102400;
const MotionBox = motion.create(Box);
const isAppActive = (app) => app?.is_active !== false && app?.is_active !== 0 && app?.is_active !== "0";

const Applications = () => {
  const location = useLocation();
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
  const [isIconDragging, setIsIconDragging] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Personnel access (which users can see this app)
  const [accessUserOptions, setAccessUserOptions] = useState([]);
  const [accessUserIds, setAccessUserIds] = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;

    const loadAccessData = async () => {
      try {
        if (accessUserOptions.length === 0) {
          const userData = await fetchData("users", null, null, "Failed to load personnel list", { fast: 1 });
          if (!cancelled) {
            const options = (userData || [])
              .map((u) => {
                const userId = u.user_id ?? u.ID;
                const hasName = u.fullname && u.fullname !== "N/A";
                return {
                  value: userId,
                  label: (hasName ? u.fullname : u.username) || `User ${userId}`,
                  username: u.username,
                  avatar: u.avatar,
                };
              })
              .filter((option) => option.value !== undefined && option.value !== null);
            setAccessUserOptions(options);
          }
        }

        if (editingApp) {
          setAccessLoading(true);
          const accessResponse = await axios.get(
            `${API_URL}/api/apps/${editingApp.id}/access`,
            { headers: getAuthHeaders() },
          );

          if (!cancelled) {
            setAccessUserIds(
              Array.from(
                new Set(
                  (accessResponse?.data?.userIds || [])
                    .map(Number)
                    .filter((id) => Number.isFinite(id)),
                ),
              ),
            );
          }
        } else if (!cancelled) {
          setAccessUserIds([]);
        }
      } catch (error) {
        if (!cancelled) {
          setAccessUserIds([]);
        }
      } finally {
        if (!cancelled) {
          setAccessLoading(false);
        }
      }
    };

    loadAccessData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, editingApp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    setSearchQuery(search);
    setPage(1);
  }, [location.search]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, typesData] = await Promise.all([
        fetchData("apps"),
        fetchData("application-types"),
      ]);
      const normalizedApps = (appsData || []).map((app) => ({
        ...app,
        is_active: isAppActive(app),
      }));
      setApps(normalizedApps);
      setAppTypes(typesData || []);
    } catch (error) {
      toast({
        title: "Could not load apps",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processImageFile = (file) => {
    if (!file) {
      setFileError("Please choose an image.");
      return;
    }

    if (!file.type?.startsWith("image/")) {
      setFileError("Please use an image file.");
      return;
    }

    if (file.size > MAX_ICON_SIZE_BYTES) {
      setFileError("Image size must be less than 100 KB.");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onloadend = () => setIcon(reader.result);
    reader.onerror = () => setFileError("Could not read this image.");
    reader.readAsDataURL(file);
  };

  const getImageFromClipboard = (clipboardData) => {
    const fileFromFiles = Array.from(clipboardData?.files || []).find((file) =>
      file.type?.startsWith("image/")
    );

    if (fileFromFiles) return fileFromFiles;

    const imageItem = Array.from(clipboardData?.items || []).find((item) =>
      item.type?.startsWith("image/")
    );

    return imageItem?.getAsFile() || null;
  };

  const handleImageUpload = (e) => {
    processImageFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleIconDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIconDragging(false);

    const imageFile = Array.from(e.dataTransfer?.files || []).find((file) =>
      file.type?.startsWith("image/")
    );
    processImageFile(imageFile);
  };

  const handleIconPaste = (e) => {
    const imageFile = getImageFromClipboard(e.clipboardData);
    if (!imageFile) return;

    e.preventDefault();
    processImageFile(imageFile);
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setIcon(null);
    setAppType("");
    setEditingApp(null);
    setFileError("");
    setAccessUserIds([]);
  };

  const handleSave = async () => {
    if (isSaving) return; // guard against double-submit (double-click / double Enter)

    if (!name.trim() || !url.trim() || !app_type) {
      toast({ title: "Please fill in all required fields", status: "warning" });
      return;
    }

    if (!icon && !editingApp) {
      toast({ title: "Please add an image", status: "warning" });
      return;
    }

    if (editingApp && accessLoading) {
      toast({
        title: "Still loading current access list",
        description: "Please wait a moment before saving so existing access isn't overwritten.",
        status: "warning",
      });
      return;
    }

    const payload = {
      name,
      url,
      description,
      icon,
      app_type,
      is_active: editingApp?.is_active ?? true,
    };

    // Find the matching type name for display
    const typeName = appTypes.find(t => String(t.id) === String(app_type))?.name || "";

    setIsSaving(true);
    try {
      let savedAppId = editingApp?.id;

      if (editingApp) {
        const result = await putData("apps", editingApp.id, payload);
        // ✅ Optimistic update: update the item in local state immediately
        const updatedApp = {
          ...editingApp,
          ...payload,
          is_active: result?.data?.is_active ?? payload.is_active,
          app_type_name: typeName,
          ...(result?.data || {}),
        };
        setApps(prev => prev.map(a => a.id === editingApp.id ? updatedApp : a));
        toast({ title: "App updated", status: "success" });
      } else {
        const result = await postData("apps", payload);
        savedAppId = result?.app?.id || result?.data?.id || result?.id;

        if (!savedAppId) {
          // We couldn't confirm the new app's id — refresh from the server
          // rather than fabricate one, so the access list is saved against
          // the real row instead of a throwaway local id.
          toast({ title: "App added", description: "Refreshing list…", status: "success" });
          resetForm();
          onClose();
          loadData();
          return;
        }

        // ✅ Optimistic update: append the new item immediately
        const newApp = {
          id: savedAppId,
          ...payload,
          is_active: result?.data?.is_active ?? payload.is_active,
          app_type_name: typeName,
          ...(result?.data || {}),
        };
        setApps(prev => [...prev, newApp]);
        toast({ title: "App added", status: "success" });
      }

      try {
        await putData("apps", `${savedAppId}/access`, { userIds: accessUserIds });
      } catch (accessError) {
        toast({ title: "App saved, but access list failed to save", description: accessError.message, status: "warning" });
      }

      resetForm();
      onClose();
      // Re-fetch in background to sync any server-side computed fields
      loadData();
    } catch (error) {
      const isNotFound = /not found/i.test(error.message || "");
      if (isNotFound) {
        toast({
          title: "This app no longer exists",
          description: "It may have been changed or removed elsewhere. Refreshing the list.",
          status: "error",
        });
        resetForm();
        onClose();
        loadData();
      } else {
        toast({ title: "Error saving app", description: error.message, status: "error" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (app) => {
    const nextIsActive = !isAppActive(app);
    setUpdatingStatusId(app.id);

    try {
      const payload = {
        name: app.name,
        url: app.url,
        description: app.description,
        icon: app.icon,
        app_type: app.app_type,
        is_active: nextIsActive,
      };

      const result = await putData("apps", app.id, payload);
      const updatedStatus = result?.data?.is_active ?? nextIsActive;

      setApps((prev) =>
        prev.map((item) =>
          item.id === app.id ? { ...item, is_active: updatedStatus } : item,
        ),
      );

      toast({
        title: nextIsActive ? "App enabled" : "App disabled",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Could not update app status",
        description: error.message,
        status: "error",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async () => {
    const appToDelete = deletingApp;
    try {
      // ✅ Optimistic update: remove item from local state immediately
      setApps(prev => prev.filter(a => a.id !== appToDelete.id));
      setDeletingApp(null);
      await deleteData("apps", appToDelete.id);
      toast({ title: "App deleted", status: "success" });
      // Re-fetch in background to ensure sync
      loadData();
    } catch (error) {
      // Rollback on failure
      loadData();
      toast({ title: "Error deleting app", description: error.message, status: "error" });
    }
  };

  const filteredApps = useMemo(() => {
    let data = [...apps];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (app) =>
          (app.name || "").toLowerCase().includes(q) ||
          (app.url || "").toLowerCase().includes(q) ||
          (app.description || "").toLowerCase().includes(q) ||
          (app.app_type_name || "").toLowerCase().includes(q) ||
          (isAppActive(app) ? "enabled" : "disabled").includes(q)
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

  const selectedAccessPeople = useMemo(() => {
    const optionMap = new Map(
      accessUserOptions.map((option) => [String(option.value), option]),
    );

    return accessUserIds.map((id) => {
      const option = optionMap.get(String(id));

      if (option) {
        return option;
      }

      return {
        value: id,
        label: `User ${id}`,
        username: "",
        avatar: null,
      };
    });
  }, [accessUserOptions, accessUserIds]);

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
                Apps
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">View and manage your apps</Text>
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
              Add App
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
            { label: "All Apps", value: stats.total, icon: Layers, color: "blue" },
            { label: "Types", value: stats.types, icon: Database, color: "purple" },
            { label: "Shown", value: stats.active, icon: Activity, color: "orange" }
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
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              bg={cardBg}
              focusBorderColor="orange.400"
            />
          </InputGroup>
          <Select
            placeholder="Filter by type"
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
              aria-label="Grid"
            />
            <IconButton
              icon={<List size={20} />}
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "solid" : "ghost"}
              colorScheme="orange"
              aria-label="List"
            />
          </HStack>
        </Stack>

        {/* Content Area */}
        {isLoading ? (
          <Center p={20} flexDir="column">
            <Icon as={RefreshCw} boxSize={12} color="orange.500" className="spin" />
            <Text mt={4} color="gray.500">Loading apps...</Text>
          </Center>
        ) : filteredApps.length === 0 ? (
          <Center p={20} flexDir="column" bg={cardBg} borderRadius="3xl" border="1px solid" borderColor={borderColor}>
            <Icon as={AlertCircle} boxSize={12} color="gray.300" />
            <Heading size="md" mt={4} color="gray.500">No apps found</Heading>
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
                        <VStack
                          position="absolute"
                          top={3}
                          right={3}
                          spacing={1}
                          align="end"
                        >
                          <Badge
                            colorScheme="purple"
                            variant="solid"
                            borderRadius="full"
                            px={2}
                          >
                            {app.app_type_name || "App"}
                          </Badge>
                          <Badge
                            colorScheme={isAppActive(app) ? "green" : "gray"}
                            variant="solid"
                            borderRadius="full"
                            px={2}
                          >
                            {isAppActive(app) ? "Enabled" : "Disabled"}
                          </Badge>
                        </VStack>
                      </Box>
                      <VStack p={6} pt={8} spacing={3}>
                        <VStack spacing={0}>
                          <Heading size="md" textAlign="center" color="gray.800" noOfLines={1}>{app.name}</Heading>
                          <Text fontSize="xs" color="blue.500" fontWeight="bold" noOfLines={1}>{app.url}</Text>
                        </VStack>
                        <Text fontSize="sm" color="gray.500" textAlign="center" noOfLines={2} minH="40px">
                          {app.description || "No description."}
                        </Text>
                        <Divider />
                        <HStack spacing={2} w="full" justify="center">
                          <Tooltip label="Open">
                            <IconButton
                              icon={<ExternalLink size={18} />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => window.open(app.url, "_blank")}
                            />
                          </Tooltip>
                          <Tooltip label={isAppActive(app) ? "Disable App" : "Enable App"}>
                            <IconButton
                              icon={isAppActive(app) ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                              size="sm"
                              colorScheme={isAppActive(app) ? "gray" : "green"}
                              variant="ghost"
                              onClick={() => handleToggleStatus(app)}
                              isLoading={updatingStatusId === app.id}
                              aria-label={isAppActive(app) ? "Disable App" : "Enable App"}
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
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th width="30%">App</Th>
                      <Th width="15%">Type</Th>
                      <Th width="30%">Link</Th>
                      <Th width="10%">Status</Th>
                      <Th width="15%" textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedData.map((app) => (
                      <Tr
                        key={app.id}
                        _hover={{ bg: isAppActive(app) ? "gray.50" : "gray.100" }}
                        opacity={isAppActive(app) ? 1 : 0.72}
                      >
                        <Td>
                          <HStack>
                            <Avatar src={app.icon} name={app.name} size="sm" borderRadius="md" />
                            <VStack align="start" spacing={0} overflow="hidden">
                              <Text fontWeight="bold" isTruncated w="full">{app.name}</Text>
                              <Text fontSize="xs" color="gray.500" isTruncated w="full">{app.description}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                            {app.app_type_name || "General"}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="blue.500" fontWeight="medium" textDecor="underline" cursor="pointer" onClick={() => window.open(app.url, "_blank")} isTruncated>
                            {app.url}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={isAppActive(app) ? "green" : "gray"}
                            variant="solid"
                            borderRadius="full"
                            px={2}
                            fontSize="xs"
                          >
                            {isAppActive(app) ? "Enabled" : "Disabled"}
                          </Badge>
                        </Td>
                        <Td textAlign="right">
                          <HStack justify="flex-end">
                            <Tooltip label={isAppActive(app) ? "Disable App" : "Enable App"}>
                              <IconButton
                                icon={isAppActive(app) ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme={isAppActive(app) ? "gray" : "green"}
                                onClick={() => handleToggleStatus(app)}
                                isLoading={updatingStatusId === app.id}
                                aria-label={isAppActive(app) ? "Disable App" : "Enable App"}
                              />
                            </Tooltip>
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
        <ModalContent borderRadius="3xl" onPaste={handleIconPaste}>
          <ModalHeader bgGradient={headerGradient} color="white" borderTopRadius="3xl">
            {editingApp ? "Edit App" : "New App"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Box w="full" textAlign="center">
                <Box
                  position="relative"
                  w="140px"
                  h="120px"
                  mx="auto"
                  borderRadius="2xl"
                  border="2px dashed"
                  borderColor={isIconDragging ? "orange.400" : "gray.300"}
                  bg={isIconDragging ? "orange.50" : "gray.50"}
                  overflow="hidden"
                  _hover={{ borderColor: "orange.400" }}
                  cursor="pointer"
                  tabIndex={0}
                  role="button"
                  aria-label="Upload app image"
                  onClick={() => document.getElementById("icon-upload").click()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsIconDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsIconDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsIconDragging(false);
                  }}
                  onDrop={handleIconDrop}
                  onPaste={handleIconPaste}
                >
                  {icon ? (
                    <Image src={icon} w="full" h="full" objectFit="cover" />
                  ) : (
                    <Center w="full" h="full" flexDirection="column">
                      <Icon as={UploadCloud} color="gray.400" boxSize={8} />
                      <Text fontSize="xs" color="gray.600" mt={1} fontWeight="bold">
                        Upload image
                      </Text>
                      <Text fontSize="10px" color="gray.500" mt={1}>
                        Click, paste, or drop
                      </Text>
                    </Center>
                  )}
                  <Input type="file" id="icon-upload" display="none" accept="image/*" onChange={handleImageUpload} />
                </Box>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Copy an image, then press Ctrl+V here. You can also drop an image.
                </Text>
                {fileError && <Text color="red.500" fontSize="xs" mt={1}>{fileError}</Text>}
              </Box>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="sm">App Name</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dashboard" borderRadius="xl" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="sm">Type</FormLabel>
                  <Select value={app_type} onChange={(e) => setAppType(e.target.value)} placeholder="Select type" borderRadius="xl">
                    {appTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" fontSize="sm">Link</FormLabel>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." borderRadius="xl" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Description</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short note..." borderRadius="xl" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Personnel Access</FormLabel>
                <SearchableCheckboxMultiSelect
                  options={accessUserOptions}
                  value={accessUserIds}
                  onChange={setAccessUserIds}
                  isLoading={accessLoading}
                  placeholder="Search personnel…"
                  summaryNoun="personnel selected"
                  selectedCount={accessUserIds.length}
                  formatOptionLabel={(option) => (
                    <HStack spacing={2}>
                      <Avatar size="xs" src={option.avatar || undefined} name={option.label} />
                      <Box>
                        <Text fontSize="sm" lineHeight="1.2">{option.label}</Text>
                        {option.username && (
                          <Text fontSize="10px" color="gray.500" lineHeight="1.2">{option.username}</Text>
                        )}
                      </Box>
                    </HStack>
                  )}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {accessUserIds.length} personnel currently have access to this app.
                </Text>
                {selectedAccessPeople.length > 0 ? (
                  <>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.600" mt={4} mb={2}>
                      Selected personnel
                    </Text>
                    <VStack
                      align="stretch"
                      spacing={2}
                      p={3}
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.100"
                      borderRadius="xl"
                      maxH="220px"
                      overflowY="auto"
                    >
                      {selectedAccessPeople.map((person) => (
                        <HStack
                          key={String(person.value)}
                          spacing={3}
                          align="center"
                          justify="space-between"
                          px={3}
                          py={2}
                          bg="white"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <HStack spacing={3} align="center" minW={0} flex="1">
                            <Avatar size="sm" src={person.avatar || undefined} name={person.label} />
                            <Box minW={0} flex="1">
                              <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                {person.label}
                              </Text>
                              {person.username && (
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                  {person.username}
                                </Text>
                              )}
                            </Box>
                          </HStack>
                          <Tooltip label={`Remove ${person.label}`} placement="top">
                            <IconButton
                              icon={<X size={14} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              aria-label={`Remove ${person.label}`}
                              onClick={() =>
                                setAccessUserIds((prev) =>
                                  prev.filter((id) => String(id) !== String(person.value)),
                                )
                              }
                            />
                          </Tooltip>
                        </HStack>
                      ))}
                    </VStack>
                  </>
                ) : (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    No personnel selected.
                  </Text>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="3xl" p={6}>
            <Button variant="ghost" onClick={onClose} mr={3} borderRadius="xl" isDisabled={isSaving}>Cancel</Button>
            <Button
              colorScheme="orange"
              onClick={handleSave}
              borderRadius="xl"
              px={8}
              isLoading={isSaving}
              loadingText="Saving…"
              isDisabled={editingApp && accessLoading}
            >
              Save App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={!!deletingApp} leastDestructiveRef={cancelRef} onClose={() => setDeletingApp(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(5px)" />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete App</AlertDialogHeader>
          <AlertDialogBody>
            Delete <b>{deletingApp?.name}</b>? This cannot be undone.
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
