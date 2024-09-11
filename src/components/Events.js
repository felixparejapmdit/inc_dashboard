import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
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

// Localizer for Calendar using moment.js
const localizer = momentLocalizer(moment);
const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure(); // For Add Event
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure(); // For Edit Event
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // Format events for react-big-calendar
  const formattedEvents = events.map((event) => {
    const startTime = moment(`${event.date}T${event.time}`);
    const endTime = moment(startTime).add(1, "hours");
    return {
      title: event.eventName || "No Title", // Fallback for undefined title
      start: startTime.toDate(),
      end: endTime.toDate(),
      allDay: false,
      id: event.id,
      location: event.location,
    };
  });

  const handleAddOrUpdateEvent = (e) => {
    e.preventDefault();
    const newEvent = { eventName, date, time, location };

    if (editingEvent) {
      fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
        .then(() => {
          setEvents((prevEvents) =>
            prevEvents.map((item) =>
              item.id === editingEvent.id ? newEvent : item
            )
          );
          onEditClose();
        })
        .catch(() => alert("Error updating event. Please try again."));
    } else {
      fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
        .then(() => {
          setEvents((prevEvents) => [
            ...prevEvents,
            { ...newEvent, id: new Date().getTime() },
          ]);
          onClose(); // Close Add Event modal
        })
        .catch(() => alert("Error adding event. Please try again."));
    }
  };

  const handleEditEvent = (event) => {
    const selectedEvent = events.find((item) => item.id === event.id);
    setEditingEvent(selectedEvent);
    setEventName(selectedEvent.eventName);
    setDate(selectedEvent.date);
    setTime(selectedEvent.time);
    setLocation(selectedEvent.location);
    onEditOpen(); // Open Edit Event modal
  };

  const handleDeleteEvent = (event) => {
    fetch(`${API_URL}/api/events/${event.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setEvents(events.filter((item) => item.id !== event.id));
      })
      .catch((err) => console.error("Error deleting event:", err));
  };

  // Clear modal fields when adding a new event
  const clearFields = () => {
    setEventName("");
    setDate("");
    setTime("");
    setLocation("");
  };

  // When opening the "Add Event" modal, clear fields
  const handleAddEventClick = () => {
    clearFields();
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
        bg="white"
        boxShadow="xl"
        borderRadius="lg"
        p={6}
        mb={6}
        _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
        transition="all 0.3s ease-in-out"
      >
        <Calendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, marginBottom: "40px" }}
          selectable
          views={["month", "week", "day", "agenda"]} // Added "agenda" (list) view
          onSelectEvent={handleEditEvent}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: "#38B2AC", // Teal background for events
              borderRadius: "5px",
              padding: "5px",
              color: "white",
              border: "none",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease-in-out",
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

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{ borderColor: "teal.600", boxShadow: "md" }}
                />
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
