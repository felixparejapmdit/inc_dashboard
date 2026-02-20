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
import { Bell, Search, Filter, Plus, Clock, Calendar, Check, Trash2, Edit3, MoreVertical, AlertTriangle, User } from "lucide-react";
import moment from "moment";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

const MotionBox = motion.create(Box);

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

  const userId = localStorage.getItem("user_id");
  const sectionId = localStorage.getItem("section_id");
  const subsectionId = localStorage.getItem("subsection_id");
  const personnelId = localStorage.getItem("personnel_id");
  const userName = localStorage.getItem("userFullName") || "User";

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
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
        const filteredData = filterPersonnelData(data);
        setReminders(filteredData);
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
    setTitle(item.title || "");
    setDescription(item.description || "");
    setReminderDate(moment(item.reminder_date).format("YYYY-MM-DD"));
    setTime(item.time || "");
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
      section_id: sectionId,
      subsection_id: subsectionId,
      personnel_id: personnelId, // Added personnel_id support
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
      return <Badge colorScheme="orange" variant="solid" borderRadius="full" px={3} py={0.5} fontWeight="black" textTransform="uppercase">Today</Badge>;
    } else if (reminderDate.isBefore(today)) {
      return <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} py={0.5} fontWeight="black" textTransform="uppercase">Past Due</Badge>;
    } else {
      return <Badge colorScheme="teal" variant="outline" borderRadius="full" px={3} py={0.5} fontWeight="black" textTransform="uppercase">Upcoming</Badge>;
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={10}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Bell} boxSize={8} color="orange.500" />
              <Heading size="xl" bgGradient="linear(to-r, orange.400, red.500)" bgClip="text" fontWeight="black" letterSpacing="tight">
                Personal Reminders
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Stay organized and never miss a task for your section.</Text>
          </VStack>

          <Button
            leftIcon={<Plus size={22} />}
            colorScheme="orange"
            size="lg"
            onClick={handleOpenAdd}
            borderRadius="2xl"
            px={8}
            boxShadow="0 8px 16px -4px rgba(251, 146, 60, 0.4)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 12px 20px -4px rgba(251, 146, 60, 0.3)",
            }}
          >
            Create Reminder
          </Button>
        </Flex>

        {/* Stats Row */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          {[
            { label: "Total Reminders", value: stats.total, color: "blue.500", icon: Bell },
            { label: "Alerts for Today", value: stats.today, color: "orange.500", icon: Clock },
            { label: "Upcoming Soon", value: stats.upcoming, color: "teal.500", icon: Calendar }
          ].map((stat, idx) => (
            <Box key={idx} bg={cardBg} p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor={borderColor} position="relative" overflow="hidden">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="widest">{stat.label}</Text>
                <Text fontSize="4xl" fontWeight="900" color={stat.color}>{stat.value}</Text>
              </VStack>
              <Icon as={stat.icon} position="absolute" right="-10px" bottom="-10px" boxSize={24} color={stat.color} opacity={0.05} transform="rotate(-15deg)" />
            </Box>
          ))}
        </SimpleGrid>

        {/* Toolbar Section */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={6}
          mb={8}
          align="center"
          justify="space-between"
          w="full"
        >
          <InputGroup maxW={{ base: "full", md: "450px" }} size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search content, titles, or messages..."
              bg={cardBg}
              borderRadius="2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              focusBorderColor="orange.400"
              shadow="sm"
              fontWeight="medium"
            />
          </InputGroup>

          <Tabs
            variant="soft-rounded"
            colorScheme="orange"
            size="md"
            onChange={(index) => {
              const types = ["all", "today", "upcoming", "past"];
              setFilterType(types[index]);
            }}
          >
            <TabList bg={cardBg} p={1.5} borderRadius="2xl" boxShadow="xs" border="1px solid" borderColor={borderColor}>
              <Tab px={6} fontWeight="bold">All</Tab>
              <Tab px={6} fontWeight="bold">Today</Tab>
              <Tab px={6} fontWeight="bold">Upcoming</Tab>
              <Tab px={6} fontWeight="bold">Past</Tab>
            </TabList>
          </Tabs>
        </Stack>

        {/* Reminders Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={10}>
              {[1, 2, 3].map((i) => (
                <Box key={i} h="240px" bg={cardBg} borderRadius="3xl" animation="pulse 2s infinite" />
              ))}
            </SimpleGrid>
          ) : filteredReminders.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={10}>
              {filteredReminders.map((item) => (
                <MotionBox
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  bg={cardBg}
                  p={8}
                  borderRadius="3xl"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <VStack align="start" spacing={5} h="full">
                    <Flex justify="space-between" w="full" align="center">
                      <HStack spacing={2} bg="orange.50" px={3} py={1} borderRadius="full">
                        <Icon as={Clock} color="orange.500" size={14} />
                        <Text fontSize="xs" fontWeight="900" color="orange.600">
                          {moment(item.time, "HH:mm").format("hh:mm A")}
                        </Text>
                      </HStack>
                      {getStatusBadge(item.reminder_date)}
                    </Flex>

                    <Box w="full">
                      <Heading fontSize="2xl" color="gray.800" fontWeight="900" letterSpacing="tight" mb={2}>
                        {item.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" noOfLines={3} fontWeight="medium" lineHeight="tall">
                        {item.description || "No specific details provided."}
                      </Text>
                    </Box>

                    <Divider />

                    <VStack align="start" spacing={3} w="full">
                      <HStack fontSize="xs" color="gray.600" fontWeight="bold">
                        <Icon as={Calendar} size={14} color="orange.400" />
                        <Text>{moment(item.reminder_date).format("MMMM DD, YYYY")}</Text>
                      </HStack>
                      {item.message && (
                        <Box bg="gray.50" p={3} borderRadius="2xl" border="1px solid" borderColor="gray.100" w="full">
                          <HStack fontSize="xs" color="gray.700" spacing={2}>
                            <Icon as={InfoOutlineIcon} color="blue.400" size={12} />
                            <Text fontWeight="bold" noOfLines={1}>{item.message}</Text>
                          </HStack>
                        </Box>
                      )}
                    </VStack>

                    <HStack w="full" justify="flex-end" spacing={2} pt={2}>
                      <IconButton
                        icon={<Edit3 size={18} />}
                        variant="ghost"
                        colorScheme="blue"
                        size="md"
                        borderRadius="xl"
                        onClick={() => handleEditRedirect(item)}
                        aria-label="Edit"
                      />
                      <IconButton
                        icon={<Trash2 size={18} />}
                        variant="ghost"
                        colorScheme="red"
                        size="md"
                        borderRadius="xl"
                        onClick={() => {
                          setDeletingReminderId(item.id);
                          onDeleteOpen();
                        }}
                        aria-label="Delete"
                      />
                    </HStack>
                  </VStack>

                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="8px"
                    h="100%"
                    bgGradient="linear(to-b, orange.400, red.500)"
                    opacity={0.8}
                  />
                </MotionBox>
              ))}
            </SimpleGrid>
          ) : (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={20}
              bg={cardBg}
              borderRadius="3xl"
              boxShadow="sm"
              textAlign="center"
            >
              <Icon as={AlertTriangle} boxSize={16} color="orange.200" />
              <Heading size="lg" mt={6} color="gray.700" fontWeight="black">Empty Workspace</Heading>
              <Text color="gray.400" fontSize="lg" mt={2} maxW="md">You don't have any reminders matching the current filter. Time to set some goals!</Text>
              <Button mt={8} colorScheme="orange" onClick={handleOpenAdd} size="lg" borderRadius="2xl" px={10}>Add Reminder</Button>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        motionPreset="scale"
      >
        <ModalOverlay backdropFilter="blur(15px)" bg="blackAlpha.700" />
        <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader bgGradient="linear(to-r, orange.500, red.600)" color="white" py={8}>
            <VStack align="start" spacing={1}>
              <HStack>
                <Icon as={Bell} />
                <Heading size="md">{editingReminder ? "Update Reminder" : "New Task Alert"}</Heading>
              </HStack>
              <Text fontSize="sm" fontWeight="normal" opacity={0.9}>
                {editingReminder ? "Keep your priorities up to date." : "Tell us what you need to be reminded about."}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={8} />

          <ModalBody p={10}>
            <VStack spacing={8}>
              <FormControl isRequired>
                <FormLabel fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.600">Reminder Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekly Report Submission"
                  borderRadius="2xl"
                  size="lg"
                  focusBorderColor="orange.400"
                  fontWeight="bold"
                  bg="gray.50"
                  py={8}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.600">Brief Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this about?"
                  borderRadius="2xl"
                  size="lg"
                  focusBorderColor="orange.400"
                  bg="gray.50"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.600">Target Date</FormLabel>
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    borderRadius="2xl"
                    size="lg"
                    focusBorderColor="orange.400"
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.600">Notify at</FormLabel>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    borderRadius="2xl"
                    size="lg"
                    focusBorderColor="orange.400"
                    bg="gray.50"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.600">Detailed Message</FormLabel>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any extra context or steps involved..."
                  borderRadius="2xl"
                  size="lg"
                  minH="120px"
                  focusBorderColor="orange.400"
                  bg="gray.50"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={10} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={4} onClick={onClose} borderRadius="2xl" size="lg">
              Discard
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleAddReminder}
              borderRadius="2xl"
              size="lg"
              px={12}
              shadow="xl"
              fontWeight="black"
              boxShadow="0 10px 20px -5px rgba(251, 146, 60, 0.4)"
            >
              {editingReminder ? "Save Changes" : "Activate Reminder"}
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
        <AlertDialogOverlay backdropFilter="blur(8px)" bg="blackAlpha.700">
          <AlertDialogContent borderRadius="3xl" p={4}>
            <AlertDialogHeader fontSize="2xl" fontWeight="900" color="red.600">
              Clear Reminder?
            </AlertDialogHeader>

            <AlertDialogBody fontWeight="medium" color="gray.600">
              This action cannot be undone. You will lose all captured details for this specific reminder.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="2xl" variant="ghost">
                Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteReminder} borderRadius="2xl" px={8} fontWeight="black">
                Yes, Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Reminders;
