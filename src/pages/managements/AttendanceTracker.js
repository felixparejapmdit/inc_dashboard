import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Avatar,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import moment from "moment";
import { fetchData } from "../../utils/fetchData";

const ITEMS_PER_PAGE = 15;
const THEME_COLOR = "teal";

// ✅ Targeted users only
const TARGET_PERSONNEL = ["mark.silva", "jreyes", "felix.pareja"];

const AttendanceTracker = () => {
  const [auditList, setAuditList] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  // ✅ Load and filter only target users
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("login-audits");
      const logs = data?.data || data || [];

      // Filter only for target users
      const targetLogs = logs.filter((log) => {
        const username = log.user?.username?.toLowerCase() || "";
        return TARGET_PERSONNEL.some((target) =>
          username.includes(target.toLowerCase())
        );
      });

      setAuditList(targetLogs);
      setFilteredAudits(targetLogs);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading data",
        description: "Could not fetch attendance records.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Apply filters (Date / Month / Year)
  useEffect(() => {
    let filtered = [...auditList];

    if (selectedDate) {
      filtered = filtered.filter((log) =>
        moment(log.login_time).isSame(moment(selectedDate), "day")
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(
        (log) => moment(log.login_time).format("MM") === selectedMonth
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(
        (log) => moment(log.login_time).format("YYYY") === selectedYear
      );
    }

    setFilteredAudits(filtered);
    setCurrentPage(1);
  }, [selectedDate, selectedMonth, selectedYear, auditList]);

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setFilteredAudits(auditList);
  };

  // 📄 Pagination
  const totalPages = Math.ceil(filteredAudits.length / ITEMS_PER_PAGE);
  const paginatedAudits = filteredAudits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (dir) => {
    setCurrentPage((p) =>
      dir === "next" ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1)
    );
  };

  // 🧮 Stats
  const { totalLogins, uniqueUsers } = useMemo(() => {
    const users = new Set(filteredAudits.map((a) => a.user?.username));
    return {
      totalLogins: filteredAudits.length,
      uniqueUsers: users.size,
    };
  }, [filteredAudits]);

  // 🕓 Determine Status
  const getStatus = (log) => {
    // if log has logout_time, user is OUT, else IN
    return log.logout_time ? "OUT" : "IN";
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={`${THEME_COLOR}.700`}>
        🎓 Ministerial Student Attendance Tracker
      </Text>

      {/* Stats */}
      <SimpleGrid columns={[1, 2]} spacing={6} mb={6}>
        <Stat
          p={5}
          bg={`${THEME_COLOR}.100`}
          borderRadius="xl"
          shadow="md"
          border={`2px solid ${THEME_COLOR}.400`}
        >
          <StatLabel>Total Logins</StatLabel>
          <StatNumber fontSize="2xl" color={`${THEME_COLOR}.700`}>
            {totalLogins}
          </StatNumber>
        </Stat>
        <Stat
          p={5}
          bg="purple.100"
          borderRadius="xl"
          shadow="md"
          border="2px solid purple.400"
        >
          <StatLabel>Tracked Students</StatLabel>
          <StatNumber fontSize="2xl" color="purple.700">
            {TARGET_PERSONNEL.length}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      {/* 🔍 Filter Bar */}
      <Flex align="center" mb={4} gap={2} flexWrap="wrap">
        <Text fontWeight="medium" color="gray.700">
          Filter by →
        </Text>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          maxW="180px"
          bg="white"
          borderRadius="md"
        />
        <Select
          placeholder="Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          maxW="130px"
          bg="white"
        >
          {moment.months().map((m, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          maxW="120px"
          bg="white"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const year = moment().year() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </Select>
        <Button variant="ghost" colorScheme="blue" onClick={clearFilters}>
          Clear
        </Button>

        <Button
          leftIcon={<RepeatIcon />}
          colorScheme={THEME_COLOR}
          ml="auto"
          onClick={loadData}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </Flex>

      {/* Table */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table variant="striped" colorScheme="teal" size="md">
          <Thead>
            <Tr bg={`${THEME_COLOR}.600`}>
              <Th color="white">#</Th>
              <Th color="white">User</Th>
              <Th color="white">Device</Th>
              <Th color="white">Browser</Th>
              <Th color="white">Login Time</Th>
              <Th color="white">Day</Th>
              <Th color="white">Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={7} textAlign="center">
                  <Spinner size="lg" mt={4} color={`${THEME_COLOR}.500`} />
                </Td>
              </Tr>
            ) : paginatedAudits.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={6}>
                  No login records found.
                </Td>
              </Tr>
            ) : (
              paginatedAudits.map((log, idx) => {
                const status = getStatus(log);
                return (
                  <Tr key={log.id}>
                    <Td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</Td>
                    <Td>
                      <HStack>
                        <Avatar
                          name={log.user?.username}
                          size="sm"
                          bg={`${THEME_COLOR}.500`}
                          color="white"
                        />
                        <Text>{log.user?.username || "Unknown"}</Text>
                      </HStack>
                    </Td>
                    <Td>{log.device || "N/A"}</Td>
                    <Td>{log.browser || "N/A"}</Td>
                    <Td>{moment(log.login_time).format("MMM D, YYYY h:mm:ss A")}</Td>
                    <Td>{moment(log.login_time).format("dddd")}</Td>
                    <Td>
                      <Badge
                        colorScheme={status === "IN" ? "green" : "red"}
                        variant="solid"
                        p={2}
                        borderRadius="md"
                      >
                        {status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" mt={4}>
          <Button
            size="sm"
            onClick={() => handlePageChange("prev")}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => handlePageChange("next")}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default AttendanceTracker;
