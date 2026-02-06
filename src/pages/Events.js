import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Flex,
  Spacer,
  FormErrorMessage,
  IconButton,
  Text,
  ButtonGroup,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Icon,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CalendarIcon, TimeIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaMapMarkerAlt, FaCalendarAlt, FaList } from "react-icons/fa";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
  /* ---------- State ---------- */
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location_id: "",
    recurrence: "none",
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  /* ---------- Hooks ---------- */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  /* ---------- Data Fetching ---------- */
  const fetchEventsAndLocations = useCallback(async () => {
    try {
      const [eventsRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/api/events`),
        fetch(`${API_URL}/api/locations`),
      ]);

      const eventsData = await eventsRes.json();
      const locationsData = await locationsRes.json();

      const eventsWithLocation = eventsData.map((event) => {
        const location = locationsData.find(
          (loc) => loc.id === event.location_id
        );
        return { ...event, locationName: location?.name || "N/A" };
      });

      setEvents(eventsWithLocation);
      setLocations(locationsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Connection Error",
        description: "Could not load events. Please check your internet or server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchEventsAndLocations();
  }, [fetchEventsAndLocations]);

  /* ---------- Memos ---------- */
  const formattedEvents = useMemo(() => {
    // Sort events by date for list view stability
    return events
      .map((event) => {
        const startTime = moment(`${event.date}T${event.time}`);
        return {
          title: `${event.eventName}`, // Cleaner title for calendar
          start: startTime.toDate(),
          end: startTime.clone().add(1, "hours").toDate(), // Default 1 hour duration
          allDay: false,
          resource: event, // Store full object for easy access
          id: event.id,
        };
      })
      .sort((a, b) => a.start - b.start);
  }, [events]);

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      date: "",
      time: "",
      location_id: "",
      recurrence: "none",
    });
    setEditingEvent(null);
    setFormErrors({});
  };

  const handleSaveEvent = async () => {
    // Validation
    const errors = {};
    if (!formData.eventName) errors.eventName = "Event Name is required.";
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.time) errors.time = "Time is required.";
    if (!formData.location_id) errors.location_id = "Location is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newEvent = {
      ...formData,
      date: moment(formData.date).format("YYYY-MM-DD"),
      time: moment(formData.time, "HH:mm").format("HH:mm:ss"),
    };

    try {
      const url = editingEvent
        ? `${API_URL}/api/events/${editingEvent.id}`
        : `${API_URL}/api/events`;
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error("Request failed");

      await fetchEventsAndLocations();

      toast({
        title: editingEvent ? "Event Updated" : "Event Created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error("Error saving event:", err);
      toast({
        title: "Save Failed",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditEvent = (eventData) => {
    // Handle both Calendar event object and raw event object
    const rawEvent = eventData.resource || events.find(e => e.id === eventData.id);

    if (!rawEvent) return;

    setEditingEvent(rawEvent);
    setFormData({
      eventName: rawEvent.eventName,
      date: moment(rawEvent.date).format("YYYY-MM-DD"),
      time: moment(rawEvent.time, "HH:mm:ss").format("HH:mm"),
      location_id: rawEvent.location_id,
      recurrence: rawEvent.recurrence || "none",
    });
    setFormErrors({});
    onOpen();
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    if (!window.confirm(`Are you sure you want to delete "${editingEvent.eventName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchEventsAndLocations();
      toast({ title: "Event Deleted", status: "info", duration: 2000, isClosable: true });
      resetForm();
      onClose();
    } catch (err) {
      toast({ title: "Delete Failed", status: "error", duration: 2500, isClosable: true });
    }
  };

  /* ---------- DnD Handlers ---------- */
  const handleEventDrop = async ({ event, start }) => {
    const updatedEvent = {
      ...event.resource,
      date: moment(start).format("YYYY-MM-DD"),
      time: moment(start).format("HH:mm:ss"),
    };
    await updateEventSilently(updatedEvent, "Event moved");
  };

  const updateEventSilently = async (eventPayload, successMsg) => {
    try {
      const res = await fetch(`${API_URL}/api/events/${eventPayload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });
      if (!res.ok) throw new Error("Update failed");

      await fetchEventsAndLocations();
      toast({ title: successMsg, status: "success", duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: "Update Failed", status: "error", duration: 2000 });
    }
  }


  /* ---------- Render Components ---------- */

  const ListView = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {formattedEvents.map((evt) => (
        <Card
          key={evt.id}
          bg={cardBg}
          borderLeft="4px solid"
          borderColor="blue.400"
          shadow="md"
          _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => handleEditEvent(evt)}
        >
          <CardBody>
            <Flex justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <Heading size="sm" color="blue.700">
                  {evt.title}
                </Heading>
                <HStack fontSize="sm" color="gray.600">
                  <Icon as={FaCalendarAlt} color="blue.400" />
                  <Text>{moment(evt.start).format("MMM DD, YYYY")}</Text>
                </HStack>
                <HStack fontSize="sm" color="gray.600">
                  <Icon as={TimeIcon} color="orange.400" />
                  <Text>{moment(evt.start).format("h:mm A")}</Text>
                </HStack>
                <HStack fontSize="sm" color="gray.600">
                  <Icon as={FaMapMarkerAlt} color="red.400" />
                  <Text>{evt.resource.locationName}</Text>
                </HStack>
              </VStack>
              {evt.resource.recurrence !== 'none' && (
                <Badge colorScheme="purple">{evt.resource.recurrence}</Badge>
              )}
            </Flex>
          </CardBody>
        </Card>
      ))}
      {formattedEvents.length === 0 && (
        <Box gridColumn="1 / -1" textAlign="center" py={10} color="gray.500">
          <Text>No events scheduled. Click "Add Event" to get started.</Text>
        </Box>
      )}
    </SimpleGrid>
  );

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgColor} minHeight="100vh">
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mb={8} gap={4}>
        <Box textAlign={{ base: "center", md: "left" }}>
          <Heading size="lg" color="blue.800" mb={1}>
            Event Schedule
          </Heading>
          <Text color="gray.500">Manage your upcoming events and appointments.</Text>
        </Box>

        <HStack>
          <ButtonGroup isAttached variant="outline" size="sm" mr={2}>
            <IconButton
              aria-label="Calendar View"
              icon={<Icon as={FaCalendarAlt} />}
              colorScheme={viewMode === 'calendar' ? 'blue' : 'gray'}
              isActive={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
            />
            <IconButton
              aria-label="List View"
              icon={<Icon as={FaList} />}
              colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
              isActive={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            />
          </ButtonGroup>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onOpen();
            }}
            shadow="md"
          >
            Add Event
          </Button>
        </HStack>
      </Flex>

      {/* Content Area */}
      <Box>
        {viewMode === "calendar" ? (
          <Box
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            p={4}
            height="700px" // Fixed height for calendar
            overflow="hidden"
          >
            <DnDCalendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              selectable
              popup
              resizable // DnD feature
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              onSelectEvent={handleEditEvent}
              onEventDrop={handleEventDrop}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "#3182ce",
                  borderRadius: "6px",
                  opacity: 0.9,
                  color: "white",
                  border: "none",
                  display: "block",
                },
              })}
            />
          </Box>
        ) : (
          <ListView />
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <Flex align="center" gap={2}>
              <Icon as={editingEvent ? TimeIcon : AddIcon} color="blue.500" />
              {editingEvent ? "Edit Event Details" : "Create New Event"}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={5}>
              <FormControl isRequired isInvalid={!!formErrors.eventName}>
                <FormLabel fontWeight="semibold">Event Name</FormLabel>
                <Input
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g. Weekly Meeting"
                  focusBorderColor="blue.500"
                />
                <FormErrorMessage>{formErrors.eventName}</FormErrorMessage>
              </FormControl>

              <HStack w="100%" spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.date}>
                  <FormLabel fontWeight="semibold">Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{formErrors.date}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!formErrors.time}>
                  <FormLabel fontWeight="semibold">Time</FormLabel>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{formErrors.time}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isRequired isInvalid={!!formErrors.location_id}>
                <FormLabel fontWeight="semibold">Location</FormLabel>
                <Select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  placeholder="Select Location"
                  focusBorderColor="blue.500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{formErrors.location_id}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Recurrence</FormLabel>
                <Select
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleChange}
                  focusBorderColor="blue.500"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" borderBottomRadius="xl">
            <Flex w="100%" justifyContent="space-between">
              {editingEvent ? (
                <Button
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </Button>
              ) : <Box />} {/* Spacer */}

              <HStack>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSaveEvent} px={6}>
                  Save
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Events;