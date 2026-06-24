import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Input,
  FormLabel,
  Checkbox,
  Flex,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Image,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  InputRightElement,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  TimeIcon,
  RepeatIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import {
  FiPrinter,
  FiMapPin,
  FiUser,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiWifi,
  FiZap,
  FiClipboard,
  FiFilter,
  FiImage,
} from "react-icons/fi";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import PrintableLokalProfile from "./PrintableLokalProfile";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL = process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

const MotionCard = motion.create(Card);
const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const resolveProfileImageUrl = (assetPath) => {
  if (!assetPath) return "";
  if (/^(https?:|data:)/i.test(assetPath)) return assetPath;
  const baseUrl = API_URL || "";
  if (!baseUrl) {
    return assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  }
  return assetPath.startsWith("/")
    ? `${baseUrl}${assetPath}`
    : `${baseUrl}/${assetPath}`;
};

const formatFriendlyDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const LokalProfile = () => {

  // --- State ---
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  // --- Printing ---
  const [profileToPrint, setProfileToPrint] = useState(null);
  const printRef = useRef(null);

  // --- Image Zoom State ---
  const [selectedImage, setSelectedImage] = useState(null);
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      setProfileToPrint(null);
    },
  });

  useEffect(() => {
    if (profileToPrint && printRef.current) {
      setTimeout(() => {
        handlePrint();
      }, 300);
    }
  }, [handlePrint, profileToPrint]);

  // Dropdown Data
  const [districts, setDistricts] = useState([]);
  const [localCongregations, setLocalCongregations] = useState([]);

  // Form Data
  const initialFormState = {
    district: "",
    lokal: "",
    lokalInput: "",
    isManualLokal: false,
    anniversary: "",
    serialNumber: "",
    destinado: "",
    destinadoContact: "",
    districtChronicler: "",
    chroniclerContact: "",
    districtMinister: "",
    ministerContact: "",
    seatingCapacity: "",
    distanceFromCentral: "",
    travelTimeFromCentral: "",
    internetSpeed: "",
    ledWall: false,
    generator: false,
    preparedBy: "",
    signature: "",
    datePrepared: getLocalDateInputValue(),
    imageUrl: "",
    imageFile: null,
    scheduleMidweek: { Tuesday: "", Wednesday: "", Thursday: "" },
    scheduleWeekend: { Friday: "", Saturday: "", Sunday: "" },
  };
  const [formData, setFormData] = useState(initialFormState);



  // --- Hooks and Styles ---
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const officialLokalIds = useMemo(() => (
    new Set(localCongregations.map((item) => String(item.id)))
  ), [localCongregations]);

  const profileStats = useMemo(() => {
    const now = Date.now();
    const recentCutoff = now - (30 * 24 * 60 * 60 * 1000);

    const withImage = profiles.filter((profile) => Boolean(profile.imageUrl)).length;
    const manual = profiles.filter((profile) => (
      Boolean(profile.lokal) && !officialLokalIds.has(String(profile.lokal))
    )).length;
    const withLed = profiles.filter((profile) => Boolean(profile.ledWall)).length;
    const withGenerator = profiles.filter((profile) => Boolean(profile.generator)).length;
    const districtsCovered = new Set(
      profiles
        .map((profile) => String(profile.district || "").trim())
        .filter(Boolean)
    ).size;
    const recentlyUpdated = profiles.filter((profile) => {
      const time = new Date(profile.datePrepared || "").getTime();
      return Number.isFinite(time) && time >= recentCutoff;
    }).length;

    return {
      total: profiles.length,
      withImage,
      manual,
      withLed,
      withGenerator,
      districtsCovered,
      recentlyUpdated,
    };
  }, [officialLokalIds, profiles]);

  // --- Effects ---

  // --- Fetch Data ---
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lokal_profiles`);
      setProfiles(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch profiles.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDropdowns = useCallback(async () => {
    // Fetch Districts
    try {
      const districtRes = await axios.get(`${DISTRICT_API_URL}/api/districts`);

      const districtsData = Array.isArray(districtRes.data)
        ? districtRes.data
        : (districtRes.data?.data || []);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        title: "District Failure",
        description: "Could not load Districts. Check console.",
        status: "warning",
        isClosable: true
      });
    }

    // Fetch Lokals
    try {
      const lokalRes = await axios.get(`${LOCAL_CONGREGATION_API_URL}/api/all-congregations`);

      const lokalsData = Array.isArray(lokalRes.data)
        ? lokalRes.data
        : (lokalRes.data?.data || []);
      setLocalCongregations(lokalsData);
    } catch (error) {
      console.error("Error fetching lokals:", error);
      // Don't show generic error if it's just this one failing, user can still proceed with District selecting if needed
      console.warn("Lokal API endpoint might be incorrect or down.");
    }
  }, [toast]);

  useEffect(() => {
    fetchProfiles();
    fetchDropdowns();
  }, [fetchDropdowns, fetchProfiles]);

  // --- Form Handling ---
  const openModal = (profile = null) => {
    setEditProfile(profile);
    if (profile) {
      // Determine if the saved lokal corresponds to an existing ID in the loaded content
      // We check if value matches loosely (string vs int)
      const isOfficialLokal = localCongregations && localCongregations.some((l) => String(l.id) === String(profile.lokal));

      // It is manual if there IS a lokal value, but it's NOT in the official list
      const isManual = !!profile.lokal && !isOfficialLokal;

      const formattedAnniversary = profile.anniversary
        ? getLocalDateInputValue(new Date(profile.anniversary))
        : "";

      setFormData({
        ...initialFormState,
        ...profile,
        anniversary: formattedAnniversary,
        isEnabled: undefined, // Cleanup if pollution exists
        isManualLokal: isManual,
        lokalInput: isManual ? profile.lokal : "",
        lokal: profile.lokal, // Ensure this is set regardless

        // Ensure nested objects are handled if null
        scheduleMidweek: profile.scheduleMidweek || initialFormState.scheduleMidweek,
        scheduleWeekend: profile.scheduleWeekend || initialFormState.scheduleWeekend,
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProfile(null);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };

      // Handle Manual Lokal Input
      if (payload.isManualLokal) {
        payload.lokal = payload.lokalInput; // Send the manual text as the 'lokal' value
      }

      // Basic validation
      if (!payload.district || (!payload.lokal && !payload.isManualLokal)) {
        toast({ title: "Validation Error", description: "District and Lokal are required.", status: "warning" });
        return;
      }

      let requestData = payload;
      let headers = { "Content-Type": "application/json" };

      // Check if we need to upload a file (Multipart)
      if (payload.imageFile) {
        const formDataObj = new FormData();
        formDataObj.append("image", payload.imageFile);

        Object.keys(payload).forEach((key) => {
          if (key === "imageFile" || key === "imageUrl") return; // Skip image fields in text part

          const value = payload[key];
          if (typeof value === "object" && value !== null) {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value);
          }
        });

        requestData = formDataObj;
        headers = { "Content-Type": "multipart/form-data" };
      }

      if (editProfile) {
        await axios.put(`${API_URL}/api/lokal_profiles/${editProfile.id}`, requestData, { headers });
        toast({ title: "Updated successfully", status: "success" });
      } else {
        await axios.post(`${API_URL}/api/lokal_profiles`, requestData, { headers });
        toast({ title: "Created successfully", status: "success" });
      }
      fetchProfiles();
      closeModal();
    } catch (err) {
      console.error(err);
      toast({
        title: "Save Failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await axios.delete(`${API_URL}/api/lokal_profiles/${id}`);
      fetchProfiles();
      toast({ title: "Deleted successfully", status: "info" });
    } catch (err) {
      toast({ title: "Error deleting profile", status: "error" });
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchProfiles(), fetchDropdowns()]);
    toast({
      title: "Profiles refreshed",
      status: "success",
      duration: 1800,
      isClosable: true,
    });
  };

  const copyProfileSummary = async (profile) => {
    const distName = districts.find((d) => String(d.id) === String(profile.district))?.name || "Unknown District";
    const lokalName = localCongregations.find((l) => String(l.id) === String(profile.lokal))?.name || profile.lokal || "Unknown Lokal";
    const summary = [
      `Lokal Profile: ${lokalName}`,
      `District: ${distName}`,
      `Resident Minister: ${profile.destinado || "N/A"}`,
      `Contact: ${profile.destinadoContact || "N/A"}`,
      `Serial Number: ${profile.serialNumber || "N/A"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Profile copied",
        description: `${lokalName} summary is now in your clipboard.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Copy profile summary failed:", error);
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        status: "error",
        duration: 2200,
        isClosable: true,
      });
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result, // Keep for preview
        imageFile: file          // Store file for upload
      }));
    };
    reader.readAsDataURL(file);
  };

  // --- Filtering ---
  const filteredProfiles = useMemo(() => {
    let list = [...profiles];
    const lowerQuery = searchQuery.trim().toLowerCase();

    if (lowerQuery) {
      list = list.filter((p) => {
        const distName = (districts.find((d) => String(d.id) === String(p.district))?.name || "").toLowerCase();
        const lokalName = (localCongregations.find((l) => String(l.id) === String(p.lokal))?.name || p.lokal || "").toString().toLowerCase();
        const serial = p.serialNumber ? String(p.serialNumber).toLowerCase() : "";
        const destined = p.destinado ? String(p.destinado).toLowerCase() : "";
        const minister = p.districtMinister ? String(p.districtMinister).toLowerCase() : "";
        const chronicler = p.districtChronicler ? String(p.districtChronicler).toLowerCase() : "";

        return (
          distName.includes(lowerQuery) ||
          lokalName.includes(lowerQuery) ||
          serial.includes(lowerQuery) ||
          destined.includes(lowerQuery) ||
          minister.includes(lowerQuery) ||
          chronicler.includes(lowerQuery)
        );
      });
    }

    switch (profileFilter) {
      case "with-image":
        list = list.filter((profile) => Boolean(profile.imageUrl));
        break;
      case "manual":
        list = list.filter((profile) => Boolean(profile.lokal) && !officialLokalIds.has(String(profile.lokal)));
        break;
      case "led":
        list = list.filter((profile) => Boolean(profile.ledWall));
        break;
      case "generator":
        list = list.filter((profile) => Boolean(profile.generator));
        break;
      default:
        break;
    }

    return list.sort((a, b) => {
      const aTime = new Date(a.datePrepared || 0).getTime();
      const bTime = new Date(b.datePrepared || 0).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  }, [officialLokalIds, profileFilter, profiles, searchQuery, districts, localCongregations]);

  // --- Components ---

  const ProfileCard = ({ profile }) => {
    const distName = districts.find((d) => String(d.id) === String(profile.district))?.name || "Unknown District";
    const lokalName = localCongregations.find((l) => String(l.id) === String(profile.lokal))?.name || profile.lokal || "Unknown Lokal";
    const imageSrc = resolveProfileImageUrl(profile.imageUrl);
    const hasImage = Boolean(imageSrc);
    const isManual = Boolean(profile.lokal) && !officialLokalIds.has(String(profile.lokal));

    return (
      <MotionCard
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        whileHover={{ y: -6, boxShadow: "0 18px 30px rgba(15, 23, 42, 0.10)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        overflow="hidden"
      >
        <Box h="132px" position="relative" bgGradient={hasImage ? undefined : "linear(to-br, teal.50, blue.50)"}>
          {hasImage ? (
            <Image
              src={imageSrc}
              alt={lokalName}
              w="100%"
              h="100%"
              objectFit="cover"
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.1)" }}
              cursor="zoom-in"
              onClick={() => {
                setSelectedImage(imageSrc);
                onImageOpen();
              }}
            />
          ) : (
            <Flex w="100%" h="100%" align="center" justify="center" color="teal.300">
              <VStack spacing={1}>
                <Icon as={FiImage} boxSize={10} />
                <Text fontSize="xs" fontWeight="700" color="teal.500">
                  No photo on file
                </Text>
              </VStack>
            </Flex>
          )}
          <HStack position="absolute" top={3} left={3} spacing={2}>
            <Badge colorScheme="gray" borderRadius="full" px={2} py={1}>
              {profile.serialNumber || "No Serial"}
            </Badge>
            {hasImage ? (
              <Badge colorScheme="teal" borderRadius="full" px={2} py={1}>
                Photo
              </Badge>
            ) : (
              <Badge colorScheme="orange" borderRadius="full" px={2} py={1}>
                Missing photo
              </Badge>
            )}
          </HStack>
        </Box>
        <CardBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Box>
              <Heading size="sm" color="gray.800" noOfLines={1} title={lokalName}>
                {lokalName}
              </Heading>
              <Text fontSize="xs" color="gray.500" fontWeight="600" noOfLines={1}>
                {distName}
              </Text>
            </Box>

            <HStack spacing={2} flexWrap="wrap">
              {isManual && <Badge colorScheme="orange" borderRadius="full" px={2}>Manual</Badge>}
              {profile.ledWall && <Badge colorScheme="purple" borderRadius="full" px={2}>LED Wall</Badge>}
              {profile.generator && <Badge colorScheme="blue" borderRadius="full" px={2}>Generator</Badge>}
              {profile.internetSpeed && <Badge colorScheme="teal" borderRadius="full" px={2}>{profile.internetSpeed}</Badge>}
            </HStack>

            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <Text fontSize="9px" fontWeight="800" letterSpacing="0.12em" color="gray.400" textTransform="uppercase">
                  Resident Minister
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.700" noOfLines={1} title={profile.destinado}>
                  {profile.destinado || "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="9px" fontWeight="800" letterSpacing="0.12em" color="gray.400" textTransform="uppercase">
                  Prepared
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.700">
                  {formatFriendlyDate(profile.datePrepared)}
                </Text>
              </Box>
            </SimpleGrid>

            <Flex justify="space-between" align="center" pt={1}>
              <Text fontSize="xs" color="gray.500">
                Updated {formatFriendlyDate(profile.datePrepared)}
              </Text>
              <Text fontSize="xs" fontWeight="700" color="gray.400">
                {profile.distanceFromCentral ? `${profile.distanceFromCentral} km from central` : "Compact view"}
              </Text>
            </Flex>
          </VStack>
        </CardBody>
        <CardFooter pt={0} pb={4} px={4}>
          <Flex w="100%" justify="space-between" align="center" gap={2}>
            <HStack spacing={1.5}>
              <Tooltip label="Print" hasArrow>
                <IconButton
                  size="sm"
                  icon={<FiPrinter />}
                  onClick={() => setProfileToPrint({ ...profile, districtName: distName, lokalName })}
                  aria-label="Print"
                  variant="ghost"
                  colorScheme="blue"
                />
              </Tooltip>
              <Tooltip label="Copy summary" hasArrow>
                <IconButton
                  size="sm"
                  icon={<FiClipboard />}
                  onClick={() => copyProfileSummary(profile)}
                  aria-label="Copy summary"
                  variant="ghost"
                  colorScheme="teal"
                />
              </Tooltip>
            </HStack>
            <HStack>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                <MenuList>
                  <MenuItem icon={<EditIcon />} onClick={() => openModal(profile)}>Edit</MenuItem>
                  <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDelete(profile.id)}>Delete</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </CardFooter>
      </MotionCard>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setProfileFilter("all");
  };

  const profileFilterOptions = [
    { value: "all", label: "All", count: profileStats.total, icon: FiFilter },
    { value: "with-image", label: "With image", count: profileStats.withImage, icon: FiImage },
    { value: "manual", label: "Manual", count: profileStats.manual, icon: FiMapPin },
    { value: "led", label: "LED wall", count: profileStats.withLed, icon: FiZap },
    { value: "generator", label: "Generator", count: profileStats.withGenerator, icon: FiWifi },
  ];

  const statCards = [
    { label: "Total profiles", value: profileStats.total, hint: "All registry entries" },
    { label: "Districts covered", value: profileStats.districtsCovered, hint: "Unique districts" },
    { label: "With photo", value: profileStats.withImage, hint: "Image attached" },
    { label: "Manual locals", value: profileStats.manual, hint: "Custom entries" },
    { label: "Updated 30d", value: profileStats.recentlyUpdated, hint: "Recently prepared" },
  ];

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgColor} minH="100vh">
      <Box
        bg="white"
        borderRadius="3xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        p={{ base: 4, md: 5 }}
        mb={5}
      >
        <Flex direction={{ base: "column", xl: "row" }} justify="space-between" gap={4} align={{ base: "stretch", xl: "center" }}>
          <Box flex="1">
            <Badge colorScheme="teal" borderRadius="full" px={3} py={1} textTransform="uppercase" letterSpacing="0.12em">
              Lokal registry
            </Badge>
            <Heading size={{ base: "lg", md: "xl" }} mt={3} color="gray.800" lineHeight="1.1">
              Lokal Profiles
            </Heading>
            <Text color="gray.500" fontSize={{ base: "sm", md: "md" }} mt={2} maxW="3xl">
              Compact registry for congregation information, contacts, schedules, equipment, and print-ready summaries.
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Showing {filteredProfiles.length} of {profileStats.total} profiles
            </Text>
          </Box>

          <VStack spacing={3} align="stretch" minW={{ base: "full", xl: "520px" }}>
            <Flex direction={{ base: "column", md: "row" }} gap={3}>
              <InputGroup maxW="100%">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search lokal, district, minister..."
                  bg="gray.50"
                  borderColor="gray.200"
                  borderRadius="xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pr={searchQuery ? 10 : 4}
                />
                {searchQuery && (
                  <InputRightElement pointerEvents="auto">
                    <IconButton
                      aria-label="Clear search"
                      icon={<SmallCloseIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              <Tooltip label="Refresh profiles" hasArrow>
                <IconButton
                  aria-label="Refresh profiles"
                  icon={<RepeatIcon />}
                  onClick={handleRefresh}
                  variant="outline"
                  colorScheme="teal"
                  borderRadius="xl"
                />
              </Tooltip>

              <Tooltip label="Add New Profile" hasArrow>
                <IconButton
                  aria-label="Add new profile"
                  icon={<AddIcon boxSize={5} />}
                  colorScheme="teal"
                  borderRadius="xl"
                  onClick={() => openModal()}
                  shadow="sm"
                  bgGradient="linear(to-r, teal.400, teal.600)"
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "md",
                    bgGradient: "linear(to-r, teal.500, teal.700)",
                  }}
                  transition="all 0.2s"
                />
              </Tooltip>
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={3} justify="space-between" align={{ base: "stretch", md: "center" }}>
              <HStack bg="gray.50" borderRadius="full" p={1} border="1px solid" borderColor="gray.100" spacing={1}>
                <IconButton
                  aria-label="Grid view"
                  icon={<FiGrid />}
                  size="sm"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  colorScheme="teal"
                  borderRadius="full"
                  onClick={() => setViewMode("grid")}
                />
                <IconButton
                  aria-label="List view"
                  icon={<FiList />}
                  size="sm"
                  variant={viewMode === "list" ? "solid" : "ghost"}
                  colorScheme="teal"
                  borderRadius="full"
                  onClick={() => setViewMode("list")}
                />
              </HStack>

              <Button size="sm" variant="ghost" colorScheme="gray" onClick={clearFilters} alignSelf="flex-start">
                Clear filters
              </Button>
            </Flex>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} spacing={3} mt={5}>
          {statCards.map((stat) => (
            <Box
              key={stat.label}
              bg="#FAFAFA"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="2xl"
              px={4}
              py={3}
            >
              <Text fontSize="9px" fontWeight="800" textTransform="uppercase" letterSpacing="0.12em" color="gray.400">
                {stat.label}
              </Text>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" color="gray.800" lineHeight="1" mt={2}>
                {stat.value}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {stat.hint}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Flex gap={2} flexWrap="wrap" mt={4}>
          {profileFilterOptions.map((option) => {
            const isActive = profileFilter === option.value;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={isActive ? "solid" : "outline"}
                colorScheme={isActive ? "teal" : "gray"}
                leftIcon={<Icon as={option.icon} />}
                onClick={() => setProfileFilter(option.value)}
                borderRadius="full"
              >
                {option.label} ({option.count})
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Box position="relative">
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </Flex>
        ) : filteredProfiles.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            shadow="sm"
            textAlign="center"
            px={6}
          >
            <Icon as={FiMapPin} boxSize={12} color="gray.300" mb={4} />
            <Heading size="md" color="gray.500">
              No profiles found
            </Heading>
            <Text color="gray.500" mt={2} maxW="md">
              Try a different search, clear the active filter, or add a new profile to get started.
            </Text>
            <HStack mt={5} spacing={3} flexWrap="wrap" justify="center">
              <Button variant="outline" colorScheme="teal" onClick={clearFilters}>
                Clear filters
              </Button>
              <Button colorScheme="teal" onClick={() => openModal()}>
                Add profile
              </Button>
            </HStack>
          </Flex>
        ) : (
          <>
            {viewMode === "grid" ? (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={5}>
                {filteredProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </SimpleGrid>
            ) : (
              <Card borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Lokal</Th>
                        <Th>District</Th>
                        <Th>Resident Minister</Th>
                        <Th>Facilities</Th>
                        <Th>Updated</Th>
                        <Th textAlign="right">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProfiles.map((profile) => {
                        const distName = districts.find((d) => String(d.id) === String(profile.district))?.name || "Unknown District";
                        const lokalName = localCongregations.find((l) => String(l.id) === String(profile.lokal))?.name || profile.lokal || "Unknown Lokal";
                        const imageSrc = resolveProfileImageUrl(profile.imageUrl);
                        const hasImage = Boolean(imageSrc);
                        return (
                          <Tr key={profile.id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              <HStack spacing={3} align="center">
                                <Box
                                  w="44px"
                                  h="44px"
                                  borderRadius="lg"
                                  overflow="hidden"
                                  bgGradient={hasImage ? undefined : "linear(to-br, teal.50, blue.50)"}
                                  border="1px solid"
                                  borderColor="gray.100"
                                  flexShrink={0}
                                >
                                  {hasImage ? (
                                    <Image
                                      src={imageSrc}
                                      alt={lokalName}
                                      w="100%"
                                      h="100%"
                                      objectFit="cover"
                                      cursor="zoom-in"
                                      onClick={() => {
                                        setSelectedImage(imageSrc);
                                        onImageOpen();
                                      }}
                                    />
                                  ) : (
                                    <Flex w="100%" h="100%" align="center" justify="center" color="teal.300">
                                      <Icon as={FiImage} />
                                    </Flex>
                                  )}
                                </Box>
                                <Box minW={0}>
                                  <Text fontWeight="700" color="gray.800" noOfLines={1} title={lokalName}>
                                    {lokalName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                    #{profile.serialNumber || "N/A"}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.700" noOfLines={1}>
                                {distName}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.700" fontWeight="600" noOfLines={1}>
                                {profile.destinado || "N/A"}
                              </Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {profile.destinadoContact || profile.chroniclerContact || "No contact info"}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={1.5} flexWrap="wrap">
                                {profile.ledWall && <Badge colorScheme="purple" borderRadius="full">LED</Badge>}
                                {profile.generator && <Badge colorScheme="blue" borderRadius="full">Gen</Badge>}
                                {profile.internetSpeed && <Badge colorScheme="teal" borderRadius="full">{profile.internetSpeed}</Badge>}
                                {!profile.ledWall && !profile.generator && !profile.internetSpeed && (
                                  <Text fontSize="xs" color="gray.400">No facility tags</Text>
                                )}
                              </HStack>
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              {formatFriendlyDate(profile.datePrepared)}
                            </Td>
                            <Td textAlign="right">
                              <HStack justify="end" spacing={1}>
                                <Tooltip label="Print" hasArrow>
                                  <IconButton
                                    size="xs"
                                    icon={<FiPrinter />}
                                    colorScheme="blue"
                                    variant="ghost"
                                    aria-label="Print"
                                    onClick={() => setProfileToPrint({ ...profile, districtName: distName, lokalName })}
                                  />
                                </Tooltip>
                                <Tooltip label="Copy summary" hasArrow>
                                  <IconButton
                                    size="xs"
                                    icon={<FiClipboard />}
                                    colorScheme="teal"
                                    variant="ghost"
                                    aria-label="Copy summary"
                                    onClick={() => copyProfileSummary(profile)}
                                  />
                                </Tooltip>
                                <IconButton
                                  size="xs"
                                  icon={<EditIcon />}
                                  onClick={() => openModal(profile)}
                                  variant="ghost"
                                  aria-label="Edit profile"
                                />
                                <IconButton
                                  size="xs"
                                  icon={<DeleteIcon />}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDelete(profile.id)}
                                  aria-label="Delete profile"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </Card>
            )}
          </>
        )}
      </Box>

      {/* Logic for Printing (Hidden) */}
      <div style={{ visibility: "hidden", position: "absolute", top: "-10000px", left: "-10000px" }}>
        <PrintableLokalProfile innerRef={printRef} profile={profileToPrint} />
      </div>

      {/* Image Zoom Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalBody p={0} display="flex" justifyContent="center">
            {selectedImage && (
              <Image
                src={selectedImage}
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
                borderRadius="md"
                boxShadow="2xl"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl" scrollBehavior="inside" isCentered>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl" shadow="2xl">
          <ModalHeader bg="gray.50" borderBottomWidth="1px">
            <HStack>
              <Icon as={editProfile ? EditIcon : AddIcon} color="teal.500" />
              <Text>{editProfile ? "Edit" : "Create"} Lokal Profile</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={0}>
            <Tabs orientation="vertical" variant="solid-rounded" colorScheme="teal" size="md" display={{ base: "none", md: "flex" }} h="600px">
              <TabList p={4} bg="gray.50" w="250px" borderRight="1px solid" borderColor="gray.200">
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiMapPin} mr={2} /> General Info</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiUser} mr={2} /> Key Personnel</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={TimeIcon} mr={2} /> Schedule</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiZap} mr={2} /> Facilities</Tab>
              </TabList>

              <TabPanels flex={1} overflowY="auto">
                {/* Tab 1: General */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Heading size="sm" mb={2} color="teal.600">Location Details</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                        <FormLabel fontSize="sm" fontWeight="bold">District</FormLabel>
                        <Select
                          placeholder="Select District"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value), lokal: "" })}
                          variant="filled"
                        >
                          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                      </Box>
                      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <FormLabel fontSize="sm" fontWeight="bold" mb={0}>Local Congregation</FormLabel>
                          <Checkbox
                            size="sm"
                            colorScheme="teal"
                            isChecked={formData.isManualLokal}
                            onChange={(e) => setFormData({ ...formData, isManualLokal: e.target.checked, lokal: "", lokalInput: "" })}
                          >
                            Manual Input
                          </Checkbox>
                        </Flex>

                        {formData.isManualLokal ? (
                          <Input
                            placeholder="Type Lokal Name"
                            value={formData.lokalInput}
                            onChange={(e) => setFormData({ ...formData, lokalInput: e.target.value })}
                            variant="filled"
                          />
                        ) : (
                          <Select
                            placeholder="Select Lokal"
                            value={formData.lokal}
                            onChange={(e) => setFormData({ ...formData, lokal: parseInt(e.target.value) })}
                            isDisabled={!formData.district}
                            variant="filled"
                          >
                            {localCongregations.filter(l => l.district_id === formData.district).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </Select>
                        )}
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Serial Number</FormLabel>
                        <Input value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Anniversary</FormLabel>
                        <Input type="date" value={formData.anniversary} onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })} />
                      </Box>
                    </SimpleGrid>

                    <Divider />

                    <Heading size="sm" mb={2} color="teal.600">Image</Heading>
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      h="200px"
                      bg="gray.50"
                      cursor="pointer"
                      overflow="hidden"
                      position="relative"
                      onClick={() => document.getElementById('modal-img-upload').click()}
                      _hover={{ borderColor: "teal.400", bg: "teal.50" }}
                    >
                      {formData.imageUrl ? (
                        <Image src={resolveProfileImageUrl(formData.imageUrl)} h="100%" w="100%" objectFit="contain" />
                      ) : (
                        <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
                          <Icon as={FiMapPin} boxSize={8} mb={2} />
                          <Text fontSize="sm">Click to upload photo</Text>
                        </Flex>
                      )}
                      <input id="modal-img-upload" type="file" hidden accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tab 2: Personnel */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Box>
                      <Heading size="sm" mb={4} color="teal.600">Ministerial Staff</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                          <FormLabel fontSize="sm">Resident Minister (Destinado)</FormLabel>
                          <Input value={formData.destinado} onChange={(e) => setFormData({ ...formData, destinado: e.target.value })} placeholder="Full Name" />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.destinadoContact} onChange={(e) => setFormData({ ...formData, destinadoContact: e.target.value })} />
                        </Box>
                      </SimpleGrid>
                    </Box>
                    <Divider />
                    <Box>
                      <Heading size="sm" mb={4} color="teal.600">District Oversight</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <FormLabel fontSize="sm">District Minister</FormLabel>
                          <Input value={formData.districtMinister} onChange={(e) => setFormData({ ...formData, districtMinister: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.ministerContact} onChange={(e) => setFormData({ ...formData, ministerContact: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">District Chronicler</FormLabel>
                          <Input value={formData.districtChronicler} onChange={(e) => setFormData({ ...formData, districtChronicler: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.chroniclerContact} onChange={(e) => setFormData({ ...formData, chroniclerContact: e.target.value })} />
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tab 3: Schedule */}
                <TabPanel>
                  <Heading size="sm" mb={6} color="teal.600">Worship Service Schedule</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <Box>
                      <Badge colorScheme="purple" mb={3} px={2} py={1} borderRadius="md">Midweek</Badge>
                      <VStack spacing={3}>
                        {["Tuesday", "Wednesday", "Thursday"].map(day => (
                          <Box w="100%" key={day}>
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">{day}</Text>
                            <Input
                              size="sm"
                              placeholder="e.g. 05:45 AM, 06:45 PM"
                              value={formData.scheduleMidweek[day]}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduleMidweek: { ...formData.scheduleMidweek, [day]: e.target.value }
                              })}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    <Box>
                      <Badge colorScheme="orange" mb={3} px={2} py={1} borderRadius="md">Weekend</Badge>
                      <VStack spacing={3}>
                        {["Friday", "Saturday", "Sunday"].map(day => (
                          <Box w="100%" key={day}>
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">{day}</Text>
                            <Input
                              size="sm"
                              placeholder="e.g. 05:45 AM, 09:45 AM"
                              value={formData.scheduleWeekend[day]}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduleWeekend: { ...formData.scheduleWeekend, [day]: e.target.value }
                              })}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </TabPanel>

                {/* Tab 4: Facilities */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Heading size="sm" color="teal.600">Site Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <FormLabel fontSize="sm">Seating Capacity</FormLabel>
                        <Input type="number" value={formData.seatingCapacity} onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Internet Speed</FormLabel>
                        <Input value={formData.internetSpeed} onChange={(e) => setFormData({ ...formData, internetSpeed: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Dist. from Central (km)</FormLabel>
                        <Input value={formData.distanceFromCentral} onChange={(e) => setFormData({ ...formData, distanceFromCentral: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Travel Time</FormLabel>
                        <Input value={formData.travelTimeFromCentral} onChange={(e) => setFormData({ ...formData, travelTimeFromCentral: e.target.value })} />
                      </Box>
                    </SimpleGrid>

                    <Divider />
                    <Heading size="sm" color="teal.600">Equipment</Heading>
                    <HStack spacing={6}>
                      <Checkbox
                        isChecked={formData.ledWall}
                        onChange={(e) => setFormData({ ...formData, ledWall: e.target.checked })}
                        size="lg" colorScheme="teal"
                      >
                        LED Wall
                      </Checkbox>
                      <Checkbox
                        isChecked={formData.generator}
                        onChange={(e) => setFormData({ ...formData, generator: e.target.checked })}
                        size="lg" colorScheme="teal"
                      >
                        Power Generator
                      </Checkbox>
                    </HStack>

                    <Divider />
                    <Heading size="sm" color="teal.600">Meta Data</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <FormLabel fontSize="sm">Prepared By</FormLabel>
                        <Input value={formData.preparedBy} onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Date Prepared</FormLabel>
                        <Input type="date" value={formData.datePrepared} onChange={(e) => setFormData({ ...formData, datePrepared: e.target.value })} />
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Mobile Fallback for Tabs (Simple Stack) */}
            <Box display={{ base: "block", md: "none" }} p={4} maxH="60vh" overflowY="auto">
              <VStack spacing={6}>
                {/* Condensed layout for mobile */}
                <Box w="100%">
                  <Heading size="sm" mb={2}>Location</Heading>
                  <Select mb={2} placeholder="Select District" value={formData.district} onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value) })} >
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                  <Select placeholder="Select Lokal" value={formData.lokal} onChange={(e) => setFormData({ ...formData, lokal: parseInt(e.target.value) })} isDisabled={!formData.district}>
                    {localCongregations.filter(l => l.district_id === formData.district).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </Box>
                {/* ... other condensed fields if needed for mobile ... */}
                <Text color="gray.500" fontSize="sm" fontStyle="italic">Use desktop to edit full details.</Text>
              </VStack>
            </Box>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={closeModal}>Cancel</Button>
            <Button colorScheme="teal" onClick={handleSave} px={8}>Save Profile</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LokalProfile;
