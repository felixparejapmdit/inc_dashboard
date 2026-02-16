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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Badge,
  VStack,
  HStack,
  Divider,
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  List,
  ListItem,
  Avatar,
  Portal,
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
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";
import { FaFemale } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const gradientMap = {
  All: "linear(to-br, teal.400, blue.600)",
  Minister: "linear(to-br, green.400, green.700)",
  Regular: "linear(to-br, blue.400, blue.700)",
  "Minister's Wife": "linear(to-br, pink.400, pink.700)",
  "Ministerial Student": "linear(to-br, orange.400, red.600)",
  "Lay Member": "linear(to-br, cyan.400, teal.700)",
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
  const [trackingDetails, setTrackingDetails] = useState({}); // Store arrays of personnel for tracking
  const [personnelByType, setPersonnelByType] = useState({
    All: [],
    Minister: [],
    Regular: [],
    "Minister's Wife": [],
    "Ministerial Student": [],
    "Lay Member": [],
  });
  const [totalProgress, setTotalProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Responsive values
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  const iconSize = useBreakpointValue({ base: 10, md: 14 });
  const headingSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });

  // Color mode values - must be at component level
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardHoverBg = useColorModeValue("gray.50", "gray.700");
  const cardBorderColor = useColorModeValue("gray.100", "gray.700");
  const bgColor = useColorModeValue("gray.50", "gray.900");

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
    "Completed",
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
    "Completed": FiUserCheck,
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
    "Completed": "/progresstracking",
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.error("No auth token found. User may not be logged in.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    // Fetch personnels
    fetch(`${API_URL}/api/personnels/active`, { headers })
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
        const byType = {
          All: data,
          Minister: [],
          Regular: [],
          "Minister's Wife": [],
          "Ministerial Student": [],
          "Lay Member": [],
        };

        data.forEach((p) => {
          if (count[p.personnel_type] !== undefined) {
            count[p.personnel_type]++;
            byType[p.personnel_type].push(p);
          }
        });
        setStats(count);
        setPersonnelByType(byType);
      })
      .catch((err) => console.error("Error fetching personnels:", err))
      .finally(() => setLoading(false));

    // Fetch progress tracking per step
    const fetchBreakdown = Promise.all(
      trackingSteps.map((_, i) =>
        fetch(`${API_URL}/api/personnels/progress/${i}`, { headers })
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch progress for step ${i}`);
            return res.json();
          })
      )
    );

    // Fetch total "new" personnel which represents the true "In Progress" list
    const fetchTotalNew = fetch(`${API_URL}/api/personnels/new`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch new personnels");
        return res.json();
      });

    Promise.all([fetchBreakdown, fetchTotalNew])
      .then(([breakdownResponses, totalNewData]) => {
        const result = {};
        const details = {};
        // Map breakdown steps
        breakdownResponses.forEach((data, i) => {
          const stepName = trackingSteps[i];
          result[stepName] = data.length;
          details[stepName] = data;
        });

        setTrackingStats(result);
        setTrackingDetails(details);
        // Use the total from the 'new' endpoint to match ProgressTracking page exactly
        setTotalProgress(totalNewData.length);
      })
      .catch((err) => console.error("Error fetching tracking stats:", err));
  }, []);

  // Navigate to Users page with filter
  const handlePersonnelClick = (personnelType) => {
    // Navigate to Users.js and pass the filter as state
    navigate("/user", { state: { filterType: personnelType } });
  };

  const handleProgressClick = (route) => {
    navigate(route);
  };



  const PersonnelListPopover = ({ items, label, children }) => {
    if (!items || items.length === 0) {
      return children; // No popover if empty
    }

    return (
      <Popover trigger="hover" placement="top" isLazy>
        <PopoverTrigger>
          <Box display="inline-block">{children}</Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent w="300px" boxShadow="xl" _focus={{ outline: "none" }}>
            <PopoverArrow />
            <PopoverBody maxH="300px" overflowY="auto" p={0}>
              <Box p={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">{label} ({items.length})</Text>
              </Box>
              <List spacing={0}>
                {items.map((p, idx) => {
                  // Try to resolve avatar URL. Assuming p has personnel_id or image path.
                  // If p.image is relative path like "uploads/avatar/..."
                  // p.image or p.avatar_url? Need to check structure.
                  // User mentions "uploads/avatar".
                  // Most likely: `${API_URL}/${p.image}` or `${API_URL}/uploads/avatar/${p.image}`
                  // I will check if p.image starts with 'http' or '/'.

                  const rawImage = p.image || (p.images && p.images.length > 0 ? p.images[0].image_url : null);
                  const avatarSrc = rawImage
                    ? (rawImage.startsWith('http') ? rawImage : `${API_URL}/${rawImage.startsWith('/') ? rawImage.slice(1) : rawImage}`)
                    : null;

                  // Fallback name construction using fields from Personnel model
                  const name = p.fullname || `${p.givenname || ""} ${p.surname_husband || ""}`.trim() || "Unknown";

                  return (
                    <ListItem key={p.personnel_id || idx} p={2} _hover={{ bg: "gray.50" }}>
                      <HStack>
                        <Avatar size="sm" src={avatarSrc} name={name} />
                        <Text fontSize="sm" noOfLines={1}>{name}</Text>
                      </HStack>
                    </ListItem>
                  );
                })}
              </List>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    );
  };

  const renderPersonnelCard = (label, value, icon, gradient, onClick, progressPercent) => {
    const listItems = personnelByType[label] || [];

    return (
      <Tooltip
        label={`Click to view ${label === "All" ? "all personnel" : label + " personnel"}`}
        hasArrow
        placement="top"
      >
        <Box
          key={label}
          bg={cardBgColor}
          borderRadius="xl"
          p={cardPadding}
          boxShadow="lg"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "2xl",
            bg: cardHoverBg,
          }}
          onClick={onClick}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor={cardBorderColor}
        >
          {/* Background Gradient Overlay */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            h="4px"
            bgGradient={gradient}
          />

          <Flex justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                <Icon as={icon} boxSize={5} color="teal.500" />
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {label === "All" ? "Total Personnel" : label}
                </Text>
              </HStack>

              <PersonnelListPopover items={listItems} label={label}>
                <Text
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="black"
                  color="gray.800"
                  lineHeight="1"
                  _hover={{ color: "teal.600" }} // Indicate interactivity
                >
                  {value}
                </Text>
              </PersonnelListPopover>

              <HStack spacing={2} mt={2}>
                <Badge colorScheme="teal" fontSize="xs" borderRadius="full" px={2}>
                  {progressPercent.toFixed(1)}%
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  of total
                </Text>
              </HStack>
            </VStack>

            {/* Icon Background */}
            <Icon
              as={icon}
              boxSize={iconSize}
              opacity={0.1}
              color="teal.500"
            />
          </Flex>

          {/* Progress Bar */}
          <Box mt={4}>
            <Progress
              value={progressPercent}
              size="sm"
              colorScheme="teal"
              borderRadius="full"
              hasStripe
              isAnimated
            />
          </Box>

          {/* Click Indicator */}
          <Flex justify="flex-end" mt={3}>
            <HStack spacing={1} color="teal.500" fontSize="xs">
              <Text fontWeight="medium">View Details</Text>
              <Icon as={FiArrowRight} boxSize={3} />
            </HStack>
          </Flex>
        </Box>
      </Tooltip>
    );
  };

  const renderTrackingCard = (label, value, icon, gradient, onClick, progressPercent) => {
    const listItems = trackingDetails[label] || [];

    return (
      <Tooltip label={`Navigate to ${label}`} hasArrow placement="top">
        <Box
          key={label}
          bg={cardBgColor}
          borderRadius="xl"
          p={cardPadding}
          boxShadow="md"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "xl",
            bg: cardHoverBg,
          }}
          onClick={onClick}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor={cardBorderColor}
        >
          {/* Top Gradient Bar */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            h="3px"
            bgGradient={gradient}
          />

          <Flex direction="column" h="100%">
            <HStack spacing={3} mb={3}>
              <Box
                p={2}
                borderRadius="lg"
                bgGradient={gradient}
              >
                <Icon as={icon} boxSize={5} color="white" />
              </Box>
              <VStack align="start" spacing={0} flex="1">
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="semibold"
                  color="gray.600"
                  noOfLines={1}
                >
                  {label}
                </Text>

                <PersonnelListPopover items={listItems} label={label}>
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="black"
                    color="gray.800"
                    lineHeight="1"
                    _hover={{ color: "purple.600" }}
                  >
                    {value}
                  </Text>
                </PersonnelListPopover>
              </VStack>
            </HStack>

            <Box mt="auto">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xs" color="gray.500">Progress</Text>
                <Badge colorScheme="purple" fontSize="xs" borderRadius="full">
                  {progressPercent.toFixed(0)}%
                </Badge>
              </Flex>
              <Progress
                value={progressPercent}
                size="sm"
                colorScheme="purple"
                borderRadius="full"
                hasStripe
              />
            </Box>
          </Flex>
        </Box>
      </Tooltip>
    );
  };


  const totalPersonnel = stats.All || 1;

  if (loading) {
    return (
      <Box maxW="100%" mx="auto" py={8} px={{ base: 2, md: 4 }}>
        <Flex justify="center" align="center" minH="50vh">
          <VStack spacing={4}>
            <Icon as={FiLoader} boxSize={12} color="teal.500" className="spin" />
            <Text color="gray.500">Loading statistics...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 2, md: 4 }} overflow="hidden" w="100%">
      <Box maxW="1400px" mx="auto" w="100%">
        {/* Header Section */}
        <VStack spacing={2} mb={8} textAlign="center" px={{ base: 0, md: 0 }} w="100%">
          <HStack spacing={3}>
            <Icon as={FiTrendingUp} boxSize={8} color="teal.500" />
            <Heading size={headingSize} color="gray.800">
              Personnel Statistics
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            Click on any card to view detailed personnel information
          </Text>
        </VStack>

        {/* Personnel Type Statistics */}
        <Box mb={10} px={{ base: 0, md: 0 }} w="100%">
          <HStack spacing={2} mb={4}>
            <Icon as={FiUsers} color="teal.500" />
            <Heading size={{ base: "sm", md: "md" }} color="gray.700">
              Personnel by Type
            </Heading>
          </HStack>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 3 }}
            spacing={{ base: 4, md: 6 }}
            w="100%"
          >
            {Object.entries(stats).map(([label, value]) => {
              const percent = (value / totalPersonnel) * 100;
              return (
                <React.Fragment key={label}>
                  {renderPersonnelCard(
                    label,
                    value,
                    typeIcons[label],
                    gradientMap[label],
                    () => handlePersonnelClick(label === "All" ? null : label),
                    percent
                  )}
                </React.Fragment>
              );
            })}
          </SimpleGrid>
        </Box>

        <Divider my={8} />

        {/* Personnel Tracking */}
        <Box px={{ base: 0, md: 0 }} w="100%">
          <HStack spacing={2} mb={4}>
            <Icon as={FiLoader} color="purple.500" />
            <Heading size={{ base: "sm", md: "md" }} color="gray.700">
              Enrollment Progress Tracking
            </Heading>
          </HStack>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} mb={6}>
            Monitor personnel enrollment progress across different stages
          </Text>

          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={{ base: 4, md: 6 }}
            w="100%"
          >
            {renderTrackingCard(
              "Total On Progress",
              totalProgress,
              FiLoader,
              "linear(to-br, purple.400, purple.700)",
              () => handleProgressClick("/progresstracking"),
              100
            )}

            {Object.entries(trackingStats).map(([label, value]) => {
              const percent = totalProgress > 0 ? (value / totalProgress) * 100 : 0;
              return (
                <React.Fragment key={label}>
                  {renderTrackingCard(
                    label,
                    value,
                    trackingIcons[label],
                    "linear(to-br, blue.400, blue.700)",
                    () => handleProgressClick(trackingRoutes[label]),
                    percent
                  )}
                </React.Fragment>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Summary Footer */}
        <Box
          mt={10}
          p={6}
          bg={cardBgColor}
          borderRadius="xl"
          boxShadow="md"
          mx={{ base: 0, md: 0 }}
          w="100%"
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Stat>
              <StatLabel color="gray.600">Total Personnel</StatLabel>
              <StatNumber color="teal.600">{stats.All}</StatNumber>
              <StatHelpText>Active in system</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">In Progress</StatLabel>
              <StatNumber color="purple.600">{totalProgress}</StatNumber>
              <StatHelpText>Enrollment tracking</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Completion Rate</StatLabel>
              <StatNumber color="green.600">
                {totalProgress > 0 ? ((totalProgress / stats.All) * 100).toFixed(1) : 0}%
              </StatNumber>
              <StatHelpText>Overall progress</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Add spinning animation for loader */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 2s linear infinite;
          }
        `}
      </style>
    </Box>
  );
};

export default PersonnelStatistics;
