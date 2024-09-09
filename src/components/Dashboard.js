import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
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
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FiEdit, FiFile, FiCalendar, FiBell, FiUser } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [suguan, setSuguan] = useState([]);
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

  // Fetch data for apps, suguan, events, and reminders
  useEffect(() => {
    fetch(`${API_URL}/api/apps`)
      .then((response) => response.json())
      .then((data) => setApps(data))
      .catch((error) => console.error("Error fetching apps:", error));

    fetch(`${API_URL}/api/suguan`)
      .then((response) => response.json())
      .then((data) => setSuguan(data))
      .catch((error) => console.error("Error fetching suguan:", error));

    fetch(`${API_URL}/api/events`)
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));

    fetch(`${API_URL}/api/reminders`)
      .then((response) => response.json())
      .then((data) => setReminders(data))
      .catch((error) => console.error("Error fetching reminders:", error));
  }, []);

  // Function to handle clicking on the edit icon
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

  // Function to handle saving changes to the app
  const handleSaveChanges = () => {
    const updatedAppList = apps.map((app) =>
      app.name === selectedApp.name ? updatedApp : app
    );
    setApps(updatedAppList);

    fetch(`${API_URL}/api/apps/${selectedApp.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedApp),
    })
      .then(() => onClose())
      .catch((error) => console.error("Error updating app:", error));
  };

  // Color coding
  const colors = {
    reminderBg: useColorModeValue("orange.100", "orange.700"),
    eventBg: useColorModeValue("teal.100", "teal.700"),
    suguanBg: useColorModeValue("blue.100", "blue.700"),
    appBg: useColorModeValue("gray.100", "gray.800"),
    cardText: useColorModeValue("gray.700", "white"),
    cardHeader: useColorModeValue("gray.600", "gray.300"),
    cardBorder: useColorModeValue("gray.300", "gray.700"),
    buttonBg: useColorModeValue("blue.600", "blue.500"),
    buttonHoverBg: useColorModeValue("blue.700", "blue.600"),
  };

  // Separate events into "Today" and "Upcoming"
  const todayEvents = events.filter(
    (event) => new Date(event.date).toDateString() === new Date().toDateString()
  );
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date()
  );

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" p={6}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        INC Application Dashboard
      </Heading>

      {/* Grid Layout for three columns */}
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {/* First Column: Reminders and Events */}
        <GridItem>
          <Heading as="h2" size="lg" mb={4}>
            Reminders
          </Heading>
          <SimpleGrid columns={1} spacing={4}>
            {reminders.map((reminder, index) => (
              <ReminderCard key={index} reminder={reminder} colors={colors} />
            ))}
          </SimpleGrid>

          <Divider my={6} />

          <Heading as="h2" size="lg" mb={4}>
            Events
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <Heading as="h3" size="md" mb={4}>
                Today
              </Heading>
              <SimpleGrid columns={1} spacing={4}>
                {todayEvents.map((event, index) => (
                  <EventCard key={index} event={event} colors={colors} />
                ))}
              </SimpleGrid>
            </GridItem>

            <GridItem>
              <Heading as="h3" size="md" mb={4}>
                Upcoming
              </Heading>
              <SimpleGrid columns={1} spacing={4}>
                {upcomingEvents.map((event, index) => (
                  <EventCard key={index} event={event} colors={colors} />
                ))}
              </SimpleGrid>
            </GridItem>
          </Grid>
        </GridItem>

        {/* Second Column: Suguan */}
        <GridItem>
          <Heading as="h2" size="lg" mb={4}>
            Suguan
          </Heading>
          <SimpleGrid columns={1} spacing={4}>
            {suguan.map((item, index) => (
              <SuguanCard key={index} item={item} colors={colors} />
            ))}
          </SimpleGrid>
        </GridItem>

        {/* Third Column: Apps */}
        <GridItem>
          <Heading as="h2" size="lg" mb={4}>
            Apps
          </Heading>
          <SimpleGrid columns={1} spacing={4}>
            {apps.map((app, index) => (
              <AppCard
                key={index}
                app={app}
                colors={colors}
                onSettingsClick={handleSettingsClick}
              />
            ))}
          </SimpleGrid>
        </GridItem>
      </Grid>

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
                  value={updatedApp.name}
                  onChange={(e) =>
                    setUpdatedApp({ ...updatedApp, name: e.target.value })
                  }
                  mb={4}
                  placeholder="App Name"
                />

                <Text mb={2}>Description</Text>
                <Input
                  name="description"
                  value={updatedApp.description}
                  onChange={(e) =>
                    setUpdatedApp({
                      ...updatedApp,
                      description: e.target.value,
                    })
                  }
                  mb={4}
                  placeholder="App Description"
                />

                <Text mb={2}>URL</Text>
                <Input
                  name="url"
                  value={updatedApp.url}
                  onChange={(e) =>
                    setUpdatedApp({ ...updatedApp, url: e.target.value })
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

// Card component for Reminders
const ReminderCard = ({ reminder, colors }) => (
  <VStack
    bg={colors.reminderBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
  >
    <Box>
      <Icon as={FiBell} boxSize={8} color={colors.cardHeader} />
    </Box>
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={colors.cardHeader}>
        {reminder.title}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        {reminder.date} at {reminder.time}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        {reminder.message}
      </Text>
    </Box>
  </VStack>
);

// Card component for Events
const EventCard = ({ event, colors }) => (
  <VStack
    bg={colors.eventBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
  >
    <Box>
      <Icon as={FiCalendar} boxSize={8} color={colors.cardHeader} />
    </Box>
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={colors.cardHeader}>
        {event.eventName}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        {event.date} at {event.time}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        Location: {event.location}
      </Text>
    </Box>
  </VStack>
);

// Card component for Suguan
const SuguanCard = ({ item, colors }) => (
  <VStack
    bg={colors.suguanBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
  >
    <Box>
      <Icon as={FiUser} boxSize={8} color={colors.cardHeader} />
    </Box>
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={colors.cardHeader}>
        {item.name}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        {item.district} - {item.local}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        Date: {item.date} Time: {item.time}
      </Text>
      <Text fontSize="sm" color={colors.cardText}>
        Gampanin: {item.gampanin}
      </Text>
    </Box>
  </VStack>
);

// Card component for Apps
const AppCard = ({ app, colors, onSettingsClick }) => (
  <VStack
    bg={colors.appBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
  >
    <Box alignSelf="flex-end">
      <Icon
        as={FiEdit}
        boxSize={5}
        color={colors.cardHeader}
        cursor="pointer"
        onClick={() => onSettingsClick(app)}
      />
    </Box>
    <Box display="flex" alignItems="center">
      {app.icon ? (
        <Image
          src={app.icon}
          alt={`${app.name} Icon`}
          boxSize="40px"
          borderRadius="full"
          mr={4}
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
    <Divider />
    <Button
      as="a"
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      bg={colors.buttonBg}
      color="white"
      _hover={{ bg: colors.buttonHoverBg }}
      _active={{ bg: colors.buttonHoverBg }}
      mt={2}
      width="full"
    >
      Open {app.name}
    </Button>
  </VStack>
);
