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
  FiSun,
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
import { motion, AnimatePresence } from "framer-motion";

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
  const { colorMode, toggleColorMode } = useColorMode();

  const [filteredApps, setFilteredApps] = useState([]);

  const navigate = useNavigate();

  const [isMobileDragEnabled, setIsMobileDragEnabled] = useState(false);
  const isDragEnabled = false;

  const [compactGreeting, setCompactGreeting] = useState(false);
  const lastScrollTop = useRef(0);

  // Login audit state + lazy-load control
  const [loginAudits, setLoginAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogins, setShowLogins] = useState(false);
  const [hasLoadedLogins, setHasLoadedLogins] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;



  // Hook values moved to top level to avoid conditional constraints
  const inputBg = useColorModeValue("white", "gray.700");
  const iconHoverBg = useColorModeValue("orange.100", "whiteAlpha.200");
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

  const renderSectionHeader = (title, count) => {
    const badgeLabel = count ? `${count} apps` : "No apps";
    return (
      <HStack
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        spacing={3}
      >
        <HStack spacing={3}>
          <Box
            bg={sectionIconBg}
            color="white"
            p={2}
            borderRadius="lg"
            boxShadow="md"
          >
            <FiGrid />
          </Box>
          <VStack align="start" spacing={0}>
            <Heading as="h2" size="md" color={sectionTitleColor}>
              {title}
            </Heading>
            <Text fontSize="xs" color={sectionSubText}>
              {count} {count === 1 ? "application" : "applications"}
            </Text>
          </VStack>
        </HStack>
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
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
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Use a single threshold with a buffer to prevent flickering
      // Switch to compact if > 80px, switch back if < 30px
      if (scrollTop > 80) {
        setCompactGreeting((prev) => (prev !== true ? true : prev));
      } else if (scrollTop < 30) {
        setCompactGreeting((prev) => (prev !== false ? false : prev));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <Box bg={useColorModeValue("white.50", "gray.900")} minH="100vh" p={6}>
      {/* Sticky Header Section */}
      <Box
        position="sticky"
        top="0"
        zIndex="1000"
        boxShadow="sm"
        bg={useColorModeValue("white", "gray.800")}
        px={4}
        py={2}
      >
        <HStack
          justify="space-between"
          align="start"
          spacing={4}
          transition="all 0.4s ease"
          flexWrap="wrap"
        >

          <Flex
            direction={compactGreeting ? "row" : "column"}
            align={compactGreeting ? "center" : "start"}
            justify={compactGreeting ? "center" : "flex-start"}
            flex="1"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            gap={4}
            width="100%"
          >
            <Input
              data-tour="search-bar"
              placeholder="Search"
              size="md"
              borderRadius="full"
              bg={inputBg}
              maxW="300px"
              value={searchQuery}
              onChange={handleSearchInput}
              boxShadow="md"
              transition="all 0.4s ease"
            />

            <motion.div
              layout
              style={{ width: compactGreeting ? "auto" : "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Box
                bgGradient="linear(to-r, orange.400, yellow.300)"
                borderRadius="xl"
                p={compactGreeting ? 3 : 6}
                px={compactGreeting ? 5 : 6}
                textAlign="left"
                boxShadow="xl"
                width="100%"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                minH={compactGreeting ? "60px" : "150px"}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                willChange="min-height, padding"
              >
                <AnimatePresence mode="wait">
                  {!compactGreeting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Text fontSize="sm" color="whiteAlpha.900" mb={1}>
                        {currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Heading
                  as="h1"
                  size={compactGreeting ? "sm" : "lg"}
                  color="white"
                  transition="all 0.3s ease"
                  noOfLines={1}
                >
                  {getTimeBasedGreeting()}
                </Heading>

                <AnimatePresence mode="wait">
                  {!compactGreeting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Text fontSize="md" color="whiteAlpha.800" mt={1}>
                        Have a nice day.
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          </Flex>

          {/* Mode toggle & bell */}
          <HStack spacing={2} alignSelf={compactGreeting ? "center" : "start"} pt={compactGreeting ? 0 : 2}>
            <IconButton
              icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              isRound
              size="lg"
              colorScheme="orange"
              variant="ghost"
              aria-label="Toggle color mode"
              display="none"
              _hover={{ transform: "rotate(20deg)", bg: iconHoverBg }}
            />


          </HStack>
        </HStack>
      </Box>



      {/* Recently Opened Apps Section */}
      {recentApps.length > 0 && (
        <Box mt={6} display="none">
          <Heading as="h2" size="m" mb={4} color="gray.700">
            Recently Opened
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={4}>
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
          <Box mt={{ base: 5, md: 8 }}>
            {renderSectionHeader("Search Results", filteredApps.length)}
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={{ base: 4, md: 6 }}
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
                {appTypes.map((type) => {
                  const appsForType = categorizedApps[type.name] || [];
                  if (appsForType.length === 0) return null;

                  return (
                    <Box key={type.id} mt={{ base: 5, md: 8 }}>
                      {renderSectionHeader(type.name, appsForType.length)}

                      <Droppable
                        droppableId={type.name}
                        direction="horizontal"
                      >
                        {(provided) => (
                          <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                            spacing={{ base: 4, md: 6 }}
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
                {appTypes.map((type) => {
                  const appsForType = categorizedApps[type.name] || [];
                  if (appsForType.length === 0) return null;

                  return (
                    <Box key={type.id} mt={{ base: 5, md: 8 }}>
                      {renderSectionHeader(type.name, appsForType.length)}

                      <SimpleGrid
                        columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                        spacing={{ base: 4, md: 6 }}
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

        {/* 🛡️ Fallback: Explicitly Render "Others" if not in DB types */}
        {!searchQuery && ["Others"].map((category) => {
          const apps = categorizedApps[category];
          if (!apps || apps.length === 0) return null;
          // Skip if it was already rendered via appTypes
          if (appTypes.find((t) => t.name === category)) return null;

          return (
            <Box key={category} mt={{ base: 5, md: 8 }}>
              {renderSectionHeader(category, apps.length)}

              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing={{ base: 4, md: 6 }}
              >
                {apps.map((app) => (
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

      {/* Recent Login Logs Section (lazy-loaded) */}
      <Box mt={6} mx="auto" px={{ base: 4, md: 8 }} width="100%" maxW="100%">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          mb={6}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Icon as={FiActivity} color="orange.400" boxSize={5} />
              <Heading
                as="h4"
                size="md"
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
            <InputGroup size="sm" mb={6} maxW={{ base: "100%", sm: "320px" }}>
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
                  py={10}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  No login records found.
                </Text>
              ) : (
                <>
                  <Table variant="simple" size="sm">
                    <Thead bg={recentActivityTheadBg}>
                      <Tr>
                        <Th py={4} color="gray.400" fontSize="xs">User</Th>
                        <Th py={4} color="gray.400" fontSize="xs">Device & OS</Th>
                        <Th py={4} color="gray.400" fontSize="xs">Browser</Th>
                        <Th py={4} color="gray.400" fontSize="xs" textAlign="right">Last Active</Th>
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
                            <Td py={4}>
                              <HStack spacing={3}>
                                <Avatar size="xs" name={log.user?.username} src={log.user?.avatar ? `${API_URL}${log.user.avatar}` : ""} />
                                <Text fontWeight="bold" color={recentActivityTextColor}>
                                  {log.user?.username || "—"}
                                </Text>
                              </HStack>
                            </Td>
                            <Td py={4}>
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
                            <Td py={4}>
                              <HStack spacing={2}>
                                <Icon as={FiGlobe} color="teal.400" boxSize={3} />
                                <Text fontSize="xs">{log.browser || "—"}</Text>
                              </HStack>
                            </Td>
                            <Td py={4} textAlign="right">
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
                      px={6}
                      py={4}
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
      bg={colors.appBg}
      borderRadius="xl"
      border={`3px solid ${colors.cardBorder}`}
      p={small ? 2 : 6}
      spacing={2}
      boxShadow="md"
      align="center"
      textAlign="center"
      width={small ? "120px" : "100%"}
      minHeight={small ? "80px" : "200px"}
      onClick={handleClick}
      cursor={isClickable ? "pointer" : "default"}
      _hover={
        isClickable
          ? { transform: "scale(1.03)", transition: "all 0.2s ease-in-out" }
          : {}
      }
    >
      {/* Avatar */}
      <Box>
        <Image
          src={
            app.avatar
              ? `${process.env.REACT_APP_API_URL}${app.avatar}`
              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt={app.name}
          boxSize={small ? "40px" : "70px"}
          borderRadius="full"
          mb={3}
          boxShadow="md"
        />
      </Box>

      {/* Name & Extension */}
      <VStack spacing={1}>
        <Text
          fontSize={small ? "sm" : "lg"}
          fontWeight="bold"
          color={colors.cardHeader}
        >
          {app.name}
        </Text>
        <Text fontSize="sm" color={colors.cardText}>
          <strong>Extension:</strong>{" "}
          {app.extension && app.extension.trim() !== ""
            ? app.extension
            : "N/A"}
        </Text>
        <Text fontSize="sm" color={colors.cardText}>
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
      bg={colors.appBg}
      borderRadius="xl"
      border={`3px solid ${colors.cardBorder}`}
      p={small ? 2 : 6}
      spacing={2}
      boxShadow="md"
      _hover={
        isClickable
          ? { transform: "scale(1.03)", transition: "all 0.2s ease-in-out" }
          : {}
      }
      align="center"
      textAlign="center"
      width={small ? "120px" : "100%"}
      minHeight={small ? "80px" : "200px"}
      onClick={handleClick}
      cursor={isClickable ? "pointer" : "not-allowed"}
    >
      {/* App Icon */}
      {app.thumbnail_url ? (
        <Box
          minW={small ? "40px" : "70px"}
          maxW={small ? "40px" : "70px"}
          h={small ? "40px" : "70px"}
          overflow="hidden"
          borderRadius="full"
          boxShadow="md"
          border="2px solid"
          borderColor={colors.cardBorder}
          mb={4}
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
        <Image
          src={app.icon}
          alt={`${app.name} Icon`}
          boxSize={small ? "40px" : "70px"}
          borderRadius="full"
          mb={4}
          boxShadow="md"
          border="2px solid"
          borderColor={colors.cardBorder}
        />
      ) : (
        <Icon as={FiFile} boxSize={12} color={colors.cardHeader} mb={4} />
      )}

      {/* App Name and Description */}
      <Box>
        <Text
          fontSize={small ? "10px" : "xl"}
          fontWeight="bold"
          color={colors.cardHeader}
        >
          {app.name}
        </Text>

        {isFileData ? (
          hasPermission("atgfile.view") ? (
            <Box
              mt={4}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              bg="white"
              display="flex"
              alignItems="center"
              gap={4}
            >
              <Box>
                <Text fontSize="md" fontWeight="bold" color={colors.cardText}>
                  {app.filename}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Generated Code:</strong> {app.generated_code}
                </Text>
              </Box>
            </Box>
          ) : (
            <Text fontSize="sm" color={colors.cardText}>
              No Files Found
            </Text>
          )
        ) : null}

        {!small && !isFileData && (
          <Text fontSize="sm" color={colors.cardText}>
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
