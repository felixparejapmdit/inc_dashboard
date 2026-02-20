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
  Container,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  MapPin,
  Clock,
  RefreshCw,
  Repeat,
  Trash2,
  CalendarDays,
  Activity,
  AlertCircle
} from "lucide-react";
import { TimeIcon } from "@chakra-ui/icons";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const API_URL = process.env.REACT_APP_API_URL;
const MotionBox = motion.create(Box);

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
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- Hooks ---------- */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, blue.600, purple.600)",
    "linear(to-r, blue.400, purple.400)"
  );

  /* ---------- Data Fetching ---------- */
  const fetchEventsAndLocations = useCallback(async () => {
    setIsLoading(true);
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
        description: "Could not load events. Please check your system status.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEventsAndLocations();
  }, [fetchEventsAndLocations]);

  /* ---------- Memos ---------- */
  const formattedEvents = useMemo(() => {
    return events
      .map((event) => {
        const startTime = moment(`${event.date}T${event.time}`);
        return {
          title: event.eventName,
          start: startTime.toDate(),
          end: startTime.clone().add(1, "hours").toDate(),
          allDay: false,
          resource: event,
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
    const errors = {};
    if (!formData.eventName) errors.eventName = "Title is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.time) errors.time = "Time is required";
    if (!formData.location_id) errors.location_id = "Venue is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      date: moment(formData.date).format("YYYY-MM-DD"),
      time: moment(formData.time, "HH:mm").format("HH:mm:ss"),
    };

    try {
      const url = editingEvent ? `${API_URL}/api/events/${editingEvent.id}` : `${API_URL}/api/events`;
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Sync failed");

      await fetchEventsAndLocations();
      toast({ title: editingEvent ? "Event Updated" : "Event Commited", status: "success" });
      resetForm();
      onClose();
    } catch (err) {
      toast({ title: "Sync Error", description: err.message, status: "error" });
    }
  };

  const handleEditEvent = (eventData) => {
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
    onOpen();
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${editingEvent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Purge failed");
      await fetchEventsAndLocations();
      toast({ title: "Event Purged", status: "info" });
      resetForm();
      onClose();
    } catch (err) {
      toast({ title: "Purge Error", status: "error" });
    }
  };

  const handleEventDrop = async ({ event, start }) => {
    const updatedEvent = {
      ...event.resource,
      date: moment(start).format("YYYY-MM-DD"),
      time: moment(start).format("HH:mm:ss"),
    };
    try {
      const res = await fetch(`${API_URL}/api/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) throw new Error("Move failed");
      await fetchEventsAndLocations();
      toast({ title: "Event Rescheduled", status: "success", duration: 1500 });
    } catch (err) {
      toast({ title: "Drop Sync Error", status: "error" });
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        {/* Header */}
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} mb={8} gap={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={CalendarIcon} boxSize={8} color="blue.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                PMD Events
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage events</Text>
          </VStack>

          <HStack spacing={3}>
            <ButtonGroup isAttached variant="outline" size="lg">
              <Tooltip label="Timeline Grid">
                <IconButton
                  aria-label="Calendar"
                  icon={<CalendarDays size={20} />}
                  onClick={() => setViewMode('calendar')}
                  colorScheme={viewMode === 'calendar' ? 'blue' : 'gray'}
                  variant={viewMode === 'calendar' ? 'solid' : 'outline'}
                  borderRadius="xl"
                />
              </Tooltip>
              <Tooltip label="Analytical List">
                <IconButton
                  aria-label="List"
                  icon={<List size={20} />}
                  onClick={() => setViewMode('list')}
                  colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                  variant={viewMode === 'list' ? 'solid' : 'outline'}
                  borderRadius="xl"
                />
              </Tooltip>
            </ButtonGroup>
            <Button
              leftIcon={<Plus size={20} />}
              colorScheme="blue"
              onClick={() => { resetForm(); onOpen(); }}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Dispatch Event
            </Button>
            <IconButton icon={<RefreshCw size={20} />} onClick={fetchEventsAndLocations} isLoading={isLoading} size="lg" borderRadius="xl" variant="ghost" />
          </HStack>
        </Flex>

        {/* Dash Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <MotionBox whileHover={{ y: -4 }} bg={cardBg} p={5} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">Total Engagements</Text>
                <Text fontSize="3xl" fontWeight="black" color="blue.500">{events.length}</Text>
              </VStack>
              <Box p={3} bg="blue.50" borderRadius="xl"><Icon as={Activity} boxSize={6} color="blue.500" /></Box>
            </HStack>
          </MotionBox>
        </SimpleGrid>

        {/* Content Area */}
        <Box bg={cardBg} borderRadius="3xl" shadow="2xl" border="1px solid" borderColor={borderColor} overflow="hidden" p={4}>
          <AnimatePresence mode="wait">
            {viewMode === "calendar" ? (
              <MotionBox key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} height="750px">
                <DnDCalendar
                  localizer={localizer}
                  events={formattedEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%", borderRadius: "20px" }}
                  selectable
                  popup
                  resizable
                  views={["month", "week", "day", "agenda"]}
                  onSelectEvent={handleEditEvent}
                  onEventDrop={handleEventDrop}
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: "#3182ce",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      border: "none",
                      padding: "4px 8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    },
                  })}
                />
              </MotionBox>
            ) : (
              <SimpleGrid key="list" columns={{ base: 1, md: 2, lg: 3 }} spacing={6} p={4}>
                {formattedEvents.map((evt) => (
                  <MotionBox
                    key={evt.id}
                    layout
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    onClick={() => handleEditEvent(evt)}
                    cursor="pointer"
                    bg={bg}
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow="sm"
                  >
                    <VStack align="start" spacing={3}>
                      <HStack w="100%" justify="space-between">
                        <Heading size="sm" fontWeight="black" color="blue.600">{evt.title}</Heading>
                        {evt.resource.recurrence !== 'none' && <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}><Repeat size={10} style={{ marginRight: '4px', display: 'inline' }} />{evt.resource.recurrence}</Badge>}
                      </HStack>
                      <Divider />
                      <VStack align="start" spacing={2} fontSize="sm">
                        <HStack color="gray.600"><Icon as={CalendarIcon} size={14} /><Text fontWeight="bold">{moment(evt.start).format("MMM DD, YYYY")}</Text></HStack>
                        <HStack color="gray.600"><Icon as={Clock} size={14} /><Text fontWeight="bold">{moment(evt.start).format("h:mm A")}</Text></HStack>
                        <HStack color="gray.600"><Icon as={MapPin} size={14} /><Text fontWeight="bold" noOfLines={1}>{evt.resource.locationName}</Text></HStack>
                      </VStack>
                    </VStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </AnimatePresence>
        </Box>
      </Container>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" shadow="dark-lg" p={2}>
          <ModalHeader fontSize="2xl" fontWeight="black">
            <HStack spacing={4}>
              <Box p={2} bg="blue.50" borderRadius="lg"><Icon as={editingEvent ? Edit2 : Plus} color="blue.500" /></Box>
              <Text>{editingEvent ? "Modify Dispatch" : "Initiate Engagement"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={4} mr={4} />
          <ModalBody py={6}>
            <VStack spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.eventName}>
                <FormLabel fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">Event Designation</FormLabel>
                <Input name="eventName" value={formData.eventName} onChange={handleChange} placeholder="e.g. Strategic Synergy Summit" size="lg" borderRadius="xl" focusBorderColor="blue.400" fontWeight="bold" />
                <FormErrorMessage>{formErrors.eventName}</FormErrorMessage>
              </FormControl>

              <SimpleGrid columns={2} w="100%" spacing={6}>
                <FormControl isRequired isInvalid={!!formErrors.date}>
                  <FormLabel fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">Deployment Date</FormLabel>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} size="lg" borderRadius="xl" focusBorderColor="blue.400" />
                  <FormErrorMessage>{formErrors.date}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!formErrors.time}>
                  <FormLabel fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">Activation Time</FormLabel>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} size="lg" borderRadius="xl" focusBorderColor="blue.400" />
                  <FormErrorMessage>{formErrors.time}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired isInvalid={!!formErrors.location_id}>
                <FormLabel fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">Operational Venue</FormLabel>
                <Select name="location_id" value={formData.location_id} onChange={handleChange} placeholder="Select Command Center" size="lg" borderRadius="xl" focusBorderColor="blue.400">
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </Select>
                <FormErrorMessage>{formErrors.location_id}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">Recurrence Protocol</FormLabel>
                <HStack spacing={4} w="100%">
                  <Icon as={Repeat} color="blue.400" />
                  <Select name="recurrence" value={formData.recurrence} onChange={handleChange} variant="filled" borderRadius="xl" size="lg" focusBorderColor="blue.400">
                    <option value="none">One-time Deployment</option>
                    <option value="daily">Daily Cycle</option>
                    <option value="weekly">Weekly Pulse</option>
                    <option value="monthly">Monthly Orbit</option>
                  </Select>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pb={8} px={8}>
            <Flex w="100%" justify="space-between" align="center">
              {editingEvent ? (
                <Button leftIcon={<Trash2 size={18} />} colorScheme="red" variant="ghost" onClick={handleDeleteEvent} borderRadius="xl">Terminate</Button>
              ) : <Box />}
              <HStack spacing={4}>
                <Button variant="ghost" onClick={onClose} borderRadius="xl">Abort</Button>
                <Button colorScheme="blue" onClick={handleSaveEvent} size="lg" borderRadius="xl" px={10} boxShadow="lg">Commit</Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const Edit2 = (props) => (
  <svg xmlns="http://www.w3.org/2003/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

export default Events;