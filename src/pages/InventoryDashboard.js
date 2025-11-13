import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Alert,
  AlertIcon,
  Input,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Button,
  Tag,
  TagLabel,
  HStack,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchAllTeamDataOptimized } from "../services/snipeService";

// 🎨 Distinct color palette for each team (consistent across UI)
const TEAM_COLORS = [
  "#319795", // teal
  "#4299E1", // blue
  "#ED8936", // orange
  "#38A169", // green
  "#9F7AEA", // purple
  "#E53E3E", // red
  "#00B5D8", // cyan
  "#D53F8C", // pink
  "#ECC94B", // yellow
  "#718096", // gray
];

const DEFAULT_PAGE_SIZE = 20;

const InventoryDashboard = () => {
  const [teamData, setTeamData] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [topAssets, setTopAssets] = useState([]);
  const [grandTotals, setGrandTotals] = useState({
    grandTotalAssets: 0,
    grandTotalCost: 0,
    totalGlobalLicenses: 0,
    totalGlobalAccessories: 0,
    totalGlobalConsumables: 0,
    totalGlobalComponents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAllAssets, setShowAllAssets] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // 🧠 Load data once
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllTeamDataOptimized();
      const teamsWithColors = data.teamData.map((t, i) => ({
        ...t,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
      }));
      setTeamData(teamsWithColors);
      setTopAssets(data.topAssets);
      setAllAssets(data.allAssets);
      setGrandTotals({
        grandTotalAssets: data.grandTotalAssets,
        grandTotalCost: data.grandTotalCost,
        totalGlobalLicenses: data.totalGlobalLicenses,
        totalGlobalAccessories: data.totalGlobalAccessories,
        totalGlobalConsumables: data.totalGlobalConsumables,
        totalGlobalComponents: data.totalGlobalComponents,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("⚠️ Failed to load data. Check network or API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, showAllAssets, pageSize]);

  // 🔍 Search & filter
  const filteredAssets = useMemo(() => {
    const assets = showAllAssets ? allAssets : topAssets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.team.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, topAssets, allAssets, showAllAssets]);

  const pageCount = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 📄 Pagination logic
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (pageCount <= maxPagesToShow + 2) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pageCount - 1, currentPage + 1);
      pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < pageCount - 1) pages.push("...");
      pages.push(pageCount);
    }
    return pages.filter(
      (item, index, self) =>
        item !== "..." || index === 0 || self[index - 1] !== "..."
    );
  };

  if (loading)
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Text fontSize="3xl" fontWeight="bold" mb={6} color="gray.700">
        Inventory Dashboard
      </Text>

      {/* 🌍 Global Summary */}
      <Card
        boxShadow="2xl"
        borderRadius="2xl"
        mb={8}
        bgGradient="linear(to-r, teal.400, green.400)"
        color="white"
      >
        <CardBody p={6}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="3xl" fontWeight="extrabold">
                Total Assets: {grandTotals.grandTotalAssets.toLocaleString()}
              </Text>
              <Text fontSize="xl" fontWeight="semibold">
                Total Hardware Cost: ₱
                {grandTotals.grandTotalCost.toLocaleString()}
              </Text>
            </Box>
            <Flex gap={6} flexWrap="wrap" fontSize="sm">
              <Text>Licenses: {grandTotals.totalGlobalLicenses}</Text>
              <Text>Accessories: {grandTotals.totalGlobalAccessories}</Text>
              <Text>Consumables: {grandTotals.totalGlobalConsumables}</Text>
              <Text>Components: {grandTotals.totalGlobalComponents}</Text>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* 🧩 Team Summary Cards */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gap={6}
        mb={10}
      >
        {teamData.map((team, idx) => (
          <GridItem key={idx}>
            <Card
              boxShadow="xl"
              borderRadius="xl"
              bg={team.color}
              color="white"
              _hover={{ transform: "scale(1.04)", transition: "0.2s" }}
            >
              <CardHeader pb={2}>
                <Text fontSize="xl" fontWeight="bold">
                  {team.team}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <Stat>
                  <StatLabel>Total Assets</StatLabel>
                  <StatNumber fontSize="2xl">
                    {team.assetCount.toLocaleString()}
                  </StatNumber>
                  <Flex mt={2} gap={4} flexWrap="wrap" fontSize="sm">
                    <Text>Licenses: {team.licenses}</Text>
                    <Text>Accessories: {team.accessories}</Text>
                    <Text>Consumables: {team.consumables}</Text>
                    <Text>Components: {team.components}</Text>
                  </Flex>
                  <StatLabel mt={3}>Total Cost</StatLabel>
                  <StatNumber fontSize="xl">
                    ₱{Number(team.totalCost).toLocaleString()}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Divider mb={10} />

      {/* 📊 Charts Section */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={8}
        mb={10}
      >
        {/* Bar Chart */}
        <Card boxShadow="xl" h="400px" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold" color="teal.600">
              Total Assets Per Team
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={teamData}
                margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
              >
                <XAxis dataKey="team" stroke="gray.500" />
                <YAxis tickFormatter={(v) => v.toLocaleString()} stroke="gray.500" />
                <Tooltip formatter={(v) => [v, "Assets"]} />
                <Legend />
                <Bar dataKey="assetCount" name="Assets">
                  {teamData.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Pie Chart */}
        <Card boxShadow="xl" h="400px" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold" color="teal.600">
              Cost Distribution Per Team
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamData}
                  dataKey="totalCost"
                  nameKey="team"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {teamData.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₱${Number(val).toLocaleString()}`, "Total Cost"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Team Legend Badges */}
            <HStack justify="center" mt={4} wrap="wrap" spacing={4}>
              {teamData.map((t, i) => (
                <Tag key={i} bg={t.color} color="white" borderRadius="full" px={3}>
                  <TagLabel>{t.team}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </CardBody>
        </Card>
      </Grid>

      <Divider my={8} />

      {/* 🔎 Search & Toggle */}
      <Flex justify="space-between" mb={4} flexWrap="wrap" gap={4}>
        <Input
          placeholder="Search assets or team..."
          maxW="300px"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl display="flex" alignItems="center" maxW="200px">
          <FormLabel htmlFor="toggleAssets" mb="0">
            Show All Assets
          </FormLabel>
          <Switch
            id="toggleAssets"
            colorScheme="teal"
            isChecked={showAllAssets}
            onChange={(e) => setShowAllAssets(e.target.checked)}
          />
        </FormControl>
      </Flex>

      {/* 🧾 Assets Table */}
      <Card boxShadow="xl" borderRadius="xl">
        <CardHeader>
          <Text fontSize="xl" fontWeight="bold" color="teal.600">
            {showAllAssets
              ? `All Assets (${filteredAssets.length})`
              : "Top 10 Most Expensive Assets"}
          </Text>
        </CardHeader>
        <CardBody>
          <Flex justify="space-between" mb={3} align="center" flexWrap="wrap" gap={2}>
            <Text color="gray.600">
              Showing {filteredAssets.length > 0
                ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    filteredAssets.length
                  )}`
                : 0}{" "}
              of {filteredAssets.length}
            </Text>
            <Select
              w="fit-content"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  Show {n}
                </option>
              ))}
            </Select>
          </Flex>

          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="gray.100">
                <Th>Asset Name</Th>
                <Th>Team</Th>
                <Th isNumeric>Cost (₱)</Th>
                <Th>Purchase Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedAssets.map((asset, i) => {
                const teamColor =
                  teamData.find((t) => t.team === asset.team)?.color || "#CBD5E0";
                return (
                  <Tr key={i} _hover={{ bg: "gray.50" }}>
                    <Td>{asset.name}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Box w={3} h={3} bg={teamColor} borderRadius="full" />
                        <Text>{asset.team}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>{Number(asset.cost).toLocaleString()}</Td>
                    <Td>{asset.purchase_date}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          {/* Pagination */}
          {pageCount > 1 && (
            <HStack mt={4} justify="center" spacing={0}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                isDisabled={currentPage === 1}
              >
                Prev
              </Button>
              {getPageNumbers().map((p, idx) =>
                typeof p === "number" ? (
                  <Button
                    key={idx}
                    size="sm"
                    colorScheme={currentPage === p ? "teal" : "gray"}
                    variant={currentPage === p ? "solid" : "outline"}
                    onClick={() => setCurrentPage(p)}
                    borderRadius="none"
                  >
                    {p}
                  </Button>
                ) : (
                  <Text key={idx} px={2}>
                    {p}
                  </Text>
                )
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, pageCount))
                }
                isDisabled={currentPage === pageCount}
              >
                Next
              </Button>
            </HStack>
          )}

          {filteredAssets.length === 0 && (
            <Text p={4} textAlign="center" color="gray.500">
              No assets match your search.
            </Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;
