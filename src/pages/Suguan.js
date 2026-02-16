import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  HStack,
  useToast,
  useDisclosure,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  Flex,
  Divider,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Spacer,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Search,
  Filter,
  Briefcase,
  AlertCircle,
  CheckCircle,
  BookOpen
} from "lucide-react";
import moment from "moment";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const MotionBox = motion.create(Box);

const Suguan = () => {
  const [suguan, setSuguan] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("isoWeek"));
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [district_id, setDistrictId] = useState("");
  const [local_id, setLocalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gampanin_id, setGampaninId] = useState("");
  const [editingSuguan, setEditingSuguan] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const gampanin = [
    { value: "1", name: "Sugo" },
    { value: "2", name: "Sugo 1" },
    { value: "3", name: "Sugo 2" },
    { value: "4", name: "Reserba" },
    { value: "5", name: "Reserba 1" },
    { value: "6", name: "Reserba 2" },
  ];

  // Colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, teal.500, blue.600)",
    "linear(to-r, teal.300, blue.400)"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchData("districts", setDistricts),
        fetchSuguan()
      ]);
    } catch (error) {
      console.error("Error loading suguan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuguan = async () => {
    try {
      const data = await fetchData("suguan");
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => {
          return moment(`${a.date} ${a.time}`).unix() - moment(`${b.date} ${b.time}`).unix();
        });
        setSuguan(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch suguan:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setDistrictId("");
    setLocalId("");
    setDate("");
    setTime("");
    setGampaninId("");
    setEditingSuguan(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    onOpen();
  };

  const handleEdit = (item) => {
    setEditingSuguan(item);
    setName(item.name);
    setDistrictId(item.district_id);
    setLocalId(item.local_congregation);
    setDate(moment(item.date).format("YYYY-MM-DD"));
    setTime(moment(item.time, "HH:mm:ss").format("HH:mm"));
    setGampaninId(item.gampanin_id.toString());
    onOpen();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !district_id || !local_id || !date || !time || !gampanin_id) {
      toast({ title: "Please fill all required fields", status: "warning" });
      return;
    }

    const payload = {
      name,
      district_id,
      local_id,
      date,
      time,
      gampanin_id,
    };

    try {
      if (editingSuguan) {
        await putData("suguan", editingSuguan.id, payload);
        toast({ title: "Schedule updated", status: "success" });
      } else {
        await postData("suguan", payload);
        toast({ title: "Schedule added", status: "success" });
      }
      onClose();
      fetchSuguan();
      // Trigger global sync for notification background worker
      window.dispatchEvent(new CustomEvent("sync-suguan"));
    } catch (error) {
      toast({ title: "Error saving schedule", description: error.message, status: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await deleteData("suguan", id);
        setSuguan(prev => prev.filter(item => item.id !== id));
        toast({ title: "Schedule deleted", status: "success" });
        // Trigger global sync for notification background worker
        window.dispatchEvent(new CustomEvent("sync-suguan"));
      } catch (error) {
        toast({ title: "Error deleting schedule", status: "error" });
      }
    }
  };

  // Week Navigation
  const startOfWeek = currentWeek.clone().startOf("isoWeek");
  const endOfWeek = currentWeek.clone().endOf("isoWeek");

  const handlePrevWeek = () => setCurrentWeek(prev => prev.clone().subtract(1, "week"));
  const handleNextWeek = () => setCurrentWeek(prev => prev.clone().add(1, "week"));

  // Filtering Logic
  const filteredSuguan = useMemo(() => {
    let result = suguan.filter(item => {
      const d = moment(item.date);
      return d.isBetween(startOfWeek, endOfWeek, null, "[]");
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.local_congregation.toLowerCase().includes(q)
      );
    }

    return result;
  }, [suguan, currentWeek, searchQuery]);

  const midweekSuguan = filteredSuguan.filter(item => moment(item.date).isoWeekday() <= 4);
  const weekendSuguan = filteredSuguan.filter(item => moment(item.date).isoWeekday() > 4);

  const stats = {
    total: filteredSuguan.length,
    midweek: midweekSuguan.length,
    weekend: weekendSuguan.length
  };

  const getGampaninName = (id) => gampanin.find(g => String(g.value) === String(id))?.name || "N/A";
  const getDistrictName = (id) => districts.find(d => String(d.id) === String(id))?.name || "N/A";

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
            <Heading size="xl" bgGradient={headerGradient} bgClip="text">
              Suguan Management
            </Heading>
            <Text color="gray.500" fontWeight="medium">Organize and monitor weekly assignments</Text>
          </VStack>

          <Button
            leftIcon={<Plus size={20} />}
            colorScheme="teal"
            size="lg"
            onClick={handleOpenAdd}
            boxShadow="0 4px 14px 0 rgba(45, 212, 191, 0.39)"
            _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(45, 212, 191, 0.23)" }}
          >
            Add Suguan
          </Button>
        </Flex>

        {/* Stats & Navigation Row */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>

          {/* Week Selector */}
          <Box bg={cardBg} p={4} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
            <VStack spacing={3}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                Schedule Viewing
              </Text>
              <HStack w="full" justify="space-between">
                <IconButton
                  icon={<ChevronLeft size={20} />}
                  onClick={handlePrevWeek}
                  variant="ghost"
                  borderRadius="lg"
                  aria-label="Previous Week"
                />
                <VStack spacing={0}>
                  <Text fontWeight="bold">Week {currentWeek.isoWeek()}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {startOfWeek.format("MMM DD")} - {endOfWeek.format("MMM DD, YYYY")}
                  </Text>
                </VStack>
                <IconButton
                  icon={<ChevronRight size={20} />}
                  onClick={handleNextWeek}
                  variant="ghost"
                  borderRadius="lg"
                  aria-label="Next Week"
                />
              </HStack>
            </VStack>
          </Box>

          {/* Stats Bar */}
          <StatGroup
            gridColumn={{ lg: "span 2" }}
            bg={cardBg}
            p={4}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <Stat textAlign="center">
              <StatLabel color="gray.500" fontSize="sm">Weekly Total</StatLabel>
              <StatNumber fontSize="2xl" color="teal.500">{stats.total}</StatNumber>
            </Stat>
            <Stat textAlign="center" borderLeft="1px solid" borderColor={borderColor}>
              <StatLabel color="gray.500" fontSize="sm">Midweek</StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">{stats.midweek}</StatNumber>
            </Stat>
            <Stat textAlign="center" borderLeft="1px solid" borderColor={borderColor}>
              <StatLabel color="gray.500" fontSize="sm">Weekend</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">{stats.weekend}</StatNumber>
            </Stat>
          </StatGroup>
        </SimpleGrid>

        {/* Search Bar */}
        <InputGroup mb={8} size="lg">
          <InputLeftElement pointerEvents="none">
            <Search size={20} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name or congregation..."
            bg={cardBg}
            borderRadius="xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            focusBorderColor="teal.400"
            boxShadow="sm"
          />
        </InputGroup>

        {/* Schedule Display */}
        {filteredSuguan.length === 0 ? (
          <Flex direction="column" align="center" justify="center" p={20} bg={cardBg} borderRadius="3xl" boxShadow="sm">
            <Icon as={AlertCircle} boxSize={12} color="orange.400" />
            <Heading size="md" mt={4} color="gray.700">No schedule found</Heading>
            <Text color="gray.500">There are no assignments for this week or search criteria.</Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="start">

            {/* Midweek Section */}
            <VStack align="stretch" spacing={4}>
              <HStack px={2}>
                <Icon as={BookOpen} color="blue.500" />
                <Heading size="md" color="gray.700">Midweek Assignments</Heading>
                <Badge ml={2} colorScheme="blue" borderRadius="full" px={2}>{midweekSuguan.length}</Badge>
              </HStack>
              <AnimatePresence>
                {midweekSuguan.map((item) => (
                  <SuguanCard
                    key={item.id}
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    districtName={getDistrictName(item.district_id)}
                    gampaninName={getGampaninName(item.gampanin_id)}
                    cardBg={cardBg}
                    borderColor={borderColor}
                  />
                ))}
              </AnimatePresence>
              {midweekSuguan.length === 0 && <Text p={8} textAlign="center" color="gray.400" bg={cardBg} borderRadius="xl" border="1px dashed" borderColor={borderColor}>Empty midweek</Text>}
            </VStack>

            {/* Weekend Section */}
            <VStack align="stretch" spacing={4}>
              <HStack px={2}>
                <Icon as={Users} color="purple.500" />
                <Heading size="md" color="gray.700">Weekend Assignments</Heading>
                <Badge ml={2} colorScheme="purple" borderRadius="full" px={2}>{weekendSuguan.length}</Badge>
              </HStack>
              <AnimatePresence>
                {weekendSuguan.map((item) => (
                  <SuguanCard
                    key={item.id}
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    districtName={getDistrictName(item.district_id)}
                    gampaninName={getGampaninName(item.gampanin_id)}
                    cardBg={cardBg}
                    borderColor={borderColor}
                  />
                ))}
              </AnimatePresence>
              {weekendSuguan.length === 0 && <Text p={8} textAlign="center" color="gray.400" bg={cardBg} borderRadius="xl" border="1px dashed" borderColor={borderColor}>Empty weekend</Text>}
            </VStack>

          </SimpleGrid>
        )}
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader bg="teal.500" color="white" py={6} borderTopRadius="3xl">
            <HStack>
              <Icon as={editingSuguan ? Edit3 : Plus} />
              <Text>{editingSuguan ? "Edit Assignment" : "New Assignment"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={6} />

          <ModalBody p={8}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Personnel Name</FormLabel>
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">District</FormLabel>
                  <Select
                    placeholder="Select District"
                    value={district_id}
                    onChange={(e) => setDistrictId(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="teal.400"
                  >
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Congregation</FormLabel>
                  <Input
                    placeholder="Local Name"
                    value={local_id}
                    onChange={(e) => setLocalId(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="teal.400"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Date</FormLabel>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="teal.400"
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
                    focusBorderColor="teal.400"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">Gampanin (Role)</FormLabel>
                <Select
                  placeholder="Select Role"
                  value={gampanin_id}
                  onChange={(e) => setGampaninId(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="teal.400"
                >
                  {gampanin.map(g => <option key={g.value} value={g.value}>{g.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={8} bg="gray.50" borderBottomRadius="3xl">
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancel</Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              borderRadius="xl"
              size="lg"
              px={10}
              boxShadow="lg"
            >
              {editingSuguan ? "Save Changes" : "Create Schedule"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Subcomponent: SuguanCard
const SuguanCard = ({ item, onEdit, onDelete, districtName, gampaninName, cardBg, borderColor }) => {
  const isWeekend = moment(item.date).isoWeekday() > 4;
  const accentColor = isWeekend ? "purple.500" : "blue.500";
  const accentLight = isWeekend ? "purple.50" : "blue.50";

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      bg={cardBg}
      p={6}
      borderRadius="2xl"
      boxShadow="md"
      border="1px solid"
      borderColor={borderColor}
      position="relative"
      transition={{ duration: 0.2 }}
    >
      <VStack align="start" spacing={3}>
        <Flex w="full" justify="space-between" align="center">
          <Badge
            colorScheme={isWeekend ? "purple" : "blue"}
            variant="solid"
            borderRadius="lg"
            px={3}
            py={1}
            fontSize="xs"
          >
            {moment(item.date).format("dddd")}
          </Badge>
          <HStack spacing={1}>
            <Tooltip label="Edit Assignment">
              <IconButton
                icon={<Edit3 size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={onEdit}
              />
            </Tooltip>
            <Tooltip label="Delete Assignment">
              <IconButton
                icon={<Trash2 size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onDelete}
              />
            </Tooltip>
          </HStack>
        </Flex>

        <Box>
          <Text fontWeight="black" fontSize="xl" color="gray.800" lineHeight="1.2">
            {item.name}
          </Text>
          <HStack mt={1} spacing={2}>
            <Icon as={Briefcase} size={14} color={accentColor} />
            <Text fontWeight="bold" color={accentColor} fontSize="sm">{gampaninName}</Text>
          </HStack>
        </Box>

        <Divider />

        <VStack align="start" spacing={2} w="full">
          <HStack color="gray.600" fontSize="sm">
            <Icon as={MapPin} size={14} />
            <Text fontWeight="semibold">{item.local_congregation}</Text>
            <Text color="gray.400" fontSize="xs">({districtName})</Text>
          </HStack>

          <Flex w="full" justify="space-between" bg={accentLight} p={2} borderRadius="xl" align="center">
            <HStack color={accentColor}>
              <Icon as={Calendar} size={14} />
              <Text fontWeight="bold" fontSize="xs">{moment(item.date).format("MMM DD, YYYY")}</Text>
            </HStack>
            <HStack color={accentColor}>
              <Icon as={Clock} size={14} />
              <Text fontWeight="bold" fontSize="xs">{moment(item.time, "HH:mm").format("hh:mm A")}</Text>
            </HStack>
          </Flex>
        </VStack>
      </VStack>

      <Box
        position="absolute"
        left={0}
        top="20%"
        bottom="20%"
        w="4px"
        bg={accentColor}
        borderRightRadius="full"
      />
    </MotionBox>
  );
};

export default Suguan;
