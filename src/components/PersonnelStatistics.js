import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Icon,
  Heading,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiUserCheck,
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserX,
  FiBriefcase,
  FiShield,
  FiCpu,
  FiHome,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";
import { FaFemale } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const gradientMap = {
  All: "linear(to-r, teal.500, blue.500)",
  Minister: "linear(to-r, green.400, green.600)",
  Regular: "linear(to-r, blue.400, blue.600)",
  "Minister's Wife": "linear(to-r, pink.400, pink.600)",
  "Ministerial Student": "linear(to-r, orange.400, red.500)",
  "Lay Member": "linear(to-r, cyan.400, teal.500)",
};

const PersonnelStatistics = () => {
  const [stats, setStats] = useState({
    All: 0,
    Minister: 0,
    Regular: 0,
    "Minister's Wife": 0,
    "Ministerial Student": 0,
    "Lay Member": 0,
  });

  const [trackingStats, setTrackingStats] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);

  const navigate = useNavigate();

  const typeIcons = {
    All: FiUsers,
    Minister: FiUserCheck,
    Regular: FiUser,
    "Minister's Wife": FaFemale,
    "Ministerial Student": FiUserX,
    "Lay Member": FiUserPlus,
  };

  const trackingSteps = [
    "Section Chief",
    "Admin Office",
    "Security Overseer",
    "PMD - IT",
    "ATG Office 1",
    "ATG Office 2",
    "ATG Office Approval",
    "Personnel Office",
  ];

  const trackingIcons = {
    "Section Chief": FiUser,
    "Admin Office": FiBriefcase,
    "Security Overseer": FiShield,
    "PMD - IT": FiCpu,
    "ATG Office 1": FiHome,
    "ATG Office 2": FiHome,
    "ATG Office Approval": FiCheckCircle,
    "Personnel Office": FiUsers,
    "Total On Progress": FiLoader,
  };

  const trackingRoutes = {
    "Section Chief": "/progress/step1",
    "Admin Office": "/progress/step2",
    "Security Overseer": "/progress/step3",
    "PMD - IT": "/progress/step4",
    "ATG Office 1": "/progress/step5",
    "ATG Office 2": "/progress/step6",
    "ATG Office Approval": "/progress/step7",
    "Personnel Office": "/progress/step8",
  };

  
  useEffect(() => {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    console.error("No auth token found. User may not be logged in.");
    return;
  }

  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  // Fetch personnels
  fetch(`${API_URL}/api/personnels`, { headers })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch personnels");
      return res.json();
    })
    .then((data) => {
      const count = {
        All: data.length,
        Minister: 0,
        Regular: 0,
        "Minister's Wife": 0,
        "Ministerial Student": 0,
        "Lay Member": 0,
      };
      data.forEach((p) => {
        if (count[p.personnel_type] !== undefined) {
          count[p.personnel_type]++;
        }
      });
      setStats(count);
    })
    .catch((err) => console.error("Error fetching personnels:", err));

  // Fetch progress tracking per step
  Promise.all(
    trackingSteps.map((_, i) =>
      fetch(`${API_URL}/api/personnels/progress/${i}`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch progress for step ${i}`);
          return res.json();
        })
    )
  )
    .then((responses) => {
      const result = {};
      let total = 0;
      responses.forEach((data, i) => {
        result[trackingSteps[i]] = data.length;
        total += data.length;
      });
      setTrackingStats(result);
      setTotalProgress(total);
    })
    .catch((err) => console.error("Error fetching tracking stats:", err));
}, []);


  const renderCard = (label, value, icon, gradient, onClick, progressPercent) => (
    <Box
      key={label}
      bgGradient={gradient}
      borderRadius="lg"
      p={5}
      color="white"
      boxShadow="lg"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.3s ease"
      _hover={{ transform: onClick ? "scale(1.03)" : "none" }}
      onClick={onClick}
      position="relative"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Box zIndex={2} w="100%">
          <Text fontSize="sm" fontWeight="bold">
            {label === "All" ? "TOTAL PERSONNEL" : label.toUpperCase()}
          </Text>
          <Text fontSize="2xl" fontWeight="extrabold" mt={1}>
            {value}
          </Text>
        </Box>

        <Icon
          as={icon}
          boxSize={14}
          opacity={0.15}
          position="absolute"
          right="4"
          top="4"
          zIndex={0}
        />
      </Flex>

      {/* Progress bar at bottom */}
      <Progress
        value={progressPercent}
        size="sm"
        colorScheme="whiteAlpha"
        borderRadius="md"
        mt={6}
        background="rgba(255,255,255,0.2)"
      />
    </Box>
  );

  const totalPersonnel = stats.All || 1;

  return (
    <Box p={8}>
      <Heading size="lg" mb={6} textAlign="center">
        Personnel Statistics
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} spacing={6} mb={10}>
        {Object.entries(stats).map(([label, value]) => {
          const percent = (value / totalPersonnel) * 100;
          return renderCard(
            label,
            value,
            typeIcons[label],
            gradientMap[label],
            null,
            percent
          );
        })}
      </SimpleGrid>

      <Heading size="lg" mb={6} textAlign="center">
        Personnel Tracking
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {renderCard(
          "Total On Progress",
          totalProgress,
          FiLoader,
          "linear(to-r, purple.400, purple.600)",
          () => navigate("/progresstracking"),
          100
        )}

        {Object.entries(trackingStats).map(([label, value]) => {
          const percent = (value / totalProgress) * 100;
          return renderCard(
            label,
            value,
            trackingIcons[label],
            "linear(to-r, blue.400, blue.600)",
            () => navigate(trackingRoutes[label]),
            percent
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default PersonnelStatistics;
