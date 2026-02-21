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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Center,
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
  BookOpen,
  Download,
  FileText,
  Printer,
  CalendarDays,
  MoreVertical
} from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

import ReactSelect from "react-select";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL = process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;
const MotionBox = motion.create(Box);

const Suguan = () => {
  const [suguan, setSuguan] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [localCongregations, setLocalCongregations] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("isoWeek"));
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [personnel_id, setPersonnelId] = useState("");
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
    { value: "7", name: "Sugo SL" },
    { value: "8", name: "Reserba SL" },
    { value: "9", name: "Kasama sa Tribuna" },
  ];

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, teal.500, blue.600)",
    "linear(to-r, teal.300, blue.500)"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchData("districts", setDistricts, null, null, null, null, DISTRICT_API_URL),
        fetchData("all-congregations", setLocalCongregations, null, null, null, null, LOCAL_CONGREGATION_API_URL),
        fetchData("personnels", setPersonnels),
        fetchData("sections", setSections),
        fetchSuguan()
      ]);
    } catch (error) {
      console.error("Error loading suguan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuguan = async () => {
    return fetchData(
      "suguan",
      (data) => {
        if (Array.isArray(data)) {
          const filteredData = filterPersonnelData(data);
          const sorted = filteredData.sort((a, b) => {
            return moment(`${a.date} ${a.time}`).unix() - moment(`${b.date} ${b.time}`).unix();
          });
          setSuguan(sorted);
        } else {
          setSuguan([]);
        }
      },
      (err) => console.error("Error fetching Suguan:", err),
      "Failed to fetch Suguan"
    );
  };

  const resetForm = () => {
    setName("");
    setPersonnelId("");
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
    setPersonnelId(item.personnel_id || "");
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

    const dayOfWeek = moment(date).isoWeekday();
    if (dayOfWeek === 1 || dayOfWeek === 2) {
      toast({
        title: "Invalid Service Date",
        description: "Service dates cannot be on Monday or Tuesday.",
        status: "warning",
      });
      return;
    }

    const sectionId = localStorage.getItem("section_id");
    const subsectionId = localStorage.getItem("subsection_id");

    const payload = {
      name,
      personnel_id,
      district_id,
      local_id: local_id,
      date,
      time,
      gampanin_id,
      section_id: sectionId,
      subsection_id: subsectionId,
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
        window.dispatchEvent(new CustomEvent("sync-suguan"));
      } catch (error) {
        toast({ title: "Error deleting schedule", status: "error" });
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredSuguan.map(item => ({
      Week: `Week ${moment(item.date).isoWeek()}`,
      Day: moment(item.date).format("dddd"),
      Date: moment(item.date).format("MMM DD, YYYY"),
      Time: moment(item.time, "HH:mm").format("hh:mm A"),
      Personnel: item.name,
      Role: getGampaninName(item.gampanin_id),
      Congregation: item.local_congregation,
      District: getDistrictName(item.district_id)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suguan Schedule");
    XLSX.writeFile(wb, `Suguan_Report_Week_${currentWeek.isoWeek()}.xlsx`);

    toast({
      title: "Report Generated",
      description: "Excel file has been downloaded.",
      status: "success",
      duration: 3000,
    });
  };

  const startOfWeek = currentWeek.clone().startOf("isoWeek");
  const endOfWeek = currentWeek.clone().endOf("isoWeek");

  const handlePrevWeek = () => setCurrentWeek(prev => prev.clone().subtract(1, "week"));
  const handleNextWeek = () => setCurrentWeek(prev => prev.clone().add(1, "week"));
  const handleGoToToday = () => setCurrentWeek(moment().startOf("isoWeek"));

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
    if (selectedSection) {
      result = result.filter(item => String(item.section_id) === String(selectedSection));
    }

    return result;
  }, [suguan, currentWeek, searchQuery, selectedSection]);

  const stats = {
    total: filteredSuguan.length,
    midweek: filteredSuguan.filter(item => moment(item.date).isoWeekday() <= 4).length,
    weekend: filteredSuguan.filter(item => moment(item.date).isoWeekday() > 4).length
  };

  const getGampaninName = (id) => gampanin.find(g => String(g.value) === String(id))?.name || "N/A";
  const getDistrictName = (id) => districts.find(d => String(d.id) === String(id))?.name || "N/A";

  const filteredLocalCongregations = useMemo(() => {
    if (!district_id) return [];
    return localCongregations.filter(lc => String(lc.district_id) === String(district_id));
  }, [localCongregations, district_id]);

  const filteredPersonnels = useMemo(() => {
    const allowedTypes = ["Minister", "Regular", "Ministerial Student", "Volunteer"];
    return personnels
      .filter(p => allowedTypes.includes(p.personnel_type))
      .sort((a, b) => {
        const nameA = `${a.surname_husband}, ${a.givenname}`.toLowerCase();
        const nameB = `${b.surname_husband}, ${b.givenname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [personnels]);

  const personnelOptions = useMemo(() => {
    return filteredPersonnels.map(p => ({
      value: p.personnel_id,
      label: `${p.surname_husband}, ${p.givenname}`,
      name: `${p.givenname} ${p.surname_husband}`
    }));
  }, [filteredPersonnels]);

  const hasFriday = useMemo(() => filteredSuguan.some(item => moment(item.date).isoWeekday() === 5), [filteredSuguan]);
  const gridColumns = hasFriday ? { base: 1, xl: 6 } : { base: 1, xl: 5 };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#38B2AC" : "inherit",
      padding: "2px",
      boxShadow: state.isFocused ? "0 0 0 1px #38B2AC" : "none",
      "&:hover": { borderColor: "#38B2AC" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#38B2AC" : state.isFocused ? "#E6FFFA" : "white",
      color: state.isSelected ? "white" : "black",
    })
  };

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
              Suguan Management
            </Heading>
            <Text color="gray.500" fontWeight="medium">Organize and monitor weekly assignments for your section</Text>
          </VStack>

          <HStack spacing={3}>
            <Box minW="220px">
              <ReactSelect
                options={sections.map(s => ({ value: s.id, label: s.name }))}
                onChange={(opt) => setSelectedSection(opt ? opt.value : "")}
                placeholder="Filter by Section"
                styles={customSelectStyles}
                isClearable
              />
            </Box>
            <Button
              leftIcon={<Download size={18} />}
              variant="outline"
              colorScheme="teal"
              size="lg"
              onClick={handleExportExcel}
              borderRadius="xl"
            >
              Export Report
            </Button>
            <Button
              leftIcon={<Plus size={20} />}
              colorScheme="teal"
              size="lg"
              onClick={handleOpenAdd}
              borderRadius="xl"
              boxShadow="0 4px 14px 0 rgba(45, 212, 191, 0.39)"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(45, 212, 191, 0.23)" }}
            >
              Add Suguan
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={borderColor} position="relative" overflow="hidden">
            <VStack spacing={3} position="relative" zIndex={1}>
              <Flex w="full" justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="black" color="teal.500" textTransform="uppercase" letterSpacing="widest">
                  Current View
                </Text>
                <Button size="xs" variant="ghost" colorScheme="teal" onClick={handleGoToToday}>Today</Button>
              </Flex>
              <HStack w="full" justify="space-between">
                <IconButton
                  icon={<ChevronLeft size={22} />}
                  onClick={handlePrevWeek}
                  variant="ghost"
                  colorScheme="teal"
                  borderRadius="full"
                  aria-label="Previous Week"
                  _hover={{ bg: "teal.50" }}
                />
                <VStack spacing={0}>
                  <Text fontWeight="extrabold" fontSize="xl">Week {currentWeek.isoWeek()}</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    {startOfWeek.format("MMM DD")} - {endOfWeek.format("MMM DD, YYYY")}
                  </Text>
                </VStack>
                <IconButton
                  icon={<ChevronRight size={22} />}
                  onClick={handleNextWeek}
                  variant="ghost"
                  colorScheme="teal"
                  isDisabled={currentWeek.clone().add(1, "week").isAfter(moment())}
                  borderRadius="full"
                  aria-label="Next Week"
                  _hover={{ bg: "teal.50" }}
                />
              </HStack>
            </VStack>
            <Box position="absolute" top={0} left={0} w="full" h="2px" bg="teal.400" />
          </Box>

          <Box
            gridColumn={{ lg: "span 2" }}
            bg={cardBg}
            p={5}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            position="relative"
          >
            <StatGroup w="full">
              <Stat textAlign="center">
                <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Weekly Total</StatLabel>
                <StatNumber fontSize="3xl" color="teal.500" fontWeight="black">{stats.total}</StatNumber>
              </Stat>
              <Stat textAlign="center" borderLeft="1px solid" borderColor={borderColor}>
                <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Midweek</StatLabel>
                <StatNumber fontSize="3xl" color="blue.500" fontWeight="black">{stats.midweek}</StatNumber>
              </Stat>
              <Stat textAlign="center" borderLeft="1px solid" borderColor={borderColor}>
                <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Weekend</StatLabel>
                <StatNumber fontSize="3xl" color="purple.500" fontWeight="black">{stats.weekend}</StatNumber>
              </Stat>
            </StatGroup>
            <Box position="absolute" top={0} left={0} w="full" h="2px" bgGradient="linear(to-r, teal.400, blue.400, purple.400)" />
          </Box>
        </SimpleGrid>



        {filteredSuguan.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            direction="column"
            align="center"
            justify="center"
            p={20}
            bg={cardBg}
            borderRadius="3xl"
            boxShadow="sm"
            textAlign="center"
          >
            <Icon as={AlertCircle} boxSize={16} color="orange.300" />
            <Heading size="lg" mt={6} color="gray.700" fontWeight="black">No suguan found</Heading>
            <Text color="gray.500" fontSize="lg" mt={2}>There are no schedules listed for the selected week ({currentWeek.isoWeek()}).</Text>
            <Button mt={8} colorScheme="teal" onClick={handleOpenAdd} size="lg" borderRadius="xl">Create First Schedule</Button>
          </MotionBox>
        ) : (
          <Box
            w="full"
            bg={cardBg}
            borderRadius="3xl"
            boxShadow="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
          >
            {/* Header Row */}
            <SimpleGrid columns={gridColumns} bg="gray.50" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>
              <Text fontWeight="black" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Personnel</Text>
              <Text display={{ base: "none", xl: "block" }} fontWeight="black" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Wednesday</Text>
              <Text display={{ base: "none", xl: "block" }} fontWeight="black" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Thursday</Text>
              {hasFriday && <Text display={{ base: "none", xl: "block" }} fontWeight="black" color="orange.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Friday</Text>}
              <Text display={{ base: "none", xl: "block" }} fontWeight="black" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Saturday</Text>
              <Text display={{ base: "none", xl: "block" }} fontWeight="black" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Sunday</Text>
            </SimpleGrid>

            {/* Personnel Rows */}
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {Object.entries(
                filteredSuguan.reduce((acc, item) => {
                  if (!acc[item.name]) acc[item.name] = { id: item.personnel_id, items: [] };
                  acc[item.name].items.push(item);
                  return acc;
                }, {})
              ).map(([name, data]) => {
                const pItems = data.items;
                const pInfo = personnels.find(p => p.personnel_id === data.id);

                const wednesday = pItems.filter(i => moment(i.date).isoWeekday() === 3);
                const thursday = pItems.filter(i => moment(i.date).isoWeekday() === 4);
                const friday = pItems.filter(i => moment(i.date).isoWeekday() === 5);
                const saturday = pItems.filter(i => moment(i.date).isoWeekday() === 6);
                const sunday = pItems.filter(i => moment(i.date).isoWeekday() === 7);

                return (
                  <SimpleGrid
                    key={name}
                    columns={gridColumns}
                    py={6}
                    px={6}
                    transition="all 0.2s"
                    _hover={{ bg: "gray.50/50" }}
                  >
                    {/* Column 1: Personnel Info */}
                    <HStack spacing={4} align="center" mb={{ base: 4, xl: 0 }}>
                      <Avatar
                        name={name}
                        size="md"
                        boxShadow="md"
                        border="2px solid white"
                        src={
                          pInfo?.images?.[0]?.image_url
                            ? `${API_URL}${pInfo.images[0].image_url}`
                            : pInfo?.avatar
                              ? `${API_URL}/uploads/avatar/${pInfo.avatar}`
                              : ""
                        }
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="black" fontSize="md" color="gray.800" lineHeight="1.2" noOfLines={2}>{name}</Text>
                        <Badge colorScheme="teal" variant="subtle" fontSize="3xs" borderRadius="full">
                          {pInfo?.personnel_type || "Personnel"}
                        </Badge>
                      </VStack>
                    </HStack>

                    {/* Column 2: Wednesday */}
                    <VStack align="stretch" spacing={3} px={{ xl: 2 }} mb={{ base: 4, xl: 0 }}>
                      <Text display={{ xl: "none" }} fontSize="xs" fontWeight="black" color="blue.500">WEDNESDAY</Text>
                      {wednesday.length > 0 ? wednesday.map(item => (
                        <GridAssignmentCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          gampaninName={getGampaninName(item.gampanin_id)}
                          color="blue"
                        />
                      )) : <EmptySlot label="None" />}
                    </VStack>

                    {/* Column 3: Thursday */}
                    <VStack align="stretch" spacing={3} px={{ xl: 2 }} mb={{ base: 4, xl: 0 }}>
                      <Text display={{ xl: "none" }} fontSize="xs" fontWeight="black" color="blue.500">THURSDAY</Text>
                      {thursday.length > 0 ? thursday.map(item => (
                        <GridAssignmentCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          gampaninName={getGampaninName(item.gampanin_id)}
                          color="blue"
                        />
                      )) : <EmptySlot label="None" />}
                    </VStack>

                    {/* Column 4: Friday (Conditional) */}
                    {hasFriday && (
                      <VStack align="stretch" spacing={3} px={{ xl: 2 }} mb={{ base: 4, xl: 0 }}>
                        <Text display={{ xl: "none" }} fontSize="xs" fontWeight="black" color="orange.500">FRIDAY</Text>
                        {friday.length > 0 ? friday.map(item => (
                          <GridAssignmentCard
                            key={item.id}
                            item={item}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDelete(item.id)}
                            gampaninName={getGampaninName(item.gampanin_id)}
                            color="orange"
                          />
                        )) : <EmptySlot label="None" />}
                      </VStack>
                    )}

                    {/* Column 5: Saturday */}
                    <VStack align="stretch" spacing={3} px={{ xl: 2 }} mb={{ base: 4, xl: 0 }}>
                      <Text display={{ xl: "none" }} fontSize="xs" fontWeight="black" color="purple.500">SATURDAY</Text>
                      {saturday.length > 0 ? saturday.map(item => (
                        <GridAssignmentCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          gampaninName={getGampaninName(item.gampanin_id)}
                          color="purple"
                        />
                      )) : <EmptySlot label="None" />}
                    </VStack>

                    {/* Column 6: Sunday */}
                    <VStack align="stretch" spacing={3} px={{ xl: 2 }}>
                      <Text display={{ xl: "none" }} fontSize="xs" fontWeight="black" color="purple.500">SUNDAY</Text>
                      {sunday.length > 0 ? sunday.map(item => (
                        <GridAssignmentCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          gampaninName={getGampaninName(item.gampanin_id)}
                          color="purple"
                        />
                      )) : <EmptySlot label="None" />}
                    </VStack>
                  </SimpleGrid>
                );
              })}
            </VStack>
          </Box>
        )}
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader p={8} bgGradient="linear(to-r, teal.500, blue.600)" color="white">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="black">{editingSuguan ? "Update Assignment" : "New Weekly Schedule"}</Text>
              <Text fontSize="xs" fontWeight="bold" opacity={0.8} textTransform="uppercase" letterSpacing="widest">
                {editingSuguan ? "Modifying existing record" : "Adding new service assignment"}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={8} right={8} />

          <ModalBody p={8}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">Assign Personnel</FormLabel>
                <ReactSelect
                  options={personnelOptions}
                  onChange={(opt) => {
                    setPersonnelId(opt ? opt.value : "");
                    setName(opt ? opt.name : "");
                  }}
                  value={
                    personnelOptions.find(opt => String(opt.value) === String(personnel_id)) ||
                    (personnel_id ? { value: personnel_id, label: name } : null)
                  }
                  placeholder="Search and select personnel..."
                  styles={customSelectStyles}
                  isClearable
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">District</FormLabel>
                  <ReactSelect
                    options={districts.map(d => ({ value: d.id, label: d.name }))}
                    onChange={(opt) => {
                      setDistrictId(opt ? opt.value : "");
                      setLocalId(""); // Reset local when district changes
                    }}
                    value={districts.find(d => String(d.id) === String(district_id)) ?
                      { value: district_id, label: districts.find(d => String(d.id) === String(district_id)).name } : null}
                    placeholder={personnel_id ? "Search District..." : "Select personnel first"}
                    styles={customSelectStyles}
                    isDisabled={!personnel_id}
                    isClearable
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">Local Congregation</FormLabel>
                  <ReactSelect
                    options={filteredLocalCongregations.map(lc => ({
                      value: lc.id,
                      label: lc.name
                    }))}
                    onChange={(opt) => {
                      setLocalId(opt ? opt.label : ""); // Keeping it as label for now as per current display logic
                    }}
                    value={local_id ? { value: local_id, label: local_id } : null}
                    placeholder={district_id ? "Search local..." : "Select a district first"}
                    styles={customSelectStyles}
                    isDisabled={!district_id}
                    isClearable
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">Date</FormLabel>
                  <Input
                    type="date"
                    value={date}
                    isDisabled={!local_id}
                    placeholder={local_id ? "" : "Select local first"}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (!selectedDate) {
                        setDate("");
                        return;
                      }
                      const dayOfWeek = moment(selectedDate).isoWeekday();
                      if (dayOfWeek === 1 || dayOfWeek === 2) {
                        toast({
                          title: "Invalid day of week",
                          description: "Monday and Tuesday are not allowed for service date.",
                          status: "warning",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      setDate(selectedDate);
                    }}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="teal.400"
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">Time</FormLabel>
                  <Input
                    type="time"
                    value={time}
                    isDisabled={!date}
                    onChange={(e) => setTime(e.target.value)}
                    borderRadius="xl"
                    size="lg"
                    focusBorderColor="teal.400"
                    bg="gray.50"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="black" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="widest">Assigned Gampanin</FormLabel>
                <Select
                  placeholder={time ? "Select Role" : "Select time first"}
                  value={gampanin_id}
                  isDisabled={!time}
                  onChange={(e) => setGampaninId(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="teal.400"
                  bg="gray.50"
                >
                  {gampanin.map(g => <option key={g.value} value={g.value}>{g.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={8} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl" size="lg">Cancel</Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              borderRadius="xl"
              size="lg"
              px={12}
              boxShadow="0 10px 20px -5px rgba(45, 212, 191, 0.5)"
              fontWeight="black"
            >
              {editingSuguan ? "Update Assignment" : "Encode"}
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
  const accentColor = isWeekend ? "purple.600" : "blue.600";
  const accentLight = isWeekend ? "purple.50" : "blue.50";

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      bg={cardBg}
      p={6}
      borderRadius="3xl"
      boxShadow="lg"
      border="1px solid"
      borderColor={borderColor}
      position="relative"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <VStack align="start" spacing={4}>
        <Flex w="full" justify="space-between" align="center">
          <Badge
            colorScheme={isWeekend ? "purple" : "blue"}
            variant="subtle"
            borderRadius="full"
            px={4}
            py={1.5}
            fontSize="xs"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {moment(item.date).format("dddd")}
          </Badge>
          <Menu>
            <MenuButton as={IconButton} icon={<MoreVertical size={16} />} variant="ghost" size="sm" borderRadius="full" />
            <MenuList borderRadius="xl" shadow="xl">
              <MenuItem icon={<Edit3 size={14} />} onClick={onEdit}>Modify Details</MenuItem>
              <MenuItem icon={<Trash2 size={14} />} color="red.500" onClick={onDelete}>Delete Schedule</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Box w="full">
          <Text fontWeight="900" fontSize="2xl" color="gray.800" lineHeight="1.1" letterSpacing="tight">
            {item.name}
          </Text>
          <HStack mt={2} spacing={2} bg={accentLight} display="inline-flex" px={3} py={1} borderRadius="lg">
            <Icon as={Briefcase} size={14} color={accentColor} />
            <Text fontWeight="black" color={accentColor} fontSize="xs" textTransform="uppercase">{gampaninName}</Text>
          </HStack>
        </Box>

        <VStack align="start" spacing={3} w="full" pt={1}>
          <HStack color="gray.600" spacing={2}>
            <Icon as={MapPin} size={18} color="teal.500" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="extrabold" fontSize="md" color="gray.700">{item.local_congregation}</Text>
              <Text color="gray.400" fontSize="xs" fontWeight="bold">{districtName.toUpperCase()} DISTRICT</Text>
            </VStack>
          </HStack>

          <Flex w="full" justify="space-between" bg="gray.50" p={4} borderRadius="2xl" align="center" border="1px solid" borderColor="gray.100">
            <HStack color="gray.700">
              <Icon as={Calendar} size={16} color="teal.500" />
              <Text fontWeight="black" fontSize="sm">{moment(item.date).format("MMM DD, YYYY")}</Text>
            </HStack>
            <HStack color="orange.500" bg="orange.50" px={3} py={1} borderRadius="full">
              <Icon as={Clock} size={16} />
              <Text fontWeight="black" fontSize="sm">{moment(item.time, "HH:mm").format("hh:mm A")}</Text>
            </HStack>
          </Flex>
        </VStack>
      </VStack>

      <Box
        position="absolute"
        left={0}
        top="25%"
        bottom="25%"
        w="5px"
        bg={accentColor}
        borderRightRadius="full"
        boxShadow={`0 0 15px ${accentColor}`}
      />
    </MotionBox >
  );
};

// Helper Component for Grid Row Assignment
const GridAssignmentCard = ({ item, onEdit, onDelete, gampaninName, color }) => {
  return (
    <Box
      p={3}
      bg={`${color}.50`}
      borderRadius="xl"
      border="1px solid"
      borderColor={`${color}.100`}
      position="relative"
    >
      <VStack align="start" spacing={1}>
        <HStack w="full" justify="space-between">
          <Badge colorScheme={color} fontSize="9px">{moment(item.date).format("ddd")}</Badge>
          <Menu>
            <MenuButton as={IconButton} icon={<MoreVertical size={12} />} variant="ghost" size="xs" borderRadius="full" />
            <MenuList borderRadius="xl" shadow="xl">
              <MenuItem icon={<Edit3 size={12} />} onClick={onEdit}>Edit</MenuItem>
              <MenuItem icon={<Trash2 size={12} />} color="red.500" onClick={onDelete}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <Text fontSize="xs" fontWeight="black" color="gray.700" noOfLines={1}>{item.local_congregation}</Text>
        <HStack spacing={1}>
          <Icon as={Clock} size={10} color={`${color}.400`} />
          <Text fontSize="10px" fontWeight="bold" color="gray.500">{moment(item.time, "HH:mm").format("hh:mm A")}</Text>
        </HStack>
        <Text fontSize="9px" fontWeight="black" color={`${color}.600`} textTransform="uppercase">{gampaninName}</Text>
      </VStack>
    </Box>
  );
};

const EmptySlot = ({ label }) => (
  <Center p={4} border="1px dashed" borderColor="gray.100" borderRadius="xl">
    <Text fontSize="10px" color="gray.300" fontWeight="bold">{label}</Text>
  </Center>
);

export default Suguan;
