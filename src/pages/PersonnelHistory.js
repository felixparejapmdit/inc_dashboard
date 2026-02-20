import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Heading,
    Text,
    Badge,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    useColorModeValue,
    VStack,
    HStack,
    SimpleGrid,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Divider,
    Container,
    Stat,
    StatLabel,
    StatNumber,
    Spinner,
    Center,
    Tooltip,
    IconButton,
    Tag,
    TagLabel,
    TagLeftIcon,
    Portal
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    History,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    TrendingDown,
    Activity,
    UserCheck,
    UserMinus,
    RotateCcw,
    ShieldCheck
} from "lucide-react";
import moment from "moment";
import { fetchData } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

const API_URL = process.env.REACT_APP_API_URL || "";
const MotionBox = motion.create(Box);

const PersonnelHistory = () => {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);

    // Colors
    const bg = useColorModeValue("gray.50", "#0f172a");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headerGradient = useColorModeValue(
        "linear(to-r, blue.600, blue.600)",
        "linear(to-r, blue.400, blue.400)"
    );

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            await fetchData(
                "personnels/history",
                (data) => {
                    const filtered = filterPersonnelData(data);
                    setHistory(filtered);
                },
                null,
                "Failed to load personnel history."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // Group history by personnel
    const groupedPersonnel = useMemo(() => {
        const grouped = history.reduce((acc, item) => {
            if (!acc[item.personnel_id]) {
                acc[item.personnel_id] = {
                    id: item.personnel_id,
                    fullname: item.fullname,
                    currentStatus: item.action,
                    lastUpdated: item.timestamp,
                    events: [],
                };
            }

            acc[item.personnel_id].events.push(item);

            if (new Date(item.timestamp) > new Date(acc[item.personnel_id].lastUpdated)) {
                acc[item.personnel_id].lastUpdated = item.timestamp;
                acc[item.personnel_id].currentStatus = item.action;
            }

            return acc;
        }, {});

        Object.values(grouped).forEach(p => {
            p.events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });

        return Object.values(grouped).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }, [history]);

    const stats = useMemo(() => {
        const restoredCount = history.filter(h => h.action === "In").length;
        const deletedCount = history.filter(h => h.action === "Out").length;
        return {
            totalLogs: history.length,
            activeUsers: groupedPersonnel.filter(p => p.currentStatus === "In").length,
            removedUsers: groupedPersonnel.filter(p => p.currentStatus === "Out").length,
            latestAction: history[0]?.timestamp
        };
    }, [history, groupedPersonnel]);

    const filteredPersonnel = groupedPersonnel.filter((person) => {
        const term = search.toLowerCase();
        return (
            person.fullname.toLowerCase().includes(term) ||
            person.events.some(e => e.reason && e.reason.toLowerCase().includes(term))
        );
    });

    const handleCardClick = (person) => {
        setSelectedPersonnel(person);
        onOpen();
    };

    return (
        <Box bg={bg} minH="100vh">
            <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
                {/* Header Section */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    mb={8}
                    gap={4}
                >
                    <VStack align="start" spacing={1}>
                        <HStack>
                            <Icon as={History} boxSize={8} color="blue.500" />
                            <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                                Personnel Lifecycle
                            </Heading>
                        </HStack>
                        <Text color="gray.500" fontWeight="medium">Audit trail for personnel status, restorations, and removals</Text>
                    </VStack>

                    <HStack spacing={3}>
                        <Tooltip label="Refresh Audit Trail" hasArrow>
                            <IconButton
                                icon={<RotateCcw size={20} />}
                                onClick={loadHistory}
                                isLoading={isLoading}
                                variant="outline"
                                size="lg"
                                borderRadius="xl"
                                aria-label="Refresh Data"
                            />
                        </Tooltip>
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none">
                                <Search size={18} color="gray" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search name, action, or reason..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                borderRadius="xl"
                                bg={cardBg}
                                size="lg"
                                focusBorderColor="blue.400"
                            />
                        </InputGroup>
                    </HStack>
                </Flex>

                {/* Stats Grid */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
                    {[
                        { label: "Total Audit Logs", value: stats.totalLogs, icon: Activity, color: "blue" },
                        { label: "Currently Active", value: stats.activeUsers, icon: UserCheck, color: "green" },
                        { label: "Currently Removed", value: stats.removedUsers, icon: UserMinus, color: "red" },
                        { label: "Data Integrity", value: "Checked", icon: ShieldCheck, color: "purple" }
                    ].map(stat => (
                        <MotionBox
                            key={stat.label}
                            whileHover={{ y: -4 }}
                            bg={cardBg}
                            p={5}
                            borderRadius="2xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <HStack justify="space-between">
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
                        </MotionBox>
                    ))}
                </SimpleGrid>

                {/* Content Section */}
                {isLoading ? (
                    <Center p={20} flexDir="column">
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text mt={4} fontWeight="bold" color="gray.500">Decrypting audit logs...</Text>
                    </Center>
                ) : filteredPersonnel.length === 0 ? (
                    <Center p={20} flexDir="column" bg={cardBg} borderRadius="3xl" border="2px dashed" borderColor={borderColor}>
                        <Icon as={AlertCircle} boxSize={12} color="gray.300" />
                        <Heading size="md" mt={4} color="gray.500">No matching logs</Heading>
                        <Text color="gray.400">Try refining your search parameters</Text>
                    </Center>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                        <AnimatePresence>
                            {filteredPersonnel.map((person) => (
                                <MotionBox
                                    key={person.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -6, boxShadow: "xl" }}
                                    bg={cardBg}
                                    p={6}
                                    borderRadius="2xl"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    cursor="pointer"
                                    onClick={() => handleCardClick(person)}
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <Flex align="center" gap={4} mb={4}>
                                        <Avatar
                                            size="lg"
                                            name={person.fullname}
                                            src={`${API_URL}/api/personnel_images/2x2/${person.id}`}
                                            boxShadow="lg"
                                        />
                                        <Box zIndex={1}>
                                            <Text fontWeight="black" fontSize="lg" noOfLines={1} color="gray.800">
                                                {person.fullname}
                                            </Text>
                                            <Badge
                                                colorScheme={person.currentStatus === "In" ? "green" : "red"}
                                                variant="subtle"
                                                px={3}
                                                borderRadius="full"
                                                fontSize="xs"
                                                fontWeight="black"
                                            >
                                                {person.currentStatus === "In" ? "REINSTATED" : "DEACTIVATED"}
                                            </Badge>
                                        </Box>
                                    </Flex>

                                    <Divider mb={4} />

                                    <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                            <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase">Final Action</Text>
                                            <Tag variant="ghost" size="sm" colorScheme="blue">
                                                <TagLeftIcon as={ArrowUpRight} />
                                                <TagLabel fontWeight="bold">{person.events.length} Logs</TagLabel>
                                            </Tag>
                                        </HStack>

                                        <Flex align="center" gap={2}>
                                            <Icon as={Calendar} size={14} color="gray.400" />
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                {moment(person.lastUpdated).format("MMM DD, YYYY")}
                                            </Text>
                                        </Flex>
                                        <Flex align="center" gap={2}>
                                            <Icon as={Clock} size={14} color="gray.400" />
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                {moment(person.lastUpdated).format("h:mm A")}
                                            </Text>
                                        </Flex>
                                    </VStack>

                                    {/* Gradient Decoration */}
                                    <Box
                                        position="absolute"
                                        top={0} right={0}
                                        w="40px" h="40px"
                                        bgGradient={`linear(to-bl, ${person.currentStatus === "In" ? "green.100" : "red.100"}, transparent)`}
                                    />
                                </MotionBox>
                            ))}
                        </AnimatePresence>
                    </SimpleGrid>
                )}
            </Container>

            {/* History Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
                <ModalContent borderRadius="3xl" shadow="2xl" border="1px solid" borderColor={borderColor}>
                    <ModalHeader p={6} borderBottom="1px solid" borderColor={borderColor}>
                        <Flex align="center" gap={6}>
                            <Avatar size="xl" name={selectedPersonnel?.fullname} src={`${API_URL}/api/personnel_images/2x2/${selectedPersonnel?.id}`} boxShadow="xl" />
                            <Box>
                                <Heading size="lg" color="gray.800" fontWeight="black">{selectedPersonnel?.fullname}</Heading>
                                <HStack mt={1} spacing={2}>
                                    <Badge colorScheme="blue" variant="solid" borderRadius="lg" px={3}>ID: {selectedPersonnel?.id}</Badge>
                                    <Text fontSize="sm" color="gray.500" fontWeight="bold">Historical Audit Log</Text>
                                </HStack>
                            </Box>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton m={4} />
                    <ModalBody p={0} bg="gray.100/50">
                        <VStack align="stretch" spacing={4} p={6}>
                            {selectedPersonnel?.events.map((event, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    p={6}
                                    bg="white"
                                    borderRadius="2xl"
                                    shadow="sm"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    position="relative"
                                >
                                    <Flex gap={4}>
                                        <Box minW="100px" textAlign="right" borderRight="2px solid" borderColor="gray.100" pr={4}>
                                            <Text fontWeight="black" fontSize="sm" color="gray.800">
                                                {moment(event.timestamp).format("MMM DD")}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                                {moment(event.timestamp).format("h:mm A")}
                                            </Text>
                                            <Text fontSize="10px" color="gray.400" mt={1}>
                                                {moment(event.timestamp).format("YYYY")}
                                            </Text>
                                        </Box>

                                        <Box flex={1}>
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <HStack>
                                                    <Icon as={event.action === "In" ? CheckCircle2 : XCircle} boxSize={5} color={event.action === "In" ? "green.500" : "red.500"} />
                                                    <Badge colorScheme={event.action === "In" ? "green" : "red"} variant="subtle" px={3} borderRadius="lg" fontWeight="black">
                                                        {event.action === "In" ? "REINSTATEMENT" : "DEACTIVATION"}
                                                    </Badge>
                                                </HStack>
                                                <Text fontSize="xs" fontWeight="black" color="gray.400">VIA: {event.performed_by?.toUpperCase() || "SYSTEM"}</Text>
                                            </Flex>

                                            <Box bg="gray.50" p={4} borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                                <Text color="gray.700" fontSize="sm" lineHeight="tall" fontWeight="semibold">
                                                    {event.reason || "Administrative action performed with no descriptive reason provided."}
                                                </Text>
                                            </Box>
                                        </Box>
                                    </Flex>
                                </MotionBox>
                            ))}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PersonnelHistory;
