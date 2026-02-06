import React, { useState, useEffect, useRef, useMemo } from "react";
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
  HStack,
  IconButton,
  useToast,
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
  SimpleGrid,
  Badge,
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
  Tabs,
  TabList,
  Tab,
  Flex,
  Icon,
  Tooltip,
  useColorModeValue,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  TimeIcon,
  CalendarIcon,
  CheckCircleIcon,
  InfoOutlineIcon,
  BellIcon
} from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Filter, Plus, Clock, Calendar, Check, Trash2, Edit3, MoreVertical, AlertTriangle } from "lucide-react";
import moment from "moment";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const MotionBox = motion(Box);

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, today, upcoming, past

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingReminder, setEditingReminder] = useState(null);
  const toast = useToast();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deletingReminderId, setDeletingReminderId] = useState(null);
  const cancelRef = useRef();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userFullName") || "User";

  // Colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    setLoading(true);
    fetchData(
      "reminders",
      (data) => {
        setReminders(data);
        setLoading(false);
      },
      (err) => {
        toast({
          title: "Error loading reminders",
          description: err,
          status: "error",
          duration: 3000,
        });
        setLoading(false);
      },
      "Failed to fetch reminders"
    );
  };

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setTitle("");
    setDescription("");
    setReminderDate("");
    setTime("");
    setMessage("");
    onOpen();
  };

  const handleEditRedirect = (item) => {
    setEditingReminder(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setReminderDate(moment(item.reminder_date).format("YYYY-MM-DD"));
    setTime(item.time);
    setMessage(item.message || "");
    onOpen();
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!title || !reminderDate || !time) {
      toast({
        title: "Required information missing",
        description: "Please fill in title, date, and time.",
        status: "warning",
      });
      return;
    }

    const payload = {
      title,
      description,
      reminder_date: reminderDate,
      time,
      message,
      created_by: userId,
    };

    try {
      if (editingReminder) {
        await putData("reminders", editingReminder.id, payload);
        toast({ title: "Reminder updated", status: "success" });
      } else {
        await postData("reminders", payload);
        toast({ title: "Reminder added", status: "success" });
      }
      onClose();
      loadReminders();
      // Trigger global sync for notification background worker
      window.dispatchEvent(new CustomEvent("sync-reminders"));
    } catch (error) {
      toast({
        title: "Error saving reminder",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleDeleteReminder = async () => {
    try {
      await deleteData("reminders", deletingReminderId);
      toast({ title: "Reminder deleted", status: "success" });
      onDeleteClose();
      loadReminders();
      // Trigger global sync for notification background worker
      window.dispatchEvent(new CustomEvent("sync-reminders"));
    } catch (error) {
      toast({
        title: "Error deleting reminder",
        description: error.message,
        status: "error",
      });
    }
  };

  // Filtering Logic
  const filteredReminders = useMemo(() => {
    let result = [...reminders];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.message && r.message.toLowerCase().includes(q))
      );
    }

    // Type filter
    const now = moment().startOf('day');
    if (filterType === "today") {
      result = result.filter(r => moment(r.reminder_date).isSame(now, 'day'));
    } else if (filterType === "upcoming") {
      result = result.filter(r => moment(r.reminder_date).isAfter(now, 'day'));
    } else if (filterType === "past") {
      result = result.filter(r => moment(r.reminder_date).isBefore(now, 'day'));
    }

    // Sort by date and time
    return result.sort((a, b) => {
      const dateA = moment(`${a.reminder_date} ${a.time}`);
      const dateB = moment(`${b.reminder_date} ${b.time}`);
      return dateA - dateB;
    });
  }, [reminders, searchQuery, filterType]);

  const stats = useMemo(() => {
    const now = moment().startOf('day');
    return {
      total: reminders.length,
      today: reminders.filter(r => moment(r.reminder_date).isSame(now, 'day')).length,
      upcoming: reminders.filter(r => moment(r.reminder_date).isAfter(now, 'day')).length,
    };
  }, [reminders]);

  const getStatusBadge = (date) => {
    const today = moment().startOf('day');
    const reminderDate = moment(date).startOf('day');

    if (reminderDate.isSame(today)) {
      return <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2}>Today</Badge>;
    } else if (reminderDate.isBefore(today)) {
      return <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2}>Past Due</Badge>;
    } else {
      return <Badge colorScheme="teal" variant="outline" borderRadius="full" px={2}>Upcoming</Badge>;
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="container.xl" py={8}>
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Bell} boxSize={8} color="orange.500" />
              <Heading size="xl" bgGradient="linear(to-r, orange.400, red.500)" bgClip="text">
                Personal Reminders
              </Heading>
            </HStack>
            <Text color="gray.500">Stay organized and never miss a task.</Text>
          </VStack>

          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="orange"
            size="lg"
            onClick={handleOpenAdd}
            boxShadow="0 4px 14px 0 rgba(251, 146, 60, 0.39)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(251, 146, 60, 0.23)",
            }}
          >
            Create New
          </Button>
        </Flex>

        {/* Stats Row */}
        <StatGroup
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor={borderColor}
          mb={8}
        >
          <Stat textAlign="center">
            <StatLabel color="gray.500" fontWeight="bold">Total Reminders</StatLabel>
            <StatNumber fontSize="3xl" color="blue.500">{stats.total}</StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel color="gray.500" fontWeight="bold">For Today</StatLabel>
            <StatNumber fontSize="3xl" color="orange.500">{stats.today}</StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel color="gray.500" fontWeight="bold">Upcoming</StatLabel>
            <StatNumber fontSize="3xl" color="teal.500">{stats.upcoming}</StatNumber>
          </Stat>
        </StatGroup>

        {/* Toolbar Section */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={4}
          mb={6}
          align="center"
          justify="space-between"
          w="full"
        >
          <InputGroup maxW={{ base: "full", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search reminders..."
              bg={cardBg}
              borderRadius="full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              focusBorderColor="orange.400"
            />
          </InputGroup>

          <Tabs
            variant="soft-rounded"
            colorScheme="orange"
            size="sm"
            onChange={(index) => {
              const types = ["all", "today", "upcoming", "past"];
              setFilterType(types[index]);
            }}
          >
            <TabList bg={cardBg} p={1} borderRadius="full" boxShadow="xs">
              <Tab>All</Tab>
              <Tab>Today</Tab>
              <Tab>Upcoming</Tab>
              <Tab>Past</Tab>
            </TabList>
          </Tabs>
        </Stack>

        {/* Reminders Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[1, 2, 3].map((i) => (
                <Box key={i} h="200px" bg={cardBg} borderRadius="2xl" animation="pulse 2s infinite" />
              ))}
            </SimpleGrid>
          ) : filteredReminders.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredReminders.map((item) => (
                <MotionBox
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="md"
                  border="1px solid"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                >
                  <VStack align="start" spacing={3} h="full">
                    <Flex justify="space-between" w="full" align="center">
                      <HStack spacing={2}>
                        <Icon as={Clock} color="orange.400" size={16} />
                        <Text fontSize="xs" fontWeight="bold" color="gray.400">
                          {item.time}
                        </Text>
                      </HStack>
                      {getStatusBadge(item.reminder_date)}
                    </Flex>

                    <Box w="full">
                      <Heading fontSize="xl" color="gray.800" mb={1} noOfLines={1}>
                        {item.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" noOfLines={2} h="40px">
                        {item.description || "No description provided."}
                      </Text>
                    </Box>

                    <Divider />

                    <VStack align="start" spacing={1} w="full">
                      <HStack fontSize="xs" color="gray.500">
                        <Icon as={Calendar} size={14} />
                        <Text>{moment(item.reminder_date).format("MMM DD, YYYY")}</Text>
                      </HStack>
                      {item.message && (
                        <HStack fontSize="xs" color="orange.600" bg="orange.50" px={2} py={1} borderRadius="md" w="full">
                          <Icon as={InfoOutlineIcon} size={12} />
                          <Text noOfLines={1}>{item.message}</Text>
                        </HStack>
                      )}
                    </VStack>

                    <HStack w="full" justify="flex-end" spacing={2} pt={2}>
                      <Tooltip label="Edit Task">
                        <IconButton
                          icon={<Edit3 size={18} />}
                          variant="ghost"
                          colorScheme="blue"
                          size="sm"
                          borderRadius="lg"
                          onClick={() => handleEditRedirect(item)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete Task">
                        <IconButton
                          icon={<Trash2 size={18} />}
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          borderRadius="lg"
                          onClick={() => {
                            setDeletingReminderId(item.id);
                            onDeleteOpen();
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>

                  {/* Decorative element */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="4px"
                    h="100%"
                    bgGradient="linear(to-b, orange.300, red.400)"
                  />
                </MotionBox>
              ))}
            </SimpleGrid>
          ) : (
            <Flex direction="column" align="center" justify="center" p={12} bg={cardBg} borderRadius="2xl" boxShadow="sm">
              <AlertTriangle size={48} color="orange" />
              <Heading size="md" mt={4} color="gray.700">No reminders found</Heading>
              <Text color="gray.500">Try adjusting your filters or create a new one.</Text>
            </Flex>
          )}
        </AnimatePresence>
      </Container>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader bg="orange.500" color="white" py={6}>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg">{editingReminder ? "Update Reminder" : "New Reminder"}</Text>
              <Text fontSize="sm" fontWeight="normal" opacity={0.8}>
                {editingReminder ? "Keep your task information up to date" : "Set a new alert for yourself"}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={6} />

          <ModalBody p={8}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="orange.400"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Short Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A quick summary..."
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="orange.400"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Date</FormLabel>
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="orange.400"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Time</FormLabel>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="orange.400"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="bold">Extended Message</FormLabel>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed instructions or context..."
                  borderRadius="xl"
                  size="lg"
                  minH="100px"
                  focusBorderColor="orange.400"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={8} bg="gray.50">
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleAddReminder}
              borderRadius="xl"
              size="lg"
              px={10}
              shadow="md"
            >
              {editingReminder ? "Save Changes" : "Create Reminder"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete alert */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay backdropFilter="blur(5px)">
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Deletion
            </AlertDialogHeader>

            <AlertDialogBody>
              Permanently remove this reminder? This will clear all data associated with it.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="xl">
                Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteReminder} ml={3} borderRadius="xl">
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Reminders;
