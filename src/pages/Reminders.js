import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";
const API_URL = process.env.REACT_APP_API_URL;

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editingReminder, setEditingReminder] = useState(null);

  // State for delete confirmation dialog
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deletingReminderId, setDeletingReminderId] = useState(null);
  const cancelRef = useRef();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`${API_URL}/api/reminders`)
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddReminder = (e) => {
    e.preventDefault();
    const newReminder = {
      title,
      description,
      reminder_date: reminderDate,
      time,
      message,
      created_by: userId,
    };

    if (editingReminder) {
      fetch(`${API_URL}/api/reminders/${editingReminder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      })
        .then(() => {
          setReminders((prevReminders) =>
            prevReminders.map((item) =>
              item.id === editingReminder.id ? newReminder : item
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

  const handleDeleteReminder = () => {
    fetch(`${API_URL}/api/reminders/${deletingReminderId}`, {
      method: "DELETE",
    })
      .then(() => {
        setReminders(
          reminders.filter((item) => item.id !== deletingReminderId)
        );
        onDeleteClose();
      })
      .catch((err) => {
        console.error("Error deleting reminder:", err);
        onDeleteClose();
      });
  };

  const openDeleteDialog = (id) => {
    setDeletingReminderId(id);
    onDeleteOpen();
  };

  const handleEditReminder = (item) => {
    setEditingReminder(item);
    setTitle(item.title);
    setDescription(item.description);
    setReminderDate(item.reminder_date);
    setTime(item.time);
    setMessage(item.message);
    onEditOpen();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Reminders</Heading>

      <Button leftIcon={<AddIcon />} onClick={onOpen} colorScheme="teal" mb={4}>
        Add Reminder
      </Button>

      <Stack spacing={4}>
        {reminders.map((item) => (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
            p={4}
            bg="white"
            _hover={{ boxShadow: "md", bg: "gray.50" }}
          >
            <Heading fontSize="lg" mb={2}>
              {item.title}
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {item.description}
            </Text>
            <Text fontSize="sm" mb={1}>
              <strong>Date:</strong> {item.reminder_date}
            </Text>
            <Text fontSize="sm" mb={1}>
              <strong>Time:</strong> {item.time}
            </Text>
            <Text fontSize="sm" mb={2}>
              <strong>Message:</strong> {item.message}
            </Text>
            <Stack direction="row" spacing={2}>
              <IconButton
                icon={<EditIcon />}
                colorScheme="blue"
                onClick={() => handleEditReminder(item)}
              />
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={() => openDeleteDialog(item.id)}
              />
            </Stack>
          </Box>
        ))}
      </Stack>

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

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Reminder
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this reminder? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteReminder} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Reminders;
