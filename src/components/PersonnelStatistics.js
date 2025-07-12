import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Icon,
  Heading,
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
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.100", "gray.600");
  const cardTextColor = useColorModeValue("gray.700", "white");

  const typeIcons = {
    All: FiUsers,
    Minister: FiUserCheck,
    Regular: FiUser,
    "Minister's Wife": FaFemale,
    "Ministerial Student": FiUserX,
    "Lay Member": FiUserPlus,
  };

  const typeColors = {
    All: "gray.500",
    Minister: "green.500",
    Regular: "blue.500",
    "Minister's Wife": "pink.500",
    "Ministerial Student": "orange.500",
    "Lay Member": "teal.500",
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
    // Fetch Personnel Type statistics
    fetch(`${API_URL}/api/personnels`)
      .then((res) => res.json())
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
      });

    // Fetch Tracking Stats for each step
    Promise.all(
      trackingSteps.map((_, i) =>
        fetch(`${API_URL}/api/personnels/progress/${i}`).then((res) =>
          res.json()
        )
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

  return (
    <Box p={8}>
      <Heading size="lg" mb={6} color={cardTextColor} textAlign="center">
        Personnel Statistics
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing={6} mb={10}>
        {Object.entries(stats).map(([label, value]) => (
          <Box
            key={label}
            bg={cardBg}
            p={6}
            borderRadius="lg"
            boxShadow="md"
            borderLeft="6px solid"
            borderColor={typeColors[label]}
            transition="background-color 0.3s ease"
            _hover={{ bg: cardHoverBg }}
          >
            <VStack spacing={2} textAlign="center">
              <Icon as={typeIcons[label]} w={8} h={8} color={typeColors[label]} />
              <Text fontSize="md" fontWeight="medium" color={cardTextColor}>
                {label === "All" ? "Total Personnel" : label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color={typeColors[label]}>
                {value}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Heading size="lg" mb={6} color={cardTextColor} textAlign="center">
        Personnel Tracking
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {/* ✅ Total On Progress Box */}
  <Box
  bg={cardBg}
  p={6}
  borderRadius="lg"
  boxShadow="md"
  borderLeft="6px solid"
  borderColor="purple.400"
  transition="background-color 0.3s ease"
  _hover={{ bg: cardHoverBg, cursor: "pointer" }}
  onClick={() => navigate("/progresstracking")}
>
  <VStack spacing={2} textAlign="center">
    <Icon as={FiLoader} w={8} h={8} color="purple.400" />
    <Text fontSize="md" fontWeight="medium" color={cardTextColor}>
      Total On Progress
    </Text>
    <Text fontSize="2xl" fontWeight="bold" color="purple.400">
      {totalProgress}
    </Text>
  </VStack>
</Box>


        {/* ✅ Individual Steps */}
        {Object.entries(trackingStats).map(([label, value]) => (
          <Box
            key={label}
            bg={cardBg}
            p={6}
            borderRadius="lg"
            boxShadow="md"
            borderLeft="6px solid"
            borderColor="blue.400"
            transition="background-color 0.3s ease"
            _hover={{ bg: cardHoverBg, cursor: "pointer" }}
            onClick={() => navigate(trackingRoutes[label])}
          >
            <VStack spacing={2} textAlign="center">
              <Icon as={trackingIcons[label]} w={8} h={8} color="blue.400" />
              <Text fontSize="md" fontWeight="medium" color={cardTextColor}>
                {label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                {value}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default PersonnelStatistics;
