import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  useColorMode, // For dark/light mode toggle
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
  FiMoon, // For sun and moon icons (theme toggle)
} from "react-icons/fi";

import { useDisclosure } from "@chakra-ui/react";
import { PopoverHeader, List } from "@chakra-ui/react";
import Chatbot from "../components/Chatbot"; // Import chatbot
import Tutorial from "../components/Tutorial";

import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate
//import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import axios from "axios";
import { usePermissionContext } from "../contexts/PermissionContext";
// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [appTypes, setAppTypes] = useState([]);

  const { hasPermission } = usePermissionContext(); // Correct usage

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

  const [currentDate, setCurrentDateTime] = useState(new Date());
  const [error, setError] = useState("");
  const [updatedApp, setUpdatedApp] = useState({
    name: "",
    description: "",
    url: "",
    icon: "",
  });
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [currentUser, setCurrentUser] = useState({ name: "User" });
  const [pmdApplications, setPmdApplications] = useState([]);
  const [otherApplications, setOtherApplications] = useState([]);

  const [hoveredEvent, setHoveredEvent] = useState(null); // Hover state for events
  const [hoveredReminder, setHoveredReminder] = useState(null); // Hover state for reminders
  const { colorMode, toggleColorMode } = useColorMode(); // Color mode state
  const [notifications, setNotifications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate

  // ✅ Detect if the screen is mobile-sized
  const [isMobileDragEnabled, setIsMobileDragEnabled] = useState(false);

const [compactGreeting, setCompactGreeting] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop.current && scrollTop > 10) {
        // Scrolling down
        setCompactGreeting(true);
      } else if (scrollTop < lastScrollTop.current && scrollTop <= 10) {
        // Scrolling up to top
        setCompactGreeting(false);
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
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

  const colors = {
    reminderBg: useColorModeValue("orange.100", "orange.700"),
    eventBg: useColorModeValue("teal.100", "teal.700"),
    appBg: useColorModeValue("gray.90", "gray.800"),
    cardText: useColorModeValue("gray.700", "white"),
    cardHeader: useColorModeValue("gray.600", "gray.300"),
    cardBorder: useColorModeValue("gray.300", "gray.700"),
    buttonBg: useColorModeValue("blue.600", "blue.500"),
    buttonHoverBg: useColorModeValue("blue.700", "blue.600"),
  };

  const handleNextcloudLogin = () => {
    const username = localStorage.getItem("username"); // Get logged-in username

    fetch(`${API_URL}/api/nextcloud-login?username=${username}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.nextcloudUrl) {
          window.location.href = data.nextcloudUrl; // Redirect to Nextcloud
        } else {
          console.error("Failed to retrieve Nextcloud login URL");
        }
      })
      .catch((error) => {
        console.error("Error logging in to Nextcloud:", error);
      });
  };

  const [loginAudits, setLoginAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/login-audits/recent`)
      .then((res) => res.json())
      .then((data) => {
        setLoginAudits(data);
      })
      .catch((err) => console.error("Failed to fetch login audits:", err));
  }, [API_URL]);

  // Filter audits by username based on search term (case-insensitive)
  const filteredAudits = useMemo(() => {
    if (!searchTerm.trim()) return loginAudits;
    return loginAudits.filter((log) =>
      log.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loginAudits, searchTerm]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredApps([]); // Reset if empty
      return;
    }

    const filtered = [];
    // Ensure you're filtering both Apps and Files correctly
    for (const category in categorizedApps) {
      const matchingApps = categorizedApps[category].filter((app) => {
        const nameMatch = app.name && app.name.toLowerCase().includes(query); // Check if name exists
        const codeMatch =
          app.generated_code &&
          app.generated_code.toLowerCase().includes(query); // Search in generated_code
        const phoneMatch =
          app.extension && app.extension.toLowerCase().includes(query);
        return nameMatch || codeMatch || phoneMatch;
      });
      if (matchingApps.length > 0) {
        filtered.push(...matchingApps); // Combine matching results
      }
    }

    setFilteredApps(filtered);
  };

  // const handleSearch = (e) => {
  //   const query = e.target.value.toLowerCase();
  //   setSearchQuery(query);

  //   if (!query.trim()) {
  //     setFilteredApps([]); // Reset if empty
  //     return;
  //   }

  //   const filtered = [];
  //   // Ensure you're filtering both Apps and Files correctly
  //   for (const category in categorizedApps) {
  //     const matchingApps = categorizedApps[category].filter((app) => {
  //       const nameMatch = app.name && app.name.toLowerCase().includes(query); // Check if name exists
  //       const codeMatch =
  //         app.generated_code &&
  //         app.generated_code.toLowerCase().includes(query); // Search in generated_code
  //       const phoneMatch =
  //         app.extension && app.extension.toLowerCase().includes(query);
  //       return nameMatch || codeMatch || phoneMatch;
  //     });
  //     if (matchingApps.length > 0) {
  //       filtered.push(...matchingApps); // Combine matching results
  //     }
  //   }

  //   setFilteredApps(filtered);
  // };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup the interval on unmount
  }, []);

  useEffect(() => {
    const username = localStorage.getItem("username"); // Retrieve username
    console.log("Username retrieved from localStorage:", username);

    if (!username) {
      console.error("Username not found in localStorage");
      setError("User is not logged in. Please log in again.");
      return;
    }

    // Fetch events and reminders
    fetch(`${API_URL}/api/events`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        return response.json();
      })
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));

    fetch(`${API_URL}/api/reminders`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch reminders");
        }
        return response.json();
      })
      .then((data) => setReminders(data))
      .catch((error) => console.error("Error fetching reminders:", error));

    // Fetch logged-in user and available apps using username
    const url = `${API_URL}/api/users/logged-in?username=${encodeURIComponent(
      username
    )}`;
    console.log("Constructed Fetch URL:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch logged-in user");
        }
        return response.json();
      })
      .then((user) => {
        console.log("Fetched User Data:", user); // Log entire user data

        if (user && (user.ID || user.id)) {
          // Set user data in state
          setCurrentUser({
            id: user.ID || user.id,
            username: user.username,
            fullName: user.name || `${user.firstName} ${user.lastName}`, // Handle full name from user object
            email: user.email || "", // Optional: fallback to empty string
            avatar: user.avatar || "", // Optional: fallback to empty string
          });

          // Set available apps from user data
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
  }, []); // Empty dependency array to run once on component mount

  // useEffect(() => {
  //   if (currentUser && currentUser.id) {
  //     console.log("Fetching categorized apps for user ID:", currentUser.id);

  //     fetch(`${API_URL}/api/apps/available`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-user-id": currentUser.id,
  //       },
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch apps: ${response.statusText}`);
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         if (data.pmdApplications && data.otherApplications) {
  //           setApps(data); // Set apps if data is an array
  //           setPmdApplications(data.pmdApplications);
  //           setOtherApplications(data.otherApplications);
  //         } else {
  //           console.error("Unexpected response format for apps:", data);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching apps:", error);
  //       });
  //   }
  // }, [currentUser]); // Run when `currentUser` updates

  useEffect(() => {
    fetchApplicationTypes();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchApplications();
    }
  }, [currentUser]); // Run when `currentUser` updates

  useEffect(() => {
    const storedRecentApps =
      JSON.parse(localStorage.getItem("recentApps")) || [];
    setRecentApps(storedRecentApps.slice(0, 5));
  }, []);

  const fetchApplicationTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/application-types`);
      if (!response.ok) throw new Error("Failed to fetch application types");
      const data = await response.json();
      setAppTypes(data); // Store fetched app types dynamically
    } catch (error) {
      console.error("Error fetching application types:", error);
    }
  };

  // const fetchApplications = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/apps/available`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-user-id": currentUser.id,
  //       },
  //     });

  //     if (!response.ok)
  //       throw new Error(`Failed to fetch apps: ${response.statusText}`);
  //     const data = await response.json();
  //     setCategorizedApps(data);
  //   } catch (error) {
  //     console.error("Error fetching apps:", error);
  //   }
  // };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/apps/available`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch apps: ${response.statusText}`);

      const data = await response.json();
      console.log("Fetched Apps Data:", data); // Log the data to ensure it's coming through

      // Initialize an empty object for categorized apps
      let categorizedApps = {};

      // Iterate over each category in the fetched data
      for (const category in data) {
        if (data.hasOwnProperty(category)) {
          // Initialize the category in categorizedApps if it doesn't exist
          categorizedApps[category] = data[category];
        }
      }

      // Update the categorizedApps state
      setCategorizedApps(categorizedApps);
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

    // Check if all required fields are present before proceeding
    if (!updatedApp.name || !updatedApp.url) {
      console.error("Name and URL fields are required.");
      return;
    }

    const updatedAppData = { ...selectedApp, ...updatedApp };

    // Update the app immediately in the UI for feedback
    setApps((prevApps) =>
      prevApps.map((app) => (app.id === selectedApp.id ? updatedAppData : app))
    );

    // Send the updated data to the backend
    fetch(`${API_URL}/api/apps/${selectedApp.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedAppData), // Send all fields, ensuring no fields are missed
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update app");
        }
        return response.json();
      })
      .then((data) => {
        const updatedAppFromAPI = data.app;

        // Confirm the update in the UI with the backend response
        setApps((prevApps) =>
          prevApps.map((app) =>
            app.id === updatedAppFromAPI.id ? updatedAppFromAPI : app
          )
        );

        setStatus(`App "${updatedApp.name}" updated successfully.`);
        onClose(); // Close the modal after updating state
      })
      .catch((error) => {
        console.error("Error updating app:", error);
        setStatus("Error updating app. Please try again.");
      });
  };

  // Get the current time and greet the user accordingly
  const getTimeBasedGreeting = () => {
    const userFullName = localStorage.getItem("userFullName") || "User"; // Retrieve full name from localStorage or use "User" as fallback
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userFullName}`;
    if (hour < 18) return `Good afternoon, ${userFullName}`;
    return `Good evening, ${userFullName}`;
  };

  const handleAppClick = (app) => {
    console.log("App Clicked:", app.name);

    // Retrieve stored recently opened apps
    const storedRecentApps =
      JSON.parse(localStorage.getItem("recentApps")) || [];

    // Add the clicked app to the front of the list (avoid duplicates)
    const updatedRecentApps = [
      app,
      ...storedRecentApps.filter((a) => a.id !== app.id),
    ].slice(0, 5);

    // Save updated list to local storage
    localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps));

    // Update state
    setRecentApps(updatedRecentApps);
  };

  // 🟢 Dynamic column count for responsiveness
  const columns = useBreakpointValue({ base: 1, sm: 1, md: 3, lg: 3, xl: 5 });

  const handleDragEnd = (result, type) => {
    if (!result.destination || isMobile) return; // ✅ Disable drag on mobile

    const reorderedApps = [...categorizedApps[type]];
    const [movedApp] = reorderedApps.splice(result.source.index, 1);
    reorderedApps.splice(result.destination.index, 0, movedApp);

    setCategorizedApps((prev) => ({
      ...prev,
      [type]: reorderedApps,
    }));
  };

  return (

      
    <Box bg={useColorModeValue("white.50", "white.500")} minH="100vh" p={6}>
      {/* Sticky Header Section */}
  <Box
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="sm"
      bg="white"
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
<Button onClick={() => {
  localStorage.removeItem("hasSeenTutorial");
  window.location.reload();
}}>Reset Tutorial</Button>
        {/* ✅ Tutorial overlay always rendered once (if not seen yet) */}
        <Tutorial />
        {compactGreeting ? (
          // 👉 Compact greeting beside search input
          <>
            <Input
              placeholder="Search"
              size="md"
              borderRadius="full"
              bg="white"
              maxW="300px"
              value={searchQuery}
              onChange={handleSearch}
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
          // 👉 Full greeting below search input
          <VStack
            spacing={4}
            align="start"
            width="100%"
            transition="all 0.4s ease"
          >
            <Input
              placeholder="Search"
              size="md"
              borderRadius="full"
              bg="white"
              maxW="300px"
              value={searchQuery}
              onChange={handleSearch}
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
        <IconButton
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          isRound
          display="none"
          size="lg"
          aria-label="Toggle color mode"
        />

        <Popover>
          <PopoverTrigger>
            <IconButton
              icon={<FiBell />}
              isRound
              size="lg"
              aria-label="Notifications"
              display="none"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Box key={notif.id} p={2}>
                    <Text fontWeight="bold">{notif.title}</Text>
                    <Text fontSize="sm">{notif.description}</Text>
                  </Box>
                ))
              ) : (
                <Text>No new notifications</Text>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
      {/* Dynamically Render Applications Based on Application Types */}
      {/* {appTypes.map((type) => (
        <Box key={type.id} mt={6}>
          <Heading as="h2" size="lg" mb={4} display="flex" alignItems="center">
            <FiGrid style={{ marginRight: "8px", color: "#F3C847" }} />
            {type.name}
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {categorizedApps[type.name] &&
              categorizedApps[type.name].map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  colors={colors}
                  handleAppClick={handleAppClick}
                />
              ))}
          </SimpleGrid>
        </Box>
      ))} */}
      <>


        {/* ✅ Show Search Results If Search Query Exists */}
        {searchQuery && filteredApps.length > 0 ? (
          <Box mt={6}>
            <Heading as="h2" size="lg" mb={4} color="gray.700">
              Search Results
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
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
                  const apps = categorizedApps[type.name] || [];
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

                      {apps.length > 0 ? (
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
                              {apps.map((app, index) => (
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
                  const apps = categorizedApps[type.name] || [];
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

                      {apps.length > 0 ? (
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
      </>

      {/* Recent Login Logs Section */}
      {hasPermission("home.recent_activity") && (
        <Box mt={6} mx="auto" px={{ base: 4, md: 8 }} width="100%" maxW="100%">
          <Heading
            as="h4"
            size={{ base: "md", md: "lg" }}
            mb={4}
            bgGradient="linear(to-r, orange.400, yellow.300)"
            bgClip="text"
            fontWeight="extrabold"
            userSelect="none"
          >
            Recent Login Activity
          </Heading>

          {/* Search bar */}
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
                minWidth="700px" // ensure table can scroll horizontally if needed
                sx={{
                  "thead tr": {
                    // remove this if you're setting background on each <th> instead
                    // otherwise, you can keep it for fallback
                    backgroundColor: "orange.400",
                  },
                  "thead th": {
                    color: "white",
                    fontWeight: "bold",
                    borderBottom: "none",
                    userSelect: "none",
                    position: "sticky",
                    top: -7,
                    zIndex: 10, // ensure it's above rows
                    px: { base: 3, md: 6 },
                    py: { base: 2, md: 3 },
                    fontSize: { base: "xs", md: "sm" },
                    whiteSpace: "nowrap",
                    backgroundColor: "orange.400", // key fix
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)", // optional visual separation
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
                          ? new Date(log.login_time).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            ) +
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
        </Box>
      )}
      {/* Modal for App Info */}
      {selectedApp && (
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
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUpdatedApp((prev) => ({
                        ...prev,
                        icon: reader.result,
                      }));
                    };
                    reader.readAsDataURL(e.target.files[0]);
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
      )}
    </Box>
  );
}
const AppCard = ({ app, colors, handleAppClick, small }) => {
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
          border="2px solid"
          cursor={app.personnel_id ? "pointer" : "default"}
          borderColor={colors.cardBorder}
          onClick={() =>
            window.open(`/personnel-preview/${app.personnel_id}`, "_blank")
          }
        />
      </Box>

      {/* Name & Phone Info */}
      <Box
        textAlign="center"
        cursor={app.personnel_id ? "pointer" : "default"}
        onClick={() =>
          window.open(`/personnel-preview/${app.personnel_id}`, "_blank")
        }
      >
        <Text
          fontSize={small ? "10px" : "xl"}
          fontWeight="bold"
          color={colors.cardHeader}
          mb={1}
        >
          {app.name}
        </Text>

        <Text fontSize="sm" color={colors.cardText} mb={1}>
          <strong>Phone Name:</strong> {app.phone_name}
        </Text>

        {(app.prefix || app.extension) && (
          <HStack spacing={2} justify="center" mb={1}>
            {app.prefix && (
              <Text fontSize="sm" color={colors.cardText}>
                <strong>Prefix:</strong> {app.prefix}
              </Text>
            )}
            {app.extension && (
              <Text fontSize="sm" color={colors.cardText}>
                <strong>Ext:</strong> {app.extension}
              </Text>
            )}
          </HStack>
        )}

        <Text fontSize="sm" color={colors.cardText}>
          <strong>DECT:</strong>{" "}
          {app.dect_number && app.dect_number.trim() !== ""
            ? app.dect_number
            : "N/A"}
        </Text>
      </Box>
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
      <Box>
        {app.icon ? (
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
      </Box>
      {/* App Name and Description */}
      <Box>
        <Text
          fontSize={small ? "10px" : "xl"}
          fontWeight="bold"
          color={colors.cardHeader}
        >
          {app.name}
        </Text>

        {/* File info */}
        {isFileData ? (
          hasPermission("atgfile.view") ? (
            <Box mt={2}>
              <Text fontSize="sm" color={colors.cardText}>
                <strong>Filename:</strong> {app.filename}
              </Text>
              <Text fontSize="sm" color={colors.cardText}>
                <strong>Generated Code:</strong> {app.generated_code}
              </Text>
            </Box>
          ) : (
            <Text fontSize="sm" color={colors.cardText}>
              No Files Found
            </Text>
          )
        ) : null}

        {/* App description */}
        {!small && !isFileData && (
          <Text fontSize="sm" color={colors.cardText}>
            {app.description}
          </Text>
        )}
      
      </Box>
    </VStack>
    
  );
};
