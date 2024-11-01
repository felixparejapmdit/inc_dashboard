import React, { useEffect, useState } from "react";
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
  Progress,
  Avatar,
  Tooltip,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiFile,
  FiCalendar,
  FiBell,
  FiUser,
  FiSearch,
  FiSun,
  FiMoon, // For sun and moon icons (theme toggle)
} from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { PopoverHeader, List } from "@chakra-ui/react";

import { useNavigate } from "react-router-dom"; // Import useNavigate

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [status, setStatus] = useState("");
  const [availableApps, setAvailableApps] = useState([]);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatedApp, setUpdatedApp] = useState({
    name: "",
    description: "",
    url: "",
    icon: "",
  });
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [currentUser, setCurrentUser] = useState({ name: "User" });
  const [hoveredEvent, setHoveredEvent] = useState(null); // Hover state for events
  const [hoveredReminder, setHoveredReminder] = useState(null); // Hover state for reminders
  const { colorMode, toggleColorMode } = useColorMode(); // Color mode state
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate

  const colors = {
    reminderBg: useColorModeValue("orange.100", "orange.700"),
    eventBg: useColorModeValue("teal.100", "teal.700"),
    appBg: useColorModeValue("gray.100", "gray.800"),
    cardText: useColorModeValue("gray.700", "white"),
    cardHeader: useColorModeValue("gray.600", "gray.300"),
    cardBorder: useColorModeValue("gray.300", "gray.700"),
    buttonBg: useColorModeValue("blue.600", "blue.500"),
    buttonHoverBg: useColorModeValue("blue.700", "blue.600"),
  };

  useEffect(() => {
    // Fetch events, reminders, and logged-in user data
    fetch(`${API_URL}/api/events`)
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));

    fetch(`${API_URL}/api/reminders`)
      .then((response) => response.json())
      .then((data) => setReminders(data))
      .catch((error) => console.error("Error fetching reminders:", error));

    fetch(`${API_URL}/api/users/logged-in`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch logged-in user");
        }
        return response.json();
      })
      .then((user) => {
        console.log("Fetched User Data:", user); // Log entire user data
        console.log("Available Apps Data:", user.availableApps); // Log available apps to inspect structure

        if (user && (user.ID || user.id)) {
          setCurrentUser({ id: user.ID || user.id, ...user });
          // Directly set availableApps as an array of app names
          setAvailableApps(user.availableApps || []);
        }
      })
      .catch((error) => console.error("Error fetching logged-in user:", error));
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      console.log("Fetching available apps for user ID:", currentUser.id);
      fetch(`${API_URL}/api/availableapps`, {
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": currentUser.id, // Send the user ID in the custom header
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setApps(data); // Set apps if data is an array
          } else {
            console.error("Unexpected response format for apps:", data);
            setApps([]); // Set an empty array if data is not an array
          }
        })
        .catch((error) => {
          console.error("Error fetching apps:", error);
          setApps([]); // Set an empty array on fetch error
        });
    }
  }, [currentUser]);

  // Filter apps based on `availableApps` IDs and search query
  const filteredApps = apps
    .filter((app) => availableApps.includes(app.name)) // Filter by app name instead of ID
    .filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" size="xl">
          {getTimeBasedGreeting()}, {currentUser.name}!
        </Heading>
        <Box w="300px">
          <Input
            placeholder="Search Apps"
            size="md"
            leftIcon={<FiSearch />}
            borderRadius="full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Search input handler
          />
        </Box>

        {/* Color mode toggle button */}
        <IconButton
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          isRound
          size="lg"
          aria-label="Toggle color mode"
          mr={0} // Remove margin between icons
        />

        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger>
            <IconButton
              icon={<FiBell />}
              isRound
              size="lg"
              aria-label="Notifications"
              mr={0} // Remove margin to bring it closer to the color mode icon
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
      <SimpleGrid
        columns={2}
        spacing={6}
        mb={8}
        maxW="100%" // Allow the grid to use the full available width
        w="90%" // Increase the width to 90% of the available space
        justifyContent="center"
        alignItems="center"
        minH="10vh"
      >
        <Tooltip
          label={
            hoveredEvent ? (
              <VStack align="start" spacing={2}>
                {events.map((event) => (
                  <Box key={event.id}>
                    <Text fontWeight="bold">{event.eventName}</Text>
                    <Text>
                      {event.date} at {event.time}, {event.location}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              "Hover to see event details"
            )
          }
          placement="top"
          hasArrow
          isOpen={!!hoveredEvent}
        >
          <Box
            bg="blue.500"
            p={6}
            borderRadius="lg"
            color="white"
            onMouseEnter={() => setHoveredEvent(true)}
            onMouseLeave={() => setHoveredEvent(false)}
            onClick={() => navigate("/add-events")} // Redirect to add-events page
            transition="all 0.3s ease"
            _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
            boxShadow="lg"
          >
            <Heading size="lg">{events.length}</Heading>
            <Text>Upcoming Events</Text>
          </Box>
        </Tooltip>

        {false && ( // Set this to a variable or condition
          <Tooltip
            label={
              hoveredReminder ? (
                <VStack align="start" spacing={2}>
                  {reminders.map((reminder) => (
                    <Box key={reminder.id}>
                      <Text fontWeight="bold">{reminder.title}</Text>
                      <Text>{reminder.date}</Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                "Hover to see reminder details"
              )
            }
            placement="top"
            hasArrow
            isOpen={!!hoveredReminder}
          >
            <Box
              bg="green.500"
              p={6}
              borderRadius="lg"
              color="white"
              onMouseEnter={() => setHoveredReminder(true)}
              onMouseLeave={() => setHoveredReminder(false)}
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
              boxShadow="lg"
            >
              <Heading size="lg">{reminders.length}</Heading>
              <Text>Pending Reminders</Text>
            </Box>
          </Tooltip>
        )}

        <Box bg="green.500" p={6} borderRadius="lg" color="white">
          <Heading size="lg">{availableApps.length}</Heading>
          <Text>Available Apps</Text>
        </Box>
      </SimpleGrid>
      {/* Apps Section */}
      <Heading as="h2" size="lg" mb={6}>
        Your Apps
      </Heading>

      <SimpleGrid columns={3} spacing={6}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <AppCard
              key={app.id} // Use app.id as the unique key
              app={app}
              colors={colors}
              onSettingsClick={handleSettingsClick}
            />
          ))
        ) : (
          <Text>No available apps to display.</Text>
        )}
      </SimpleGrid>

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

// Card component for Apps
const AppCard = ({ app, colors, onSettingsClick }) => (
  <VStack
    bg={colors.appBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{
      boxShadow: "lg",
      transform: "translateY(-5px)",
      transition: "all 0.3s ease-in-out",
    }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
    position="relative" // For absolute positioning of the icon
  >
    {/* Settings Icon */}
    <Box position="absolute" top={4} right={4}>
      <Icon
        as={FiEdit}
        boxSize={5}
        color={colors.cardHeader}
        cursor="pointer"
        onClick={() => onSettingsClick(app)}
        _hover={{ color: colors.cardHeaderHover }} // Change color on hover
        style={{ visibility: "hidden" }} // This will hide the icon but keep its space
      />
    </Box>

    {/* App Icon and Details */}
    <Box display="flex" alignItems="center">
      {app.icon ? (
        <Image
          src={app.icon}
          alt={`${app.name} Icon`}
          boxSize="40px"
          borderRadius="full"
          mr={4}
          boxShadow="md" // Add shadow to the icon
        />
      ) : (
        <Icon as={FiFile} boxSize={8} color={colors.cardHeader} mr={4} />
      )}
      <Box>
        <Text fontSize="lg" fontWeight="bold" color={colors.cardHeader}>
          {app.name}
        </Text>
        <Text fontSize="sm" color={colors.cardText}>
          {app.description}
        </Text>
      </Box>
    </Box>

    <Divider borderColor={colors.cardBorder} />

    {/* Open Button */}
    <Button
      as="a"
      href={app.url}
      target={app.url.includes("suguan") ? "_self" : "_blank"}
      rel={app.url.includes("suguan") ? "" : "noopener noreferrer"}
      bg={colors.buttonBg}
      color="white"
      _hover={{
        bg: colors.buttonHoverBg,
        transform: "scale(1.05)",
        transition: "transform 0.2s",
      }} // Scale effect on hover
      _active={{ bg: colors.buttonHoverBg }}
      mt={2}
      width="full"
      borderRadius="md" // Rounded corners for the button
      boxShadow="md" // Add shadow to the button
    >
      Open {app.name}
    </Button>
  </VStack>
);
