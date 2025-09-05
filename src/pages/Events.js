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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEventsAndLocations = useCallback(async () => {
    try {
      const [eventsRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/api/events`),
        fetch(`${API_URL}/api/locations`),
      ]);

      const eventsData = await eventsRes.json();
      const locationsData = await locationsRes.json();

      const eventsWithLocation = eventsData.map((event) => {
        const location = locationsData.find((loc) => loc.id === event.location_id);
        return { ...event, locationName: location?.name || "N/A" };
      });

      setEvents(eventsWithLocation);
      setLocations(locationsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error fetching data.",
        description: "Failed to load events or locations. Please check the server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchEventsAndLocations();
  }, [fetchEventsAndLocations]);

  // Updated to include time in the event title
  const formattedEvents = useMemo(() => {
    return events.map((event) => {
      const startTime = moment(`${event.date}T${event.time}`);
      const formattedTime = startTime.format("h:mm A");
      return {
        title: `${formattedTime} - ${event.eventName} (${event.locationName || "N/A"})`,
        start: startTime.toDate(),
        end: startTime.clone().add(1, "hours").toDate(),
        id: event.id,
      };
    });
  }, [events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData({ eventName: "", date: "", time: "", location_id: "", recurrence: "none" });
    setEditingEvent(null);
    setFormErrors({});
  };

  const handleSaveEvent = async () => {
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
        title: editingEvent ? "Event Updated" : "Event Added",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error("Error saving event:", err);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleEditEvent = (event) => {
    const selectedEvent = events.find((e) => e.id === event.id);
    if (!selectedEvent) return;

    setEditingEvent(selectedEvent);
    setFormData({
      eventName: selectedEvent.eventName,
      date: moment(selectedEvent.date).format("YYYY-MM-DD"),
      time: moment(selectedEvent.time, "HH:mm:ss").format("HH:mm"),
      location_id: selectedEvent.location_id,
      recurrence: selectedEvent.recurrence || "none",
    });
    setFormErrors({});
    onOpen();
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    if (!window.confirm(`Delete event "${editingEvent.eventName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchEventsAndLocations();

      toast({ title: "Event Deleted", status: "success", duration: 2000, isClosable: true });

      resetForm();
      onClose();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    const updatedEvent = {
      ...event,
      date: moment(start).format("YYYY-MM-DD"),
      time: moment(start).format("HH:mm:ss"),
    };

    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) throw new Error("Failed to update event");

      await fetchEventsAndLocations();

      toast({
        title: "Event moved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error updating event:", err);
      toast({
        title: "Error",
        description: "Failed to move event.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          date: moment(start).format("YYYY-MM-DD"),
          time: moment(start).format("HH:mm:ss"),
        }),
      });

      if (!res.ok) throw new Error("Failed to resize event");

      await fetchEventsAndLocations();

      toast({
        title: "Event resized",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error resizing event:", err);
      toast({
        title: "Error",
        description: "Failed to resize event.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh">
      <Heading mb={6} color="blue.800" textAlign="center" fontSize="3xl">
        🗓️ Event Management
      </Heading>
      
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mb={6}>
        <Heading size="lg" mb={{ base: 4, md: 0 }} color="gray.700">
          Event Calendar
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            onOpen();
          }}
          colorScheme="blue"
          size="md"
          borderRadius="lg"
          boxShadow="md"
          _hover={{ transform: "scale(1.02)", boxShadow: "lg" }}
        >
          Add Event
        </Button>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        p={6}
        transition="0.3s"
        _hover={{ boxShadow: "2xl" }}
      >
        <DnDCalendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          popup
          resizable
          views={["month", "week", "day", "agenda"]}
          onSelectEvent={handleEditEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#4299e1", // Blue-400
              color: "white",
              borderRadius: "8px",
              padding: "6px",
              fontWeight: "500",
              boxShadow: "sm",
            },
          })}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent borderRadius="xl" boxShadow="2xl">
          <ModalHeader color="blue.800" fontWeight="bold">
            {editingEvent ? "Edit Event" : "Add Event"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!formErrors.eventName}>
                <FormLabel>Event Name</FormLabel>
                <Input
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  variant="filled"
                />
                <FormErrorMessage>{formErrors.eventName}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.date}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  variant="filled"
                />
                <FormErrorMessage>{formErrors.date}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.time}>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  variant="filled"
                />
                <FormErrorMessage>{formErrors.time}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.location_id}>
                <FormLabel>Location</FormLabel>
                <Select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  placeholder="Select Location"
                  variant="filled"
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
                <FormLabel>Recurrence</FormLabel>
                <Select
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleChange}
                  variant="filled"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex w="100%" justifyContent="space-between">
              {editingEvent && (
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete Event"
                  colorScheme="red"
                  onClick={handleDeleteEvent}
                  variant="ghost"
                />
              )}
              <Spacer />
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSaveEvent}>
                {editingEvent ? "Save Changes" : "Add Event"}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Events;