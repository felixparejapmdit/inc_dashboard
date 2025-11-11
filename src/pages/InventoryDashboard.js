// src/pages/InventoryDashboard.js

import React, { useEffect, useState } from "react";
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
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from "@chakra-ui/react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { fetchAllTeamData, fetchTop10Assets } from "../services/snipeService";
import { getPMDITAssets } from "../services/pmditService"; // <- Import your PMD-IT fetcher

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const InventoryDashboard = () => {
  const [teamData, setTeamData] = useState([]);
  const [topAssets, setTopAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      // Fetch existing dashboard data
      const summary = await fetchAllTeamData();
      const top10 = await fetchTop10Assets();

      // Fetch PMD-IT assets
      const pmdAssets = await getPMDITAssets();

      if (pmdAssets?.rows) {
        const assetCount = pmdAssets.total || 0;
        const totalCost = pmdAssets.rows.reduce(
          (sum, a) => sum + parseFloat(a.purchase_cost || 0),
          0
        );

        // Append PMD-IT data to summary
        summary.push({
          team: "PMD-IT",
          assetCount,
          totalCost,
          color: "#008080", // Teal for PMD-IT
        });

        // Also merge PMD-IT assets into topAssets
        const pmdTopAssets = pmdAssets.rows.map((a) => ({
          name: a.name || "No Name",
          team: "PMD-IT",
          cost: parseFloat(a.purchase_cost || 0),
          purchase_date: a.purchase_date || "N/A",
        }));

        top10.push(...pmdTopAssets);
      }

      // Sort top 10 globally
      const top10Sorted = top10
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);

      setTeamData(summary);
      setTopAssets(top10Sorted);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        Inventory Dashboard
      </Text>

      {/* Summary Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={10}>
        {teamData.map((team, idx) => (
          <GridItem key={idx}>
            <Card boxShadow="lg">
              <CardHeader>
                <Text fontSize="xl" fontWeight="bold">
                  {team.team}
                </Text>
              </CardHeader>
              <CardBody>
                <Stat>
                  <StatLabel>Total Assets</StatLabel>
                  <StatNumber>{team.assetCount}</StatNumber>

                  <StatLabel mt={4}>Total Cost</StatLabel>
                  <StatNumber>₱{Number(team.totalCost).toLocaleString()}</StatNumber>
                  <StatHelpText>Cost of all purchased assets</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Divider mb={10} />

      <Grid templateColumns="repeat(2, 1fr)" gap={8}>
        {/* Bar Chart */}
        <GridItem>
          <Card boxShadow="lg" h="400px">
            <CardHeader>
              <Text fontSize="xl" fontWeight="bold">
                Total Assets Per Team
              </Text>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData}>
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assetCount" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>

        {/* Pie Chart */}
        <GridItem>
          <Card boxShadow="lg" h="400px">
            <CardHeader>
              <Text fontSize="xl" fontWeight="bold">
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
                    label
                  >
                    {teamData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Divider my={10} />

      {/* Top 10 Assets Table */}
      <Card boxShadow="lg">
        <CardHeader>
          <Text fontSize="xl" fontWeight="bold">
            Top 10 Most Expensive Assets (All Teams)
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Asset Name</Th>
                <Th>Team</Th>
                <Th>Cost</Th>
                <Th>Purchase Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topAssets.map((asset, i) => (
                <Tr key={i}>
                  <Td>{asset.name}</Td>
                  <Td>{asset.team}</Td>
                  <Td>₱{Number(asset.cost).toLocaleString()}</Td>
                  <Td>{asset.purchase_date}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;
