import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Flex, HStack, VStack, Input, Table, Tbody, Td, Th, Thead, Tr, Text,
  Stat, StatLabel, StatNumber, SimpleGrid, Switch, useToast, Avatar, Badge,
  Skeleton, Stack, IconButton, Tooltip, Select
} from "@chakra-ui/react";
import {
  RepeatIcon, ChevronLeftIcon, ChevronRightIcon,
  CalendarIcon, TimeIcon
} from "@chakra-ui/icons";
import moment from "moment";
import { fetchData } from "../../utils/fetchData";

const LoginAudits = () => {
  const toast = useToast();
  const [audits, setAudits] = useState([]);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterMode, setFilterMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const refreshTimer = useRef(null);
  const tickTimer = useRef(null);

  // ---------- Fetch Data ----------
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [auditsRes, usersRes] = await Promise.all([
        fetchData("login-audits/recent"),
        fetchData("login_users"),
      ]);

      // Simulate online users based on recent logins (within 5 mins)
      const now = moment();
      const updatedUsers = usersRes.map(u => ({
        ...u,
        is_online: auditsRes.some(a =>
          a.user?.id === u.id && now.diff(moment(a.login_time), "minutes") < 5
        ),
      }));

      setAudits(auditsRes || []);
      setUsers(updatedUsers || []);
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

  // ---------- Auto Refresh ----------
  useEffect(() => {
    if (autoRefresh)
      refreshTimer.current = setInterval(loadData, 300000);
    else clearInterval(refreshTimer.current);
    return () => clearInterval(refreshTimer.current);
  }, [autoRefresh]);

  // ---------- “x seconds ago” Timer ----------
  useEffect(() => {
    tickTimer.current = setInterval(() => {
      if (lastUpdated)
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tickTimer.current);
  }, [lastUpdated]);

  // ---------- Filters ----------
  const applyFilters = () => {
    let data = [...audits];

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
        if (!a.user?.id || seen.has(a.user.id)) return false;
        seen.add(a.user.id);
        return true;
      });
    } else if (filterMode === "notLogged") {
      const loggedIds = new Set(
        data.filter(a => moment(a.login_time).isSame(moment(), "day")).map(a => a.user?.id)
      );
      data = users
        .filter(u => !loggedIds.has(u.id))
        .map(u => ({
          id: `notlogged-${u.id}`,
          user: u,
          device: "—",
          os: "—",
          browser: "—",
          login_time: null,
        }));
    } else if (filterMode === "online") {
      data = users
        .filter(u => u.is_online)
        .map(u => ({
          id: `online-${u.id}`,
          user: u,
          device: "—",
          os: "—",
          browser: "—",
          login_time: audits.find(a => a.user?.id === u.id)?.login_time || null,
        }));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        d =>
          (d.user?.username || "").toLowerCase().includes(q) ||
          (d.device || "").toLowerCase().includes(q) ||
          (d.os || "").toLowerCase().includes(q) ||
          (d.browser || "").toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => moment(b.login_time).valueOf() - moment(a.login_time).valueOf());
    setFiltered(data);
    setPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [audits, users, filterMode, searchQuery, selectedDate, selectedMonth, selectedYear]);

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const handleGotoPage = p => setPage(Math.min(Math.max(1, p), totalPages));
  const getPageNumbers = () => {
    const range = 5;
    const start = Math.max(1, page - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // ---------- Stats ----------
  const totalLogins = audits.length;
  const todaysLogins = audits.filter(a => moment(a.login_time).isSame(moment(), "day")).length;
  const uniqueUsers = new Set(audits.map(a => a.user?.id)).size;
  const totalOnline = users.filter(u => u.is_online).length;
  const loggedIds = new Set(
    audits.filter(a => moment(a.login_time).isSame(moment(), "day")).map(a => a.user?.id)
  );
  const totalNotLogged = users.filter(u => !loggedIds.has(u.id)).length;

  // ---------- UI ----------
  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap">
        <Text fontSize="2xl" fontWeight="bold">🔐 Login Audits</Text>
        <HStack spacing={3}>
          <IconButton
            icon={<RepeatIcon />}
            aria-label="Refresh"
            onClick={loadData}
            isLoading={isLoading}
            colorScheme="blue"
            size="sm"
          />
          <Tooltip label={lastUpdated ? moment(lastUpdated).format("llll") : "Never"}>
            <Text fontSize="sm" color="gray.600">
              Last Updated: <b>{lastUpdated ? `${secondsAgo}s ago` : "Never"}</b>
            </Text>
          </Tooltip>
          <HStack spacing={1}>
            <Text fontSize="sm">Auto Refresh</Text>
            <Switch
              isChecked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              colorScheme="green"
              size="sm"
            />
          </HStack>
        </HStack>
      </Flex>

      {/* Date Filters */}
      <Flex gap={3} mb={4} align="center" flexWrap="wrap">
        <Text fontWeight="medium">Filter by →</Text>
        <HStack>
          <CalendarIcon color="gray.500" />
          <Input
            type="date"
            size="sm"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            bg="white"
          />
          <Select
            size="sm"
            placeholder="Month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            bg="white"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {moment().month(i).format("MMMM")}
              </option>
            ))}
          </Select>
          <Select
            size="sm"
            placeholder="Year"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            bg="white"
          >
            {Array.from({ length: 5 }, (_, i) => 2025 - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Button size="sm" onClick={() => {
            setSelectedDate(""); setSelectedMonth(""); setSelectedYear("");
          }}>
            Clear
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={[2, 5]} spacing={4} mb={4}>
        {[
          { label: "Total Logins", value: totalLogins, mode: null },
          { label: "Today's Logins", value: todaysLogins, mode: "today" },
          { label: "Unique Users", value: uniqueUsers, mode: "unique" },
          { label: "Online Users", value: totalOnline, mode: "online" },
          { label: "Not Logged In Today", value: totalNotLogged, mode: "notLogged" },
        ].map(stat => (
          <Stat
            key={stat.label}
            bg={filterMode === stat.mode ? "blue.50" : "white"}
            p={4}
            borderRadius="md"
            shadow="sm"
            cursor="pointer"
            onClick={() => setFilterMode(filterMode === stat.mode ? null : stat.mode)}
          >
            <StatLabel>{stat.label}</StatLabel>
            <StatNumber color={stat.mode === "notLogged" ? "red.600" : "blue.600"}>
              {stat.value}
            </StatNumber>
          </Stat>
        ))}
      </SimpleGrid>

      {/* Search + Pagination Top */}
      <HStack justify="center" align="center" mb={3} flexWrap="wrap" gap={3}>
        <Input
          placeholder="Search username, device, OS..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          bg="white"
          maxW="360px"
        />
        <Select size="sm" w="130px" value={limit} onChange={e => setLimit(Number(e.target.value))}>
          {[10, 15, 25, 50].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </Select>
        <HStack spacing={2}>
          <IconButton icon={<ChevronLeftIcon />} size="sm" onClick={() => handleGotoPage(page - 1)} isDisabled={page === 1} />
          {getPageNumbers().map(p => (
            <Button key={p} size="sm" variant={p === page ? "solid" : "ghost"} colorScheme={p === page ? "blue" : "gray"} onClick={() => handleGotoPage(p)}>
              {p}
            </Button>
          ))}
          <IconButton icon={<ChevronRightIcon />} size="sm" onClick={() => handleGotoPage(page + 1)} isDisabled={page === totalPages} />
        </HStack>
      </HStack>

      {/* Table */}
      <Box bg="white" borderRadius="md" p={4} shadow="sm" minH="320px">
        {isLoading ? (
          <Stack spacing={3}>{[...Array(8)].map((_, i) => <Skeleton key={i} height="44px" />)}</Stack>
        ) : paginated.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={8}>No records found.</Text>
        ) : (
          <>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>User</Th>
                  <Th>Status</Th>
                  <Th>Device</Th>
                  <Th>OS</Th>
                  <Th>Browser</Th>
                  <Th>Login Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginated.map((log, idx) => (
                  <Tr key={log.id}>
                    <Td>{(page - 1) * limit + idx + 1}</Td>
                    <Td>
                      <HStack>
                        <Avatar name={log.user?.username} size="sm" />
                        <Text>{log.user?.username || "Unknown"}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {log.user?.isLoggedIn === 1 || log.user?.status === "Online" ? (
                        <Badge colorScheme="green">Online</Badge>
                      ) : (
                        <Badge colorScheme="gray">Offline</Badge>
                      )}
                    </Td>

                    <Td>{log.device || "—"}</Td>
                    <Td>{log.os || "—"}</Td>
                    <Td>{log.browser || "—"}</Td>
                    <Td>{log.login_time ? moment(log.login_time).format("MMM D, YYYY h:mm A") : "—"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Bottom Pagination */}
            <VStack mt={4} spacing={3} align="center">
              <Text fontSize="sm" color="gray.600" fontWeight="bold">
                Showing {(page - 1) * limit + 1} - {Math.min(page * limit, filtered.length)} of {filtered.length}
              </Text>
              <HStack spacing={2}>
                <IconButton icon={<ChevronLeftIcon />} size="sm" onClick={() => handleGotoPage(page - 1)} isDisabled={page === 1} />
                {getPageNumbers().map(p => (
                  <Button key={`bottom-${p}`} size="sm" variant={p === page ? "solid" : "ghost"} colorScheme={p === page ? "blue" : "gray"} onClick={() => handleGotoPage(p)}>
                    {p}
                  </Button>
                ))}
                <IconButton icon={<ChevronRightIcon />} size="sm" onClick={() => handleGotoPage(page + 1)} isDisabled={page === totalPages} />
              </HStack>
            </VStack>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LoginAudits;
