import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useToast } from "@chakra-ui/react"; // Ensure toast is imported

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";
// Localizer for Calendar using moment.js
const localizer = momentLocalizer(moment);
const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [location_id, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);
  const [recurrence, setRecurrence] = useState("none");

  const toast = useToast(); // Initialize toast

  const { isOpen, onOpen, onClose } = useDisclosure(); // For Add Event
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure(); // For Edit Event
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch events and locations
  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const eventsWithLocationNames = data.map((event) => {
          const location = locations.find(
            (loc) => loc.id === event.location_id
          );
          return { ...event, locationName: location?.name || "N/A" };
        });
        setEvents(eventsWithLocationNames);
      })
      .catch((err) => console.error("Error fetching events:", err));

    fetch(`${API_URL}/api/locations`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Locations fetched:", data); // Debugging
        setLocations(data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, [locations]);

  // Format events for react-big-calendar
  const formattedEvents = events.map((event) => {
    const startTime = moment(`${event.date}T${event.time}`);
    const endTime = moment(startTime).add(1, "hours");
    return {
      title: `${event.eventName} (${event.locationName})`, // Display Event Name and Location
      start: startTime.toDate(),
      end: endTime.toDate(),
      allDay: false,
      id: event.id,
      location: event.locationName,
    };
  });

  // Handle adding or updating an event
  const handleAddOrUpdateEvent = (e) => {
    e.preventDefault();

    // Ensure proper formatting for date and time
    const formattedDate = moment(date).format("YYYY-MM-DD"); // Ensure ISO date format
    const formattedTime = moment(time, "HH:mm").format("HH:mm:ss"); // Ensure proper time format

    // Validate location_id
    if (!location_id) {
      alert("Please select a valid location.");
      return;
    }

    const newEvent = {
      eventName,
      date: formattedDate,
      time: formattedTime,
      location_id,
      recurrence,
    };

    if (editingEvent) {
      // Update existing event
      fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to update event: ${res.status}`);
          }
          return res.json();
        })
        .then((updatedEvent) => {
          setEvents((prevEvents) =>
            prevEvents.map((item) =>
              item.id === editingEvent.id ? updatedEvent : item
            )
          );
          onEditClose();
        })
        .catch((error) => {
          console.error("Error updating event:", error);
          alert("Error updating event. Please try again.");
        });
    } else {
      // Add new event
      fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to add event: ${res.status}`);
          }
          return res.json();
        })
        .then((createdEvent) => {
          setEvents((prevEvents) => [...prevEvents, createdEvent]);
          onClose(); // Close Add Event modal
        })
        .catch((error) => {
          console.error("Error adding event:", error);
          alert("Error adding event. Please try again.");
        });
    }
  };

  // Handle editing an event
  const handleEditEvent = (event) => {
    const selectedEvent = events.find((item) => item.id === event.id);

    if (!selectedEvent) {
      console.error("Selected event not found.");
      return;
    }

    setEditingEvent(selectedEvent);
    setEventName(selectedEvent.eventName);
    setDate(moment(selectedEvent.date).format("YYYY-MM-DD")); // Properly format date
    setTime(moment(selectedEvent.time, "HH:mm:ss").format("HH:mm")); // Properly format time
    setLocationId(selectedEvent.location_id); // Correctly set location ID
    setRecurrence(selectedEvent.recurrence || "none"); // Default to 'none'
    onEditOpen(); // Open Edit Event modal
  };

  const handleDeleteEvent = async (event) => {
    // Display a confirmation dialog before deletion
    const userConfirmed = window.confirm(
      `Are you sure you want to delete the event "${event.eventName}"?`
    );
    if (!userConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event. Status: ${response.status}`);
      }

      // Update state to remove the deleted event
      setEvents((prevEvents) =>
        prevEvents.filter((item) => item.id !== event.id)
      );

      // Close the modal
      onEditClose(); // Assuming you're using `onEditClose` to close the edit modal

      // Show success notification
      toast({
        title: "Event Deleted",
        description: `The event "${event.eventName}" has been successfully deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting event:", error);

      // Show error notification
      toast({
        title: "Error",
        description:
          "An error occurred while trying to delete the event. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  // Clear modal fields when adding a new event
  const clearFields = () => {
    setEventName("");
    setDate("");
    setTime("");
    setLocation("");
    setRecurrence("none");
  };

  // When opening the "Add Event" modal, clear fields
  const handleAddEventClick = () => {
    clearFields(); // Clear all form fields
    setEditingEvent(null); // Ensure editingEvent is cleared
    onOpen(); // Open Add Event modal
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh">
      <Heading mb={6} color="teal.600" textAlign="center">
        Manage Events
      </Heading>

      <Button
        leftIcon={<AddIcon />}
        onClick={handleAddEventClick}
        colorScheme="teal"
        mb={4}
        size="lg"
        _hover={{ bg: "green.400", transform: "scale(1.05)" }}
        borderRadius="full"
        boxShadow="md"
        transition="all 0.3s ease-in-out"
      >
        Add Event
      </Button>

      {/* Calendar View */}
      <Box
        bgGradient="linear(to-r, teal.50, teal.100)"
        borderRadius="xl"
        boxShadow="2xl"
        p={8}
        mb={6}
        _hover={{ boxShadow: "3xl", transform: "scale(1.02)" }}
        transition="all 0.3s ease-in-out"
      >
        <Heading size="lg" color="teal.700" textAlign="center" mb={6}>
          Event Calendar
        </Heading>
        <Calendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600, padding: "10px" }}
          selectable
          views={["month", "week", "day", "agenda"]}
          popup
          onSelectEvent={(event) => handleEditEvent(event)} // Trigger on click
          components={{
            event: ({ event }) => (
              <Box
                bg="teal.600"
                color="white"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{
                  bg: "teal.700",
                  transform: "scale(1.03)",
                  boxShadow: "lg",
                  cursor: "pointer", // Indicate interactivity
                }}
                transition="all 0.3s ease-in-out"
                onClick={() => handleEditEvent(event)} // Attach click event here
              >
                {event.title}
              </Box>
            ),
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: "#319795", // Teal background for events
              color: "white",
              borderRadius: "8px",
              padding: "8px",
              border: "none",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              cursor: "pointer", // Add interactivity
            },
          })}
        />
      </Box>

      {/* Modal for Adding or Editing Events */}
      <Modal
        isOpen={isOpen || isEditOpen}
        onClose={editingEvent ? onEditClose : onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingEvent ? "Edit Event" : "Add Event"}</ModalHeader>
          <ModalCloseButton onClick={editingEvent ? onEditClose : onClose} />
          <ModalBody>
            <VStack spacing={4}>
              {/* Event Name */}
              <FormControl isRequired>
                <FormLabel>Event Name</FormLabel>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter Event Name"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
                />
              </FormControl>

              {/* Date */}
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
                />
              </FormControl>

              {/* Time */}
              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
                />
              </FormControl>

              {/* Location Dropdown */}
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Select
                  placeholder="Select Location"
                  value={location_id || ""} // Ensure value is handled properly even if undefined or null
                  onChange={(e) => setLocationId(e.target.value)} // Update the state with the selected location ID
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Recurrence Dropdown */}
              <FormControl>
                <FormLabel>Recurrence</FormLabel>
                <Select
                  placeholder="Select Recurrence"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
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
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAddOrUpdateEvent}
              _hover={{ bg: "blue.400", transform: "scale(1.05)" }}
            >
              {editingEvent ? "Save Changes" : "Add Event"}
            </Button>
            <Button
              onClick={editingEvent ? onEditClose : onClose}
              _hover={{ bg: "gray.300", transform: "scale(1.05)" }}
            >
              Cancel
            </Button>
            {editingEvent && (
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => handleDeleteEvent(editingEvent)}
                _hover={{ bg: "red.400", transform: "scale(1.05)" }}
              >
                Delete
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Events;
