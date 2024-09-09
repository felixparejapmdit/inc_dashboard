import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch events data
  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const newEvent = { eventName, date, time, location };

    if (editingEvent) {
      fetch(`${API_URL}/api/events/${editingEvent.eventName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      })
        .then(() => {
          setEvents((prevEvents) =>
            prevEvents.map((item) =>
              item.eventName === editingEvent.eventName ? newEvent : item
            )
          );
          onEditClose();
        })
        .catch(() => alert("Error updating event. Please try again."));
    } else {
      fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      })
        .then(() => {
          setEvents((prevEvents) => [...prevEvents, newEvent]);
          onClose();
        })
        .catch(() => alert("Error adding event. Please try again."));
    }
  };

  const handleDeleteEvent = (eventName) => {
    fetch(`${API_URL}/api/events/${eventName}`, {
      method: "DELETE",
    })
      .then(() => {
        setEvents(events.filter((item) => item.eventName !== eventName));
      })
      .catch((err) => console.error("Error deleting event:", err));
  };

  const handleEditEvent = (item) => {
    setEditingEvent(item);
    setEventName(item.eventName);
    setDate(item.date);
    setTime(item.time);
    setLocation(item.location);
    onEditOpen();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Events</Heading>

      <Button leftIcon={<AddIcon />} onClick={onOpen} colorScheme="teal" mb={4}>
        Add Event
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Event Name</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Location</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {events.map((item, index) => (
            <Tr key={index}>
              <Td>{item.eventName}</Td>
              <Td>{item.date}</Td>
              <Td>{item.time}</Td>
              <Td>{item.location}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleEditEvent(item)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleDeleteEvent(item.eventName)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen || isEditOpen} onClose={onClose || onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingEvent ? "Edit Event" : "Add Event"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Event Name</FormLabel>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter Event Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddEvent}>
              {editingEvent ? "Save Changes" : "Add Event"}
            </Button>
            <Button onClick={onClose || onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Events;
