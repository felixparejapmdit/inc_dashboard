// Dashboard Component
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from "react";
// Import PersonnelPreview (moved to top)
import PersonnelPreview from "./PersonnelPreview";
import {
  Box,
  Badge,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  useColorMode,
  Divider,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Image,
  HStack,
  Tooltip,
  useBreakpointValue,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Avatar,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  List,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  InputGroup,
  InputLeftElement,
  Flex,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiFile,
  FiBell,
  FiSearch,
  FiGrid,
  FiMoon,
  FiExternalLink,
  FiActivity,
  FiMonitor,
  FiSmartphone,
  FiGlobe,
  FiClock,
  FiCpu,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

import { useDisclosure } from "@chakra-ui/react";


import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate, useOutletContext } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAuthHeaders } from "../utils/apiHeaders";
import { fetchData } from "../utils/fetchData";
import { usePermissionContext } from "../contexts/PermissionContext";
import { useDebounce } from "use-debounce";
import moment from "moment";

const API_URL = process.env.REACT_APP_API_URL;



// Simple cache config for apps
const APPS_CACHE_KEY = "categorizedApps";
const APPS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function Dashboard({ isSidebarExpanded: propIsSidebarExpanded }) {
  const { isSidebarExpanded: contextIsSidebarExpanded } = useOutletContext() || {};
  const isSidebarExpanded = propIsSidebarExpanded ?? contextIsSidebarExpanded;

  const [appTypes, setAppTypes] = useState([]);

  const { hasPermission } = usePermissionContext();

  const [recentApps, setRecentApps] = useState([]);
  const [categorizedApps, setCategorizedApps] = useState({});
  const [apps, setApps] = useState([]);
  const [status, setStatus] = useState("");
  const [availableApps, setAvailableApps] = useState([]);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApp, setSelectedApp] = useState(null);
  const [userFullName, setUserFullName] = useState(
    localStorage.getItem("userFullName") || ""
  );



  const [currentDate, setCurrentDate] = useState(() => new Date());

  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewPersonnelId, setPreviewPersonnelId] = useState(null);

  const handlePreviewPersonnel = useCallback((id) => {
    setPreviewPersonnelId(id);
    onPreviewOpen();
  }, [onPreviewOpen]);

  const handleClosePreview = useCallback(() => {
    setPreviewPersonnelId(null);
    onPreviewClose();
  }, [onPreviewClose]);

  const [error, setError] = useState("");
  const [updatedApp, setUpdatedApp] = useState({
    name: "",
    description: "",
    url: "",
    icon: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const [currentUser, setCurrentUser] = useState({ name: "User" });
  const [pmdApplications, setPmdApplications] = useState([]);
  const [otherApplications, setOtherApplications] = useState([]);

  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredReminder, setHoveredReminder] = useState(null);
  const { colorMode } = useColorMode();

  const [filteredApps, setFilteredApps] = useState([]);

  const navigate = useNavigate();

  const [isMobileDragEnabled, setIsMobileDragEnabled] = useState(false);
  const isDragEnabled = false;

  const [compactGreeting, setCompactGreeting] = useState(false);
  const compactGreetingRef = useRef(false);
  const scrollFrameRef = useRef(null);

  // Login audit state + lazy-load control
  const [loginAudits, setLoginAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogins, setShowLogins] = useState(false);
  const [hasLoadedLogins, setHasLoadedLogins] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;



  // Hook values moved to top level to avoid conditional constraints
  const dashboardBg = useColorModeValue(
    "linear(to-b, orange.50, white 38%, gray.50)",
    "linear(to-b, gray.900, gray.900 48%, gray.800)"
  );
  const stickyHeaderBg = useColorModeValue(
    "rgba(255, 255, 255, 0.88)",
    "rgba(26, 32, 44, 0.86)"
  );
  const stickyHeaderBorder = useColorModeValue("gray.100", "whiteAlpha.200");
  const headerChipBg = useColorModeValue("whiteAlpha.800", "whiteAlpha.200");
  const headerSearchBg = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");
  const mutedHeaderText = useColorModeValue("gray.600", "gray.300");
  const sectionTitleColor = useColorModeValue("gray.800", "gray.100");

  const recentActivityInputBg = useColorModeValue("gray.100", "gray.700");
  const recentActivityInputHoverBg = useColorModeValue("gray.200", "gray.600");
  const recentActivityBoxBg = useColorModeValue("white", "gray.800");
  const recentActivityBorderColor = useColorModeValue("gray.100", "gray.700");
  const recentActivityTheadBg = useColorModeValue("gray.50/50", "gray.900/50");
  const recentActivityTextColor = useColorModeValue("gray.700", "gray.200");
  const recentActivityRowHoverBg = useColorModeValue("orange.50/30", "whiteAlpha.100");
  const sectionSubText = useColorModeValue("gray.500", "gray.400");
  const sectionBadgeBg = useColorModeValue("orange.100", "orange.700");
  const sectionBadgeColor = useColorModeValue("orange.700", "orange.100");
  const sectionIconBg = useColorModeValue("orange.200", "orange.600");
  const sectionPanelBg = useColorModeValue(
    "rgba(255, 255, 255, 0.62)",
    "rgba(26, 32, 44, 0.58)"
  );
  const sectionPanelBorder = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");
  const sectionPanelShadow = useColorModeValue(
    "0 10px 30px rgba(15, 23, 42, 0.04)",
    "0 12px 30px rgba(0, 0, 0, 0.22)"
  );

  const renderSectionHeader = (title, count) => {
    const badgeLabel = count ? `${count} apps` : "No apps";
    return (
      <HStack
        justify="space-between"
        align="center"
        mb={3}
        flexWrap="wrap"
        spacing={2}
        px={1}
      >
        <HStack spacing={2}>
          <Box
            bg={sectionIconBg}
            color="white"
            p={2}
            borderRadius="xl"
            boxShadow="sm"
          >
            <Icon as={FiGrid} boxSize={3.5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Heading as="h2" size="sm" color={sectionTitleColor}>
              {title}
            </Heading>
            <Text fontSize="xs" color={sectionSubText}>
              {count} {count === 1 ? "application" : "applications"}
            </Text>
          </VStack>
        </HStack>
        <Badge
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="10px"
          textTransform="uppercase"
          letterSpacing="wide"
          bg={sectionBadgeBg}
          color={sectionBadgeColor}
        >
          {badgeLabel}
        </Badge>
      </HStack>
    );
  };


  useEffect(() => {
    // We only need the date (not a ticking clock), so just set it once
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    const updateCompactGreeting = () => {
      scrollFrameRef.current = null;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const shouldCompact =
        scrollTop > 64 ? true : scrollTop < 16 ? false : compactGreetingRef.current;

      if (shouldCompact !== compactGreetingRef.current) {
        compactGreetingRef.current = shouldCompact;
        setCompactGreeting(shouldCompact);
      }
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(updateCompactGreeting);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);





  const isMobile = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
    lg: false,
    xl: false,
  });
  const shouldEnableDragDrop =
    isDragEnabled && (!isMobile || isMobileDragEnabled);

  const colors = useMemo(() => ({
    reminderBg: colorMode === "light" ? "orange.100" : "orange.700",
    eventBg: colorMode === "light" ? "teal.100" : "teal.700",
    appBg: colorMode === "light" ? "transparent" : "gray.800",
    cardText: colorMode === "light" ? "gray.600" : "gray.300",
    cardHeader: colorMode === "light" ? "gray.800" : "gray.100",
    cardBorder: colorMode === "light" ? "gray.200" : "gray.700",
    buttonBg: colorMode === "light" ? "blue.600" : "blue.500",
    buttonHoverBg: colorMode === "light" ? "blue.700" : "blue.600",
  }), [colorMode]);

  const handleNextcloudLogin = () => {
    const username = localStorage.getItem("username");

    if (!username) {
      console.error("Username not found in local storage.");
      return;
    }

    fetchData(
      `nextcloud-login?username=${username}`,
      (data) => {
        if (data.nextcloudUrl) {
          window.location.href = data.nextcloudUrl;
        } else {
          console.error("Nextcloud login URL not found in response.");
        }
      },
      (error) => {
        console.error("Error logging in to Nextcloud:", error);
      }
    );
  };

  // Lazily fetch login audits when user expands the section
  useEffect(() => {
    if (!showLogins || hasLoadedLogins) return;
    fetchData(
      "login-audits/recent",
      (data) => {
        setLoginAudits(data);
        setHasLoadedLogins(true);
      },
      (error) => console.error("Failed to fetch login audits:", error)
    );
  }, [showLogins, hasLoadedLogins]);

  // Filter audits by username based on search term (case-insensitive)
  const filteredAudits = useMemo(() => {
    if (!searchTerm.trim()) return loginAudits;
    return loginAudits.filter((log) =>
      log.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loginAudits, searchTerm]);

  // Search handler: use debounced query to filter apps
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setFilteredApps([]);
      return;
    }

    const filtered = [];
    const query = debouncedSearchQuery.toLowerCase();

    Object.values(categorizedApps).forEach((appsArray) => {
      appsArray.forEach((app) => {
        const nameMatch = app.name?.toLowerCase().includes(query);
        const codeMatch = app.generated_code?.toLowerCase().includes(query);
        const phoneMatch = app.extension?.toLowerCase().includes(query);

        if (nameMatch || codeMatch || phoneMatch) filtered.push(app);
      });
    });

    setFilteredApps(filtered);
  }, [debouncedSearchQuery, categorizedApps]);

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // Reset pagination when filteredAudits changes (due to search)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (!username) {
      console.error("Username not found in localStorage");
      setError("User is not logged in. Please log in again.");
      return;
    }

    // Non-critical data can stay, or be lazy-loaded later the same way as login audits
    fetchData("events", setEvents, (err) =>
      console.error("Error fetching events:", err)
    );

    fetchData("reminders", setReminders, (err) =>
      console.error("Error fetching reminders:", err)
    );

    const url = `${API_URL}/api/users/logged-in?username=${encodeURIComponent(
      username
    )}`;
    //console.log("Constructed Fetch URL:", url);

    fetch(url, {
      headers: getAuthHeaders(),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error("Backend returned error text:", text);
            throw new Error("Failed to fetch logged-in user");
          });
        }
        return response.json();
      })
      .then((user) => {
        if (user && (user.ID || user.id)) {
          setCurrentUser({
            id: user.ID || user.id,
            username: user.username,
            fullName: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email || "",
            avatar: user.avatar || "",
          });

          setAvailableApps(user.availableApps || []);
          setUserFullName(user.name || `${user.firstName} ${user.lastName}`);
        } else {
          console.error("User data is not in the expected format:", user);
        }
      })
      .catch((error) => {
        console.error("Error fetching logged-in user data:", error);
        setError("Unable to fetch user data. Please check your connection.");
      });
  }, []);

  useEffect(() => {
    fetchApplicationTypes();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchApplications();
    }
  }, [currentUser]);

  useEffect(() => {
    const storedRecentApps =
      JSON.parse(localStorage.getItem("recentApps")) || [];
    setRecentApps(storedRecentApps.slice(0, 5));
  }, []);

  const fetchApplicationTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/application-types`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch application types");
      const data = await response.json();
      setAppTypes(data);
    } catch (error) {
      console.error("Error fetching application types:", error);
    }
  };

  // Fetch applications with caching + TTL
  const fetchApplications = async () => {
    try {
      // Client-side cache check DISABLED
      // const cacheRaw = localStorage.getItem(APPS_CACHE_KEY);
      // if (cacheRaw) { ... }

      if (!currentUser.id) {
        console.warn("Skipping fetchApplications: User ID not defined yet");
        return;
      }

      const response = await fetch(`${API_URL}/api/apps/available`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch apps: ${response.statusText}`);

      const data = await response.json();

      const categorized = {};
      for (const category in data) {
        if (data.hasOwnProperty(category)) {
          categorized[category] = data[category];
        }
      }

      setCategorizedApps(categorized);
      // Cache saving DISABLED
      // localStorage.setItem(
      //   APPS_CACHE_KEY,
      //   JSON.stringify({ data: categorized, ts: Date.now() })
      // );
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };



  const handleSettingsClick = (app) => {
    setSelectedApp(app);
    setUpdatedApp({
      name: app.name,
      description: app.description,
      url: app.url,
      icon: app.icon || "",
    });
    onOpen();
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();

    if (!updatedApp.name || !updatedApp.url) {
      console.error("Name and URL fields are required.");
      return;
    }

    const updatedAppData = { ...selectedApp, ...updatedApp };

    setApps((prevApps) =>
      prevApps.map((app) => (app.id === selectedApp.id ? updatedAppData : app))
    );

    fetch(`${API_URL}/api/apps/${selectedApp.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedAppData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update app");
        }
        return response.json();
      })
      .then((data) => {
        const updatedAppFromAPI = data.app;

        setApps((prevApps) =>
          prevApps.map((app) =>
            app.id === updatedAppFromAPI.id ? updatedAppFromAPI : app
          )
        );

        setStatus(`App "${updatedApp.name}" updated successfully.`);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating app:", error);
        setStatus("Error updating app. Please try again.");
      });
  };

  // Time-based greeting using state instead of extra localStorage read
  const getTimeBasedGreeting = () => {
    const name = userFullName || "User";
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const handleAppClick = useCallback((app) => {
    const storedRecentApps =
      JSON.parse(localStorage.getItem("recentApps")) || [];

    const updatedRecentApps = [
      app,
      ...storedRecentApps.filter((a) => a.id !== app.id),
    ].slice(0, 5);

    localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps));
    setRecentApps(updatedRecentApps);
  }, []);

  const handleDragEnd = (result, type) => {
    if (!result.destination || isMobile) return;

    const reorderedApps = [...categorizedApps[type]];
    const [movedApp] = reorderedApps.splice(result.source.index, 1);
    reorderedApps.splice(result.destination.index, 0, movedApp);

    setCategorizedApps((prev) => ({
      ...prev,
      [type]: reorderedApps,
    }));
  };

  const visibleAppTypeSections = useMemo(() => {
    const getAppItems = (categoryName) =>
      (categorizedApps[categoryName] || []).filter(
        (item) => !item?.type || item.type === "app"
      );

    const sections = appTypes
      .map((type) => ({
        id: type.id,
        name: type.name,
        apps: getAppItems(type.name),
      }))
      .filter((section) => section.apps.length > 0);

    const knownTypeNames = new Set(appTypes.map((type) => type.name));

    Object.entries(categorizedApps).forEach(([categoryName, items]) => {
      if (knownTypeNames.has(categoryName)) return;

      const apps = (items || []).filter((item) => !item?.type || item.type === "app");
      if (apps.length > 0) {
        sections.push({
          id: `category-${categoryName}`,
          name: categoryName,
          apps,
        });
      }
    });

    return sections;
  }, [appTypes, categorizedApps]);

  const visibleAppCount = useMemo(
    () => visibleAppTypeSections.reduce((total, section) => total + section.apps.length, 0),
    [visibleAppTypeSections]
  );

  return (
    <Box
      bgGradient={dashboardBg}
      minH="100vh"
      px={{ base: 3, md: 5 }}
      py={{ base: 3, md: 4 }}
    >
      {/* Sticky Header Section */}
      <Box
        position="sticky"
        top={{ base: 2, md: 3 }}
        zIndex="1000"
        bg={stickyHeaderBg}
        backdropFilter="blur(18px)"
        px={{ base: 3, md: 4 }}
        py={compactGreeting ? 2 : 3}
        borderRadius="3xl"
        border="1px solid"
        borderColor={stickyHeaderBorder}
        boxShadow={
          compactGreeting
            ? "0 10px 28px rgba(15, 23, 42, 0.08)"
            : "0 18px 48px rgba(15, 23, 42, 0.10)"
        }
        transition="padding 0.22s ease, box-shadow 0.22s ease, background 0.22s ease"
        transform="translateZ(0)"
        willChange="padding, box-shadow"
      >
        <Flex
          direction={{ base: "column", lg: compactGreeting ? "row" : "column" }}
          gap={compactGreeting ? 2 : 3}
          align={compactGreeting ? { base: "stretch", lg: "center" } : "stretch"}
          transition="gap 0.22s ease"
        >
          <Flex
            width="100%"
            align="center"
            justify="space-between"
            gap={2}
            flexWrap="wrap"
            flex={compactGreeting ? { base: "1 1 auto", lg: "0 0 430px" } : "1"}
          >
            <InputGroup
              size="sm"
              maxW={{ base: "100%", md: compactGreeting ? "300px" : "380px" }}
              flex={{ base: "1 1 100%", md: "1 1 auto" }}
              transition="max-width 0.22s ease"
            >
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="orange.400" boxSize={3.5} />
              </InputLeftElement>
              <Input
                data-tour="search-bar"
                placeholder="Search apps"
                borderRadius="full"
                bg={headerSearchBg}
                borderColor={stickyHeaderBorder}
                pl={9}
                value={searchQuery}
                onChange={handleSearchInput}
                boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.7)"
                _hover={{ borderColor: "orange.200" }}
                _focus={{
                  bg: "white",
                  borderColor: "orange.300",
                  boxShadow: "0 0 0 1px var(--chakra-colors-orange-300)",
                }}
              />
            </InputGroup>

            <HStack spacing={2} flexShrink={0}>
              <Badge
                px={2.5}
                py={1}
                borderRadius="full"
                bg={headerChipBg}
                color={mutedHeaderText}
                textTransform="none"
                fontSize="10px"
              >
                {visibleAppCount} apps
              </Badge>
              <Badge
                px={2.5}
                py={1}
                borderRadius="full"
                bg={headerChipBg}
                color={mutedHeaderText}
                textTransform="none"
                fontSize="10px"
              >
                {visibleAppTypeSections.length} groups
              </Badge>
            </HStack>
          </Flex>

          <Box
            flex="1"
            width="100%"
            minW={0}
            transition="width 0.22s ease"
          >
            <Box
              bgGradient="linear(to-r, orange.500, yellow.300)"
              borderRadius="2xl"
              p={compactGreeting ? { base: 2.5, md: 3 } : { base: 4, md: 5 }}
              textAlign="left"
              boxShadow={compactGreeting ? "sm" : "lg"}
              width="100%"
              minH={compactGreeting ? "52px" : "118px"}
              position="relative"
              overflow="hidden"
              transition="min-height 0.24s ease, padding 0.24s ease, box-shadow 0.24s ease"
              willChange="min-height, padding"
              _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                bg:
                  "radial-gradient(circle at 12% 15%, rgba(255,255,255,0.42), transparent 26%), radial-gradient(circle at 86% 20%, rgba(255,255,255,0.32), transparent 22%)",
                opacity: compactGreeting ? 0.45 : 0.85,
                transition: "opacity 0.24s ease",
              }}
            >
              <Flex
                position="relative"
                zIndex={1}
                align="center"
                justify="space-between"
                gap={3}
                direction={{ base: "column", md: "row" }}
              >
                <Box minW={0} width="100%">
                  <HStack spacing={2} mb={compactGreeting ? 0 : 1}>
                    <Badge
                      bg="whiteAlpha.800"
                      color="orange.700"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="10px"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      Dashboard
                    </Badge>
                    {!compactGreeting && (
                      <Text fontSize="xs" color="whiteAlpha.900" noOfLines={1}>
                        {currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                  </HStack>

                  <Heading
                    as="h1"
                    size={compactGreeting ? "sm" : "lg"}
                    color="white"
                    lineHeight="1.1"
                    transition="font-size 0.24s ease, line-height 0.24s ease"
                    noOfLines={1}
                  >
                    {getTimeBasedGreeting()}
                  </Heading>

                  {!compactGreeting && (
                    <Text fontSize="sm" color="whiteAlpha.900" mt={2} noOfLines={1}>
                      Your applications are ready. Pick a tool and keep the day moving.
                    </Text>
                  )}
                </Box>

                {!compactGreeting && (
                  <HStack
                    spacing={2}
                    display={{ base: "none", md: "flex" }}
                    flexShrink={0}
                  >
                    <Box
                      bg="whiteAlpha.800"
                      borderRadius="xl"
                      px={3}
                      py={2}
                      minW="92px"
                      textAlign="center"
                    >
                      <Text fontSize="lg" fontWeight="900" color="orange.700">
                        {visibleAppCount}
                      </Text>
                      <Text fontSize="10px" color="orange.700" fontWeight="bold">
                        Apps
                      </Text>
                    </Box>
                    <Box
                      bg="whiteAlpha.700"
                      borderRadius="xl"
                      px={3}
                      py={2}
                      minW="92px"
                      textAlign="center"
                    >
                      <Text fontSize="lg" fontWeight="900" color="orange.700">
                        {visibleAppTypeSections.length}
                      </Text>
                      <Text fontSize="10px" color="orange.700" fontWeight="bold">
                        Groups
                      </Text>
                    </Box>
                  </HStack>
                )}
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>



      {/* Recently Opened Apps Section */}
      {recentApps.length > 0 && (
        <Box mt={3} display="none">
          <Heading as="h2" size="sm" mb={2} color="gray.700">
            Recently Opened
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
            {recentApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                colors={colors}
                handleAppClick={handleAppClick}
                onPreview={handlePreviewPersonnel}
                small
              />
            ))}
          </SimpleGrid>
        </Box>
      )}

      <>
        {/* Search Results vs Categorized Apps */}
        {searchQuery && filteredApps.length > 0 ? (
          <Box
            mt={{ base: 3, md: 4 }}
            bg={sectionPanelBg}
            border="1px solid"
            borderColor={sectionPanelBorder}
            borderRadius="3xl"
            p={{ base: 3, md: 4 }}
            boxShadow={sectionPanelShadow}
            backdropFilter="blur(10px)"
          >
            {renderSectionHeader("Search Results", filteredApps.length)}
            <SimpleGrid
              columns={{ base: 2, sm: 3, md: 4, xl: 5, "2xl": 6 }}
              spacing={{ base: 3, md: 4 }}
            >
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  colors={colors}
                  handleAppClick={handleAppClick}
                  onPreview={handlePreviewPersonnel}
                />
              ))}
            </SimpleGrid>
          </Box>
        ) : (
          <>
            {shouldEnableDragDrop ? (
              <DragDropContext
                onDragEnd={(result) => {
                  const { source, destination } = result;
                  if (!destination) return;
                  if (source.droppableId !== destination.droppableId) return;
                  handleDragEnd(result, source.droppableId);
                }}
              >
                {visibleAppTypeSections.map((section) => {
                  const appsForType = section.apps;
                  return (
                    <Box
                      key={section.id}
                      mt={{ base: 3, md: 4 }}
                      bg={sectionPanelBg}
                      border="1px solid"
                      borderColor={sectionPanelBorder}
                      borderRadius="3xl"
                      p={{ base: 3, md: 4 }}
                      boxShadow={sectionPanelShadow}
                      backdropFilter="blur(10px)"
                    >
                      {renderSectionHeader(section.name, appsForType.length)}

                      <Droppable
                        droppableId={section.name}
                        direction="horizontal"
                      >
                        {(provided) => (
                          <SimpleGrid
                            columns={{ base: 2, sm: 3, md: 4, xl: 5, "2xl": 6 }}
                            spacing={{ base: 3, md: 4 }}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {appsForType.map((app, index) => (
                              <Draggable
                                key={app.id}
                                draggableId={app.id.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <AppCard
                                      key={app.id}
                                      app={app}
                                      colors={colors}
                                      handleAppClick={handleAppClick}
                                      onPreview={handlePreviewPersonnel}
                                    />
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </SimpleGrid>
                        )}
                      </Droppable>
                    </Box>
                  );
                })}
              </DragDropContext>
            ) : (
              <>
                {visibleAppTypeSections.map((section) => {
                  const appsForType = section.apps;
                  return (
                    <Box
                      key={section.id}
                      mt={{ base: 3, md: 4 }}
                      bg={sectionPanelBg}
                      border="1px solid"
                      borderColor={sectionPanelBorder}
                      borderRadius="3xl"
                      p={{ base: 3, md: 4 }}
                      boxShadow={sectionPanelShadow}
                      backdropFilter="blur(10px)"
                    >
                      {renderSectionHeader(section.name, appsForType.length)}

                      <SimpleGrid
                        columns={{ base: 2, sm: 3, md: 4, xl: 5, "2xl": 6 }}
                        spacing={{ base: 3, md: 4 }}
                      >
                        {appsForType.map((app) => (
                          <AppCard
                            key={app.id}
                            app={app}
                            colors={colors}
                            handleAppClick={handleAppClick}
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </>
            )}
          </>

        )}

      </>

      {/* Recent Login Logs Section (lazy-loaded) */}
      <Box mt={4} mx="auto" px={0} width="100%" maxW="100%">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          mb={3}
          gap={3}
        >
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Icon as={FiActivity} color="orange.400" boxSize={4} />
              <Heading
                as="h4"
                size="sm"
                color={sectionTitleColor}
                fontWeight="bold"
              >
                Recent Activity
              </Heading>
            </HStack>
            <Text fontSize="xs" color={sectionSubText}>
              User access logs from the last 24 hours.
            </Text>
          </VStack>

          <Button
            size="sm"
            leftIcon={<Icon as={showLogins ? FiMoon : FiActivity} />}
            colorScheme="orange"
            variant="subtitle"
            bg={showLogins ? "orange.50" : "transparent"}
            color={showLogins ? "orange.600" : "gray.500"}
            fontSize="xs"
            fontWeight="bold"
            borderRadius="full"
            onClick={() => setShowLogins((v) => !v)}
            _hover={{ bg: "orange.50", color: "orange.600" }}
          >
            {showLogins ? "Hide" : "Show Recent Activity"}
          </Button>
        </Flex>

        {showLogins && (
          <>
            <InputGroup size="sm" mb={3} maxW={{ base: "100%", sm: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Filter by user..."
                variant="filled"
                bg={recentActivityInputBg}
                _hover={{ bg: recentActivityInputHoverBg }}
                _focus={{ bg: "white", borderColor: "orange.400", boxShadow: "0 0 0 1px #ED8936" }}
                borderRadius="full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Box
              bg={recentActivityBoxBg}
              borderRadius="2xl"
              boxShadow="xl"
              border="1px solid"
              borderColor={recentActivityBorderColor}
              overflow="hidden"
            >
              {filteredAudits.length === 0 ? (
                <Text
                  color="gray.500"
                  textAlign="center"
                  py={6}
                  fontSize="sm"
                >
                  No login records found.
                </Text>
              ) : (
                <>
                  <Table variant="simple" size="sm">
                    <Thead bg={recentActivityTheadBg}>
                      <Tr>
                        <Th py={2} color="gray.400" fontSize="xs">User</Th>
                        <Th py={2} color="gray.400" fontSize="xs">Device & OS</Th>
                        <Th py={2} color="gray.400" fontSize="xs">Browser</Th>
                        <Th py={2} color="gray.400" fontSize="xs" textAlign="right">Last Active</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAudits
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((log, idx) => (
                          <Tr
                            key={log.id || idx}
                            _hover={{ bg: recentActivityRowHoverBg }}
                            transition="all 0.2s"
                          >
                            <Td py={2}>
                              <HStack spacing={2}>
                                <Avatar size="xs" name={log.user?.username} src={log.user?.avatar ? `${API_URL}${log.user.avatar}` : ""} />
                                <Text fontWeight="bold" color={recentActivityTextColor}>
                                  {log.user?.username || "—"}
                                </Text>
                              </HStack>
                            </Td>
                            <Td py={2}>
                              <HStack spacing={2}>
                                <Icon
                                  as={log.device?.toLowerCase().includes('mobile') ? FiSmartphone : FiMonitor}
                                  color="blue.400"
                                  boxSize={3}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="xs" fontWeight="bold">{(log.device && log.device.length > 20) ? log.device.substring(0, 20) + "..." : log.device || "—"}</Text>
                                  <Text fontSize="10px" color="gray.500">{log.os || "—"}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td py={2}>
                              <HStack spacing={2}>
                                <Icon as={FiGlobe} color="teal.400" boxSize={3} />
                                <Text fontSize="xs">{log.browser || "—"}</Text>
                              </HStack>
                            </Td>
                            <Td py={2} textAlign="right">
                              <VStack align="end" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold">
                                  {log.login_time ? moment(log.login_time).format("MMM DD, h:mm a") : "—"}
                                </Text>
                                <Text fontSize="10px" color="gray.400">
                                  {log.login_time ? moment(log.login_time).fromNow() : ""}
                                </Text>
                              </VStack>
                            </Td>

                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                  {filteredAudits.length > itemsPerPage && (
                    <Flex
                      justify="space-between"
                      align="center"
                      px={4}
                      py={2}
                      bg={recentActivityTheadBg}
                      borderTop="1px solid"
                      borderColor={recentActivityBorderColor}
                    >
                      <Text fontSize="xs" color={sectionSubText}>
                        Page {currentPage} of {Math.ceil(filteredAudits.length / itemsPerPage)}
                      </Text>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FiChevronLeft />}
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          isDisabled={currentPage === 1}
                          aria-label="Previous Page"
                          variant="ghost"
                        />
                        <IconButton
                          icon={<FiChevronRight />}
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredAudits.length / itemsPerPage), p + 1))}
                          isDisabled={currentPage === Math.ceil(filteredAudits.length / itemsPerPage)}
                          aria-label="Next Page"
                          variant="ghost"
                        />
                      </HStack>
                    </Flex>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Box>


      {/* Modal for App Info */}
      {
        selectedApp && (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit {selectedApp.name}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box>
                  <Text mb={2}>App Name</Text>
                  <Input
                    name="name"
                    value={updatedApp.name || ""}
                    onChange={(e) =>
                      setUpdatedApp((prev) => ({ ...prev, name: e.target.value }))
                    }
                    mb={4}
                    placeholder="App Name"
                  />

                  <Text mb={2}>Description</Text>
                  <Input
                    name="description"
                    value={updatedApp.description || ""}
                    onChange={(e) =>
                      setUpdatedApp((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    mb={4}
                    placeholder="App Description"
                  />

                  <Text mb={2}>URL</Text>
                  <Input
                    name="url"
                    value={updatedApp.url || ""}
                    onChange={(e) =>
                      setUpdatedApp((prev) => ({ ...prev, url: e.target.value }))
                    }
                    mb={4}
                    placeholder="App URL"
                  />

                  <Text mb={2}>App Icon</Text>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUpdatedApp((prev) => ({
                          ...prev,
                          icon: reader.result,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    mb={4}
                  />
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )
      }

      {/* Personnel Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={handleClosePreview} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("gray.50", "gray.900")}>
          <ModalHeader>
            Personnel Details
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={0}>
            {previewPersonnelId && <PersonnelPreview personnelId={previewPersonnelId} inModal={true} isSidebarOpen={isSidebarExpanded} />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClosePreview} colorScheme="blue">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}



// Memoized AppCard to avoid unnecessary re-renders
const AppCard = React.memo(function AppCard({
  app,
  colors,
  handleAppClick,
  small,
  onPreview, // Receive onPreview handler
}) {
  const navigate = useNavigate();
  const isFileData = app.generated_code && app.filename;
  // Use app.type if available, otherwise fallback to extension check
  const isPhoneDirectory = app.type === "phone_directory" || (app.name && app.extension);
  const { hasPermission } = usePermissionContext();
  const appCardBg = useColorModeValue("rgba(255, 255, 255, 0.86)", "rgba(26, 32, 44, 0.86)");
  const appCardHoverBg = useColorModeValue("white", "gray.800");
  const appCardBorder = useColorModeValue("rgba(226, 232, 240, 0.9)", "rgba(74, 85, 104, 0.85)");
  const appCardShadow = useColorModeValue(
    "0 8px 22px rgba(15, 23, 42, 0.04)",
    "0 10px 24px rgba(0, 0, 0, 0.28)"
  );
  const appCardHoverShadow = useColorModeValue(
    "0 16px 36px rgba(249, 115, 22, 0.14)",
    "0 18px 38px rgba(0, 0, 0, 0.38)"
  );
  const iconShellBg = useColorModeValue(
    "linear(to-br, orange.50, white)",
    "linear(to-br, gray.700, gray.800)"
  );
  const iconShellBorder = useColorModeValue("orange.100", "whiteAlpha.200");
  const fileChipBg = useColorModeValue("orange.50", "whiteAlpha.100");

  // Check if it's a valid personnel record
  const isPersonnel = !!app.personnel_id;

  const isClickable =
    isPersonnel ||
    (!isFileData && !isPhoneDirectory) ||
    (isFileData && hasPermission("atgfile.view") && !isPhoneDirectory);

  const handleClick = (e) => {
    if (!isClickable) return;

    e.preventDefault();
    if (handleAppClick) {
      handleAppClick(app);
    }

    if (isPersonnel) {
      // Call the onPreview handler instead of opening a new window
      if (onPreview) {
        onPreview(app.personnel_id);
      }
      return;
    }

    const targetUrl = app.url;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    }
  };

  return isPhoneDirectory ? (
    // Phone Directory Layout
    <VStack
      as="div"
      bg={appCardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={appCardBorder}
      p={small ? 2 : 3}
      spacing={small ? 1 : 1.5}
      boxShadow={appCardShadow}
      align="center"
      textAlign="center"
      width={small ? "120px" : "100%"}
      height={small ? "80px" : { base: "140px", md: "156px" }}
      overflow="hidden"
      position="relative"
      justify="center"
      transition="transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease"
      onClick={handleClick}
      cursor={isClickable ? "pointer" : "default"}
      _after={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 4,
        right: 4,
        h: "2px",
        bgGradient: "linear(to-r, orange.300, yellow.300)",
        borderRadius: "full",
        opacity: 0.85,
      }}
      _hover={
        isClickable
          ? {
            transform: "translateY(-4px)",
            boxShadow: appCardHoverShadow,
            borderColor: "orange.200",
            bg: appCardHoverBg,
          }
          : {}
      }
    >
      {/* Avatar */}
      <Box
        bgGradient={iconShellBg}
        border="1px solid"
        borderColor={iconShellBorder}
        borderRadius="full"
        p={1}
        boxShadow="sm"
        mb={small ? 1 : 2}
      >
        <Image
          src={
            app.avatar
              ? `${process.env.REACT_APP_API_URL}${app.avatar}`
              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt={app.name}
          boxSize={small ? "32px" : "44px"}
          borderRadius="full"
          display="block"
        />
      </Box>

      {/* Name & Extension */}
      <VStack spacing={0.5}>
        <Text
          fontSize={small ? "xs" : "sm"}
          fontWeight="bold"
          color={colors.cardHeader}
          noOfLines={1}
        >
          {app.name}
        </Text>
        <Text fontSize="xs" color={colors.cardText} noOfLines={1}>
          <strong>Extension:</strong>{" "}
          {app.extension && app.extension.trim() !== ""
            ? app.extension
            : "N/A"}
        </Text>
        <Text fontSize="xs" color={colors.cardText} noOfLines={1}>
          <strong>DECT:</strong>{" "}
          {app.dect_number && app.dect_number.trim() !== ""
            ? app.dect_number
            : "N/A"}
        </Text>
      </VStack>
    </VStack>
  ) : (
    // Regular App Layout
    <VStack
      as="div"
      bg={appCardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={appCardBorder}
      p={small ? 2 : 3}
      spacing={small ? 1 : 1.5}
      boxShadow={appCardShadow}
      position="relative"
      justify="center"
      transition="transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease"
      _after={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 4,
        right: 4,
        h: "2px",
        bgGradient: "linear(to-r, orange.300, yellow.300)",
        borderRadius: "full",
        opacity: 0.85,
      }}
      _hover={
        isClickable
          ? {
            transform: "translateY(-4px)",
            boxShadow: appCardHoverShadow,
            borderColor: "orange.200",
            bg: appCardHoverBg,
          }
          : {}
      }
      align="center"
      textAlign="center"
      width={small ? "120px" : "100%"}
      height={small ? "80px" : { base: "140px", md: "156px" }}
      overflow="hidden"
      onClick={handleClick}
      cursor={isClickable ? "pointer" : "not-allowed"}
    >
      {/* App Icon */}
      {app.thumbnail_url ? (
        <Box
          minW={small ? "40px" : "54px"}
          maxW={small ? "40px" : "54px"}
          h={small ? "40px" : "54px"}
          overflow="hidden"
          borderRadius="full"
          boxShadow="sm"
          border="1px solid"
          borderColor={iconShellBorder}
          bgGradient={iconShellBg}
          p={1}
          mb={small ? 1 : 2}
        >
          <Image
            src={app.thumbnail_url}
            alt="File Thumbnail"
            objectFit="cover"
            w="100%"
            h="100%"
            borderRadius="full"
          />
        </Box>
      ) : app.icon ? (
        <Box
          minW={small ? "40px" : "54px"}
          maxW={small ? "40px" : "54px"}
          h={small ? "40px" : "54px"}
          borderRadius="full"
          overflow="hidden"
          boxShadow="sm"
          border="1px solid"
          borderColor={iconShellBorder}
          bgGradient={iconShellBg}
          p={1}
          mb={small ? 1 : 2}
        >
          <Image
            src={app.icon}
            alt={`${app.name} Icon`}
            boxSize="100%"
            objectFit="cover"
            borderRadius="full"
            display="block"
          />
        </Box>
      ) : (
        <Box
          minW={small ? "40px" : "54px"}
          maxW={small ? "40px" : "54px"}
          h={small ? "40px" : "54px"}
          borderRadius="full"
          display="grid"
          placeItems="center"
          border="1px solid"
          borderColor={iconShellBorder}
          bgGradient={iconShellBg}
          boxShadow="sm"
          mb={small ? 1 : 2}
        >
          <Icon as={FiFile} boxSize={small ? 6 : 8} color="orange.500" />
        </Box>
      )}

      {/* App Name and Description */}
      <Box width="100%" px={1}>
        <Text
          fontSize={small ? "10px" : "sm"}
          fontWeight="bold"
          color={colors.cardHeader}
          noOfLines={2}
        >
          {app.name}
        </Text>

        {isFileData ? (
          hasPermission("atgfile.view") ? (
            <Box
              mt={2}
              p={2}
              borderRadius="lg"
              boxShadow="sm"
              bg={fileChipBg}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Box>
                <Text fontSize="xs" fontWeight="bold" color={colors.cardText} noOfLines={1}>
                  {app.filename}
                </Text>
                <Text fontSize="10px" color="gray.600" noOfLines={1}>
                  <strong>Generated Code:</strong> {app.generated_code}
                </Text>
              </Box>
            </Box>
          ) : (
            <Text fontSize="xs" color={colors.cardText}>
              No Files Found
            </Text>
          )
        ) : null}

        {!small && !isFileData && (
          <Text fontSize="xs" color={colors.cardText} noOfLines={2}>
            {app.description}
          </Text>
        )}
      </Box>
    </VStack>
  );
});

// Memoized AppCard for performance
const AppCard1 = React.memo(function AppCard({
  app,
  colors,
  handleAppClick,
  small = false,
}) {
  const isFileData = app.generated_code && app.filename;
  const isPhoneDirectory = app.name && app.extension;
  const { hasPermission } = usePermissionContext();
  const cardShadow = useColorModeValue(
    "0 10px 24px rgba(15, 23, 42, 0.08)",
    "0 12px 24px rgba(0, 0, 0, 0.45)"
  );
  const activeBg = useColorModeValue("gray.50", "gray.700");

  // Define fixed dimensions for the card container
  const CARD_DIMENSIONS = {
    w: "100%",
    h: small ? "120px" : { base: "180px", md: "200px" },
  };

  // Define Icon/Avatar size
  const ICON_SIZE = small ? "40px" : "70px";

  const isClickable =
    !isFileData || (hasPermission("atgfile.view") && !isPhoneDirectory);

  // Determine if this should be a link
  const isLink = isClickable && app.url;

  const handleClick = (e) => {
    if (!isClickable) {
      e.preventDefault();
      return;
    }

    // Track recent apps
    if (handleAppClick) {
      handleAppClick(app);
    }

    // If it's a link, let the browser handle the navigation naturally.
    if (!app.url) {
      e.preventDefault();
    }
  };

  // Helper function for rendering the icon/avatar
  const renderIcon = () => {
    // 1. Phone Directory/Personnel Avatar
    if (isPhoneDirectory) {
      return (
        <Image
          src={
            app.avatar
              ? `${process.env.REACT_APP_API_URL}${app.avatar}`
              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt={app.name}
          boxSize={ICON_SIZE}
          borderRadius="full"
          mb={small ? 1 : 2}
          boxShadow="md"
          draggable={false}
        />
      );
    }
    // 2. Thumbnail/Custom Icon/Default Icon (Unified Logic)
    if (app.thumbnail_url || app.icon) {
      const src = app.thumbnail_url || app.icon;
      return (
        <Image
          src={src}
          alt={app.name}
          boxSize={ICON_SIZE}
          borderRadius="full"
          mb={small ? 1 : 2}
          boxShadow="md"
          border="2px solid"
          borderColor={colors.cardBorder}
          draggable={false}
        />
      );
    }
    return <Icon as={FiFile} boxSize={small ? 8 : 10} color={colors.cardHeader} mb={small ? 1 : 2} />;
  };


  // --- Unified Card Container ---
  // --- Unified Card Container ---
  // --- Unified Card Container ---
  const CardContainer = ({ children }) => (
    <Box
      as={isLink ? "a" : "div"}
      href={isLink ? app.url : undefined}
      target={isLink ? "_blank" : undefined}
      rel={isLink ? "noopener noreferrer" : undefined}

      // APPLY FIXED/MAX DIMENSIONS
      width={CARD_DIMENSIONS.w}
      height={CARD_DIMENSIONS.h}

      // Interaction
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-disabled={!isClickable}

      onClick={(e) => {
        if (!isClickable) {
          e.preventDefault();
          return;
        }

        // 1. Track the click (State Update)
        if (handleAppClick) {
          handleAppClick(app);
        }

        // 2. Handle Navigation or Custom Logic
        if (isLink) {
          // Force manual navigation to ensure reliability.
          // This avoids issues where state updates might unmount/change the link before it actuates.
          e.preventDefault();
          window.open(app.url, '_blank', 'noopener,noreferrer');
        } else {
          // Fallback for non-link cards
          e.preventDefault();
          handleClick(e);
        }
      }}

      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault(); // Prevent default scrolling/action

          if (handleAppClick) handleAppClick(app);

          if (isLink) {
            window.open(app.url, '_blank', 'noopener,noreferrer');
          } else {
            handleClick(event);
          }
        }
      }}
      cursor={isClickable ? "pointer" : "not-allowed"}
      style={{
        textDecoration: 'none',
        // Optimizations for touch
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Prevent text selection on the card which can block clicks
        userSelect: 'none',
        WebkitUserSelect: 'none',
        display: 'block'
      }}

      // Hover styles
      _hover={isClickable ? {
        "& > div": {
          borderColor: "orange.300",
          boxShadow: "lg",
        }
      } : {}}

      // Active state
      _active={isClickable ? {
        "& > div": {
          borderColor: "orange.400",
          bg: activeBg,
          boxShadow: "sm"
        }
      } : {}}
    >
      <VStack
        // Visual Card
        height="100%"
        width="100%"
        bg={colors.appBg}
        borderRadius="xl"
        border={`1px solid ${colors.cardBorder}`}
        p={small ? 2 : 4}
        spacing={small ? 1 : 2}
        boxShadow={cardShadow}
        align="center"
        justify="center"
        textAlign="center"
        // Ignore pointer events on children to ensure single hit target
        pointerEvents="none"
      >
        {children}
      </VStack>
    </Box>
  );


  // --- Final Rendering ---
  return (
    <CardContainer>

      {renderIcon()}

      {/* Name and Primary Information */}
      <VStack spacing={0} maxWidth="100%">
        <Text
          fontSize={small ? "sm" : "lg"}
          fontWeight="bold"
          color={colors.cardHeader}
          noOfLines={1}
          title={app.name}
        >
          {app.name}
        </Text>

        {/* --- Phone Directory Details --- */}
        {isPhoneDirectory && (
          <VStack spacing={0} fontSize="xs" color={colors.cardText}>
            {app.extension && (
              <Text>Ext: {app.extension}</Text>
            )}
            {app.dect_number && (
              <Text>DECT: {app.dect_number.trim() !== "" ? app.dect_number : "N/A"}</Text>
            )}
          </VStack>
        )}
        {/* --- File Data Details --- */}
        {isFileData && hasPermission("atgfile.view") && (
          <Text fontSize="xs" color={colors.cardText} mt={1} noOfLines={1}>
            Code: {app.generated_code || 'N/A'}
          </Text>
        )}

        {/* --- App Description --- */}
        {!isFileData && !isPhoneDirectory && !small && (
          <Text fontSize="sm" color={colors.cardText} noOfLines={2} mt={1}>
            {app.description}
          </Text>
        )}
      </VStack>

    </CardContainer>
  );
});
