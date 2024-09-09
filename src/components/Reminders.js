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

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editingReminder, setEditingReminder] = useState(null);

  // Fetch reminders data
  useEffect(() => {
    fetch(`${API_URL}/api/reminders`)
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddReminder = (e) => {
    e.preventDefault();
    const newReminder = { title, date, time, message };

    if (editingReminder) {
      fetch(`${API_URL}/api/reminders/${editingReminder.title}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      })
        .then(() => {
          setReminders((prevReminders) =>
            prevReminders.map((item) =>
              item.title === editingReminder.title ? newReminder : item
            )
          );
          onEditClose();
        })
        .catch(() => alert("Error updating reminder. Please try again."));
    } else {
      fetch(`${API_URL}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      })
        .then(() => {
          setReminders((prevReminders) => [...prevReminders, newReminder]);
          onClose();
        })
        .catch(() => alert("Error adding reminder. Please try again."));
    }
  };

  const handleDeleteReminder = (title) => {
    fetch(`${API_URL}/api/reminders/${title}`, {
      method: "DELETE",
    })
      .then(() => {
        setReminders(reminders.filter((item) => item.title !== title));
      })
      .catch((err) => console.error("Error deleting reminder:", err));
  };

  const handleEditReminder = (item) => {
    setEditingReminder(item);
    setTitle(item.title);
    setDate(item.date);
    setTime(item.time);
    setMessage(item.message);
    onEditOpen();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Reminders</Heading>

      <Button leftIcon={<AddIcon />} onClick={onOpen} colorScheme="teal" mb={4}>
        Add Reminder
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Message</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reminders.map((item, index) => (
            <Tr key={index}>
              <Td>{item.title}</Td>
              <Td>{item.date}</Td>
              <Td>{item.time}</Td>
              <Td>{item.message}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleEditReminder(item)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleDeleteReminder(item.title)}
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
          <ModalHeader>
            {editingReminder ? "Edit Reminder" : "Add Reminder"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Title"
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
                <FormLabel>Message</FormLabel>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter Message"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddReminder}>
              {editingReminder ? "Save Changes" : "Add Reminder"}
            </Button>
            <Button onClick={onClose || onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Reminders;
