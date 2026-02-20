import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button,
  IconButton,
  HStack,
  useToast,
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
  Input,
  FormLabel,
  Select,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  Download,
  Filter,
  Users as UsersIcon,
  Activity,
  Globe,
  Monitor,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle
} from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";
import ReactSelect from "react-select";

import { fetchData } from "../../utils/fetchData";
import { filterPersonnelData } from "../../utils/filterUtils";

const MotionBox = motion.create(Box);

const LoginAudits = () => {
  const toast = useToast();
  const [audits, setAudits] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filterMode, setFilterMode] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const refreshTimer = useRef(null);
  const tickTimer = useRef(null);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, purple.600, blue.600)",
    "linear(to-r, purple.400, blue.400)"
  );

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#6366f1" : "inherit",
      padding: "2px",
      boxShadow: state.isFocused ? "0 0 0 1px #6366f1" : "none",
      "&:hover": { borderColor: "#6366f1" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#e0e7ff" : "white",
      color: state.isSelected ? "white" : "black",
    })
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [auditsRes, personnelsRes] = await Promise.all([
        fetchData("login-audits/recent"),
        fetchData("personnels"),
      ]);

      const auditsWithRoleData = (auditsRes || []).map(audit => ({
        ...audit,
        username_display: audit.user?.username || "Unknown",
        personnel_id: audit.user?.personnel_id,
      }));

      const filteredAudits = filterPersonnelData(auditsWithRoleData);
      setAudits(filteredAudits || []);
      setPersonnels(personnelsRes || []);
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } catch (err) {
      toast({
        title: "Error loading data",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      clearInterval(refreshTimer.current);
      clearInterval(tickTimer.current);
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) refreshTimer.current = setInterval(loadData, 60000); // 1 min refresh
    else clearInterval(refreshTimer.current);
    return () => clearInterval(refreshTimer.current);
  }, [autoRefresh]);

  useEffect(() => {
    tickTimer.current = setInterval(() => {
      if (lastUpdated) setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tickTimer.current);
  }, [lastUpdated]);

  const filteredAudits = useMemo(() => {
    let data = [...audits];

    if (selectedPersonnelId) {
      data = data.filter(a => String(a.personnel_id) === String(selectedPersonnelId));
    }

    if (selectedDate)
      data = data.filter(a => moment(a.login_time).isSame(selectedDate, "day"));
    if (selectedMonth)
      data = data.filter(a => moment(a.login_time).format("MM") === selectedMonth);
    if (selectedYear)
      data = data.filter(a => moment(a.login_time).format("YYYY") === selectedYear);

    if (filterMode === "today")
      data = data.filter(a => moment(a.login_time).isSame(moment(), "day"));
    else if (filterMode === "unique") {
      const seen = new Set();
      data = data.filter(a => {
        if (!a.personnel_id || seen.has(a.personnel_id)) return false;
        seen.add(a.personnel_id);
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        d =>
          (d.username_display).toLowerCase().includes(q) ||
          (d.device || "").toLowerCase().includes(q) ||
          (d.os || "").toLowerCase().includes(q) ||
          (d.browser || "").toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => moment(b.login_time).valueOf() - moment(a.login_time).valueOf());
    return data;
  }, [audits, selectedPersonnelId, selectedDate, selectedMonth, selectedYear, filterMode, searchQuery]);

  const totalPages = Math.ceil(filteredAudits.length / limit) || 1;
  const paginatedAudits = filteredAudits.slice((page - 1) * limit, page * limit);

  const stats = {
    total: audits.length,
    today: audits.filter(a => moment(a.login_time).isSame(moment(), "day")).length,
    unique: new Set(audits.map(a => a.personnel_id)).size,
    mobile: audits.filter(a => (a.device || "").toLowerCase().includes("mobile") || (a.os || "").toLowerCase().includes("android") || (a.os || "").toLowerCase().includes("ios")).length
  };

  const handleExportReport = (type) => {
    let dataToExport = [];
    let filename = `Login_Audit_Report_${type}`;

    if (type === "filtered") {
      dataToExport = [...filteredAudits];
      filename = "Filtered_Login_Audit_Report";
    } else {
      // Start with all audits
      let set = [...audits];

      // Apply user filter if selected
      if (selectedPersonnelId) {
        set = set.filter(a => String(a.personnel_id) === String(selectedPersonnelId));
      }

      if (type === "weekly") {
        const oneWeekAgo = moment().subtract(1, "week");
        dataToExport = set.filter(a => moment(a.login_time).isAfter(oneWeekAgo));
      } else if (type === "monthly") {
        const oneMonthAgo = moment().subtract(1, "month");
        dataToExport = set.filter(a => moment(a.login_time).isAfter(oneMonthAgo));
      } else if (type === "yearly") {
        const oneYearAgo = moment().subtract(1, "year");
        dataToExport = set.filter(a => moment(a.login_time).isAfter(oneYearAgo));
      }
    }

    const report = dataToExport.map(item => ({
      Username: item.username_display,
      "Login Time": moment(item.login_time).format("YYYY-MM-DD HH:mm:ss"),
      Device: item.device || "N/A",
      OS: item.os || "N/A",
      Browser: item.browser || "N/A",
      "IP Address": item.ip_address || "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, `${filename}_${moment().format("YYYYMMDD")}.xlsx`);

    toast({
      title: "Report Generated",
      description: `${type.toUpperCase()} report has been downloaded.`,
      status: "success",
      duration: 3000,
    });
  };

  const resetFilters = () => {
    setSelectedPersonnelId("");
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setSearchQuery("");
    setFilterMode(null);
    setPage(1);
  };

  const personnelOptions = useMemo(() => {
    return [
      { value: "", label: "All Users" },
      ...personnels.map(p => ({
        value: p.personnel_id,
        label: `${p.surname_husband}, ${p.givenname}`,
        searchLabel: `${p.givenname} ${p.surname_husband}`.toLowerCase()
      })).sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, [personnels]);

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
            <HStack>
              <Icon as={ShieldCheck} boxSize={8} color="purple.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Login Audits
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Monitor system access and security logs </Text>
          </VStack>

          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<Download size={18} />}
                variant="outline"
                colorScheme="purple"
                size="lg"
                borderRadius="xl"
              >
                Export Report
              </MenuButton>
              <MenuList borderRadius="xl" shadow="xl" border="1px solid" borderColor={borderColor}>
                <MenuItem icon={<FileText size={16} />} onClick={() => handleExportReport("filtered")}>Current Filtered View</MenuItem>
                <Divider my={2} />
                <MenuItem icon={<Calendar size={16} />} onClick={() => handleExportReport("weekly")}>Past 7 Days Report</MenuItem>
                <MenuItem icon={<Calendar size={16} />} onClick={() => handleExportReport("monthly")}>Past 30 Days Report</MenuItem>
                <MenuItem icon={<Calendar size={16} />} onClick={() => handleExportReport("yearly")}>Full Year Report</MenuItem>
              </MenuList>
            </Menu>

            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={loadData}
              isLoading={isLoading}
              colorScheme="blue"
              variant="ghost"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={8}>
          {[
            { label: "Total Sessions", value: stats.total, icon: Activity, color: "blue", mode: null },
            { label: "Today's Logins", value: stats.today, icon: Clock, color: "green", mode: "today" },
            { label: "Unique Users", value: stats.unique, icon: UsersIcon, color: "purple", mode: "unique" },
            { label: "Mobile Access", value: stats.mobile, icon: Monitor, color: "orange", mode: null },
          ].map(stat => (
            <MotionBox
              key={stat.label}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              bg={cardBg}
              p={5}
              borderRadius="2xl"
              boxShadow="sm"
              border="1px solid"
              borderColor={filterMode === stat.mode && stat.mode ? `${stat.color}.300` : borderColor}
              cursor="pointer"
              onClick={() => stat.mode && setFilterMode(filterMode === stat.mode ? null : stat.mode)}
              position="relative"
              overflow="hidden"
            >
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                    {stat.label}
                  </Text>
                  <Text fontSize="3xl" fontWeight="black" color={`${stat.color}.500`}>
                    {stat.value}
                  </Text>
                </VStack>
                <Box p={3} bg={`${stat.color}.50`} borderRadius="xl">
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.500`} />
                </Box>
              </HStack>
              <Box position="absolute" top={0} left={0} w="full" h="2px" bg={`${stat.color}.400`} />
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Action Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} align="end">
            <Box gridColumn={{ base: "span 1", md: "span 2" }}>
              <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Filter by Personnel</FormLabel>
              <ReactSelect
                options={personnelOptions}
                onChange={(opt) => setSelectedPersonnelId(opt ? opt.value : "")}
                value={personnelOptions.find(o => String(o.value) === String(selectedPersonnelId))}
                styles={customSelectStyles}
                placeholder="Search Personnel..."
                isClearable
              />
            </Box>

            <Box>
              <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                borderRadius="xl"
                size="md"
                focusBorderColor="purple.400"
              />
            </Box>

            <Box>
              <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Month</FormLabel>
              <Select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                borderRadius="xl"
                placeholder="All Months"
              >
                {moment.months().map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                ))}
              </Select>
            </Box>

            <Box>
              <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Year</FormLabel>
              <Select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                borderRadius="xl"
                placeholder="All Years"
              >
                {[...Array(5)].map((_, i) => {
                  const y = moment().year() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </Select>
            </Box>
          </SimpleGrid>

          <Divider my={6} />

          <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search browser, OS, device info..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                borderRadius="xl"
                focusBorderColor="purple.400"
              />
            </InputGroup>

            <HStack spacing={6}>
              <HStack spacing={2}>
                <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Live Sync</Text>
                <Switch
                  isChecked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  colorScheme="purple"
                  size="sm"
                />
              </HStack>
              <Button leftIcon={<AlertCircle size={16} />} variant="ghost" colorScheme="red" size="sm" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </HStack>
          </Flex>

          {lastUpdated && (
            <Text mt={4} fontSize="2xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
              Last Updated: {moment(lastUpdated).format("h:mm:ss A")} ({secondsAgo}s ago)
            </Text>
          )}
        </Box>

        {/* Main Table */}
        <Box
          bg={cardBg}
          borderRadius="3xl"
          shadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {isLoading ? (
            <Center p={20} flexDir="column">
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Retrieving system logs...</Text>
            </Center>
          ) : filteredAudits.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No logs found</Heading>
              <Text color="gray.400">Try adjusting your filters or search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">User Details</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Device & OS</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Browser</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Access Time</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {paginatedAudits.map((log) => (
                        <MotionBox
                          key={log.id}
                          as="tr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          _hover={{ bg: "gray.50/50" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" name={log.username_display} bg="purple.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="black" color="gray.800">{log.username_display}</Text>
                                <HStack spacing={1}>
                                  <Globe size={10} color="gray" />
                                  <Text fontSize="2xs" fontWeight="bold" color="gray.500">{log.ip_address || "no-ip"}</Text>
                                </HStack>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <HStack spacing={3}>
                              <Box p={2} bg="blue.50" borderRadius="lg">
                                <Icon as={Monitor} size={14} color="blue.500" />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="sm">{log.device || "Desktop"}</Text>
                                <Badge variant="subtle" colorScheme="blue" fontSize="2xs">{log.os || "Unknown OS"}</Badge>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">{log.browser || "—"}</Text>
                          </Td>
                          <Td p={6}>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={1} color="purple.600">
                                <Icon as={Calendar} size={12} />
                                <Text fontWeight="black" fontSize="xs">{moment(log.login_time).format("MMM DD, YYYY")}</Text>
                              </HStack>
                              <HStack spacing={1} color="purple.400">
                                <Icon as={Clock} size={12} />
                                <Text fontWeight="bold" fontSize="2xs">{moment(log.login_time).format("h:mm:ss A")}</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td p={6}>
                            <IconButton icon={<MoreVertical size={16} />} variant="ghost" size="sm" borderRadius="full" />
                          </Td>
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex direction="column" p={6} gap={4} align="center" bg="gray.50/50" borderTop="1px solid" borderColor={borderColor}>
                <HStack spacing={2}>
                  <IconButton
                    icon={<ChevronLeft size={18} />}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={page === pageNum ? "solid" : "outline"}
                        colorScheme={page === pageNum ? "purple" : "gray"}
                        onClick={() => setPage(pageNum)}
                        borderRadius="lg"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <IconButton
                    icon={<ChevronRight size={18} />}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    isDisabled={page === totalPages}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                </HStack>

                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredAudits.length)} of {filteredAudits.length} entries
                  </Text>
                  <Select
                    size="sm"
                    w="120px"
                    borderRadius="lg"
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
                  >
                    {[10, 15, 25, 50].map(val => <option key={val} value={val}>{val} per page</option>)}
                  </Select>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default LoginAudits;
