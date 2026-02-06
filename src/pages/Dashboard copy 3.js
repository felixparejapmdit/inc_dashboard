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
import {
  Box,
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
} from "react-icons/fi";

import { useDisclosure } from "@chakra-ui/react";


import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAuthHeaders } from "../utils/apiHeaders";
import { fetchData } from "../utils/fetchData";
import { usePermissionContext } from "../contexts/PermissionContext";
import { useDebounce } from "use-debounce";

const API_URL = process.env.REACT_APP_API_URL;



// Simple cache config for apps
const APPS_CACHE_KEY = "categorizedApps";
const APPS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function Dashboard() {
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

  const [compactGreeting, setCompactGreeting] = useState(false);
  const lastScrollTop = useRef(0);

  // Login audit state + lazy-load control
  const [loginAudits, setLoginAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogins, setShowLogins] = useState(false);
  const [hasLoadedLogins, setHasLoadedLogins] = useState(false);

  // Hook values moved to top level to avoid conditional constraints
  const inputBg = useColorModeValue("white", "gray.700");
  const iconHoverBg = useColorModeValue("orange.100", "whiteAlpha.200");


  useEffect(() => {
    // We only need the date (not a ticking clock), so just set it once
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;

          // Hysteresis logic to prevent flickering
          // Switch to compact mode if scrolled down significantly (> 80px)
          if (scrollTop > 80 && scrollTop > lastScrollTop.current) {
            setCompactGreeting(true);
          }
          // Switch back to full mode only if near the top (< 20px) and scrolling up
          else if (scrollTop < lastScrollTop.current && scrollTop <= 20) {
            setCompactGreeting(false);
          }

          lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
          ticking = false;
        });
        ticking = true;
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
  const shouldEnableDragDrop = !isMobile || isMobileDragEnabled;

  const colors = useMemo(() => ({
    reminderBg: colorMode === "light" ? "orange.100" : "orange.700",
    eventBg: colorMode === "light" ? "teal.100" : "teal.700",
    appBg: colorMode === "light" ? "gray.90" : "gray.800",
    cardText: colorMode === "light" ? "gray.700" : "white",
    cardHeader: colorMode === "light" ? "gray.600" : "gray.300",
    cardBorder: colorMode === "light" ? "gray.300" : "gray.700",
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
    console.log("Constructed Fetch URL:", url);

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


          {compactGreeting ? (
            <>
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

              <Box
                bgGradient="linear(to-r, orange.400, yellow.300)"
                borderRadius="xl"
                px={4}
                py={2}
                textAlign="left"
                boxShadow="xl"
                transition="all 0.4s ease"
                display="flex"
                alignItems="center"
                minW="250px"
                h="100%"
              >
                <Heading as="h1" size="md" color="white">
                  {getTimeBasedGreeting()}
                </Heading>
              </Box>
            </>
          ) : (
            <VStack
              spacing={4}
              align="start"
              width="100%"
              transition="all 0.4s ease"
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

              <Box
                bgGradient="linear(to-r, orange.400, yellow.300)"
                borderRadius="xl"
                p={6}
                textAlign="left"
                boxShadow="xl"
                width="100%"
                transition="all 0.4s ease"
              >
                <Text fontSize="sm" color="whiteAlpha.900">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>

                <Heading as="h1" size="lg" color="white">
                  {getTimeBasedGreeting()}
                </Heading>

                <Text fontSize="md" color="whiteAlpha.800">
                  Have a nice day.
                </Text>
              </Box>
            </VStack>
          )}

          {/* Mode toggle & bell */}
          <HStack spacing={2}>
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
                small
              />
            ))}
          </SimpleGrid>
        </Box>
      )}

      <>
        {/* Search Results vs Categorized Apps */}
        {searchQuery && filteredApps.length > 0 ? (
          <Box mt={6}>
            <Heading as="h2" size="lg" mb={4} color="gray.700">
              Search Results
            </Heading>
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={6}
            >
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  colors={colors}
                  handleAppClick={handleAppClick}
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
                  return (
                    <Box key={type.id} mt={6}>
                      <Heading
                        as="h2"
                        size="lg"
                        mb={4}
                        display="flex"
                        alignItems="center"
                      >
                        <FiGrid
                          style={{ marginRight: "8px", color: "#F3C847" }}
                        />
                        {type.name}
                      </Heading>

                      {appsForType.length > 0 ? (
                        <Droppable
                          droppableId={type.name}
                          direction="horizontal"
                        >
                          {(provided) => (
                            <SimpleGrid
                              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                              spacing={6}
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
                                      />
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </SimpleGrid>
                          )}
                        </Droppable>
                      ) : (
                        <Text fontSize="sm" color="gray.500" ml={2}>
                          No application assigned
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </DragDropContext>
            ) : (
              <>
                <Text fontSize="md" color="gray.500">
                  Drag & Drop is disabled for mobile.
                </Text>

                {appTypes.map((type) => {
                  const appsForType = categorizedApps[type.name] || [];
                  return (
                    <Box key={type.id} mt={6}>
                      <Heading
                        as="h2"
                        size="lg"
                        mb={4}
                        display="flex"
                        alignItems="center"
                      >
                        <FiGrid
                          style={{ marginRight: "8px", color: "#F3C847" }}
                        />
                        {type.name}
                      </Heading>

                      {appsForType.length > 0 ? (
                        <SimpleGrid
                          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                          spacing={6}
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
                      ) : (
                        <Text fontSize="sm" color="gray.500" ml={2}>
                          No application assigned
                        </Text>
                      )}
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
            <Box key={category} mt={6}>
              <Heading
                as="h2"
                size="lg"
                mb={4}
                display="flex"
                alignItems="center"
              >
                <FiGrid style={{ marginRight: "8px", color: "#F3C847" }} />
                {category}
              </Heading>

              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing={6}
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
        <HStack justify="space-between" align="center" mb={4}>
          <Heading
            as="h4"
            size={{ base: "md", md: "lg" }}
            bgGradient="linear(to-r, orange.400, yellow.300)"
            bgClip="text"
            fontWeight="extrabold"
            userSelect="none"
          >
            Recent Login Activity
          </Heading>
          <Button
            size="sm"
            colorScheme="orange"
            variant="outline"
            onClick={() => setShowLogins((v) => !v)}
          >
            {showLogins ? "Hide" : "Show"} Recent Activity
          </Button>
        </HStack>

        {showLogins && (
          <>
            <InputGroup mb={6} maxW={{ base: "100%", sm: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                _focus={{
                  borderColor: "orange.400",
                  boxShadow: "0 0 0 2px #ED8936",
                }}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                fontSize={{ base: "sm", md: "md" }}
                width="100%"
              />
            </InputGroup>

            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="xl"
              overflowX="auto"
              p={{ base: 4, md: 6 }}
              maxH="300px"
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
                <Table
                  variant="unstyled"
                  size="sm"
                  minWidth="700px"
                  sx={{
                    "thead tr": {
                      backgroundColor: "orange.400",
                    },
                    "thead th": {
                      color: "white",
                      fontWeight: "bold",
                      borderBottom: "none",
                      userSelect: "none",
                      position: "sticky",
                      top: -7,
                      zIndex: 10,
                      px: { base: 3, md: 6 },
                      py: { base: 2, md: 3 },
                      fontSize: { base: "xs", md: "sm" },
                      whiteSpace: "nowrap",
                      backgroundColor: "orange.400",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
                    },
                    "tbody tr": {
                      bg: "white",
                      transition: "background-color 0.3s ease",
                    },
                    "tbody tr:hover": {
                      bg: "gray.50",
                      cursor: "pointer",
                    },
                    "tbody td": {
                      px: { base: 3, md: 6 },
                      py: { base: 2, md: 3 },
                      borderBottom: "1px solid #E2E8F0",
                      color: "gray.700",
                      fontSize: { base: "xs", md: "sm" },
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>User</Th>
                      <Th>Device</Th>
                      <Th>OS</Th>
                      <Th>Browser</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAudits.map((log, idx) => (
                      <Tr key={log.id || idx}>
                        <Td
                          fontWeight="semibold"
                          color="gray.600"
                          whiteSpace="nowrap"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {idx + 1}
                        </Td>
                        <Td>{log.user?.username || "—"}</Td>
                        <Td>{log.device || "—"}</Td>
                        <Td>{log.os || "—"}</Td>
                        <Td>{log.browser || "—"}</Td>
                        <Td>
                          {log.login_time
                            ? new Date(
                              log.login_time
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }) +
                            " " +
                            new Date(log.login_time)
                              .toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .toLowerCase()
                            : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
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
    </Box >
  );
}

// Memoized AppCard to avoid unnecessary re-renders
const AppCard1 = React.memo(function AppCard({
  app,
  colors,
  handleAppClick,
  small,
}) {
  const isFileData = app.generated_code && app.filename;
  const isPhoneDirectory = app.name && app.extension;
  const { hasPermission } = usePermissionContext();

  const isClickable =
    !isFileData || (hasPermission("atgfile.view") && !isPhoneDirectory);

  const handleClick = (e) => {
    if (!isClickable) return;
    e.preventDefault();
    if (handleAppClick) {
      handleAppClick(app);
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
      cursor="default"
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
const AppCard = React.memo(function AppCard({
  app,
  colors,
  handleAppClick,
  small = false,
}) {
  const isFileData = app.generated_code && app.filename;
  const isPhoneDirectory = app.name && app.extension;
  const { hasPermission } = usePermissionContext();

  // Define fixed dimensions for the card container
  const CARD_DIMENSIONS = {
    // CRITICAL FIX: Ensure width is responsive but constrained
    w: { base: "100%", sm: small ? "120px" : "200px" },
    // CRITICAL FIX: Define fixed height for all cards
    h: small ? "120px" : "200px",
  };

  // Define Icon/Avatar size
  const ICON_SIZE = small ? "40px" : "70px";

  const isClickable =
    !isFileData || (hasPermission("atgfile.view") && !isPhoneDirectory);

  const handleClick = (e) => {
    if (!isClickable) return;
    e.preventDefault();
    if (handleAppClick) {
      handleAppClick(app);
    }
    const targetUrl = app.url;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
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
        />
      );
    }
    return <Icon as={FiFile} boxSize={small ? 8 : 10} color={colors.cardHeader} mb={small ? 1 : 2} />;
  };


  // --- Unified Card Container ---
  const CardContainer = ({ children }) => (
    <VStack
      as="div"
      bg={colors.appBg}
      borderRadius="xl"
      border={`3px solid ${colors.cardBorder}`}
      p={small ? 2 : 4}
      spacing={small ? 1 : 2}
      boxShadow="md"
      align="center"
      textAlign="center"
      justifyContent="center" // CRITICAL: Center content vertically

      // APPLY FIXED/MAX DIMENSIONS HERE
      width={CARD_DIMENSIONS.w}
      minHeight={CARD_DIMENSIONS.h}
      maxHeight={CARD_DIMENSIONS.h}
      flexShrink={0}

      // Fixes the zoom loop issue
      transition="transform 0.2s ease-out"

      _hover={
        isClickable
          ? { transform: "scale(1.02)", boxShadow: "xl" }
          : {}
      }
      onClick={handleClick}
      cursor={isClickable ? "pointer" : "not-allowed"}
    >
      {children}
    </VStack>
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
          <Text fontSize="xs" color="gray.600" mt={1} noOfLines={1}>
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